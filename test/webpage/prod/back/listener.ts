import { TezosToolkit } from "@taquito/taquito";
import { TonClient, abiContract } from "@tonclient/core";
import { libNode } from "@tonclient/lib-node";
import { TokenWallet } from "./everscale";
import config from "./listener.config.json";
import { token_transfer } from './token-transfer'
import { Tezos } from "./tezos";



const RPC = "https://rpc.hangzhounet.teztnets.xyz";
const RPC_URL = 'https://rpc.hangzhounet.teztnets.xyz'
const CONTRACT = 'KT1WhqQJyuznPdGD3JM3iqMpaRveeUuVSz9k' //адрес опубликованного контракта
const SENDER = 'tz1i5w4BTmwB51efYjcziq6G5eJC5ra2gqHF' //публичный адрес отправителя — возьмите его из accaunt1.json
const RECEIVER = 'tz1Qw2LiqMNwJXKKzimAVMWj5W467Hrd6dP7' //публичный адрес получателя — возьмите его из кошелька Tezos, который вы создали
const AMOUNT = 167 //количество токенов для отправки в сатошах, меньших единицах токена. Можете ввести другое число
const ID=1

TonClient.useBinaryLibrary(libNode);

const client = new TonClient({
    network: {
        endpoints: ['main3.ton.dev']
    }
});

async function main() {
    const tezos = new TezosToolkit(RPC);
    const everscale = new TokenWallet(client, null, config.everscale.address);
    console.log(everscale);

    console.log(`[*] EVERSCALE: Listening ${everscale.address} for incoming tokens...`)
    console.log(`[*] TEZOS: Listening ${config.tezos.token_contract} for incoming tokens...`)
    console.log("\n");

    everscale.onTokenReceived(async data => {
        console.log(`[*] EVERSCALE: Token received!\n | Amount: ${data.amount}\n | Payload: ${data.payload}`);
        new token_transfer(RPC_URL).transfer(CONTRACT, SENDER, RECEIVER, AMOUNT, ID)


    })

    const tezosSubscription = tezos.stream.subscribeOperation({
        and: [{destination: config.tezos.token_contract }]
    });

    tezosSubscription.on("data", (data: any) => {
        const [{string: reciever}, {int: amount}] = data.parameters.value.args[1].args;
        if(reciever === config.tezos.address) {
            console.log(`[*] TEZOS: Token received!\n | Amount: ${amount}`);
        }
    })
}

main().catch(e => {
    console.log(e);
});
