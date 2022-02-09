mod trezor;
mod ledger;
mod common;
mod commands;
use std::error::Error;
use std::str::FromStr;
// use structopt::StructOpt;
use std::io::Result as IoResult;
use std::net::{SocketAddr, ToSocketAddrs};
use std::fmt;
use std::fmt::Display;
use console::style;
use lib::api::GetVersionInfo;
use lib::http_api::HttpApi;
use common::exit_with_error;
use commands::Command;
use std::time::Duration;
use url::Url;
use std::sync::Mutex;
use std::sync::Arc;
use std::collections::{HashMap, VecDeque};
use serde::{Serialize, Deserialize};
use std::time;
use std::io::{self, copy, empty, Cursor, Read, Write};

#[derive(Debug)]
pub(crate) enum BodySize {
    Empty,
    Unknown,
    Known(u64),
}

pub(crate) struct SizedReader<'a> {
    pub size: BodySize,
    pub reader: Box<dyn Read + 'a>,
}

impl fmt::Debug for SizedReader<'_> {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "SizedReader[size={:?},reader]", self.size)
    }
}

impl<'a> SizedReader<'a> {
    fn new(size: BodySize, reader: Box<dyn Read + 'a>) -> Self {
        SizedReader { size, reader }
    }
}

#[derive(Clone)]
pub(crate) struct Unit {
    pub agent: Agent,
    pub method: String,
    pub url: Url,
    is_chunked: bool,
    headers: Vec<Header>,
    pub deadline: Option<time::Instant>,
}

impl Header {
    pub fn new(name: &str, value: &str) -> Self {
        let line = format!("{}: {}", name, value).into();
        let index = name.len();
        Header { line, index }
    }

    pub fn name(&self) -> &str {
        let bytes = &self.line.as_bytes()[0..self.index];
        from_utf8(bytes).expect("Legal chars in header name")
    }

    pub fn value(&self) -> Option<&str> {
        let bytes = &self.line.as_bytes()[self.index + 1..];
        from_utf8(bytes)
            .map(|s| s.trim())
            .ok()
            .filter(|s| s.as_bytes().iter().all(is_field_vchar_or_obs_fold))
    }

    pub fn value_raw(&self) -> &[u8] {
        let mut bytes = &self.line.as_bytes()[self.index + 1..];

        if !bytes.is_empty() {
            while !bytes.is_empty() && bytes[0].is_ascii_whitespace() {
                bytes = &bytes[1..];
            }
            while !bytes.is_empty() && bytes[bytes.len() - 1].is_ascii_whitespace() {
                bytes = &bytes[..(bytes.len() - 1)];
            }
        }
        bytes
    }

    /// Compares the given str to the header name ignoring case.
    pub fn is_name(&self, other: &str) -> bool {
        self.name().eq_ignore_ascii_case(other)
    }

    pub(crate) fn validate(&self) -> Result<(), Error> {
        let bytes = self.line.as_bytes();
        let name_raw = &bytes[0..self.index];
        let value_raw = &bytes[self.index + 1..];

        if !valid_name(name_raw) || !valid_value(value_raw) {
            Err(ErrorKind::BadHeader.msg(&format!("invalid header '{}'", self.line)))
        } else {
            Ok(())
        }
    }
}

pub fn get_header<'a, 'b>(headers: &'b [Header], name: &'a str) -> Option<&'b str> {
    headers
        .iter()
        .find(|h| h.is_name(name))
        .and_then(|h| h.value())
}

impl Unit {
    //

