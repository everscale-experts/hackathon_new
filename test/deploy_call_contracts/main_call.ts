import { Call } from './call'

const RPC_URL = 'https://rpc.hangzhounet.teztnets.xyz'
const CONTRACT = 'KT1B81hEJckCtpzBspduvDSSFdK2QbQYVwmp' //published contract address
const ADD = 5 //number to be received by the main function. You can change it
new Call(RPC_URL).add(ADD, CONTRACT)
