
import { char2Bytes, } from '@taquito/utils';
import { TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';
import {sha256} from 'js-sha256'


const ID = 1;
const AMOUNT = 10010;

async function example() {
    const provider = 'https://hangzhounet.smartpy.io';
    //const signer: any = new InMemorySigner('edskRdkUMmmBorjeetbGiU4cjZ1pbewF6ZmBMj7jCEWxA6pmgTooYTCStHZFitsEgnut7V3YpKt8ptgT1hgK5DuLS4baqXHQXj');
    const signer: any = new InMemorySigner('edskRqb1qvkC1bgmn48LsjHhwjntfNAmgAuXvBMXwbTar4Yp9ss1Ffd8mJevGoZbV4VsTjgc8aDdX8EaKmuBKJbFn58HBNLtVP')
        const tezos = new TezosToolkit(provider);
    tezos.setSignerProvider( signer );
    try {
        const batch = await tezos.contract.batch()
        // const contract_tokens = await tezos.contract.at('KT1VKyokYCeTidBzepRJrBVrQDJPq6RH8RYn')
        // batch
        // .withContractCall(contract_tokens.methods.transfer([{
        //     from_:'tz1V2TxmFHjnkMMjjMGKPSye698SkpSeDpvd' ,  // перевод от куда 
        //     txs:[
        //       {
        //         to_:'KT1Wj3U8oHeBqTG6G6mpm5e7zZqCACMVJRmZ',  // кому(адрессу HTLC)
        //         token_id: ID,
        //         amount: AMOUNT,
        //       }
        //     ]
        //   }]))

        const contract = await tezos.contract.at('KT1Wj3U8oHeBqTG6G6mpm5e7zZqCACMVJRmZ')
      
      batch
      .withContractCall(contract.methods.openLock('KT1JMWkKAtB8eNMTYSAmkRuS3xjKHdkgTVGW', char2Bytes('')))
      
    //  .withContractCall(contract.methods.createLock('KT1VKyokYCeTidBzepRJrBVrQDJPq6RH8RYn',ID, AMOUNT, sha256(char2Bytes('')),'KT1JMWkKAtB8eNMTYSAmkRuS3xjKHdkgTVGW' ));
    //  .withContractCall(contract.methods.addToken('KT1VKyokYCeTidBzepRJrBVrQDJPq6RH8RYn', 2));
    
      
      
   
        batch.send()

        const batchOp = await batch.send()
        console.log(`Awaiting confirmed...`)
        return batchOp.confirmation(1).then(() => batchOp.hash) //ждем одно подтверждение сети
        .then((hash) => console.log(`Hash: https://hangzhou2net.tzkt.io/${hash}`)) //получаем хеш операции


  }


     catch (ex) {
        console.log(ex)
    }
}

example();

