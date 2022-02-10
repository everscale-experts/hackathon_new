import {Tezos} from "./tezos/tezos"

const account1 = require("./account1.json")

const RPC = "https://rpc.hangzhounet.teztnets.xyz";

const CONTRACT = "KT1U5poZbk19ym28pK2tarU2Lohb8kpgvLME"

const tezos = new Tezos(RPC, account1);

async function main() {

    tezos.subscribeContract(CONTRACT, (data) => {
        console.log(data);
    });
}

main();