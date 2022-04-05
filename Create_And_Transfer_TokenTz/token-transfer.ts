//импортируем методы Taquito и файл с данными тестового аккаунта acc.json

import { TezosToolkit } from '@taquito/taquito'
import { InMemorySigner } from '@taquito/signer'

export class token_transfer {
  // настраиваем ссылку на публичный узел тестовой сети
  private tezos: TezosToolkit
  rpcUrl: string

  constructor(rpcUrl: string) {
    this.tezos = new TezosToolkit(rpcUrl)
    this.rpcUrl = rpcUrl
    const signer =new InMemorySigner('edskRdkUMmmBorjeetbGiU4cjZ1pbewF6ZmBMj7jCEWxA6pmgTooYTCStHZFitsEgnut7V3YpKt8ptgT1hgK5DuLS4baqXHQXj');//приватный ключ отправителя токенов
    //считываем почту, пароль и мнемоническую фразу, из которой можно получить приватный ключ
    this.tezos.setSignerProvider(signer)
  }
  
  // объявляем метод transfer, который принимает параметры:
  //
  // 1) contract — адрес контракта;
  // 2) sender — адрес отправителя;
  // 3) receiver — адрес получателя;
  // 4) amount — количество токенов для отправки.

  public transfer(contract: string, sender: string, receiver: string, amount: number, id:number) {
    this.tezos.contract
      .at(contract) //обращаемся к контракту по адресу
      .then((contract) => {
        console.log(`Sending ${amount} from ${sender} to ${receiver}...`)
        //обращаемся к точке входа transfer, передаем ей адреса отправителя и получателя, а также количество токенов для отправки.
        return contract.methods.transfer([{
          from_: sender,
          txs:[
            {
              to_:receiver,
              token_id: id,
              amount: amount
            }
          ]
        }]).send()
        
      })
      .then((op) => {
        console.log(`Awaiting for ${op.hash} to be confirmed...`)
        return op.confirmation(1).then(() => op.hash) //ждем одно подтверждение сети
      })
      .then((hash) => console.log(`Hash: https://hangzhou.tzstats.com/${hash}`)) //получаем хеш операции
      .catch((error) => console.log(`Error: ${JSON.stringify(error, null, 2)}`))
  }
}



