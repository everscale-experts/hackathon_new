// первая попытка задеплоить мультисиг, возникала ошибка при деплое

// import { Schema } from '@taquito/michelson-encoder/dist/types/schema/storage';
// import { TezosToolkit } from '@taquito/taquito';
// const Tezos = new TezosToolkit('https://rpc.hangzhounet.teztnets.xyz');



// const genericMultisigJSONfile = require('./multisig.json')
// // generic.json is referring to Michelson source code in JSON representation

// Tezos.contract
//   .originate({
//     code: genericMultisigJSONfile,
//     storage: {
//       counter: 0,
//       threshold: 1,
//       keys: ['edpkuAPjD8jVpbDUEQBXUdp1v9eNhLLo3JxUBBMTwWdw7Fm9tnHZTL'],
//     },
//   })
//   .then((originationOp) => {
//     console.log(`Waiting for confirmation of origination for ${originationOp.contractAddress}...`);
//     return originationOp.contract();
//   })
//   .then((contract) => {
//     console.log(`Origination completed.`);
//   })
//   .catch((error) => console.log(`Error: ${JSON.stringify(error, null, 2)}`));



// второй способ развертывания смарт контракта, все работает

// для того чтобы пользоватся кодом пишем в командной строке
//1) npm install -g yarn
//2) yarn
//3) npx ts-node deploy_multisig.ts


import { TezosToolkit } from '@taquito/taquito'
import { importKey } from '@taquito/signer'
import { TokenMultisig } from './TokenMultisig';
import {genericMultisig} from '././multisig_example_in_taquito/multisig'

const provider = 'https://rpc.hangzhounet.teztnets.xyz'

async function deploy() {
  const tezos = new TezosToolkit(provider)
  await importKey(
    tezos,
    'edskRrZRXU2vgyFgMt94BKY2Fv1bQCFLrgwo2DwseLoYDvpjZeNohKC1afZtRT55NhhLfAj46PGVL1jAy8WEJZ1m4n3F2Kkc7i'
  )

  try {
    const op = await tezos.contract.originate({
      //код смарт-контракта
      code: TokenMultisig,
      //значение хранилища
      storage: {
              counter: 1,  // начальное значение счётчика
              threshold: 0, // количество полписей для подтвержения транзакции
              keys: ['edpkuS2PP7wumxVKTv9HfyH9L5CWUqJ8EgezaVDgyEDpJMAMmwUb1C'], // публичные ключи владельцев multisig
            },
    })

    //начало развертывания
    console.log('Awaiting confirmation...');
    const contract = await op.contract();
    //отчет о развертывании: количество использованного газа, значение хранилища
    console.log('Address contract', op.contractAddress);

    //хеш операции, по которому можно найти контракт в блокчейн-обозревателе
    console.log('Operation hash:', op.hash);
  } catch (ex) {
    console.error(ex)
  }
}

deploy();
