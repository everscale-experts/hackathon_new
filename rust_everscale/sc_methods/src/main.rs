mod functions;
use functions::*;

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
    let send_res = call_command(
        ton.clone(),
        config.clone(),
        address.as_str().unwrap(),
        "SafeMultisigWallet.abi.json".to_owned(),
        "getTransactions",
        r#"{
        }"#,
        None,
        true,
    ).await;
    println!("{}", to_string_pretty(&send_res).unwrap());
}