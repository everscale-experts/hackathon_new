use std::fmt::{self, Display};
use structopt::StructOpt;
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

// #[derive(thiserror::Error, Debug)]
#[derive(Debug)]
pub struct ParseKeyError {
    kind: KeyKind,
    /// Input address as string before parsing.
    key: String,
    error: lib::FromPrefixedBase58CheckError,
}

#[derive(PartialEq, Debug, Clone)]
pub enum KeyKind {
    Public,
    Private,
}

// #[derive(PartialEq, Debug, Clone)]
// pub enum AddressKind {
//     Source,
//     Destination,
// }


pub struct TransferLocal {
    /// Verbose mode (-v, -vv, -vvv, etc.)
    // #[structopt(short, long, parse(from_occurrences))]
    pub verbose: u8,

    /// Disable interactivity and accept default answers to prompts.
    // #[structopt(short = "y", long = "no-prompt")]
    pub no_prompt: bool,

    // #[structopt(short = "E", long)]
    pub endpoint: String,

    // #[structopt(long = "public-key")]
    pub public_key: String,

    // #[structopt(long = "private-key")]
    pub private_key: String,

    // #[structopt(short, long)]
    pub from: String,

    // #[structopt(short, long)]
    pub to: String,

    // #[structopt(short, long)]
    pub amount: String,

    /// Specify fee for the transaction.
    ///
    /// If not specified, fee will be estimated and you will be prompted
    /// whether or not you accept estimate or would like to enter custom one.
    // #[structopt(long)]
    pub fee: Option<String>,
}

impl TransferLocal {
    fn get_amount(&self) -> u64 {
        match parse_float_amount(&self.amount) {
            Ok(amount) => amount,
            Err(_) => {
                exit_with_error(format!(
                    "invalid amount: {}",
                    style(&self.amount).bold()
                ));
            }
        }
    }

    fn public_key(&self) -> Result<PublicKey, ParseKeyError> {
        PublicKey::from_base58check(&self.public_key)
            .map_err(|error| ParseKeyError {
                error,
                kind: KeyKind::Public,
                key: self.public_key.to_string(),
            }
        )
    }

    fn private_key(&self) -> Result<PrivateKey, ParseKeyError> {
        PrivateKey::from_base58check(&self.private_key)
            .map_err(|error| ParseKeyError {
                error,
                kind: KeyKind::Private,
                key: self.private_key.to_string(),
            }
        )
    }

    fn fee(&self) -> Result<Option<u64>, InvalidFeeError> {
        if let Some(raw_fee) = self.fee.as_ref() {
            Ok(Some(parse_float_amount(raw_fee)
                .map_err(|_| InvalidFeeError(raw_fee.to_string()))?))
        } else {
            Ok(None)
        }
    }

    pub fn execute(self) -> Result<(), CommandError> {
        // let public_key = self.public_key;
        let public_key = self.public_key().unwrap();
        let private_key: PrivateKey = self.private_key().unwrap();
        let to = Address::from_base58check(&self.to)
        .map_err(|err| ParseAddressError {
            kind: AddressKind::Destination,
            error: err,
            address: self.to.clone(),
        })?;
        
        Ok(OperationCommand {
            options: OperationOptions {
                no_prompt: self.no_prompt,
            },
            api: Box::new(lib::http_api::HttpApi::new(self.endpoint.clone())),
            from: public_key.hash().into(),
            // from: public_key,
            fee: self.fee()?,
            state: Default::default(),
            trezor_state: None,
            ledger_state: None,
            local_state: Some(LocalWalletState { public_key, private_key }),
        }.transfer(to, self.get_amount())?)
    }
}

fn main() {
    let transfer_obj = TransferLocal {
        verbose: 3,
        no_prompt: false,
        endpoint: "https://rpctest.tzbeta.net/".to_string(),
        public_key: "edpkvLzwxgqDf9qp5vGq5UvTHLRvz54PXae1U4UhWSTdjzAiKJbbJB".to_string(),     // from tezedge-client/readme
        private_key: "edsk3p1JnT4LFXuxmcddNoJ7J5u12T7423mshwEikWmcLJnf2XvH7t".to_string(),    // from tezedge-client/readme
        from: "tz1WtthyqxFXaC46kBC18UXdqboeTqEjqwtX".to_string(),                             // from tezedge-client/readme
        to: "tz1WtthyqxFXaC46kBC18UXdqboeTqEjqwtX".to_string(),                               // from tezedge-client/readme
        // public_key: "edsk3UzYXiM8EpxmqwGBj9VQWi2E1uHE49qw156MRcHA8aYWRktYNN".to_string(),     // ???
        // private_key: "edsk2hNyX93gWcDWXUhDk99fK4EHBMMnykFt46RN1S9Vhg4ydmp3Ki".to_string(),    // ???
        // from: "tz1SYcy5Ss5o4FWdSdRYAsBeHRhbh3ZAmuvm".to_string(),
        // to: "tz1SYcy5Ss5o4FWdSdRYAsBeHRhbh3ZAmuvm".to_string(),
        amount: "1".to_string(),
        fee: Option::from("0.1".to_string())   // ???
        // Option::from()
    };
    let result = transfer_obj.execute();

    match result {
        Ok(_) => {}
        Err(err) => exit_with_error(err),
    }

}
