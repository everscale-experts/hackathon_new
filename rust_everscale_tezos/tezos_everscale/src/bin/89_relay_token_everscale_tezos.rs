use lib::everscale::contract::load_abi_json;
use lib::everscale::get::ever_htlc;
use lib::everscale::message::decode_msg_body_by_id;
use lib::tezos_batch::create_batch;
use lib::functions::*;
use ton_client::error::ClientError;
use ton_client::net::ResultOfSubscribeCollection;
use std::sync::Arc;

async fn transaction_event(result: Value, amount: &str) {
    println!("Message catched. Result: {:#}", result);
    let ton = Arc::new(
        ton_client::ClientContext::new(ton_client::ClientConfig {
            network: ton_client::net::NetworkConfig {
                // server_address: Some("cinet.tonlabs.io".to_owned()), // mainnet
                server_address: Some("net.ton.dev".to_string()), // devnet
                ..Default::default()
            },
            ..Default::default()
        }).unwrap(),
    );
    let payload = decode_msg_body_by_id(
        (&ton).clone(),
        result["in_msg"].as_str().unwrap(),
        // "388d0d91d23f4dbc97d277496cc0cd70219e646ae18a6c8e38d1ab7a9ce780e8",
        load_abi_json("./dependencies/json/transfer.abi.json").unwrap(),
    ).await;
    let amount_u64 = hex_to_dec(amount);
    println!("Amount: {}", amount_u64);
    println!("Payload: {:#}", payload);
    let pair: Value = serde_json::from_slice(
        hex::decode(
            payload["comment"]
                .as_str()
                .unwrap()
        ).unwrap().as_ref()
    ).unwrap();
    println!("Decoded payload: {:#}", pair);
    create_batch(pair["hash"].as_str().unwrap(), pair["dest"].as_str().unwrap());
    println!("Done");
}

#[tokio::main]
async fn main() {
    let context = Arc::new(
        ton_client::ClientContext::new(ton_client::ClientConfig {
            network: ton_client::net::NetworkConfig {
                // server_address: Some("cinet.tonlabs.io".to_owned()), // mainnet
                server_address: Some("net.ton.dev".to_string()), // devnet
                ..Default::default()
            },
            ..Default::default()
        })
        .unwrap(),
    );

    let _ = ton_client::net::subscribe_collection(
        context.clone(),
        ton_client::net::ParamsOfSubscribeCollection {
            collection: "transactions".to_owned(),
            filter: None,
            result: "id account_addr in_msg in_message { value msg_type_name } balance_delta ".to_owned(),
        },
        |result| async {
            match result {
                Ok(result) => {
                    if let Some(address) = result.result["account_addr"].as_str() {
                        // if let Some(amount) = result.result["in_message"]["value"].as_str() {
                        if let Some(amount) = result.result["balance_delta"].as_str() {
                            if address == &ever_htlc() && amount.starts_with("0x") {
                                transaction_event(result.result.clone(), amount).await;
                            }
                        }
                    }
                }
                Err(err) => {
                    println!("(Everscale listener) Error: {}", err);
                }
            }
        },
    ).await.unwrap();
    loop {}
}