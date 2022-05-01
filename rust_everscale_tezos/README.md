# Setup
```bash
rustup override set 1.58.1
```

# Run
```bash
cargo run --bin <binary name>
```

# Build
```bash
cargo build --release --bin <binary name>
```
Create empty folder in other directory  
Copy file `tezos_everscale` from `'rust_everscale_tezos'/tezos_everscale/target/release` to your new folder  
Copy folder `dependencies` from `'rust_everscale_tezos'/tezos_everscale` to your new folder  

### Linux
Choose your directory in the terminal and run  
```bash
./tezos_everscale
```

### Windows
Choose your directory and run `tezos_everscale.exe`  
___

# Description
## Bridge without comments (Closed 48)
Listens to the second tezos address specified in `tezos_accounts.json`
and when something comes, sends from third everscale address (`everscale_accounts.json`)
to fourth as much coins as recieved. Similarly with everscale.  

## Bridge with comments (Closed #52)
Listens to the second tezos address specified in `tezos_accounts.json` and when sth comes,
checks if the transaction belongs to a batch and takes the address from the comment
in the batch, sends as many coins as received from the third everscale address specified
in `everscale_accounts.json` to the address specified in the batch comment.
Similarly with everscale, but payload instead of batch.  

## Relay coin > token (EVER in everscale > xEVER in tezos) (Closed #58)
Listens to the HTLC-1 specified in `config.json`, and when sth comes,
takes address and hash from incoming message, then creates the batch
in tezos where sends tokens from tezos multisig to tezos HTLC-2 and
calls createLock() with received destination address and hash.  

## Relay token > coin (wXTZ in everscale > XTZ in tezos) (Closed #59)
Listens to the HTLC-1 specified in `config.json`, and when sth comes,
takes address and hash from incoming message, then creates the batch
in tezos where sends tokens from tezos multisig to tezos HTLC-2 and
calls createLock() with received address and hash.  

## Relay coin > token (XTZ in tezos > wXTZ in everscale) (Closed #60)
Listens to the HTLC-2 specified in `config.json` and when something comes,
takes address and hash from incoming batch, then sends money from
everscale multisig to HTLC-1 and calls createLockWithTokens()
with received destination address and lock hash.

## Relay token > coin (wEVER in tezos > EVER in everscale) (Closed #61)
Everything as in previous ralay, but createLockWithCoins() instead of createLockWithTokens().

## Relay token > token (wUSDT in everscale > xUSDT in tezos) (Closed #89)
Listens HTLC-1 specified in `config.json` and when something comes,
takes receiver address and hash from incoming message, then creates the batch
in tezos where sends tokens from tezos multisig to tezos HTLC-2 using token address
specified in `config.json` and calls createLock() with received destination address and hash.  

## Relay token > token (xUSDT in tezos > wUSDT in everscale) (Closed #91)
Listens HTLC-2 specified in `config.json` and when something comes,
takes receiver address and lock hash from incoming batch, then sends money from
everscale multisig specified in `everscale_accounts.json` which index specified in `config.json`
with encoded payload (see [schema](#everscale)) and calls createLockWithTokens().

## Testing
Doesn`t close anything, used for test previous tasks.

## Dependencies
* Modules `crypto`, `rpc_api`, `signer`, `types`, `utils` and `explorer_api` are used for transactions in tezos  
* Module `ureq` uses for API interaction  
* Folder `json`  
	+ `config.json`  
		- `htlc1` - everscale HTLC address
		- `everscale_multisig_id` - everscale multisig address specified in `everscale_accounts.json`
		- `tezos_multisig` - multisig address in tezos
		- `tezos_token_address` - contract with tokens in tezos
		- `htlc2` - tezos HTLC address
		- `htlc2-coin` - tezos HTLC with coins address
		- `tezos_address_for_sending_coments` - contract with the default() method used for send comments in the batch
	+ `everscale_accounts.json` - list of everscale accounts (E1, E2, E3, E4)  
		- `address` - account address
		- `pairs` - keys pairs
			* `public` - account public key
			* `secret` - account secret key
	+ `HelloWallet.abi.json` - abi for HTLC-1 in everscale  
	+ `htlc1_keys.json` - keypair for everscale HTLC  
	+ `run_config.json` is uses for config creation in everscale  
	+ `SetcodeMultisigWallet.abi.json` - abi for everscale multisig  
	+ `tezos_accounts` - list of tezos accounts (T1, T2, T3, T4)  
		- `address` - account address
		- `public` - account public key
		- `secret` - account secret key
	+ `tezos_msig_custodians` - list of tezos msig custodians (schema as in `tezos_accounts`)  
	+ `transfer.abi.json` - abi for encoding payload  
	+ `wallet*.scmsig**.json` - keys pairs of everscale multisig custodians where * - multisig index, ** - custodian index  
		- `public` - account public key
		- `secret` - account secret key
* Module `lib`  
	+ mods `commands` and common - used for tezos transactions  
	+ mod `everscale`
		- `config.rs` - struct config and functions for config and client creation
		- `contract.rs` - functions read_keys, call_contract_with_client and functoins for abi load
		- `get_functions.rs` - functions that are used to payload encode (get_payload), call mulstisig method get_transactions() and get information from .json files
		- `htlc.rs` - functions that are used to call everscale HTLC methods
		- `message.rs` - functions related with everscale methods (prepare, process, send, etc.)
		- `mod.rs` - file that is needed to identify the mod
		- `multisig.rs` - functions that are used to call everscale multisig methods
	+ mod `tezos`
		- `get_functions.rs` - similarly to file `get_functions.rs` in `everscale`
		- `mod.rs` - file that is needed to identify the mod
		- `multisig.rs` - functions that are used to call tezos multisig methods
		- `operation.rs` - functions that are used to call and create operation, build operation parameters, wait for confirmation etc.
		- `proposals.rs` - functions that are used to create lambda, token and coin proposals
		- `transfer.rs` - function transfer() and structures required for this function
	+ `lib.rs` - file that is needed to identify the library  
	+ `tezos_batch.rs` - functions `create_batch` and `create_batch_with_coins`, as well as the private functions required for them  

## Comments
### Everscale
Note: use `transfer.abi.json` to encode message (payload).  
```json
{
	"comment": "<comment encoded to hex>"
}
```
Comment schema:
```json
{
	"dest": "<everscale address>",
	"hash": "<hash with 0x prefix>"
}
```
Example:
```json
{
	"comment": "7B2264657374223A22307830303130303030303030313233343536373839303132333435363738393031323334353637383930313233343536373839303132333435363738393031323334222C2268617368223A22307863333962323935616566353538613431656634313664636338306263316465663931383537653763313663646634653639386363386466376362356336313134227D"
}
```
### Tezos
Note: put method default() call into the batch where you calling createLock().  
Destination will be parsed from thit method and hash from 
Default() schema:
```json
{
	"string_0": "<tezos receiver address, but it is not used>",
	"string_1": "<tezos sender address, but it is not used>",
	"string_2": "<amount, but it is not used>",
	"string_3": "<everscale receiver address>",
	"string_4": "<tezos token address>",
	"string_5": "<transaction ID, but it is not used>"
}
```
Lock hash will be taken from createLock() parameters.
