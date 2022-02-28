# 28.02.2022  
### Что сделано  
Попробовал вызвать метод `transfer` у `KT1RnxeahHnkuyR5Yx4xJc5ECrASvsByVC2g` с параметрами, как у Макса, но при тестовом запуске операции в ответе получил статус
```json
"status": "failed"
```
с ошибкой  
```json 
"with": {
  "string": "FA2_NOT_OPERATOR"
}
```
Поискал в интернете, из-за чего может возникать, но так и не понял, как это исправить и вообще моя ли это ошибка или что-то не так с контрактом. Спросил об этом в слаке.  
https://assets.tqtezos.com/docs/token-contracts/fa2/2-fa2-nft-tutorial/  
https://github.com/oxheadalpha/smart-contracts/blob/master/shared/fa2/lib/fa2_operator_lib.mligo  
https://forklog.com/sp/dev-on-tezos/en/nft-issuance/  
https://gist.github.com/pashius/2d17cb2395a4693d4257e6985a77474f  
https://gitlab.com/tezos/tzip/-/blob/651b22365fc625782faad188799f217ae5ccea2e/proposals/tzip-12/tzip-12.md  
В итоге нашел 
>If the address that invokes a transfer operation is neither a token owner nor one of the permitted operators, the transaction MUST fail with the error mnemonic "FA2_NOT_OPERATOR". If at least  of the transfers in the batch is not permitted, the whole transaction MUST fail.  
Судя по описанию, адрес, с которого я пытался вызвать метод, отсутствует в списке операторов контракта.
Ответ из slack:  
>Чтобы всё получилось, пользователь должен предварительно вызвать метод update_operators и указать адрес контракта в качестве оператора  
Попробовал вызвать `transfer` у `KT1RnxeahHnkuyR5Yx4xJc5ECrASvsByVC2g` с адреса Макса. Успешно  
### Трудности  
`FA2_NOT_OPERATOR`, написал подробнее об этом выше [решено]  
### Планы  
Пока неизвестно  

# 27.02.2022  
### Что сделано  
Упростил функцию, которая считает газ, теперь она работает верно  
Добавил `config.json` (**ещё не проверял с другими параметрами**)  
### Трудности  
Не было  
### Планы  
?????????????????  

# 26.02.2022  
### Что сделано  
Вызвал метод default у контракта KT1N8nfEVmHxaKGZei1dYDEarWAF36wcgycw (хэш операции: oonQjwY2pM31ykMmJaukq95WFycQGGdakvevqrXWP3RoLd5EjWx)  
https://hangzhou.tzstats.com/oonQjwY2pM31ykMmJaukq95WFycQGGdakvevqrXWP3RoLd5EjWx  
https://hangzhou2net.tzkt.io/oonQjwY2pM31ykMmJaukq95WFycQGGdakvevqrXWP3RoLd5EjWx  
Написал функцию, которая вычисляет газ  
Написал функцию, которая вычисляет fee
### Трудности  
Непонятно, почему возникали ошибки `Ill typed data` и `Invalid constant`  
Непонятно, как отправить параметры вызова метода на /helpers/scripts/run_operation и получить ответ, в котором будет consumed_gas, так как это поле отсутствует, если передать параметры вызова метода. Другой способ пока не нашел  
В формуле рассчёта fee используются байты, полученные после форджинга, а для форджинга нужно рассчитать fee. Непонятно, что с этим делать  
### Планы  
- [x] Поправить функцию, которая считает fee (не потребовалось)  
- [x] Поправить функцию, которая считает gas  
- [ ] Разобраться с ошибками `Ill typed data` и `Invalid constant`  
- [x] Добавить config.json  

# 24-25.02.2022  
### Что сделано  
Прочитал про расчёт fee: https://medium.com/aditya-gautam-tech-blog/how-to-calculate-gas-fee-for-a-smart-contract-on-tezos-dee0bd37ca44  
Посмотрел, как taquito рассчитывает fee и gas  
Посмотрел, как tezedge client рассчитывает fee и gas. Более понятно, но ещё не разобрался до конца  
### Трудности  
Для вычисления fee нужен рассчитанный gas, для расчёта которого нужно отправить post-запрос на /helpers/scripts/run_operation, в теле которого нужно указать fee (**решено: как оказалось, указать можно любой fee**)  
### Планы  
1) #### ~~ёдописать расчёт fee и газа (возможно, это решит проблему)~~  
2) #### разобраться с ошибками  
    - [ ] `Ill typed data`  
    - [ ] `Invalid constant`  
    - [ ] `Gas quota exceeded for the operation`  

