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
    const signer: any = new InMemorySigner('edsk3kvk241t24haGeub1yJhrMHuFzTLo4uLc9gCbvhS91atVr4TTZ');
        const tezos = new TezosToolkit(provider);
    tezos.setSignerProvider( signer );
    try {

        // const contract = await tezos.contract.getbig

        // console.log("Showing schem...");
        
        // const schem = contract.bigMap('195501')
        
        
        // console.log(JSON.stringify(schem, null, 2));

        
        
        // const schema = await storage
        // // выводим в json формате
        // console.log(JSON.stringify(schema, null, 2));
        
        // вот такой пример дали для того чтобы получить big map 
        // const contract1 = await tezos.wallet.at('tz1LpyieamcZRUAEqXxRz6k7yEG1GfMkX3At')
        // const storage = await contract1.bigMap('195501')
        

        // второй пример который дали
//         const contract = await tezos.contract.at('KT1WGc5s9WwGHi5TUGAGvX9dSP1sbD8qdEc6');

// console.log("Showing schem...");
    
// const schema1 = await contract.storage();
// console.log(JSON.stringify(schema1, null, 2));

// const schema = await schema1.bigMap('195502') // Should work now if the bigmap id is correct
   
// console.log(JSON.stringify(schema, null, 2));

  }


     catch (ex) {
        console.log(ex)
    }
}

example();

import{require} from 'requirejs'

const signalR = require("@microsoft/signalr");

const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://api.tzkt.io/v1/events")
    .build();

async function init() {
    // open connection
    await connection.start();
    // subscribe to head
    await connection.invoke("SubscribeToHead");
    // subscribe to account transactions
    await connection.invoke("SubscribeToOperations", {
        address: 'KT19kgnqC5VWoxktLRdRUERbyUPku9YioE8W',
        types: 'transaction'
    });
};

init()