    pub(crate) fn new(
        agent: &Agent,
        method: &str,
        url: &Url,
        headers: &[Header],
        body: &SizedReader,
        deadline: Option<time::Instant>,
    ) -> Self {
        //

        let (is_transfer_encoding_set, mut is_chunked) = get_header(&headers, "transfer-encoding")
            // if the user has set an encoding header, obey that.
            .map(|enc| {
                let is_transfer_encoding_set = !enc.is_empty();
                let last_encoding = enc.split(',').last();
                let is_chunked = last_encoding
                    .map(|last_enc| last_enc.trim() == "chunked")
                    .unwrap_or(false);
                (is_transfer_encoding_set, is_chunked)
            })
            // otherwise, no chunking.
            .unwrap_or((false, false));

        let extra_headers = {
            let mut extra = vec![];

            // chunking and Content-Length headers are mutually exclusive
            // also don't write this if the user has set it themselves
            if !is_chunked && get_header(&headers, "content-length").is_none() {
                // if the payload is of known size (everything beside an unsized reader), set
                // Content-Length,
                // otherwise, use the chunked Transfer-Encoding (only if no other Transfer-Encoding
                // has been set
                match body.size {
                    BodySize::Known(size) => {
                        extra.push(Header::new("Content-Length", &format!("{}", size)))
                    }
                    BodySize::Unknown => {
                        if !is_transfer_encoding_set {
                            extra.push(Header::new("Transfer-Encoding", "chunked"));
                            is_chunked = true;
                        }
                    }
                    BodySize::Empty => {}
                }
            }

            let username = url.username();
            let password = url.password().unwrap_or("");
            if (!username.is_empty() || !password.is_empty())
                && get_header(&headers, "authorization").is_none()
            {
                let encoded = base64::encode(&format!("{}:{}", username, password));
                extra.push(Header::new("Authorization", &format!("Basic {}", encoded)));
            }

            #[cfg(feature = "cookies")]
            extra.extend(extract_cookies(agent, &url).into_iter());

            extra
        };

        let headers: Vec<_> = headers
            .iter()
            .chain(extra_headers.iter())
            .cloned()
            .collect();

        Unit {
            agent: agent.clone(),
            method: method.to_string(),
            url: url.clone(),
            is_chunked,
            headers,
            deadline,
        }
    }

    pub fn is_head(&self) -> bool {
        self.method.eq_ignore_ascii_case("head")
    }

    pub fn resolver(&self) -> ArcResolver {
        self.agent.state.resolver.clone()
    }

    #[cfg(test)]
    pub fn header(&self, name: &str) -> Option<&str> {
        header::get_header(&self.headers, name)
    }
    #[cfg(test)]
    pub fn has(&self, name: &str) -> bool {
        header::has_header(&self.headers, name)
    }
    #[cfg(test)]
    pub fn all(&self, name: &str) -> Vec<&str> {
        header::get_all_headers(&self.headers, name)
    }

    // Returns true if this request, with the provided body, is retryable.
    pub(crate) fn is_retryable(&self, body: &SizedReader) -> bool {
        // Per https://tools.ietf.org/html/rfc7231#section-8.1.3
        // these methods are idempotent.
        let idempotent = match self.method.as_str() {
            "DELETE" | "GET" | "HEAD" | "OPTIONS" | "PUT" | "TRACE" => true,
            _ => false,
        };
        // Unsized bodies aren't retryable because we can't rewind the reader.
        // Sized bodies are retryable only if they are zero-length because of
        // coincidences of the current implementation - the function responsible
        // for retries doesn't have a way to replay a Payload.
        let retryable_body = match body.size {
            BodySize::Unknown => false,
            BodySize::Known(0) => true,
            BodySize::Known(_) => false,
            BodySize::Empty => true,
        };

        idempotent && retryable_body
    }
}

#[derive(Clone, PartialEq)]
pub struct Header {
    line: HeaderLine,
    index: usize
}

impl fmt::Display for HeaderLine {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", String::from_utf8_lossy(&self.0))
    }
}

impl fmt::Debug for Header {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", self.line)
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct HeaderLine(Vec<u8>);

pub struct Response {
    url: Option<Url>,
    status_line: String,
    index: ResponseStatusIndex,
    status: u16,
    headers: Vec<Header>,
    unit: Option<Box<Unit>>,
    stream: Box<Stream>,
    pub(crate) history: Vec<String>,
}

#[derive(Debug, Clone, Copy, Eq, PartialEq)]
struct ResponseStatusIndex {
    http_version: usize,
    response_code: usize,
}

#[derive(Debug)]
pub enum Error {
    Status(u16, Response),
    Transport(Transport),
}

#[derive(Clone, Copy, Debug, Eq, Hash, PartialEq)]
pub enum Proto {
    HTTPConnect,
    SOCKS5,
}

#[derive(Clone, Debug, Eq, Hash, PartialEq)]
pub struct Proxy {
    pub(crate) server: String,
    pub(crate) port: u32,
    pub(crate) user: Option<String>,
    pub(crate) password: Option<String>,
    pub(crate) proto: Proto,
}

impl Proxy {
    fn parse_creds<S: AsRef<str>>(
        creds: &Option<S>,
    ) -> Result<(Option<String>, Option<String>), Error> {
        match creds {
            Some(creds) => {
                let mut parts = creds
                    .as_ref()
                    .splitn(2, ':')
                    .collect::<Vec<&str>>()
                    .into_iter();

                if parts.len() != 2 {
                    Err(ErrorKind::InvalidProxyUrl.new())
                } else {
                    Ok((
                        parts.next().map(String::from),
                        parts.next().map(String::from),
                    ))
                }
            }
            None => Ok((None, None)),
        }
    }

