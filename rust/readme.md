# Run    
go to rust/listener or `rust/test`
```bash  
rustup override set 1.52.1  
cargo run --bin listener  
```  
---  
# Run  
Go to `rust/tests/src/bin/tezedge`  
change variable `public_key` to the correct one on line 150  
change variable `private_key` to the correct one on line 152  
change variable `from` to the correct one on line 154  
change variable `to` to the correct one on line 156  
Also you can change `amount` and `fee` on lines 157 and 158  

# Run
```bash  
cargo run --bin test3  
```  
If not working, try  
```bash  
rustup toolchain install 1.52.1  
rustup override set 1.52.1  
```
---  
  
# Настройка  
+ Перейдите в `rust/test/config.json`  
+ В поле "source" укажите адрес отправителя (того, кто будет вызывать методы у контракта, указанного в поле "contract")  
+ В полях "public_key" и "private_key" укажите публичный и секретный ключи удреса, указанного в source  
+ В поле "transactions" укажите список транзакций, каждая из которых должна выглядеть так:  
```json
{
  "entrypoint": "сюда запишите entrypoint, например, default или transfer",
  "parameters": // параметры, которые нужны для вызова entrypoint
}
```
Пример:
```json
{
  "transactions": [
    {
      "entrypoint": "transfer",
      "parameters": [
        {
          "from_": "tz1Nt3vKhbZpVdCrqgxR9sZDFqUty2h7SMRM",
          "txs": [
            {
              "to_": "tz1LiBrF9gibgH5Lf6a7gDjoUfSEg6nxPKsz",
              "token_id": "1",
              "amount": "1"
            }
          ]
        }
      ]
    },
    {
      "entrypoint": "transfer",
      "parameters": [
        {
          "from_": "tz1Nt3vKhbZpVdCrqgxR9sZDFqUty2h7SMRM",
          "txs": [
            {
              "to_": "tz1LiBrF9gibgH5Lf6a7gDjoUfSEg6nxPKsz",
              "token_id": "1",
              "amount": "2"
            }
          ]
        }
      ]
    }
  ]
}
```

# Helpful (or not) links  
##### Tezos API (b-b)  
https://baking-bad.org/blog/2020/08/06/better-call-dev-tezos-explorer-supports-dalphanet-and-enables-contract-interaction-and-cloning/  
https://baking-bad.org/blog/2020/06/10/better-call-dev-strikes-again/#api-documentation  
##### Tezos API (tzstats)  
https://tzstats.com/docs/api?shell#accounts  
##### Tezos dev portal  
https://tezos.com/developer-portal/  
##### About smartcontracts (RU)  
https://devcourse.tezos.org.ua/tezos-introduction/  
##### Tezos API (interactive)  
http://master.dev.tezedge.com/#/open-api/node  
##### Tezos API  
https://api.tzkt.io/#operation/Contracts_BuildEntrypointParametersPOST  
##### OCaml  
https://ocaml.org/manual/intfc.html#sec481  
##### How to call the Tezos protocol from Rust  
https://medium.com/tezedge/tezos-rust-node-how-to-call-the-tezos-protocol-from-rust-ebbe5becd8f6  
##### Baking Bad: dipdup  
https://docs.dipdup.net/  
##### StructOpt docs  
https://docs.rs/structopt/latest/structopt/  
  
## from taquito  
lines 248-259 from packages/taquito/src/wallet/wallet.ts  
  
  
## Algorithm  
### build parameters (https://api.hangzhounet.tzkt.io/v1/contracts/{address}/entrypoints/transfer/build)  
```json
{
  "from": "<address>",
  "to": "<address>",
  "value": "<amount>"
}
```
### forge transaction through rpc (https://hangzhounet.api.tez.ie/chains/main/blocks/head/helpers/forge/operations)  
```json
{
  "branch": "<hash>",
  "contents": [
    {
      "kind": "transaction",
      "sourse": "<address>",
      "destination": "<address>",
      "fee": "<fee>",
      "counter": "<counter>",
      "gas_limit": "<gas limit>",
      "storage_limit": "<storage limit>",
      "amount": "<amount>"
    }
  ]
}
```
### sign and send bytes through rpc (https://hangzhounet.api.tez.ie/injection/operation)  
```json
"<hex-string>"
```
  
## [ERROR] getting version information failed! Reason: Unknown! Http status: (405, Method Not Allowed), message: Unsupported HTTP method  
### error: process didn't exit successfully: 'target\debug\tezedge.exe' (exit code: 1)  
##### ***Fixed***  


## [ERROR] operation simulation failed! Reason: Failed to read JSON: missing field `consumed_gas` at line 1 column 1014  
### error: process didn't exit successfully: `target\debug\tezedge.exe` (exit code: 1)  
##### ***Working on solution***  


## Algorithm  
### build parameters (https://api.hangzhounet.tzkt.io/v1/contracts/{address}/entrypoints/transfer/build)  
```json
{
"from": "<address>",
"to": "<address>",
"value": "<amount>"
}
```
### forge transaction through rpc (https://hangzhounet.api.tez.ie/chains/main/blocks/head/helpers/forge/operations)  
```json
{
"branch": "<hash>",
"contents": [
{
"kind": "transaction",
"sourse": "<address>",
"destination": "<address>",
"fee": "<fee>",
"counter": "<counter>",
"gas_limit": "<gas limit>",
"storage_limit": "<storage limit>",
"amount": "<amount>"
}
]
}
```
### sign and send bytes through rpc (https://hangzhounet.api.tez.ie/injection/operation)  
```json
"<hex-string>"
```
  
  
  
## From Slack  
Michael Zaikin - Baking Bad:  
Есть раст клиент https://github.com/tezedge/tezedge-client там есть базовые вещи типа работы с нодой, локальный форджинг и подпись, но правда без доки  
Самый простой вариант для раста будет наверное взять статический бинарник родного клиента для ноды https://github.com/serokell/tezos-packaging и написать легкую обвязку только для тех команд, которые нужны.
По тезос-клиенту туториалов много, и доки достаточно подробные  
  
  
# Links for readme  
RPC тестнета: https://rpc.hangzhounet.teztnets.xyz  
Explorer тестнета: https://hangzhou.tzstats.com  
Кран тестнета: https://teztnets.xyz/hangzhounet-faucet  
@tezos_faucet_bot - бот для получения тестовых монет, вдруг кому пригодится  
