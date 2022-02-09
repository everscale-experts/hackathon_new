import { Account } from "@tonclient/appkit"
import fs from "fs";
import path from "path";
import {
    signerKeys,
    TonClient,
    MessageBodyType,
} from "@tonclient/core"

import { libNode } from "@tonclient/lib-node";

TonClient.useBinaryLibrary(libNode);

const HelloEventsContract = {
    abi: JSON.parse(fs.readFileSync(path.resolve(__dirname, "HelloEvents.abi.json")).toString()),
    tvc: fs.readFileSync(path.resolve(__dirname, "HelloEvents.tvc")).toString("base64")
}

function decodeText(hex) {
    return Buffer.from(hex, "hex").toString();
}


function encodeText(text) {
    return Buffer.from(text).toString("hex");
}

function delay(ms: number){
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    })
}

class HelloEvents extends Account {
    constructor(options) {
        super(HelloEventsContract, options);
    }

    /**
     * @param client {TonClient}
     * @param text {string}
     * @returns {Promise<HelloEvents>}
     */
    static async deployNew(client, text) {
        const keys = await client.crypto.generate_random_sign_keys();
        const account = new HelloEvents({ signer: signerKeys(keys), client });
        await account.deploy({
            initInput: {
                text: encodeText(text),
            },
            useGiver: true,
        });
        return account;
    }

    /**
     *
     * @param text {string}
     * @returns {Promise<void>}
     */
    async setHelloText(text) {
        await this.run("setHelloText", {
            text: encodeText(text),
        });
    }

    /**
     *
     * @returns {Promise<string>}
     */
    async getHelloText() {
        const { decoded } = await this.runLocal("getHelloText", {});
        return decodeText(decoded.output.text);
    }
}

async function main() {
    const client = new TonClient({ 
        network: { 
            endpoints: ['net.ton.dev'] 
        }
    });

    const hello = await HelloEvents.deployNew(client, "Hello World!");

    console.log(`Initial hello text is "${await hello.getHelloText()}"`);

    await hello.subscribeAccount("balance", (acc) => {
        console.log("Account has updated. Current balance is ", parseInt(acc.balance));
    });

    await hello.subscribeMessages("boc", async (msg) => {
        try {
            const decoded = await hello.decodeMessage(msg.boc);
            switch (decoded.body_type) {
                // Message that triggered an on-chain contract call
            case MessageBodyType.Input:
                if (decoded.name === "setHelloText") {
                    decoded.value.text = decodeText(decoded.value.text);
                }
                console.log(`External inbound message, function "${decoded.name}", parameters: `, JSON.stringify(decoded.value));
                break;
                // External outbound message generated by a function's `return`
            case MessageBodyType.Output:
                if (decoded.name === "setHelloText") {
                    decoded.value.oldText = decodeText(decoded.value.text);
                }
                console.log(`External outbound message, function "${decoded.name}", result`, JSON.stringify(decoded.value));
                break;
                // Event generated by the contract
            case MessageBodyType.Event:
                if (decoded.name === "TextUpdated") {
                    decoded.value.text = decodeText(decoded.value.text);
                }
                console.log(`External outbound message, event "${decoded.name}", parameters`, JSON.stringify(decoded.value));
                break;
            }
        } catch (err) {
        }
    });

    await hello.setHelloText("Hello there!");
    console.log(`Updated hello text is ${await hello.getHelloText()}`);

    await delay(5000)

    await hello.setHelloText("Hi bro");
    console.log(`Updated hello text is ${await hello.getHelloText()}`);
}

main()