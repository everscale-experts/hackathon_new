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

## 2. install stack and lorentz-contract-multisig

 Клонируйте [репозиторий lorentz-contract-multisig](https://github.com/tqtezos/lorentz-contract-multisig) и следуйте инструкциям в [README](https://github.com/tqtezos/lorentz-contract-multisig/blob/master/README.md),
  чтобы установить зависимости, необходимые для использования lorentz-contract-multisig.
<br>


## 3.создание Multisig

tezos-client --wait none originate contract MultisigNat1 transferring 0 from tz1i5w4BTmwB51efYjcziq6G5eJC5ra2gqHF running "$(stack exec -- lorentz-contract-multisig   GenericMultisig \  
  print-specialized --parameterType 'nat' --oneline)"   --init "$(stack exec -- lorentz-contract-multisig GenericMultisig \  
  init-specialized --threshold 1 \  
  --signerKeys "[\"edpkvUnVLfHfmdK9jJcoAwSqPy9Qbb2asVJFq18cLJosBs6keoPwVD\",\"edpku6o7mjAwDJptsqRH2R3tt7UKqkB15jbmRx8sPfBzgzJGUnhSnv\"]")"   --burn-cap 1.14  

MultisigNat1 - псевдоним Multisig
transferring 0 - первоначальный баланс multisig
from tz1i5w4BTmwB51efYjcziq6G5eJC5ra2gqHF - создатель контракта, адресс с помощью которого будет создан контракт
--signerKeys "[\"edpk...\",\"edpk...\"]" - указываем публичные ключи администраторов
--burn-cap 1.14 - оплата газа 

## 4. создадим ещё один контракт который будем подписывать

tezos-client --wait none originate contract MultisigAdmin42 transferring 0   from tz1i5w4BTmwB51efYjcziq6G5eJC5ra2gqHF running "$(cat admin_42.tz | tr '\n' ' ')"   --init "\"KT1PVA4gGdFt6aZGhaZvcTgoPzwfQtnY6fbM\"" --burn-cap 0.406  

KT1PVA4gGdFt6aZGhaZvcTgoPzwfQtnY6fbM - адресс контракта полученного из пункта 3  
from tz... - адресс создателя контракта  



## 5.Подписывание транзакции 

1. нам понадабится индефикатор цепочки который мы можем получить введя:   
        tezos-client rpc get /chains/main/chain_id  

2. получаем байтовую строку для подписи   
        stack exec -- lorentz-contract-multisig GenericMultisig run-multisig   --target-parameterType 'nat' --target-parameter '42'   --target-contract   "\"KT1PVA4gGdFt6aZGhaZvcTgoPzwfQtnY6fbM\""   --multisig-contract "KT1PVA4gGdFt6aZGhaZvcTgoPzwfQtnY6fbM" --counter 1 --signatures "Nothing"   --signerKeys "  [\"edpkvUnVLfHfmdK9jJcoAwSqPy9Qbb2asVJFq18cLJosBs6keoPwVD\",\"edpku6o7mjAwDJptsqRH2R3tt7UKqkB15jbmRx8sPfBzgzJGUnhSnv\"]" --chainId NetXZSsxBpMQeAT  

    --target-parameterType 'nat' - тип параметров которые мы передаем контракту  
    --target-parameter '42' - параметр передаваемый в контракт  
    --target-contract   "\"KT...\"" - вызываемый контракт  
    --multisig-contract "KT..." - контракт мультисига   
    --counter 1 - количество подписей
    --chainId Net... - индефекатор цепочки 
3. Подписываем байтовую строку 
    tezos-client sign bytes   "0x..."  for alice
    




























