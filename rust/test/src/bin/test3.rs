use lib::api::RunOperationError;
use lib::api::InjectOperationsResult;
use rpc_api::api::ProtocolInfo;
mod common;
use serde::Deserialize;
use common::operation_command::LocalWalletState;
use lib::signer::OperationSignatureInfo;
use common::operation_command::exit_with_error_no_wallet_type_selected;
use types::PublicKey;
use types::PrivateKey;
use ureq::SerdeValue;
use hex::FromHex;

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

fn get_value(agent: ureq::Agent, endpoint: String, contract: String) -> serde_json::Value {
    let body = serde_json::json!({
        "p4": {
          "p3": {
            "p2": {
              "p1": {
                "nameId": "2",
                "adressContractToken": "KT1KR2ft6aRthjkcvTW9FrEPRQoxrfuTpark"
              },
              "adresResieerEver": "0:c54a25311764a560d64b70b8c334991462e56da9bd48df0074c3b0ed27f4f4fd"
            },
            "amountTz": "9000"
          },
          "adresSenderTz": "tz1VcUcuUEcUGSZRcxNcj8JCrCG1xhZVRYt6"
        },
        "adresResieverTz": "tz1Nt3vKhbZpVdCrqgxR9sZDFqUty2h7SMRM"
      });
    agent.post(format!("{}/v1/contracts/{}/entrypoints/default/build", endpoint, contract).as_str())
        .send_json(body).unwrap()
        .into_json().unwrap()
}

fn get_address_counter(agent: ureq::Agent, endpoint: String, address: String) -> u64 {
    agent.get(format!("{}/v1/accounts/{}/counter", endpoint, address).as_str(), "")
        .call().unwrap()
        .into_json().unwrap()
}

pub fn estimate_operation_fee(
    estimated_gas: u64,
    estimated_bytes: u64
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
    endpoint: String,
    branch: String,
    contract: String,
) -> Result<OperationResult, RunOperationError> {
    let body = ureq::json!({
        "chain_id": get_chain_id(agent.clone(), endpoint.clone()),
        // "chain_id": "NetXZSsxBpMQeAT",
        "operation": {
            "branch": branch,
            // this is necessary to be valid signature for this call
            // to work, but doesn't need to match the actual operation signature.
            "signature": "edsigthZLBZKMBUCwHpMCXHkGtBSzwh7wdUxqs7C1LRMk64xpcVU8tyBDnuFuf9CLkdL3urGem1zkHXFV9JbBBabi6k8QnhW4RG",
            "contents": [{
                "kind": "transaction",
                "source": "tz1fGCqibiGS1W7fWCCCCLQ9rzMiayAsMa4R",
                "fee": "100000",
                "counter": format!("{}", get_address_counter(agent.clone(), "https://api.hangzhounet.tzkt.io".to_string(), "tz1fGCqibiGS1W7fWCCCCLQ9rzMiayAsMa4R".to_string()) + 1),
                "gas_limit": "10300",
                "storage_limit": "257",
                "amount": "50",
                "destination": "KT1N8nfEVmHxaKGZei1dYDEarWAF36wcgycw",
                "parameters": {
                    "entrypoint": "default",
                    "value": get_value(agent.clone(), "https://api.hangzhounet.tzkt.io".to_string(), contract.clone())
                }
            }]
        }
    });
    let res = &agent.post(format!("{}/chains/main/blocks/head/helpers/scripts/run_operation", endpoint.clone()).as_str())
        .send_json(body.clone()).unwrap()
        .into_json::<serde_json::Value>().unwrap()["contents"][0]["metadata"]["operation_result"];
    Ok(OperationResult{
        consumed_gas: res["consumed_gas"].as_str().unwrap().to_string(),
        storage_size: res["storage_size"].as_str().unwrap().to_string(),
    })
}

fn sign_operation(agent: ureq::Agent, endpoint: &str, branch: String, contract: String) -> Result<OperationSignatureInfo, Error> {
    let local_state = LocalWalletState {
        public_key: PublicKey::from_base58check("edpkv55oyAHTFXW153wPdQVaCWD5MqQRPWfJHznTZXB72i3Yesz1Rd").unwrap(),
        private_key: PrivateKey::from_base58check("edsk4Nv9m2dieMVmEefcBUePbyYmKxx3C5mjspEnFz7xCBYhTdx46R").unwrap(),
    };
    if let Some(state) = Some(&local_state) {
        let counter = get_address_counter(
            agent.clone(), "https://api.hangzhounet.tzkt.io".to_string(),
            "tz1fGCqibiGS1W7fWCCCCLQ9rzMiayAsMa4R".to_string(),
        ) + 1;
        let run_op_res = run_operation(
            agent.clone(),
            endpoint.to_string(),
            branch.clone(),
            "KT1N8nfEVmHxaKGZei1dYDEarWAF36wcgycw".to_string(),
        ).unwrap();
        let gas = run_op_res.consumed_gas.parse::<u64>().unwrap() + 100;
        let storage_size = run_op_res.storage_size.parse::<u64>().unwrap();
        let fee = estimate_operation_fee(
            run_op_res.consumed_gas.parse::<u64>().unwrap(),
            run_op_res.storage_size.parse::<u64>().unwrap(),
        );
        let body = serde_json::json!({
            "branch": branch,
            "contents": [
                {
                    "kind": "transaction",
                    "source": "tz1fGCqibiGS1W7fWCCCCLQ9rzMiayAsMa4R",
                    "destination": contract,
                    "fee": format!("{}", fee),
                    "counter": format!("{}", counter),
                    "gas_limit": format!("{}", gas),
                    "storage_limit": "100",
                    "amount": "0",
                    "parameters": {
                        "entrypoint": "default",
                        "value": get_value(agent.clone(), "https://api.hangzhounet.tzkt.io".to_string(), contract)
                    }
                }
            ]
        });
        let bytes: serde_json::Value = agent.post(format!("{}/chains/main/blocks/head/helpers/forge/operations", endpoint).as_str())
            .send_json(body).unwrap()
            .into_json().unwrap();
        println!("gas: {}", gas);
        println!("storage: {}", storage_size);
        println!("fee: {}", fee);
        println!("bytes length: {}", bytes.as_str().unwrap().len());
        println!("");
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

    Ok(agent.post(format!("{}/injection/operation", endpoint).as_str())
       .send_json(operation_with_signature_json)?
       .into_json()?)
}

fn main() {
    let endpoint = "https://hangzhounet.api.tez.ie";
    let agent = ureq::Agent::new();
    let branch = get_block_hash(agent.clone(), endpoint.to_string());
    let contract = "KT1N8nfEVmHxaKGZei1dYDEarWAF36wcgycw";
    let res = sign_operation(agent.clone(), endpoint, branch.clone(), contract.to_string()).unwrap();
    let inject_res = inject_operations(agent.clone(), res.operation_with_signature.as_str(), endpoint).unwrap();
    println!("https://hangzhou2net.tzkt.io/{}", inject_res.as_str().unwrap());
    println!("{}", inject_res);
}
