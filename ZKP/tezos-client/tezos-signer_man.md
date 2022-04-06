Access the documentation:
man [<keyword>...] [-v --verbosity <0|1|2|3>]
[--format <plain|colors|html>]
Print documentation of commands.
<keyword>: keyword to search for
-v --verbosity <0|1|2|3>: level of details
--format <plain|colors|html>: the manual's output format

Commands specific to the signing daemon:
launch socket signer [-P --pidfile <filename>]
[-M --magic-bytes <0xHH,0xHH,...>] [-W --check-high-watermark]
[-a --address <host|address>] [-p --port <port number>]
[-t --timeout <timeout>]
Launch a signer daemon over a TCP socket.
-P --pidfile <filename>: write process id in file
-M --magic-bytes <0xHH,0xHH,...>: values allowed for the magic bytes, defaults to any
-W --check-high-watermark: high watermark restriction
-a --address <host|address>: listening address or host name
-p --port <port number>: listening TCP port or service name
-t --timeout <timeout>: timeout before the signer closes client connection (in seconds)
launch local signer [-P --pidfile <filename>]
[-M --magic-bytes <0xHH,0xHH,...>] [-W --check-high-watermark]
[-s --socket <path>]
Launch a signer daemon over a local Unix socket.
-P --pidfile <filename>: write process id in file
-M --magic-bytes <0xHH,0xHH,...>: values allowed for the magic bytes, defaults to any
-W --check-high-watermark: high watermark restriction
-s --socket <path>: path to the local socket file
launch http signer [-P --pidfile <filename>]
[-M --magic-bytes <0xHH,0xHH,...>] [-W --check-high-watermark]
[-a --address <host|address>] [-p --port <port number>]
Launch a signer daemon over HTTP.
-P --pidfile <filename>: write process id in file
-M --magic-bytes <0xHH,0xHH,...>: values allowed for the magic bytes, defaults to any
-W --check-high-watermark: high watermark restriction
-a --address <host|address>: listening address or host name
-p --port <port number>: listening HTTP port
launch https signer <cert> <key> [-P --pidfile <filename>]
[-M --magic-bytes <0xHH,0xHH,...>] [-W --check-high-watermark]
[-a --address <host|address>] [-p --port <port number>]
Launch a signer daemon over HTTPS.
<cert>: path to the TLS certificate
<key>: path to the TLS key
-P --pidfile <filename>: write process id in file
-M --magic-bytes <0xHH,0xHH,...>: values allowed for the magic bytes, defaults to any
-W --check-high-watermark: high watermark restriction
-a --address <host|address>: listening address or host name
-p --port <port number>: listening HTTPS port
add authorized key <pk> [-N --name <name>]
Authorize a given public key to perform signing requests.
<pk>: full public key (Base58 encoded)
-N --name <name>: an optional name for the key (defaults to the hash)

Commands for managing the wallet of cryptographic keys:
list signing schemes
List supported signing schemes.
gen keys <new> [-f --force] [-s --sig <ed25519|secp256k1|p256>]
[--encrypted]
Generate a pair of keys.
<new>: new secret_key alias
-f --force: overwrite existing secret_key
-s --sig <ed25519|secp256k1|p256>: use custom signature algorithm
--encrypted: Encrypt the key on-disk
gen vanity keys <new> matching [<words>...] [-P --prefix] [-f --force]
[--encrypted]
Generate keys including the given string.
<new>: new public key hash alias
<words>: string key must contain one of these words
-P --prefix: the key must begin with tz1[word]
-f --force: overwrite existing keys
--encrypted: Encrypt the key on-disk
encrypt secret key
Encrypt an unencrypted secret key.
import secret key <new> <uri> [-f --force]
Add a secret key to the wallet.
<new>: new secret_key alias
<uri>: secret key
-f --force: overwrite existing secret_key
import public key <new> <uri> [-f --force]
Add a public key to the wallet.
<new>: new public_key alias
<uri>: public key
-f --force: overwrite existing public_key
add address <new> <src> [-f --force]
Add an address to the wallet.
<new>: new public key hash alias
<src>: source public key hash
-f --force: overwrite existing public_key
list known addresses
List all addresses and associated keys.
show address <name> [-S --show-secret]
Show the keys associated with an implicit account.
<name>: existing public key hash alias
-S --show-secret: show the private key
forget address <name> [-f --force]
Forget one address.
<name>: existing public key hash alias
-f --force: delete associated keys when present
forget all keys [-f --force]
Forget the entire wallet of keys.
-f --force: you got to use the force for that
generate nonce for <name> from <data>
Compute deterministic nonce.
<name>: existing public key hash alias
<data>: string from which to deterministically generate the nonce
generate nonce hash for <name> from <data>
Compute deterministic nonce hash.
<name>: existing public key hash alias
<data>: string from which to deterministically generate the nonce hash
import keys from mnemonic <new> [-f --force] [--encrypt]
Import a pair of keys to the wallet from a mnemonic phrase. This command uses the BIP39 algorithm, and therefore imports public/secret keys that may be different from a Ledger application, depending on the BIP32 derivation path used in the Ledger. This command also uses the Ed25519 algorithm, which means it generates tz1 public key hashes.
<new>: new secret_key alias
-f --force: overwrite existing secret_key
--encrypt: encrypt the secret key
pvss gen keys <new> [-f --force]
Generate a pair of PVSS keys.
<new>: new PVSS secret key alias
-f --force: overwrite existing secret_key
pvss list keys
List PVSS keys.
pvss forget keys <name> [-f --force]
Forget one pair of PVSS keys.
<name>: existing PVSS public key alias
-f --force: you got to use the force for that
pvss forget all keys [-f --force]
Forget all PVSS keys.
-f --force: you got to use the force for that

