
### Установить npm install --global yarn  
<br>

### [Comment.ts](\Comment.ts) в этом файле пример передачи данных как для первого так и для второго контракта 
  
Для запуска [Comment.ts](\Comment.ts) прописать в командной страке:  
 npx ts-node Comment.ts
При желании изменить поле коментария 
  
  <br>
  
    
### [Smart_contract1.pascalligo](\Smart_contract1.pascalligo) и [Smart_contract2.pascalligo](\Smart_cotract2.pascaligo) примеры смарт-контрактов  

Чтобы задеблоить смарт контракт:
1. надо перейти по адресу https://ide.ligolang.org/  
2. Вставить код смарт-контракта и выбрать Deploy
3. В Storage написать пустую строку 
4. И нажать Run 

### Реализация опциональных переменных в PascaLigo [тут](https://ligolang.org/docs/language-basics/unit-option-pattern-matching#optional-values)

<br>
<br>

## Multisig 
Multisig от Madfish-solutions [тут](https://github.com/madfish-solutions/tezos-multisig)  
Myltisig от Tezosing  [ссылка](https://github.com/atticlab/tezosign)   
Myltisig TQTezos [тут](https://assets.tqtezos.com/docs/token-contracts/multisig-specialized/2-originate-and-use-multisig-contract/)  
Multisig разработанный на хакатоне https://msig.netlify.app/ гит хаба нету
<br>
<br>

### Multisig от Madfish-solutions  
Чтобы установить себе надо перейти по ссылке все инструкции там 
При запуске Myltisig командой yarn migrate # development возникает ошибка:    
 Error: the LigoLANG compiler  
 Compilation of C:\Project_Bridge\tezos-multisig\contracts\Multisig.ligo failed. See above.

Так же при компиляции отдельно файла contracts\Multisig.ligo возникает ощибка:
Error: File "/tmp/tmp-1wYIOW2PtZBw6.ligo", line 51, character 4 to line 56, character 5:

Invalid assignment to constant variable "s", declared at
File "/tmp/tmp-1wYIOW2PtZBw6.ligo", line 40, characters 55-56:
Написал Тех ментору из madfish она пока не ответила

<br>
<br>

### Multisig TQTezos 
Чтобы установить себе надо перейти по ссылке все инструкции там 
После установки Tezos-client
Команды Tezos-client не рабатают ошибка:  
Warning:  
  Failed to acquire the protocol version from the node  
  Rpc request failed:  
     - meth: GET  
     - uri: http://localhost:8732/chains/main/blocks/head/protocols  
     - error: Unable to connect to the node: "Unix.Unix_error(Unix.ECONNREFUSED,   "connect", "")"  

Error:  
  Unrecognized command.  
  Try using the man command to get more information.  

<br>

### Myltisig от Tezosing
Работает только в тестовой сети, разработка заброшена
Весь код написан на GO
Запускать не пробовал, исходников на Ligо нету 

<br>

### Multisig разработанный на хакатоне
Работает криво либо вообще не работает  
Проблемы с подключением кошелька 
Работает только с Temple Wallet, если вообще работает 
Разработан в прошлом году, проект мертв 




