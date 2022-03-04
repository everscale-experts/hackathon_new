# Run  
Перейдите в папку `'rust batch listener'/listener` через команду `cd`  
Далее вставьте в терминал  
```bash  
rustup override set 1.52.1  
cargo run --bin listener  
```  
---  
## Настройка  
### Откройте конфиг ('rust batch listener'/listener/config.json)  
```json
{
  "contract": "<сюда вставьте адрес контракта, на котором надо слушать группы транзакций>"  
}
```
  
# Links for readme  
RPC тестнета: https://rpc.hangzhounet.teztnets.xyz  
Explorer тестнета: https://hangzhou.tzstats.com  
Кран тестнета: https://teztnets.xyz/hangzhounet-faucet  
@tezos_faucet_bot - бот для получения тестовых монет, вдруг кому пригодится  
