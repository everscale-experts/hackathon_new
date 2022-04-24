
import { char2Bytes, } from '@taquito/utils';
import { TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';
import {sha256} from 'js-sha256'


async function example() {
    const provider = 'https://hangzhounet.smartpy.io';
    //const signer: any = new InMemorySigner('edskRdkUMmmBorjeetbGiU4cjZ1pbewF6ZmBMj7jCEWxA6pmgTooYTCStHZFitsEgnut7V3YpKt8ptgT1hgK5DuLS4baqXHQXj');
    const signer: any = new InMemorySigner('edskRqb1qvkC1bgmn48LsjHhwjntfNAmgAuXvBMXwbTar4Yp9ss1Ffd8mJevGoZbV4VsTjgc8aDdX8EaKmuBKJbFn58HBNLtVP')
        const tezos = new TezosToolkit(provider);
    tezos.setSignerProvider( signer );
    try {
        // const contract1 = await tezos.contract.at('KT1X9eKZyo6kQLkJTrjKmVt7MLC33xE6DfZB')
        const batch = await tezos.contract.batch()
    //   .withContractCall(contract1.methods.transfer('tz1XW4RqNY4WMEiSyAfb49CJTGqZK5AkrXB3', 'KT1MJ4cMX2vgvajHsrX9FtQCwjAr1CorjAbJ', '10000'))

        const contract = await tezos.contract.at('KT1X4BhnWxfDNDybCyUxBTUvwvkLEuNZvisP')
      
      batch
    //   .withContractCall(contract.methods.openLock('KT1JMWkKAtB8eNMTYSAmkRuS3xjKHdkgTVGW', char2Bytes('')))
      
      .withContractCall(contract.methods.createLock(10000,'KT1JMWkKAtB8eNMTYSAmkRuS3xjKHdkgTVGW',sha256(char2Bytes('')),'KT1X9eKZyo6kQLkJTrjKmVt7MLC33xE6DfZB' ));
    
      
      
   
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

