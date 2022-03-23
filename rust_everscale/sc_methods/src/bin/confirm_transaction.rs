mod tonos;
use tonos::Config;
use tonos::create_client_verbose;
use tonos::load_ton_address;
use serde_json::Value;
use serde_json::to_string_pretty;

fn get_json_field(file: &str, name: &str) -> Value {
    serde_json::from_str::<Value>(std::fs::read_to_string(file).unwrap().as_str())
        .unwrap()[name]
        .clone()
}

async fn call_command(
    ton: std::sync::Arc<ton_client::ClientContext>,
    config: Config,
    address: &str,
    abi: String,
    method: &str,
    params: &str,
    keys: Option<String>,
) -> Result<(), String> {
    let params = tonos::load_params(params)?;
    let abi = std::fs::read_to_string(abi)
        .map_err(|e| format!("failed to read ABI file: {}", e.to_string()))?;
    let address = load_ton_address(address, &config)?;
    let local = false;
    let is_fee = false;
    // let ton = create_client_verbose(&conf)?;
    let result = tonos::call_contract_with_client(
        ton,
        config.clone(),
        address.as_str(),
        abi,
        method,
        params.as_str(),
        keys,
        local,
        is_fee,
    ).await?;
    if !config.is_json {
        println!("Succeeded.");
    }
    print_json_result(result, config)?;
    Ok(())
}

fn print_json_result(result: Value, conf: Config) -> Result<(), String> {
    if !result.is_null() {
        let result = serde_json::to_string_pretty(&result)
            .map_err(|e| format!("Failed to serialize the result: {}", e))?;
        if !conf.is_json {
            println!("Result: {}", result);
        } else {
            println!("{}", result);
        }
    }
    Ok(())
}

#[tokio::main]
async fn main() {
    let address = get_json_field("config.json", "address");
    let config = Config::from_json(
        serde_json::from_str(
            std::fs::read_to_string(
                "run_config.json"
            ).unwrap().as_str()
        ).expect("failed to parse json")
    );
    let ton = create_client_verbose(&config).unwrap();
    // let abi = std::fs::read_to_string("SafeMultisigWallet.abi.json")
    //     .map_err(|e| format!("failed to read ABI file: {}", e.to_string())).unwrap();
    for i in 1..4 {
        let send_res = call_command(
            ton.clone(),
            config.clone(),
            address.as_str().unwrap(),
            "SafeMultisigWallet.abi.json".to_owned(),
            "confirmTransaction",
            r#"{
                "transactionId": "7078344556154344065"
            }"#,
            Some(format!("wallet.scmsig{}.json", i)),
        ).await;
        println!("{}", to_string_pretty(&send_res).unwrap());
    }
}