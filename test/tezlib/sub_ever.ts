import { TonClient, abiContract } from "@tonclient/core";
import { libNode } from "@tonclient/lib-node";
import { Wallet } from "./everscale/everlib";

TonClient.useBinaryLibrary(libNode);

const client = new TonClient({ 
    network: { 
        endpoints: ['net.ton.dev']
    }
});


async function main() {
    const keys = await client.crypto.generate_random_sign_keys();

    const reciever = "0:691e08ff23923954d895faa8146364b9b03a5baac90a24197da84b6293f9f287";

    const wallet1 = await Wallet.init(client, keys);
    const wallet2 = new Wallet(client, null, reciever);

    wallet1.onTransaction(data => {
        if(data.amount < 0){
            console.log("Money sent!")
        } else {
            console.log("Money Recived:", data);
        }
    })

    await wallet1.transfer(reciever, 5, "custom payload");
}

main();