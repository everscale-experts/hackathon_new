pub use ton_client::ClientContext;
pub use serde_json::Value;
pub use std::sync::Arc;
use std::collections::BTreeMap;
use std::time::SystemTime;
use std::str::FromStr;
use lazy_static::lazy_static;
use ton_client::error::ClientError;
use ton_client::crypto::CryptoConfig;
use ton_client::crypto::KeyPair;
use ton_client::ClientConfig;
use ton_client::abi::ParamsOfEncodeMessage;
use ton_client::abi::AbiContract;
use ton_client::abi::AbiConfig;
use ton_client::abi::Signer;
use ton_client::abi::Abi;
use ton_client::net::ParamsOfQueryCollection;
use ton_client::net::query_collection;
use ton_client::net::OrderBy;
use serde::Deserialize;
use serde::Serialize;
use chrono::TimeZone;
use chrono::Local;
use ton_client::processing::ParamsOfWaitForTransaction;
use ton_client::processing::ParamsOfProcessMessage;
use ton_client::processing::wait_for_transaction;
use ton_client::processing::ParamsOfSendMessage;
use ton_client::processing::ProcessingEvent;
use ton_client::processing::send_message;
use ton_client::abi::encode_message;
use ton_client::abi::FunctionHeader;
use ton_client::abi::CallSet;
use ton_client::tvm::ExecutionOptions;
use ton_client::tvm::AccountForExecutor;
use ton_client::tvm::ParamsOfRunExecutor;
use ton_client::tvm::ParamsOfRunTvm;
use ton_client::tvm::run_executor;
use ton_client::tvm::run_tvm;
use ton_block::Serializable;
use ton_block::Account;
use log;

#[derive(Serialize, Deserialize, Clone)]
pub struct Config {
    url: String,
    wc: i32,
    addr: Option<String>,
    wallet: Option<String>,
    pubkey: Option<String>,
    abi_path: Option<String>,
    keys_path: Option<String>,
    retries: u8,
    timeout: u32,
    message_processing_timeout: u32,
    out_of_sync_threshold: u32,
    is_json: bool,
    depool_fee: f32,
    lifetime: u32,
    no_answer: bool,
    balance_in_tons: bool,
    local_run: bool,
    async_call: bool,
    endpoints: Vec<String>,
}

#[derive(Serialize, Deserialize, Clone)]
struct FullConfig {
    config: Config,
    endpoints_map: BTreeMap<String, Vec<String>>,
}

lazy_static! {
    static ref MAIN_ENDPOINTS: Vec<String> = vec![
        "https://main2.ton.dev".to_string(),
        "https://main3.ton.dev".to_string(),
        "https://main4.ton.dev".to_string(),
    ];

    static ref NET_ENDPOINTS: Vec<String> = vec![
        "https://net.ton.dev".to_string(),
        "https://net1.ton.dev".to_string(),
        "https://net5.ton.dev".to_string(),
    ];

    static ref SE_ENDPOINTS: Vec<String> = vec![
        "http://0.0.0.0/".to_string(),
        "http://127.0.0.1/".to_string(),
        "http://localhost/".to_string(),
    ];
}

