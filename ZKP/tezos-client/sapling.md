Commands for working with Sapling transactions:
sapling list keys
List sapling keys.
sapling get balance for <sapling-key> in contract <contract> [-v --verbose]
Get balance associated with given sapling key and contract
<sapling-key>: Sapling key we get balance for.
<contract>: Contract we get balance from.
-v --verbose: Print the collection of non-spent inputs.
sapling export key <name> in <file>
Save a sapling viewing key in a JSON file.
<name>: existing sapling_key alias
<file>: Filename.
sapling derive key <new> from <name> at index <child-index> [-f --force]
[--for-contract <for-contract>] [--unencrypted]
[--memo-size <memo-size>]
Derive a key from an existing one using zip32.
<new>: new sapling_key alias
<name>: existing sapling_key alias
<child-index>: Index of the child to derive.
-f --force: overwrite existing sapling_key
--for-contract <for-contract>: name of the contract to associate new key with
--unencrypted: Do not encrypt the key on-disk (for testing and debugging).
--memo-size <memo-size>: Expected length for message of Sapling transaction
sapling import key <new> [-f --force] [--unencrypted]
[--mnemonic <mnemonic>]
Restore a sapling key from mnemonic.
<new>: new sapling_key alias
-f --force: overwrite existing sapling_key
--unencrypted: Do not encrypt the key on-disk (for testing and debugging).
--mnemonic <mnemonic>: Mnemonic as an option, only used for testing and debugging.
sapling use key <sapling-key> for contract <contract> [--memo-size <memo-size>]
Use a sapling key for a contract.
<sapling-key>: Sapling key to use for the contract.
<contract>: Contract the key will be used on.
--memo-size <memo-size>: Expected length for message of Sapling transaction
sapling gen address <name> [--address-index <idx>]
Generate an address for a key referenced by alias.
<name>: existing sapling_key alias
--address-index <idx>: index of the address to generate
sapling gen key <new> [-f --force] [--unencrypted]
Generate a new sapling key.
<new>: new sapling_key alias
-f --force: overwrite existing sapling_key
--unencrypted: Do not encrypt the key on-disk (for testing and debugging).

