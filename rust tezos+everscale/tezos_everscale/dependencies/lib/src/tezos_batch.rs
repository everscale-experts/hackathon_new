use super::common::operation_command::exit_with_error_no_wallet_type_selected;
use hex::FromHex;
use super::api::RunOperationError;
use super::signer::OperationSignatureInfo;
use super::PrivateKey;
use super::PublicKey;
use super::functions::get_json_field;
use super::common::operation_command::LocalWalletState;

type Error = Box<dyn std::error::Error>;
const BASE_FEE: u64 = 100;
const MIN_NTEZ_PER_GAS: u64 = 100;
const MIN_NTEZ_PER_BYTE: u64 = 1000;
const CONFIG: &str = "./dependencies/json/config.json";
const AWAIT_TIMEOUT: u128 = 120000; // ms
const RPC: &str = "https://hangzhounet.api.tez.ie";
const ENDPOINT: &str = "https://api.hangzhounet.tzkt.io";

struct OperationResult {
    consumed_gas: String,
    storage_size: String,
    used_storage: String,
}

fn get_block_hash() -> String {
    let agent = ureq::Agent::new();
    let value = agent.get(format!("{}/chains/main/blocks/head/hash", RPC).as_str())
        .call().unwrap()
        .into_json().unwrap();
    // println!("Block hash: {}", value);
    value
}

fn get_address_counter(address: String) -> u64 {
    let agent = ureq::Agent::new();
    // println!("{}/v1/accounts/{}/counter", endpoint, address);
    agent.get(format!("{}/v1/accounts/{}/counter", ENDPOINT, address).as_str())
        .call().unwrap()
        .into_json().unwrap()
}

fn get_value(
    contract: &str,
    entrypoint: &str,
    parameters: ureq::SerdeValue,
) -> Result<serde_json::Value, Error> {
    let agent = ureq::Agent::new();
    // println!("Building... {}/v1/contracts/{}/entrypoints/{}/build", endpoint, contract, entrypoint);
    // println!("Parameters: {:#}", parameters);
    let res = agent.post(format!("{}/v1/contracts/{}/entrypoints/{}/build", ENDPOINT, contract, entrypoint).as_str())
        .send_json(parameters.clone()).unwrap();
    Ok(res.into_json().unwrap_or(parameters))
}

fn get_chain_id() -> String {
    let agent = ureq::Agent::new();
    agent.get(format!("{}/chains/main/chain_id", RPC).as_str())
        .call().unwrap()
        .into_json().unwrap()
}

fn run_operation(
    branch: &str,
    operations: serde_json::Value,
) -> Result<OperationResult, RunOperationError> {
    let agent = ureq::Agent::new();
    let body = ureq::json!({
        "chain_id": get_chain_id(),
        // "chain_id": "NetXZSsxBpMQeAT",
        "operation": {
            "branch": branch,
            // this is necessary to be valid signature for this call
            // to work, but doesn't need to match the actual operation signature.
            "signature": "edsigthZLBZKMBUCwHpMCXHkGtBSzwh7wdUxqs7C1LRMk64xpcVU8tyBDnuFuf9CLkdL3urGem1zkHXFV9JbBBabi6k8QnhW4RG",
            "contents": operations
        }
    });
    println!("Running operation... {}/chains/main/blocks/head/helpers/scripts/run_operation", RPC);
    println!("Body: {:#}", body);
    let res = &agent.post(format!("{}/chains/main/blocks/head/helpers/scripts/run_operation", RPC).as_str())
        .send_json(body.clone()).unwrap()
        .into_json::<serde_json::Value>().unwrap()["contents"][0]["metadata"]["operation_result"];
    std::fs::write("result.json", &agent.post(format!("{}/chains/main/blocks/head/helpers/scripts/run_operation", RPC).as_str())
        .send_json(body.clone()).unwrap()
        .into_json::<serde_json::Value>().unwrap().to_string()).unwrap();
    Ok(OperationResult{
        consumed_gas: if let Some(gas) = res["consumed_gas"].as_str() {
            // println!("{}", gas);
            gas.to_string()
        } else { panic!("Operation simulation failed! Body: {:#}\n", body);},
        storage_size: res["storage_size"].as_str().unwrap_or("256").to_string(),
        used_storage: res["paid_storage_size_diff"].as_str().unwrap().to_string(),
    })
}

