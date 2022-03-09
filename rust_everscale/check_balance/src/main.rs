use std::sync::Arc;

#[tokio::main]
async fn main() {
    let context = Arc::new(
        ton_client::ClientContext::new(ton_client::ClientConfig {
            network: ton_client::net::NetworkConfig {
                //server_address: "http://localhost:80".to_owned(),
                server_address: Some("cinet.tonlabs.io".to_owned()),
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
                    "in": [
                        "0:841288ed3b55d9cdafa806807f02a0ae0c169aa5edfe88a789a6482429756a94",
                        "0:2bb4a0e8391e7ea8877f4825064924bd41ce110fce97e939d3323999e1efbb13",
                        "0:5b168970a9c63dd5c42a6afbcf706ef652476bb8960a22e1d8a2ad148e60c0ea",
                        "0:b5e9240fc2d2f1ff8cbb1d1dee7fb7cae155e5f6320e585fcc685698994a19a5",
                    ]
                }
            })),
            result: "id balance".to_owned(),
            limit: None,
            order: None,
        },
    )
    .await
    .unwrap();

    if giver_balance.result.is_empty() {
        println!("No giver found");
        return;
    }

    println!("Givers balance");
    for giver in giver_balance.result {
        // println!("{}: {}", giver["id"], giver["balance"]);
        println!("{}", giver);
    }

    // transaction subscription

    let subscription = ton_client::net::subscribe_collection(
        context.clone(),
        ton_client::net::ParamsOfSubscribeCollection {
            collection: "transactions".to_owned(),
            filter: None,
            result: "id account_addr".to_owned(),
        },
        |result| async {
            match result {
                Ok(result) => {
                    println!("Received:");
                    println!("{}", result.result);
                }
                Err(err) => {
                    println!("Error:");
                    println!("{}", err);
                }
            }
        },
    )
    .await
    .unwrap();

    std::thread::sleep(std::time::Duration::from_secs(5));

    ton_client::net::unsubscribe(context.clone(), subscription)
        .await
        .unwrap();
}