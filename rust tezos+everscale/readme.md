# Run
Choose directory `'rust tezos+everscale'/tezos_everscale/`  
```bash
rustup override set 1.58.1
cargo run
```

# Build
Choose directory `'rust tezos+everscale'/tezos_everscale`  
```bash
rustup override set 1.58.1
cargo build --release
```
Create empty folder in other directory  
Copy file `tezos_everscale` from `'rust tezos+everscale'/tezos_everscale/target/release` to your new directory  
Copy folder `dependencies` from `'rust tezos+everscale'` to your new directory  
Choose your directory in the terminal  
```bash
./tezos_everscale
```