// impl FullConfig {
    // fn new() -> Self {
    //     FullConfig {
    //         config: Config::new(),
    //         endpoints_map: FullConfig::default_map(),
    //     }
    // }
    // fn default_map() -> BTreeMap<String, Vec<String>> {
    //     [("main.ton.dev".to_owned(), MAIN_ENDPOINTS.to_owned()),
    //         ("net.ton.dev".to_owned(), NET_ENDPOINTS.to_owned()),
    //         ("http://127.0.0.1/".to_owned(), SE_ENDPOINTS.to_owned()),
    //     ].iter().cloned().collect()
    // }

    // fn get_map(path: &str) -> BTreeMap<String, Vec<String>> {
    //     FullConfig::from_file(path).endpoints_map
    // }

    // fn from_file(path: &str) -> FullConfig {
    //     let conf_str = std::fs::read_to_string(path).ok().unwrap_or_default();
    //     serde_json::from_str(&conf_str).ok().unwrap_or(FullConfig::new())
    // }

    // fn to_file(path: &str, fconf: &FullConfig) -> Result<(), String>{
    //     let conf_str = serde_json::to_string_pretty(fconf)
    //         .map_err(|_| "failed to serialize config object".to_string())?;
    //     std::fs::write(path, conf_str).map_err(|e| format!("failed to write config file: {}", e))?;
    //     Ok(())
    // }

    // fn print_endpoints(path: &str) {
    //     let fconf = FullConfig::from_file(path);
    //     println!(
    //         "{}",
    //         serde_json::to_string_pretty(&fconf.endpoints_map).unwrap_or(
    //             "Failed to print endpoints map.".to_owned()
    //         )
    //     );
    // }

    // fn add_endpoint(path: &str, url: &str, endpoints: &str) -> Result<(), String> {
    //     let mut fconf = FullConfig::from_file(path);
    //     let mut new_endpoints : Vec<String> = endpoints
    //         .replace("[", "")
    //         .replace("]", "")
    //         .split(",")
    //         .map(|s| s.to_string())
    //         .collect();
        
    //     let old_endpoints = fconf.endpoints_map.entry(url.to_string()).or_insert(vec![]);
    //     old_endpoints.append(&mut new_endpoints);
    //     old_endpoints.sort();
    //     old_endpoints.dedup();
    //     FullConfig::to_file(path, &fconf)
    // }

    // fn remove_endpoint(path: &str, url: &str) -> Result<(), String> {
    //     let mut fconf = FullConfig::from_file(path);
    //     if !fconf.endpoints_map.contains_key(url) {
    //         return Err("Endpoints map doesn't contain such url.".to_owned());
    //     }
    //     fconf.endpoints_map.remove(url);
    //     FullConfig::to_file(path, &fconf)
    // }

    // fn reset_endpoints(path: &str) -> Result<(), String> {
    //     let mut fconf = FullConfig::from_file(path);
    //     fconf.endpoints_map = FullConfig::default_map();
    //     FullConfig::to_file(path, &fconf)
    // }
// }

impl Config {
    // fn new() -> Self {
    //     let url = "net.ton.dev".to_string();
    //     let endpoints = FullConfig::default_map()[&url].clone();
    //     Config {
    //         url,
    //         wc: 0,
    //         addr: None,
    //         wallet: None,
    //         pubkey: None,
    //         abi_path: None,
    //         keys_path: None,
    //         retries: 5,
    //         timeout: 40000,
    //         message_processing_timeout: 40000,
    //         is_json: false,
    //         depool_fee: 0.5,
    //         lifetime: 60,
    //         no_answer: true,
    //         balance_in_tons: false,
    //         local_run: false,
    //         async_call: false,
    //         endpoints,
    //         out_of_sync_threshold: 15,
    //     }
    // }

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

    // fn from_file(path: &str) -> Option<Self> {
    //     let conf_str = std::fs::read_to_string(path).ok()?;
    //     let conf: serde_json::error::Result<FullConfig>  = serde_json::from_str(&conf_str);
    //     conf.map(|c| c.config).or_else(|_| serde_json::from_str(&conf_str)).ok()
    // }

    // fn to_file(path: &str, conf: &Config) -> Result<(), String> {
    //     let mut fconf= FullConfig::from_file(path);
    //     fconf.config = conf.to_owned();
    //     FullConfig::to_file(path, &fconf)
    // }
}

// fn load_ton_address(addr: &str, conf: &Config) -> Result<String, String> {
//     let addr = if addr.find(':').is_none() {
//         format!("{}:{}", conf.wc, addr)
//     } else {
//         addr.to_owned()
//     };
//     // let _ = MsgAddressInt::from_str(&addr)
//     //     .map_err(|e| format!("Address is specified in the wrong format. Error description: {}", e))?;
//     Ok(addr)
// }

// fn load_params(params: &str) -> Result<String, String> {
//     Ok(if params.find('{').is_none() {
//         std::fs::read_to_string(params)
//             .map_err(|e| format!("failed to load params from file: {}", e))?
//     } else {
//         params.to_string()
//     })
// }

