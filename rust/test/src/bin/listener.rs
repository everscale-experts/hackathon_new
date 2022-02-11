use ureq::Agent;
use json::parse;
use std::thread;
use std::time::Duration;
const ADDR: &str = "tz1f1WndyZoUQWU3ujAMCy4b1VtuYhxpc82R";

fn get() -> json::JsonValue {
    let agent = Agent::new();
    let path = format!("https://api.hangzhounet.tzkt.io/v1/accounts/{}/operations", ADDR);
    let res = agent.get(&path)
        .call()
        .unwrap()
        .into_string()
        .unwrap();
    let res_json = parse(res.as_str()).unwrap();
    res_json
}

fn main() {
    println!("started");
    let mut last_len = get().len();
    loop {
        thread::sleep(Duration::from_millis(1000));
        let res = get();
        let len = res.len();
        if len > last_len {
            println!("{}", res[0]);
            last_len = len;
        }
    }
}
