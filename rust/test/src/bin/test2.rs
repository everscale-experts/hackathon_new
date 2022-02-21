use ureq::json;
use std::convert::TryInto;
use serde::Serialize;
use serde::Serializer;
use crypto::blake2b;
use crypto::Prefix;
use crypto::WithPrefix;
use crypto::WithoutPrefix;
use crypto::base58check::{FromBase58Check, ToBase58Check};
use crypto::FromBase58CheckError;
use crypto::NotMatchingPrefixError;
use types::ImplicitAddress;

/// Possible errors for base58checked
#[derive(thiserror::Error, PartialEq, Debug)]
pub enum FromPrefixedBase58CheckError {
    #[error("invalid base58")]
    InvalidBase58,
    #[error("invalid checksum")]
    InvalidChecksum,
    #[error("missing checksum")]
    MissingChecksum,
    #[error("not matching prefix")]
    NotMatchingPrefix,
    #[error("invalid size")]
    InvalidSize,
}

impl From<FromBase58CheckError> for FromPrefixedBase58CheckError {
    fn from(err: FromBase58CheckError) -> Self {
        match err {
            FromBase58CheckError::InvalidBase58 => {
                Self::InvalidBase58
            }
            FromBase58CheckError::InvalidChecksum => {
                Self::InvalidChecksum
            }
            FromBase58CheckError::MissingChecksum => {
                Self::MissingChecksum
            }
        }
    }
}

impl From<NotMatchingPrefixError> for FromPrefixedBase58CheckError {
    fn from(_: NotMatchingPrefixError) -> Self {
        Self::NotMatchingPrefix
    }
}

pub const PUBLIC_KEY_LEN: usize = 32;

#[allow(non_camel_case_types)]
#[derive(PartialEq, Debug, Clone)]
pub enum PublicKey {
    edpk([u8; 32]),
    sppk([u8; 33]),
    p2pk([u8; 33]),
}

impl PublicKey {
    fn try_without_prefix(
        bytes: &[u8],
        prefix: Prefix,
    ) -> Result<(Prefix, Vec<u8>), NotMatchingPrefixError>
    {
        bytes
            .without_prefix(prefix)
            .map(|bytes| (prefix, bytes))
    }

    fn try_into_inner<T, U>(bytes: U) -> Result<T, FromPrefixedBase58CheckError>
        where U: TryInto<T>,
    {
        bytes.try_into().or(Err(FromPrefixedBase58CheckError::InvalidSize))
    }

    pub fn from_base58check(encoded: &str) -> Result<Self, FromPrefixedBase58CheckError> {
        let bytes = encoded.from_base58check()?;

        let (prefix, bytes_vec) = Self::try_without_prefix(&bytes, Prefix::edpk)
            .or_else(|_| Self::try_without_prefix(&bytes, Prefix::sppk))
            .or_else(|_| Self::try_without_prefix(&bytes, Prefix::p2pk))?;

        match prefix {
            Prefix::edpk => Ok(Self::edpk(Self::try_into_inner(bytes_vec)?)),
            Prefix::sppk => Ok(Self::sppk(Self::try_into_inner(bytes_vec)?)),
            Prefix::p2pk => Ok(Self::p2pk(Self::try_into_inner(bytes_vec)?)),
            _ => unreachable!(),
        }
    }

    pub fn hash(&self) -> ImplicitAddress {
        let key = match self {
            Self::edpk(key) => &key[..],
            Self::sppk(key) => &key[..],
            Self::p2pk(key) => &key[..],
        };
        let hash = blake2b::digest_160(key);
        let addr_bytes: [u8; 20] = hash
            .try_into()
            .unwrap();

        match self {
            Self::edpk(_) => ImplicitAddress::tz1(addr_bytes),
            Self::sppk(_) => ImplicitAddress::tz2(addr_bytes),
            Self::p2pk(_) => ImplicitAddress::tz3(addr_bytes),
        }
    }
}

impl ToBase58Check for PublicKey {
    fn to_base58check(&self) -> String {
        self.as_ref()
            .with_prefix(Prefix::edpk)
            .to_base58check()
    }
}

impl AsRef<[u8]> for PublicKey {
    fn as_ref(&self) -> &[u8] {
        match self {
            Self::edpk(k) => k,
            Self::sppk(k) => k,
            Self::p2pk(k) => k,
        }
    }
}

impl Serialize for PublicKey {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
        where S: Serializer
    {
        serializer.serialize_str(
            &self.to_base58check()
        )
    }
}

// fn batch(parameters) {

// }

// fn send_operations(parameters) {

// }

fn transfer() {
    let params = json!("{
        to: \"KT1MeAHVkJp87r9neejmaxCfaccoUfXAssy1\",
        amount: 1,
        parameter: {
            entrypoint: \"transfer\",
            value: {
                prim: \"Pair\",
                args: [
                    {
                        string: \"tz1gVYfPffnmhyZkiEXadeg5SS8uerbXo2DM\"
                    },
                    {
                        prim: \"Pair\",
                        args: [{
                            string: \"tz1f1c3WWBBd4wGF57sJNgej9vKSCG5GTLjd\"
                        },
                        {
                            int: \"2\"
                        }
                    ]}
                ]
            }
        }
    }");
}

fn main() {

}