    fn parse_address<S: AsRef<str>>(host: &Option<S>) -> Result<(String, Option<u32>), Error> {
        match host {
            Some(host) => {
                let mut parts = host.as_ref().split(':').collect::<Vec<&str>>().into_iter();
                let host = parts
                    .next()
                    .ok_or_else(|| ErrorKind::InvalidProxyUrl.new())?;
                let port = parts.next();
                Ok((
                    String::from(host),
                    port.and_then(|port| port.parse::<u32>().ok()),
                ))
            }
            None => Err(ErrorKind::InvalidProxyUrl.new()),
        }
    }

    pub(crate) fn use_authorization(&self) -> bool {
        self.user.is_some() && self.password.is_some()
    }

    pub fn new<S: AsRef<str>>(proxy: S) -> Result<Self, Error> {
        let mut proxy_parts = proxy
            .as_ref()
            .splitn(2, "://")
            .collect::<Vec<&str>>()
            .into_iter();

        let proto = if proxy_parts.len() == 2 {
            match proxy_parts.next() {
                Some("http") => Proto::HTTPConnect,
                Some("socks") => Proto::SOCKS5,
                Some("socks5") => Proto::SOCKS5,
                _ => return Err(ErrorKind::InvalidProxyUrl.new()),
            }
        } else {
            Proto::HTTPConnect
        };

        let remaining_parts = proxy_parts.next();
        if remaining_parts == None {
            return Err(ErrorKind::InvalidProxyUrl.new());
        }

        let mut creds_server_port_parts = remaining_parts
            .unwrap()
            .rsplitn(2, '@')
            .collect::<Vec<&str>>()
            .into_iter()
            .rev();

        let (user, password) = if creds_server_port_parts.len() == 2 {
            Proxy::parse_creds(&creds_server_port_parts.next())?
        } else {
            (None, None)
        };

        let (server, port) = Proxy::parse_address(&creds_server_port_parts.next())?;

        Ok(Self {
            server,
            user,
            password,
            port: port.unwrap_or(8080),
            proto,
        })
    }

    pub(crate) fn connect<S: AsRef<str>>(&self, host: S, port: u16) -> String {
        let authorization = if self.use_authorization() {
            let creds = base64::encode(&format!(
                "{}:{}",
                self.user.clone().unwrap_or_default(),
                self.password.clone().unwrap_or_default()
            ));

            match self.proto {
                Proto::HTTPConnect => format!("Proxy-Authorization: basic {}\r\n", creds),
                Proto::SOCKS5 => String::new(),
            }
        } else {
            String::new()
        };

        format!(
            "CONNECT {}:{} HTTP/1.1\r\n\
            Host: {}:{}\r\n\
            User-Agent: something/1.0.0\r\n\
            Proxy-Connection: Keep-Alive\r\n\
            {}\
            \r\n",
            host.as_ref(),
            port,
            host.as_ref(),
            port,
            authorization
        )
    }

    fn verify_response(response: &[u8]) -> Result<(), Error> {
        let response_string = String::from_utf8_lossy(response);
        let top_line = response_string
            .lines()
            .next()
            .ok_or_else(|| ErrorKind::ProxyConnect.new())?;
        let status_code = top_line
            .split_whitespace()
            .nth(1)
            .ok_or_else(|| ErrorKind::ProxyConnect.new())?;

        match status_code {
            "200" => Ok(()),
            "401" | "407" => Err(ErrorKind::ProxyUnauthorized.new()),
            _ => Err(ErrorKind::ProxyConnect.new()),
        }
    }
}

#[derive(PartialEq, Clone, Eq, Hash)]
struct PoolKey {
    scheme: String,
    hostname: String,
    port: Option<u16>,
    proxy: Option<Proxy>,
}

impl fmt::Debug for PoolKey {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_fmt(format_args!(
            "{}|{}|{}",
            self.scheme,
            self.hostname,
            self.port.unwrap_or(0)
        ))
    }
}

