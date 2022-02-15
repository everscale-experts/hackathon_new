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
  const tvwcodewallet = fs.readFileSync(path.join(__dirname, "code.txt"), "utf8");
  //console.log(keys);
  /* Deploy TIP3 */

  const TokenRootLabs = {
    abi: JSON.parse(fs.readFileSync(path.resolve(__dirname, "flex/tokens-fungible/RootTokenContract.abi")).toString()),
    tvc: fs.readFileSync(path.resolve(__dirname, "flex/tokens-fungible/RootTokenContract.tvc")).toString("base64")
  }

  const tip3create = new Account(
    TokenRootLabs,
    { signer: signerKeys(keyPair),
      address:"0:fade704adec914043da1bed87e1084e0190cf31387c2a87020bc0c8dcdc6dce8",
      client}
    );

//  console.log(tip3create.getAddress());


  const name = await(tip3create.runLocal("getName",{}).catch(e => console.log("ERROR:", e)))
  const symbol = await(tip3create.runLocal("getSymbol",{}).catch(e => console.log("ERROR:", e)))
  const rootkey = await(tip3create.runLocal("getRootKey",{}).catch(e => console.log("ERROR:", e)))
  const walletcode = await(tip3create.run("setWalletCode",{_answer_id:0,wallet_code:tvwcodewallet}).catch(e => console.log("ERROR:", e)))

//  console.log(name)
  //console.log(symbol)
  //console.log(rootkey)
  console.log(walletcode)

/* const futureWallet = await(tip3create.runLocal("getWalletAddress",{
    pubkey:"0x"+keyPairWallet.public,
    //owner:"0:44a4b9b63c47c2a13c29948833315bb1a8f0d741255055c9cb0915e192ec291a",
  }).catch(e => console.log("ERROR:", e)))

  console.log(futureWallet);

/*  const deployWallet = await(tip3create.run("deployWallet",{
    _answer_id:0,
    pubkey:"0x"+ keyPairWallet.public,
    tokens:50000000000,
    evers:1000000000,
  }).catch(e => console.log("ERROR:", e)))

  console.log(deployWallet)*/
  }

  main();
