use std::fmt::{self, Display};
use serde::{Serialize, Deserialize};

use crate::api::TransportError;

#[derive(thiserror::Error, Debug)]
pub enum GetProtocolInfoError {
    Transport(#[from] TransportError),
    Unknown(String),
}

impl Display for GetProtocolInfoError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "getting information about protocol failed! Reason: ")?;
        match self {
            Self::Transport(err) => err.fmt(f),
            Self::Unknown(err) => write!(f, "Unknown! {}", err)
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Default)]
pub struct ProtocolInfo {
    pub protocol_hash: String,
    pub next_protocol_hash: String,
}

pub type GetProtocolInfoResult = Result<ProtocolInfo, GetProtocolInfoError>;

pub trait GetProtocolInfo {
    fn get_protocol_info(&self) -> GetProtocolInfoResult;
}