pub fn get_json_field(file: &str, key: Option<&str>, index: Option<usize>) -> Value {
    if let Some(k) = key {
        serde_json::from_str::<Value>(std::fs::read_to_string(file).unwrap().as_str())
            .unwrap()[k]
            .clone()
    } else if let Some(i) = index {
        serde_json::from_str::<Value>(std::fs::read_to_string(file).unwrap().as_str())
            .unwrap()[i]
            .clone()
    } else {
        serde_json::from_str::<Value>(std::fs::read_to_string(file).unwrap().as_str())
            .unwrap()
            .clone()
    }
}

pub fn hex_to_dec(v: &str) -> u64 {
    u64::from_str_radix(v.trim_start_matches("0x"), 16).unwrap()
}

pub fn load_abi(abi: &str) -> Result<Abi, String> {
    Ok(Abi::Contract(
        serde_json::from_str::<AbiContract>(abi)
            .map_err(|e| format!("ABI is not a valid json: {}", e))?,
    ))
}

fn read_keys(filename: &str) -> Result<KeyPair, String> {
    let keys_str = std::fs::read_to_string(filename)
        .map_err(|e| format!("failed to read the keypair file: {}", e.to_string()))?;
    let keys: KeyPair = serde_json::from_str(&keys_str)
        .map_err(|e| format!("failed to load keypair: {}", e))?;
    Ok(keys)
}

fn prepare_message_params(
    addr: &str,
    abi: Abi,
    method: &str,
    params: &str,
    header: Option<FunctionHeader>,
    keys: Option<String>,
) -> Result<ParamsOfEncodeMessage, String> {
    let keys = keys.map(|k| read_keys(&k)).transpose()?;
    let params = serde_json::from_str(&params)
        .map_err(|e| format!("arguments are not in json format: {}", e))?;
    let call_set = Some(CallSet {
        function_name: method.into(),
        input: Some(params),
        header: header.clone(),
    });

    Ok(ParamsOfEncodeMessage {
        abi,
        address: Some(addr.to_owned()),
        call_set,
        signer: if keys.is_some() {
            Signer::Keys { keys: keys.unwrap() }
        } else {
            Signer::None
        },
        ..Default::default()
    })
}

async fn query_with_limit(
    ton: Arc<ClientContext>,
    collection: &str,
    filter: serde_json::Value,
    result: &str,
    order: Option<Vec<OrderBy>>,
    limit: Option<u32>,
) -> Result<Vec<serde_json::Value>, ClientError> {
    query_collection(
        ton,
        ParamsOfQueryCollection {
            collection: collection.to_owned(),
            filter: Some(filter),
            result: result.to_owned(),
            order,
            limit,
            ..Default::default()
        },
    )
        .await
        .map(|r| r.result)
}

async fn query_account_field(ton: Arc<ClientContext>, address: &str, field: &str) -> Result<String, String> {
    let accounts = query_with_limit(
        ton.clone(),
        "accounts",
        serde_json::json!({ "id": { "eq": address } }),
        field,
        None,
        Some(1),
    ).await
        .map_err(|e| format!("failed to query account data: {}", e))?;
    if accounts.len() == 0 {
        return Err(format!("account with address {} not found", address));
    }
    let data = accounts[0][field].as_str();
    if data.is_none() {
        return Err(format!("account doesn't contain {}", field));
    }
    Ok(data.unwrap().to_string())
}

fn prepare_execution_options(bc_config: Option<&str>) -> Result<Option<ExecutionOptions>, String> {
    if let Some(config) = bc_config {
        let bytes = std::fs::read(config)
            .map_err(|e| format!("Failed to read data from file {}: {}", config, e))?;
        let config_boc = base64::encode(&bytes);
        let ex_opt = ExecutionOptions{
            blockchain_config: Some(config_boc),
            ..Default::default()
        };
        return Ok(Some(ex_opt));
    }
    Ok(None)
}

