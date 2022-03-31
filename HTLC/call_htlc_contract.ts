
import { char2Bytes, } from '@taquito/utils';
import { TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';


async function example() {
    const provider = 'https://rpc.hangzhounet.teztnets.xyz';
    const signer: any = new InMemorySigner('edskRdkUMmmBorjeetbGiU4cjZ1pbewF6ZmBMj7jCEWxA6pmgTooYTCStHZFitsEgnut7V3YpKt8ptgT1hgK5DuLS4baqXHQXj');
        const tezos = new TezosToolkit(provider);
    tezos.setSignerProvider( signer );
    try {

        const contract = await tezos.contract.at('KT1DGu9gLm5MszYh3zf1uVJvJTJnQD7pqBtg')



        const op = await contract.methods.commit(char2Bytes('Hello')).send()
        console.log((await op.confirmation(1)).toLocaleString)





  }


     catch (ex) {
        console.log(ex)
    }
}

example();

