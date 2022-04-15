use common::operation_command::exit_with_error_no_wallet_type_selected;
use common::operation_command::LocalWalletState;
use lib::signer::OperationSignatureInfo;
use lib::api::InjectOperationsResult;
use lib::api::RunOperationError;
use rpc_api::api::ProtocolInfo;
use serde::Deserialize;
use types::PrivateKey;
use types::PublicKey;
use ureq::SerdeValue;
use console::style;
use hex::FromHex;
use std::fs;
mod common;

type Error = Box<dyn std::error::Error>;
const BASE_FEE: u64 = 100;
const MIN_NTEZ_PER_GAS: u64 = 100;
const MIN_NTEZ_PER_BYTE: u64 = 1000;

#[derive(Deserialize)]
struct ProtocolInfoJson {
    protocol: String,
    next_protocol: String,
}

#[derive(PartialEq, Debug, Clone)]
struct Forged(Vec<u8>);

impl Into<ProtocolInfo> for ProtocolInfoJson {
    fn into(self) -> ProtocolInfo {
        let mut info = ProtocolInfo::default();
        info.protocol_hash = self.protocol;
        info.next_protocol_hash = self.next_protocol;
        info
    }
}

fn get_block_hash(agent: ureq::Agent, endpoint: String) -> String {
    let value = agent.get(format!("{}/chains/main/blocks/head/hash", endpoint).as_str(), "")
        .call().unwrap()
        .into_json().unwrap();
    println!("Block hash: {}", value);
    // println!("");
    value
}

