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
Listens 
