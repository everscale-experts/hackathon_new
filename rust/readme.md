# Run  
Go to `rust/test`    
```bash  
cargo run --bin test1  
```  
If not working, try  
```bash  
rustup toolchain install 1.52.1  
```
---  
  
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
  
# Problems  
## build command for ring v0.16.20  
##### Not working:  
https://github.com/shadowsocks/shadowsocks-android/discussions/2819  
https://github.com/briansmith/ring/issues/1163  
https://stackoverflow.com/questions/66758210/failed-to-run-custom-build-command-for-ring-v0-16-12  
https://www.reddit.com/r/rust/comments/mtfw8x/i_get_this_error_with_in_this_cargotoml_file/  
https://stackoverflow.com/questions/68149955/rust-sorry-unimplemented-64-bit-mode-not-compiled-in/70628855#70628855  
  
### Help:  
```bash  
rustup override set 1.52.1  
```  
  
## ArrayVec compile problem  
##### Not working:  
https://github.com/bluss/arrayvec/issues/83  
https://github.com/rust-lang/cargo/issues/8759  
https://bugzilla.mozilla.org/show_bug.cgi?id=1582555  
https://github.com/docker/docker-py/issues/2820  
  
### Help:  
```bash  
rustup override set 1.52.1  
```  
  
## Rust_decimal compile problem  
##### Not working:  
changing IDE  
run online  
changing rust_decimal version  
***fixed (rewritten rust/utils/src/parse_float_amount.rs)***  
  
## Ureq compile problem  
##### Not working:  
changing IDE  
changing ureq version  
***fixed (added ureq (2.0.1) to /rust)***  
  

## [ERROR] getting version information failed! Reason: Unknown! Http status: (405, Method Not Allowed), message: Unsupported HTTP method  
### error: process didn't exit successfully: 'target\debug\tezedge.exe' (exit code: 1)  
##### ***Fixed***  
  
  
## [ERROR] operation simulation failed! Reason: Failed to read JSON: missing field `consumed_gas` at line 1 column 1014  
### error: process didn't exit successfully: `target\debug\tezedge.exe` (exit code: 1)  
##### ***Working on solution***  
  
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


