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
    - [ ] дописать расчёт fee и газа (возможно, это решит проблему)  
2) #### разобраться с ошибками (☝️)  
    - [ ] `Ill typed data`  
    - [ ] `Invalid constant`  
    - [ ] `Gas quota exceeded for the operation`  
3) #### и...  
    - [ ] дописать расчёт fee и газа  
    - [ ] добавить возможность вызывать другие методы  
    - [ ] добавить config.json  
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
