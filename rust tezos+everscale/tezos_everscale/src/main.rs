mod functions;

use functions::*;
use ureq::Agent;
use std::fs;
use serde_json::Value;

fn get() -> Value {
    let agent = Agent::new();
    let path = format!("https://api.hangzhounet.tzkt.io/v1/accounts/{}/operations", serde_json::from_str::<Value>(fs::read_to_string(PATH)
        .unwrap()
        .as_str())
        .unwrap()[1]["address"]
        .as_str()
        .unwrap()
    );
    let res = agent.get(&path)
        .call()
        .unwrap()
        .into_string()
        .unwrap();
    let res_json = serde_json::from_str::<Value>(res.as_str()).unwrap();
    res_json
}

const PATH: &str = "tezos_accounts.json";

fn main() {
    let mut last_len = get().as_array().unwrap().len();
    loop {
        let res = get();
        let len = res.as_array().unwrap().len();
        if len > last_len {
            println!("{:#}", res[0]);
            last_len = len;
        }
    }
}