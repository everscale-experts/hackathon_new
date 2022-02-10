import { TonClient } from "@tonclient/core"
import { libNode, } from "@tonclient/lib-node";
import { Wallet } from "./everscale//everlib";
import { Tezos } from "./tezos/tezos"

const accountCredentials1 = require("./everscale/accounts/account1.json")
const accountCredentials2 = require("./everscale/accounts/account2.json")
const accountCredentials3 = require("./everscale/accounts/account3.json")
const accountCredentials4 = require("./everscale/accounts/account4.json")

const accountCredentials5 = require("./tezos/accounts/account1.json")
const accountCredentials6 = require("./tezos/accounts/account2.json")
const accountCredentials7 = require("./tezos/accounts/account3.json")
const accountCredentials8 = require("./tezos/accounts/account4.json")

function delay(ms: number){
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    })
}

TonClient.useBinaryLibrary(libNode);

const client = new TonClient({ 
    network: { 
        endpoints: ['net.ton.dev']
    }
});

const TezosRPC = "https://rpc.hangzhounet.teztnets.xyz";

async function main() {
    // everscale wallets
    const wallet1 = await Wallet.init(client, accountCredentials1);
    const wallet2 = await Wallet.init(client, accountCredentials2);
    const wallet3 = await Wallet.init(client, accountCredentials3);
    const wallet4 = await Wallet.init(client, accountCredentials4);

    // tezos wallets
    const wallet5 = new Tezos(TezosRPC, accountCredentials5);
    const wallet6 = new Tezos(TezosRPC, accountCredentials6);
    const wallet7 = new Tezos(TezosRPC, accountCredentials7);
    const wallet8 = new Tezos(TezosRPC, accountCredentials8);

    wallet2.balanceChange(async () => {
        console.log("[everscale] wallet2 recieved money, initializing transfer from wallet7 to wallet8...");
        const hash = await wallet7.transfer(accountCredentials8.pkh, 10);
        console.log(`[tezos] Transfer from ${accountCredentials7.pkh} to ${accountCredentials8.pkh} succeeded! Hash: ${hash}`);

    })

    wallet6.subscribe(async () => {
        console.log("[tezos] wallet6 recieved money, initializing transfer from wallet3 to wallet4...");
        const info = await wallet3.transfer(await wallet4.getAddress(), 10, "test 123");
        console.log(`[everscale] Transfer from ${await wallet3.getAddress()} to ${await wallet4.getAddress()} succeeded! TXID: ${info.transaction.id}`);
    })

    const senderEverscale = await wallet1.getAddress();
    const recieverEverscale = await wallet2.getAddress();

    console.log("[everscale] Sending money from wallet1 to wallet2...")
    const info = await wallet1.transfer(recieverEverscale, 10, "test 123");
    console.log(`[everscale] Transfer from ${senderEverscale} to ${recieverEverscale} succeeded! TXID: ${info.transaction.id}`);

    await delay(15000);

    console.log("[tezos] Sending money from wallet5 to wallet6...")
    const hash = await wallet5.transfer(accountCredentials6.pkh, 10);
    console.log(`[tezos] Transfer from ${accountCredentials5.pkh} to ${accountCredentials6.pkh} succeeded! Hash: ${hash}`);

}



main();