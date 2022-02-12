# Run    
```bash  
cd ./rust/test  
cargo run --bin listener  
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
##### AWS sdk for rust  
https://aws.amazon.com/about-aws/whats-new/2021/12/aws-sdk-rust-developer-preview/  
##### About rust server and API  
https://betterprogramming.pub/rest-api-in-rust-step-by-step-guide-b8a6c5fcbff0  
##### Connect rust server and frontend  
https://www.reddit.com/r/learnrust/comments/fr5s93/how_to_connect_a_rust_backend_to_a_javascript/  
  
## from Slack    
Michael Zaikin - Baking Bad:  
Есть раст клиент https://github.com/tezedge/tezedge-client там есть базовые вещи типа работы с нодой, локальный форджинг и подпись, но правда без доки  
Самый простой вариант для раста будет наверное взять статический бинарник родного клиента для ноды https://github.com/serokell/tezos-packaging и написать легкую обвязку только для тех команд которые нужны.
По тезос-клиенту туториалов много, и доки достаточно подробные  
  
TODO:  
- Задержка в минуту не приемлема - исправить. Выводить (и впоследствии формировать транзакцию в другом блокчейне)
нужно немедленно; Т.е. следует найти способ подписаться на события прихода транзакции на кошелек;  
- Добавить вывод параметра транзакции "комментарий" текстовой строкой;  
  
  
  