impl PoolKey {
    fn new(url: &Url, proxy: Option<Proxy>) -> Self {
        let port = url.port_or_known_default();
        PoolKey {
            scheme: url.scheme().to_string(),
            hostname: url.host_str().unwrap_or("").to_string(),
            port,
            proxy,
        }
    }
}

struct ConnectionPool {
    inner: Mutex<Inner>,
    max_idle_connections: usize,
    max_idle_connections_per_host: usize,
}

struct Inner {
    recycle: HashMap<PoolKey, VecDeque<Stream>>,
    lru: VecDeque<PoolKey>,
}

trait Resolver: Send + Sync {
    fn resolve(&self, netloc: &str) -> IoResult<Vec<SocketAddr>>;
}

#[derive(Debug)]
struct StdResolver;

impl Resolver for StdResolver {
    fn resolve(&self, netloc: &str) -> IoResult<Vec<SocketAddr>> {
        ToSocketAddrs::to_socket_addrs(netloc).map(|iter| iter.collect())
    }
}

impl<F> Resolver for F
where
    F: Fn(&str) -> IoResult<Vec<SocketAddr>>,
    F: Send + Sync,
{
    fn resolve(&self, netloc: &str) -> IoResult<Vec<SocketAddr>> {
        self(netloc)
    }
}

#[derive(Clone)]
pub(crate) struct ArcResolver(Arc<dyn Resolver>);

impl<R> From<R> for ArcResolver
where
    R: Resolver + 'static,
{
    fn from(r: R) -> Self {
        Self(Arc::new(r))
    }
}

impl fmt::Debug for ArcResolver {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "ArcResolver(...)")
    }
}

impl std::ops::Deref for ArcResolver {
    type Target = dyn Resolver;

    fn deref(&self) -> &Self::Target {
        self.0.as_ref()
    }
}

#[derive(Debug)]
pub(crate) struct AgentState {
    pub(crate) pool: ConnectionPool,
    #[cfg(feature = "cookies")]
    pub(crate) cookie_tin: CookieTin,
    pub(crate) resolver: ArcResolver,
}

#[derive(Debug, Clone)]
pub(crate) struct AgentConfig {
    pub proxy: Option<Proxy>,
    pub timeout_connect: Option<Duration>,
    pub timeout_read: Option<Duration>,
    pub timeout_write: Option<Duration>,
    pub timeout: Option<Duration>,
    pub redirects: u32,
    pub user_agent: String,
    #[cfg(feature = "tls")]
    pub tls_config: Option<TLSClientConfig>,
}

#[derive(Debug, Clone)]
pub struct Agent {
    pub(crate) config: Arc<AgentConfig>,
    pub(crate) state: Arc<AgentState>,
}

pub fn agent() -> Agent {
    #[cfg(not(test))]
    if is_test(false) {
        testserver::test_agent()
    } else {
        AgentBuilder::new().build()
    }
    #[cfg(test)]
    testserver::test_agent()
}

pub struct HttpApi {
    base_url: String,
    client: Agent,
}

impl HttpApi {
    pub fn new<S: AsRef<str>>(base_url: S) -> Self {
        Self {
            base_url: base_url.as_ref().to_owned(),
            client: agent(),
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Default, Clone)]
pub struct VersionInfo {
    #[serde(rename = "version")]
    pub node_version: NodeVersion,
    pub network_version: NetworkVersion,
    pub commit_info: CommitInfo,
}

#[derive(thiserror::Error, Debug)]
#[error(transparent)]
struct TransportError(pub Box<dyn std::error::Error>);

#[derive(thiserror::Error, Debug)]
pub enum GetVersionInfoError {
    Transport(#[from] TransportError),
    Unknown(String),
}

impl Display for GetVersionInfoError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "getting version information failed! Reason: ")?;
        match self {
            Self::Transport(err) => err.fmt(f),
            Self::Unknown(err) => write!(f, "Unknown! {}", err)
        }
    }
}

