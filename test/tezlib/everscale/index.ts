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

export interface ITransactionNotification {
    id: string
    from: string
    to: string
    amount: number
    payload: string
}

export interface ITokenListenerTarget {
    symbol: string
    wallet: string
}

export interface INotification {
    amount: number
    from: string
    address: string
    payload: string
    isToken: boolean
    symbol: string | null
}

interface ICoinTransaction {
    id: string
    in_message: {
        src: string
        dst: string
    }
    in_msg: string
    balance_delta: string
}

type INotificationHandler = (notification: INotification) => void;

const PayloadAbi = JSON.parse(read("Payload.abi.json"));

export function read(name: string, encoding?: BufferEncoding){
    return fs.readFileSync(path.resolve(__dirname, "contracts", name)).toString(encoding)
}

export function getContract(name: string){
    return {
        abi: JSON.parse(read(`${name}.abi.json`)),
        tvc: read(`${name}.tvc`, "base64")
    }
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

    private async encodePayload(text: string){
        return (await this.client.abi.encode_message_body({
            abi: abiContract(PayloadAbi),
            call_set: {
                function_name: "attachPayload",
                input: {
                    payload: Buffer.from(text).toString("hex"),
                },
            },
            is_internal: true,
            signer: signerNone(),
        })).body;
    }

    private async decodePayload(payload: string){
        return await this.client.abi.decode_message({
            abi: abiContract(PayloadAbi),
            message: payload
        })
            .then(decoded => Buffer.from(decoded.value.payload, "hex").toString())
            .catch(err => null);
    }

    public async transfer(to: string, amount: number, payload?: string){
        const balance = parseInt(await this.getBalance(), 16);
        if(amount * 1_000_000_000 > balance) throw new Error("Not enough balance!");
        return this.run("submitTransaction", {
            dest: to,
            value: amount * 1_000_000_000,
            bounce: false,
            allBalance: false,
            payload: payload ? await this.encodePayload(payload) : ""
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

            callback({
                id: params.id,
                from: params.in_message.src,
                to: params.in_message.dst,
                amount: parseInt(params.balance_delta, 16) / 1_000_000_000,
                payload: await this.decodePayload(message.result[0].boc)
            })
        })
    }
}

interface ITokenReceivedNotification {
    message_id: string
    from: string
    amount: number
    payload: string
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

    private messageHandler(data: {boc: string, id: string, src: string}, callback: (data: ITokenReceivedNotification) => void){
        this.account.decodeMessage(data.boc).then(async decoded => {
            if(decoded.name === "internalTransfer"){
                callback({
                    message_id: data.id,
                    from: data.src,
                    amount: decoded.value.tokens / 100_000_000,
                    payload: await this.decodePayload(decoded.value.payload)
                })
            }
        }).catch(error => {

        })
    }

    public async onTokenReceived(callback: (data: ITokenReceivedNotification) => void){
        this.account.subscribeMessages("boc src id", data => this.messageHandler(data, callback));
    }

    public async getBalance(){
        return {
            tokens: (await this.account.runLocal("getBalance", {})).decoded.output.value0 / 100_000_000,
            evers: parseInt(await this.account.getBalance(), 16) / 1_000_000_000
        }
    }

    

    private async encodePayload(text: string){
        return (await this.account.client.abi.encode_message_body({
            abi: abiContract(PayloadAbi),
            call_set: {
                function_name: "attachPayload",
                input: {
                    payload: Buffer.from(text).toString("hex"),
                },
            },
            is_internal: true,
            signer: signerNone(),
        })).body;
    }

    private async decodePayload(payload: string){
        return await this.account.client.abi.decode_message_body({
            body: payload,
            abi: abiContract(PayloadAbi),
            is_internal: true,
        })
            .then(decoded => Buffer.from(decoded.value.payload, "hex").toString())
            .catch(err =>  null);
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
            _answer_id: 0,
            answer_addr: this.address,
            to,
            tokens: tokens * 100_000_000,
            evers: gas_limit * 1_000_000_000,
            return_ownership: 0,
            payload: payload ? await this.encodePayload(payload) : ""
        });
        
        return transfer.out_messages.length ? transfer.transaction.id : null
    }
}

interface ITokenMessage {
    boc: string
    src: string
    dst: string
    id: string
}

export class MassListener {
    private tokens: Map<string, string>
    constructor(
        private client: TonClient,
        private coin_targets: string[],
        token_targets: ITokenListenerTarget[]
    ){
        const parsed_tokens = token_targets.map(target => ([target.wallet, target.symbol] as [string, string]));
        this.tokens = new Map(parsed_tokens);
    }

    private async decodeBodyPayload(body: string){
        return this.client.abi.decode_message_body({
            body: body,
            abi: abiContract(PayloadAbi),
            is_internal: true,
        }).then(decoded => {
            return Buffer.from(decoded.value.payload, "hex").toString()
        }).catch(err =>  {
            return null;
        });
    }

    private async decodePayload(payload: string){
        return await this.client.abi.decode_message({
            abi: abiContract(PayloadAbi),
            message: payload
        }).then(decoded => {
            return Buffer.from(decoded.value.payload, "hex").toString()
        }).catch(err => {
            return null;
        });
    }

    public async getMessagePayload(message_id: string){
        const message = await this.client.net.query_collection({
            collection: "messages",
            filter: { id: { eq: message_id } },
            result: "boc"
        });
        if (!message.result.length) return null;
        return this.decodePayload(message.result[0].boc)
    }

    private async coinReceivedHandler(transaction: ICoinTransaction, callback: INotificationHandler){
        callback({
            amount: parseInt(transaction.balance_delta, 16) / 1_000_000_000,
            from: transaction.in_message.src,
            address: transaction.in_message.dst,
            isToken: false,
            symbol: null,
            payload: await this.getMessagePayload(transaction.in_msg)
        });
    }

    private onCoinReceived(callback: INotificationHandler){
        this.client.net.subscribe_collection({
            collection: "transactions",
            filter: { account_addr: { in: this.coin_targets } },
            result: "id in_message {src dst} in_msg balance_delta"
        }, ({result: tx}) => this.coinReceivedHandler(tx, callback));
    }

    private decodeMessage(boc: string){
        return this.client.abi.decode_message({
            abi: abiContract(JSON.parse(read("TokenWallet.abi.json"))),
            message: boc,
        }).then(message => {
            return message;
        }).catch(err => {
            console.log(err)
            return null;
        })
    }

    private async tokenReceivedHandler(message: ITokenMessage, callback: INotificationHandler){
        const decoded = await this.decodeMessage(message.boc);
        if(decoded.name === "internalTransfer"){
            callback({
                amount: decoded.value.tokens / 100_000_000,
                from: message.src,
                address: message.dst,
                isToken: true,
                symbol: this.tokens.get(message.dst),
                payload: await this.decodeBodyPayload(decoded.value.payload)
            })
        }
    }

    private onTokenReceived(callback: INotificationHandler){
        this.client.net.subscribe_collection({
            collection: "messages",
            filter: { dst: { in: [...this.tokens.keys()] } },
            result: "boc src dst id"
        }, ({result: msg}) => this.tokenReceivedHandler(msg, callback))
    }
    

    public onReceived(callback: INotificationHandler){
        this.onTokenReceived(callback);
        this.onCoinReceived(callback);
    }
}