async fn run_local(
    ton: Arc<ClientContext>,
    abi: Abi,
    msg: String,
    acc_boc: String,
    bc_config: Option<&str>,
) -> Result<serde_json::Value, String> {
    let execution_options = prepare_execution_options(bc_config)?;
    let result = run_tvm(
        ton.clone(),
        ParamsOfRunTvm {
            message: msg,
            account: acc_boc,
            abi: Some(abi.clone()),
            return_updated_account: Some(true),
            execution_options,
            ..Default::default()
        },
    ).await
        .map_err(|e| format!("{:#}", e))?;
    let res = result.decoded.and_then(|d| d.output)
        .ok_or("Failed to decode the result. Check that abi matches the contract.")?;
    Ok(res)
}

async fn emulate_locally(
    ton: Arc<ClientContext>,
    addr: &str,
    msg: String,
    is_fee: bool,
) -> Result<(), String> {
    let state: String;
    let state_boc = query_account_field(ton.clone(), addr, "boc").await;
    if state_boc.is_err() {
        if is_fee {
            let addr = ton_block::MsgAddressInt::from_str(addr)
                .map_err(|e| format!("couldn't decode address: {}", e))?;
            state = base64::encode(
                &ton_types::cells_serialization::serialize_toc(
                    &Account::with_address(addr)
                        .serialize()
                        .map_err(|e| format!("couldn't create dummy account for deploy emulation: {}", e))?
                ).map_err(|e| format!("failed to serialize account cell: {}", e))?
            );
        } else {
            return Err(state_boc.err().unwrap());
        }
    } else {
        state = state_boc.unwrap();
    }
    let res = run_executor(
        ton.clone(),
        ParamsOfRunExecutor {
            message: msg.clone(),
            account: AccountForExecutor::Account {
                boc: state,
                unlimited_balance: if is_fee {
                    Some(true)
                } else {
                    None
                },
            },
            ..Default::default()
        },
    )
    .await;

    if res.is_err() {
        return Err(format!("{:#}", res.err().unwrap()));
    }
    if is_fee {
        let fees = res.unwrap().fees;
        println!("{{");
        println!("  \"in_msg_fwd_fee\": \"{}\",", fees.in_msg_fwd_fee);
        println!("  \"storage_fee\": \"{}\",", fees.storage_fee);
        println!("  \"gas_fee\": \"{}\",", fees.gas_fee);
        println!("  \"out_msgs_fwd_fee\": \"{}\",", fees.out_msgs_fwd_fee);
        println!("  \"total_account_fees\": \"{}\",", fees.total_account_fees);
        println!("  \"total_output\": \"{}\"", fees.total_output);
        println!("}}");
    } else {
        println!("Local run succeeded. Executing onchain."); // TODO: check is_json
    }
    Ok(())
}

async fn send_message_and_wait(
    ton: Arc<ClientContext>,
    abi: Option<Abi>,
    msg: String,
    conf: Config,
) -> Result<serde_json::Value, String> {

    if !conf.is_json {
        println!("Processing... ");
    }
    let callback = |_| {
        async move {}
    };
    let result = send_message(
        ton.clone(),
        ParamsOfSendMessage {
            message: msg.clone(),
            abi: abi.clone(),
            send_events: false,
            ..Default::default()
        },
        callback,
    ).await
        .map_err(|e| format!("{:#}", e))?;

    if !conf.async_call {
        let result = wait_for_transaction(
            ton.clone(),
            ParamsOfWaitForTransaction {
                abi,
                message: msg.clone(),
                shard_block_id: result.shard_block_id,
                send_events: true,
                ..Default::default()
            },
            callback.clone(),
        ).await
            .map_err(|e| format!("{:#}", e))?;
        Ok(result.decoded.and_then(|d| d.output).unwrap_or(serde_json::json!({})))
    } else {
        Ok(serde_json::json!({}))
    }
}

async fn process_message(
    ton: Arc<ClientContext>,
    msg: ParamsOfEncodeMessage,
    is_json: bool,
) -> Result<serde_json::Value, String> {
    let callback = |event| { async move {
        match event {
            ProcessingEvent::DidSend { shard_block_id: _, message_id, message: _ } => println!("MessageId: {}", message_id),
            _ => (),
        }
    }};
    let res = if !is_json {
        ton_client::processing::process_message(
            ton,
            ParamsOfProcessMessage {
                message_encode_params: msg,
                send_events: true,
                ..Default::default()
            },
            callback,
        ).await.map_err(|e| format!("{:#}", e))?
    } else {
        ton_client::processing::process_message(
            ton,
            ParamsOfProcessMessage {
                message_encode_params: msg,
                send_events: true,
                ..Default::default()
            },
            |_| { async move {} },
        ).await.map_err(|e| format!("{:#}", e))?
    };
    Ok(res.decoded.and_then(|d| d.output).unwrap_or(serde_json::json!({})))
}

