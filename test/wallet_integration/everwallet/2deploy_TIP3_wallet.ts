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

  const keyPair = JSON.parse(fs.readFileSync(path.join(__dirname, "keys.json"), "utf8"));
  const keyPairWallet = JSON.parse(fs.readFileSync(path.join(__dirname, "keys_main.json"), "utf8"));
  const keys = await client.crypto.generate_random_sign_keys();

  //console.log(keys);
  /* Deploy TIP3 */

  const TokenRootLabs = {
    abi: JSON.parse(fs.readFileSync(path.resolve(__dirname, "flex/tokens-fungible/RootTokenContract.abi")).toString()),
    tvc: fs.readFileSync(path.resolve(__dirname, "flex/tokens-fungible/RootTokenContract.tvc")).toString("base64")
  }

  const tip3create = new Account(
    TokenRootLabs,
    { signer: signerKeys(keyPair),
      client}
    );

  const name = await(tip3create.runLocal("getName",{}).catch(e => console.log("ERROR:", e)))
  const symbol = await(tip3create.runLocal("getSymbol",{}).catch(e => console.log("ERROR:", e)))
  //console.log(name)
  //console.log(symbol)
  //console.log(keyPairWallet.public)

 const futureWallet =  await(tip3create.run("getWalletAddress",{
    pubkey:"0x"+keyPairWallet.public,
    //owner:"0:502156647bd022bd41c0ccbd9dd4cf643502099f2c79eca49429cb6c83c4bbb4"
  }).catch(e => console.log("ERROR:", e)))

  console.log(futureWallet);

  /*const deployWallet = await(tip3create.run("deployWallet",{
    _answer_id:0,
    pubkey:"0xb66483a3491b26026520f35f7dad6b0c0185fcf5f857f756fad50a755cc6d270",
    tokens:50000000000,
    evers:1000000000,
  }).catch(e => console.log("ERROR:", e)))

  console.log(deployWallet)
*/
  }

  main();
