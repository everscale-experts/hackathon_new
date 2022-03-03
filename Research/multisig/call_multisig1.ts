import { BatchOperation, TezosToolkit } from '@taquito/taquito'
import { InMemorySigner } from '@taquito/signer'
import { KeyToken } from '@taquito/michelson-encoder/dist/types/tokens/key'
const acc = require('./Account.json')

   const RPC_URL = 'https://rpc.hangzhounet.teztnets.xyz'
const CONTRACT = 'KT1SgnWsMaQnvGuZTjrYACQP9wVYyUz1mTfH' //адрес опубликованного контракта



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

      .withContractCall(contract.methods.main({
          
        payload:{
            counter:1,
            action:{
                operation: "transfere",
                change_keys:{
                    treshload: 2,
                    keys:[
                        "edpkuAPjD8jVpbDUEQBXUdp1v9eNhLLo3JxUBBMTwWdw7Fm9tnHZTL",
                        "edpkvZDzWnVqxNCZwX5YQMUg5ZFKD5WTpG8vjNv9WFk3jzh58wEfuk",
                        "edpkvUnVLfHfmdK9jJcoAwSqPy9Qbb2asVJFq18cLJosBs6keoPwVD",
                    ]

                }
            }
        },
        sigs:[
            "Nothing"
        ],
      }



      ))
  
      





        batch.send()
        
        
        const batchOp = await batch.send()
        console.log(`Awaiting for ${batchOp.opHash} to be confirmed...`)
        return batchOp.confirmation(1).then(() => batchOp.opHash) //ждем одно подтверждение сети
        .then((hash) => console.log(`Hash: https://hangzhou.tzstats.com/${hash}`)) //получаем хеш операции
        

        
    }
   }



new token_transfer(RPC_URL).transfer(CONTRACT)
  

