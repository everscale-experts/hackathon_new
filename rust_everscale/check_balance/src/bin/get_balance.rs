use serde_json as sjs;

type Error = Box<dyn std::error::Error>;

fn get_config_field(field: &str) -> Result<String, Error> {
    Ok(
        sjs::from_str::<sjs::Value>(std::fs::read_to_string("config.json")
            .unwrap()
            .as_str())?[field]
                .clone()
                .as_str()
                .unwrap()
                .to_string()
    )
}

fn get_info(endpoint: &str, address: &str) -> sjs::Value {
    let agent = ureq::Agent::new();
    let res = agent.get(format!("https://{}api/v2/getAddressInformation?address={}", endpoint, address).as_str())
        .call()
        .unwrap()
        .into_json()
        .unwrap();
    res
}

fn main() {
    let endpoint = get_config_field("endpoint").unwrap();
    let address = get_config_field("address").unwrap();
    println!("{:#}", get_info(endpoint.as_str(), address.as_str()));
}