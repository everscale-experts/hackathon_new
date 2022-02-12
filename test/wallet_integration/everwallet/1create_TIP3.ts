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
const keys = await client.crypto.generate_random_sign_keys();
console.log(keys);

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
    name:"ERT34",
    symbol:"ERT34",
    decimals:3,
    root_pubkey:"0x"+keys.public,
    //root_owner:"0",
    total_supply:500000000000,
    },
    useGiver:true
  }).catch(e => console.log("ERROR:", e)));

console.log(deploytip3)

}

main();
