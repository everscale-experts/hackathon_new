

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


//способ первый

import { TezosToolkit } from '@taquito/taquito';

async function example() {
  const provider = 'https://rpc.hangzhounet.teztnets.xyz';
  const tezos = new TezosToolkit(provider)
  
  try {

    // const bakerEndorsementFilter = {
    //   and: [{ source: 'tz1VcUcuUEcUGSZRcxNcj8JCrCG1xhZVRYt6' }, { kind: 'endorsement' }]
    // }

    const bakerDelegation = {
      and: [{ destination: 'KT1N3zKv9JkGDseaNX3he6pQivWrwDVthhRW' }]
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


//способ второй

// import { TezosToolkit } from '@taquito/taquito';
// import { delay, retryWhen, tap, scan } from 'rxjs/operators';

// async function example() {
//     // This example will intentionally fail after two attempts as the RPC URL is invalid. 
//     const provider = 'https://rpc.hangzhounet.teztnets.xyz';
//     const tezos = new TezosToolkit(provider)
//     tezos.setProvider({
//         rpc: provider, config: {
//             shouldObservableSubscriptionRetry: true, observableSubscriptionRetryFunction:
//                 retryWhen(error =>
//                     error.pipe(
//                         scan((acc, error) => {
//                             if (acc > 2) throw error;
//                             console.log("attempt " + acc);
//                             return acc + 1;
//                         }, 1),
//                         delay(3),
//                         tap(() => console.log("Retrying ..."))
//                     )
//                 )
//         }
//     });

   
//     const bakerDelegation = {
//         and: [{ destination: 'tz1VcUcuUEcUGSZRcxNcj8JCrCG1xhZVRYt6' }]
//     }

//     tezos.stream.subscribeOperation({
//         or: [bakerDelegation]
//     })
//     console.log("Запуск")
// }

// example();

