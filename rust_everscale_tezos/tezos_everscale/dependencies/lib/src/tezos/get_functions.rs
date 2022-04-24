use crate::get::get_json_field;
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