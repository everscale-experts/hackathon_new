mod functions;
mod tezos_send_transaction;
mod common;
mod commands;
mod tezos_batch;
use functions::*;
use tezos_batch::create_batch;
use ureq::Agent;
use std::fs;
use serde_json::Value;
use tezos_send_transaction::transfer as tezos_transfer;

async fn submit_transaction(
    ton: Arc<ClientContext>,
    config: Config,
    address: &str,
    abi: String,
    keys: Option<String>,
    amount: &str,
    receiver: String,
) -> String {
    call_contract_with_client(
        ton,
        config.clone(),
        address,
        abi,
        "submitTransaction",
        format!(
            r#"{{
                "dest": "{}",
                "value": "{}",
                "bounce": "false",
                "allBalance": "false",
                "payload": "{}"
            }}"#,
            receiver,
            amount,
            "",
        ).as_str(),
        keys,
        false, // true - run in tonos cli, false - call
        false,
    ).await.unwrap()["transId"].as_str().unwrap().to_string()
}

async fn confirm_transaction(
    ton: Arc<ClientContext>,
    config: Config,
    address: &str,
    abi: String,
    keys: Option<String>,
    trans_id: String,
) -> String {
    let res = call_contract_with_client(
        ton,
        config.clone(),
        address,
        abi,
        "confirmTransaction",
        format!(
            r#"{{
                "transactionId": {}
            }}"#,
            trans_id,
        ).as_str(),
        keys,
        false,
        false,
    ).await;
    if res.is_ok() { "Ok, signed".to_string() }
    else { "Error, already signed".to_string() }
}

fn tezos_get_transactions() -> Value {
    let agent = Agent::new();
    let path = format!("https://api.hangzhounet.tzkt.io/v1/accounts/{}/operations", serde_json::from_str::<Value>(fs::read_to_string(PATH)
        .unwrap()
        .as_str())
        .unwrap()[1]["address"]
        .as_str()
        .unwrap()
    );

    let res = agent.get(&path)
        .call()
        .unwrap()
        .into_string()
        .unwrap();
    let res_json = serde_json::from_str::<Value>(res.as_str()).unwrap();
    res_json
}

const PATH: &str = "./dependencies/json/tezos_accounts.json";

async fn everscale_transaction(amount: &str, ton: &Arc<ClientContext>, config: Config, receiver: String) {
    let ever_accs = get_json_field("./dependencies/json/everscale_accounts.json", None, None);
    let address = ever_accs[2]["address"].clone();
    let abi = std::fs::read_to_string("./dependencies/json/SetcodeMultisigWallet.abi.json")
        .map_err(|e| format!("failed to read ABI file: {}", e.to_string())).unwrap();
    let trans_id = submit_transaction(
        ton.clone(),
        config.clone(),
        address.as_str().unwrap(),
        abi.clone(),
        Some("./dependencies/json/wallet3.scmsig1.json".to_string()),
        amount,
        receiver,
    ).await;
    println!("Transaction created with id: {}", trans_id);
    for i in 2..4 {
        println!(
            "{}",
            confirm_transaction(
                ton.clone(),
                config.clone(),
                address.as_str().unwrap(),
                abi.clone(),
                Some(format!("./dependencies/json/wallet3.scmsig{}.json", i)),
                trans_id.to_string(),
            ).await,
        );
    }
}

fn check_batch(hash: String) -> (bool, Value) {
    let agent = Agent::new();
    let path = format!("https://api.hangzhou.tzstats.com/explorer/op/{}", hash);
    let res = agent.get(&path)
        .call()
        .unwrap()
        .into_string()
        .unwrap();
    let res_json = serde_json::from_str::<Value>(res.as_str()).unwrap();
    (
        res_json[0]["is_batch"].as_bool().unwrap_or(false),
        res_json,
    )
}

fn tezos_parse_comment(batch: Value) -> Option<String> {
    if let Some(transactions) = batch.as_array() {
        for t in transactions {
            if let Some(ever_receiver) = t["parameters"]["value"]["default"]["3"].as_str() {
                return Some(ever_receiver.to_owned());
            }
        }
    }
    None
}

#[tokio::main]
async fn main() {
    let config = Config::from_json(
        serde_json::from_str(
            std::fs::read_to_string(
                "./dependencies/json/run_config.json"
            ).unwrap().as_str()
        ).expect("failed to parse json")
    );
    let ton = create_client_verbose(&config).unwrap();
    let mut last_len = tezos_get_transactions().as_array().unwrap().len();
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
                                // let sender = get_json_field("./dependencies/json/tezos_accounts.json", None, Some(2));
                                // let receiver = get_json_field("./dependencies/json/tezos_accounts.json", None, Some(3));
                                println!("destination: {}", pair["dest"].as_str().unwrap());
                                println!("hash: {}", pair["hash"].as_str().unwrap());
                                // tezos_transfer(
                                //     sender["address"].as_str().unwrap(),
                                //     std::str::from_utf8(
                                //         hex::decode(
                                //             address_hex["comment"]
                                //                 .as_str()
                                //                 .unwrap()
                                //         ).unwrap()
                                //         .as_ref()
                                //     ).unwrap(),
                                //     sender["public"].as_str().unwrap(),
                                //     sender["secret"].as_str().unwrap(),
                                //     format!("{}", v_u64 as f64 / 1000000000.0).as_str(),
                                // );
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

    loop {
        let res = tezos_get_transactions();
        let len = res.as_array().unwrap().len();
        if len > last_len {
            let (is_batch, group) = check_batch(res[0]["hash"].as_str().unwrap().to_string());
            if is_batch {
                if let Some(ever_receiver) = tezos_parse_comment(group.clone()) {
                    println!("{}", ever_receiver);
                    let amount = res[0]["amount"].as_i64().unwrap();
                    everscale_transaction((amount.max(1000) * 1000).to_string().as_str(), &ton, config.clone(), ever_receiver).await;
                }
            }
            last_len = len;
        }
    }
}