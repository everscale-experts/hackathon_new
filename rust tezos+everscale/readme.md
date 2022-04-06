# Run
Choose directory `'rust tezos+everscale'/tezos_everscale/`  
```bash
rustup override set 1.58.1
cargo run --bin bridge_with_comments
```

# Build
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
