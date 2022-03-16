mod tonos;
use tonos::Config;
use tonos::load_ton_address;
use serde_json::Value;
use serde_json::to_string_pretty;

fn get_json_field(file: &str, name: &str) -> Value {
    serde_json::from_str::<Value>(std::fs::read_to_string(file).unwrap().as_str())
        .unwrap()[name]
        .clone()
}

async fn send_transaction(
    address: &str,
    destination: &str,
    amount: &str,
    message: &str
) -> Result<(), String> {
    let address = Some(address);
    let method = Some("sendTransaction");
    let params_string = format!(r#"{{
        "dest": "{}",
        "value": "{}",
        "bounce": false,
        "flags": 0,
        "payload": "{}"
    }}"#, destination, amount, message);
    println!("{}", params_string);
    let params = Some(params_string.as_str());
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

    let local = false;
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
    let send_res = send_transaction(
        address.as_str().unwrap(),
        "0:189385c72e1410c46b5837aa4111b6a5d77139835fac695eed09a3407dff55fa",
        "1",
        "",
    ).await;
    println!("{}", to_string_pretty(&send_res).unwrap());
    // Contract execution was terminated with error: Contract
    // did not accept message, exit code: 100. Tip: For more
    // information about exit code check the contract source
    // code or ask the contract developer
}