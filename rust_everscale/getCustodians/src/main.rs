use std::sync::Arc;
use ton_client::abi::ParamsOfEncodeMessage;
use ton_client::abi::AbiFunction;
use ton_client::abi::AbiContract;
use ton_client::abi::AbiParam;
use ton_client::abi::AbiEvent;
use ton_client::abi::Abi;
use ton_client::abi::DeploySet;
use ton_client::abi::CallSet;
use ton_client::abi::FunctionHeader;
use ton_client::abi::Signer;

fn get_config_field(name: &str) -> String {
    serde_json::from_str::<serde_json::Value>(std::fs::read_to_string("config.json").unwrap().as_str())
        .unwrap()[name]
        .clone()
        .as_str()
        .unwrap()
        .to_string()
}

#[tokio::main]
async fn main() {
    let context = Arc::new(
        ton_client::ClientContext::new(ton_client::ClientConfig {
            network: ton_client::net::NetworkConfig {
                //server_address: "http://localhost:80".to_owned(),
                // server_address: Some("cinet.tonlabs.io".to_owned()), // mainnet
                // server_address: Some("net.ton.dev".to_owned()),  // devnet
                server_address: Some(get_config_field("endpoint")),
                ..Default::default()
            },
            ..Default::default()
        })
        .unwrap(),
    );
    let address = get_config_field("address");
    // BOC - bag of cells
    // let boc = ton_client::net::query_collection(
    //     context.clone(),
    //     ton_client::net::ParamsOfQueryCollection {
    //         collection: "accounts".to_owned(),
    //         filter: Some(serde_json::json!({
    //             "id": {
    //                 "eq": address,
    //             }
    //         })),
    //         // result: "acc_type last_paid due_payment last_trans_lt balance data_hash code_hash library_hash boc".to_owned(),
    //         result: "boc".to_owned(),
    //         limit: None,
    //         order: None,
    //     },
    // ).await.unwrap();

    // if boc.result.is_empty() {
    //     println!("No giver found");
    //     return;
    // }

    let res = ton_client::abi::encode_message(
        context.clone(),
        ParamsOfEncodeMessage{
            abi: /* ... */,
            address: Some(address.to_owned()),
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
    // for giver in boc.result {
    //     println!("{}", giver["boc"]);
    // }
}