import { Account } from "@tonclient/appkit"
import { libNode } from "@tonclient/lib-node";
import account1 from "./keys.json"

import fs from "fs";
import path from "path";
import {
  signerKeys,
  TonClient,
  MessageBodyType,
  signerNone,
  abiContract,
  KeyPair
} from "@tonclient/core"

const keyPairFile = path.join(__dirname, "keys.json");
const keyPair = JSON.parse(fs.readFileSync(keyPairFile, "utf8"));
const addressFile = path.join(__dirname, "address.txt");
//const address = fs.readFileSync(addressFile, "utf8")
const transferAbi = JSON.parse(fs.readFileSync(path.resolve(__dirname, "transfer.abi.json")).toString());


TonClient.useBinaryLibrary(libNode);

const TokenFactory = {
  abi: JSON.parse(fs.readFileSync(path.resolve(__dirname, "ton-eth-bridge-token-contracts/build/TokenFactory.abi.json")).toString()),
  tvc: fs.readFileSync(path.resolve(__dirname, "ton-eth-bridge-token-contracts/build/TokenFactory.tvc")).toString("base64")
}

const TokenWallet = {
  abi: JSON.parse(fs.readFileSync(path.resolve(__dirname, "ton-eth-bridge-token-contracts/build/TokenWallet.abi.json")).toString()),
  tvc: fs.readFileSync(path.resolve(__dirname, "ton-eth-bridge-token-contracts/build/TokenWallet.tvc")).toString("base64")
}


const SafeMultisig = {
  abi: JSON.parse(fs.readFileSync(path.resolve(__dirname, "ton-labs-contracts/solidity/safemultisig/SafeMultisigWallet.abi.json")).toString()),
  tvc: fs.readFileSync(path.resolve(__dirname, "ton-labs-contracts/solidity/safemultisig/SafeMultisigWallet.tvc")).toString("base64")
}
const TokenRoot = {
  /*abi: JSON.parse(fs.readFileSync(path.resolve(__dirname, "ton-labs-contracts/cpp/tokens-fungible/RootTokenContract.abi")).toString()),
  tvc: fs.readFileSync(path.resolve(__dirname, "ton-labs-contracts/cpp/tokens-fungible//RootTokenContract.tvc")).toString("base64")*/
  abi: JSON.parse(fs.readFileSync(path.resolve(__dirname, "ton-eth-bridge-token-contracts/build/TokenRoot.abi.json")).toString()),
  tvc: fs.readFileSync(path.resolve(__dirname, "ton-eth-bridge-token-contracts/build/TokenRoot.tvc")).toString("base64")
}
const TokenRootLabs = {
  abi: JSON.parse(fs.readFileSync(path.resolve(__dirname, "flex/tokens-fungible/RootTokenContract.abi")).toString()),
  tvc: fs.readFileSync(path.resolve(__dirname, "flex/tokens-fungible//RootTokenContract.tvc")).toString("base64")
}

