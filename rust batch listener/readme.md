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

## Как это работает  
Сначала (при запуске) отправляется запрос на https://api.hangzhou2net.tzkt.io/v1/accounts/{адрес, указанный в конфиге}/operations
 для получения всех операций адреса, потом программа считает количество операций. Далее начинается бесконечный цикл, где при
 каждой итерации вычисляется количество операций, затем сравнивается с тем количеством, которое было до этого. Если количество
 операций увеличилось, то из запроса достаётся последняя (по времени) операция, после чего отправляется запрос на
 https://api.hangzhou.tzstats.com/explorer/op/{адрес}, из ответа которого проверяется поле "is_batch", равное "true" или "false".
 Если true, то вся группа выводится в консоль.  
  
# Links for readme  
RPC тестнета: https://rpc.hangzhounet.teztnets.xyz  
Explorer тестнета: https://hangzhou.tzstats.com  
Кран тестнета: https://teztnets.xyz/hangzhounet-faucet  
@tezos_faucet_bot - бот для получения тестовых монет, вдруг кому пригодится  
