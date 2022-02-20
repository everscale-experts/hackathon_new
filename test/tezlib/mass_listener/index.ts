import { TonClient } from "@tonclient/core";
import { libNode } from "@tonclient/lib-node";

TonClient.useBinaryLibrary(libNode);

const client = new TonClient({ 
    network: { 
        endpoints: ['net.ton.dev']
    }
});

async function main() {
    
}

main().catch(e => {
    console.log(e);
});

/*
query{
  accounts(
    filter:{
      id: {
        in: [
          "0:3f39f84e534c0094366b7e4ea14639b072cb57ab73f9f54affc8375e8e8c86ca",
          "0:44562cc56ba462c9e7a37ede230c4e6b3fb36a3ef37a383519b14e4f46dfd54b"
          "0:e9ae1c9f8fb46181b537edb38e806198f22e7f41c8caa646f5db120115f30c31",
        ]
      }
    }
  ){
    balance
  }
}
*/