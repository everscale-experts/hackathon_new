## Installation  
  
## Documentation  
```bash
tezos-client sapling man
```  
  
## Commands  
```bash
tezos-client --endpoint https://rpcalpha.tzbeta.net config update
export TEZOS_CLIENT_UNSAFE_DISABLE_DISCLAIMER=yes  

tezos-client sapling list keys
tezos-client sapling gen key sapling_key_alias
```

два кошелька, которые отличаются одной командой:  
tezos/src/proto_011_PtHangz2/lib_protocol/test/contracts/sapling_contract.tz  
tezos/src/proto_012_Psithaca/lib_protocol/test/contracts/sapling_contract.tz  
  
```bash
tezos-client originate contract shielded-tez transferring 5 from test running ../../Tezos/tezos/src/proto_011_PtHangz2/lib_protocol/test/contracts/sapling_contract.tz --init '{ }' --burn-cap 3
```  
gives:
```text
Waiting for the node to be bootstrapped...
Current head: BLoTcmu9xtEu (timestamp: 2022-02-12T12:45:19.000-00:00, validation: 2022-02-12T12:45:23.065-00:00)
Node is bootstrapped.
The RPC returned with an error code, and the associated body was not a valid error trace:
  { "message": "Missing Authentication Token" }
  It is likely that the answer does not comes directly from a compatible node.

Fatal error:
  origination simulation failed
```

```bash
tezos-client get balance for tz1RJxxu3aeqJkVyofVVFsSyzuVkXKvpKPUv
tezos-client get balance for tz1SYcy5Ss5o4FWdSdRYAsBeHRhbh3ZAmuvm

tezos-client gen keys test
tezos-client list known addresses
tezos-client activate account alice with ...
```  
  
`tezos-client bake for test` gives  
```text
Error:
  Rpc request failed:
     - meth: GET
     - uri: https://rpcalpha.tzbeta.net/chains/main/mempool/pending_operations
     - error: Failed to parse the answer (application/json):
                error:
                  Json_encoding.Unexpected_field("outdated")
                content:
```
  
    
## Created test wallets  
- tz1RJxxu3aeqJkVyofVVFsSyzuVkXKvpKPUv  
- tz1SYcy5Ss5o4FWdSdRYAsBeHRhbh3ZAmuvm  
- tz1YFCMFB3jPgU34Jz8XPEnNvCJKYxhhwKXe  
  - https://hangzhou2net.tzkt.io/tz1YFCMFB3jPgU34Jz8XPEnNvCJKYxhhwKXe  
  - https://hangzhou2net.tzkt.io/tz1YFCMFB3jPgU34Jz8XPEnNvCJKYxhhwKXe/tokens  
  - https://rpc.tzkt.io/ithacanet/chains/main/blocks/head/context/contracts/tz1YFCMFB3jPgU34Jz8XPEnNvCJKYxhhwKXe/balance  
- tz1PjNHrtA273MTxTWoACWMRwp8z55KvgN6M - test  
  - https://hangzhou2net.tzkt.io/tz1PjNHrtA273MTxTWoACWMRwp8z55KvgN6M
  - https://rpc.tzkt.io/ithacanet/chains/main/blocks/head/context/contracts/tz1PjNHrtA273MTxTWoACWMRwp8z55KvgN6M/balance
  
  
## Links  
- [ ] https://assets.tqtezos.com/docs/setup/1-tezos-client/  
  - [X] facet bot link: @tezos_faucet_bot and other tools here: https://baking-bad.org/docs/  
  
## To Study  
- [ ] https://research-development.nomadic-labs.com/research-seminars.html  
- [ ] https://tezos.gitlab.io/active/sapling.html  
  
  