use lib::tezos_batch::*;

#[tokio::main]
async fn main() {
    create_batch_with_coins(
        "0xc39b295aef558a41ef416dcc80bc1def91857e7c16cdf4e698cc8df7cb5c6114",
        "KT1D4Ri8ntL7HLKTK63cyuV7ZAuMthzrSGJN",
    );
}