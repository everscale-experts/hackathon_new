use crate::common::OperationGroupGasConsumption;
use lib::BlockHash;
use lib::NewOperationGroup;
use lib::NewOperationWithKind;
use lib::api::RunOperationContents;
use lib::api::RunOperationError;
use rpc_api::api::RunOperationJson;
use lib::api::InjectOperationsResult;
use lib::micheline::MichelinePrim;
use rpc_api::api::GetProtocolInfoResult;
use rpc_api::api::ProtocolInfo;
mod common;
use serde::Deserialize;
use common::operation_command::LocalWalletState;
use lib::signer::OperationSignatureInfo;
use common::operation_command::exit_with_error_no_wallet_type_selected;
use types::PublicKey;
use types::PrivateKey;
use types::micheline::PrimType;
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

fn get_protocol_info_url(base_url: &str) -> String {
    format!("{}/chains/main/blocks/head/protocols", base_url)
}

impl Into<ProtocolInfo> for ProtocolInfoJson {
    fn into(self) -> ProtocolInfo {
        let mut info = ProtocolInfo::default();
        info.protocol_hash = self.protocol;
        info.next_protocol_hash = self.next_protocol;
        info
    }
}

fn get_protocol_info(agent: ureq::Agent, endpoint: &str) -> GetProtocolInfoResult {
    Ok(agent.get(&get_protocol_info_url(endpoint), "")
        .call()?
        .into_json::<ProtocolInfoJson>()?
        .into())
}

fn prim(prim_type: PrimType) -> MichelinePrim {
    MichelinePrim::new(prim_type)
}

fn get_block_hash(agent: ureq::Agent, endpoint: String) -> String {
    let value = agent.get(format!("{}/chains/main/blocks/head/hash", endpoint).as_str(), "")
        .call().unwrap()
        .into_json().unwrap();
    println!("Block hash: {}", value);
    // println!("");
    value
}

fn find_consumed_gas_for_kind(
    kind: &str,
    run_op_contents: &RunOperationContents,
) -> Option<u64> {
    run_op_contents.iter()
        .find(|op| op.kind.as_str() == kind)
        // Add 100 for safety
        .map(|op| op.consumed_gas + 100)
}

pub fn estimate_gas_consumption(
    agent: ureq::Agent,
    endpoint: String,
    branch: String,
    contract: String,
    to: &str,
) -> Result<OperationGroupGasConsumption, RunOperationError>
{
    let op_results = run_operation(agent.clone(), endpoint, branch, contract.clone())?;
    let tx_additional_gas = match to {
        "Implicit" => 1427,
        "Originated" => 2863,
        "SetDelegate" => 1000,
        "CancelDelegate" => 1000,
        _ => 0,
    };

    Ok(OperationGroupGasConsumption {
        reveal: find_consumed_gas_for_kind("reveal", &op_results),
        transaction: find_consumed_gas_for_kind("transaction", &op_results)
            .map(|gas| gas + tx_additional_gas),
        delegation: find_consumed_gas_for_kind("delegation", &op_results),
    })
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
    // println!("{}/v1/accounts/{}/counter", endpoint, address);
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

fn run_operation(
    agent: ureq::Agent,
    endpoint: String,
    branch: String,
    contract: String
) -> Result<RunOperationContents, RunOperationError> {
    Ok(agent.post(format!("{}/chains/main/blocks/head/helpers/scripts/run_operation", endpoint.clone()).as_str())
       .send_json(ureq::json!({
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
                    "destination": "tz1fGCqibiGS1W7fWCCCCLQ9rzMiayAsMa4R",
                    // "parameters": {
                    //     "entrypoint": "default",
                    //     "value": get_value(agent.clone(), "https://api.hangzhounet.tzkt.io".to_string(), contract.clone())
                    // }
                }]
            }
       }))?
       .into_json::<RunOperationJson>()?
       .into())
}

