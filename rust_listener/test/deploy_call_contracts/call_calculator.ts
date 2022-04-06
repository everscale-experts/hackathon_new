import { Call } from './call'
import { parse } from 'ts-command-line-args'

interface ICopyFilesArguments{
   first_var: String;
}

const RPC_URL = 'https://rpc.hangzhounet.teztnets.xyz'
const CONTRACT = 'KT1UW5jNtDJ1m8EQVXGUBDBnNQxeXM8t6sf2' //published contract address
const ADD = parse<ICopyFilesArguments>({
    first_var: String,
}); //number to be received by the main function. You can change it
new Call(RPC_URL).add(Number(ADD.first_var,ADD.first_var)), CONTRACT)
