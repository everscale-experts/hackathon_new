import {Tezos} from "./tezos/tezos"

const account1 = require("./account1.json")
const account2 = require("./account2.json")

const RPC = "https://rpc.hangzhounet.teztnets.xyz";

const tezos1 = new Tezos(RPC, account1);
const tezos2 = new Tezos(RPC, account2);

function delay(ms: number){
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

async function main() {
    // подписываемся, ждём транзакцию...
    tezos1.subscribe(data => {
        console.log(`Получены монеты от ${data.source} [hash ${data.hash}] ${data.amount / 1000000} ꜩ`);
    })

    await tezos2.transfer(account1.pkh, 10);
    
    await delay(10000)

    // отписываемся, после этого уведомления быть не должно
    tezos1.unsubscribe()

    await tezos2.transfer(account1.pkh, 10);
}

main();