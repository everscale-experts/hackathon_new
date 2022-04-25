use std::collections::BTreeMap;
use std::sync::Arc;
use serde::Deserialize;
use serde::Serialize;
use ton_client::ClientConfig;
use ton_client::ClientContext;
use ton_client::abi::AbiConfig;
use ton_client::crypto::CryptoConfig;

struct SimpleLogger;

impl log::Log for SimpleLogger {
    fn enabled(&self, metadata: &log::Metadata) -> bool {
        metadata.level() < log::LevelFilter::Warn
    }

    fn log(&self, record: &log::Record) {
        match record.level() {
            log::Level::Error | log::Level::Warn => {
                eprintln!("{}", record.args());
            }
            _ => {
                println!("{}", record.args());
            }
        }
    }

    fn flush(&self) {}
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Config {
    pub url: String,
    pub wc: i32,
    pub addr: Option<String>,
    pub wallet: Option<String>,
    pub pubkey: Option<String>,
    pub abi_path: Option<String>,
    pub keys_path: Option<String>,
    pub retries: u8,
    pub timeout: u32,
    pub message_processing_timeout: u32,
    pub out_of_sync_threshold: u32,
    pub is_json: bool,
    pub depool_fee: f32,
    pub lifetime: u32,
    pub no_answer: bool,
    pub balance_in_tons: bool,
    pub local_run: bool,
    pub async_call: bool,
    pub endpoints: Vec<String>,
}

impl Config {
    pub fn from_json(value: serde_json::Value) -> Self {
        let conf = &value["config"];
        Config {
            url: conf["url"].as_str().unwrap().to_string(),
            wc: conf["wc"].as_i64().unwrap() as i32,
            addr: conf["addr"].as_str().map(|s| s.to_string()),
            wallet: conf["wallet"].as_str().map(|s| s.to_string()),
            pubkey: conf["pubkey"].as_str().map(|s| s.to_string()),
            abi_path: conf["abi_path"].as_str().map(|s| s.to_string()),
            keys_path: conf["keys_path"].as_str().map(|s| s.to_string()),
            retries: conf["retries"].as_u64().unwrap() as u8,
            timeout: conf["timeout"].as_u64().unwrap() as u32,
            message_processing_timeout: conf["message_processing_timeout"].as_u64().unwrap() as u32,
            is_json: conf["is_json"].as_bool().unwrap(),
            depool_fee: conf["depool_fee"].as_f64().unwrap() as f32,
            lifetime: conf["lifetime"].as_u64().unwrap() as u32,
            no_answer: conf["no_answer"].as_bool().unwrap(),
            balance_in_tons: conf["balance_in_tons"].as_bool().unwrap(),
            local_run: conf["local_run"].as_bool().unwrap(),
            async_call: conf["async_call"].as_bool().unwrap(),
            endpoints: (*conf["endpoints"].as_array().unwrap()
                .iter()
                .map(|v| v.as_str().expect("conf is not a string").to_string())
                .collect::<Vec<String>>()).to_vec(),
            out_of_sync_threshold: conf["out_of_sync_threshold"].as_u64().unwrap() as u32,
        }
    }
}

#[derive(Serialize, Deserialize, Clone)]
struct FullConfig {
    config: Config,
    endpoints_map: BTreeMap<String, Vec<String>>,
}

pub fn create_client_verbose(conf: &Config) -> Result<Arc<ClientContext>, String> {
    if !conf.is_json {
        println!("Connecting to:\n\tUrl: {}", conf.url);
        println!("\tEndpoints: {:?}\n", conf.endpoints);
    }

    let level = if std::env::var("RUST_LOG")
        .unwrap_or_default()
        .eq_ignore_ascii_case("debug")
    {
        log::LevelFilter::Debug
    } else {
        log::LevelFilter::Warn
    };
    log::set_max_level(level);
    log::set_boxed_logger(Box::new(SimpleLogger))
        .map_err(|e| format!("failed to init logger: {}", e))?;

    create_client(conf)
}

fn create_client(conf: &Config) -> Result<Arc<ClientContext>, String> {
    let cli_conf = ClientConfig {
        abi: AbiConfig {
            workchain: conf.wc,
            message_expiration_timeout: conf.lifetime * 1000,
            message_expiration_timeout_grow_factor: 1.3,
        },
        crypto: CryptoConfig {
            mnemonic_dictionary: 1,
            mnemonic_word_count: 12,
            hdkey_derivation_path: "m/44'/396'/0'/0/0".to_string(),
        },
        network: ton_client::net::NetworkConfig {
            server_address: Some(conf.url.to_owned()),
            endpoints: if conf.endpoints.is_empty() {
                    None
                } else {
                    Some(conf.endpoints.to_owned())
                },
            // network_retries_count: 3,
            message_retries_count: conf.retries as i8,
            message_processing_timeout: 30000,
            wait_for_timeout: conf.timeout,
            out_of_sync_threshold: conf.out_of_sync_threshold * 1000,
            // max_reconnect_timeout: 1000,
            ..Default::default()
        },
        ..Default::default()
    };
    let cli =
        ClientContext::new(cli_conf).map_err(|e| format!("failed to create tonclient: {}", e))?;
    Ok(Arc::new(cli))
}