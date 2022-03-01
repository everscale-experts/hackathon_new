use ureq::Agent;
use json::parse;
use std::fs;
use serde_json;
use serde_json::Value;

type Error = Box<dyn std::error::Error>;

fn get_type() -> Result<String, Error> {
    Ok(
        serde_json::from_str::<Value>(fs::read_to_string("config.json")
            .unwrap()
            .as_str())?
                .clone()["type"]
                .clone()
                .as_str()
                .unwrap()
                .to_string()
    )
}

fn get() -> json::JsonValue {
    let agent = Agent::new();
    let path = format!("https://api.hangzhou2net.tzkt.io/v1/accounts/{}/operations", parse(fs::read_to_string(PATH)
        .unwrap()
        .as_str())
        .unwrap()["address"]
        .as_str()
        .unwrap()
    );
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
    loop {
        let res = get();
        let len = res.len();
        if len > last_len {
            println!("{:#}", res[0]);
            last_len = len;
        }
    }
}