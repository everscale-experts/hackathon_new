import { TonClient } from "@tonclient/core";
import { libNode } from "@tonclient/lib-node";
import { MassListener, Wallet } from "../everscale"
import config from "./config.json";

TonClient.useBinaryLibrary(libNode);

const client = new TonClient({ 
    network: { 
        endpoints: ['net.ton.dev']
    }
});

async function main() {
    const listener = new MassListener(client, [config.coin.address], config.tokens);
    listener.onRecieved(notification => {
        console.log("RECIEVED:", notification);
    })
    
    const wallet = await Wallet.init(client, await client.crypto.generate_random_sign_keys());
    await wallet.transfer(config.coin.address, 1);
}

main().catch(e => {
    console.log(e);
});
