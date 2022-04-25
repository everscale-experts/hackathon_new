use lib::everscale::htlc::create_lock_with_tokens;
use lib::everscale::multisig::confirm_transaction;
use lib::everscale::multisig::submit_transaction;
use lib::everscale::config::*;
use lib::everscale::get::*;
use serde_json::Value;
use lib::functions::*;
use ureq::Agent;

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

async fn ever_msig_to_htlc(
    ton: Arc<ClientContext>,
    config: Config,
    abi: &str,
    payload: String,
    amount: &str,
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
            ever_htlc().as_str(),
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
    loop {
        let res = tezos_get_transactions();
        let len = res.as_array().unwrap().len();
        if len > last_len {
            last_len = len;
            let pair = res[2]["parameter"]["value"]["pair"]["pair"]["pair"].clone();
            // println!("{:#}", res[2]["parameter"]);
            let amount = res[2]["parameter"]["value"]["pair"]["pair"]["amount_tokens"].as_str().unwrap();
            if let (Some(dest), Some(hash)) = (pair["dest"].as_str(), pair["hash"].as_str()) {
                println!("dest: {}\nhash: {}", dest, hash);
                let payload = get_payload(
                    ton.clone(),
                    "HelloWallet.abi.json",
                    dest,
                    format!("0x{}", hash).as_str(),
                ).await.unwrap().body;
                let _ = ever_msig_to_htlc(
                    ton.clone(),
                    config.clone(),
                    "SetcodeMultisigWallet.abi.json",
                    payload,
                    amount,
                );
                let res = create_lock_with_tokens(
                    ton.clone(),
                    config.clone(),
                    Some(ever_htlc_keypair()),
                    format!("0x{}", hash),
                ).await;
                println!("{}\n", res);
            }
        }
    }
}