# Possible scheme  
### Inputs  
Everscale uses [SHA-256 hash algorythm](https://github.com/tonlabs/TON-Solidity-Compiler/blob/master/API.md#sha256)
and [Ed25519-signature](https://github.com/tonlabs/TON-Solidity-Compiler/blob/master/API.md#tvmchecksign)   
Tezos also [sha256](https://hackage.haskell.org/package/morley-1.0.0/docs/Tezos-Crypto-Hash.html)
and [Ed25519 (tz1…)](https://tezosguides.com/wallet_integration/signatures/)  
  
## Algorythm  
- __Alice__ creates random secret value by length of 256(?) bytes and makes a hash of it;  
- __Alice__ sends her Tezos tokens to the Tezos HTLC together with the hash;  
- __Tezos HTLC__ receives tokens, hash and will keep them until it receives Alice's secret value or X hours,
then it will send tokens to bridge wallet or return to Alice's wallet;  
- (optional): Alice notifies bridge software that atomic-swap has begun;  
- __Bridge software__ (called by Alice or received notification from blockchain) sends/mints the same amount of Everscale
tokens to the HTLC on Everscale part of the bridge together with the hash;  
- __Everscale HTLC__ receives tokens, hash and will keep them until it receives Alice's secret value or X hours,
  then it will send tokens to Alice wallet or return them to the bridge wallet;  
- (optional): Alice receives notification from bridge software by http long-polling or websockets;  
- __Alice__ calls Everscale HTLC together with her secret value;  
- __Everscale HTLC__ verifies the secret value by its hash and sends tokens to Alice wallet;  
- (optional):  
- __Bridge software__ (called by Alice or received notification from blockchain) calls Tezos HTLC with Alice's secret value;  
- __Tezos HTLC__: verifies the secret value by its hash and sends tokens to bridge wallet;  
  
## Objects that we have  
First (source) blockchain:  
- Alice's wallet with tokens or coins;  
- Bridge multisignature wallet for every token or coin to keep received assets;  
- HTLC - smart-contract;  
Second (destination) blockchain:  
- Alice's target wallet with tokens or coins;  
- Bridge multisignature wallet for every token or coin to send assets from or to mint;  
- HTLC - smart-contract;  
  
### Questions  
- [X] Q: Should we keep assets at the HTLC or in separate wallet?  
A: On separate wallet to be able to manage and update them separately;  
- [X] Q: Should we keep all tokens in one wallet or create separate wallet for every token?  
A: one wallet, because if we keep different keys for different tokens it will be difficult to manage the keys as
number of tokens could be  more than thousands. In case using the same keys there is no reason to create different wallets.  
- [ ] Q: If Alice doesn't have wallet in target blockchain, should we create it for her?  Could we?  
A: Probably, we should but... In Everscale it is possible if we know her pubkey but most of the wallets require seed
phrase to restore wallet and seed phrase from Tezos wallet will give the different pubkey in Everscale. So user will be
limited to use wallet application which could restore wallet by pubkey/privkey combination.  
In Tezos: ...we can create a multisig with user's pubkey but for now the only way to manage multisig wallet is to use
tezos-cli.  
  
  
  