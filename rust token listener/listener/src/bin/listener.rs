use ureq::Agent;
use json::parse;
use std::fs;
use serde_json;
use serde_json::Value;

type Error = Box<dyn std::error::Error>;

fn get_value(field: &str) -> Result<String, Error> {
    Ok(
        serde_json::from_str::<Value>(fs::read_to_string(PATH)
            .unwrap()
            .as_str())?
                .clone()[field]
                .clone()
                .as_str()
                .unwrap()
                .to_string()
    )
}

fn get() -> json::JsonValue {
    let agent = Agent::new();
    let path = format!("https://api.hangzhou2net.tzkt.io/v1/accounts/{}/operations", get_value("contract").unwrap());
    let res = agent.get(&path)
        .call()
        .unwrap()
        .into_string()
        .unwrap();
    let res_json = parse(res.as_str()).unwrap();
    res_json
}

const PATH: &str = "config.json";
fn main() {
    let mut last_len = get().len();
    let wallet = get_value("wallet").unwrap();
    loop {
        let res = get();
        let len = res.len();
        let txs = &res[0]["parameter"]["value"][0]["txs"][0];
        if len > last_len && txs["to_"].as_str().unwrap_or("") == wallet {
            println!("{:#}", txs);
            // println!("{:#}", res[0]);
            last_len = len;
        }
    }
}