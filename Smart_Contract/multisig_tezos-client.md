
# Создание Multisig с tezos-client

## 1.install tezos-client 
### Linux
  `wget https://github.com/serokell/tezos-packaging/releases/latest/download/tezos-client`    
  `chmod +x tezos-client`  
  `mkdir -p $HOME/.local/bin`  
  `mv tezos-client $HOME/.local/bin`  
  `echo 'export PATH="$HOME/.local/bin:$PATH"' >> $HOME/.bashrc`    
  `source $HOME/.bashrc` 

### MacOS
$ brew tap serokell/tezos-packaging-stable https://github.com/serokell/tezos-packaging-stable.git  
$ brew install tezos-client  
<br>

## 2.Get the deplorer key. There are 2 options:
   
 a. Import the deployer private key  
####    tezos-client import secret key deployer1 "unencrypted:edsk..."   
    deployer - это псевдоним которуму мы присваиваем секретный ключ   
 

 b. Generate new keys  
####    tezos-client gen keys signer  
####    tezos-client show address signer -S  
    siner - это псевдоним которуму мы присваиваем секретный ключ   

### готовые аккаунты можно взять [тут](accaunt.txt)
<br>

## 3.Deploy the multisig

###  tezos-client -E "https://rpc.hangzhounet.teztnets.xyz" deploy multisig msig transferring 0 from deployer1 with threshold 3 on public keys "unencrypted:edpk..." "unencrypted:edpk..." "unencrypted:edpk..." "unencrypted:edpk..." "unencrypted:edpk..." --burn-cap 0.3  

msig - псевдоним которуму присваивается адресс контракта   
deployer1 - контракт будет развёрнут с помощью "deployer1"  
with threshold 3 - должно бать сделанно три подписи  
transferring 0 - начальный баланс multisig ноль  
on public keys "unencrypted:edpk..." - публичные ключи подписантов   
--burn-cap 0.3 - плата за газ, она чуть меньше, разница вернется назад кошельку   
<br>

## 4.Создание транзакции

###  tezos-client -E "https://hangzhounet.api.tez.ie" prepare multisig transaction on KT1... transferring 10 to "tz1..." --bytes-only  

  on KT1... - адресс Multisig  
  transferring 10 - количество монет  
  to "tz1..." - адресс получателя  
<br>

## 5.Подписывание транзакции
####  tezos-client sign bytes "0x...." for signer  

 "0x...." - строка байтов которую получаем после выполнения пукта 4 
  signer - псевдоним, кем будет подписана транзакция  
  после подписания транзакции получаем сигнатуру  
<br>

## 6.Выполнение транзакции

###  tezos-client -E "https://rpc.hangzhounet.teztnets.xyz" run transaction "0x...." on multisig contract "KT1..." on behalf of signer with signatures "edsig..." "edsig..." --burn-cap 0.06425 

"0x...." - строка байтов которую получаем после выполнения пукта 4   
`on multisig contract "KT1..."` - the address of the multisig;  
`on behalf of signer` -  says that the `signer` will sign the operation;   
`with signatures "edsig..." "edsig..."` - lists of all signatures.  





