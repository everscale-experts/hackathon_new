use console::style;
use lib::utils::parse_float_amount;
use lib::http_api::HttpApi;
use lib::{Address, PrivateKey, PublicKey};

use crate::commands::CommandError;
use crate::common::exit_with_error;
use crate::common::operation_command::*;

mod common;
mod trezor;
mod ledger;
mod commands;

#[derive(Debug)]
pub struct ParseKeyError {
    kind: KeyKind,
    key: String,
    error: lib::FromPrefixedBase58CheckError,
}

#[derive(PartialEq, Debug, Clone)]
pub enum KeyKind {
    Public,
    Private,
}

pub struct TransferLocal {
    pub verbose: u8,
    pub no_prompt: bool,
    pub endpoint: String,
    pub from: String
}

impl TransferLocal {

    pub fn execute(self) -> Result<(), CommandError> {
        println!("[rust/test/srs/bin/tezedge.rs > execute]");
        Ok(OperationCommand {
            options: OperationOptions {
                no_prompt: self.no_prompt,
            },
            api: Box::new(lib::http_api::HttpApi::new(self.endpoint.clone())),
            // from: public_key.hash().into(),
            // from: public_key,
            // fee: self.fee()?,
            state: Default::default(),
            trezor_state: None,
            ledger_state: None,
            // local_state: Some(LocalWalletState { public_key, private_key }),
        }.transfer()?)
    }
}

fn main() {
    let transfer_obj = TransferLocal {
        verbose: 3,
        no_prompt: false,
        endpoint: "https://rpctest.tzbeta.net".to_string(),
        from: "tz1WtthyqxFXaC46kBC18UXdqboeTqEjqwtX".to_string(),
    };
    let result = transfer_obj.execute();

    match result {
        Ok(_) => println!("Ok"),
        Err(err) => exit_with_error(err)
    }
}