Block contextual commands (see option -block):
sapling submit <file> from <alias-tz> using <sapling contract> [--fee <amount>]
[-D --dry-run] [--verbose-signing] [-G --gas-limit <amount>]
[-S --storage-limit <amount>] [-C --counter <counter>]
[-q --no-print-source] [--minimal-fees <amount>]
[--minimal-nanotez-per-byte <amount>]
[--minimal-nanotez-per-gas-unit <amount>] [--force-low-fee]
[--fee-cap <amount>] [--burn-cap <amount>] [--json]
Submit a forged sapling transaction.
<file>: Filename of the forged transaction.
<alias-tz>: Transparent account paying the fees.
<sapling contract>: Smart contract to submit this transaction to.
--fee <amount>: fee in ꜩ to pay to the baker
-D --dry-run: don't inject the operation, just display it
--verbose-signing: display extra information before signing the operation
-G --gas-limit <amount>: Set the gas limit of the transaction instead of letting the client decide based on a simulation
-S --storage-limit <amount>: Set the storage limit of the transaction instead of letting the client decide based on a simulation
-C --counter <counter>: Set the counter to be used by the transaction
-q --no-print-source: don't print the source code
--minimal-fees <amount>: exclude operations with fees lower than this threshold (in tez)
--minimal-nanotez-per-byte <amount>: exclude operations with fees per byte lower than this threshold (in nanotez)
--minimal-nanotez-per-gas-unit <amount>: exclude operations with fees per gas lower than this threshold (in nanotez)
--force-low-fee: Don't check that the fee is lower than the estimated default value
--fee-cap <amount>: Set the fee cap
--burn-cap <amount>: Set the burn cap
--json: Use JSON format
sapling forge transaction <qty> from <src-sap> to <dst-sap> using <sapling contract> [--fee <amount>]
[-D --dry-run] [--verbose-signing] [-G --gas-limit <amount>]
[-S --storage-limit <amount>] [-C --counter <counter>]
[-q --no-print-source] [--minimal-fees <amount>]
[--minimal-nanotez-per-byte <amount>]
[--minimal-nanotez-per-gas-unit <amount>] [--force-low-fee]
[--fee-cap <amount>] [--burn-cap <amount>] [--message <>]
[--file <sapling_transaction>] [--json]
Forge a sapling transaction and save it to a file.
<qty>: Amount taken from shielded wallet of source. in ꜩ
<src-sap>: Sapling account of source.
<dst-sap>: Sapling address of destination.
<sapling contract>: Smart contract to submit this transaction to.
--fee <amount>: fee in ꜩ to pay to the baker
-D --dry-run: don't inject the operation, just display it
--verbose-signing: display extra information before signing the operation
-G --gas-limit <amount>: Set the gas limit of the transaction instead of letting the client decide based on a simulation
-S --storage-limit <amount>: Set the storage limit of the transaction instead of letting the client decide based on a simulation
-C --counter <counter>: Set the counter to be used by the transaction
-q --no-print-source: don't print the source code
--minimal-fees <amount>: exclude operations with fees lower than this threshold (in tez)
--minimal-nanotez-per-byte <amount>: exclude operations with fees per byte lower than this threshold (in nanotez)
--minimal-nanotez-per-gas-unit <amount>: exclude operations with fees per gas lower than this threshold (in nanotez)
--force-low-fee: Don't check that the fee is lower than the estimated default value
--fee-cap <amount>: Set the fee cap
--burn-cap <amount>: Set the burn cap
--message <>: Message for Sapling transaction
--file <sapling_transaction>: file name
--json: Use JSON format
sapling unshield <qty> from <src-sap> to <dst-tz> using <sapling contract> [--fee <amount>]
[-D --dry-run] [--verbose-signing] [-G --gas-limit <amount>]
[-S --storage-limit <amount>] [-C --counter <counter>]
[-q --no-print-source] [--minimal-fees <amount>]
[--minimal-nanotez-per-byte <amount>]
[--minimal-nanotez-per-gas-unit <amount>] [--force-low-fee]
[--fee-cap <amount>] [--burn-cap <amount>]
Unshield tokens from a Sapling address to an implicit account.
<qty>: Amount taken from shielded wallet of source. in ꜩ
<src-sap>: Sapling account of source.
<dst-tz>: Transparent destination account.
<sapling contract>: Smart contract to submit this transaction to.
--fee <amount>: fee in ꜩ to pay to the baker
-D --dry-run: don't inject the operation, just display it
--verbose-signing: display extra information before signing the operation
-G --gas-limit <amount>: Set the gas limit of the transaction instead of letting the client decide based on a simulation
-S --storage-limit <amount>: Set the storage limit of the transaction instead of letting the client decide based on a simulation
-C --counter <counter>: Set the counter to be used by the transaction
-q --no-print-source: don't print the source code
--minimal-fees <amount>: exclude operations with fees lower than this threshold (in tez)
--minimal-nanotez-per-byte <amount>: exclude operations with fees per byte lower than this threshold (in nanotez)
--minimal-nanotez-per-gas-unit <amount>: exclude operations with fees per gas lower than this threshold (in nanotez)
--force-low-fee: Don't check that the fee is lower than the estimated default value
--fee-cap <amount>: Set the fee cap
--burn-cap <amount>: Set the burn cap
sapling shield <qty> from <src-tz> to <dst-sap> using <sapling contract> [--fee <amount>]
[-D --dry-run] [--verbose-signing] [-G --gas-limit <amount>]
[-S --storage-limit <amount>] [-C --counter <counter>]
[-q --no-print-source] [--minimal-fees <amount>]
[--minimal-nanotez-per-byte <amount>]
[--minimal-nanotez-per-gas-unit <amount>] [--force-low-fee]
[--fee-cap <amount>] [--burn-cap <amount>] [--message <>]
Shield tokens from an implicit account to a Sapling address.
<qty>: Amount taken from transparent wallet of source. in ꜩ
<src-tz>: Transparent source account.
<dst-sap>: Sapling address of destination.
<sapling contract>: Smart contract to submit this transaction to.
--fee <amount>: fee in ꜩ to pay to the baker
-D --dry-run: don't inject the operation, just display it
--verbose-signing: display extra information before signing the operation
-G --gas-limit <amount>: Set the gas limit of the transaction instead of letting the client decide based on a simulation
-S --storage-limit <amount>: Set the storage limit of the transaction instead of letting the client decide based on a simulation
-C --counter <counter>: Set the counter to be used by the transaction
-q --no-print-source: don't print the source code
--minimal-fees <amount>: exclude operations with fees lower than this threshold (in tez)
--minimal-nanotez-per-byte <amount>: exclude operations with fees per byte lower than this threshold (in nanotez)
--minimal-nanotez-per-gas-unit <amount>: exclude operations with fees per gas lower than this threshold (in nanotez)
--force-low-fee: Don't check that the fee is lower than the estimated default value
--fee-cap <amount>: Set the fee cap
--burn-cap <amount>: Set the burn cap
--message <>: Message for Sapling transaction
