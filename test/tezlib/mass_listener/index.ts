import { TonClient } from "@tonclient/core";
import { libNode } from "@tonclient/lib-node";
import { MassListener as EverscaleListener, Wallet } from "../everscale"
import { MassListener as TezosListener, Tezos } from "../tezos";
import ever_config from "./everscale.config.json";
import tezos_config from "./tezos.config.json";

import acc from "../tezos/accounts/account2.json"

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

    everscale_listener.onReceived((notification) => {
        console.log("EVER:", notification);
    });

    tezos_listener.onRecieved((notification) => {
        console.log("TEZOS:", notification)
    })

    const wallet = new Tezos(tezosRpc, acc);

    await wallet.transferToken("KT1TbLx2naxBorSXfo1KzZDe5taYfTyXD3YX", "tz1gVYfPffnmhyZkiEXadeg5SS8uerbXo2DM", 5);
    console.log("ready1")
    await wallet.transferToken("KT1GtBcFDFpKDh2jaazdbdm1bAjg5mAWGF8c", "tz1gVYfPffnmhyZkiEXadeg5SS8uerbXo2DM", 10);
    console.log("ready2")
    await wallet.transferToken("KT1QaDnrBGSZZzNnhCU5tG1LZqma9WfSf1Ee", "tz1gVYfPffnmhyZkiEXadeg5SS8uerbXo2DM", 8);
    console.log("ready3")
}

main().catch(e => {
    console.log(e);
});