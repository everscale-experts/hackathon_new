use rpc_api::api::GetProtocolInfoResult;
use rpc_api::api::ProtocolInfo;
mod common;
use serde::Deserialize;
use common::operation_command::LocalWalletState;
use lib::signer::OperationSignatureInfo;
use common::operation_command::exit_with_error_no_wallet_type_selected;
use types::PublicKey;
use types::Forged;
use types::PrivateKey;
use types::NewOperationGroup;
use types::BlockHash;
type Error = Box<dyn std::error::Error>;

#[derive(Deserialize)]
struct ProtocolInfoJson {
    protocol: String,
    next_protocol: String,
}

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

fn forge(group: &NewOperationGroup) -> Forged {
    Forged([
        group.branch.forge().take(),
        group.to_operations_vec().into_iter()
            .flat_map(|op| op.forge().take())
            .collect(),
    ].concat())
}

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
            forged_operation.as_ref(),
        );
        Ok(sig_info)
    } else {
        exit_with_error_no_wallet_type_selected()
    }
}
fn main() {
}