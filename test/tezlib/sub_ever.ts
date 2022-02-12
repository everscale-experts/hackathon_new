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

    const account1 = {
        public: '43534945ae83b679309fd89df124f862aa398e9584f8090a25dab0b1921d4d59',
        secret: '141573167c3d0ea2f13e05355704ecc1556433fc2dd2afa85971c035e9c461b5'
    }

    const reciever = "0:691e08ff23923954d895faa8146364b9b03a5baac90a24197da84b6293f9f287";

    const wallet1 = await Wallet.init(client, account1);
    const wallet2 = new Wallet(client, null, reciever);

    wallet2.onTransaction(data => {
        console.log(data);
    })

    await wallet1.transfer(reciever, 1);
}

main();