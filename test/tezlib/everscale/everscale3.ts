import { TonClient } from "@tonclient/core"
import { libNode } from "@tonclient/lib-node";
import { Wallet } from "./everlib";

import accountCredentials1 from "./accounts/account1.json"
import accountCredentials2 from "./accounts/account2.json"

TonClient.useBinaryLibrary(libNode);


const client = new TonClient({ 
    network: { 
        endpoints: ['net.ton.dev']
    }
});

async function main() {
    const wallet1 = await Wallet.init(client, accountCredentials1);
    const wallet2 = await Wallet.init(client, accountCredentials2);

    const sender = await wallet1.getAddress();
    const reciever = await wallet2.getAddress();

    const info = await wallet1.transfer(reciever, 10, "test 123");

    console.log(`Transfer from ${sender} to ${reciever} suceeded! TXID: ${info.transaction.id}`)
}

main();