async function main() {
  const client = new TonClient({
    network: {
      endpoints: ['net.ton.dev'],
    }
  });
  const keyPair = JSON.parse(fs.readFileSync(keyPairFile, "utf8"));


  /* BROXUS TIP3 */

 const acc = new Account(
    TokenRoot,
    { signer: signerKeys(account1),
      //address:"0:502156647bd022bd41c0ccbd9dd4cf643502099f2c79eca49429cb6c83c4bbb4",
      client}
    );
    const deploy = await(acc.deploy({
      initInput: {
        initialSupplyTo: "0:502156647bd022bd41c0ccbd9dd4cf643502099f2c79eca49429cb6c83c4bbb4",
        initialSupply: 500*100000000,
        deployWalletValue: 100000000,
        mintDisabled:false,
        burnByRootDisabled:false,
        burnPaused:true,
        remainingGasTo:"0:502156647bd022bd41c0ccbd9dd4cf643502099f2c79eca49429cb6c83c4bbb4",
      },useGiver:true,}).catch(e => console.log("ERROR:", e)));

      console.log(deploy)

    const name = await(acc.run("totalSupply",{answerId:0}).catch(e => console.log("ERROR:", e)));
    console.log(name)


    const acctrasnf = new Account(
       TokenWallet,
       { signer: signerKeys(account1),
         //address:"0:502156647bd022bd41c0ccbd9dd4cf643502099f2c79eca49429cb6c83c4bbb4",
         client}
       );

       const deploytrans = await(acctrasnf.deploy({
         initInput: {

           },useGiver:true,}).catch(e => console.log("ERROR:", e)));
    console.log(deploytrans)


    const body = (await client.abi.encode_message_body({
                 abi: abiContract(transferAbi),
                 call_set: {
                     function_name: "transfer",
                     input: {
                         //comment: Buffer.from("My comment").toString("hex"),
                     },
                 },
                 is_internal: true,
                 signer: signerNone(),
             })).body;


      const transfer = await(acctrasnf.run("transfer",{
        amont:1000000,
        recipient:"0:502156647bd022bd41c0ccbd9dd4cf643502099f2c79eca49429cb6c83c4bbb4",
        remainingGasTo:"0:502156647bd022bd41c0ccbd9dd4cf643502099f2c79eca49429cb6c83c4bbb4",
        notify:true,
        payload:body,
      }).catch(e => console.log("ERROR:", e)))


      console.log(transfer)

    /*  const symbol = await(acc.run("symbol",{answerId:0}));
      const walletcode = await(acc.run("walletCode",{answerId:0}));
      const rootkey = await(acc.run("rootOwner",{answerId:0}));

      console.log(name);
      console.log(symbol);
      console.log(walletcode);
      console.log(rootkey);
      //console.log(deploy);*/

      /* TONLabs TIP3 */
/*     const acc = new Account(
        TokenRootLabs,
        { signer: signerKeys(account1),
          //address:"0:502156647bd022bd41c0ccbd9dd4cf643502099f2c79eca49429cb6c83c4bbb4",
          client}
        );
        const deploy = await(acc.deploy({
          initInput: {
            name: "54657374",
            symbol: "54657374",
            decimals: 9,
            root_owner:"0",
            root_public_key:"0x54d10fa26988490ea4c2065a495256b1ca314fd735a12756cf9bdc5102daeb1a",
            total_supply:5000000000,
          },useGiver:true,}).catch(e => console.log("ERROR:", e)));


        console.log(deploy);
          //const address = await deploy.getAddress();
        /*  const name = await(acc.run("getName",{}));
          const symbol = await(acc.run("getSymbol",{}));
          const walletcode = await(acc.run("getWalletCode",{}));
          const rootkey = await(acc.run("getRootKey",{}));
          console.log(name);
          console.log(symbol);
          console.log(walletcode);
          console.log(rootkey);
          console.log(deploy);*/





          //console.log(acc);
          //console.log(address);
          //const command
          /*  const deployRoot = await(acc.run("deployRoot", {
          answerId:0,
          name: 'EVRT',
          symbol: 'EVRT',
          decimals: 9,
          owner: "0:502156647bd022bd41c0ccbd9dd4cf643502099f2c79eca49429cb6c83c4bbb4",
          initialSupplyTo: "0:502156647bd022bd41c0ccbd9dd4cf643502099f2c79eca49429cb6c83c4bbb4",
          initialSupply: 500*100000000,
          deployWalletValue: 100000000,
          mintDisabled:false,
          burnByRootDisabled:false,
          burnPaused:true,
          remainingGasTo:"0:502156647bd022bd41c0ccbd9dd4cf643502099f2c79eca49429cb6c83c4bbb4",
        }).catch(e => console.log("ERROR:", e)));

        console.log(deployRoot)*/



      }


      main();
