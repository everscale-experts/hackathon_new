use rpc_api::http_api::HttpApi;
mod common;
use common::operation_command::LocalWalletState;
use types::PublicKey;
use types::PrivateKey;
type Error = Box<dyn std::error::Error>;

pub struct OperationSignatureInfo {
    /// base58check with prefix(`Prefix::operation`) encoded operation hash.
    pub operation_hash: String,
    /// forged operation(hex) concatenated with signature('hex').
    pub operation_with_signature: String,
    /// operation signature encoded with base58check with prefix (`Prefix::edsig`).
    pub signature: String,
}

fn sign_operation() -> Result<OperationSignatureInfo, Error> {
    let local_state = LocalWalletState {
        public_key: PublicKey::from_base58check("edpkvXvxZNviW3BKegDRPdVAaU5inNudDdTdccHvbHLgYUeNSFuCgH").unwrap(),
        private_key: PrivateKey::from_base58check("edsk3atvetN6HVmRj7TDG5jJaJNAb9Kj6mCPuaEsw51yWJKNAF7TyD").unwrap(),
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
    let client = HttpApi::new(base_url);
}