pub fn estimate_operation_fee(
    estimated_gas: &u64,
    estimated_bytes: &u64
) -> u64 {
    // add 32 bytes for the branch block hash.
    let estimated_bytes = estimated_bytes + 32;

    BASE_FEE
        + MIN_NTEZ_PER_BYTE * estimated_bytes / 1000
        + MIN_NTEZ_PER_GAS * (estimated_gas) / 1000
        // correct rounding error for above two divisions
        + 2
}

fn vote_method(
    branch: &str,
    tme_id: usize,
    prop_id: u64
) -> serde_json::Value {
    let sender = get_address_by_tme(tme_id);
    let counter = get_address_counter(
        sender["address"].as_str().unwrap().to_string(),
    ) + 1;
    let parameters = serde_json::json!({
        "entrypoint": "vote_proposal",
        "value": get_value(
            tezos_multisig().as_ref(),
            "vote_proposal",
            serde_json::json!({
                "proposal_id": prop_id,
                "approval": true,
            }),
        ).unwrap()
    });
    let test_op = serde_json::json!([{
        "kind": "transaction",
        "source": sender["address"],
        "destination": tezos_multisig(),
        "fee": "100000",
        "counter": format!("{}", counter as u64),
        "gas_limit": "10300",
        "storage_limit": "256",
        "amount": "1",
        "parameters": parameters,
    }]);
    let run_op_res = run_operation(
        branch,
        test_op,
    ).unwrap();
    serde_json::json!({
        "kind": "transaction",
        "source": sender["address"],
        "destination": tezos_multisig(),
        "fee": format!("{}", estimate_operation_fee(
            &run_op_res.consumed_gas.parse::<u64>().unwrap(),
            &run_op_res.storage_size.parse::<u64>().unwrap(),
        )),
        "counter": format!("{}", counter as u64),
        "gas_limit": format!("{}", run_op_res.consumed_gas.parse::<u64>().unwrap() + 100),
        "storage_limit": format!("{}", run_op_res.used_storage.parse::<u64>().unwrap() + 257),
        "amount": "1",
        "parameters": parameters,
    })
}

fn transfer_token_proposal(
    branch: &str,
    tme_id: usize,
    amount: u64,
) -> serde_json::Value {
    let sender = get_address_by_tme(tme_id);
    let counter = get_address_counter(
        sender["address"].as_str().unwrap().to_string(),
    ) + 1;
    let parameters = serde_json::json!({
        "entrypoint": "transfer_token_proposal",
        "value": get_value(
            tezos_multisig().as_str(),
            "transfer_token_proposal",
            serde_json::json!({
                "token_contract": tezos_token_address(),
                "token_id": 1u64,
                "token_amount": amount,
                "destination": tezos_htlc()
            }),
        ).unwrap(),
    });
    let test_op = serde_json::json!([{
        "kind": "transaction",
        "source": sender["address"],
        "destination": tezos_multisig(),
        "fee": "100000",
        "counter": format!("{}", counter as u64),
        "gas_limit": "10300",
        "storage_limit": "256",
        "amount": "1",
        "parameters": parameters,
    }]);
    let run_op_res = run_operation(
        branch,
        test_op,
    ).unwrap();
    serde_json::json!({
        "kind": "transaction",
        "source": sender["address"],
        "destination": tezos_multisig(),
        "fee": format!("{}", estimate_operation_fee(
            &run_op_res.consumed_gas.parse::<u64>().unwrap(),
            &run_op_res.storage_size.parse::<u64>().unwrap(),
        )),
        "counter": format!("{}", counter as u64),
        "gas_limit": format!("{}", run_op_res.consumed_gas.parse::<u64>().unwrap() + 100),
        "storage_limit": format!("{}", run_op_res.used_storage.parse::<u64>().unwrap() + 257),
        "amount": "1",
        "parameters": parameters,
    })
}

