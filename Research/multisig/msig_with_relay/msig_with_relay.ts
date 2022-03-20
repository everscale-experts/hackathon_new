import { BatchOperation, TezosToolkit } from '@taquito/taquito'
import { InMemorySigner } from '@taquito/signer'


const RPC_URL = 'https://rpc.hangzhounet.teztnets.xyz'
const CONTRACT = 'KT1WGc5s9WwGHi5TUGAGvX9dSP1sbD8qdEc6' //адрес опубликованного контракта


const signer = new InMemorySigner('edskRdkUMmmBorjeetbGiU4cjZ1pbewF6ZmBMj7jCEWxA6pmgTooYTCStHZFitsEgnut7V3YpKt8ptgT1hgK5DuLS4baqXHQXj');

export class token_transfer {
    // настраиваем ссылку на публичный узел тестовой сети
    private tezos: TezosToolkit
    rpcUrl: string
  
    constructor(rpcUrl: string) {
      this.tezos = new TezosToolkit(rpcUrl)
      this.rpcUrl = rpcUrl
  
      //считываем почту, пароль и мнемоническую фразу, из которой можно получить приватный ключ
      this.tezos.setSignerProvider(signer)
    }
    public async transfer() {
      
      const contract = await this.tezos.wallet.at(CONTRACT)
      const batch = await this.tezos.wallet.batch()
      .withContractCall(contract.methods.transfer_token_proposal(

      ))
        
     

        batch.send()

        const batchOp = await batch.send()
        console.log("Operation hash:", batchOp.opHash)
        console.log(`Awaiting for ${batchOp.opHash} to be confirmed...`)
        return batchOp.confirmation(1).then(() => batchOp.opHash) //ждем одно подтверждение сети
        .then((hash) => console.log(`Hash: https://hangzhou2net.tzkt.io/${hash}`)) //получаем хеш операции

        
    }
   }


new token_transfer(RPC_URL).transfer()
