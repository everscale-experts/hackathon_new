mod tonos;
use chrono::Local;
use chrono::TimeZone;
use ton_client::ClientContext;
use ton_client::abi::Abi;
use ton_client::abi::FunctionHeader;
use ton_client::abi::ResultOfEncodeMessage;
use ton_client::abi::encode_message;
use ton_client::crypto::KeyPair;
use tonos::process_message;
use ton_client::tvm::ParamsOfRunTvm;
use ton_client::tvm::run_tvm;
use tonos::Config;
use tonos::TonClient;
use tonos::create_client_verbose;
use tonos::load_abi;
use tonos::load_ton_address;
use serde_json::Value;
use serde_json::to_string_pretty;
use tonos::now;
use tonos::now_ms;
use tonos::prepare_execution_options;
use tonos::prepare_message_params;
use tonos::query_account_field;

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
    // let address = matches.value_of("ADDRESS");
    // let method = matches.value_of("METHOD");
    // let params = matches.value_of("PARAMS");
    // let lifetime = matches.value_of("LIFETIME");
    // let raw = matches.is_present("RAW");
    // let output = matches.value_of("OUTPUT");

    // let abi = Some(abi_from_matches_or_config(matches, &config)?);

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

async fn call_contract_with_result(
    conf: Config,
    addr: &str,
    abi: String,
    method: &str,
    params: &str,
    keys: Option<String>,
    local: bool,
    is_fee: bool,
) -> Result<serde_json::Value, String> {
    let ton = create_client_verbose(&conf)?;
    tonos::call_contract_with_client(ton, conf, addr, abi, method, params, keys, local, is_fee).await
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
    let abi = std::fs::read_to_string("SafeMultisigWallet.abi.json")
        .map_err(|e| format!("failed to read ABI file: {}", e.to_string())).unwrap();
    // let send_res = call_command(
    //     ton,
    //     config.clone(),
    //     address.as_str().unwrap(),
    //     "SafeMultisigWallet.abi.json".to_owned(),
    //     "submitTransaction",
    //     r#"{
    //         "dest":"0:6f4bdf89f15df6be4204e4a9a78661ce709b750655d191a5911a2c3c6f6ece1d",
    //         "value":"1000000000",
    //         "bounce":"false",
    //         "allBalance":"false",
    //         "payload":""
    //     }"#,
    //     Some(format!("wallet.scmsig{}.json", std::fs::read_to_string("src/bin/nope.txt").unwrap())),
    // ).await;
    for i in 1..4 {
        let send_res = call_command(
            ton.clone(),
            config.clone(),
            address.as_str().unwrap(),
            "SafeMultisigWallet.abi.json".to_owned(),
            "confirmTransaction",
            r#"{
                "transactionId": "7078339917191664385"
            }"#,
            Some(format!("wallet.scmsig{}.json", i)),
        ).await;
        println!("{}", to_string_pretty(&send_res).unwrap());
    }
}