use super::common::operation_command::exit_with_error_no_wallet_type_selected;
use hex::FromHex;
use lib::api::RunOperationError;
use lib::signer::OperationSignatureInfo;
use ureq::Agent;
use lib::PrivateKey;
use lib::PublicKey;
use super::get_json_field;
use super::common::operation_command::LocalWalletState;

type Error = Box<dyn std::error::Error>;
const BASE_FEE: u64 = 100;
const MIN_NTEZ_PER_GAS: u64 = 100;
const MIN_NTEZ_PER_BYTE: u64 = 1000;
const CONFIG: &str = "./dependencies/json/config.json";

struct OperationResult {
    consumed_gas: String,
    storage_size: String,
}

fn get_block_hash(agent: ureq::Agent, endpoint: &str) -> String {
    let value = agent.get(format!("{}/chains/main/blocks/head/hash", endpoint).as_str())
        .call().unwrap()
        .into_json().unwrap();
    println!("Block hash: {}", value);
    value
}

fn get_address_counter(agent: ureq::Agent, endpoint: String, address: String) -> u64 {
    println!("{}/v1/accounts/{}/counter", endpoint, address);
    agent.get(format!("{}/v1/accounts/{}/counter", endpoint, address).as_str())
        .call().unwrap()
        .into_json().unwrap()
}

fn get_value(
    agent: ureq::Agent,
    endpoint: &str,
    contract: &str,
    entrypoint: &str,
    parameters: ureq::SerdeValue,
) -> Result<serde_json::Value, Error> {
    println!("Building... {}/v1/contracts/{}/entrypoints/{}/build", endpoint, contract, entrypoint);
    println!("Parameters: {:#}", parameters);
    let res = agent.post(format!("{}/v1/contracts/{}/entrypoints/{}/build", endpoint, contract, entrypoint).as_str())
        .send_json(parameters.clone()).unwrap();
    Ok(res.into_json().unwrap_or(parameters))
}

fn get_chain_id(agent: ureq::Agent, endpoint: &str) -> String {
    agent.get(format!("{}/chains/main/chain_id", endpoint).as_str())
        .call().unwrap()
        .into_json().unwrap()
}

