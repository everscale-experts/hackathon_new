import { token_transfer } from './token-transfer'

const RPC_URL = 'https://rpc.hangzhounet.teztnets.xyz'
const CONTRACT = 'KT1N3zKv9JkGDseaNX3he6pQivWrwDVthhRW' //адрес опубликованного контракта
const SENDER = 'tz1Nt3vKhbZpVdCrqgxR9sZDFqUty2h7SMRM' //публичный адрес отправителя — возьмите его из accaunt1.json
const RECEIVER = 'tz1VcUcuUEcUGSZRcxNcj8JCrCG1xhZVRYt6' //публичный адрес получателя — возьмите его из кошелька Tezos, который вы создали
const AMOUNT = 10 //количество токенов для отправки. Можете ввести другое число
new token_transfer(RPC_URL).transfer(CONTRACT, SENDER, RECEIVER, AMOUNT)