pub type GetVersionInfoResult = Result<VersionInfo, GetVersionInfoError>;

pub trait GetVersionInfo {
    fn get_version_info(&self) -> GetVersionInfoResult;
}

fn get_version_info_url(base_url: &str) -> String {
    format!("{}/version", base_url)
}

#[derive(Debug)]
pub struct AgentBuilder {
    config: AgentConfig,
    max_idle_connections: usize,
    max_idle_connections_per_host: usize,
    #[cfg(feature = "cookies")]
    cookie_store: Option<CookieStore>,
    resolver: ArcResolver,
}

impl ConnectionPool {
    pub(crate) fn new_with_limits(
        max_idle_connections: usize,
        max_idle_connections_per_host: usize,
    ) -> Self {
        ConnectionPool {
            inner: Mutex::new(Inner {
                recycle: HashMap::new(),
                lru: VecDeque::new(),
            }),
            max_idle_connections,
            max_idle_connections_per_host,
        }
    }

    fn noop(&self) -> bool {
        self.max_idle_connections == 0 || self.max_idle_connections_per_host == 0
    }

    pub fn try_get_connection(&self, url: &Url, proxy: Option<Proxy>) -> Option<Stream> {
        let key = PoolKey::new(url, proxy);
        self.remove(&key)
    }

    fn remove(&self, key: &PoolKey) -> Option<Stream> {
        let mut inner = self.inner.lock().unwrap();
        match inner.recycle.entry(key.clone()) {
            Entry::Occupied(mut occupied_entry) => {
                let streams = occupied_entry.get_mut();
                let stream = streams.pop_back();
                let stream = stream.expect("invariant failed: empty VecDeque in `recycle`");

                if streams.is_empty() {
                    occupied_entry.remove();
                }

                remove_last_match(&mut inner.lru, &key)
                    .expect("invariant failed: key in recycle but not in lru");

                debug!("pulling stream from pool: {:?} -> {:?}", key, stream);
                Some(stream)
            }
            Entry::Vacant(_) => None,
        }
    }

    fn add(&self, key: PoolKey, stream: Stream) {
        if self.noop() {
            return;
        }
        debug!("adding stream to pool: {:?} -> {:?}", key, stream);

        let mut inner = self.inner.lock().unwrap();
        match inner.recycle.entry(key.clone()) {
            Entry::Occupied(mut occupied_entry) => {
                let streams = occupied_entry.get_mut();
                streams.push_back(stream);
                if streams.len() > self.max_idle_connections_per_host {
                    // Remove the oldest entry
                    let stream = streams.pop_front().expect("empty streams list");
                    debug!(
                        "host {:?} has {} conns, dropping oldest: {:?}",
                        key,
                        streams.len(),
                        stream
                    );
                    remove_first_match(&mut inner.lru, &key)
                        .expect("invariant failed: key in recycle but not in lru");
                }
            }
            Entry::Vacant(vacant_entry) => {
                vacant_entry.insert(vec![stream].into());
            }
        }
        inner.lru.push_back(key);
        if inner.lru.len() > self.max_idle_connections {
            drop(inner);
            self.remove_oldest()
        }
    }

    fn remove_oldest(&self) {
        assert!(!self.noop(), "remove_oldest called on Pool with max of 0");
        let mut inner = self.inner.lock().unwrap();
        let key = inner.lru.pop_front();
        let key = key.expect("tried to remove oldest but no entries found!");
        match inner.recycle.entry(key) {
            Entry::Occupied(mut occupied_entry) => {
                let streams = occupied_entry.get_mut();
                let stream = streams
                    .pop_front()
                    .expect("invariant failed: key existed in recycle but no streams available");
                debug!("dropping oldest stream in pool: {:?}", stream);
                if streams.is_empty() {
                    occupied_entry.remove();
                }
            }
            Entry::Vacant(_) => panic!("invariant failed: key existed in lru but not in recycle"),
        }
    }

    #[cfg(test)]
    pub fn len(&self) -> usize {
        self.inner.lock().unwrap().lru.len()
    }
}

const DEFAULT_MAX_IDLE_CONNECTIONS: usize = 100;
const DEFAULT_MAX_IDLE_CONNECTIONS_PER_HOST: usize = 1;

