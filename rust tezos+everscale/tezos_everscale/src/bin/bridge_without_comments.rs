mod tezos_send_transaction;
use lib::functions::*;
use ureq::Agent;
use std::sync::Arc;
use std::fs;
use serde_json::Value;
use tezos_send_transaction::transfer as tezos_transfer;

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

async fn everscale_transaction34(amount: &str, ton: &Arc<ClientContext>, config: Config) { // from third account to fourth
    let ever_accs = get_json_field("./dependencies/json/everscale_accounts.json", None, None);
    let address = ever_accs[2]["address"].clone();
    let abi = std::fs::read_to_string("./dependencies/json/SetcodeMultisigWallet.abi.json")
        .map_err(|e| format!("failed to read ABI file: {}", e.to_string())).unwrap();
    let trans_id = submit_transaction(
        ton.clone(),
        config.clone(),
        address.as_str().unwrap(),
        abi.as_str(),
        Some("./dependencies/json/wallet3.scmsig1.json".to_string()),
        "".to_string(),
        amount,
        ever_accs[3]["address"].as_str().unwrap()
    ).await;
    println!("Transaction created with id: {}", trans_id);
    for i in 2..4 {
        println!(
            "{}",
            confirm_transaction(
                ton.clone(),
                config.clone(),
                address.as_str().unwrap(),
                abi.as_str(),
                Some(format!("./dependencies/json/wallet3.scmsig{}.json", i)),
                trans_id.to_string(),
            ).await,
        );
    }
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

    // subscribe for all transactions in everscale (new thread)
    ton_client::net::subscribe_collection(
        context.clone(),
        ton_client::net::ParamsOfSubscribeCollection {
            collection: "transactions".to_owned(),
            filter: None,
            result: "id in_message {value} account_addr".to_owned(),
        },
        |result| async {
            match result {
                Ok(result) => {
                    if let Some(address) = result.result["account_addr"].as_str() {
                        if let Some(v) = result.result["in_message"]["value"].as_str() {
                            if address == get_json_field("./dependencies/json/everscale_accounts.json", None, None)[1]["address"]
                                .as_str().unwrap().to_owned() {
                                let v_u64 = hex_to_dec(v);
                                println!("{}", v_u64);
                                let sender = get_json_field("./dependencies/json/tezos_accounts.json", None, Some(2));
                                let receiver = get_json_field("./dependencies/json/tezos_accounts.json", None, Some(3));
                                tezos_transfer(
                                    sender["address"].as_str().unwrap(),
                                    receiver["address"].as_str().unwrap(),
                                    sender["public"].as_str().unwrap(),
                                    sender["secret"].as_str().unwrap(),
                                    format!("{}", v_u64 as f64 / 1000000000.0).as_str(),
                                );
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
            println!("{:#}", res[0]["amount"]); // nanoXTZ
            everscale_transaction34((res[0]["amount"].as_i64().unwrap() * 1000).to_string().as_str(), &ton, config.clone()).await;
            last_len = len;
        }
    }
}