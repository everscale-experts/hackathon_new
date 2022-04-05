import { TonClient } from "@tonclient/core";
import { libNode } from "@tonclient/lib-node";
import { Wallet, TokenWallet} from "./everscale";
import config from "./everscale_transfer.config.json"

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
        public: config.account.keys.public,
        secret: config.account.keys.secret
    }, config.account.address)

    console.log("[!] Sender balance:", await tokenWallet.getBalance())
    console.log(`[!] Giving ${tokenWallet.address} 1 ever...`)
    await getFreeEver(tokenWallet.address);
    console.log(`[!] Success!`)
    console.log("[!] Sender balance:", await tokenWallet.getBalance())
}

main().catch(e => {
    console.log(e);
});