import { TezosToolkit } from "@taquito/taquito";
import { TonClient } from "@tonclient/core";
import { libNode } from "@tonclient/lib-node";
import { TokenWallet } from "./everscale/everlib";
import config from "./config.json";

const RPC = "https://rpc.hangzhounet.teztnets.xyz";

TonClient.useBinaryLibrary(libNode);

const client = new TonClient({ 
    network: {
        endpoints: ['net.ton.dev']
    }
});

async function main() {
    const tezos = new TezosToolkit(RPC);
    const everscale = new TokenWallet(client, null, config.everscale_token_listener);
    
    console.log(`[!] EVERSCALE: Listening ${everscale.address} for incoming tokens...`)
    console.log(`[!] TEZOS: Listening ${config.tezos_token_contract} for incoming tokens...`)

    everscale.onTokenRecieved(data => {
        console.log(`[!] EVERSCALE: На адрес ${everscale.address} пришло ${data.amount} токенов!`);
    })

    const tezosSubscription = tezos.stream.subscribeOperation({
        and: [{destination: config.tezos_token_contract }]
    });

    tezosSubscription.on("data", (data: any) => {
        const [{string: reciever}, {int: amount}] = data.parameters.value.args[1].args;
        if(reciever === config.tezos_token_listener) {
            console.log(`[!] TEZOS: На адрес ${reciever} пришло ${amount} токенов!`);
        }
    })
}

main().catch(e => {
    console.log(e);
});