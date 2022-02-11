use ureq::Agent;

fn run(agent: Agent, address: &str) -> String {
    let path = format!("https://api.hangzhounet.tzkt.io/v1/accounts/{}/operations", address);
    let res = agent.get(&path).call().unwrap();
    res.into_string().unwrap()
}

fn main() {
    let agent = Agent::new();
    let address = "tz1f1WndyZoUQWU3ujAMCy4b1VtuYhxpc82R";
    println!("{}", run(agent, &address));
}
