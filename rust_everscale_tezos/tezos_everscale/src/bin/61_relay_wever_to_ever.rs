use lib::everscale::htlc::create_lock_with_coins;
use lib::everscale::config::*;
use lib::everscale::get::*;
use lib::everscale;
use lib::tezos;
use lib::functions::*;

async fn transaction_event(transactions: Value, ton: &Arc<ClientContext>, config: &Config) {
    let pair = transactions[2]["parameter"]["value"]["pair"]["pair"]["pair"].clone();
    // println!("{:#}", transactions[2]["parameter"]);
    let amount = transactions[2]["parameter"]["value"]["pair"]["pair"]["amount_tokens"].as_str().unwrap();
    if let (Some(dest), Some(hash)) = (pair["dest"].as_str(), pair["hash"].as_str()) {
        println!("dest: {}\nhash: {}", dest, hash);
        let payload = get_payload(
            ton.clone(),
            "HelloWallet.abi.json",
            dest,
            format!("0x{}", hash).as_str(),
        ).await.unwrap().body;
        let _ = everscale::multisig::transfer(
            ton.clone(),
            config.clone(),
            "SetcodeMultisigWallet.abi.json",
            payload,
            amount,
            ever_htlc().as_str()
        ).await;
        let transactions = create_lock_with_coins(
            ton.clone(),
            config.clone(),
            Some(ever_htlc_keypair()),
            format!("0x{}", hash).as_str(),
            dest,
        ).await;
        println!("{}\n", transactions);
    }
}

async fn listen_address(address: &str, ton: &Arc<ClientContext>, config: &Config) {
    let mut last_len = tezos::get::get_transactions(address).as_array().unwrap().len();
    loop {
        let transactions = tezos::get::get_transactions(address);
        let len = transactions.as_array().unwrap().len();
        if len > last_len {
            last_len = len;
            transaction_event(transactions, ton, config).await;
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