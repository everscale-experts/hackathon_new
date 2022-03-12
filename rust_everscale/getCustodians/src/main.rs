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

fn get_abi_header() -> Vec<String> {
    let mut res = Vec::new();
    for i in get_json_field("contract.abi.json", "header").as_array().unwrap() {
        res.push(i.as_str().unwrap().to_owned());
    };
    res
}

fn get_abi_param(value: serde_json::Value) -> AbiParam {
    AbiParam {
        name: value["name"].as_str().unwrap().to_owned(),
        param_type: value["type"].as_str().unwrap().to_owned(),
        components: if let Some(components_json) = value.get("components") {
            let mut components = Vec::new();
            for i in components_json.as_array().unwrap() {
                components.push(get_abi_param(i.clone()));
            }
            components
        } else {
            Default::default()
        }
    }
}

fn abi_function_from_json(value: serde_json::Value) -> AbiFunction {
    // let mut inputs = value["inputs"].as_array().unwrap();
    let mut inputs = Vec::new();
    for i in value["inputs"].as_array().unwrap() {
        inputs.push(get_abi_param(i.clone()));
    };
    AbiFunction{
        name: value["name"].as_str().unwrap().to_owned(),
        inputs: inputs,
        outputs: vec![
            AbiParam {
                name: "custodians".to_owned(),
                param_type: "tuple[]".to_owned(),
                components: vec![
                    AbiParam {
                        name: "index".to_owned(),
                        param_type: "uint8".to_owned(),
                        components: Default::default(),
                    },
                    AbiParam {
                        name: "pubkey".to_owned(),
                        param_type: "uint256".to_owned(),
                        components: Default::default(),
                    },
                ],
            }
        ],
        id: Default::default(),
    }
}

fn get_abi_functions() -> Vec<AbiFunction> {
    let mut res = Vec::new();
    for i in get_json_field("contract.abi.json", "functions").as_array().unwrap() {
        res.push(abi_function_from_json(i.clone()));
    };
    res
}

fn get_abi() -> Abi {
    let version = get_json_field("contract.abi.json", "ABI version")
        .as_u64()
        .unwrap() as u32;
    Abi::Contract {
        0: AbiContract {
            obsolete_abi_version: version,
            abi_version: version,
            version: None,
            header: get_abi_header(),
            functions: get_abi_functions(),
            events: vec![
                AbiEvent {
                    name: "TransferAccepted".to_owned(),
                    inputs: vec![
                        AbiParam {
                            name: "payload".to_owned(),
                            param_type: "bytes".to_owned(),
                            components: vec![],
                        },
                    ],
                    id: Default::default(),
                },
            ],
            data: vec![],
            fields: vec![],
        },
    }
}

#[tokio::main]
async fn main() {
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
            abi: get_abi(),
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