use lib::everscale::config::*;
use lib::everscale::get::*;
use lib::everscale;
use lib::everscale::htlc::create_lock_with_tokens;
use lib::tezos;
use lib::functions::*;

async fn transaction_event(
    dest: Option<String>,
    hash: Option<String>,
    ton: &Arc<ClientContext>,
    config: &Config
) {
    let amount = "1000000";
    if let (Some(dest), Some(hash)) = (dest, hash) {
        println!("dest: {}\nhash: {}", dest, hash);
        let payload = get_payload(
            ton.clone(),
            "transfer.abi.json",
            &dest,
            format!("0x{}", hash).as_str(),
        ).await.unwrap().body;
        println!("Sending money from multisig...");
        let _ = everscale::multisig::transfer(
            ton.clone(),
            config.clone(),
            "SetcodeMultisigWallet.abi.json",
            payload,
            amount,
            ever_htlc().as_str()
        ).await;
        println!("done\n");
        println!("Calling createLockWithTokens... ");
        let transactions = create_lock_with_tokens(
            ton.clone(),
            config.clone(),
            Some(ever_htlc_keypair()),
            format!("0x{}", hash),
            // &dest,
        ).await;
        println!("done\n");
        println!("{}\n", transactions);
    } else {
        println!("Getting (dest, hash) failed\n");
        // println!("Parsing (dest, hash) failed. Transactions: {:#}\n", group);
    }
}

fn parse_receiver(transactions: Value) -> Option<String> {
    for i in 0..transactions.as_array().unwrap().len() {
        let parameters: Value = transactions[i]["parameters"].clone();
        match parameters["entrypoint"].as_str() {
            Some("default") => {
                return parameters["value"]["default"]["3"].as_str().map(str::to_string);
            },
            _ => {}
        }
    }
    None
}

fn parse_lock_hash_without_prefix(transactions: Value) -> Option<String> {
    for i in 0..transactions.as_array().unwrap().len() {
        let parameters: Value = transactions[i]["parameters"].clone();
        match parameters["entrypoint"].as_str() {
            Some("createLock") => {
                return parameters["value"]["createLock"]["pair"]["pair"]["pair"]["hash"].as_str().map(str::to_string);
            },
            _ => {}
        }
    }
    None
}

async fn listen_address(address: &str, ton: &Arc<ClientContext>, config: &Config) {
    let mut last_len = tezos::get::get_transactions(address).as_array().unwrap().len();
    loop {
        let transactions = tezos::get::get_transactions(address);
        let len = transactions.as_array().unwrap().len();
        if len > last_len {
            last_len = len;
            let hash = transactions[0]["hash"].as_str().unwrap();
            let (is_batch, group) = tezos::get::get_batch_by_hash(hash.to_string());
            if is_batch {
                println!("Batch catched. Hash: {}", hash);
                let dest = parse_receiver(group.clone());
                println!("Destination: {}", dest.clone().unwrap_or("not found".to_string()));
                let hash = parse_lock_hash_without_prefix(group.clone());
                println!("Hash: 0x{}", hash.clone().unwrap_or("not found".to_string()));
                transaction_event(dest, hash, ton, config).await;
            } else {
                println!("Transcaction catched");
            }
        }
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
    listen_address(
        tezos_htlc().as_str(),
        &ton,
        &config,
    ).await;
    loop {}
}