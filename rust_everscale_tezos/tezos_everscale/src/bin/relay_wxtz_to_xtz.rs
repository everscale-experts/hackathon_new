use lib::functions::*;
use lib::tezos_batch::create_batch_with_coins;
use lib::tezos_batch::create_batch;
use std::sync::Arc;

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

    // create_batch_with_coins("0xc39b295aef558a41ef416dcc80bc1def91857e7c16cdf4e698cc8df7cb5c6114", "KT1D4Ri8ntL7HLKTK63cyuV7ZAuMthzrSGJN");

    ton_client::net::subscribe_collection(
        context.clone(),
        ton_client::net::ParamsOfSubscribeCollection {
            collection: "transactions".to_owned(),
            filter: None,
            result: "id account_addr in_msg in_message { value }".to_owned(),
        },
        |result| async {
            match result {
                Ok(result) => {
                    if let Some(address) = result.result["account_addr"].as_str() {
                        if let Some(v) = result.result["in_message"]["value"].as_str() {
                            if address == get_json_field("./dependencies/json/config.json", Some("htlc1"), None)
                                .as_str().unwrap().to_owned() {
                                println!("{:#}", result.result);
                                let ton1 = Arc::new(
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
                                let pair = decode_msg_body_by_id(
                                    Arc::clone(&ton1),
                                    result.result["in_msg"].as_str().unwrap(),
                                    // "388d0d91d23f4dbc97d277496cc0cd70219e646ae18a6c8e38d1ab7a9ce780e8",
                                    load_abi_json("./dependencies/json/HelloWallet.abi.json").unwrap(),
                                ).await;
                                let v_u64 = hex_to_dec(v);
                                println!("Amount: {}", v_u64);
                                println!("destination: {}", pair["dest"].as_str().unwrap());
                                println!("hash: {}", pair["hash"].as_str().unwrap());
                                create_batch(pair["hash"].as_str().unwrap(), pair["dest"].as_str().unwrap());
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