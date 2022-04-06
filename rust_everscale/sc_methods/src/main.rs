mod functions;
use functions::*;

async fn submit_transaction(
    ton: Arc<ClientContext>,
    config: Config,
    address: &str,
    abi: String,
    keys: Option<String>,
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
            get_json_field("transaction.json", "to").as_str().unwrap(),
            get_json_field("transaction.json", "amount").as_str().unwrap(),
            get_json_field("transaction.json", "payload").as_str().unwrap(),
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

async fn get_transactions(
    ton: Arc<ClientContext>,
    config: Config,
    address: &str,
    abi: String
) -> Vec<Value> {
    if let Some(arr) = call_contract_with_client(
        ton,
        config.clone(),
        address,
        abi,
        "getTransactions",
        r#"{}"#,
        None,
        true, // true - run in tonos cli, false - call
        false,
    ).await.unwrap()["transactions"].as_array() { arr.to_owned() }
    else { vec![] }
}

#[tokio::main]
async fn main() {
    let address = get_json_field("config.json", "address");
    let config = Config::from_json(
        serde_json::from_str(
            std::fs::read_to_string(
                "run_config.json"
            ).unwrap().as_str()
        ).expect("failed to parse json")
    );
    let ton = create_client_verbose(&config).unwrap();
    let abi = std::fs::read_to_string("SafeMultisigWallet.abi.json")
        .map_err(|e| format!("failed to read ABI file: {}", e.to_string())).unwrap();
    let transactions = get_transactions(
        ton.clone(),
        config.clone(),
        address.as_str().unwrap(),
        abi.clone(),
    ).await;
    if transactions.is_empty() {
        let trans_id = submit_transaction(
            ton.clone(),
            config.clone(),
            address.as_str().unwrap(),
            abi.clone(),
            Some("wallet.scmsig1.json".to_string()),
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
                    Some(format!("wallet.scmsig{}.json", i)),
                    trans_id.to_string(),
                ).await,
            );
        }
    } else {
        for t in transactions.iter() {
            let trans_id = t["id"].as_str().unwrap();
            println!("Transaction id: {}", trans_id);
            for i in 2..4 {
                println!(
                    "{}",
                    confirm_transaction(
                        ton.clone(),
                        config.clone(),
                        address.as_str().unwrap(),
                        abi.clone(),
                        Some(format!("wallet.scmsig{}.json", i)),
                        trans_id.to_string(),
                    ).await,
                );
            }
            println!("\n\n\n****************************");
        }
    }
}