import { Tezos } from "./tezos";
import { signerKeys, TonClient } from "@tonclient/core";
import { Account } from "@tonclient/appkit";
import { libNode } from "@tonclient/lib-node";
import { Wallet, getContract } from "./everscale/everlib";

const tokenContractCode = require("./tezos/contracts/token_contract.json");

const accountKeys1 = require("./tezos/accounts/account1.json");
const accountKeys2 = require("./tezos/accounts/account2.json");
const accountKeys3 = require("./tezos/accounts/account3.json");
const accountKeys4 = require("./tezos/accounts/account4.json");

const accountKeys5 = require("./everscale/accounts/account1.json")
const accountKeys6 = require("./everscale/accounts/account2.json")
const accountKeys7 = require("./everscale/accounts/account3.json")
const accountKeys8 = require("./everscale/accounts/account4.json")

const RPC = "https://rpc.hangzhounet.teztnets.xyz";

TonClient.useBinaryLibrary(libNode);

const client = new TonClient({ 
    network: { 
        endpoints: ['net.ton.dev']
    }
});

async function createToken(account: Tezos){
    console.log(`Создаём токен с ${await account.getAddress()}...`)
    const tokenAddress = await account.createToken(tokenContractCode, 10000);
    console.log(`Токен создан! Адрес: ${tokenAddress}`)
    return tokenAddress;
}

async function transferToken(tokenAddress: string, from: Tezos, to: Tezos, amount: number) {
    const recieverAddress = await to.getAddress();
    console.log(`Отправляем токен на адрес ${recieverAddress}...`)
    const transferHash = await from.transferToken(tokenAddress, recieverAddress, amount);
    console.log(`Перевод успешен! Хэш операции: ${transferHash}`)
    return transferHash;
}

async function onContractAction(data: any){
    if (data.kind === "transaction"){
        const [{string: reciever}, {int: amount}] = data.parameters.value.args[1].args;
        console.log(`[!] На адрес ${reciever} пришло ${amount} токенов!`);
        const everscale1 = createEverscaleTokenWallet();
        await transferEverscaleToken(everscale1, amount);
        console.log(`[!] В сети Everscale отправлены токены!`);
    }
}

function createEverscaleTokenWallet(){
    return new Account(getContract("TokenWallet"), {
        client,
        address: "0:fac2714d40492bf96ed0ff4231a41d274af3b2a36283debce112434a9ceb9647",
        signer: signerKeys({
            public: "fdee028b0ab1bff8845447a2ac16a44b3598ae53cd7558824d124b214db5e724",
            secret: "8a102aee621fbe2b4b57ecf68a220bcf5826c69a5ac585d109337e3dbc230614"
        })
    })
}

async function transferEverscaleToken(everscale: Account, amount: number){
    return everscale.run("transfer", {
        answer_addr: await everscale.getAddress(),
        to: "0:bdd066bacf2357ca05e3571422d38d12b7dffb584682d9fa6a33b0ea940375f1",
        tokens: amount * 1_000_000_000,
        evers: 0,
        return_ownership: 0,
    }).catch(e => console.log("ERROR:", e))
}

async function main() {
    const tezos1 = new Tezos(RPC, accountKeys1);
    const tezos2 = new Tezos(RPC, accountKeys2);

    const tokenAddress = await createToken(tezos1);

    console.log(`Подписываемся на созданный токен...`);
    tezos2.subscribeContract(tokenAddress, onContractAction);

    await transferToken(tokenAddress, tezos1, tezos2, 1);
}

main();