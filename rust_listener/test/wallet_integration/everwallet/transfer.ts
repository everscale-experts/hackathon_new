import { Account } from "@tonclient/appkit"
import { libNode } from "@tonclient/lib-node";
import fs from "fs";
import path from "path";
import {
    signerKeys,
    TonClient,
    MessageBodyType,
    signerNone,
    abiContract,
} from "@tonclient/core"

TonClient.useBinaryLibrary(libNode);

function decodeText(hex) {
    return Buffer.from(hex, "hex").toString();
}
const MyAccount = {
    abi: JSON.parse(fs.readFileSync(path.resolve(__dirname, "HelloEvents.abi.json")).toString()),
    tvc: fs.readFileSync(path.resolve(__dirname, "HelloEvents.tvc")).toString("base64")
}

function encodeText(text) {
    return Buffer.from(text).toString("hex");
}

function delay(ms: number){
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    })
}

async function main() {
    const client = new TonClient({
        network: {
            endpoints: ['net.ton.dev']
        }
    });

    //const keys = await TonClient.default.crypto.generate_random_sign_keys();
    //console.log(keys)
    const acc = new Account(
        MyAccount,
        { address: "0:502156647bd022bd41c0ccbd9dd4cf643502099f2c79eca49429cb6c83c4bbb4", client}
    );
    console.log(acc);

    console.log("balance:");
    const balance = await acc.getBalance().catch(e => console.log("ERROR:", e));
    console.log("Account balance now is", parseInt(balance || "undefined"));

}

main();