pub async fn call_contract_with_client(
    ton: Arc<ClientContext>,
    conf: Config,
    addr: &str,
    abi: String,
    method: &str,
    params: &str,
    keys: Option<String>,
    local: bool,
    is_fee: bool,
) -> Result<serde_json::Value, String> {
    let abi = load_abi(&abi)?;
    let expire_at = conf.lifetime + SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .map_err(|e| format!("failed to obtain system time: {}", e))?
        .as_secs() as u32;
    let time = chrono::prelude::Utc::now().timestamp_millis() as u64;
    let header = FunctionHeader {
        expire: Some(expire_at),
        time: Some(time),
        ..Default::default()
    };
    // println!("{}", params);
    let msg_params = prepare_message_params(
        addr,
        abi.clone(),
        method,
        params,
        Some(header),
        keys.clone(),
    )?;
    let needs_encoded_msg = is_fee ||
        local ||
        conf.async_call ||
        conf.local_run;

    if needs_encoded_msg {
        let msg = encode_message(ton.clone(), msg_params.clone()).await
            .map_err(|e| format!("failed to create inbound message: {}", e))?;

        if local {
            if !conf.is_json {
                println!("Running get-method...");
            }
            let acc_boc = query_account_field(ton.clone(), addr, "boc").await?;
            return run_local(ton.clone(), abi, msg.message.clone(), acc_boc, None).await;
        }
        if conf.local_run || is_fee {
            emulate_locally(ton.clone(), addr, msg.message.clone(), is_fee).await?;
            if is_fee {
                return Ok(Value::Null);
            }
        }
        if conf.async_call {
            return send_message_and_wait(ton,
                                         Some(abi),
                                         msg.message,
                                         conf).await;
        }
    }

    if !conf.is_json {
        print!("\nExpire at: ");
        let expire_at = Local.timestamp(expire_at as i64 , 0);
        println!("{}", expire_at.to_rfc2822());
    }
    process_message(ton.clone(), msg_params, conf.is_json).await
}

// pub async fn call_command(
//     ton: std::sync::Arc<ton_client::ClientContext>,
//     config: Config,
//     address: &str,
//     abi: String,
//     method: &str,
//     params: &str,
//     keys: Option<String>,
//     local: bool,
// ) -> Result<(), String> {
//     let params = load_params(params)?;
//     let abi = std::fs::read_to_string(abi)
//         .map_err(|e| format!("failed to read ABI file: {}", e.to_string()))?;
//     let address = load_ton_address(address, &config)?;
//     let is_fee = false;
//     // let ton = create_client_verbose(&conf)?;
//     let result = call_contract_with_client(
//         ton,
//         config.clone(),
//         address.as_str(),
//         abi,
//         method,
//         params.as_str(),
//         keys,
//         local,
//         is_fee,
//     ).await?;
//     if !config.is_json {
//         println!("Succeeded.");
//     }
//     print_json_result(result, config)?;
//     Ok(())
// }

// fn print_json_result(result: Value, conf: Config) -> Result<(), String> {
//     if !result.is_null() {
//         let result = serde_json::to_string_pretty(&result)
//             .map_err(|e| format!("Failed to serialize the result: {}", e))?;
//         if !conf.is_json {
//             println!("Result: {}", result);
//         } else {
//             println!("{}", result);
//         }
//     }
//     Ok(())
// }

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

pub async fn decode_msg(ton: Arc<ClientContext>, msg: &str, abi: Abi) -> Value {
    ton_client::abi::decode_message(ton.clone(), ton_client::abi::ParamsOfDecodeMessage {
        abi,
        message: msg.to_owned(),
    }).await.unwrap().value.unwrap()
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

fn main() {}