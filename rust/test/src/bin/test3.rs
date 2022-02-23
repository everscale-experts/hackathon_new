use lib::NewTransactionOperation;
use lib::NewTransactionParameters;
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
type Error = Box<dyn std::error::Error>;

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

fn sign_operation() -> Result<OperationSignatureInfo, Error> {
    let endpoint = "https://hangzhounet.api.tez.ie";
    let agent = ureq::Agent::new();
    let local_state = LocalWalletState {
        public_key: PublicKey::from_base58check("edpkvXvxZNviW3BKegDRPdVAaU5inNudDdTdccHvbHLgYUeNSFuCgH").unwrap(),
        private_key: PrivateKey::from_base58check("edsk3atvetN6HVmRj7TDG5jJaJNAb9Kj6mCPuaEsw51yWJKNAF7TyD").unwrap(),
    };
    let operation_group = NewOperationGroup {
        branch: BlockHash::from_base58check("BLpcXF8ADJbGuyUKNv7TypXRd5rqnoPn3PMqJLNBeRSr4VFeUuK").unwrap(),
        next_protocol_hash: get_protocol_info(agent, endpoint).unwrap().next_protocol_hash,
        reveal: None,
        transaction: None,
        delegation: None,
        origination: None,
    };
    if let Some(state) = Some(&local_state) {
        // let forged_operation = operation_group.forge();
        let sig_info = state.signer().sign_forged_operation_bytes(
            "92122a7e654cdff09e22a7be1b7d41bd279ffa197a0137e6fea0d3ed3ce95fc06c002122d44d997e158c36c60649d198c4175dad425efa09d2a405f44e000101420eaa410ac21addf427211cddd6115cba385a940000".as_bytes(),
        );
        Ok(sig_info)
    } else {
        exit_with_error_no_wallet_type_selected()
    }
}

fn main() {
    println!("{}", sign_operation().unwrap().operation_hash);
}