fn run_operation(
    agent: ureq::Agent,
    rpc: &str,
    branch: &str,
    operation: serde_json::Value,
) -> Result<OperationResult, RunOperationError> {
    let body = ureq::json!({
        "chain_id": get_chain_id(agent.clone(), rpc),
        // "chain_id": "NetXZSsxBpMQeAT",
        "operation": {
            "branch": branch,
            // this is necessary to be valid signature for this call
            // to work, but doesn't need to match the actual operation signature.
            "signature": "edsigthZLBZKMBUCwHpMCXHkGtBSzwh7wdUxqs7C1LRMk64xpcVU8tyBDnuFuf9CLkdL3urGem1zkHXFV9JbBBabi6k8QnhW4RG",
            "contents": [operation]
        }
    });
    println!("Running operation... {}/chains/main/blocks/head/helpers/scripts/run_operation", rpc.clone());
    println!("Body: {:#}", body);
    let res = &agent.post(format!("{}/chains/main/blocks/head/helpers/scripts/run_operation", rpc.clone()).as_str())
        .send_json(body.clone()).unwrap()
        .into_json::<serde_json::Value>().unwrap()["contents"][0]["metadata"]["operation_result"];
    std::fs::write("result.json", &agent.post(format!("{}/chains/main/blocks/head/helpers/scripts/run_operation", rpc.clone()).as_str())
        .send_json(body.clone()).unwrap()
        .into_json::<serde_json::Value>().unwrap().to_string()).unwrap();
    Ok(OperationResult{
        consumed_gas: res["consumed_gas"].as_str().unwrap_or("5000").to_string(),
        storage_size: res["storage_size"].as_str().unwrap_or("256").to_string(),
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
    rpc: &str,
    endpoint: &str,
    branch: &str,
    tme_id: usize,
    prop_id: u64
) -> serde_json::Value {
    let sender = get_address_by_tme(tme_id);
    let counter = get_address_counter(
        ureq::Agent::new(),
        endpoint.to_string(),
        sender["address"].as_str().unwrap().to_string(),
    ) + 1;
    let parameters = serde_json::json!({
        "entrypoint": "vote_proposal",
        "value": get_value(
            ureq::Agent::new(),
            endpoint,
            tezos_multisig().as_ref(),
            "vote_proposal",
            serde_json::json!({
                "proposal_id": prop_id,
                "approval": true,
            }),
        ).unwrap()
    });
    let test_op = serde_json::json!({
        "kind": "transaction",
        "source": sender["address"],
        "destination": tezos_multisig(),
        "fee": "100000",
        "counter": format!("{}", counter as u64),
        "gas_limit": "10300",
        "storage_limit": "256",
        "amount": "1",
        "parameters": parameters,
    });
    let run_op_res = run_operation(
        ureq::Agent::new(),
        rpc,
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
        "storage_limit": "256",
        "amount": "1",
        "parameters": parameters,
    })
}

fn transfer_mutez_proposal(
    rpc: &str,
    endpoint: &str,
    branch: &str,
    tme_id: usize,
    mutez: u64,
) -> serde_json::Value {
    let sender = get_address_by_tme(tme_id);
    let counter = get_address_counter(
        ureq::Agent::new(),
        endpoint.to_string(),
        sender["address"].as_str().unwrap().to_string(),
    ) + 1;
    let parameters = serde_json::json!({
        "entrypoint": "transfer_mutez_proposal",
        "value": get_value(
            ureq::Agent::new(),
            endpoint,
            tezos_multisig().as_str(),
            "transfer_mutez_proposal",
            serde_json::json!({
                "mutez_amount": mutez.max(1),
                "destination": tezos_htlc(),
            }),
        ).unwrap(),
    });
    let test_op = serde_json::json!({
        "kind": "transaction",
        "source": sender["address"],
        "destination": tezos_multisig(),
        "fee": "100000",
        "counter": format!("{}", counter as u64),
        "gas_limit": "10300",
        "storage_limit": "256",
        "amount": "1",
        "parameters": parameters,
    });
    let run_op_res = run_operation(
        ureq::Agent::new(),
        rpc,
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
        "storage_limit": "256",
        "amount": "1",
        "parameters": parameters,
    })
}

fn get_address_by_tme(tme_id: usize) -> serde_json::Value {
    get_json_field("./dependencies/json/tezos_msig_custodians.json", None, Some(tme_id))
}

fn msig_to_htlc_group(
    rpc: &str,
    endpoint: &str,
    branch: &str,
    tme_id: usize,
    prop_id: u64,
) -> Vec<serde_json::Value> {
    let mut group = Vec::<serde_json::Value>::new();
    let sender = get_address_by_tme(tme_id);
    let counter = get_address_counter(
        ureq::Agent::new(),
        endpoint.to_string(),
        sender["address"].as_str().unwrap().to_string(),
    ) + 1;
    let test_op = serde_json::json!({
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
    });
    let run_op_res = run_operation(
        ureq::Agent::new(),
        rpc,
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
        "gas_limit": format!("{}", run_op_res.consumed_gas.parse::<u64>().unwrap() + 100),
        "storage_limit": "256",
        "amount": "1",
        "parameters": {
            "entrypoint": "execute_proposal",
            "value": {"int": format!("{}", prop_id)},
        }
    }));
    group
}

fn sign_operation(
    agent: ureq::Agent,
    rpc: &str,
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
        println!("\n\n\n\n\nForging... {:#}", body);
        println!("{}/chains/main/blocks/head/helpers/forge/operations", rpc);
        let bytes: serde_json::Value = agent.post(format!("{}/chains/main/blocks/head/helpers/forge/operations", rpc).as_str())
            .send_json(body).unwrap()
            .into_json().unwrap();
        println!("bytes length: {}\n", bytes.as_str().unwrap().len());
        let sig_info = state.signer().sign_forged_operation_bytes(
            &Vec::from_hex(bytes.as_str().unwrap()).unwrap()[..],
        );
        Ok(sig_info)
    } else {
        exit_with_error_no_wallet_type_selected()
    }
}

