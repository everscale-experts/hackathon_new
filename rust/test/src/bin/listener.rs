mod common;
mod commands;
use crate::common::exit_with_error;
use crate::commands::CommandError;
use crate::common::operation_command::*;
use lib::Address;

pub struct RequestLocal {
    pub verbose: u8,
    pub no_prompt: bool,
    pub endpoint: String,
    pub address: String
}

impl RequestLocal {
    pub fn execute(self) -> Result<(), CommandError> {
        let address = Address::from_base58check(&self.address)
            .map_err(|err| ParseAddressError {
                kind: AddressKind::Destination,
                error: err,
                address: self.address.clone()
            }
        )?;
    }
}

fn main() {
    let transfer_obj = RequestLocal {
        verbose: 3,
        no_prompt: false,
        endpoint: "https://rpctest.tzbeta.net".to_string(),
        address: "tz1WtthyqxFXaC46kBC18UXdqboeTqEjqwtX".to_string(),
    };
    let result = transfer_obj.execute();

    match result {
        Ok(_) => println!("Ok"),
        Err(err) => exit_with_error(err)
    }
}
