use lib::NewTransactionOperation;
use lib::NewTransactionParameters;
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
use types::NewOperationGroup;
use types::NewOperation;
use types::BlockHash;
use types::micheline::Micheline;
use types::micheline::PrimType;
use ureq::SerdeValue;
type Error = Box<dyn std::error::Error>;
use hex::FromHex;

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
    Ok(agent.get(&get_protocol_info_url(endpoint), &"get_protocol_info")
        .call()?
        .into_json::<ProtocolInfoJson>()?
        .into())
}

fn prim(prim_type: PrimType) -> MichelinePrim {
    MichelinePrim::new(prim_type)
}

fn forge_transaction_parameters(op: NewTransactionParameters) {
    // let mut res = Forged(vec![2]).0;

    // let mut value: Vec<Micheline> = vec![
    //     prim(PrimType::DROP).into(),
    //     prim(PrimType::NIL)
    //         .with_arg(prim(PrimType::operation).into())
    //         .into(),
    // ];
    // value.extend(match op {
    //     // NewTransactionOperation::SetDelegate(addr) => {
    //     //     let delegate = addr.forge().take();
    //     //     vec![
    //     //         prim(PrimType::PUSH).with_args(vec![
    //     //             prim(PrimType::key_hash).into(),
    //     //             Micheline::Bytes(delegate),
    //     //         ]).into(),
    //     //         prim(PrimType::SOME).into(),
    //     //         prim(PrimType::SET_DELEGATE).into(),
    //     //     ]
    //     // }
    //     NewTransactionParameters::CancelDelegate => {
    //         vec![
    //             prim(PrimType::NONE)
    //                 .with_arg(prim(PrimType::key_hash).into())
    //                 .into(),
    //             prim(PrimType::SET_DELEGATE).into(),
    //         ]
    //     }
    //     NewTransactionParameters::Transfer { to, amount } => {
    //         let mut values = match to {
    //             Address::Implicit(dest) => vec![
    //                 prim(PrimType::PUSH).with_args(vec![
    //                     prim(PrimType::key_hash).into(),
    //                     Micheline::Bytes(dest.forge().take()),
    //                 ]).into(),
    //                 prim(PrimType::IMPLICIT_ACCOUNT).into(),
    //             ],
    //             Address::Originated(_) => vec![
    //                 prim(PrimType::PUSH).with_args(vec![
    //                     prim(PrimType::address).into(),
    //                     Micheline::Bytes(to.forge().take()),
    //                 ]).into(),
    //                 prim(PrimType::CONTRACT)
    //                     .with_arg(prim(PrimType::unit).into())
    //                     .into(),
    //                 Micheline::Array(vec![
    //                     prim(PrimType::IF_NONE).with_args(vec![
    //                         Micheline::Array(vec![
    //                             Micheline::Array(vec![
    //                                 prim(PrimType::UNIT).into(),
    //                                 prim(PrimType::FAILWITH).into(),
    //                             ]),
    //                         ]),
    //                         Micheline::Array(vec![]),
    //                     ]).into(),
    //                 ]),
    //             ],
    //         };

    //         values.extend(vec![
    //             prim(PrimType::PUSH).with_args(vec![
    //                 prim(PrimType::mutez).into(),
    //                 Micheline::Int(*amount),
    //             ]).into(),
    //             prim(PrimType::UNIT).into(),
    //             prim(PrimType::TRANSFER_TOKENS).into(),
    //         ]);

    //         values
    //     }
    // });
    // value.push(prim(PrimType::CONS).into());

    // let value_bytes = Micheline::Array(value).forge().take();
    // res.extend(value_bytes.forge());

    // Forged(res)
}

// fn forge(group: &NewOperationGroup) -> Forged {
//     Forged([
//         Forged(group.branch.as_ref().to_vec()).0,
//         group.to_operations_vec().into_iter()
//             .flat_map(|op| {
//                 match op {
//                     // NewOperation::Reveal(op) => op.forge(),
//                     NewOperation::Transaction(op) => forge_transaction_parameters(op),
//                     // NewOperation::Delegation(op) => op.forge(),
//                     // NewOperation::Origination(op) => op.forge(),
//                 }
//             }.0)
//             .collect(),
//     ].concat())
// }

fn get_block_hash(agent: ureq::Agent, endpoint: String) -> String {
    let value = agent.get(format!("{}/chains/main/blocks/head/hash", endpoint).as_str(), "")
        .call().unwrap()
        .into_json().unwrap();
    println!("{}", value);
    println!("");
    value
}

fn sign_operation(agent: ureq::Agent, endpoint: &str) -> Result<OperationSignatureInfo, Error> {
    let local_state = LocalWalletState {
        public_key: PublicKey::from_base58check("edpkvXvxZNviW3BKegDRPdVAaU5inNudDdTdccHvbHLgYUeNSFuCgH").unwrap(),
        private_key: PrivateKey::from_base58check("edsk3atvetN6HVmRj7TDG5jJaJNAb9Kj6mCPuaEsw51yWJKNAF7TyD").unwrap(),
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
        let body = serde_json::json!({
            "branch": get_block_hash(agent.clone(), endpoint.to_string()),
            "contents": [
                {
                  "kind": "transaction",
                  "source": "tz1f1WndyZoUQWU3ujAMCy4b1VtuYhxpc82R",
                  "destination": "KT1MeAHVkJp87r9neejmaxCfaccoUfXAssy1",
                  "fee": "1274",
                  "counter": "3334867",
                  "gas_limit": "5000",
                  "storage_limit": "0",
                  "amount": "1",
                  "parameters": {
                    "entrypoint": "transfer",
                    "value": {
                      "prim": "Pair",
                      "args": [
                        {
                          "bytes": "00007b78f517483cfa4c16f56e11ec2eb20ded2625a9"
                        },
                        {
                          "prim": "Pair",
                          "args": [
                            {
                              "bytes": "00007b78f517483cfa4c16f56e11ec2eb20ded2625a9"
                            },
                            {
                              "int": "16"
                            }
                          ]
                        }
                      ]
                    }
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
    let res = sign_operation(agent.clone(), endpoint).unwrap();
    // println!("{}", res.operation_hash);
    println!("{}", res.operation_with_signature);
    // println!("{}", res.signature);
    let inject_res = inject_operations(agent.clone(), res.operation_with_signature.as_str(), endpoint).unwrap();
    println!("{}", inject_res);
}
