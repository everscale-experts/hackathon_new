# Tezos DeFi Hackathon 2022  
#### Main links  
https://hackathon2022.tezos.org.ua  
https://tezos.com  

**RPC тестнета:** https://rpc.hangzhounet.teztnets.xyz
**Explorer тестнета:** https://hangzhou.tzstats.com
**Кран тестнета:** https://teztnets.xyz/hangzhounet-faucet

  
## Required result  
  
**Результат**: минимальный фронт, на котором можно отправить токены в Tezos/Everscale, и получить их в Everscale/Tezos.  
  
**Core-функционал**:  
- Пользователь вносит токены на некоторый адрес в Tezos.  
- Группа релеев подтверждает факт события депозита.  
- Пользователь получает токен в сети Everscale (токен минтится).  
- Пользователь сжигает токены в сети Everscale.  
- Группа релеев подтверждает факт события сжигания.  
- Пользователь получает токен в сети Tezos.  
  
**Базовые технологии**:  
- Смарт контракты в Everscale на Solidity  
- Смарт контракты в Tezos  
- Relay software  
  
  
## Architecture  
  
* Off-chain
    * Front:
        * отправить токены в Tezos/Everscale и получить
    * Relay1 - должно быть несколько установок (проверка доверенных сообщений):
        * Получить уведомление о поступлении токенов на контракт Ever;
        * Дернуть контракт в Tezos (сгенерировать транзакцию);
    * Relay2:
        * ...
* On-chain
    * Everscale
        * 
    * Tezos
        * ???
* Common
    * экстренная пауза на фиксированное время с автопродолжением;
    * DAO для управления, например:
        * вывод прибыли
        * смена кода контрактов
            * с задержкой
        * остановка/продолжение работы
        * смена настроек контрактов
    * Шифрование???
    * ZKP???
    * написать e2e-тестирование
        * под user-cases
        * для замера быстродействия и пропускной способности;
  
Как насчет безопасности???  
* релеев должно быть, как минимум 3; половина + 1 должна подтвердить транзакцию;  
* Или крипто-подтверждение   
  
## Наши killer features:
* Привлечь базу тестеров/пользователей
* реализация relay на Rust - решение будет уже максимально production-ready;
* минимальная задержка;
* максимальная пропускная способность;
* DAO для управления мостом;
* шифрование? ZKP?
* Поддержка всех кошельков !!!
* что бы во время свапа минтились токены проекта. И потому на них играть, лотерею и т.д.
* Unit-tests, e2e-tests
* надо еще думать...
* 
  
## Questions:  
* [x] Как нам получать уведомление о получении токенов из Everscale - наверное, сначала как проще (SDK), потом через сервис нотификации.
    * []- через SDK?
    * []- или через сервис нотификации?
* []сколько транзакций ждать? Как их считать? Как обрабатывать rollback'и ?
  
  ## Technical links  
  - https://youtu.be/71RfsmKCjJI  
  - https://tezostaquito.io  
  - https://github.com/ecadlabs/taquito  
  - https://github.com/ecadlabs/taquito/tree/master/packages/taquito-tezbridge-wallet  
  - https://github.com/ecadlabs/taquito/tree/master/packages/taquito-tezbridge-signer  
  - https://github.com/ecadlabs/taquito/tree/master/example  
  - https://github.com/tezedge/tezedge  
  - https://gitlab.com/tezos/tezos-rust-libs  
  
  
  
  
