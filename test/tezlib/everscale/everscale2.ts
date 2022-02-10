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

const keyPairFile = path.join(__dirname, "keys.json");
const keyPair = JSON.parse(fs.readFileSync(keyPairFile, "utf8"));
const recipient = "0:2bb4a0e8391e7ea8877f4825064924bd41ce110fce97e939d3323999e1efbb13";
const addressFile = path.join(__dirname, "address.txt");
const address = fs.readFileSync(addressFile, "utf8");

const transferAbi = JSON.parse(fs.readFileSync(path.resolve(__dirname, "transfer.abi.json")).toString());

const multisigContractPackage = {
    abi: JSON.parse(fs.readFileSync(path.resolve(__dirname, "HelloEvents.abi.json")).toString()),
    tvc: fs.readFileSync(path.resolve(__dirname, "HelloEvents.tvc")).toString("base64")
};

function decodeText(hex) {
    return Buffer.from(hex, "hex").toString();
}
const MyAccount = {
    abi: JSON.parse(fs.readFileSync(path.resolve(__dirname, "ton-labs-contracts/solidity/safemultisig/SafeMultisigWallet.abi.json")).toString()),
    tvc: fs.readFileSync(path.resolve(__dirname, "ton-labs-contracts/solidity/safemultisig/SafeMultisigWallet.tvc")).toString("base64")
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
            endpoints: ['net.ton.dev'],
            message_retries_count: 3,
        }
    });

    /*const keys = await TonClient.default.crypto.generate_random_sign_keys();
    console.log(keys)*/
    const acc = new Account(
        MyAccount,
        { address: "0:502156647bd022bd41c0ccbd9dd4cf643502099f2c79eca49429cb6c83c4bbb4", client}
    );
    console.log(acc);

    console.log("balance:");
    const balance = await acc.getBalance().catch(e => console.log("ERROR:", e));
    console.log("Account balance now is", parseInt(balance || "undefined"));

    const body = (await client.abi.encode_message_body({
               abi: abiContract(transferAbi),
               call_set: {
                   function_name: "transfer",
                   input: {
                       comment: Buffer.from("My comment").toString("hex"),
                   },
               },
               is_internal: true,
               signer: signerNone(),
           })).body;

    console.log("Call `submitTransaction` function");


    const multisig = new Account(MyAccount, {
         signer: signerKeys(keyPair),
         client,
      });

    console.log(multisig)

    const transactionInfo = (await multisig.run("submitTransaction", {
      dest: recipient,
      value: 100_000_000,
      bounce: false,
      allBalance: false,
      payload: body,
    }));

    console.log(transactionInfo);
    console.log("Transaction info:");

    console.log("Id:");
    console.log(transactionInfo.transaction.id);
    console.log("messages:");
    console.log(transactionInfo.out_messages);
}

main();
