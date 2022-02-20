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

async function main() {
    const client = new TonClient({
        network: {
            endpoints: ['net.ton.dev']
        }
    });
/* Create TIP3 */

/*const keys = await client.crypto.generate_random_sign_keys();
console.log(keys);*/
const SEED_PHRASE_WORD_COUNT = 12;
const SEED_PHRASE_DICTIONARY_ENGLISH = 1;
const HD_PATH = "m/44'/396'/0'/0/0";
const seedPhrase = "meat alcohol target lyrics aware impose timber trial cash foot improve notable";

const keysgen = (await client.crypto.mnemonic_derive_sign_keys({
                dictionary: SEED_PHRASE_DICTIONARY_ENGLISH,
                word_count: SEED_PHRASE_WORD_COUNT,
                phrase: seedPhrase,
                path: HD_PATH,
            }).catch(e => console.log("ERROR:", e)));

console.log(keysgen)
/*
const TokenRootLabs = {
  abi: JSON.parse(fs.readFileSync(path.resolve(__dirname, "flex/tokens-fungible/RootTokenContract.abi")).toString()),
  tvc: fs.readFileSync(path.resolve(__dirname, "flex/tokens-fungible/RootTokenContract.tvc")).toString("base64")
}

const tip3create = new Account(
   TokenRootLabs,
   { signer: signerKeys(keys),
     client}
   );

const deploytip3 =  await(tip3create.deploy({
  initInput: {
    name:"ERTEZ21",
    symbol:"ERTEZ21",
    decimals:3,
    root_pubkey:"0x"+keys.public,
    root_owner:"0:44a4b9b63c47c2a13c29948833315bb1a8f0d741255055c9cb0915e192ec291a",
    total_supply:500000000000,
    },
    useGiver:true
  }).catch(e => console.log("ERROR:", e)));

console.log(deploytip3)*/

}

main();
