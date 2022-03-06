import { BatchOperation, TezosToolkit } from '@taquito/taquito'
import { InMemorySigner } from '@taquito/signer'
import { KeyToken } from '@taquito/michelson-encoder/dist/types/tokens/key'
import { b58cencode, char2Bytes, Prefix, prefix } from '@taquito/utils';
const acc = require('./Account.json')

   const RPC_URL = 'https://rpc.hangzhounet.teztnets.xyz'
const CONTRACT = 'KT1SYmWUEZu13tycy5cLEaYuDtoG6Zf6DsxL' //адрес опубликованного multisig




const bytes= char2Bytes("0, LLLL:{adresss:'tz1LiBrF9gibgH5Lf6a7gDjoUfSEg6nxPKsz', value:'10'},Nothing") // создаем строку ддля подписи
console.log(bytes)

// присваиваем переменным обьект с помощью которого будем подписывать строку 
const signer =new InMemorySigner('edsk31hLYrJqTeHqsLPdo1Ab5SKw7PUXUuWBt95UBFkLj3KrW1Dt6x');  



// подписыаем строку и получаем сигнатуры
const signature = signer.sign(bytes)

console.log(signature)



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
    public async transfer(contract1: string,) {
      
       const contract = await this.tezos.wallet.at(contract1)
       // вызываем метод контракта и пописываем сигнатурами
       const op = await contract.methods.main_parameter(0 ,[(await signature).prefixSig]).send()
       
       await op.confirmation()
        console.log(op.opHash)


        
    }
   }



new token_transfer(RPC_URL).transfer(CONTRACT)
  

