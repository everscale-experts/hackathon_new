use console::style;
use lib::utils::parse_float_amount;
use lib::{Address, PrivateKey, PublicKey};
use crate::commands::CommandError;
use crate::common::exit_with_error;
use crate::common::operation_command::*;
use ureq;

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
        println!("[rust/test/srs/bin/tezedge.rs > execute]");
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
            local_state: Some(LocalWalletState { public_key, private_key }),
        }.transfer(to, self.get_amount())?)
    }
}

fn transfer(from: &str, to: &str, public_key: &str, secret_key: &str, amount: &str) {
    let amount = "1";
    let transfer_obj = TransferLocal {
        verbose: 3,
        no_prompt: false,
        endpoint: "https://rpctest.tzbeta.net".to_string(),
        public_key: public_key.to_string(),
        private_key: secret_key.to_string(),
        from: from.to_string(),
        to: to.to_string(),
        amount: amount.to_string(),
        fee: Option::from("0.1".to_string())
        // Option::from()
    };
    let result = transfer_obj.execute();

    match result {
        Ok(_) => {
            println!("{:?}", ureq::get(format!("http://127.0.0.1:7878/comment=%7B{}%7D",
                                       format!("%22from%22:%22{}%22,%22to%22:%22{}%22,%22amount%22:%22{}%22",
                                               from, to, amount)).as_str()).call().unwrap());
            println!("Ok");
        },
        Err(err) => exit_with_error(err)
    }
}

fn main() {
    let from = "tz1WtthyqxFXaC46kBC18UXdqboeTqEjqwtX";
    let to = "tz1WtthyqxFXaC46kBC18UXdqboeTqEjqwtX";
    let secret_key = "edsk3atvetN6HVmRj7TDG5jJaJNAb9Kj6mCPuaEsw51yWJKNAF7TyD";
    let public_key = "edpkvXvxZNviW3BKegDRPdVAaU5inNudDdTdccHvbHLgYUeNSFuCgH";
    let amount = "1";
    transfer(from, to, public_key, secret_key, amount);
}
