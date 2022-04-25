use ton_client::ClientContext;
use std::sync::Arc;
use super::contract::call_contract_with_client;
use super::config::Config;
use super::get::*;

pub async fn confirm_transaction(
    ton: Arc<ClientContext>,
    config: Config,
    address: &str,
    abi: &str,
    keys: Option<String>,
    trans_id: String,
) -> String {
    let res = call_contract_with_client(
        ton,
        config.clone(),
        address,
        abi.to_string(),
        "confirmTransaction",
        serde_json::json!({
            "transactionId": trans_id,
        }),
        keys,
        false,
        false,
    ).await;
    if res.is_ok() { "Ok, signed".to_string() }
    else { "Error, already signed".to_string() }
}

pub async fn submit_transaction(
    ton: Arc<ClientContext>,
    config: Config,
    address: &str,
    abi: &str,
    keys: Option<String>,
    payload: String,
    amount: &str,
    receiver: &str
) -> String {
    call_contract_with_client(
        ton.clone(),
        config.clone(),
        address,
        abi.to_string(),
        "submitTransaction",
        serde_json::from_str(format!(
            r#"{{
                "dest": "{}",
                "value": "{}",
                "bounce": "false",
                "allBalance": "false",
                "payload": "{}"
            }}"#,
            // get_json_field("transaction.json", Some("to"), None).as_str().unwrap(),
            // ever_htlc(),
            receiver,
            // get_json_field("transaction.json", Some("amount"), None).as_str().unwrap(),
            amount,
            // get_payload(
            //     ton,
            //     "HelloWallet.abi.json",
            //     get_json_field("transaction.json", Some("payload"), None).as_str().unwrap(),
            // ).await.unwrap().body,
            payload,
            // ""
        ).as_str()).unwrap(),
        keys,
        false, // true - run in tonos cli, false - call
        false,
    ).await.unwrap()["transId"].as_str().unwrap().to_string()
}

pub async fn transfer( // using submit_transaction
    ton: Arc<ClientContext>,
    config: Config,
    abi: &str,
    payload: String,
    amount: &str,
    receiver: &str,
) {
    let address = ever_multisig();
    let transactions = ever_get_transactions(
        ton.clone(),
        config.clone(),
        ever_multisig().as_str(),
        abi,
    ).await;

    if transactions.is_empty() {
        let trans_id = submit_transaction(
            ton.clone(),
            config.clone(),
            address.as_str(),
            abi,
            Some(ever_msig_keypair(0)),
            payload,
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
                    address.as_str(),
                    abi,
                    Some(ever_msig_keypair(i)),
                    trans_id.to_string(),
                ).await,
            );
        }
    }
}