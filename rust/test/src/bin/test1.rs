use console::style;
use lib::utils::parse_float_amount;
use lib::{Address, OriginatedAddress, PrivateKey, PublicKey};
use crate::commands::CommandError;
use crate::common::exit_with_error;
use crate::common::operation_command::*;
use ureq;

mod common;
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
    pub public_key: String,
    pub private_key: String,
    pub contract: String,
    pub from: String,
    pub to: String,
    pub amount: String,
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
            // from: Address::from_base58check("KT1MeAHVkJp87r9neejmaxCfaccoUfXAssy1").unwrap(),
            // from: "KT1MeAHVkJp87r9neejmaxCfaccoUfXAssy1",
            // from: public_key,
            fee: self.fee()?,
            state: Default::default(),
            local_state: Some(LocalWalletState { public_key, private_key }),
        }.transfer(to, self.get_amount())?)
    }
}

fn transfer(contract: &str, from: &str, to: &str, public_key: &str, secret_key: &str, amount: &str) {
    let transfer_obj = TransferLocal {
        verbose: 3,
        no_prompt: false,
        endpoint: "https://rpctest.tzbeta.net".to_string(),
        public_key: public_key.to_string(),
        private_key: secret_key.to_string(),
        contract: contract.to_string(),
        from: from.to_string(),
        to: to.to_string(),
        amount: amount.to_string(),
        fee: Option::from("0.1".to_string())
    };
    let result = transfer_obj.execute();

    match result {
        Ok(_) => {
            println!("Ok");
        },
        Err(err) => exit_with_error(err)
    }
}

fn main() {
    let from = "";
    // let to = "tz1WtthyqxFXaC46kBC18UXdqboeTqEjqwtX";
    let contract = "KT1MeAHVkJp87r9neejmaxCfaccoUfXAssy1";
    let to = "tz1fGCqibiGS1W7fWCCCCLQ9rzMiayAsMa4R";
    let secret_key = "edsk3atvetN6HVmRj7TDG5jJaJNAb9Kj6mCPuaEsw51yWJKNAF7TyD";
    let public_key = "edpkvXvxZNviW3BKegDRPdVAaU5inNudDdTdccHvbHLgYUeNSFuCgH";
    let amount = "0.00001";
    transfer(contract, from, to, public_key, secret_key, amount);
}