# 23.02.2022  
### Что сделано  
#### !!!!**Ссылка и адрес операции выводятся в консоль ДО того, как операция уходит в блокчейн, поэтому при переходе по ссылке из консоли можно увидеть `This Operation has not been included into the Tezos blockchain yet`, надо немного подождать**!!!!!  
Сбилдил (build), сфоржил, подписал и отправил транзакцию с вызовом метода в блокчейн на расте  
Замучал Макса Стребкова по поводу подписи https://tezosdefihack-2022.slack.com/archives/C02QS4D5AV8/p1645389926038619  
Научился вызывать методы у контрактов на расте, но пока с ошибками (написал о них ниже)  
Спросил в слаке про ошибки, ответ от Степана Наумова (Baking Bad): `Не совсем понимаю откуда этот скрин, но судя по последней ошибке, выглядит что транзакции не хватило газа для того чтобы выполниться (вероятно кошелёк при моделировании транзакции посчитал что потребуется меньше газа, чем оказалось на самом деле). Но могу быть не прав.`  
Подробнее: https://tezosdefihack-2022.slack.com/archives/C02QS4D5AV8/p1645634351229379  
Пробовал увеличить лимит газа - не помогло, операция не уходит в блокчейн  
### Трудности  
Была проблема с подписью (подробнее можно почитать по ссылке выше) - решено (как оказалось, я неправильно конвертировал байтовую строку в байтовый список)  

Возникает ошибка `Ill typed data` на hangzhou.tzstats.com/{operation} - не решено  
Описание - `The toplevel error thrown when trying to typecheck a data expression against a given type (always followed by more precise errors)`  

Возникает ошибка `Invalid constant` на hangzhou.tzstats.com/{operation} - не решено  
Описание - `A data expression was invalid for its expected type.`  

Возникает ошибка `Gas quota exceeded for the operation` на hangzhou.tzstats.com/{operation} - не решено  
Описание - `A script or one of its callees took more time than the operation said it would.`  

### План на завтра  
1) #### для начала...  
    - [o] дописать расчёт fee и газа (возможно, это решит проблему)  
2) #### разобраться с ошибками (☝️)  
    - [ ] `Ill typed data`  
    - [ ] `Invalid constant`  
    - [ ] `Gas quota exceeded for the operation`  
3) #### и...  
    - [o] добавить возможность вызывать другие методы  
    - [o] добавить config.json  
    - [ ] дописать ожидание ухода операции в блокчейн и вывод результата в консоль (?)  
  
# 22.02.2022    
### Что сделано  
Найдена информация о подписи  
https://tezos.stackexchange.com/questions/2825/how-to-write-my-own-signer  
https://gitlab.com/unit410/tezos-hsm-signer  
https://github.com/lattejed/tezos-azure-hsm-signer  
https://github.com/tacoinfra/remote-signer  
`rust/test/src/common/operation_command/mod.rs` строка 377, функция sign_operation  
### Трудности, если были  
Пока не было  
### План на завтра  
- [x] Сбилдить параметры на расте  
- [x] Сфоржить транзакцию на расте  
- [x] Подписать и сгенерировать hex-строку на расте  
- [x] Отправить байты (hex-строка) с помощью rpc на расте  

# 21.02.2022  
### Что сделано  
- Найден алгоритм для вызова метода контракта без привязки к языки (через сетевой API)    
  - Описание алгоритма:  
1) Сбилдите параметры с помощью тзкт апи: https://api.tzkt.io/#operation/Contracts_BuildEntrypointParametersPOST.  
2) Сфорджите транзакцию с помощью рпц /helpers/forge/operations https://gitlab.com/tezos/tezos/-/blob/master/docs/api/hangzhou-openapi.json.  
3) Отправьте полученные байты с помощью рпц /injection/operation  
  - Документация: https://tezos.gitlab.io/shell/rpc.html.  
  
### Трудности, если были
- третий пункт непонятно, как делать;  
Нашел дополнительную информацию здесь:  
https://tezosguides.com/wallet_integration/basics/sign/  
https://tezos.stackexchange.com/questions/3904/call-contract-entrypoint-that-requires-tez-to-be-sent  
https://baking-bad.org/blog/2021/03/03/tzkt-v14-released-with-improved-smart-contract-data-and-websocket-api/  
  
### План на завтра
- разобраться с третьим пунктом, т.е. как сформировать запрос к RPC;  
Из слека: "тело запроса должно быть хекс строкой, типа "ff00ff00ff00..." - это конкатенация сфордженных байт с подписью"
Ссылка: https://tezosdefihack-2022.slack.com/archives/C02QS4D5AV8/p1645463648299039?thread_ts=1645389926.038619&cid=C02QS4D5AV8  
