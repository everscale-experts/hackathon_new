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
Для того чтобы задеплоить мультисиг надо открыть и запустить [файл](/HTLC/deploy_htlc_contract.ts)  

[файл](/HTLC/htlc_contract.tz) тут находиться задеплоиный смарт-контракт в нем дописана функция SUB для вычетания комиссии  

[файл](/HTLC/HTLC_contract.pascaligo) - написанный на pascaligo контракт в котором отсутствует вычитание комиссии, так как компилятор выдает ошибку, что функция SUB устарела   

[файл](/HTLC/call_htlc_contract.ts) - вызов функций контракта  


