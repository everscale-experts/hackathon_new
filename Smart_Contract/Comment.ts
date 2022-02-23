import { BatchOperation, TezosToolkit } from '@taquito/taquito'
import { InMemorySigner } from '@taquito/signer'
const acc = require('./account1.json')
const RPC_URL = 'https://rpc.hangzhounet.teztnets.xyz'
const CONTRACT = 'KT1X7DmWgCU4h1V7hbwPpzwGJcXBfoydcgwW' //адрес опубликованного контракта


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
      // Вызываем метод default смарт-контракта и вписываем комментарий
      //                                               addressReсeiverTz                           addressSenderTz                amoutTz        addressReсeiverEver                                                addressContractToken       id транзакции 
      .withContractCall(contract.methods.default("tz1Nt3vKhbZpVdCrqgxR9sZDFqUty2h7SMRM", "tz1VcUcuUEcUGSZRcxNcj8JCrCG1xhZVRYt6", "2000","0:c54a25311764a560d64b70b8c334991462e56da9bd48df0074c3b0ed27f4f4fd","KT1KR2ft6aRthjkcvTW9FrEPRQoxrfuTpark", "2" ))
        
      

        batch.send()

        const batchOp = await batch.send()
        console.log(`Awaiting for ${batchOp.opHash} to be confirmed...`)
        return batchOp.confirmation(1).then(() => batchOp.opHash) //ждем одно подтверждение сети
        .then((hash) => console.log(`Hash: https://hangzhou.tzstats.com/${hash}`)) //получаем хеш операции

        
    }
   }

 

new token_transfer(RPC_URL).transfer(CONTRACT)
  

