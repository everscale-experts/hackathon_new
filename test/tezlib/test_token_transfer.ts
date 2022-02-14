import {Tezos} from "./tezos/tezos"

const account1 = require("./account1.json")
const account2 = require("./account2.json")

const RPC = "https://rpc.hangzhounet.teztnets.xyz";

const tezos = new Tezos(RPC, account1);

const CONTRACT = "KT1U5poZbk19ym28pK2tarU2Lohb8kpgvLME";

async function main() {
    const hash = await tezos.transferToken(CONTRACT, account1.pkh, account2.pkh, 10);
    console.log("Токен отправлен. Хэш:", hash)
}

main();