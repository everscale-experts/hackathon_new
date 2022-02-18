import { TonClient } from "@tonclient/core";
import { libNode } from "@tonclient/lib-node";
import { Wallet, TokenWallet} from "./everscale/everlib";
import config from "./config.json"

TonClient.useBinaryLibrary(libNode);

const client = new TonClient({ 
    network: { 
        endpoints: ['net.ton.dev']
    }
});

async function getFreeEver(address: string){
    const wallet = await Wallet.init(client, await client.crypto.generate_random_sign_keys());
    await wallet.transfer(address, 1);
}

async function main() {
    const tokenWallet = new TokenWallet(client, {
        public: config.everscale_token_sender.keys.public,
        secret: config.everscale_token_sender.keys.secret
    }, config.everscale_token_sender.address)

    console.log("[!] Sender balance:", await tokenWallet.getBalance())
    console.log(`[!] Giving ${tokenWallet.address} 1 ever...`)
    await getFreeEver(tokenWallet.address);
    console.log(`[!] Success!`)
    console.log("[!] Sender balance:", await tokenWallet.getBalance())
}

main().catch(e => {
    console.log(e);
});