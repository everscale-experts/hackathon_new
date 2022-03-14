mod tonos;
use clap::ArgMatches;
use tonos::Config;
use tonos::load_ton_address;
use tonos::run_local_for_account;
use std::sync::Arc;
use ton_client::abi::ParamsOfEncodeMessage;
use ton_client::abi::ParamsOfDecodeMessage;
use ton_client::abi::Abi;
use ton_client::abi::CallSet;
use ton_client::abi::Signer;
use ton_client::abi::MessageBodyType;
use ton_client::processing::ParamsOfSendMessage;
use ton_client::processing::ProcessingEvent;
use std::ffi::OsString;
use std::os::unix::ffi::{OsStrExt, OsStringExt};

fn get_json_field(file: &str, name: &str) -> serde_json::Value {
    serde_json::from_str::<serde_json::Value>(std::fs::read_to_string(file).unwrap().as_str())
        .unwrap()[name]
        .clone()
}

async fn get_costodians(config: Config) -> Result<(), String> {
    let address = Some("0:f17d533a33604cbfd106fd367830ee705d4afeee95682bc836e4847a89e807d5");
    let method = Some("getCustodians");
    let params = Some("{}");

    let abi = Some("contract.abi.json");

    let keys: Option<String> = None;

    // let params = Some(load_params(params.unwrap())?);
    // if !config.is_json {
    //     print_args!(address, method, params, abi, keys, lifetime, output);
    // }

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
    // let abi = Abi::Json(std::fs::read_to_string("contract.abi.json").unwrap());
    // let context = Arc::new(
    //     ton_client::ClientContext::new(ton_client::ClientConfig {
    //         network: ton_client::net::NetworkConfig {
    //             server_address: Some(get_json_field("config.json", "endpoint").as_str().unwrap().to_owned()),
    //             ..Default::default()
    //         },
    //         ..Default::default()
    //     })
    //     .unwrap(),
    // );
    // let address = get_json_field("config.json", "address");
    let res = get_costodians(
        Config::new(),
    ).await;
    println!(
        "Result: {}",
        serde_json::to_string_pretty(&res)
            .map_err(|e| format!("failed to serialize result: {}", e))
            .unwrap());
    // let encoded = ton_client::abi::encode_message(
    //     context.clone(),
    //     ParamsOfEncodeMessage{
    //         abi: abi.clone(),
    //         address: Some(address.as_str().unwrap().to_owned()),
    //         deploy_set: None,
    //         call_set: Some(CallSet {
    //             function_name: "getCustodians".to_owned(),
    //             header: None,
    //             input: None,
    //         }),
    //         signer: Signer::None,
    //         processing_try_index: None,
    //     },
    // ).await.unwrap();

    // println!("encoded message: {}", encoded.message);

    // let decoded = ton_client::abi::decode_message(context, ParamsOfDecodeMessage {
    //     abi: abi,
    //     message: encoded.message,
    // }).await.unwrap();
    // println!("type: {}", match decoded.body_type {
    //     MessageBodyType::Event => "event",
    //     MessageBodyType::Input => "input",
    //     MessageBodyType::InternalOutput => "internal output",
    //     MessageBodyType::Output => "output",
    // });
    // println!("name: {}", decoded.name);
    // println!("value: {:#}", decoded.value.unwrap());
    // println!("header expire: {}", decoded.header.clone().unwrap().expire.unwrap());
    // println!("header time: {}", decoded.header.clone().unwrap().time.unwrap());
    // println!("header public key: {}", decoded.header.unwrap().pubkey.unwrap_or("None".to_owned()));
}