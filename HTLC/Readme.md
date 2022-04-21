# HTLC  
  
# Prerequisites  
### Node.js  
``
### yarn  
`npm i yarn -g`  
### everdev  
`yarn global add everdev`
  
# Run  
```
npm run compile  
npm start
```  
  
```bash
everdev js w SafeMultisigWallet.abi.json -o SafeMultisigWallet.ts -e es6-default
```
  
## пример HTLC контракта  
пример [тут](/HTLC/Hashlock_contract.pascaligo)  
  
Вопрос про htlc контракт на stackExchange https://tezos.stackexchange.com/questions/4076/i-dont-understand-how-the-hashlock-contract-works-in-the-ligo-ide   
полезная ссылка: https://medium.com/protofire-blog/enabling-smart-contract-interaction-in-tezos-with-ligo-functions-and-cps-e3ea2aa49336 тут есть примеры некотрых контрактов
https://answerbun.com/ пример перевода токенов стандарта FA2.0
https://tezos.stackexchange.com/questions/2662/tezos-get-entrypoint-opt-in-ligo-issue
https://ligolang.org/docs/tutorials/taco-shop/tezos-taco-shop-payout - пример трансфера в ligo
https://tezosacademy.io/pascal/chapter-transactions - написано как делать перевод монет и вызывать методы других контрактов
https://docs.chainstack.com/tutorials/tezos/simple-fund-contract-in-ligo#create-the-contract - пример контракта для ввода и вывоа tezos
https://ide.ligolang.org/ - ide ligo
  
# использование HTLC  
  
Для деплоя HTLC контракта переходим в [файл](/HTLC/deploy_htlc_contract.ts) yf 14 строчке меняем название файла на htlc_contract_token1.tz  
после деплоя для совершения транзакции переходим в [файл](call_htlc_contract.ts) и делаем одновременно бач с трансфером токеном и creatLock иначе работать не будет  
  
  
