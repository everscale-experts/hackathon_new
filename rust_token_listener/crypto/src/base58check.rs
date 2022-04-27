// Copyright (c) SimpleStaking and Tezedge Contributors
// SPDX-License-Identifier: MIT

use base58::{FromBase58, ToBase58};
use sodiumoxide::crypto::hash::sha256;

/// Possible errors for base58checked
#[derive(thiserror::Error, Debug, PartialEq)]
pub enum FromBase58CheckError {
    /// Base58 error.
    #[error("invalid base58")]
    InvalidBase58,
    /// The input had invalid checksum.
    #[error("invalid checksum")]
    InvalidChecksum,
    /// The input is missing checksum.
    #[error("missing checksum")]
    MissingChecksum,
}

/// Create double hash of given binary data
fn double_sha256(data: &[u8]) -> sha256::Digest {
    let digest = sha256::hash(data);
    sha256::hash(digest.as_ref())
}

/// A trait for converting a value to base58 encoded string.
pub trait ToBase58Check {
    /// Converts a value of `self` to a base58 value, returning the owned string.
    fn to_base58check(&self) -> String;
}

/// A trait for converting base58check encoded values.
pub trait FromBase58Check {
    /// Size of the checksum used by implementation.
    const CHECKSUM_BYTE_SIZE: usize = 4;

    /// Convert a value of `self`, interpreted as base58check encoded data, into the tuple with version and payload as bytes vector.
    fn from_base58check(&self) -> Result<Vec<u8>, FromBase58CheckError>;
}

impl ToBase58Check for [u8] {
    fn to_base58check(&self) -> String {
        // 4 bytes checksum
        let mut payload = Vec::with_capacity(self.len() + 4);
        payload.extend(self);
        let checksum = double_sha256(self);
        payload.extend(&checksum[..4]);

        payload.to_base58()
    }
}

impl FromBase58Check for str {
    fn from_base58check(&self) -> Result<Vec<u8>, FromBase58CheckError> {
        match self.from_base58() {
            Ok(payload) => {
                if payload.len() >= Self::CHECKSUM_BYTE_SIZE {
                    let data_len = payload.len() - Self::CHECKSUM_BYTE_SIZE;
                    let data = &payload[..data_len];
                    let checksum_provided = &payload[data_len..];

                    let checksum_expected = double_sha256(data);
                    let checksum_expected = &checksum_expected[..4];

                    if checksum_expected == checksum_provided {
                        Ok(data.to_vec())
                    } else {
                        Err(FromBase58CheckError::InvalidChecksum)
                    }
                } else {
                    Err(FromBase58CheckError::MissingChecksum)
                }
            }
            Err(_) => Err(FromBase58CheckError::InvalidBase58),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use sodiumoxide::hex;

    #[test]
    fn test_encode() {
        let decoded = hex::decode("8eceda2f").unwrap().to_base58check();
        let expected = "QtRAcc9FSRg";
        assert_eq!(expected, &decoded);
    }

    #[test]
    fn test_decode() {
        let decoded = "QtRAcc9FSRg".from_base58check().unwrap();
        let expected = hex::decode("8eceda2f").unwrap();
        assert_eq!(expected, decoded);
    }
}
