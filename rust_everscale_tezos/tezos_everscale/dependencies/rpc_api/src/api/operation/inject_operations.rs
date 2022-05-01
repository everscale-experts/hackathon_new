use std::fmt::{self, Display};

use crate::api::TransportError;

#[derive(thiserror::Error, Debug)]
pub enum InjectOperationsError {
    Transport(#[from] TransportError),
    Unknown(String),
}

impl Display for InjectOperationsError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "injecting operation failed! Reason: ")?;
        match self {
            Self::Transport(err) => err.fmt(f),
            Self::Unknown(err) => write!(f, "Unknown! {}", err)
        }
    }
}

pub type InjectOperationsResult = Result<serde_json::Value, InjectOperationsError>;

pub trait InjectOperations {
    fn inject_operations(
        &self,
        operation_with_signature: &str,
    ) -> InjectOperationsResult;
}
