import { TonClient } from "@tonclient/core";
import { libNode } from "@tonclient/lib-node";
import { TokenWallet } from "./everscale/everlib";
import config from "./everscale_transfer.config.json";

TonClient.useBinaryLibrary(libNode);

const client = new TonClient({ 
    network: { 
        endpoints: ['net.ton.dev']
    }
});

async function main() {
    const sender = new TokenWallet(client, {
        public: config.account.keys.public,
        secret: config.account.keys.secret
    }, config.account.address)

    const reciever = new TokenWallet(client, null, config.to)

    console.log("[!] Sender balance:", await sender.getBalance());
    console.log("[!] Reciever balance: ", await reciever.getBalance());

    console.log(`[!] Sending ${config.amount} tokens to ${reciever.address} with payload: ${config.transfer_payload}`)
    const transactionID = await sender.transfer(reciever.address, config.amount, config.transfer_payload);
    console.log("[!] TXID:", transactionID)

    console.log("[!] Sender balance:", await sender.getBalance());
    console.log("[!] Reciever balance: ", await reciever.getBalance());
}

main().catch(e => {
    console.log(e);
});