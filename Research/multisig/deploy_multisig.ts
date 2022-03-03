import { Schema } from '@taquito/michelson-encoder/dist/types/schema/storage';
import { TezosToolkit } from '@taquito/taquito';
const Tezos = new TezosToolkit('https://hangzhounet.api.tez.ie');



const genericMultisigJSONfile = require('./multisig.json')
// generic.json is referring to Michelson source code in JSON representation

Tezos.contract
  .originate({
    code: genericMultisigJSONfile,
    storage: {
      counter: 0,
      threshold: 1,
      keys: ['edpkuLxx9PQD8fZ45eUzrK3BhfDZJHhBuK4Zi49DcEGANwd2rpX82t'],
    },
  })
  .then((originationOp) => {
    console.log(`Waiting for confirmation of origination for ${originationOp.contractAddress}...`);
    return originationOp.contract();
  })
  .then((contract) => {
    console.log(`Origination completed.`);
  })
  .catch((error) => console.log(`Error: ${JSON.stringify(error, null, 2)}`));


