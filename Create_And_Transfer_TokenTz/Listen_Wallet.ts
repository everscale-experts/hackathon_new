

// import { TezosToolkit } from '@taquito/taquito'
// import { InMemorySigner } from '@taquito/signer'
// const { Tezos } = require('@taquito/taquito')

// const RPC = "https://rpc.hangzhounet.teztnets.xyz";

// const Tezostoolkit = new TezosToolkit(RPC);
// const contract = Tezos.wallet.at("tz1Nt3vKhbZpVdCrqgxR9sZDFqUty2h7SMRM");
// const op = contract.methods.entrypoint().send();



// const entries = new Promise((resolve, reject) => {
//     const evts: {level: number, currentConfirmation: number}[] = [];
    
//     op.confirmationObservable(3).subscribe(
//       event => {
//         const entry = {
//           level: event.block.header.level,
//           currentConfirmation: event.currentConfirmation
//         };
//         evts.push(entry);
//       },
//       () => reject(null),
//       () => resolve(evts)
//     );
//   });

import { TezosToolkit } from '@taquito/taquito';

async function example() {
  const provider = 'https://rpc.hangzhounet.teztnets.xyz';
  const tezos = new TezosToolkit(provider)
  
  try {

    // const bakerEndorsementFilter = {
    //   and: [{ source: 'tz1VcUcuUEcUGSZRcxNcj8JCrCG1xhZVRYt6' }, { kind: 'endorsement' }]
    // }

    const bakerDelegation = {
      and: [{ destination: 'tz1VcUcuUEcUGSZRcxNcj8JCrCG1xhZVRYt6' }]
    }
    // const bakerDelegatio = {
    //     and: [{ destination: 'tz1VcUcuUEcUGSZRcxNcj8JCrCG1xhZVRYt6' }, { kind: 'transaction' }]
    //   }

    const sub = tezos.stream.subscribeOperation({
      or: [bakerDelegation]
    })

    sub.on('data', console.log)
    console.log("Слушание запущено =)")
  }
  catch (ex) {
    console.error(ex)
  }
}

example();




// import { Tezos } from "./tezos"

// const TezosRPC = "https://rpc.hangzhounet.teztnets.xyz";
// const account1= require("/account1.json")

// const wallet = new Tezos(TezosRPC, account1)

// wallet.subscribe(async (data) => {
//     console.log("GHbikj")
// })


