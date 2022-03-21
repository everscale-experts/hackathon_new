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
// "name": "submitTransaction",
// "inputs": [
//     {"name":"dest","type":"address"},
//     {"name":"value","type":"uint128"},
//     {"name":"bounce","type":"bool"},
//     {"name":"allBalance","type":"bool"},
//     {"name":"payload","type":"cell"}
// ],
// "outputs": [
//     {"name":"transId","type":"uint64"}
// ]

async fn submit_transaction(
    address: &str,
    destination: &str,
    amount: &str,
    message: &str
) -> Result<(), String> {
    let params_string = format!(r#"{{
        "dest": "{}",
        "value": {},
        "bounce": false,
        "allBalance": false,
        "payload": "{}"
    }}"#, destination, amount, message);
    println!("{:#}", serde_json::from_str::<Value>(params_string.as_str()).unwrap());
    let params = Some(params_string.as_str());
    let abi = Some("SafeMultisigWallet.abi.json");
    let keys: Option<String> = Some("wallet.scmsig1.json".to_owned());
    let config = Config::from_json(
        serde_json::from_str(
            std::fs::read_to_string(
                "run_config.json"
            ).unwrap().as_str()
        ).expect("failed to parse json")
    );
    let abi = std::fs::read_to_string(abi.unwrap())
        .map_err(|e| format!("failed to read ABI file: {}", e.to_string()))?;
    let address = load_ton_address(address, &config)?;

    let local = false;
    let is_fee = false;
    tonos::call_contract(
        config,
        address.as_str(),
        abi,
        "submitTransaction",
        &params.unwrap(),
        keys,
        local,
        is_fee,
    ).await
}

// async fn send_transaction(
//     address: &str,
//     destination: &str,
//     amount: &str,
//     message: &str
// ) -> Result<(), String> {
//     let address = Some(address);
//     let params_string = format!(r#"{{
//         "dest": "{}",
//         "value": "{}",
//         "bounce": false,
//         "flags": 0,
//         "payload": "{}"
//     }}"#, destination, amount, message);
//     println!("{:#}", serde_json::from_str::<Value>(params_string.as_str()).unwrap());
//     let params = Some(params_string.as_str());
//     let abi = Some("SafeMultisigWallet.abi.json");
//     let keys: Option<String> = None;
//     let config = Config::from_json(
//         serde_json::from_str(
//             std::fs::read_to_string(
//                 "run_config.json"
//             ).unwrap().as_str()
//         ).expect("failed to parse json")
//     );
//     let abi = std::fs::read_to_string(abi.unwrap())
//         .map_err(|e| format!("failed to read ABI file: {}", e.to_string()))?;
//     let address = load_ton_address(address.unwrap(), &config)?;

//     let local = false;
//     let is_fee = false;
//     tonos::call_contract(
//         config,
//         address.as_str(),
//         abi,
//         "sendTransaction",
//         &params.unwrap(),
//         keys,
//         local,
//         is_fee,
//     ).await
// }

#[tokio::main]
async fn main() {
    let address = get_json_field("config.json", "address");
    let send_res = submit_transaction(
        address.as_str().unwrap(),
        "0:6f4bdf89f15df6be4204e4a9a78661ce709b750655d191a5911a2c3c6f6ece1d",
        "1000000000",
        "",
    ).await;
    println!("{}", to_string_pretty(&send_res).unwrap());
    // Contract execution was terminated with error: Contract
    // did not accept message, exit code: 100. Tip: For more
    // information about exit code check the contract source
    // code or ask the contract developer
}