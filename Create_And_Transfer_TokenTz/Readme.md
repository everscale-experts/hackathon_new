установка  

sudo npm install --global yarn  
yarn  

#yarn add @taquito/taquito  
#sudo npm install typescript --save-dev  
#yarn add @taquito/signer  






#### Подписывание трех и более транзакций одновременно
1. Запустить файл Comment_transaction.ts
2. Пожеланию изменить переменные CONTRACT, SENDER, RECEIVER, AMOUNT, ID
3. После выполнения программы перейти по ссылке с хэшэм и там будет видно группа из нескольких транзакций подписанная за один раз 





#### Создание токенов 
1. Запустить файл token-deployFA2.ts
2. Скопировать адресс контракта 
3. Открыть файл transfer.ts и вставить свой адресс контракта и кошелек получателя


Пользовался: https://github.com/ecadlabs/taquito/blob/master/example/example-Tzip12BigMapTokenMetadata.ts#L59

