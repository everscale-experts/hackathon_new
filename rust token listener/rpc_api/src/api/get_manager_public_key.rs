use std::fmt::{self, Display};

use types::{Address, PublicKey, FromPrefixedBase58CheckError};
use crypto::ToBase58Check;
use crate::api::TransportError;

#[derive(thiserror::Error, Debug)]
#[error(transparent)]
pub enum GetManagerPublicKeyErrorKind {
    Transport(#[from] TransportError),
    Base58Decode(#[from] FromPrefixedBase58CheckError),
    #[error("Unknown! {0}")]
    Unknown(String),
}

#[derive(thiserror::Error, Debug)]
pub struct GetManagerPublicKeyError {
    pub address: Address,
    pub kind: GetManagerPublicKeyErrorKind,
}

impl Display for GetManagerPublicKeyError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f,
            "getting manager's public key for address \"{}\" failed! Reason: {}",
            self.address.to_base58check(),
            self.kind,
        )
    }
}

pub type GetManagerPublicKeyResult = Result<Option<PublicKey>, GetManagerPublicKeyError>;

pub trait GetManagerPublicKey {
    /// Get public key for given address.
    ///
    /// It is used to check if the account is **revealed** in the blockchain.
    ///
    /// - If account is not yet revealed, it will return `Ok(None)`.
    /// - Otherwise it will return `Ok(PublicKey)`.
    fn get_manager_public_key(&self, addr: &Address) -> GetManagerPublicKeyResult;
}
