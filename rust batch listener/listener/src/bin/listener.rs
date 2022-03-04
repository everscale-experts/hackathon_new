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

fn check_batch(hash: String) -> (bool, json::JsonValue) {
    let agent = Agent::new();
    let path = format!("https://api.hangzhou.tzstats.com/explorer/op/{}", hash);
    let res = agent.get(&path)
        .call()
        .unwrap()
        .into_string()
        .unwrap();
    let res_json = parse(res.as_str()).unwrap();
    (
        res_json[0]["is_batch"].as_bool().unwrap_or(false),
        res_json,
    )
}

const PATH: &str = "config.json";
fn main() {
    let mut last_len = get().len();
    // let res = get();
    // std::fs::write("result.json", format!("{:#}", is_batch));
    // for i in 0..last_len {
    //     let (is_batch, value) = check_batch(res[i]["hash"].as_str().unwrap().to_string());
    //     println!("is batch: {}\nhash: {}\n", is_batch, res[i]["hash"]);
    // }
    loop {
        let res = get();
        let len = res.len();
        if len > last_len {
            let (is_batch, value) = check_batch(res[0]["hash"].as_str().unwrap().to_string());
            println!("is batch: {}\nhash: {}\n", is_batch, res[0]["hash"]);
            if is_batch {
                println!("-----------------");
                println!("value: {:#}", value);
                println!("-----------------\n");
            }
            println!("{:#?}", is_batch);
            last_len = len;
        }
    }
}