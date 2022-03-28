import { TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';


async function example() {
    const provider = 'https://rpc.hangzhounet.teztnets.xyz';
    const signer: any = new InMemorySigner('edsk3kvk241t24haGeub1yJhrMHuFzTLo4uLc9gCbvhS91atVr4TTZ');
        const tezos = new TezosToolkit(provider);
    tezos.setSignerProvider( signer );
    try {

        // Не работает, Error: No big map schema 
        // const schema = await tezos.contract.getBigMapKey('KT1WGc5s9WwGHi5TUGAGvX9dSP1sbD8qdEc6','exprthA3d55ZxYP1XP22aad2VLJvcThGMNrHJYa5cUCPiU9UAknxRT')
        // console.log(JSON.stringify(schema, null, 2));
        
        // Не работает, Error: No big map schema 
        // const contract = await tezos.contract.at('KT1WGc5s9WwGHi5TUGAGvX9dSP1sbD8qdEc6')
        // const schema = await contract.bigMap('195502')
        // console.log(JSON.stringify(schema, null, 2));
 
        // Не работает, Error: No big map schema
        // const contract = await tezos.contract.at('KT1WGc5s9WwGHi5TUGAGvX9dSP1sbD8qdEc6')
        // const schema = await contract.schema.EncodeBigMapKey
        // const schema1 = await contract.schema
        // const schemabigmap= await tezos.contract.getBigMapKeyByID('195502',schema,schema1 )
        // console.log(JSON.stringify(schemabigmap, null, 2));

        const contract = await tezos.contract.at('KT1WGc5s9WwGHi5TUGAGvX9dSP1sbD8qdEc6')
        const storage: any = await contract.storage();
        const proposal = await storage.proposals.get(1);
        console.log(JSON.stringify(proposal, null, 2));
    
  }


     catch (ex) {
        console.log(ex)
    }
}

example();

// import{require} from 'requirejs'

// const signalR = require("@microsoft/signalr");

// const connection = new signalR.HubConnectionBuilder()
//     .withUrl("https://api.tzkt.io/v1/bigmap")
//     .build();


