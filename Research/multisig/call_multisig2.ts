import { BatchOperation, TezosToolkit } from '@taquito/taquito'
import { InMemorySigner } from '@taquito/signer'
import { KeyToken } from '@taquito/michelson-encoder/dist/types/tokens/key'
const acc = require('./Account.json')

   const RPC_URL = 'https://rpc.hangzhounet.teztnets.xyz'
const CONTRACT = 'KT1WbMJxxzUMbT1uQz3QoyfCxCgTDRuA95ry' //адрес опубликованного контракта



export class token_transfer {
    // настраиваем ссылку на публичный узел тестовой сети
    private tezos: TezosToolkit
    rpcUrl: string
  
    constructor(rpcUrl: string) {
      this.tezos = new TezosToolkit(rpcUrl)
      this.rpcUrl = rpcUrl
  
      //считываем почту, пароль и мнемоническую фразу, из которой можно получить приватный ключ
      this.tezos.setSignerProvider(InMemorySigner.fromFundraiser(acc.email, acc.password, acc.mnemonic.join(' ')))

    }
    public async transfer(contract1: string) {
      
      const contract = await this.tezos.wallet.at(contract1)
      const batch = await this.tezos.wallet.batch()

      .withContractCall(contract.methods.main_parameter({
          counter: 0,
          or:{
              LLLL:{
                  to: 'address',
                  value: 'mutez',
              },
              delegation:'key_hash',
              transferFA:{
                  address:'address',
                  or:{
                      transferFA1_2:{
                          address_0:'address',
                          address_1:'address',
                          nat:"nat",
                      },
                      transferFA2_0:[{
                          from:'address',
                          txs:[{
                              to_:'address',
                              token_id:'nat',
                              amount:'nat',

                          }]
                      }]
                  }
              }

          },
          LLRR:{
              vesting:'address',
              or:{
                  setDelegate:'key_hash',
                  vest:'nat',
              }
          },
          sigs:[
              'signature',
          ]

      }))
   
      
        batch.send()
        
        
        const batchOp = await batch.send()
        console.log(`Awaiting for ${batchOp.opHash} to be confirmed...`)
        return batchOp.confirmation(1).then(() => batchOp.opHash) //ждем одно подтверждение сети
        .then((hash) => console.log(`Hash: https://hangzhou.tzstats.com/${hash}`)) //получаем хеш операции
        

        
    }
   }



new token_transfer(RPC_URL).transfer(CONTRACT)
  

