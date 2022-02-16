import { Tezos } from "./tezos"

const tokenContractCode = require("./tezos/contracts/token_contract.json");

const accountKeys1 = require("./tezos/accounts/account1.json");
const accountKeys2 = require("./tezos/accounts/account2.json");

const RPC = "https://rpc.hangzhounet.teztnets.xyz";

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
        console.log(`[!] На адрес ${reciever} пришло ${amount} токенов!`)
    }
}

async function main() {
    const account1 = new Tezos(RPC, accountKeys1);
    const account2 = new Tezos(RPC, accountKeys2);

    const tokenAddress = "KT1RgRxpLdqvT1ys1DNabjdqZLaBugDYRRPF" // await createToken(account1);

    console.log(`Подписываемся на созданный токен...`)
    account2.subscribeContract(tokenAddress, onContractAction);

    const transferHash = await transferToken(tokenAddress, account1, account2, 50)

}

main();