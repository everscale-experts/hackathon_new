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

fn get_block_hash(agent: ureq::Agent, endpoint: String) -> String {
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

fn transfer_implicit(key: &str, mutez: u64) -> serde_json::Value {
    serde_json::json!(
        [
            { "prim": "DROP" },
            { "prim": "NIL", "args": [{ "prim": "operation" }] },
            {
                "prim": "PUSH",
                "args": [{ "prim": "key_hash" }, { "string": key }],
            },
            { "prim": "IMPLICIT_ACCOUNT" },
            {
                "prim": "PUSH",
                "args": [{ "prim": "mutez" }, { "int": mutez }],
            },
            { "prim": "UNIT" },
            { "prim": "TRANSFER_TOKENS" },
            { "prim": "CONS" },
        ]
    )
}

fn get_transactions_vec(hash: &str, address: &str) -> Result<serde_json::Value, Error> {
    let htlc2 = get_json_field(CONFIG, Some("htlc2"), None);
    Ok(
        serde_json::json!(
            [
                {
                    "contract": get_json_field(CONFIG, Some("tezos_multisig"), None).as_str().unwrap(),
                    "entrypoint": "main",
                    "parameters": {
                        "sigs": [
                            "edsigtj8W5Jd3EuTYEqEv6EemEwdEmXABzkfL9x9GAHnLLZhSWuEtKVCv6YFbmfhRjcuEqyxyWpzds5efKF3cuHy9fB5tpfiXFd"
                        ],
                        "payload": {
                            "action": {
                                "operation": format!(r#"[{{"prim":"DROP"}},{{"prim":"NIL","args":[{{"prim":"operation"}}]}},{{"prim":"PUSH","args":[{{"prim":"key_hash"}},{{"string":"{}"}}]}},{{"prim":"IMPLICIT_ACCOUNT"}},{{"prim":"PUSH","args":[{{"prim":"mutez"}},{{"int":"1"}}]}},{{"prim":"UNIT"}},{{"prim":"TRANSFER_TOKENS"}},{{"prim":"CONS"}}]"#, htlc2.as_str().unwrap())
                            },
                            "counter": "4"
                        }
                    }
                },
                {
                    "contract": get_json_field(CONFIG, Some("tezos_multisig"), None).as_str().unwrap(),
                    "entrypoint": "main",
                    "parameters": {
                        "sigs": [
                            "edsigtj8W5Jd3EuTYEqEv6EemEwdEmXABzkfL9x9GAHnLLZhSWuEtKVCv6YFbmfhRjcuEqyxyWpzds5efKF3cuHy9fB5tpfiXFd"
                        ],
                        "payload": {
                            "action": {
                                "operation": format!(r#"[{{"prim":"DROP"}},{{"prim":"NIL","args":[{{"prim":"operation"}}]}},{{"prim":"PUSH","args":[{{"prim":"key_hash"}},{{"string":"{}"}}]}},{{"prim":"IMPLICIT_ACCOUNT"}},{{"prim":"PUSH","args":[{{"prim":"mutez"}},{{"int":"1"}}]}},{{"prim":"UNIT"}},{{"prim":"TRANSFER_TOKENS"}},{{"prim":"CONS"}}]"#, htlc2.as_str().unwrap())
                            },
                            "counter": "4"
                        }
                    }
                },
                // {
                //     "contract": get_json_field(CONFIG, Some("htlc2"), None).as_str().unwrap(),
                //     "entrypoint": "createLock",
                //     "parameters": {
                //         "id_tokens": "1",
                //         "pair": {
                //             "amount_tokens": "0",
                //             "pair": {
                //                 "hash": hash,
                //                 "dest": address
                //             }
                //         }
                //     }
                // }
            ]
        )
    )
}

fn get_value(
    agent: ureq::Agent,
    endpoint: String,
    contract: String,
    entrypoint: String,
    parameters: ureq::SerdeValue,
) -> Result<serde_json::Value, Error> {
    // println!("Building parameters... {}/v1/contracts/{}/entrypoints/{}/build", endpoint, contract, entrypoint);
    // println!("Parameters: {:#}", parameters);
    let res = agent.post(format!("{}/v1/contracts/{}/entrypoints/{}/build", endpoint, contract, entrypoint).as_str())
        .send_json(parameters.clone()).unwrap();
    Ok(res.into_json().unwrap_or(serde_json::json!({})))
}

fn get_chain_id(agent: ureq::Agent, endpoint: String) -> String {
    agent.get(format!("{}/chains/main/chain_id", endpoint).as_str())
        .call().unwrap()
        .into_json().unwrap()
}

fn run_operation(
    agent: ureq::Agent,
    rpc: String,
    branch: String,
    operation: serde_json::Value,
) -> Result<OperationResult, RunOperationError> {
    let body = ureq::json!({
        "chain_id": get_chain_id(agent.clone(), rpc.clone()),
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
        storage_size: res["storage_size"].as_str().unwrap_or("100").to_string(),
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

fn get_group(rpc: &str, endpoint: &str, branch: String, contract: &str, hash: &str, address: &str) -> Vec<serde_json::Value> {
    let mut group = Vec::<serde_json::Value>::new();
    let sender = get_json_field("./dependencies/json/tezos_accounts.json", None, Some(2));
    let counter = get_address_counter(
        ureq::Agent::new(),
        endpoint.to_string(),
        // get_json_field(CONFIG, Some("tezos_multisig"), None).as_str().unwrap().to_string(),
        sender["address"].as_str().unwrap().to_string(),
    ) + 1;
    let transactions = get_transactions_vec(hash, address).unwrap();
    for i in 0..transactions.as_array().unwrap().len() {
        let test_op = serde_json::json!({
            "kind": "transaction",
            "source": sender["address"].as_str().unwrap(),
            "destination": transactions[i].clone()["contract"],
            "fee": "100000",
            "counter": format!("{}", counter as u64),
            "gas_limit": "10300",
            "storage_limit": "100",
            "amount": "0",
            "parameters": {
                "entrypoint": transactions[i].clone()["entrypoint"],
                "value": get_value(
                    ureq::Agent::new(),
                    endpoint.to_string(),
                    transactions[i].clone()["contract"].as_str().unwrap().to_string(),
                    transactions[i].clone()["entrypoint"].as_str().unwrap().to_string(),
                    transactions[i]["parameters"].clone(),
                ).unwrap()
            }
        });
        let run_op_res = run_operation(
            ureq::Agent::new(),
            rpc.to_string(),
            branch.clone(),
            test_op,
        ).unwrap();
        group.push(serde_json::json!({
            "kind": "transaction",
            "source": sender["address"].as_str().unwrap(),
            "destination": transactions[i].clone()["contract"],
            "fee":format!("{}", estimate_operation_fee(
                &run_op_res.consumed_gas.parse::<u64>().unwrap(),
                &run_op_res.storage_size.parse::<u64>().unwrap(),
            )),
            "counter": format!("{}", counter + i as u64),
            "gas_limit": format!("{}", run_op_res.consumed_gas.parse::<u64>().unwrap() + 100),
            "storage_limit": "100",
            "amount": "0",
            "parameters": {
                "entrypoint": transactions[i].clone()["entrypoint"],
                "value": get_value(
                    ureq::Agent::new(),
                    endpoint.to_string(),
                    transactions[i].clone()["contract"].as_str().unwrap().to_string(),
                    transactions[i].clone()["entrypoint"].as_str().unwrap().to_string(),
                    transactions[i]["parameters"].clone(),
                ).unwrap()
            }
        }));
    }
    group
}

fn sign_operation(
    agent: ureq::Agent,
    rpc: &str,
    endpoint: &str,
    branch: String,
    contract: String,
    hash: &str,
    address: &str,
) -> Result<OperationSignatureInfo, Error> {
    let sender = get_json_field("./dependencies/json/tezos_accounts.json", None, Some(2));
    let local_state = LocalWalletState {
        public_key: PublicKey::from_base58check(sender["public"].as_str().unwrap()).unwrap(),
        private_key: PrivateKey::from_base58check(sender["secret"].as_str().unwrap()).unwrap(),
    };
    if let Some(state) = Some(&local_state) {
        let body = serde_json::json!({
            "branch": branch,
            "contents": get_group(rpc, endpoint, branch, contract.as_str(), hash, address)
        });
        // println!("\n\n\n\n\nForging... {:#}", body);
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
    let operation_with_signature_json = serde_json::Value::String(operation_with_signature.to_owned());

    Ok(agent.post(format!("{}/injection/operation", endpoint).as_str())
       .send_json(operation_with_signature_json)?
       .into_json()?)
}

pub fn create_batch(hash: &str, address: &str) {
    let rpc = "https://hangzhounet.api.tez.ie";
    let endpoint = "https://api.hangzhounet.tzkt.io";
    let agent = Agent::new();
    let branch = get_block_hash(agent.clone(), rpc.to_string());
    let contract = get_json_field(CONFIG, Some("tezos_multisig"), None).as_str().unwrap().to_string();
    let res = sign_operation(agent.clone(), rpc, endpoint, branch.clone(), contract, hash, address).unwrap();
    let inject_res = inject_operations(agent.clone(), res.operation_with_signature.as_str(), rpc).unwrap();
    println!("https://hangzhou2net.tzkt.io/{}", inject_res.as_str().unwrap());
    println!("{}", inject_res);
}

fn main() {}