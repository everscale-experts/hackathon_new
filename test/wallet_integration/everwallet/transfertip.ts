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
  KeyPair,
} from "@tonclient/core"

TonClient.useBinaryLibrary(libNode);

const keyPair = JSON.parse(fs.readFileSync(path.join(__dirname, "keys.json"), "utf8"));
const recipient = "0:2bb4a0e8391e7ea8877f4825064924bd41ce110fce97e939d3323999e1efbb13";
const address = fs.readFileSync(path.join(__dirname, "address.txt"), "utf8");


async function main() {
  const client = new TonClient({
    network: {
      endpoints: ['net.ton.dev'],
    }
  });

  const TokenFactory = {
    abi: JSON.parse(fs.readFileSync(path.resolve(__dirname, "ton-eth-bridge-token-contracts/build/TokenFactory.abi.json")).toString()),
    tvc: fs.readFileSync(path.resolve(__dirname, "ton-eth-bridge-token-contracts/build/TokenFactory.tvc")).toString("base64")
  }



}

main();
