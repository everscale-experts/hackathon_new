import { token_transfer } from './token-transfer'

const RPC_URL = 'https://rpc.hangzhounet.teztnets.xyz'
const CONTRACT = 'KT1FJu4tobG6sK4ngm9gzqbefcC1R5XiC2AV' //адрес опубликованного контракта
const SENDER = 'tz1Nt3vKhbZpVdCrqgxR9sZDFqUty2h7SMRM' //публичный адрес отправителя — возьмите его из accaunt1.json
const RECEIVER = 'tz1i5w4BTmwB51efYjcziq6G5eJC5ra2gqHF' //публичный адрес получателя — возьмите его из кошелька Tezos, который вы создали
const AMOUNT = 7 //количество токенов для отправки. Можете ввести другое число
new token_transfer(RPC_URL).transfer(CONTRACT, SENDER, RECEIVER, AMOUNT)


