import { TezosToolkit } from "@taquito/taquito";
import { TonClient, abiContract } from "@tonclient/core";
import { libNode } from "@tonclient/lib-node";
import { TokenWallet } from "./everscale";
import config from "./listener.config.json";

const RPC = "https://rpc.hangzhounet.teztnets.xyz";

TonClient.useBinaryLibrary(libNode);

const client = new TonClient({ 
    network: {
        endpoints: ['net.ton.dev']
    }
});

async function main() {
    const tezos = new TezosToolkit(RPC);
    const everscale = new TokenWallet(client, null, config.everscale.address);
    
    console.log(`[*] EVERSCALE: Listening ${everscale.address} for incoming tokens...`)
    console.log(`[*] TEZOS: Listening ${config.tezos.token_contract} for incoming tokens...`)
    console.log("\n");

    everscale.onTokenRecieved(data => {
        console.log(`[*] EVERSCALE: Token recieved!\n | Amount: ${data.amount}\n | Payload: ${data.payload}`);
    })

    const tezosSubscription = tezos.stream.subscribeOperation({
        and: [{destination: config.tezos.token_contract }]
    });

    tezosSubscription.on("data", (data: any) => {
        const [{string: reciever}, {int: amount}] = data.parameters.value.args[1].args;
        if(reciever === config.tezos.address) {
            console.log(`[*] TEZOS: Token recieved!\n | Amount: ${amount}`);
        }
    })
}

main().catch(e => {
    console.log(e);
});