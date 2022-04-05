import { token_transfer } from './token-transfer'

const RPC_URL = 'https://rpc.hangzhounet.teztnets.xyz'
const CONTRACT = 'KT1WhqQJyuznPdGD3JM3iqMpaRveeUuVSz9k' //адрес опубликованного контракта
const SENDER = 'tz1i5w4BTmwB51efYjcziq6G5eJC5ra2gqHF' //публичный адрес отправителя — возьмите его из accaunt1.json
const RECEIVER = 'tz1Qw2LiqMNwJXKKzimAVMWj5W467Hrd6dP7' //публичный адрес получателя — возьмите его из кошелька Tezos, который вы создали
const AMOUNT = 167 //количество токенов для отправки в сатошах, меньших единицах токена. Можете ввести другое число
const ID=1
new token_transfer(RPC_URL).transfer(CONTRACT, SENDER, RECEIVER, AMOUNT, ID)