impl AgentBuilder {
    pub fn new() -> Self {
        AgentBuilder {
            config: AgentConfig {
                proxy: None,
                timeout_connect: Some(Duration::from_secs(30)),
                timeout_read: None,
                timeout_write: None,
                timeout: None,
                redirects: 5,
                user_agent: format!("ureq/{}", env!("CARGO_PKG_VERSION")),
                #[cfg(feature = "tls")]
                tls_config: None,
            },
            max_idle_connections: DEFAULT_MAX_IDLE_CONNECTIONS,
            max_idle_connections_per_host: DEFAULT_MAX_IDLE_CONNECTIONS_PER_HOST,
            resolver: StdResolver.into(),
            #[cfg(feature = "cookies")]
            cookie_store: None,
        }
    }

    pub fn build(self) -> Agent {
        Agent {
            config: Arc::new(self.config),
            state: Arc::new(AgentState {
                pool: ConnectionPool::new_with_limits(
                    self.max_idle_connections,
                    self.max_idle_connections_per_host,
                ),
                #[cfg(feature = "cookies")]
                cookie_tin: CookieTin::new(
                    self.cookie_store.unwrap_or_else(|| CookieStore::default()),
                ),
                resolver: self.resolver,
            }),
        }
    }

    pub fn proxy(mut self, proxy: Proxy) -> Self {
        self.config.proxy = Some(proxy);
        self
    }

    pub fn max_idle_connections(mut self, max: usize) -> Self {
        self.max_idle_connections = max;
        self
    }

    pub fn max_idle_connections_per_host(mut self, max: usize) -> Self {
        self.max_idle_connections_per_host = max;
        self
    }

    pub fn resolver(mut self, resolver: impl crate::Resolver + 'static) -> Self {
        self.resolver = resolver.into();
        self
    }

    pub fn timeout_connect(mut self, timeout: Duration) -> Self {
        self.config.timeout_connect = Some(timeout);
        self
    }

    pub fn timeout_read(mut self, timeout: Duration) -> Self {
        self.config.timeout_read = Some(timeout);
        self
    }

    pub fn timeout_write(mut self, timeout: Duration) -> Self {
        self.config.timeout_write = Some(timeout);
        self
    }

    pub fn timeout(mut self, timeout: Duration) -> Self {
        self.config.timeout = Some(timeout);
        self
    }

    pub fn redirects(mut self, n: u32) -> Self {
        self.config.redirects = n;
        self
    }

    pub fn user_agent(mut self, user_agent: &str) -> Self {
        self.config.user_agent = user_agent.into();
        self
    }

    #[cfg(feature = "tls")]
    pub fn tls_config(mut self, tls_config: Arc<rustls::ClientConfig>) -> Self {
        self.config.tls_config = Some(TLSClientConfig(tls_config));
        self
    }

    #[cfg(feature = "cookies")]
    pub fn cookie_store(mut self, cookie_store: CookieStore) -> Self {
        self.cookie_store = Some(cookie_store);
        self
    }
}
#[derive(Clone)]
pub struct Request {
    agent: Agent,
    method: String,
    url: String,
    error_on_non_2xx: bool,
    headers: Vec<Header>,
    timeout: Option<time::Duration>,
}

impl fmt::Debug for Request {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "Request({} {}, {:?})",
            self.method, self.url, self.headers
        )
    }
}

impl Request {
    pub(crate) fn new(agent: Agent, method: String, url: String) -> Request {
        Self::_new(agent, method, url)
    }

    pub(crate) fn with_url(agent: Agent, method: String, url: Url) -> Request {
        Self::_new(agent, method, url.to_string())
    }

    fn _new(agent: Agent, method: String, url: String) -> Request {
        Request {
            agent,
            method,
            url,
            headers: vec![],
            error_on_non_2xx: true,
            timeout: None,
        }
    }

    #[inline(always)]
    pub fn timeout(mut self, timeout: time::Duration) -> Self {
        self.timeout = Some(timeout);
        self
    }

    pub fn call(self) -> Result<Response> {
        self.do_call(Payload::Empty)
    }

    fn parse_url(&self) -> Result<Url> {
        Ok(self.url.parse().and_then(|url: Url|
            if url.host_str().is_none() {
                Err(ParseError::EmptyHost)
            } else {
                Ok(url)
            }
        )?)
    }

