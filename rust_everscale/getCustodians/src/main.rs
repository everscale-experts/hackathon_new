use std::sync::Arc;
use ton_client::abi::ParamsOfEncodeMessage;
use ton_client::abi::AbiFunction;
use ton_client::abi::AbiContract;
use ton_client::abi::AbiParam;
use ton_client::abi::AbiEvent;
use ton_client::abi::Abi;
use ton_client::abi::CallSet;
use ton_client::abi::Signer;

fn get_json_field(file: &str, name: &str) -> serde_json::Value {
    serde_json::from_str::<serde_json::Value>(std::fs::read_to_string(file).unwrap().as_str())
        .unwrap()[name]
        .clone()
}

#[tokio::main]
async fn main() {
    let abi = Abi::Json(std::fs::read_to_string("contract.abi.json").unwrap());
    let context = Arc::new(
        ton_client::ClientContext::new(ton_client::ClientConfig {
            network: ton_client::net::NetworkConfig {
                server_address: Some(get_json_field("config.json", "endpoint").as_str().unwrap().to_owned()),
                ..Default::default()
            },
            ..Default::default()
        })
        .unwrap(),
    );
    let address = get_json_field("config.json", "address");
    let res = ton_client::abi::encode_message(
        context.clone(),
        ParamsOfEncodeMessage{
            abi: abi,
            address: Some(address.as_str().unwrap().to_owned()),
            deploy_set: None,
            call_set: Some(CallSet {
                function_name: "getCustodians".to_owned(),
                header: None,
                input: None,
            }),
            signer: Signer::None,
            processing_try_index: None,
        },
    ).await.unwrap();

    println!("{}", res.message);
}