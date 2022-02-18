import {Tezos} from "../tezos"

const account1 = require("./tezos/accounts/account1.json")
const account2 = require("./tezos/accounts/account2.json")

const RPC = "https://rpc.hangzhounet.teztnets.xyz";

const tezos = new Tezos(RPC, account1);

async function main() {
    console.log("Account 1:", await tezos.getOwnBalance(), "ꜩ");
    console.log("Account 2:", await tezos.getBalance(account2.pkh), "ꜩ");

    await tezos.transfer("tz1WtthyqxFXaC46kBC18UXdqboeTqEjqwtX", 2).then(hash => {
        console.log("Transfer successful: ", hash)
    })

    console.log("Account 1:", await tezos.getOwnBalance(), "ꜩ");
    console.log("Account 2:", await tezos.getBalance(account2.pkh), "ꜩ");
}

main();