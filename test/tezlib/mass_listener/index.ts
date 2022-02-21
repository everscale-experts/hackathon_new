import { TonClient } from "@tonclient/core";
import { libNode } from "@tonclient/lib-node";
import { MassListener as EverscaleListener, Wallet } from "../everscale"
import { MassListener as TezosListener, Tezos } from "../tezos";
import ever_config from "./everscale.config.json";
import tezos_config from "./tezos.config.json";

import acc1 from "../tezos/accounts/account1.json"
import acc2 from "../tezos/accounts/account2.json"

TonClient.useBinaryLibrary(libNode);

const client = new TonClient({ 
    network: { 
        endpoints: ['net.ton.dev']
    }
});

const tezosRpc = "https://rpc.hangzhounet.teztnets.xyz";

async function main() {
    const tezos_listener = new TezosListener(tezosRpc, [tezos_config.coin.address], tezos_config.tokens);
    const everscale_listener = new EverscaleListener(client, [ever_config.coin.address], ever_config.tokens);
    everscale_listener.onReceived(notification => {
        console.log("RECEIVED:", notification);
    });

    tezos_listener.onRecieved((notification) => {
        console.log(notification)
    })

    const wallet1 = new Tezos(tezosRpc, acc1);
    const wallet2 = new Tezos(tezosRpc, acc2);

    await wallet2.transferToken("KT1TbLx2naxBorSXfo1KzZDe5taYfTyXD3YX", "tz1gVYfPffnmhyZkiEXadeg5SS8uerbXo2DM", 5);
    console.log("transfer complete!");
}

main().catch(e => {
    console.log(e);
});