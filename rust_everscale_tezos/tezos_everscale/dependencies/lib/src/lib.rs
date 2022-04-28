//! Simply unifies and reexports all **tezedge-client** crates.
//!
//! Doesn't reexport cli parts/crates.

pub type Error = Box<dyn std::error::Error>;
pub const BASE_FEE: u64 = 100;
pub const MIN_NTEZ_PER_GAS: u64 = 100;
pub const MIN_NTEZ_PER_BYTE: u64 = 1000;
pub const AWAIT_TIMEOUT: u128 = 300000; // ms
pub const RPC: &str = "https://hangzhounet.api.tez.ie";
pub const ENDPOINT: &str = "https://api.hangzhounet.tzkt.io";
pub const CONFIG: &str = "./dependencies/json/config.json";
pub const EVERSCALE_ACCOUNTS: &str = "./dependencies/json/everscale_accounts.json";

pub use crypto::FromBase58Check;
pub use crypto::ToBase58Check;
pub use explorer_api;
pub use rpc_api::*;
pub use types::*;
pub use crypto;
pub use signer;
pub use utils;
pub mod tezos;
pub mod common;
pub mod commands;
pub mod everscale;
pub mod functions;
pub mod tezos_batch;
// pub use trezor_api;
// pub use ledger_api;
