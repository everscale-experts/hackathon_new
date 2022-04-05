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
  
## Примеры Multisig  
1) Multisig от Madfish-solutions [тут](https://github.com/madfish-solutions/tezos-multisig) -
последнее обновление 14 месяцев назад  
2) Myltisig от Tezosing  [ссылка](https://github.com/atticlab/tezosign) -
последнее обновление 4 месяца назад  
3) Myltisig TQTezos [ссылка](https://wiki.tezos.org.ua/token-contracts-specialized-multisig/2-originate-and-use-multisig-contract)
удалось задеплоить, есть [инструкция](multisig_TQtezos.md)  
Похоже, что это первый мультисиг, который послужил примером остальным.  
4) Multisig разработанный на хакатоне https://devfolio.co/submissions/tezos-multisig-wallet-1b17
Приложение: https://msig.netlify.app - не подключается temple wallet.  
гит хаба нету: https://github.com/fuzious/multisig-tezos
5) Пример создание Multisig с Tezos-client [ссылка](https://dear-cricket-c83.notion.site/Multisig-9eef3ff65a0e4a3a84109f8d3563a88f)
удалось задеплоить, [инструкция](multisig_tezos-client.md)  
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
Работает только в тестовой сети, разработка заброшена  
Весь код написан на GO  
Запускать не пробовал, исходников на Ligо нету  
  
А вот и ВРАКИ. Исходник здесь: resources/contract.tz  
TODO: Задеплоить, доделать.  
  
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
TODO: спросить автора  
  
### 5) пример создание Multisig
возникла ошибка:   
```text

Failed to read a b58check_encoding data (Signature.Public_key): "edpkedpkuS2PP7wumxVKTv9HfyH9L5CWUqJ8EgezaVDgyEDpJMAMmwUb1C"
```
  