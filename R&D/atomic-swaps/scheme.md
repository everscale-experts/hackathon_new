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
  
  
  
  
  
  