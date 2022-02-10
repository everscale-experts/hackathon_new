import { TonClient } from "@tonclient/core"
import { libNode } from "@tonclient/lib-node";
import { Wallet } from "./everlib";

import accountCredentials from "./accounts/account1.json"

TonClient.useBinaryLibrary(libNode);


const client = new TonClient({ 
    network: { 
        endpoints: ['net.ton.dev']
    }
});

async function main() {
    const wallet = await Wallet.init(client, accountCredentials);

    const info = await wallet.transfer("0:3c6f04bf89d7f57c0b5ed014af9fe324ac782f77ffd2543afd1f06dc17dfd925", 10, "test 123");
    console.log(await wallet.get(info.transaction.id))
}

main();