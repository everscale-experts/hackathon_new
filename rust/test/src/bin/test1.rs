struct TezosToolKit {
    stream: SubscribeProvider,
    options: SetProviderOptions,
    rpcClient: RpcClientInterface,
    
}

fn run() {
    let provider = "https://ithacanet.ecadinfra.com/";
    let signer = InMemorySigner::new("edskRtmEwZxRzwd1obV9pJzAoLoxXFWTSHbgqpDBRHx1Ktzo5yVuJ37e2R4nzjLnNbxFU4UiBU1iHzAy52pK5YBRpaFwLbByca");
    let tezos = TezosToolkit::new(provider);
    tezos.setSignerProvider(signer);
    println!("signer pkh:");
    println!("{}", signer.publicKeyHash().await);
    let contract = tezos.contract.at("KT1SyjphGj51CadmmbL8dmKwMA4VyMQdtkjB").await;
    println!("Printing contract methods...");
    println!("{}", contract.methods);
    println!("Showing initial storage...");
    println!("{}", contract.storage().await);
    let op = contract.methods.mint("tz1bwsEWCwSEXdRvnJxvegQZKeX5dj6oKEys", 100).send().await;
    println!("Awaiting confirmation...");
    op.confirmation().await;
    println!("{}", op.hash, op.includedInBlock);
    println!("Showing final storage...");
    println!("{}", contract.storage().await)
}

fn main() {

}