Commands for managing the connected Ledger Nano devices:
list connected ledgers
List supported Ledger Nano devices connected.
show ledger <account-alias-or-ledger-uri> [--test-sign]
Display version/public-key/address information for a Ledger URI
<account-alias-or-ledger-uri>: An imported ledger alias or a ledger URI (e.g. "ledger://animal/curve/path").
--test-sign: Test signing operation
get ledger authorized path for <account-alias-or-ledger-uri>
Query the path of the authorized key
<account-alias-or-ledger-uri>: An imported ledger alias or a ledger URI (e.g. "ledger://animal/curve/path").
authorize ledger to bake for <account-alias-or-ledger-uri>
Authorize a Ledger to bake for a key (deprecated, use `setup ledger ...` with recent versions of the Baking app)
<account-alias-or-ledger-uri>: An imported ledger alias or a ledger URI (e.g. "ledger://animal/curve/path").
setup ledger to bake for <account-alias-or-ledger-uri> [--main-chain-id <ID>]
[--main-hwm <HWM>] [--test-hwm <HWM>]
Setup a Ledger to bake for a key
<account-alias-or-ledger-uri>: An imported ledger alias or a ledger URI (e.g. "ledger://animal/curve/path").
--main-chain-id <ID>: Use <ID> as main chain-id instead of asking the node.
--main-hwm <HWM>: Use <HWM> as main chain high watermark instead of asking the ledger.
--test-hwm <HWM>: Use <HWM> as test chain high watermark instead of asking the ledger.
deauthorize ledger baking for <account-alias-or-ledger-uri>
Deauthorize Ledger from baking
<account-alias-or-ledger-uri>: An imported ledger alias or a ledger URI (e.g. "ledger://animal/curve/path").
get ledger high water mark for <account-alias-or-ledger-uri> [--no-legacy-instructions]
Get high water mark of a Ledger
<account-alias-or-ledger-uri>: An imported ledger alias or a ledger URI (e.g. "ledger://animal/curve/path").
--no-legacy-instructions: Prevent the fallback to the (deprecated) Ledger instructions (for 1.x.y versions of the Baking app)
set ledger high water mark for <account-alias-or-ledger-uri> to <high watermark>
Set high water mark of a Ledger
<account-alias-or-ledger-uri>: An imported ledger alias or a ledger URI (e.g. "ledger://animal/curve/path").
<high watermark>: High watermark
get ledger high watermark for <account-alias-or-ledger-uri> [--no-legacy-instructions]
Get high water mark of a Ledger (legacy/deprecated spelling)
<account-alias-or-ledger-uri>: An imported ledger alias or a ledger URI (e.g. "ledger://animal/curve/path").
--no-legacy-instructions: Prevent the fallback to the (deprecated) Ledger instructions (for 1.x.y versions of the Baking app)
set ledger high watermark for <account-alias-or-ledger-uri> to <high watermark>
Set high water mark of a Ledger (legacy/deprecated spelling)
<account-alias-or-ledger-uri>: An imported ledger alias or a ledger URI (e.g. "ledger://animal/curve/path").
<high watermark>: High watermark
