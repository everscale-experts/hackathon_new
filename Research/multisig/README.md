## Task description  
Разобраться с мультисигами, а именно:
1) Найти все существующие мультисиги для Тезос;
2) Задеплоить;
3) Написать инструкцию по использованию с помощью tezos-client;
   1) Создание новой транзакции;  
   2) Подпись существующей транзакции;
4) Сделать пример использования с помощью токито;  
   1) Создание новой транзакции;  
   2) Подпись существующей транзакции;  


# Использование Multisig на taquito:
написать в командной строке yarn  
для запуска транзакции npx ts-node call_multisig2.ts  
И изминить поля как написано в комментариях к коду   


  
## Примеры Multisig  
1) Multisig от Madfish-solutions [тут](https://github.com/madfish-solutions/tezos-multisig) -
последнее обновление 14 месяцев назад  
2) Myltisig от Tezosing  [ссылка](https://github.com/atticlab/tezosign) -
последнее обновление 4 месяца назад  
пример как деплоить multisig [тут](deploy_multisig.ts)   
пример вызова метода multisig [тут](call_multisig2.ts)  
3) Myltisig TQTezos [ссылка](https://wiki.tezos.org.ua/token-contracts-specialized-multisig/2-originate-and-use-multisig-contract)
удалось задеплоить, есть [инструкция](multisig_TQtezos.md)
попытки вызова метода контракта [тут](call_multisig.ts)   
Похоже, что это первый мультисиг, который послужил примером остальным.  
4) Multisig разработанный на хакатоне https://devfolio.co/submissions/tezos-multisig-wallet-1b17
Приложение: https://msig.netlify.app - не подключается temple wallet.  
гит хаба нету: https://github.com/fuzious/multisig-tezos
5) Пример создание Multisig с Tezos-client [ссылка](https://dear-cricket-c83.notion.site/Multisig-9eef3ff65a0e4a3a84109f8d3563a88f)
удалось задеплоить, [инструкция](multisig_tezos-client.md) 
попытки вызова метода контракта [тут](call_multisig1.ts)   
6) Видео по созданию Multisig [ссылка](https://morioh.com/p/674f718d10ac) (ошибка компиляции, truffle при компиляции ligo не указывает параметры компиляции)  
  
### 1) Multisig от Madfish-solutions  
Чтобы установить себе надо перейти по ссылке все инструкции там   
При запуске Myltisig командой yarn migrate # development возникает ошибка:    
```text
Error: the LigoLANG compiler  
Compilation of C:\Project_Bridge\tezos-multisig\contracts\Multisig.ligo failed. See above.  
```  
Так же при компиляции отдельно файла contracts\Multisig.ligo возникает ощибка:  
```text
Error: File "/tmp/tmp-1wYIOW2PtZBw6.ligo", line 51, character 4 to line 56, character 5:  
Invalid assignment to constant variable "s", declared at  
File "/tmp/tmp-1wYIOW2PtZBw6.ligo", line 40, characters 55-56:  
```
Написал Тех ментору из madfish она пока не ответила  

### 2) Multisig от Tezosing  
Работает только в тестовой сети, 
Весь код написан на GO  
Исходников на Ligо нету 
пример как деплоить multisig [тут](deploy_multisig.ts) 

 
  
### 3) Multisig TQTezos  
Работает только с Tezos-client  
Чтобы установить себе надо перейти по ссылке все инструкции там   
После установки Tezos-client  
Команды Tezos-client не работают ошибка:  
```text
Warning:  
Failed to acquire the protocol version from the node  
Rpc request failed:  
- meth: GET  
- uri: http://localhost:8732/chains/main/blocks/head/protocols  
- error: Unable to connect to the node: "Unix.Unix_error(Unix.ECONNREFUSED,   "connect", "")"

Error:  
Unrecognized command.  
Try using the man command to get more information.    
```
Ошибку решил, надо было ввести:
```text
$ tezos-client --endpoint https://rpc.hangzhounet.teztnets.xyz config update
```
  
Новая ошибка не получается установить stack чтобы его видела WSL   
Ошибку решил
  
новая ошибка в tezos-client не получается установить rpc тестнета   
```
Failed to acquire the protocol version from the node  
Rpc request failed:  
- meth: GET  
- uri: https://https%3A%2F%2Frpc.hangzhounet.teztnets.xyz:443/chains/main/blocks/head/protocols  
- error: Unable to connect to the node: "TLS to non-TCP currently unsupported:host=https://rpc.hangzhounet.teztnets.xyz endp=(Unknown "name resolution failed")"  
```
Эта ошибка исчезла сама собой.  

новая ошибка 
```text
Error:  
Unrecognized command.  
Did you mean one of the following?
```
Все ошибки устранены.  
  
### 4) Multisig разработанный на хакатоне
Работает криво либо вообще не работает    
Проблемы с подключением кошелька   
Работает только с Temple Wallet, если вообще работает   
Разработан в прошлом году, проект мертв  
спросил у разработчика о том как найти гитхаб, жду ответа 
  


# Работа с Myltisig с помощью taquito

1. Задеплоить Multisig получилось без проблем
2. Подписывать байтовую строку получается без проблем
3. Вызывать методы Multisig вызывает проблемы:
    1. Непонятно как передовать аргуметы в метод контракта  
    спосил у тех менторов один ответил, но он предложил методы передачи которые не работают, сейчас жду пока ответит другой ментор
    

Какими способами я пытался передавть аргументы:  
1. 
 ```brash   
 const op=await contract.methods.main({
      schema:{
         payload: {
             counter: "0",
             action: {
                 operation: bytes,
                 
             }
         },
         sigs: [
             (await signature).prefixSig,
             (await signature1).prefixSig,
         ]
     }}).send()
```
Ошибка caunter не может быть типа [object, object]   
2. 
```brash
 const op = await contract.methods.main('0x05070707070a000000046252be4f0a0000001601c6958d8e2af23b566c14105fa16526dec49d02c10007070001050502000000350320053d036d0743035d0a00000015003a0f681de989b300fab38bd867439115ac622cbf031e0743036a0080dac409034f034d031b',
 [(await signature).prefixSig, (await signature1).prefixSig]).send();

```
Ошибка 400, биайтовую строку получал с помощью tezos-client,  

3. 
```brach 
const op = await contract.methods.main('0',[(await signature).prefixSig, (await signature1).prefixSig], '0x05070707070a000000046252be4f0a0000001601c6958d8e2af23b566c14105fa16526dec49d02c10007070001050502000000350320053d036d0743035d0a00000015003a0f681de989b300fab38bd867439115ac622cbf031e0743036a0080dac409034f034d031b').send();

```
ошибка 400

4. 
```brach 
contract.methods.default(
   1,
   {
      '1':{'1': 12, '2': 'Contract'}
   },
   [signature]

)
```
ошибка: [sigs] Value must be an array 
Еще была похожая ошибка с caunter


Чтобы кодировать строку надо пользоватся sdk https://netezos.dev/  

Ссылки которые я смотрел:  
https://netezos.dev/docs/get-started.html  
https://netezos.dev/docs/tezos-forging.html  
https://wiki.tezos.org.ua/token-contracts-specialized-multisig/2-originate-and-use-multisig-contract  
https://dear-cricket-c83.notion.site/Multisig-9eef3ff65a0e4a3a84109f8d3563a88f  
https://tezos.gitlab.io/introduction/howtouse.html  
https://news.tezoscommons.org/examples-of-netezos-usage-b6c24be3ce8a  
https://www.nuget.org/packages/Netezos  
https://github.com/baking-bad/netezos    
https://tezostaquito.io/docs/smartcontracts/  
https://tezostaquito.io/typedoc/interfaces/_taquito_taquito.forger.html    
https://medium.com/airgap-it/js-library-to-locally-forge-and-unforge-reveal-and-spend-operations-for-tezos-9fed9db956cc  
(в ней нету тех методов, которые описаны в статье)