fn sign_operation(agent: ureq::Agent, endpoint: &str, branch: String, contract: String) -> Result<OperationSignatureInfo, Error> {
    let local_state = LocalWalletState {
        public_key: PublicKey::from_base58check("edpkv55oyAHTFXW153wPdQVaCWD5MqQRPWfJHznTZXB72i3Yesz1Rd").unwrap(),
        private_key: PrivateKey::from_base58check("edsk4Nv9m2dieMVmEefcBUePbyYmKxx3C5mjspEnFz7xCBYhTdx46R").unwrap(),
    };
    // let operation_group = NewOperationGroup {
    //     branch: BlockHash::from_base58check("BLpcXF8ADJbGuyUKNv7TypXRd5rqnoPn3PMqJLNBeRSr4VFeUuK").unwrap(),
    //     next_protocol_hash: get_protocol_info(agent.clone(), endpoint).unwrap().next_protocol_hash,
    //     reveal: None,
    //     transaction: None,
    //     delegation: None,
    //     origination: None,
    // };
    if let Some(state) = Some(&local_state) {
        // let forged_operation = operation_group.forge();
        // let body = serde_json::json!({
        //     "branch": get_block_hash(agent.clone(), endpoint.to_string()),
        //     "contents": [
        //         {
        //             "kind": "transaction",
        //             "source": "tz1f1WndyZoUQWU3ujAMCy4b1VtuYhxpc82R",
        //             "destination": "KT1MeAHVkJp87r9neejmaxCfaccoUfXAssy1",
        //             "fee": "1274",
        //             "counter": "3334869",
        //             "gas_limit": "5000",
        //             "storage_limit": "0",
        //             "amount": "1",
        //             "parameters": get_value(agent.clone(), "https://api.hangzhounet.tzkt.io".to_string(), "KT1MeAHVkJp87r9neejmaxCfaccoUfXAssy1".to_string())
        //         }
        //     ]
        // });
        let counter = get_address_counter(agent.clone(), "https://api.hangzhounet.tzkt.io".to_string(), "tz1fGCqibiGS1W7fWCCCCLQ9rzMiayAsMa4R".to_string()) + 1;
        // println!("{}", counter);
        let estimated_gas = estimate_gas_consumption(
            agent.clone(),
            endpoint.to_string(),
            branch.clone(),
            "tz1WtthyqxFXaC46kBC18UXdqboeTqEjqwtX".to_string(),
            "Implicit",
        ).unwrap().total();
        let body = serde_json::json!({
            "branch": branch,
            "contents": [
                {
                    "kind": "transaction",
                    "source": "tz1fGCqibiGS1W7fWCCCCLQ9rzMiayAsMa4R",
                    "destination": contract,
                    "fee": "2688",
                    "counter": format!("{}", counter),
                    "gas_limit": format!("{}", estimated_gas),
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
        println!("{}", estimate_operation_fee(estimated_gas, bytes.as_str().unwrap().len() as u64));
        println!("bytes length: {}", bytes.as_str().unwrap().len());
        println!("");
        let sig_info = state.signer().sign_forged_operation_bytes(
            // forged_operation.as_ref(),
            // bytes,
            // bytes.as_str().unwrap().as_bytes(),
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
    // let op_res = run_operation(
    //     agent.clone(),
    //     endpoint.to_string(),
    //     // &NewOperationGroup::new(
    //     //     BlockHash::from_base58check(get_block_hash(agent.clone(), endpoint.to_string()).as_str()).unwrap(),
    //     //     get_block_hash(agent.clone(), endpoint.to_string()))
    //     branch.clone()
    // ).unwrap();
    // let consumed_gas = op_res[0].consumed_gas;
    // println!("{}", consumed_gas);
    // let estimated_gas = estimate_gas_consumption(
    //     agent.clone(),
    //     endpoint.to_string(),
    //     branch.clone(),
    //     "KT1N8nfEVmHxaKGZei1dYDEarWAF36wcgycw".to_string(),
    //     "Implicit",
    // ).unwrap();
    // println!("***********************************************************");
    // println!("estimated gas: {}", estimated_gas.transaction.unwrap_or(0));
    // println!("***********************************************************");
    let res = sign_operation(agent.clone(), endpoint, branch.clone(), contract.to_string()).unwrap();
    // println!("{}", res.operation_hash);
    println!("{}", res.operation_with_signature);
    // println!("{}", res.signature);
    let inject_res = inject_operations(agent.clone(), res.operation_with_signature.as_str(), endpoint).unwrap();
    println!("https://hangzhou.tzstats.com/{}", inject_res.as_str().unwrap());
    println!("{}", inject_res);
}
