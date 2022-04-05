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
    /*abi: JSON.parse(fs.readFileSync(path.resolve(__dirname, "ton-labs-contracts/cpp/tokens-fungible/RootTokenContract.abi")).toString()),
    tvc: fs.readFileSync(path.resolve(__dirname, "ton-labs-contracts/cpp/tokens-fungible//RootTokenContract.tvc")).toString("base64")*/
    abi: JSON.parse(fs.readFileSync(path.resolve(__dirname, "ton-eth-bridge-token-contracts/build/TokenRoot.abi.json")).toString()),
    tvc: fs.readFileSync(path.resolve(__dirname, "ton-eth-bridge-token-contracts/build/TokenRoot.tvc")).toString("base64")

}

const WalletBroxus = {
    abi: JSON.parse(fs.readFileSync(path.resolve(__dirname, "ton-eth-bridge-token-contracts/build/TokenWallet.abi.json")).toString()),
    tvc: fs.readFileSync(path.resolve(__dirname, "ton-eth-bridge-token-contracts/build/TokenWallet.tvc")).toString("base64")

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
            endpoints: ['main.ton.dev'],
          //  message_retries_count: 3,
        }
    });

    /*const keys = await TonClient.default.crypto.generate_random_sign_keys();
    console.log(keys)*/
    const acc = new Account(
        MyAccount,
        { address: "0:ed66bfa2891e8f66ad84fef305f9e591099e6a569a2f45f080cb5d445b662e30", client}
    );
    console.log(acc);

    console.log("Name:");

    const name = await acc.run('name',{}).catch(e => console.log("ERROR:", e));
    console.log("Name of token", name)
    //const balance = await acc.getBalance().catch(e => console.log("ERROR:", e));
    //console.log("Account balance now is", parseInt(balance || "undefined"));

  /*  const body = (await client.abi.encode_message_body({
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


    const multisig = new Account(multisigContractPackage, {
         signer: signerKeys(keyPair),
         client,
      });

    console.log(multisig)

    const transactionInfo = (await multisig.call("submitTransaction", {
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
    console.log(transactionInfo.out_messages);*/
}

main();
