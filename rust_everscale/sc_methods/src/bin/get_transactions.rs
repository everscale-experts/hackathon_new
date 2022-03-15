mod tonos;
use tonos::Config;
use tonos::load_ton_address;
use serde_json::Value;

fn get_json_field(file: &str, name: &str) -> Value {
    serde_json::from_str::<Value>(std::fs::read_to_string(file).unwrap().as_str())
        .unwrap()[name]
        .clone()
}

async fn get_transactions(address: &str) -> Result<(), String> {
    let address = Some(address);
    let method = Some("getTransactions");
    let params = Some("{}");
    let abi = Some("SafeMultisigWallet.abi.json");
    let keys: Option<String> = None;
    let config = Config::from_json(
        serde_json::from_str(
            std::fs::read_to_string(
                "run_config.json"
            ).unwrap().as_str()
        ).expect("failed to parse json")
    );
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
    let res = get_transactions(
        address.as_str().unwrap(),
    ).await;
    println!(
        "{}",
        serde_json::to_string_pretty(&res).unwrap()
    );
}