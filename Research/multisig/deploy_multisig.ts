// для того чтобы пользоватся кодом пишем в командной строке
//1) npm install -g yarn
//2) yarn
//3) npx ts-node deploy_multisig.ts


import { TezosToolkit,MichelsonMap } from '@taquito/taquito'
import { importKey } from '@taquito/signer'
import { TokenMultisig } from './TokenMultisig';
import {genericMultisig} from '././multisig_example_in_taquito/multisig'
import{msig_tokens2} from './Schema_multisik_tokens2'
import {char2Bytes} from '@taquito/utils';

const provider = 'https://hangzhounet.smartpy.io'

async function deploy() {
  const tezos = new TezosToolkit(provider)
  await importKey(
    tezos,
    'edskRrZRXU2vgyFgMt94BKY2Fv1bQCFLrgwo2DwseLoYDvpjZeNohKC1afZtRT55NhhLfAj46PGVL1jAy8WEJZ1m4n3F2Kkc7i'
  )
  // деплой msig TokenMultisig
  // try {
  //   const op = await tezos.contract.originate({
  //     //код смарт-контракта
  //     code: TokenMultisig,
  //     //значение хранилища
  //     storage: {
  //             counter: 1,  // начальное значение счётчика
  //             threshold: 0, // количество полписей для подтвержения транзакции
  //             keys: ['edpkuS2PP7wumxVKTv9HfyH9L5CWUqJ8EgezaVDgyEDpJMAMmwUb1C'], // публичные ключи владельцев multisig
  //           },
  //   })
    try {
      const metadata = new MichelsonMap();
      metadata.set('',char2Bytes('Everangers_team') ) // можно записать любую строку

      // создаем поле для записи proposals
      const proposals = new MichelsonMap(); 

      // создаем поле для записи votes
      const votes= new MichelsonMap();
 
      const op = await tezos.contract.originate({
        //код смарт-контракта
        code: msig_tokens2,
        //значение хранилища
        storage: {
                counter: 1,  // начальное значение счётчика
                expiration_time:2, // время в течении которго должна быть подписана транзакция в днях
                metadata,
                // минимальной количество подписей 
                minimum_votes:2,
                proposals,
                // владельцы кошелька
                users:['tz1LiBrF9gibgH5Lf6a7gDjoUfSEg6nxPKsz','tz1Qw2LiqMNwJXKKzimAVMWj5W467Hrd6dP7'],
                votes,
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
