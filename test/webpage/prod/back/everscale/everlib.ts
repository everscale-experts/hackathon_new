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
        const {acc_type} = await wallet.getAccount();

        if (acc_type === 3) await wallet.deploy({
            initInput: {
                owners: ["0x" + keys.public],
                reqConfirms: 1
            },
            useGiver: true
        })
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
        await this.subscribe("transactions", {
            account_addr: { eq: await this.getAddress() }
        },  "id in_message {value src dst} in_msg balance_delta aborted", async params => {
            const message = await this.client.net.query_collection({
                collection: "messages",
                filter: { id: { eq: params.in_msg } },
                result: "boc"
            })

            const payload = await this.client.abi.decode_message({
                abi: abiContract(transferCommentAbi),
                message: message.result[0].boc,
            })
                .then(decoded => Buffer.from(decoded.value.comment, "hex").toString())
                .catch(err => null);

            callback({
                id: params.id,
                from: params.in_message.src,
                to: params.in_message.dst,
                amount: parseInt(params.balance_delta, 16) / 1_000_000_000,
                payload: payload
            })
        })
    }
}

interface ITokenRecievedNotification {
    message_id: string
    from: string
    amount: number
}

export class TokenWallet {
    public address: string;
    private account: Account;
    private keys: KeyPair | null;

    constructor(client: TonClient, keys: KeyPair | null, address: string){
        this.address = address;
        this.keys = keys;
        this.account = new Account(getContract("TokenWallet"), {
            signer: keys ? signerKeys(keys) : signerNone(),
            address,
            client
        });
    }

    private messageHandler(data: {boc: string, id: string, src: string}, callback: (data: ITokenRecievedNotification) => void){
        this.account.decodeMessage(data.boc).then(decoded => {
            console.log(decoded);
            if(decoded.name === "acceptTransfer"){
                callback({
                    message_id: data.id,
                    from: data.src,
                    amount: decoded.value.tokens / 100_000_000
                })
            }
        }).catch(error => {

        })
    }

    public async onTokenRecieved(callback: (data: ITokenRecievedNotification) => void){
        this.account.subscribeMessages("boc src id", data => this.messageHandler(data, callback));
    }

    public async getBalance(){
        return {
            tokens: (await this.account.runLocal("getBalance", {})).decoded.output.value0 / 100_000_000,
            evers: parseInt(await this.account.getBalance(), 16) / 1_000_000_000
        }
    }

    private async getCommentPayload(text: string){
        return (await this.account.client.abi.encode_message_body({
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

    /**
     * Совершает перевод с привязанного адреса на указанный.
     * @param to Адрес получателя
     * @param tokens Сумма в токенах
     * @param gas_limit Лимит газа в эверах на выполнение перевода
     * @param payload Дополнительное поле
     * @returns ID транзакции
     */
    public async transfer (to: string, tokens: number, payload?: string, gas_limit: number = 3){
        if(!this.keys) throw new Error("Keys not provided!");

        const {tokens: balance} = await this.getBalance();
        if(tokens > balance) throw new Error("Not enough balance!");

        const transfer = await this.account.run("transferWithNotify", {
            answer_addr: this.address,
            to,
            tokens: tokens * 100_000_000,
            evers: gas_limit * 1_000_000_000,
            return_ownership: 0,
            payload: payload ? await this.getCommentPayload(payload) : ""
        });

        return transfer.out_messages.length ? transfer.transaction.id : null
    }
}
