use lib::everscale::contract::load_abi_json;
use lib::everscale::get::ever_htlc;
use lib::everscale::message::{decode_msg_body_by_id, get_msg_by_id};
use lib::tezos::operation::await_confirmation;
use lib::tezos_batch::create_batch;
use lib::functions::*;
use ton_client::error::ClientError;
use ton_client::net::ResultOfSubscribeCollection;
use std::sync::Arc;

async fn transaction_event(ton: Arc<ClientContext>, msg_id: &str, amount_hex: &str) {
    println!("Message catched. ID: {:#}", msg_id);
    let payload = decode_msg_body_by_id(
        (&ton).clone(),
        msg_id,
        // "388d0d91d23f4dbc97d277496cc0cd70219e646ae18a6c8e38d1ab7a9ce780e8",
        load_abi_json("./dependencies/json/transfer.abi.json").unwrap(),
    ).await;
    let amount_u64 = hex_to_dec(amount_hex);
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
    let op_hash = create_batch(pair["hash"].as_str().unwrap(), pair["dest"].as_str().unwrap());
    println!("{}", if await_confirmation(&op_hash) { "Applied" } else { "Failed" });
    println!("Done");
}

fn get_context() -> Arc<ClientContext> {
    Arc::new(
        ton_client::ClientContext::new(ton_client::ClientConfig {
            network: ton_client::net::NetworkConfig {
                // server_address: Some("cinet.tonlabs.io".to_owned()), // mainnet
                server_address: Some("net.ton.dev".to_string()), // devnet
                ..Default::default()
            },
            ..Default::default()
        }).unwrap(),
    )
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
    // let ton = get_context();
    // if let Some(msg_id) = Some("baeb8f610c31b20f5f2368528190383a1daa5f3abba3c6cf9e5406e0eec5ff3f") {
    //     println!("{}", msg_id);
    //     let msg = get_msg_by_id(ton.clone(), msg_id).await;
    //     println!("{:#}", msg);
    //     if let (Some(address), Some(amount_hex)) = (msg["dst"].as_str(), msg["value"].as_str()) {
    //         if address == &ever_htlc() {
    //             // transaction_event(ton.clone(), result.result.clone(), amount_hex).await;
    //         }
    //     }
    // }

    let _ = ton_client::net::subscribe_collection(
        context.clone(),
        ton_client::net::ParamsOfSubscribeCollection {
            collection: "transactions".to_owned(),
            filter: None,
            result: "id account_addr in_msg".to_owned(),
        },
        |result| async {
            match result {
                Ok(result) => {
                    let ton = get_context();
                    if let Some(address) = result.result["account_addr"].as_str() {
                        if let Some(msg_id) = result.result["in_msg"].as_str() {
                            let msg = get_msg_by_id(ton.clone(), msg_id).await;
                            // println!("{}", msg);
                            if let Some(amount_hex) = msg["value"].as_str() {
                                if address == &ever_htlc() {
                                    transaction_event(ton.clone(), msg_id, amount_hex).await;
                                }
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