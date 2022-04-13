mod functions;
mod tezos_send_transaction;
mod common;
mod commands;
mod tezos_batch;
use functions::*;
use ureq::Agent;
use tezos_batch::*;
use serde_json::Value;

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
    let path = format!("https://api.hangzhounet.tzkt.io/v1/accounts/{}/operations", tezos_htlc());
    let res = agent.get(&path)
        .call()
        .unwrap()
        .into_string()
        .unwrap();
    let res_json = serde_json::from_str::<Value>(res.as_str()).unwrap();
    res_json
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

    loop {
        let res = tezos_get_transactions();
        let len = res.as_array().unwrap().len();
        if len > last_len {
            let pair = res[2]["parameter"]["value"]["pair"]["pair"]["pair"];
            if let (Some(dest), Some(hash)) = (pair["dest"].as_str(), pair["hash"].as_str()) {
                println!("dest: {}\nhash: {}", dest, hash);
            }
        }
    }
}