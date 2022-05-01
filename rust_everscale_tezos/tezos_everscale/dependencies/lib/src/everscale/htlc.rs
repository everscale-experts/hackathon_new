use ton_client::ClientContext;
use serde_json::Value;
use std::sync::Arc;
use super::contract::call_contract_with_client;
use super::config::Config;
use super::get::*;

pub async fn create_lock_with_tokens(
    ton: Arc<ClientContext>,
    config: Config,
    keys: Option<String>,
    hash: String,
) -> Value {
    call_contract_with_client(
        ton.clone(),
        config.clone(),
        ever_htlc().as_str(),
        htlc_abi(),
        "createLockWithTokens",
        serde_json::json!({
            "hash": hash,
        }),
        keys,
        false, // true - run in tonos cli, false - call
        false,
    ).await.unwrap()
}

pub async fn create_lock_with_coins(
    ton: Arc<ClientContext>,
    config: Config,
    keys: Option<String>,
    hash: &str,
    dest: &str,
) -> Value {
    call_contract_with_client(
        ton.clone(),
        config.clone(),
        ever_htlc().as_str(),
        htlc_abi(),
        "createLockWithCoins",
        serde_json::json!({
            "dest": dest,
            "hash": hash,
            "timeout": 300,
        }),
        keys,
        false, // true - run in tonos cli, false - call
        false,
    ).await.unwrap()
}

pub async fn get_timestamp(
    ton: Arc<ClientContext>,
    config: Config,
    keys: Option<String>,
) -> Value {
    call_contract_with_client(
        ton.clone(),
        config,
        ever_htlc().as_str(),
        htlc_abi(),
        "getTimestamp",
        serde_json::json!({}),
        keys,
        true,
        false,
    ).await.unwrap()
}