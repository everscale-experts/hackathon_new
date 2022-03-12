# Run  
set directory ../rust_everscale/getCustodians  
```bash
rustup override set 1.58.1
cargo run
```
Also you can change the address in config.json  

# About run (contract method)  
Source: `https://tonlabs.gitbook.io/ton-sdk/guides/work_with_contracts/run_onchain`  
1) Creating a message;  
2) Sending a message;  
3) Receiving the message completion transaction;  
4) Receiving external messages created by `return` function;  
5) Decoding the messages bodies according to the ABI.