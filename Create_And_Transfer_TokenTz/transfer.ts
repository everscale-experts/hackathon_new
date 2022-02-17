import { token_transfer } from './token-transfer'

const RPC_URL = 'https://rpc.hangzhounet.teztnets.xyz'
const CONTRACT = 'KT19LybspUkGTZxGMSKVRMDcpoRS24JapqH1' //адрес опубликованного контракта
const SENDER = 'tz1Nt3vKhbZpVdCrqgxR9sZDFqUty2h7SMRM' //публичный адрес отправителя — возьмите его из accaunt1.json
const RECEIVER = 'tz1LiBrF9gibgH5Lf6a7gDjoUfSEg6nxPKsz' //публичный адрес получателя — возьмите его из кошелька Tezos, который вы создали
const AMOUNT = 167 //количество токенов для отправки в сатошах, меньших единицах токена. Можете ввести другое число
const ID=1
new token_transfer(RPC_URL).transfer(CONTRACT, SENDER, RECEIVER, AMOUNT, ID)







