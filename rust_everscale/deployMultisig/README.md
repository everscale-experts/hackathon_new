# Как задеплоить мультисиг-кошелек  
  
Переходим в текущую папку с файлами `SetcodeMultisigWallet.tvc` и `SetcodeMultisigWallet.abi.json`.
  
1) Генерируем 3 пары ключей:  
```csh
tonos-cli genaddr --genkey wallet.scmsig1.json SetcodeMultisigWallet.tvc SetcodeMultisigWallet.abi.json
tonos-cli genaddr --genkey wallet.scmsig2.json SetcodeMultisigWallet.tvc SetcodeMultisigWallet.abi.json
tonos-cli genaddr --genkey wallet.scmsig3.json SetcodeMultisigWallet.tvc SetcodeMultisigWallet.abi.json
```  
3) Выводим содержимое:  
```csh
cat wallet.*
```  
5) Запускаем команду деплоя, подставляя в параметр owners публичные ключи, 
показанные предыдущей командой, дополненные префиксом 0x, в моем случае это будет вот такая команда:  
```csh
tonos-cli deploy SetcodeMultisigWallet.tvc '{"owners":["0xf8780f83d8c5951de73cb3c07b134ecd5d00917a9083e3ea30721ca10063defc","0xe795829a2d866d52b611e40ccc0cda9b720565a15d3aa62b96073baab45e7d27","0x8b9be2bea26b47c293b28f8361ec63ea325a53105c866110b2525d4a38deff11"],"reqConfirms":3}' --abi SetcodeMultisigWallet.abi.json --sign wallet.scmsig1.json
```
Она выдаст ошибку и ничего не задеплоит, потому что на аккаунте нет денег, но покажет адрес аккаунта, например:  
`account_address": "0:937483f070202bea2df057b887337db7ae1103f66432209dd9ea2d364102e7c9`  
6) Пересылаем туда денежку, например один кристалл или рубин.  
7) Повторяем команду деплоя. В этот раз деплой пройдет успешно:  
```csh
Transaction succeeded.
Contract deployed at address: 0:937483f070202bea2df057b887337db7ae1103f66432209dd9ea2d364102e7c9
```  
#### Результат: кошелек по адресу 0:937483f070202bea2df057b887337db7ae1103f66432209dd9ea2d364102e7c9


9) Проверяем, что кошелек задеплоился и что на аккаунте есть деньги:  
`tonos-cli account 0:937483f070202bea2df057b887337db7ae1103f66432209dd9ea2d364102e7c9`
10) Получаем список кастодианов кошелька:  
`tonos-cli run 0:937483f070202bea2df057b887337db7ae1103f66432209dd9ea2d364102e7c9 getCustodians {} --abi SetcodeMultisigWallet.abi.json`  
11) Отправляем 1 кристалл/рубин c мультисиг кошелька на другой адрес:  
```csh
tonos-cli call 0:937483f070202bea2df057b887337db7ae1103f66432209dd9ea2d364102e7c9 submitTransaction '{"dest":"0:6f4bdf89f15df6be4204e4a9a78661ce709b750655d191a5911a2c3c6f6ece1d","value":1000000000,"bounce":"true","allBalance":"false","payload":""}' --abi SetcodeMultisigWallet.abi.json --sign wallet.scmsig1.json
```
Вместо отправки команда выдаст номер транзакции, которую надо будет подписать остальным кастодианам кошелька:  
```csh
Result: {
  "transId": "7076466742909715265"
}
```
Все неподписанные транзакции можно получить следующей командой:  
```csh
tonos-cli run 0:937483f070202bea2df057b887337db7ae1103f66432209dd9ea2d364102e7c9 getTransactions {} --abi SetcodeMultisigWallet.abi.json
```
12) Подписываем получившуюся транзакцию от имени двух других кастодианов 
(ключи в wallet.scmsig2.json и wallet.scmsig3.json):  
```csh
tonos-cli call 0:937483f070202bea2df057b887337db7ae1103f66432209dd9ea2d364102e7c9 confirmTransaction '{"transactionId":"7076466742909715265"}' --abi SetcodeMultisigWallet.abi.json --sign wallet.scmsig2.json
tonos-cli call 0:937483f070202bea2df057b887337db7ae1103f66432209dd9ea2d364102e7c9 confirmTransaction '{"transactionId":"7076466742909715265"}' --abi SetcodeMultisigWallet.abi.json --sign wallet.scmsig3.json
```
После чего данная транзакция пропадет из выдачи метода `getTransactions`, а денежки отправятся получателю.  
  
  
