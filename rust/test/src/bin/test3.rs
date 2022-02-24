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
    println!("{}", value);
    println!("");
    value
}

fn get_value(agent: ureq::Agent, endpoint: String, contract: String) -> serde_json::Value {
    let body = serde_json::json!([
        {
          "from_": "tz1fGCqibiGS1W7fWCCCCLQ9rzMiayAsMa4R",
          "txs": [
                {
                "to_": "KT1KR2ft6aRthjkcvTW9FrEPRQoxrfuTpark",
                "token_id": "1",
                "amount": "50"
                }
            ]
        }
    ]);
    agent.post(format!("{}/v1/contracts/{}/entrypoints/transfer/build", endpoint, contract).as_str())
        .send_json(body).unwrap()
        .into_json().unwrap()
}

fn get_contract_counter(agent: ureq::Agent, endpoint: String, address: String) -> u64 {
    println!("{}/v1/accounts/{}/counter", endpoint, address);
    agent.get(format!("{}/v1/accounts/{}/counter", endpoint, address).as_str(), "")
        .call().unwrap()
        .into_json().unwrap()
}

pub fn estimate_operation_fee(
    base_fee: u64,
    ntez_per_byte: u64,
    ntez_per_gas: u64,
    estimated_gas: u64,
    estimated_bytes: u64
) -> u64 {
    // add 32 bytes for the branch block hash.
    let estimated_bytes = estimated_bytes + 32;

    base_fee
        + ntez_per_byte * estimated_bytes / 1000
        + ntez_per_gas * (estimated_gas) / 1000
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
    operation_group: &NewOperationGroup
) -> Result<RunOperationContents, RunOperationError> {
    Ok(agent.post(format!("{}/chains/main/blocks/head/helpers/scripts/run_operation", endpoint).as_str())
       .send_json(ureq::json!({
            "chain_id": get_chain_id(agent.clone(), endpoint),
            // "chain_id": "NetXZSsxBpMQeAT",
            "operation": {
                "branch": &operation_group.branch,
                // this is necessary to be valid signature for this call
                // to work, but doesn't need to match the actual operation signature.
                "signature": "edsigthZLBZKMBUCwHpMCXHkGtBSzwh7wdUxqs7C1LRMk64xpcVU8tyBDnuFuf9CLkdL3urGem1zkHXFV9JbBBabi6k8QnhW4RG",
                "contents": operation_group.to_operations_vec()
                    .into_iter()
                    .map(|op| NewOperationWithKind::from(op))
                    .collect::<Vec<_>>(),
            },
       }))?
       .into_json::<RunOperationJson>()?
       .into())
}

fn sign_operation(agent: ureq::Agent, endpoint: &str) -> Result<OperationSignatureInfo, Error> {
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
        let counter = get_contract_counter(agent.clone(), "https://api.hangzhounet.tzkt.io".to_string(), "tz1fGCqibiGS1W7fWCCCCLQ9rzMiayAsMa4R".to_string()) + 1;
        println!("{}", counter);
        let body = serde_json::json!({
            "branch": get_block_hash(agent.clone(), endpoint.to_string()),
            "contents": [
                {
                    "kind": "transaction",
                    "source": "tz1fGCqibiGS1W7fWCCCCLQ9rzMiayAsMa4R",
                    "destination": "KT1RnxeahHnkuyR5Yx4xJc5ECrASvsByVC2g",
                    "fee": "1000",
                    "counter": format!("{}", counter),
                    "gas_limit": "6000",
                    "storage_limit": "100",
                    "amount": "0",
                    "parameters": {
                        "entrypoint": "transfer",
                        "value": get_value(agent.clone(), "https://api.hangzhounet.tzkt.io".to_string(), "KT1RnxeahHnkuyR5Yx4xJc5ECrASvsByVC2g".to_string())
                    }
                }
            ]
        });
        let bytes: serde_json::Value = agent.post(format!("{}/chains/main/blocks/head/helpers/forge/operations", endpoint).as_str())
            .send_json(body).unwrap()
            .into_json().unwrap();
        println!("{}", bytes.as_str().unwrap());
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
    // let opres = run_operation(
    //     agent.clone(),
    //     endpoint.to_string(),
    //     // &NewOperationGroup::new(
    //     //     BlockHash::from_base58check(get_block_hash(agent.clone(), endpoint.to_string()).as_str()).unwrap(),
    //     //     get_block_hash(agent.clone(), endpoint.to_string()))
    //     &NewOperationGroup {
    //         branch: BlockHash::from_base58check(get_block_hash(agent.clone(), endpoint.to_string()).as_str()).unwrap(),
    //         delegation: None,
    //         next_protocol_hash: get_block_hash(agent.clone(), endpoint.to_string()),
    //         origination: None,
    //     }
    // ).unwrap();
    // for i in opres {
    //     println!("{}", i.consumed_gas);
    // };
    let res = sign_operation(agent.clone(), endpoint).unwrap();
    // println!("{}", res.operation_hash);
    println!("{}", res.operation_with_signature);
    // println!("{}", res.signature);
    let inject_res = inject_operations(agent.clone(), res.operation_with_signature.as_str(), endpoint).unwrap();
    println!("https://hangzhou.tzstats.com/{}", inject_res.as_str().unwrap());
    println!("{}", inject_res);
}