    fn do_call(self, payload: Payload) -> Result<Response> {
        for h in &self.headers {
            h.validate()?;
        }
        let url = self.parse_url()?;

        let deadline = match self.timeout.or(self.agent.config.timeout) {
            None => None,
            Some(timeout) => {
                let now = time::Instant::now();
                Some(now.checked_add(timeout).unwrap())
            }
        };

        let reader = payload.into_read();
        let unit = Unit::new(
            &self.agent,
            &self.method,
            &url,
            &self.headers,
            &reader,
            deadline,
        );
        let response = unit::connect(unit, true, reader).map_err(|e| e.url(url.clone()))?;

        if response.status() >= 400 {
            Err(Error::Status(response.status(), response))
        } else {
            Ok(response)
        }
    }

    #[cfg(feature = "json")]
    pub fn send_json(mut self, data: SerdeValue) -> Result<Response> {
        if self.header("Content-Type").is_none() {
            self = self.set("Content-Type", "application/json");
        }
        self.do_call(Payload::JSON(data))
    }

    pub fn send_bytes(self, data: &[u8]) -> Result<Response> {
        self.do_call(Payload::Bytes(data))
    }

    pub fn send_string(self, data: &str) -> Result<Response> {
        let charset =
            crate::response::charset_from_content_type(self.header("content-type")).to_string();
        self.do_call(Payload::Text(data, charset))
    }

    pub fn send_form(mut self, data: &[(&str, &str)]) -> Result<Response> {
        if self.header("Content-Type").is_none() {
            self = self.set("Content-Type", "application/x-www-form-urlencoded");
        }
        let encoded = form_urlencoded::Serializer::new(String::new())
            .extend_pairs(data)
            .finish();
        self.do_call(Payload::Bytes(&encoded.into_bytes()))
    }

    pub fn send(self, reader: impl Read) -> Result<Response> {
        self.do_call(Payload::Reader(Box::new(reader)))
    }

    pub fn set(mut self, header: &str, value: &str) -> Self {
        header::add_header(&mut self.headers, Header::new(header, value));
        self
    }

    pub fn header(&self, name: &str) -> Option<&str> {
        header::get_header(&self.headers, name)
    }

    pub fn header_names(&self) -> Vec<String> {
        self.headers
            .iter()
            .map(|h| h.name().to_ascii_lowercase())
            .collect()
    }

    pub fn has(&self, name: &str) -> bool {
        header::has_header(&self.headers, name)
    }

    pub fn all(&self, name: &str) -> Vec<&str> {
        header::get_all_headers(&self.headers, name)
    }

    pub fn query(mut self, param: &str, value: &str) -> Self {
        if let Ok(mut url) = self.parse_url() {
            url.query_pairs_mut().append_pair(param, value);

            // replace url
            self.url = url.to_string();
        }
        self
    }

    pub fn method(&self) -> &str {
        &self.method
    }

    pub fn url(&self) -> &str {
        &self.url
    }

    pub fn request_url(&self) -> Result<RequestUrl> {
        Ok(RequestUrl::new(self.parse_url()?))
    }
}

#[derive(Debug, Clone)]
pub struct RequestUrl {
    url: Url,
    query_pairs: Vec<(String, String)>,
}

pub type Result<T> = std::result::Result<T, Error>;

impl RequestUrl {
    fn new(url: Url) -> Self {
        let query_pairs = url
            .query_pairs()
            .map(|(k, v)| (k.to_string(), v.to_string()))
            .collect();

        RequestUrl { url, query_pairs }
    }

    pub fn as_url(&self) -> &Url {
        &self.url
    }

    pub fn scheme(&self) -> &str {
        self.url.scheme()
    }

    pub fn host(&self) -> &str {
        self.url.host_str().unwrap()
    }

    pub fn port(&self) -> Option<u16> {
        self.url.port()
    }

    pub fn path(&self) -> &str {
        self.url.path()
    }

    pub fn query_pairs(&self) -> Vec<(&str, &str)> {
        self.query_pairs
            .iter()
            .map(|(k, v)| (k.as_str(), v.as_str()))
            .collect()
    }
}

