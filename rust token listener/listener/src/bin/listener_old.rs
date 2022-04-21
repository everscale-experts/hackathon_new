use ureq::Agent;
use json::parse;
use std::fs;
// use std::thread;
// use std::time::Duration;
fn get() -> json::JsonValue {
    let agent = Agent::new();
    let path = format!("https://api.hangzhounet.tzkt.io/v1/accounts/{}/operations", parse(fs::read_to_string(PATH)
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
    // println!("listening {}", address);
    let mut last_len = get().len();
    loop {
        let res = get();
        let len = res.len();
        if len > last_len { // если транзакций стало больше
            println!("{:#}", res[0]);
            last_len = len;
        }
    }
}
