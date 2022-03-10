use std::sync::Arc;

fn get_config_field(name: &str) -> serde_json::Value {
    serde_json::from_str::<serde_json::Value>(std::fs::read_to_string("config.json").unwrap().as_str())
        .unwrap()[name].clone()
}

#[tokio::main]
async fn main() {
    let context = Arc::new(
        ton_client::ClientContext::new(ton_client::ClientConfig {
            network: ton_client::net::NetworkConfig {
                //server_address: "http://localhost:80".to_owned(),
                // server_address: Some("cinet.tonlabs.io".to_owned()), // mainnet
                // server_address: Some("net.ton.dev".to_owned()),  // devnet
                server_address: Some(get_config_field("endpoint").as_str().unwrap().to_string()),
                ..Default::default()
            },
            ..Default::default()
        })
        .unwrap(),
    );

    let giver_balance = ton_client::net::query_collection(
        context.clone(),
        ton_client::net::ParamsOfQueryCollection {
            collection: "accounts".to_owned(),
            filter: Some(serde_json::json!({
                "id": {
                    // "eq": "0:841288ed3b55d9cdafa806807f02a0ae0c169aa5edfe88a789a6482429756a94",
                    "eq": get_config_field("address").as_str().unwrap(),
                }
            })),
            // result: "acc_type last_paid due_payment last_trans_lt balance data_hash code_hash library_hash boc".to_owned(),
            result: "balance".to_owned(),
            limit: None,
            order: None,
        },
    ).await.unwrap();

    // let balance = ton_client::net::query(
    //     context.clone(),
    //     ton_client::net::ParamsOfQuery {
    //         query: "accounts".to_owned(),
    //         variables: Some(serde_json::json!({

    //         }))
    //     },
    // ).await.unwrap();

    // println!("{}", balance.result);

    if giver_balance.result.is_empty() {
        println!("No giver found");
        return;
    }

    for giver in giver_balance.result {
        // println!("{}: {}", giver["id"], giver["balance"]);
        println!("{}", giver["balance"]);
    }

    // transaction subscription

    // let subscription = ton_client::net::subscribe_collection(
    //     context.clone(),
    //     ton_client::net::ParamsOfSubscribeCollection {
    //         collection: "transactions".to_owned(),
    //         filter: None,
    //         result: "id account_addr".to_owned(),
    //     },
    //     |result| async {
    //         match result {
    //             Ok(result) => {
    //                 println!("Received:");
    //                 println!("{}", result.result);
    //             }
    //             Err(err) => {
    //                 println!("Error:");
    //                 println!("{}", err);
    //             }
    //         }
    //     },
    // )
    // .await
    // .unwrap();

    // std::thread::sleep(std::time::Duration::from_secs(5));

    // ton_client::net::unsubscribe(context.clone(), subscription)
    //     .await
    //     .unwrap();
}