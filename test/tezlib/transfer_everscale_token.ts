import { TonClient } from "@tonclient/core";
import { libNode } from "@tonclient/lib-node";
import { TokenWallet } from "./everscale/everlib";
import config from "./config.json";

TonClient.useBinaryLibrary(libNode);

const client = new TonClient({ 
    network: { 
        endpoints: ['net.ton.dev']
    }
});

async function main() {
    const sender = new TokenWallet(client, {
        public: config.everscale_token_sender.keys.public,
        secret: config.everscale_token_sender.keys.secret
    }, config.everscale_token_sender.address)

    const reciever = new TokenWallet(client, null, config.everscale_token_listener)

    console.log("[!] Sender balance:", await sender.getBalance());
    console.log("[!] Reciever balance: ", await reciever.getBalance());

    console.log(`[!] Sending ${config.everscale_token_sender.amount} tokens to ${reciever.address}`)
    const transactionID = await sender.transfer(reciever.address, config.everscale_token_sender.amount, "address123");
    console.log("[!] TXID:", transactionID)

    console.log("[!] Sender balance:", await sender.getBalance());
    console.log("[!] Reciever balance: ", await reciever.getBalance());
}

main().catch(e => {
    console.log(e);
});