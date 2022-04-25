use serde_json::Value;

use crate::functions::get_json_field;
use crate::*;

pub fn get_operation_info(hash: &str) -> Option<serde_json::Value> {
    let agent = ureq::Agent::new();
    let path = format!("https://api.hangzhou.tzstats.com/explorer/op/{}", hash);
    // println!("{}", path);
    let res = agent.get(&path)
        .call();
    if res.is_ok() {
        Some(res.unwrap().into_json().unwrap())
    } else {
        None
    }
    // serde_json::from_str::<serde_json::Value>(res.as_str()).unwrap()
}

pub fn get_address_counter(address: String) -> u64 {
    let agent = ureq::Agent::new();
    // println!("{}/v1/accounts/{}/counter", endpoint, address);
    agent.get(format!("{}/v1/accounts/{}/counter", ENDPOINT, address).as_str())
        .call().unwrap()
        .into_json().unwrap()
}

pub fn get_chain_id() -> String {
    let agent = ureq::Agent::new();
    agent.get(format!("{}/chains/main/chain_id", RPC).as_str())
        .call().unwrap()
        .into_json().unwrap()
}

pub fn get_status(hash: &str) -> String {
    if let Some(res) = get_operation_info(hash) {
        res[0]["status"].as_str().unwrap().to_string()
    } else {
        "unknown".to_string()
    }
}

pub fn get_confirmations(hash: &str) -> u64 {
    if let Some(res) = get_operation_info(hash) {
        res[0]["confirmations"].as_u64().unwrap()
    } else {
        0
    }
}

pub fn get_proposal_id() -> u64 {
    let path = format!("{}/v1/contracts/{}/storage", ENDPOINT, tezos_multisig());
    let res: serde_json::Value = ureq::Agent::new().get(path.as_str())
        .call().unwrap()
        .into_json().unwrap();
    // println!("{}/v1/contracts/{}/storage", endpoint, tezos_multisig());
    res["counter"].as_str().unwrap().parse::<u64>().unwrap() - 1
}

pub fn get_block_hash() -> String {
    let agent = ureq::Agent::new();
    let value = agent.get(format!("{}/chains/main/blocks/head/hash", RPC).as_str())
        .call().unwrap()
        .into_json().unwrap();
    // println!("Block hash: {}", value);
    value
}

pub fn get_transactions(address: &str) -> Value {
    let agent = ureq::Agent::new();
    let path = format!("https://api.hangzhounet.tzkt.io/v1/accounts/{}/operations", address);
    let res = agent.get(&path)
        .call()
        .unwrap()
        .into_string()
        .unwrap();
    let res_json = serde_json::from_str::<Value>(res.as_str()).unwrap();
    res_json
}

pub fn get_batch_by_hash(hash: String) -> (
    bool, // true if batch contains more than 1 transaction
    Value, // operation (array of transactions) as json value
) {
    let agent = ureq::Agent::new();
    let path = format!("https://api.hangzhou.tzstats.com/explorer/op/{}", hash);
    let res = agent.get(&path)
        .call()
        .unwrap()
        .into_string()
        .unwrap();
    let res_json = serde_json::from_str::<Value>(res.as_str()).unwrap();
    (
        res_json[0]["is_batch"].as_bool().unwrap_or(false),
        res_json,
    )
}

pub fn get_address_by_tme(tme_id: usize) -> serde_json::Value {
    get_json_field("./dependencies/json/tezos_msig_custodians.json", None, Some(tme_id))
}

pub fn tezos_multisig() -> String {
    get_json_field(CONFIG, Some("tezos_multisig"), None).as_str().unwrap().to_string()
}

pub fn tezos_token_address() -> String {
    get_json_field(CONFIG, Some("tezos_token_address"), None).as_str().unwrap().to_string()
}

pub fn tezos_htlc() -> String {
    get_json_field(CONFIG, Some("htlc2"), None).as_str().unwrap().to_string()
}

pub fn tezos_coin_htlc() -> String {
    get_json_field(CONFIG, Some("htlc2-coin"), None).as_str().unwrap().to_string()
}

pub fn tezos_coment_address() -> String {
    get_json_field(CONFIG, Some("tezos_address_for_sending_coments"), None).as_str().unwrap().to_string()
}