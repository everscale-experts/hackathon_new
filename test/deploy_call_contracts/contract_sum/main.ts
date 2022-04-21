import { App } from './app'
//import Tx.ts
import { Tx } from './tx'

const RPC_URL = 'https://rpc.hangzhounet.teztnets.xyz'
//declare the constant with the Everstake baker’s address
const ADDRESS = 'tz1aRoaRhSpRYvFdyvgWLL6TGyRoGF51wDjM'
//launching App, sending a link to the node, calling getBalance and sending it the address
//new App(RPC_URL).getBalance(ADDRESS)
new Tx(RPC_URL).activateAccount()
