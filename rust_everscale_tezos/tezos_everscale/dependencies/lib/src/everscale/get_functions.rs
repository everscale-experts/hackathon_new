use ton_client::error::ClientError;
use ton_client::ClientContext;
use ton_client::abi::*;
use serde_json::Value;
use std::sync::Arc;
use super::contract::call_contract_with_client;
use super::config::Config;

pub async fn get_payload(
    ton: Arc<ClientContext>,
    abi_str: &str,
    // comment: &str,
    _dest: &str,
    hash: &str,
) -> Result<ResultOfEncodeMessageBody, ClientError> {
    let abi = format!("./dependencies/json/{}", abi_str);
    let abi = Abi::Json(std::fs::read_to_string(abi.as_str()).unwrap());
    let msg = ton_client::abi::encode_message_body(
        ton,
        ParamsOfEncodeMessageBody{
            abi,
            is_internal: true,
            call_set: CallSet {
                function_name: "createLockWithTokens".to_owned(),
                header: None,
                input: Some(serde_json::json!({
                    // "dest": "0:0010000000123456789012345678901234567890123456789012345678901234",
                    // "dest": dest,
                    // "hash": "0xc39b295aef558a41ef416dcc80bc1def91857e7c16cdf4e698cc8df7cb5c6114",
                    "hash": hash
                    // "timeout": "300",
                })),
            },
            signer: Signer::None,
            processing_try_index: None,
        },
    ).await;
    println!("{}", msg.as_ref().unwrap().body);
    msg
}

pub async fn ever_get_transactions(
    ton: Arc<ClientContext>,
    config: Config,
    address: &str,
    abi: &str,
) -> Vec<Value> {
    if let Some(arr) = call_contract_with_client(
        ton,
        config.clone(),
        address,
        abi.to_string(),
        "getTransactions",
        serde_json::json!({}),
        None,
        true, // true - run in tonos cli, false - call
        false,
    ).await.unwrap()["transactions"].as_array() { arr.to_owned() }
    else { vec![] }
}