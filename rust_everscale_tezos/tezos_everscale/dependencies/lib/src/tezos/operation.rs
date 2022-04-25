use super::get::*;
use rpc_api::api::InjectOperationsResult;
use rpc_api::api::RunOperationError;
use signer::OperationSignatureInfo;
use hex::FromHex;
use crate::common::operation_command::exit_with_error_no_wallet_type_selected;
use crate::common::operation_command::LocalWalletState;
use crate::*;

pub struct OperationResult {
    pub consumed_gas: String,
    pub storage_size: String,
    pub used_storage: String,
}

pub fn build_parameters(
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

pub fn simulate_operation(
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
    // println!("Running operation... {}/chains/main/blocks/head/helpers/scripts/run_operation", RPC);
    // println!("Body: {:#}", body);
    // println!("\n\n\n\n{:#}", body);
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
        } else { panic!("Operation simulation failed! Body: {:#}\n", body); },
        storage_size: res["storage_size"].as_str().unwrap_or("257").to_string(),
        used_storage: res["paid_storage_size_diff"].as_str().unwrap_or("0").to_string(),
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

pub fn sign_operation(
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
        // println!("\n\n\nSigning...\n{:#}", body);
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

pub fn inject_operations(operation_with_signature: &str) -> InjectOperationsResult {
    let operation_with_signature_json = serde_json::Value::String(operation_with_signature.to_owned());

    Ok(ureq::Agent::new().post(format!("{}/injection/operation", RPC).as_str())
       .send_json(operation_with_signature_json).unwrap()
       .into_json().unwrap())
}

pub fn await_confirmation(hash: &str) -> bool {
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

pub fn await_confirmations(hashes: Vec<String>) -> bool {
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