use ton_client::error::ClientError;
use ton_client::ClientContext;
use ton_client::abi::*;
use serde_json::Value;
use std::sync::Arc;
use crate::*;
use crate::functions::get_json_field;
use super::contract::call_contract_with_client;
use super::config::Config;

pub async fn get_payload(
    ton: Arc<ClientContext>,
    abi_str: &str,
    // comment: &str,
    dest: &str,
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
                function_name: "transfer".to_owned(),
                header: None,
                input: Some(serde_json::json!({
                    // "dest": "0:0010000000123456789012345678901234567890123456789012345678901234",
                    // "dest": dest,
                    // "hash": "0xc39b295aef558a41ef416dcc80bc1def91857e7c16cdf4e698cc8df7cb5c6114",
                    "comment": hex::encode(serde_json::json!({
                        "dest": dest,
                        "hash": hash,
                    }).to_string())
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

// pub async fn get_payload(
//     ton: Arc<ClientContext>,
//     abi_str: &str,
//     // comment: &str,
//     _dest: &str,
//     hash: &str,
// ) -> Result<ResultOfEncodeMessageBody, ClientError> {
//     let abi = format!("./dependencies/json/{}", abi_str);
//     let abi = Abi::Json(std::fs::read_to_string(abi.as_str()).unwrap());
//     let msg = ton_client::abi::encode_message_body(
//         ton,
//         ParamsOfEncodeMessageBody{
//             abi,
//             is_internal: true,
//             call_set: CallSet {
//                 function_name: "createLockWithTokens".to_owned(),
//                 header: None,
//                 input: Some(serde_json::json!({
//                     // "dest": "0:0010000000123456789012345678901234567890123456789012345678901234",
//                     // "dest": dest,
//                     // "hash": "0xc39b295aef558a41ef416dcc80bc1def91857e7c16cdf4e698cc8df7cb5c6114",
//                     "hash": hash
//                     // "timeout": "300",
//                 })),
//             },
//             signer: Signer::None,
//             processing_try_index: None,
//         },
//     ).await;
//     println!("{}", msg.as_ref().unwrap().body);
//     msg
// }

pub async fn ever_get_transactions(
    ton: Arc<ClientContext>,
    config: Config,
    address: &str,
    abi_path: &str,
) -> Vec<Value> {
    if let Some(arr) = call_contract_with_client(
        ton,
        config.clone(),
        address,
        std::fs::read_to_string(format!("./dependencies/json/{}", abi_path)).unwrap(),
        "getTransactions",
        serde_json::json!({}),
        None,
        true, // true - run in tonos cli, false - call
        false,
    ).await.unwrap()["transactions"].as_array() { arr.to_owned() }
    else { vec![] }
}

pub fn ever_multisig() -> String {
    get_json_field(EVERSCALE_ACCOUNTS, None, Some(ever_multisig_id()))["address"].as_str().unwrap().to_string()
}

pub fn ever_htlc() -> String {
    get_json_field(CONFIG, Some("htlc1"), None).as_str().unwrap().to_string()
}

pub fn ever_multisig_id() -> usize {
    get_json_field(CONFIG, Some("everscale_multisig_id"), None).as_u64().unwrap() as usize
}

pub fn ever_msig_keypair(i: usize) -> String {
    format!("./dependencies/json/wallet{}.scmsig{}.json", ever_multisig_id() + 1, i.max(1).min(3))
}

pub fn htlc_abi() -> String {
    std::fs::read_to_string("./dependencies/json/HelloWallet.abi.json").unwrap()
}

pub fn ever_htlc_keypair() -> String {
    "./dependencies/json/htlc1_keys.json".to_string()
}