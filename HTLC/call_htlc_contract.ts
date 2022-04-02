
import { char2Bytes, } from '@taquito/utils';
import { TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';


async function example() {
    const provider = 'https://rpc.hangzhounet.teztnets.xyz';
    const signer: any = new InMemorySigner('edskRdkUMmmBorjeetbGiU4cjZ1pbewF6ZmBMj7jCEWxA6pmgTooYTCStHZFitsEgnut7V3YpKt8ptgT1hgK5DuLS4baqXHQXj');
        const tezos = new TezosToolkit(provider);
    tezos.setSignerProvider( signer );
    try {
        const batch = await tezos.contract.batch()
      //.withTransfer({ to: 'KT1HEmedN3r828CcCa6wzTd4DMUw1XobxAHa', amount: 2 })

        const contract = await tezos.contract.at('KT1HEmedN3r828CcCa6wzTd4DMUw1XobxAHa')
      
      batch
      .withContractCall(contract.methods.openLock('KT1JMWkKAtB8eNMTYSAmkRuS3xjKHdkgTVGW', char2Bytes('Hello')))
      //.withContractCall(contract.methods.createLockWithCoins(char2Bytes('Hello'),'KT1JMWkKAtB8eNMTYSAmkRuS3xjKHdkgTVGW' ));
    
      
      
   
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

