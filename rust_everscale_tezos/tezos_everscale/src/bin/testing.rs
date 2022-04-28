use std::sync::Arc;
use lib::everscale;
use lib::everscale::config::Config;
use lib::everscale::get::{ever_htlc_keypair, get_payload};
use lib::everscale::htlc::create_lock_with_coins;

#[tokio::main]
async fn main() {
    let hash = "c39b295aef558a41ef416dcc80bc1def91857e7c16cdf4e698cc8df7cb5c6114"; // important: hash must be without "0x" prefix
    // let dest = "0:b0622d9b1ca8a47f447ce0911648afc5682f589bdee23052db2ca36b31e29d34";
    let dest = "KT1D4Ri8ntL7HLKTK63cyuV7ZAuMthzrSGJN";
    let ton = Arc::new(
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
    let config = Config::from_json(
        serde_json::from_str(
            std::fs::read_to_string(
                "./dependencies/json/run_config.json"
            ).unwrap().as_str()
        ).expect("failed to parse json")
    );

    let amount = "1000000";
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
        everscale::get::ever_htlc().as_str()
    ).await;
    println!("done\n");
}