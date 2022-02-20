import { BatchOperation, TezosToolkit } from '@taquito/taquito'
import { InMemorySigner } from '@taquito/signer'
const acc = require('./account1.json')


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
      .withContractCall(contract.methods.transfer([{ //первая транзакция 
        from_: sender,
        txs:[
          {
            to_:receiver,
            token_id: id,
            amount: amount
          }
        ]
      }]))
        
      .withContractCall(contract.methods.mint_more_tokens(1, 4000))// вторая транзакция созднание 4000 токенов id=1

      .withContractCall(contract.methods.transfer([{ //третья транзакция 
        from_: sender,
        txs:[
          {
            to_:receiver,
            token_id: id,
            amount: amount
          }
        ]
      }]))

        batch.send()

        const batchOp = await batch.send()
        console.log("Operation hash:", batchOp.opHash)
        console.log(`Awaiting for ${batchOp.opHash} to be confirmed...`)
        return batchOp.confirmation(1).then(() => batchOp.opHash) //ждем одно подтверждение сети
        .then((hash) => console.log(`Hash: https://hangzhou2net.tzkt.io/${hash}`)) //получаем хеш операции

        
    }
   }

   const RPC_URL = 'https://rpc.hangzhounet.teztnets.xyz'
const CONTRACT = 'KT1KR2ft6aRthjkcvTW9FrEPRQoxrfuTpark' //адрес опубликованного контракта
const SENDER = 'tz1Nt3vKhbZpVdCrqgxR9sZDFqUty2h7SMRM' //публичный адрес отправителя — возьмите его из accaunt1.json
const RECEIVER = 'tz1LiBrF9gibgH5Lf6a7gDjoUfSEg6nxPKsz' //публичный адрес получателя — возьмите его из кошелька Tezos, который вы создали
const AMOUNT = 12 //количество токенов для отправки. Можете ввести другое число
const ID=1// id токена котрый пересылается

new token_transfer(RPC_URL).transfer(CONTRACT, SENDER, RECEIVER, AMOUNT, ID)
  

