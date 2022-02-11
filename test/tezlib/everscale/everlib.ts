import { Account, AccountOptions } from "@tonclient/appkit"
import fs from "fs";
import path from "path";
import {
    signerKeys,
    TonClient,
    abiContract,
    signerNone,
    KeyPair
} from "@tonclient/core"



export function read(name: string, encoding?: BufferEncoding){
    return fs.readFileSync(path.resolve(__dirname, "contracts", name)).toString(encoding)
}

export function getContract(name: string){
    return {
        abi: JSON.parse(read(`${name}.abi.json`)),
        tvc: read(`${name}.tvc`, "base64")
    }
}

const transferCommentAbi = {
    "ABI version": 2,
    "functions": [
        {
            "name": "transfer",
            "id": "0x00000000",
            "inputs": [{"name":"comment","type":"bytes"}],
            "outputs": []
        }
    ],
    "events": [],
    "data": []
}

export class Wallet extends Account {
    private keys: KeyPair;
    public balance: number

    constructor(client: TonClient, keys: KeyPair){
        super(getContract("Wallet"), {
            signer: signerKeys(keys),
            client
        });

        this.keys = keys;
    }

    static async init (client, keys) {
        const wallet = new Wallet(client, keys);
        const walletBalance = parseInt(await wallet.getBalance(), 16);
        wallet.balance = walletBalance;

        if (Number.isNaN(walletBalance)) {
            await wallet.deploy({
                initInput: {
                    owners: ["0x" + keys.public],
                    reqConfirms: 1
                },
                useGiver: true
            })
            wallet.balance = parseInt(await wallet.getBalance(), 16);
        }

        return wallet;
    }

    private async getCommentPayload(text: string){
        return (await this.client.abi.encode_message_body({
            abi: abiContract(transferCommentAbi),
            call_set: {
                function_name: "transfer",
                input: {
                    comment: Buffer.from(text).toString("hex"),
                },
            },
            is_internal: true,
            signer: signerNone(),
        })).body;
    }

    public balanceChange(onRecieved: (delta: number) => void, onSpent: (delta: number) => void = () => {}){
        this.subscribeAccount("balance", (acc) => {
            const newBalance = parseInt(acc.balance, 16);
            const delta = (newBalance - this.balance) / 1_000_000_000;
            delta > 0 ? onRecieved(delta) : onSpent(-delta);
            this.balance = newBalance;
        })
    }

    public async transfer(to: string, amount: number, comment: string){
        return this.run("submitTransaction", {
            dest: to,
            value: amount * 1_000_000_000,
            bounce: false,
            allBalance: false,
            payload: await this.getCommentPayload(comment)
        })
    }
}