fn get_address_counter(agent: ureq::Agent, endpoint: String, address: String) -> u64 {
    agent.get(format!("{}/v1/accounts/{}/counter", endpoint, address).as_str(), "")
        .call().unwrap()
        .into_json().unwrap()
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

fn get_chain_id(agent: ureq::Agent, endpoint: String) -> String {
    agent.get(format!("{}/chains/main/chain_id", endpoint).as_str(), "")
        .call().unwrap()
        .into_json().unwrap()
}

struct OperationResult {
    consumed_gas: String,
    storage_size: String,
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
    println!("{:#}", body);
    let res = &agent.post(format!("{}/chains/main/blocks/head/helpers/scripts/run_operation", rpc.clone()).as_str())
        .send_json(body.clone()).unwrap()
        .into_json::<serde_json::Value>().unwrap()["contents"][0]["metadata"]["operation_result"];
    fs::write("result.json", &agent.post(format!("{}/chains/main/blocks/head/helpers/scripts/run_operation", rpc.clone()).as_str())
        .send_json(body.clone()).unwrap()
        .into_json::<serde_json::Value>().unwrap().to_string()).unwrap();
    Ok(OperationResult{
        consumed_gas: if let Some(s) = res["consumed_gas"].as_str() { s.to_owned() } else { "5000".to_owned() },
        storage_size: if let Some(s) = res["storage_size"].as_str() { s.to_owned() } else { "100".to_owned() },
    })
}

fn get_transactions_vec() -> Result<serde_json::Value, Error> {
    Ok(
        serde_json::from_str::<SerdeValue>(fs::read_to_string("config.json")
            .unwrap()
            .as_str())?
                .clone()["transactions"]
                .clone()
    )
}

fn get_group(rpc: &str, endpoint: &str, branch: String, contract: &str) -> Vec<serde_json::Value> {
    let mut group = Vec::<serde_json::Value>::new();
    let counter = get_address_counter(
        ureq::Agent::new(),
        endpoint.to_string(),
        get_config_field("source").unwrap(),
    ) + 1;
    let transactions = get_transactions_vec().unwrap();
    // ************************************************************************************************
    let test_op = serde_json::json!({
        "kind": "transaction",
        "source": get_config_field("source").unwrap(),
        "destination": "tz1Nt3vKhbZpVdCrqgxR9sZDFqUty2h7SMRM",
        "fee": "100000",
        "counter": format!("{}", counter as u64),
        "gas_limit": "10300",
        "storage_limit": "100",
        "amount": "1"
    });
    let run_op_res = run_operation(
        ureq::Agent::new(),
        rpc.to_string(),
        branch.clone(),
        test_op,
    ).unwrap();
    group.push(serde_json::json!({
        "kind": "transaction",
        "source": get_config_field("source").unwrap(),
        "destination": "tz1Nt3vKhbZpVdCrqgxR9sZDFqUty2h7SMRM",
        "fee":format!("{}", estimate_operation_fee(
            &run_op_res.consumed_gas.parse::<u64>().unwrap(),
            &run_op_res.storage_size.parse::<u64>().unwrap(),
        )),
        "counter": format!("{}", counter + 1 as u64),
        "gas_limit": format!("{}", run_op_res.consumed_gas.parse::<u64>().unwrap() + 100),
        "storage_limit": "100",
        "amount": "1"
    }));
    // ************************************************************************************************
    let test_op = serde_json::json!({
        "kind": "transaction",
        "source": get_config_field("source").unwrap(),
        "destination": "tz1aazXPQEU5fAFh9nS7KbyzmePi8xyirc4M",
        "fee": "100000",
        "counter": format!("{}", counter as u64),
        "gas_limit": "10300",
        "storage_limit": "100",
        "amount": "1"
    });
    let run_op_res = run_operation(
        ureq::Agent::new(),
        rpc.to_string(),
        branch.clone(),
        test_op,
    ).unwrap();
    group.push(serde_json::json!({
        "kind": "transaction",
        "source": get_config_field("source").unwrap(),
        "destination": "tz1aazXPQEU5fAFh9nS7KbyzmePi8xyirc4M",
        "fee":format!("{}", estimate_operation_fee(
            &run_op_res.consumed_gas.parse::<u64>().unwrap(),
            &run_op_res.storage_size.parse::<u64>().unwrap(),
        )),
        "counter": format!("{}", counter + 2 as u64),
        "gas_limit": format!("{}", run_op_res.consumed_gas.parse::<u64>().unwrap() + 100),
        "storage_limit": "100",
        "amount": "1"
    }));
    // ************************************************************************************************
    let test_op = serde_json::json!({
        "kind": "transaction",
        "source": get_config_field("source").unwrap(),
        "destination": "KT1X7DmWgCU4h1V7hbwPpzwGJcXBfoydcgwW",
        "fee": "100000",
        "counter": format!("{}", counter as u64),
        "gas_limit": "10300",
        "storage_limit": "100",
        "amount": "1",
        "parameters": {
          "entrypoint": "default",
          "value": [
            { "int": "0" },
            { "string": "tz1WtthyqxFXaC46kBC18UXdqboeTqEjqwtX" },
            { "int": "1" },
            { "string": "tz1VcUcuUEcUGSZRcxNcj8JCrCG1xhZVRYt6" },
            { "int": "2" },
            { "string": "2000" },
            { "int": "3" },
            { "string": "0:e7769e2266d49d7e85649c97a27ec2bfd3984edc85985b1ebc4c7725bf104c72" },
            { "int": "4" },
            { "string": "KT1KR2ft6aRthjkcvTW9FrEPRQoxrfuTpark" },
            { "int": "5" },
            { "string": "2" }
          ]
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
        "source": get_config_field("source").unwrap(),
        "destination": "KT1X7DmWgCU4h1V7hbwPpzwGJcXBfoydcgwW",
        "fee":format!("{}", estimate_operation_fee(
            &run_op_res.consumed_gas.parse::<u64>().unwrap(),
            &run_op_res.storage_size.parse::<u64>().unwrap(),
        )),
        "counter": format!("{}", counter + 1 as u64),
        "gas_limit": format!("{}", run_op_res.consumed_gas.parse::<u64>().unwrap() + 100),
        "storage_limit": "100",
        "amount": "1",
        "parameters": {
          "entrypoint": "default",
          "value": [
            { "int": "0" },
            { "string": "tz1WtthyqxFXaC46kBC18UXdqboeTqEjqwtX" },
            { "int": "1" },
            { "string": "tz1VcUcuUEcUGSZRcxNcj8JCrCG1xhZVRYt6" },
            { "int": "2" },
            { "string": "2000" },
            { "int": "3" },
            { "string": "0:e7769e2266d49d7e85649c97a27ec2bfd3984edc85985b1ebc4c7725bf104c72" },
            { "int": "4" },
            { "string": "KT1KR2ft6aRthjkcvTW9FrEPRQoxrfuTpark" },
            { "int": "5" },
            { "string": "2" }
          ]
        }
    }));
    // ************************************************************************************************
    group
}

fn sign_operation(agent: ureq::Agent, rpc: &str, endpoint: &str, branch: String, contract: String) -> Result<OperationSignatureInfo, Error> {
    let local_state = LocalWalletState {
        public_key: PublicKey::from_base58check(get_config_field("public_key").unwrap().as_str()).unwrap(),
        private_key: PrivateKey::from_base58check(get_config_field("private_key").unwrap().as_str()).unwrap(),
    };
    if let Some(state) = Some(&local_state) {
        let body = serde_json::json!({
            "branch": branch,
            "contents": get_group(rpc, endpoint, branch, "tz1Nt3vKhbZpVdCrqgxR9sZDFqUty2h7SMRM")
        });
        // println!("\n\n\n\n\n{:#}", body);
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

fn inject_operations(agent: ureq::Agent, operation_with_signature: &str, endpoint: &str) -> InjectOperationsResult {
    let operation_with_signature_json = SerdeValue::String(operation_with_signature.to_owned());
    println!("{:#}", operation_with_signature_json);

    Ok(agent.post(format!("{}/injection/operation", endpoint).as_str())
       .send_json(operation_with_signature_json)?
       .into_json()?)
}

fn is_mainnet() -> Result<bool, Error> {
    Ok(
        serde_json::from_str::<SerdeValue>(fs::read_to_string("config.json")
            .unwrap()
            .as_str())?
                .clone()["is_mainnet"]
                .clone()
                .as_bool()
                .unwrap()
    )
}

fn get_config_field(field: &str) -> Result<String, Error> {
    Ok(
        serde_json::from_str::<SerdeValue>(fs::read_to_string("config.json")
            .unwrap()
            .as_str())?
                .clone()[field]
                .clone()
                .as_str()
                .unwrap()
                .to_string()
    )
}

fn main() {
    let (rpc, endpoint) = match is_mainnet().unwrap() {
        true => {
            println!("{} Mainnet", style("[WARN]").yellow());
            ("https://hangzhounet.api.tez.ie", "https://api.hangzhounet.tzkt.io")
        },
        false => {
            println!("Hangzhounet");
            ("https://hangzhounet.api.tez.ie", "https://api.hangzhounet.tzkt.io")
        },
    };
    let agent = ureq::Agent::new();
    let branch = get_block_hash(agent.clone(), rpc.to_string());
    let contract = get_config_field("contract").unwrap();
    let res = sign_operation(agent.clone(), rpc, endpoint, branch.clone(), contract).unwrap();
    let inject_res = inject_operations(agent.clone(), res.operation_with_signature.as_str(), rpc).unwrap();
    println!("https://hangzhou2net.tzkt.io/{}", inject_res.as_str().unwrap());
    println!("{}", inject_res);
}