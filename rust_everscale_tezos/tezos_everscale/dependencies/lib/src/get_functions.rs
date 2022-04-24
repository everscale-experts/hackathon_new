use crate::tezos::get::*;
use crate::*;
use serde_json::Value;

pub fn get_json_field(file: &str, key: Option<&str>, index: Option<usize>) -> Value {
    // println!("{}", file);
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

pub fn get_address_by_tme(tme_id: usize) -> serde_json::Value {
    get_json_field("./dependencies/json/tezos_msig_custodians.json", None, Some(tme_id))
}

pub fn ever_multisig() -> String {
    get_json_field(CONFIG, None, Some(ever_multisig_id() as usize)).as_str().unwrap().to_string()
}

pub fn ever_htlc() -> String {
    get_json_field(CONFIG, Some("htlc1"), None).as_str().unwrap().to_string()
}

pub fn ever_multisig_id() -> usize {
    get_json_field(CONFIG, Some("everscale_multisig_id"), None).as_u64().unwrap() as usize
}

pub fn ever_msig_keypair(i: usize) -> String {
    format!("wallet{}.scmsig{}.json", ever_multisig_id(), i)
}

pub fn htlc_abi() -> String {
    std::fs::read_to_string("./dependencies/json/HelloWallet.abi.json").unwrap()
}

pub fn ever_htlc_keypair() -> String {
    "./dependencies/json/htlc1_keys.json".to_string()
}