fn lambda_proposal(
    branch: &str,
    tme_id: usize,
    dest: &str,
    hash: &str,
) -> serde_json::Value {
    let sender = get_address_by_tme(tme_id);
    let counter = get_address_counter(
        sender["address"].as_str().unwrap().to_string(),
    ) + 1;
    let parameters = serde_json::json!({
        "entrypoint": "lambda_proposal",
        "value": get_value(
            tezos_multisig().as_str(),
            "lambda_proposal",
            serde_json::json!(format!(r#"[
                {{ "prim": "DROP" }},
                {{
                    "prim": "PUSH",
                    "args": [
                        {{ "prim": "address" }},
                        {{ "string": "{htlc2_coins}" }}
                    ]
                }}, {{
                    "prim": "CONTRACT",
                    "annots": [ "%createLock" ],
                    "args": [
                        {{
                            "prim": "pair",
                            "args": [
                                {{
                                    "prim": "address",
                                    "annots": [ "%dest1" ]
                                }}, {{
                                    "prim": "bytes",
                                    "annots": [ "%hash1" ]
                                }}
                            ]
                        }}
                    ]
                }}, {{
                    "prim": "IF_NONE",
                    "args": [
                        [
                            {{
                                "prim": "PUSH",
                                "args": [
                                    {{ "prim": "string" }},
                                    {{ "string": "Not a entrypoint" }}
                                ]
                            }},
                            {{ "prim": "FAILWITH" }}
                        ], []
                    ]
                }}, {{
                    "prim": "NIL",
                    "args": [ {{ "prim": "operation" }} ]
                }}, {{ "prim": "SWAP" }}, {{
                    "prim": "PUSH",
                    "args": [
                        {{ "prim": "mutez" }},
                        {{ "int": "0" }}
                    ]
                }}, {{
                    "prim": "PUSH",
                    "args": [
                        {{ "prim": "bytes" }},
                        {{ "bytes": "{hash}" }}
                    ]
                }}, {{
                    "prim": "PUSH",
                    "args": [
                        {{ "prim": "address" }},
                        {{ "string": "{destination}" }}
                    ]
                }},
                {{ "prim": "PAIR" }},
                {{ "prim":"TRANSFER_TOKENS" }},
                {{ "prim":"CONS" }}
            ]"#, htlc2_coins = tezos_coin_htlc(), hash = hash, destination = dest)),
        ).unwrap(),
    });
    let test_op = serde_json::json!([{
        "kind": "transaction",
        "source": sender["address"],
        "destination": tezos_multisig(),
        "fee": "100000",
        "counter": format!("{}", counter as u64),
        "gas_limit": "10300",
        "storage_limit": "256",
        "amount": "1",
        "parameters": parameters,
    }]);
    let run_op_res = run_operation(
        branch,
        test_op,
    ).unwrap();
    serde_json::json!({
        "kind": "transaction",
        "source": sender["address"],
        "destination": tezos_multisig(),
        "fee": format!("{}", estimate_operation_fee(
            &run_op_res.consumed_gas.parse::<u64>().unwrap(),
            &run_op_res.storage_size.parse::<u64>().unwrap(),
        )),
        "counter": format!("{}", counter as u64),
        "gas_limit": format!("{}", run_op_res.consumed_gas.parse::<u64>().unwrap() + 100),
        "storage_limit": format!("{}", run_op_res.used_storage.parse::<u64>().unwrap() + 257),
        "amount": "1",
        "parameters": parameters,
    })
}

fn get_address_by_tme(tme_id: usize) -> serde_json::Value {
    get_json_field("./dependencies/json/tezos_msig_custodians.json", None, Some(tme_id))
}
fn msig_to_htlc_group(
    branch: &str,
    tme_id: usize,
    prop_id: u64,
    hash: &str,
    address: &str,
    tokens: u64,
) -> Vec<serde_json::Value> {
    let mut group = Vec::<serde_json::Value>::new();
    let sender = get_address_by_tme(tme_id);
    let counter = get_address_counter(
        sender["address"].as_str().unwrap().to_string(),
    ) + 1;
    // println!("{}", counter);
    let test_op = serde_json::json!([{
        "kind": "transaction",
        "source": sender["address"],
        "destination": tezos_multisig(),
        "fee": "100000",
        "counter": format!("{}", counter as u64),
        "gas_limit": "10300",
        "storage_limit": "256",
        "amount": "1",
        "parameters": {
            "entrypoint": "execute_proposal",
            "value": { "int" : format!("{}", prop_id)}
        }
    }]);
    // let additional_gas = get_gas_for_execution(
    //     rpc,
    //     endpoint,
    //     branch,
    //     tokens,
    //     counter,
    //     sender.clone(),
    // );
    let additional_gas = 7000; // for token transfer
    let run_op_res = run_operation(
        branch.clone(),
        test_op,
    ).unwrap();
    group.push(serde_json::json!({
        "kind": "transaction",
        "source": sender["address"],
        "destination": tezos_multisig(),
        "fee": format!("{}", estimate_operation_fee(
            &run_op_res.consumed_gas.parse::<u64>().unwrap(),
            &run_op_res.storage_size.parse::<u64>().unwrap(),
        )),
        "counter": format!("{}", counter as u64),
        "gas_limit": format!("{}", run_op_res.consumed_gas.parse::<u64>().unwrap() + 200 + additional_gas),
        "storage_limit": format!("{}", run_op_res.used_storage.parse::<u64>().unwrap() + 257),
        "amount": "1",
        "parameters": {
            "entrypoint": "execute_proposal",
            "value": {"int": format!("{}", prop_id)},
        }
    }));
    let params_for_create_lock = serde_json::json!({
        "entrypoint": "createLock",
        "value": get_value(
            tezos_htlc().as_str(),
            "createLock",
            serde_json::json!({
                "tokenAddress": tezos_token_address(),
                "pair": {
                    "id_tokens": 1u64,
                    "pair": {
                        "amount_tokens": tokens,
                        "pair": {
                            "hash": hash,
                            "dest": address,
                        }
                    }
                }
            }),
        ).unwrap()
    });
    let run_op_res = run_operation(
        branch.clone(),
        serde_json::json!([{
            "kind": "transaction",
            "source": sender["address"],
            "destination": tezos_htlc(),
            "fee": "100000",
            "counter": format!("{}", counter as u64),
            "gas_limit": "10300",
            "storage_limit": "256",
            "amount": "0",
            "parameters": params_for_create_lock,
        }]),
    ).unwrap();
    let additional_gas: u64 = 6100;
    // let additional_gas: u64 = get_gas_for_lock(rpc, endpoint, branch, tokens, counter, sender.clone());
    group.push(serde_json::json!({
        "kind": "transaction",
        "source": sender["address"],
        "destination": tezos_htlc(),
        "fee": format!("{}", estimate_operation_fee(
            &run_op_res.consumed_gas.parse::<u64>().unwrap(),
            &run_op_res.storage_size.parse::<u64>().unwrap(),
        )),
        "counter": format!("{}", counter as u64 + 1),
        "gas_limit": format!("{}", run_op_res.consumed_gas.parse::<u64>().unwrap() + 100 + additional_gas),
        "storage_limit": format!("{}", run_op_res.used_storage.parse::<u64>().unwrap() + 257),
        "amount": "1",
        "parameters": params_for_create_lock,
    }));
    group
}

fn sign_operation(
    branch: &str,
    tme_id: usize,
    transactions: Vec<serde_json::Value>,
) -> Result<OperationSignatureInfo, Error> {
    let sender = get_address_by_tme(tme_id);
    let local_state = LocalWalletState {
        public_key: PublicKey::from_base58check(sender["public"].as_str().unwrap()).unwrap(),
        private_key: PrivateKey::from_base58check(sender["secret"].as_str().unwrap()).unwrap(),
    };
    if let Some(state) = Some(&local_state) {
        let body = serde_json::json!({
            "branch": branch,
            "contents": transactions,
        });
        // println!("\n\n\n\n\nForging... {:#}", body);
        // println!("{}/chains/main/blocks/head/helpers/forge/operations", rpc);
        let bytes: serde_json::Value = ureq::Agent::new().post(format!("{}/chains/main/blocks/head/helpers/forge/operations", RPC).as_str())
            .send_json(body).unwrap()
            .into_json().unwrap();
        // println!("bytes length: {}\n", bytes.as_str().unwrap().len());
        let sig_info = state.signer().sign_forged_operation_bytes(
            &Vec::from_hex(bytes.as_str().unwrap()).unwrap()[..],
        );
        Ok(sig_info)
    } else {
        exit_with_error_no_wallet_type_selected()
    }
}

fn inject_operations(operation_with_signature: &str) -> super::api::InjectOperationsResult {
    let operation_with_signature_json = serde_json::Value::String(operation_with_signature.to_owned());

    Ok(ureq::Agent::new().post(format!("{}/injection/operation", RPC).as_str())
       .send_json(operation_with_signature_json).unwrap()
       .into_json().unwrap())
}

pub fn tezos_multisig() -> String {
    get_json_field(CONFIG, Some("tezos_multisig"), None).as_str().unwrap().to_string()
}

pub fn tezos_token_address() -> String {
    get_json_field(CONFIG, Some("tezos_token_address"), None).as_str().unwrap().to_string()
}

pub fn tezos_htlc() -> String {
    get_json_field(CONFIG, Some("htlc2"), None).as_str().unwrap().to_string()
}

pub fn tezos_coin_htlc() -> String {
    get_json_field(CONFIG, Some("htlc2-coin"), None).as_str().unwrap().to_string()
}

fn get_proposal_id() -> u64 {
    let path = format!("{}/v1/contracts/{}/storage", ENDPOINT, tezos_multisig());
    let res: serde_json::Value = ureq::Agent::new().get(path.as_str())
        .call().unwrap()
        .into_json().unwrap();
    // println!("{}/v1/contracts/{}/storage", endpoint, tezos_multisig());
    res["counter"].as_str().unwrap().parse::<u64>().unwrap() - 1
}

fn get_operation_info(hash: &str) -> Option<serde_json::Value> {
    let agent = ureq::Agent::new();
    let path = format!("https://api.hangzhou.tzstats.com/explorer/op/{}", hash);
    // println!("{}", path);
    let res = agent.get(&path)
        .call();
    if res.is_ok() {
        Some(res.unwrap().into_json().unwrap())
    } else {
        None
    }
    // serde_json::from_str::<serde_json::Value>(res.as_str()).unwrap()
}

fn get_confirmations(hash: &str) -> u64 {
    if let Some(res) = get_operation_info(hash) {
        res[0]["confirmations"].as_u64().unwrap()
    } else {
        0
    }
}

fn get_status(hash: &str) -> String {
    if let Some(res) = get_operation_info(hash) {
        res[0]["status"].as_str().unwrap().to_string()
    } else {
        "unknown".to_string()
    }
}

fn await_confirmation(hash: &str) -> bool {
    let timer = std::time::Instant::now();
    println!("Awaiting confirmation...");
    while timer.elapsed().as_millis() <= AWAIT_TIMEOUT && get_confirmations(hash) < 1 {
        std::thread::sleep(std::time::Duration::from_millis(100));
    }
    match get_status(hash).as_str() {
        "applied" => true,
        _ => false,
    }
}

fn await_confirmations(hashes: Vec<String>) -> bool {
    let timer = std::time::Instant::now();
    let count = hashes.len();
    println!("Awaiting confirmation ({})...", count);
    let mut confirmations = 0;
    while timer.elapsed().as_millis() <= AWAIT_TIMEOUT && confirmations < count {
        confirmations = 0;
        for i in 0..count {
            if get_confirmations(hashes[i].as_str()) >= 1 {
                confirmations += 1;
            }
        }
    }
    confirmations == count
}

fn create_proposal(branch: &str, tokens: bool, dest: &str, hash: &str) {
    let tme_id = 2;
    let group = if tokens {
        vec![transfer_token_proposal(branch, tme_id, 1000)]
    } else {
        vec![lambda_proposal(branch, tme_id, dest, hash)]
    };
    let sign_res = sign_operation(
        branch,
        tme_id,
        group,
    ).unwrap();
    let hash = inject_operations(
        sign_res.operation_with_signature.as_str(),
    ).unwrap().as_str().unwrap().to_string();
    println!("{}", hash);
    println!("{}\n", if await_confirmation(hash.as_str()) { "Applied" } else { "Failed" });
}

fn vote_all(branch: &str, tokens: bool, dest: &str, hash: &str) -> u64{
    create_proposal(branch, tokens, dest, hash);
    let prop_id = get_proposal_id();
    let mut votes = vec![];
    for i in 0..3 {
        let group = vec![vote_method(branch, i, prop_id)];
        let sign_res = sign_operation(
            branch,
            i,
            group,
        ).unwrap();
        let hash = inject_operations(
            sign_res.operation_with_signature.as_str(),
        ).unwrap().as_str().unwrap().to_string();
        println!("Vote {}: {}", i + 1, hash);
        votes.push(hash);
        // println!("Vote {}: {}", i + 1, if inject_res.is_ok() { "ok" } else { "failed" });
    }
    println!("{}\n", if await_confirmations(votes) { "Applied" } else { "Failed" });
    prop_id
}

pub fn create_batch(hash: &str, dest: &str) {
    let tezos_msig_executor = 1;
    let branch = get_block_hash();
    let prop_id = vote_all(branch.as_str(), true, dest, hash);
    let group = msig_to_htlc_group(
        branch.as_str(),
        tezos_msig_executor,
        prop_id,
        // 3,
        hash,
        dest,
        1000,
    );
    let res = sign_operation(
        branch.as_str(),
        tezos_msig_executor,
        group,
    ).unwrap();
    let inject_res = inject_operations(res.operation_with_signature.as_str()).unwrap();
    println!("https://hangzhou2net.tzkt.io/{}", inject_res.as_str().unwrap());
    println!("{}", inject_res);
}

fn msig_to_htlc_group_with_coins(
    branch: &str,
    tme_id: usize,
    prop_id: u64,
    hash: &str,
    address: &str,
) -> Vec<serde_json::Value> {
    let mut group = Vec::<serde_json::Value>::new();
    let sender = get_address_by_tme(tme_id);
    let counter = get_address_counter(
        sender["address"].as_str().unwrap().to_string(),
    ) + 1;
    // println!("{}", counter);
    let test_op = serde_json::json!([{
        "kind": "transaction",
        "source": sender["address"],
        "destination": tezos_multisig(),
        "fee": "100000",
        "counter": format!("{}", counter as u64),
        "gas_limit": "10300",
        "storage_limit": "256",
        "amount": "1",
        "parameters": {
            "entrypoint": "execute_proposal",
            "value": { "int" : format!("{}", prop_id)}
        }
    }]);
    let additional_gas = 7000; // for token transfer
    let run_op_res = run_operation(
        branch.clone(),
        test_op,
    ).unwrap();
    group.push(serde_json::json!({
        "kind": "transaction",
        "source": sender["address"],
        "destination": tezos_multisig(),
        "fee": format!("{}", estimate_operation_fee(
            &run_op_res.consumed_gas.parse::<u64>().unwrap(),
            &run_op_res.storage_size.parse::<u64>().unwrap(),
        )),
        "counter": format!("{}", counter as u64),
        "gas_limit": format!("{}", run_op_res.consumed_gas.parse::<u64>().unwrap() + 200 + additional_gas),
        "storage_limit": format!("{}", run_op_res.used_storage.parse::<u64>().unwrap() + 257),
        "amount": "1",
        "parameters": {
            "entrypoint": "execute_proposal",
            "value": {"int": format!("{}", prop_id)},
        }
    }));
    let params_for_create_lock = serde_json::json!({
        "entrypoint": "createLock",
        "value": get_value(
            tezos_coin_htlc().as_str(),
            "createLock",
                serde_json::json!({
                    "dest": address,
                    "hash": hash,
                }),
        ).unwrap()
    });
    let run_op_res = run_operation(
        branch.clone(),
        serde_json::json!([{
            "kind": "transaction",
            "source": sender["address"],
            "destination": tezos_coin_htlc(),
            "fee": "100000",
            "counter": format!("{}", counter as u64),
            "gas_limit": "10300",
            "storage_limit": format!("{}", run_op_res.used_storage.parse::<u64>().unwrap() + 257),
            "amount": "0",
            "parameters": params_for_create_lock,
        }]),
    ).unwrap();
    let additional_gas: u64 = 6100;
    // let additional_gas: u64 = get_gas_for_lock(rpc, endpoint, branch, tokens, counter, sender.clone());
    group.push(serde_json::json!({
        "kind": "transaction",
        "source": sender["address"],
        "destination": tezos_coin_htlc(),
        "fee": format!("{}", estimate_operation_fee(
            &run_op_res.consumed_gas.parse::<u64>().unwrap(),
            &run_op_res.storage_size.parse::<u64>().unwrap(),
        )),
        "counter": format!("{}", counter as u64 + 1),
        "gas_limit": format!("{}", run_op_res.consumed_gas.parse::<u64>().unwrap() + 100 + additional_gas),
        "storage_limit": format!("{}", run_op_res.used_storage.parse::<u64>().unwrap() + 257),
        "amount": "1",
        "parameters": params_for_create_lock,
    }));
    group
}

pub fn create_batch_with_coins(hash: &str, dest: &str) {
    let tezos_msig_executor = 1;
    let branch = get_block_hash();
    let prop_id = vote_all(branch.as_str(), false, dest, hash);
    let group = msig_to_htlc_group_with_coins(
        branch.as_str(),
        tezos_msig_executor,
        prop_id,
        // 3,
        hash,
        dest,
    );
    let res = sign_operation(
        branch.as_str(),
        tezos_msig_executor,
        group,
    ).unwrap();
    let inject_res = inject_operations(res.operation_with_signature.as_str()).unwrap();
    println!("https://hangzhou2net.tzkt.io/{}", inject_res.as_str().unwrap());
    println!("{}", inject_res);
}