import { Call } from './sum_main_call'
import { parse } from 'ts-command-line-args'

interface ICopyFilesArguments{
   first_var: String;
   second_var: String;
}

const RPC_URL = 'https://rpc.hangzhounet.teztnets.xyz'
const CONTRACT = 'KT1J51zhJxVy7sG2StVo2DNHqY72vaxJFgmQ' //published contract address
const ADD = parse<ICopyFilesArguments>({
    first_var: String,
    second_var: String,
}); //number to be received by the main function. You can change it
console.log(ADD.first_var);
console.log(ADD.second_var);

new Call(RPC_URL).add(Number(ADD.first_var),Number(ADD.second_var), CONTRACT)