fn inject_operations(agent: ureq::Agent, operation_with_signature: &str, endpoint: &str) -> lib::api::InjectOperationsResult {
    println!("{}", operation_with_signature);
    let operation_with_signature_json = serde_json::Value::String(operation_with_signature.to_owned());

    Ok(agent.post(format!("{}/injection/operation", endpoint).as_str())
       .send_json(operation_with_signature_json)?
       .into_json()?)
}

fn tezos_multisig() -> String {
    get_json_field(CONFIG, Some("tezos_multisig"), None).as_str().unwrap().to_string()
}

fn tezos_htlc() -> String {
    get_json_field(CONFIG, Some("htlc2"), None).as_str().unwrap().to_string()
}

fn get_proposal_id(endpoint: &str) -> u64 {
    let path = format!("{}/v1/contracts/{}/storage", endpoint, tezos_multisig());
    let res: serde_json::Value = ureq::Agent::new().get(path.as_str())
        .call().unwrap()
        .into_json().unwrap();
    println!("{}/v1/contracts/{}/storage", endpoint, tezos_multisig());
    res["counter"].as_str().unwrap().parse::<u64>().unwrap()
}

fn create_proposal(rpc: &str, endpoint: &str, branch: &str) {
    let agent = ureq::Agent::new();
    let tme_id = 2;
    let group = vec![transfer_mutez_proposal(rpc, endpoint, branch, tme_id, 1000)];
    let sign_res = sign_operation(
        agent.clone(),
        rpc,
        branch,
        tme_id,
        group,
    ).unwrap();
    let inject_res = inject_operations(
        agent.clone(),
        sign_res.operation_with_signature.as_str(),
        rpc,
    ).unwrap();
    // println!("Creating proposal: {}", if inject_res.is_ok() { "ok" } else { "failed" });
    std::thread::sleep(std::time::Duration::from_secs(5));
}

fn vote_all(rpc: &str, endpoint: &str, branch: &str) -> u64{
    let agent = ureq::Agent::new();
    create_proposal(rpc, endpoint, branch);
    let prop_id = get_proposal_id(endpoint);
    for i in 0..3 {
        let group = vec![vote_method(rpc, endpoint, branch, i, prop_id)];
        let sign_res = sign_operation(
            agent.clone(),
            rpc,
            branch,
            i,
            group,
        ).unwrap();
        let inject_res = inject_operations(
            agent.clone(),
            sign_res.operation_with_signature.as_str(),
            rpc,
        );
        if i == 1 {
            std::thread::sleep(std::time::Duration::from_secs(5));
        }
        println!("Vote {}: {}", i + 1, if inject_res.is_ok() { "ok" } else { "failed" });
    }
    std::thread::sleep(std::time::Duration::from_secs(10));
    prop_id
}

pub fn create_batch(hash: &str, address: &str) {
    let tezos_msig_executor = 1;
    let rpc = "https://hangzhounet.api.tez.ie";
    let endpoint = "https://api.hangzhounet.tzkt.io";
    let agent = Agent::new();
    let branch = get_block_hash(agent.clone(), rpc);
    let prop_id = vote_all(rpc, endpoint, branch.as_str());
    let group = msig_to_htlc_group(
        rpc,
        endpoint,
        branch.as_str(),
        tezos_msig_executor,
        prop_id,
    );
    let res = sign_operation(
        agent.clone(),
        rpc,
        branch.as_str(),
        tezos_msig_executor,
        group,
    ).unwrap();
    let inject_res = inject_operations(agent.clone(), res.operation_with_signature.as_str(), rpc).unwrap();
    println!("https://hangzhou2net.tzkt.io/{}", inject_res.as_str().unwrap());
    println!("{}", inject_res);
}

fn main() {}