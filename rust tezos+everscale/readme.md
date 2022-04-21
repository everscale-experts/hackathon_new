# Bridge with comments
Listens to the second tezos address specified in `tezos_accounts.json`,  
and when sth comes, checks if the transaction belongs  
to a batch and takes the address from the comment in the batch,  
sends as many coins as received from the third everscale address  
specified in `everscale_accounts.json` to the address specified in the batch comment  
Similarly with everscale, but instead of batch payload  

## Run
Choose directory `'rust tezos+everscale'/tezos_everscale/`  
```bash
rustup override set 1.58.1
cargo run --bin bridge_with_comments
```

## Build
Choose directory `'rust tezos+everscale'/tezos_everscale`  
```bash
rustup override set 1.58.1
cargo build --release --bin bridge_with_comments
```
Create empty folder in other directory  
Copy file `bridge_with_comments` from `'rust tezos+everscale'/tezos_everscale/target/release` to your new folder  
Copy folder `dependencies` from `'rust tezos+everscale'/tezos_everscale` to your new folder  
Choose your directory in the terminal and run  
```bash
./tezos_everscale
```
___
# Bridge without comments
Listens to the second tezos address specified in `tezos_accounts.json`,  
and when sth comes, sends from third everscale address (`everscale_accounts.json`) to fourth  
as much coins as recieved. Similarly with everscale  

## Run
Choose directory `'rust tezos+everscale'/tezos_everscale/`  
```bash
rustup override set 1.58.1
cargo run --bin bridge_without_comments
```

## Build
Choose directory `'rust tezos+everscale'/tezos_everscale`  
```bash
rustup override set 1.58.1
cargo build --release --bin bridge_without_comments
```
Create empty folder in other directory  
Copy file `bridge_without_comments` from `'rust tezos+everscale'/tezos_everscale/target/release` to your new folder  
Copy folder `dependencies` from `'rust tezos+everscale'/tezos_everscale` to your new folder  
Choose your directory in the terminal and run  
```bash
./tezos_everscale
```

___
# Relay coin > token (EVER in everscale > xEVER in tezos)
Listens to the HTLC-1 specified in `config.json`,  
and when sth comes, takes address and hash from incoming message,  
then creates the batch in tezos where sends tokens from tezos multisig  
to tezos HTLC-2 and calls createLock() with received address and hash  

## Run
Choose directory `'rust tezos+everscale'/tezos_everscale/`  
```bash
rustup override set 1.58.1
cargo run --bin relay_everscale_tezos
```

## Build
Choose directory `'rust tezos+everscale'/tezos_everscale`  
```bash
rustup override set 1.58.1
cargo build --release --bin relay_everscale_tezos
```
Create empty folder in other directory  
Copy file `relay_everscale_tezos` from `'rust tezos+everscale'/tezos_everscale/target/release` to your new folder  
Copy folder `dependencies` from `'rust tezos+everscale'/tezos_everscale` to your new folder  
Choose your directory in the terminal and run  
```bash
./tezos_everscale
```

___
# Description
## Dependencies
* Modules `crypto`, `rpc_api`, `signer`, `types`, `utils` and `explorer_api` are uses for transactions in tezos  
* Module `ureq` uses for API interaction  
* Folder `json`  
    + `config.json`  
        - `htlc1` - HTLC address in everscale  
        - `tezos_multisig` - multisig address in tezos  
        - `tezos_token_address` - SC address in tezos with tokens  
        - `htlc2` - HTLC address in tezos  
    + `everscale_accounts.json` - list of everscale accounts (E1, E2, E3, E4)  
        - `address` - account address  
        - `pairs` - keys pairs  
            * `public` - account public key  
            * `secret` - account secret key  
    + `HelloWallet.abi.json` - abi for HTLC-1 in everscale  
    + `run_config.json` is uses for config creation in everscale  
    + `SetcodeMultisigWallet.abi.json` - abi for everscale multisig  
    + `tezos_accounts` - list of tezos accounts (T1, T2, T3, T4)  
        - `address` - account address  
        - `public` - account public key  
        - `secret` - account secret key  
    + `tezos_msig_custodians` - list of tezos msig custodians (schema like in `tezos_accounts`)  
    + `transfer.abi.json` - abi for encoding payload  
    + `wallet*.scmsig*.json` - keys pairs of everscale multisig custodians  
        - `public` - account public key  
        - `secret` - account secret key  
