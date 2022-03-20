// import {RpcClientInterface} from "@taquito/rpc"
// import { TezosToolkit } from '@taquito/taquito'
// import { importKey } from '@taquito/signer'
import { Schema } from "@taquito/michelson-encoder";





// const script = Tezos.rpc.getScript('KT1SYmWUEZu13tycy5cLEaYuDtoG6Zf6DsxL')

// const schema = Schema.fromRPCResponse({script})

// console.log(script)

import { TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';


async function example() {
    const provider = 'https://rpc.hangzhounet.teztnets.xyz';
    const signer: any = new InMemorySigner('edskRdkUMmmBorjeetbGiU4cjZ1pbewF6ZmBMj7jCEWxA6pmgTooYTCStHZFitsEgnut7V3YpKt8ptgT1hgK5DuLS4baqXHQXj');
        const tezos = new TezosToolkit(provider);
    tezos.setSignerProvider( signer );
    try {

        const contract = await tezos.contract.at('KT1WGc5s9WwGHi5TUGAGvX9dSP1sbD8qdEc6');

        console.log("Showing schem...");
        
        const schema1 = await contract.storage();
        console.log(JSON.stringify(schema1, null, 2));

        const schema = await contract.bigMap('195502') //Error: No big map schema
        // выводим в json формате
        console.log(JSON.stringify(schema, null, 2));

  }


     catch (ex) {
        console.log(ex)
    }
}

example();


