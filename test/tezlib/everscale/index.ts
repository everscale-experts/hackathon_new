import { Account, AccountOptions } from "@tonclient/appkit"
import fs from "fs";
import path from "path";
import { libNode } from "@tonclient/lib-node";
import {
    signerKeys,
    TonClient,
    abiContract,
    signerNone,
    KeyPair
} from "@tonclient/core"

const tokenAdminKeys = require("./accounts/account1.json")


TonClient.useBinaryLibrary(libNode);

const client = new TonClient({ 
    network: { 
        endpoints: ['net.ton.dev']
    }
});

export function read(name: string, encoding?: BufferEncoding){
    return fs.readFileSync(path.resolve(__dirname, "contracts", name)).toString(encoding)
}

export function getContract(name: string){
    return {
        abi: JSON.parse(read(`${name}.abi.json`)),
        tvc: read(`${name}.tvc`, "base64")
    }
}

interface ITokenParams {
    name: string
    symbol: string
    decimals: number
    total_supply: number
}

class Token extends Account {
    constructor(client: TonClient, keys: KeyPair | null, address?: string){
        super(getContract("TokenRoot"), {
            signer: keys ? signerKeys(keys) : signerNone(),
            address: address,
            client
        });
    }

    static async init (client: TonClient, keys: KeyPair, params: ITokenParams) {
        const token = new Token(client, keys);
        const {acc_type} = await token.getAccount();

        if (acc_type === 3) await token.deploy({
            initInput: {
                root_pubkey: `0x${keys.public}`,
                root_owner: await token.getAddress(),
                ...params
            },
            useGiver: true
        })
        return token;
    }

    public async getName(){
        return (await this.runLocal("getName", {})).decoded.output.value0;
    }

    public async getRootKey(){
        return (await this.runLocal("getRootKey", {})).decoded.output.value0;
    }

    public async setWalletCode(code: any){
        return await this.run("setWalletCode", {
            _answer_id: 0,
            wallet_code: code
        })
    }
}


async function main(){
    const keys = {
        public: '387c23a1003050ec8b1b7c234496849710c33e30388b9e82955f050a96bcdadf',
        secret: '503fda9bb49cb5481f3f0a465295ceeefbfefc93f433fd2da19e87346c51aa40'
    }

    // const token = new Token(client, null, "0:30545f0213e9b868e1ab5b42a35fe0a4efee8eadb270278cfe9ab85345887598");

    const token = new Token(client, keys);


    console.log(await token.setWalletCode(getContract("TokenWallet").tvc));
    
}

main().catch(e => {
    console.log(e)
})