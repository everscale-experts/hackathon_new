# Multisig TezosTQ

## 1.install tezos-client 
### Linux
  `wget https://github.com/serokell/tezos-packaging/releases/latest/download/tezos-client`    
  `chmod +x tezos-client`  
  `mkdir -p $HOME/.local/bin`  
  `mv tezos-client $HOME/.local/bin`  
  `echo 'export PATH="$HOME/.local/bin:$PATH"' >> $HOME/.bashrc`    
  `source $HOME/.bashrc` 
  
  `tezos-client --endpoint https://rpc.hangzhounet.teztnets.xyz config update`

### MacOS
$ brew tap serokell/tezos-packaging-stable https://github.com/serokell/tezos-packaging-stable.git  
$ brew install tezos-client  

tezos-client --endpoint https://rpc.hangzhounet.teztnets.xyz config update
<br>
<br>

## 2. install stack and lorentz-contract-multisig

 Клонируйте [репозиторий lorentz-contract-multisig](https://github.com/tqtezos/lorentz-contract-multisig) и следуйте инструкциям в [README](https://github.com/tqtezos/lorentz-contract-multisig/blob/master/README.md),
  чтобы установить зависимости, необходимые для использования lorentz-contract-multisig.
<br>
<br>


## 3.создание Multisig

### готовые аккаунты и готовые Multisig можно взять [тут](accaunt.txt)    

`tezos-client --wait none originate contract MultisigNat1 transferring 0 from tz1i5w4BTmwB51efYjcziq6G5eJC5ra2gqHF running "$(stack exec -- lorentz-contract-multisig`     `GenericMultisig \  `
 ` print-specialized --parameterType 'nat' --oneline)"   --init "$(stack exec -- lorentz-contract-multisig GenericMultisig \  `  
  `init-specialized --threshold 1 \  `  
  `--signerKeys "[\"edpkvUnVLfHfmdK9jJcoAwSqPy9Qbb2asVJFq18cLJosBs6keoPwVD\",\"edpku6o7mjAwDJptsqRH2R3tt7UKqkB15jbmRx8sPfBzgzJGUnhSnv\"]")"   --burn-cap 1.14  `  

MultisigNat1 - псевдоним Multisig
transferring 0 - первоначальный баланс multisig
from tz1i5w4BTmwB51efYjcziq6G5eJC5ra2gqHF - создатель контракта, адресс с помощью которого будет создан контракт
--signerKeys "[\"edpk...\",\"edpk...\"]" - указываем публичные ключи администраторов
--burn-cap 1.14 - оплата газа 
<br>
<br>

## 4. создадим ещё один контракт который будем подписывать

`tezos-client --wait none originate contract MultisigAdmin42 transferring 0   from tz1i5w4BTmwB51efYjcziq6G5eJC5ra2gqHF running "$(cat admin_42.tz | tr '\n' ' ')"   --init ``"\"KT1PVA4gGdFt6aZGhaZvcTgoPzwfQtnY6fbM\"" --burn-cap 0.406`  

KT1PVA4gGdFt6aZGhaZvcTgoPzwfQtnY6fbM - адресс контракта полученного из пункта 3  
from tz... - адресс создателя контракта  
<br>
<br>


## 5.Подписывание транзакции 

1. нам понадабится индефикатор цепочки который мы можем получить введя:   
      ###  tezos-client rpc get /chains/main/chain_id  

2. получаем байтовую строку для подписи   
        `stack exec -- lorentz-contract-multisig GenericMultisig run-multisig   --target-parameterType 'nat' --target-parameter '42'   --target-contract`   `"\"KT1PVA4gGdFt6aZGhaZvcTgoPzwfQtnY6fbM\""   --multisig-contract "KT1PVA4gGdFt6aZGhaZvcTgoPzwfQtnY6fbM" --counter 1 --signatures "Nothing"   --signerKeys "`  
        `[\"edpkvUnVLfHfmdK9jJcoAwSqPy9Qbb2asVJFq18cLJosBs6keoPwVD\",\"edpku6o7mjAwDJptsqRH2R3tt7UKqkB15jbmRx8sPfBzgzJGUnhSnv\"]" --chainId NetXZSsxBpMQeAT  `  

    --target-parameterType 'nat' - тип параметров которые мы передаем контракту  
    --target-parameter '42' - параметр передаваемый в контракт  
    --target-contract   "\"KT...\"" - вызываемый контракт  
    --multisig-contract "KT..." - контракт мультисига   
    --counter 1 - количество подписей счет с нуля, как в массиве)  
    --chainId Net... - индефекатор цепочки из пункта 1   

3. Подписываем байтовую строку   
    `tezos-client import secret key alice "unencrypted:edsk..." ` 

    `tezos-client sign bytes   "0x..."  for alice`  

    `tezos-client import secret key bob "unencrypted:edsk..."  `  
    `tezos-client sign bytes   "0x..."  for bob`    
    
    0x..." - битовая строка для подписи  
    alice и bob это аккаунты публичные ключи которых мы указывали выше  
    unencrypted:edsk... - вместо edsk... надо записать приватный ключ  

4. подписание транзакции  
   `tezos-client --wait none transfer 0 from tz1i5w4BTmwB51efYjcziq6G5eJC5ra2gqHF to KT1PVA4gGdFt6aZGhaZvcTgoPzwfQtnY6fbM   --arg "$(stack exec -- lorentz-contract-multisig \`  
  `GenericMultisig run-multisig --target-parameterType 'nat' \`  
  `--target-parameter '42' --target-contract "\"KT1PVA4gGdFt6aZGhaZvcTgoPzwfQtnY6fbM\"" \ ` 
  `--multisig-contract "KT1PVA4gGdFt6aZGhaZvcTgoPzwfQtnY6fbM" --counter 1 \ ` 
  `--signatures "Just[Just\"edsig...\",Just\"edsig...\"]" \ `
 ` --signerKeys "[\"edpku6o7mjAwDJptsqRH2R3tt7UKqkB15jbmRx8sPfBzgzJGUnhSnv)\",\"$(edpkvUnVLfHfmdK9jJcoAwSqPy9Qbb2asVJFq18cLJosBs6keoPwVD)\"]" \ ` 
  `--chainId )" --burn-cap 0.000001`

    "Just[Just\"edsig...\",Just\"edsig...\"]" - вписываем сигнатуры которые получили из пункта 3    
    Если мы укажем --caunter 0 то вместо Just\"edsig...\" то вместо несуществущей сигнатуры надо писать Nothing  
    from tz1i5w4BTmwB51efYjcziq6G5eJC5ra2gqHF - адресс создателя multisig 
    остальные пояснения такие же, как и в пункте 2  
  























