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

    const keyPair = JSON.parse(fs.readFileSync(path.join(__dirname, "work_acc.json"), "utf8"));

    /* Deploy TIP3 */

    const TokenWallet = {
        abi: JSON.parse(fs.readFileSync(path.resolve(__dirname, "ton-eth-bridge-token-contracts/build/TokenWallet.abi.json")).toString()),
        tvc: fs.readFileSync(path.resolve(__dirname, "ton-eth-bridge-token-contracts/build/TokenWallet.tvc")).toString("base64")
    }

    const tip3create = new Account(
        TokenWallet,
        {
            signer: signerKeys(keyPair),
            address: "0:b95d8f510a029401dda2b1d3b9ec1b656238fa19e96d0b4dbcc41ee82821b6ab",
            client
        }
    );
    //console.log(tip3create);

  const trasnfer = await(tip3create.run("transfer",{
    answer_addr:"0:fac2714d40492bf96ed0ff4231a41d274af3b2a36283debce112434a9ceb9647",
    to:"0:bdd066bacf2357ca05e3571422d38d12b7dffb584682d9fa6a33b0ea940375f1",
    tokens:2000000000,
    evers:500000000,
    return_ownership:0,
  }).catch(e => console.log("ERROR:", e)))



    console.log(transfer);
    client.close();

}

main();
