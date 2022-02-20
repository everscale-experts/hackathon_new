import { Tezos } from "./tezos";
import config from "./tezos_transfer.config.json";

const RPC = "https://rpc.hangzhounet.teztnets.xyz";

async function main() {
    const tezos = new Tezos(RPC, config.account)
    console.log(`[!] Sending ${config.amount} tokens to ${config.to}`)
    await tezos.transferToken(config.token_contract, config.to, config.amount)
    console.log("[!] Token sent succesfully!");
}

main().catch(e => {
    console.log(e);
});