# Setup  
Set directory ../rust_everscale/sc_method  
```bash
rustup override set 1.58.1
```
Set address in config.json  

# Get custodians  
```bash
cargo run --bin get_custodians
```

# Submit transaction  
```bash
cargo run --bin send_transaction
```

# Confirm transaction  
Paste transaction id on line 82  
```bash
cargo run --bin confirm_transaction
```

# Get transactions  
After confirmation you can see transaction in console output  
```bash
cargo run --bin get_transactions
```
