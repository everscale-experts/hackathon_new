import { TezosToolkit } from '@taquito/taquito'
import { importKey } from '@taquito/signer'
const acc = require('./acc.json')


const provider = 'https://hangzhounet.api.tez.ie'

async function deploy() {
 const tezos = new TezosToolkit(provider)
 await importKey(
   tezos,
   'ornuxbwr.unviuobi@teztnets.xyz', //mail
   '5HllvNGeG4', //password
   [
    'chat',
		'boring',
		'town',
		'fall',
		'donkey',
		'elite',
		'rely',
		'frost',
		'post',
		'nut',
		'spider',
		'attend',
		'wisdom',
		'snake',
		'duck', //passphrase
   ].join(' '),
   'edskRxqRARbqUGY8RjDWJhNKXpTqFBfhY7xdx46zrPLKvLsZphzn9YM8j5SNPNr5dUsfQ3X1ttXP1KGP1swVMDdj4T7f7TuxPc'//private key
 )
 try {
     const op = await tezos.contract.originate({
       //smart contract code
       code: `[ { "prim": "parameter",
           "args":
             [ { "prim": "or",
                 "args":
                   [ { "prim": "or",
                       "args":
                         [ { "prim": "pair",
                             "args": [ { "prim": "int" }, { "prim": "int" } ],
                             "annots": [ "%addition" ] },
                           { "prim": "pair",
                             "args": [ { "prim": "int" }, { "prim": "int" } ],
                             "annots": [ "%division" ] } ] },
                     { "prim": "or",
                       "args":
                         [ { "prim": "pair",
                             "args": [ { "prim": "int" }, { "prim": "int" } ],
                             "annots": [ "%multiplication" ] },
                           { "prim": "pair",
                             "args": [ { "prim": "int" }, { "prim": "int" } ],
                             "annots": [ "%subtraction" ] } ] } ] } ] },
         { "prim": "storage", "args": [ { "prim": "int" } ] },
         { "prim": "code",
           "args":
             [ [ { "prim": "CAR" },
                 { "prim": "IF_LEFT",
                   "args":
                     [ [ { "prim": "IF_LEFT",
                           "args":
                             [ [ { "prim": "UNPAIR" }, { "prim": "ADD" } ],
                               [ { "prim": "UNPAIR" }, { "prim": "EDIV" },
                                 { "prim": "IF_NONE",
                                   "args":
                                     [ [ { "prim": "PUSH",
                                           "args":
                                             [ { "prim": "string" },
                                               { "string": "DIV by 0" } ] },
                                         { "prim": "FAILWITH" } ], [] ] },
                                 { "prim": "CAR" } ] ] } ],
                       [ { "prim": "IF_LEFT",
                           "args":
                             [ [ { "prim": "UNPAIR" }, { "prim": "MUL" } ],
                               [ { "prim": "UNPAIR" }, { "prim": "SUB" } ] ] } ] ] },
                 { "prim": "NIL", "args": [ { "prim": "operation" } ] },
                 { "prim": "PAIR" } ] ] } ]`,
       //storage state
       init: `0`,
     })

     //beginning to deploy
     console.log('Awaiting confirmation...')
     const contract = await op.contract()
     //deployment report: amount of used gas, storage state
     console.log('Gas Used', op.consumedGas)
     console.log('Storage', await contract.storage())
     //operation hash one can use to find the contract in the explorer
     console.log('Operation hash:', op.hash)
   } catch (ex) {
     console.error(ex)
   }
 }

 deploy()
