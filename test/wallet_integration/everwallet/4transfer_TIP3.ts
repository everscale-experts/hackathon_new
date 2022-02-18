import {Account} from "@tonclient/appkit"
import {libNode} from "@tonclient/lib-node";
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

  const keyPair = JSON.parse(fs.readFileSync(path.join(__dirname, "2ndaccount.keys.json"), "utf8"));
  const keyPair2nd = JSON.parse(fs.readFileSync(path.join(__dirname, "keys_main.json"), "utf8"));

  /* Deploy TIP3 */

  const TokenWallet = {
    abi: JSON.parse(fs.readFileSync(path.resolve(__dirname, "flex/tokens-fungible/TONTokenWallet.abi")).toString()),
    tvc: fs.readFileSync(path.resolve(__dirname, "flex/tokens-fungible/TONTokenWallet.tvc")).toString("base64")
  }

  const tip3create = new Account(
    TokenWallet,
    {
      signer: signerKeys(keyPair),
      address: "0:fac2714d40492bf96ed0ff4231a41d274af3b2a36283debce112434a9ceb9647",
      client
    }
  );
  const tip3create2nd = new Account(
    TokenWallet,
    {
      signer: signerKeys(keyPair2nd),
      address: "0:bdd066bacf2357ca05e3571422d38d12b7dffb584682d9fa6a33b0ea940375f1",
      client
    }
  );
  //console.log(tip3create);
  const balancedo1 = await(tip3create.runLocal("getBalance",{}).catch(e => console.log("ERROR:", e)))
  const balancedo2 = await(tip3create2nd.runLocal("getBalance",{}).catch(e => console.log("ERROR:", e)))
  console.log("Balance before transfer")
  console.log("Balance of sender wallet")
  console.log(balancedo1["decoded"]["output"])
  console.log("Balance of receiver wallet")
  console.log(balancedo2["decoded"]["output"])

  const transfer = await(tip3create.run("transfer",{
    answer_addr:"0:fac2714d40492bf96ed0ff4231a41d274af3b2a36283debce112434a9ceb9647",
    to:"0:bdd066bacf2357ca05e3571422d38d12b7dffb584682d9fa6a33b0ea940375f1",
    tokens:100000000,
    evers:500000000,
    return_ownership:0,
  }).catch(e => console.log("ERROR:", e)))

  //console.log(transfer);
  const balance1 = await(tip3create.runLocal("getBalance",{}).catch(e => console.log("ERROR:", e)))
  const balance2 = await(tip3create2nd.runLocal("getBalance",{}).catch(e => console.log("ERROR:", e)))
  console.log("Balance after transfer")
  console.log("Balance of sender wallet")
  console.log(balance1["decoded"]["output"])
  console.log("Balance of receiver wallet")
  console.log(balance2["decoded"]["output"])
  client.close();

}

main();
