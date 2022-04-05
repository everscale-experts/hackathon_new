
import { char2Bytes, } from '@taquito/utils';
import { TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';
import {sha256} from 'js-sha256'


const ID = 1;
const AMOUNT = 10000000;

async function example() {
    const provider = 'https://hangzhounet.smartpy.io';
    //const signer: any = new InMemorySigner('edskRdkUMmmBorjeetbGiU4cjZ1pbewF6ZmBMj7jCEWxA6pmgTooYTCStHZFitsEgnut7V3YpKt8ptgT1hgK5DuLS4baqXHQXj');
    const signer: any = new InMemorySigner('edskRdkUMmmBorjeetbGiU4cjZ1pbewF6ZmBMj7jCEWxA6pmgTooYTCStHZFitsEgnut7V3YpKt8ptgT1hgK5DuLS4baqXHQXj')
        const tezos = new TezosToolkit(provider);
    tezos.setSignerProvider( signer );
    try {
        const batch = await tezos.contract.batch()
        const contract_tokens = await tezos.contract.at('KT1X7iHDQB6iQvejCkwVqE2Nk78fdrcbw66s')
        // batch
        // .withContractCall(contract_tokens.methods.transfer([{
        //     from_:'tz1i5w4BTmwB51efYjcziq6G5eJC5ra2gqHF' ,
        //     txs:[
        //       {
        //         to_:'KT1SuD3WyMK6MYHYqor8pfosUfr5E1LhXxXs',
        //         token_id: ID,
        //         amount: AMOUNT,
        //       }
        //     ]
        //   }]))

        const contract = await tezos.contract.at('KT1SuD3WyMK6MYHYqor8pfosUfr5E1LhXxXs')
      
      batch
      .withContractCall(contract.methods.openLock('KT1JMWkKAtB8eNMTYSAmkRuS3xjKHdkgTVGW', char2Bytes('')))
      
    //   .withContractCall(contract.methods.createLock(ID, AMOUNT, sha256(char2Bytes('')),'KT1JMWkKAtB8eNMTYSAmkRuS3xjKHdkgTVGW' ));
    
      
      
   
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