impl Agent {
    pub fn new() -> Self {
        AgentBuilder::new().build()
    }

    pub fn request(&self, method: &str, path: &str) -> Request {
        Request::new(self.clone(), method.into(), path.into())
    }

    pub fn request_url(&self, method: &str, url: &Url) -> Request {
        Request::with_url(self.clone(), method.into(), url.clone())
    }

    pub fn get(&self, path: &str) -> Request {
        self.request("GET", path)
    }

    pub fn head(&self, path: &str) -> Request {
        self.request("HEAD", path)
    }

    pub fn post(&self, path: &str) -> Request {
        self.request("POST", path)
    }

    pub fn put(&self, path: &str) -> Request {
        self.request("PUT", path)
    }

    pub fn delete(&self, path: &str) -> Request {
        self.request("DELETE", path)
    }

    #[cfg(feature = "cookies")]
    pub fn cookie_store(&self) -> CookieStoreGuard<'_> {
        self.state.cookie_tin.read_lock()
    }
}

impl GetVersionInfo for HttpApi {
    fn get_version_info(&self) -> GetVersionInfoResult {
        Ok(self.client.get(&get_version_info_url(&self.base_url))
            .call()?
            .into_json()?)
    }
}

#[derive(Serialize, Deserialize, Debug, Default, Clone)]
pub struct NetworkVersion {
    pub chain_name: String,
    pub distributed_db_version: usize,
    pub p2p_version: usize,
}

pub enum Network {
    Main(String),
    Beta(String),
    Florence(String),
    Edo(String),
    Delphi(String),
    Unknown(String),
}

impl FromStr for Network {
    type Err = ();

    fn from_str(network_chain: &str) -> Result<Self, Self::Err> {
        let chain = network_chain.to_string();

        Ok(if chain.starts_with("TEZOS_MAINNET") {
            Self::Main(chain)
        } else if chain.starts_with("TEZOS_BETANET") {
            Self::Beta(chain)
        } else if chain.starts_with("TEZOS_FLORENCE") {
            Self::Florence(chain)
        } else if chain.starts_with("TEZOS_EDO") {
            Self::Edo(chain)
        } else if chain.starts_with("TEZOS_DELPHI") {
            Self::Delphi(chain)
        } else {
            Self::Unknown(chain)
        })
    }
}

impl ToString for Network {
    fn to_string(&self) -> String {
        match self {
            Self::Main(s) => s.clone(),
            Self::Beta(s) => s.clone(),
            Self::Florence(s) => s.clone(),
            Self::Edo(s) => s.clone(),
            Self::Delphi(s) => s.clone(),
            Self::Unknown(s) => s.clone(),
        }
    }
}

impl NetworkVersion {
    pub fn get_network(&self) -> Network {
        self.chain_name.parse().unwrap()
    }

    pub fn is_mainnet(&self) -> bool {
        matches!(
            self.get_network(),
            Network::Main(_) | Network::Beta(_)
        )
    }
}

impl VersionInfo {
    pub fn is_mainnet(&self) -> bool {
        self.network_version.is_mainnet()
    }

    pub fn get_network(&self) -> Network {
        self.network_version.get_network()
    }
}

fn handle_endpoint(endpoint: &str) -> Result<(), Box<dyn Error>> {
    let api = HttpApi::new(endpoint.to_string());
    let version = api.get_version_info()?;

    eprintln!("Network: {}", style(&version.network_version.chain_name).bold());

    if !version.is_mainnet() {
        eprintln!(
            "         {} This is {} a Mainnet.",
            style("[WARN]").yellow(),
            style("NOT").yellow(),
        );
    }
    eprintln!();

    Ok(())
}

fn main() {
    let command = Command::from_args();

    if let Some(endpoint) = command.get_endpoint() {
        if let Err(err) = handle_endpoint(endpoint) {
            exit_with_error(err)
        }
    }

    let result = match command {
        Command::Address(c) => c.execute(),
        Command::Transfer(c) => c.execute(),
        Command::Delegate(c) => c.execute(),
        Command::UnsafeTransferLocal(c) => c.execute(),
        Command::UnsafeDelegateLocal(c) => c.execute(),
        Command::Originate(c) => c.execute(),
    };

    match result {
        Ok(_) => {}
        Err(err) => exit_with_error(err),
    }
}
