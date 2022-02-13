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

  const keyPair = JSON.parse(fs.readFileSync(path.join(__dirname, "keys_main.json"), "utf8"));

  /* Deploy TIP3 */

  const TokenWallet = {
    abi: JSON.parse(fs.readFileSync(path.resolve(__dirname, "flex/tokens-fungible/TONTokenWallet.abi")).toString()),
    tvc: fs.readFileSync(path.resolve(__dirname, "flex/tokens-fungible/TONTokenWallet.tvc")).toString("base64")
  }

  const tip3create = new Account(
    TokenWallet,
    { signer: signerKeys(keyPair),
      address:"0:bdd066bacf2357ca05e3571422d38d12b7dffb584682d9fa6a33b0ea940375f1",
      client}
    );
  console.log(tip3create);

  const trasnfer = await(tip3create.run("transfer",{
    answer_addr:"0:bdd066bacf2357ca05e3571422d38d12b7dffb584682d9fa6a33b0ea940375f1",
    to:"0:bdd066bacf2357ca05e3571422d38d12b7dffb584682d9fa6a33b0ea940375f1",
    tokens:1000000000,
    evers:0,
    return_ownership:0,
  }).catch(e => console.log("ERROR:", e)))

  console.log(trasnfer)

  }

  main();
