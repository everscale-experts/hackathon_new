import { Tezos } from "./tezos";
import config from "./config.json";

const RPC = "https://rpc.hangzhounet.teztnets.xyz";

async function main() {
    const tezos = new Tezos(RPC, config.tezos_token_sender.keys)
    console.log(`[!] Sending ${config.tezos_token_sender.amount} tokens to ${config.tezos_token_listener}`)
    await tezos.transferToken(config.tezos_token_contract, config.tezos_token_listener, config.tezos_token_sender.amount)
    console.log("[!] Token sent succesfully!");
}

main().catch(e => {
    console.log(e);
});