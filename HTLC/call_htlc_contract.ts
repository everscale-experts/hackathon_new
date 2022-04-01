
import { char2Bytes, } from '@taquito/utils';
import { TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';
import {sha256} from 'js-sha256'

async function example() {
    const provider = 'https://rpc.hangzhounet.teztnets.xyz';
    const signer: any = new InMemorySigner('edskRdkUMmmBorjeetbGiU4cjZ1pbewF6ZmBMj7jCEWxA6pmgTooYTCStHZFitsEgnut7V3YpKt8ptgT1hgK5DuLS4baqXHQXj');
        const tezos = new TezosToolkit(provider);
    tezos.setSignerProvider( signer );
    try {

        const contract = await tezos.contract.at('KT1UR2v4qiENjnvkG22wcpTcLyKAGLEP3m7x')
        const hash: any = sha256('Hello')
      const batch = await tezos.contract.batch()
      .withContractCall(contract.methods.createLockWithCoins(hash,'KT1UR2v4qiENjnvkG22wcpTcLyKAGLEP3m7x'))


        
        batch.send()

        const batchOp = await batch.send()
        console.log("Operation hash:", batchOp.hash)
        console.log(`Awaiting for ${batchOp.hash} to be confirmed...`)
        return batchOp.confirmation(1).then(() => batchOp.hash) //ждем одно подтверждение сети
        .then((hash) => console.log(`Hash: https://hangzhou2net.tzkt.io/${hash}`)) //получаем хеш операции

        



  }


     catch (ex) {
        console.log(ex)
    }
}

example();

