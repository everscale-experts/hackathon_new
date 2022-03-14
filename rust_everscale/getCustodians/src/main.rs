mod tonos;
use tonos::Config;
use tonos::load_ton_address;
use serde_json::Value;

fn get_json_field(file: &str, name: &str) -> Value {
    serde_json::from_str::<Value>(std::fs::read_to_string(file).unwrap().as_str())
        .unwrap()[name]
        .clone()
}

async fn get_costodians(address: &str) -> Result<(), String> {
    let address = Some(address);
    let method = Some("getCustodians");
    let params = Some("{}");
    let abi = Some("contract.abi.json");
    let keys: Option<String> = None;
    let config = Config::new();

    let abi = std::fs::read_to_string(abi.unwrap())
        .map_err(|e| format!("failed to read ABI file: {}", e.to_string()))?;
    let address = load_ton_address(address.unwrap(), &config)?;

    let local = true;
    let is_fee = false;
    tonos::call_contract(
        config,
        address.as_str(),
        abi,
        method.unwrap(),
        &params.unwrap(),
        keys,
        local,
        is_fee,
    ).await
}


#[tokio::main]
async fn main() {
    let address = get_json_field("config.json", "address");
    let res = get_costodians(
        address.as_str().unwrap(),
    ).await;
    println!(
        "Result: {}",
        serde_json::to_string_pretty(&res)
            .map_err(|e| format!("failed to serialize result: {}", e))
            .unwrap());
}