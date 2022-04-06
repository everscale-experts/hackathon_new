import {Tezos} from "./tezos"

const account1 = require("./account1.json")
const contract_code = require("./token_contract.json");

const RPC = "https://rpc.hangzhounet.teztnets.xyz";

const tezos = new Tezos(RPC, account1);

async function main() {
    console.log("Account:", await tezos.getOwnBalance(), "ꜩ");;

    // создаём свой токен
    const hash = await tezos.createToken(contract_code, 1000);

    console.log("Токен создан. Адрес:", hash)
}

main();