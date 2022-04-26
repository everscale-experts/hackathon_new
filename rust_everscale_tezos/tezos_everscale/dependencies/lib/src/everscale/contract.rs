use ton_client::crypto::KeyPair;
use ton_client::ClientContext;
use std::time::SystemTime;
use ton_client::abi::*;
use serde_json::Value;
use chrono::TimeZone;
use std::sync::Arc;
use chrono::Local;
use crate::functions::*;
use super::config::Config;
use super::message::{prepare_message_params, send_message_and_wait, process_message};

pub async fn call_contract_with_client(
    ton: Arc<ClientContext>,
    conf: Config,
    addr: &str,
    abi: String,
    method: &str,
    params: Value,
    keys: Option<String>,
    local: bool,
    is_fee: bool,
) -> Result<serde_json::Value, String> {
    // println!("method: {}, keys: {}", method, keys.clone().unwrap_or("null".to_string()));
    // println!("{}", addr);
    // println!("{}", keys.as_ref().unwrap());
    // println!("{}", params);
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

pub fn load_abi(abi: &str) -> Result<Abi, String> {
    Ok(Abi::Contract(
        serde_json::from_str::<AbiContract>(abi)
            .map_err(|e| format!("ABI is not a valid json: {}", e))?,
    ))
}

pub fn load_abi_json(file: &str) -> Result<Abi, String> {
    Ok(Abi::Json(std::fs::read_to_string(file).unwrap()))
}

pub fn read_keys(filename: &str) -> Result<KeyPair, String> {
    let keys_str = std::fs::read_to_string(filename)
        .map_err(|e| format!("failed to read the keypair file: {}", e.to_string()))?;
    let keys: KeyPair = serde_json::from_str(&keys_str)
        .map_err(|e| format!("failed to load keypair: {}", e))?;
    Ok(keys)
}