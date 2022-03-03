import { BatchOperation, TezosToolkit } from '@taquito/taquito'
import { InMemorySigner } from '@taquito/signer'
import { KeyToken } from '@taquito/michelson-encoder/dist/types/tokens/key'
const acc = require('./Account.json')

   const RPC_URL = 'https://rpc.hangzhounet.teztnets.xyz'
const CONTRACT = 'KT1PVA4gGdFt6aZGhaZvcTgoPzwfQtnY6fbM' //адрес опубликованного контракта
const SENDER = 'tz1Nt3vKhbZpVdCrqgxR9sZDFqUty2h7SMRM' //публичный адрес отправителя — возьмите его из accaunt1.json
const RECEIVER = 'tz1LiBrF9gibgH5Lf6a7gDjoUfSEg6nxPKsz' //публичный адрес получателя — возьмите его из кошелька Tezos, который вы создали
const AMOUNT = 12 //количество токенов для отправки. Можете ввести другое число
const ID=1


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
    public async transfer(contract1: string, sender: string, receiver: string, amount: number, id:number ) {
      
      const contract = await this.tezos.wallet.at(contract1)
      const batch = await this.tezos.wallet.batch()

      .withContractCall(contract.methods.default({
          counter:1,
          action:{
              
              L:{
                  nat:12,
                  contract: "KT1PVA4gGdFt6aZGhaZvcTgoPzwfQtnY6fbM",
              },
              R:{
                threshold: 42,
                  keys:[
                      "edpkvUnVLfHfmdK9jJcoAwSqPy9Qbb2asVJFq18cLJosBs6keoPwVD",
                      "edpku6o7mjAwDJptsqRH2R3tt7UKqkB15jbmRx8sPfBzgzJGUnhSnv",
                      
                  ]
              }
          },
          sigs:[
              "Nothing"
          ]

      },



      ))
    //   .withContractCall(contract.methods.transfer([{
    //     from_: sender,
    //     txs:[
    //       {
    //         to_:receiver,
    //         token_id: id,
    //         amount: amount
    //       }
    //     ]
    //   }]))
      





        batch.send()
        
        
        const batchOp = await batch.send()
        console.log(`Awaiting for ${batchOp.opHash} to be confirmed...`)
        return batchOp.confirmation(1).then(() => batchOp.opHash) //ждем одно подтверждение сети
        .then((hash) => console.log(`Hash: https://hangzhou.tzstats.com/${hash}`)) //получаем хеш операции
        

        
    }
   }



new token_transfer(RPC_URL).transfer(CONTRACT, SENDER, RECEIVER, AMOUNT, ID)
  

