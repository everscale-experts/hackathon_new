// import {RpcClientInterface} from "@taquito/rpc"
// import { TezosToolkit } from '@taquito/taquito'
// import { importKey } from '@taquito/signer'
import { Schema } from "@taquito/michelson-encoder";

// const Tezos = new TezosToolkit("https://rpc.hangzhounet.teztnets.xyz")



// const script = Tezos.rpc.getScript('KT1SYmWUEZu13tycy5cLEaYuDtoG6Zf6DsxL')

// const schema = Schema.fromRPCResponse({script})

// console.log(script)

import { TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';


async function example() {
    const provider = 'https://mainnet.api.tez.ie';
    const signer: any = new InMemorySigner('edsk31hLYrJqTeHqsLPdo1Ab5SKw7PUXUuWBt95UBFkLj3KrW1Dt6x');
        const tezos = new TezosToolkit(provider);
    tezos.setSignerProvider( signer );
    try {

        const contract = await tezos.contract.at('KT1Cecn3A2A4i9EmSqug45iyzUUQc4F7C9yM');

        console.log("Showing schem...");
        // получаем схему
        const schema = await contract.script.code
        // выводим схему в json формате
        console.log(JSON.stringify(schema, null, 2));





  }


     catch (ex) {
        console.log(ex)
    }
}

example();


