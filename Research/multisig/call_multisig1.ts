import { BatchOperation, TezosToolkit, ContractSchema, ContractMethod } from '@taquito/taquito'
import { InMemorySigner,  } from '@taquito/signer'
import { KeyToken,  } from '@taquito/michelson-encoder/dist/types/tokens/key'
import {Schema} from '@taquito/michelson-encoder'
const acc = require('./Account.json')

   const RPC_URL = 'https://rpc.hangzhounet.teztnets.xyz'
const CONTRACT = 'KT1SgnWsMaQnvGuZTjrYACQP9wVYyUz1mTfH' //адрес опубликованного контракта
const bytes ='0x05070707070a000000046252be4f0a0000001601c6958d8e2af23b566c14105fa16526dec49d02c10007070001050502000000340320053d036d0743035d0a0000001500f638e07832e95581527f1d8f69368a24acbad0c3031e0743036a0080897a034f034d031b'
const signer =new InMemorySigner('edsk31hLYrJqTeHqsLPdo1Ab5SKw7PUXUuWBt95UBFkLj3KrW1Dt6x');
const signer1 =new InMemorySigner('edsk3fa8S4vFkgbgb77iozSS1AJTUg8XMbGV14wqqjHko86ACHkHtn');

const signature = signer.sign(bytes);
const signature1 = signer1.sign(bytes);



export class token_transfer {
    // настраиваем ссылку на публичный узел тестовой сети
    private tezos: TezosToolkit
    rpcUrl: string
  
    constructor(rpcUrl: string) {
      this.tezos = new TezosToolkit(rpcUrl)
      this.rpcUrl = rpcUrl;
      
  
      //считываем почту, пароль и мнемоническую фразу, из которой можно получить приватный ключ
      this.tezos.setSignerProvider(InMemorySigner.fromFundraiser(acc.email, acc.password, acc.mnemonic.join(' ')))

    }
    
    public async transfer(contract1: string) {
      

      const contract = await this.tezos.wallet.at(contract1)
      const batch = await this.tezos.wallet.batch()

      .withContractCall(contract.methods.main({
          
        schema:{
          payload: {
              counter: "0",
              action: {
                  operation: bytes,
                  
              }
          },
          sigs: [
              (await signature).prefixSig,
              (await signature1).prefixSig,
          ]
      }
        
      }))
      //.withContractCall(contract.methods.main({counter:0, operation:'0x05070707070a000000046252be4f0a0000001601c6958d8e2af23b566c14105fa16526dec49d02c10007070001050502000000340320053d036d0743035d0a0000001500f638e07832e95581527f1d8f69368a24acbad0c3031e0743036a0080897a034f034d031b'},[(await signature).prefixSig, (await signature1).prefixSig]))
  
      





        batch.send()
        
        
        const batchOp = await batch.send()
        console.log(`Awaiting for ${batchOp.opHash} to be confirmed...`)
        return batchOp.confirmation(1).then(() => batchOp.opHash) //ждем одно подтверждение сети
        .then((hash) => console.log(`Hash: https://hangzhou.tzstats.com/${hash}`)) //получаем хеш операции
        

        
    }
   }



new token_transfer(RPC_URL).transfer(CONTRACT)
  

