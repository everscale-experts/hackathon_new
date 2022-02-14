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

interface ITransactionNotification {
    id: string // txid
    from: string
    to: string
    amount: number
    payload: string
}

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

    constructor(client: TonClient, keys: KeyPair | null, address?: string){
        super(getContract("Wallet"), {
            signer: keys ? signerKeys(keys) : signerNone(),
            address: address,
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

    public async transfer(to: string, amount: number, comment?: string){
        const balance = parseInt(await this.getBalance(), 16);
        if(amount * 1_000_000_000 > balance) throw new Error("Not enough balance!");
        return this.run("submitTransaction", {
            dest: to,
            value: amount * 1_000_000_000,
            bounce: false,
            allBalance: false,
            payload: comment ? await this.getCommentPayload(comment) : ""
        })
    }
    
    public async onTransaction(callback: (data: ITransactionNotification) => void){
        await this.client.net.subscribe_collection({
            collection: "transactions",
            filter: {
                account_addr: { eq: await this.getAddress() }
            },
            result: "id in_message {value src dst} in_msg balance_delta aborted",
        }, async (params) => {
            const message = await this.client.net.query_collection({
                collection: "messages",
                filter: { id: { eq: params.result.in_msg } },
                result: "boc"
            })

            const payload = await this.client.abi.decode_message({
                abi: abiContract(transferCommentAbi),
                message: message.result[0].boc,
            })
                .then(decoded => Buffer.from(decoded.value.comment, "hex").toString())
                .catch(err => null);

            callback({
                id: params.result.id,
                from: params.result.in_message.src,
                to: params.result.in_message.dst,
                amount: parseInt(params.result.balance_delta, 16) / 1_000_000_000,
                payload: payload
            })
        });
    }
}