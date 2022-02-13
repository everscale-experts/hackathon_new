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

  /* Deploy TIP3 */

  const TokenRootLabs = {
    abi: JSON.parse(fs.readFileSync(path.resolve(__dirname, "flex/tokens-fungible/RootTokenContract.abi")).toString()),
    tvc: fs.readFileSync(path.resolve(__dirname, "flex/tokens-fungible//RootTokenContract.tvc")).toString("base64")
  }

  const tip3create = new Account(
    TokenRootLabs,
    { signer: signerKeys(keyPair),
      client}
    );

  //console.log(tip3create)

  const name = await(tip3create.runLocal("getName",{}).catch(e => console.log("ERROR:", e)))
  const symbol = await(tip3create.runLocal("getSymbol",{}).catch(e => console.log("ERROR:", e)))
  console.log(name)
  console.log(symbol)

  const mint = await(tip3create.run("mint",{
    _answer_id:0,
    tokens:50000000000,
  }).catch(e => console.log("ERROR:", e)))

  console.log(mint)

  }

  main();
