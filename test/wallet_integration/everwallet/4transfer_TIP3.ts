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
  console.log("-----------------------")
  console.log("Address of Sender Wallet:")
  console.log(tip3create.getAddress())
  console.log("Keys of Sender Wallet:")
  console.log("-----------------------")
  console.log(tip3create.signer["keys"])
  console.log("-----------------------")
  console.log("-----------------------")
  console.log("Address of Receiver Wallet:")
  console.log(tip3create2nd.getAddress())
  console.log("Keys of Receiver Wallet:")
  console.log("-----------------------")
  console.log(tip3create2nd.signer["keys"])

  const balancedo1 = await(tip3create.runLocal("getBalance",{}).catch(e => console.log("ERROR:", e)))
  const balancedo2 = await(tip3create2nd.runLocal("getBalance",{}).catch(e => console.log("ERROR:", e)))
  console.log("-----------------------")
  console.log("Balance before transfer")
  console.log("-----------------------")
  console.log("Balance of sender wallet: "+(balancedo1["decoded"]["output"]["value0"]))
  console.log("Balance of receiver wallet: "+(balancedo2["decoded"]["output"]["value0"]))
  console.log("-----------------------")


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
  console.log("-----------------------")
  console.log("Balance after transfer")
  console.log("-----------------------")
  console.log("Balance of sender wallet: "+(balance1["decoded"]["output"]["value0"]))
  console.log("Balance of receiver wallet: "+(balance2["decoded"]["output"]["value0"]))
  console.log("-----------------------")
  client.close();

}

main();
