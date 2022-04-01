// для того чтобы пользоватся кодом пишем в командной строке
//1) npm install -g yarn
//2) yarn
//3) npx ts-node deploy_multisig.ts


import { TezosToolkit,MichelsonMap } from '@taquito/taquito'
import { importKey } from '@taquito/signer'
import { htlc_contract } from './htlc_contract';


import {char2Bytes} from '@taquito/utils';

const provider = 'https://rpc.hangzhounet.teztnets.xyz'

async function deploy() {
  const tezos = new TezosToolkit(provider)
  await importKey(
    tezos,
    'edskRdkUMmmBorjeetbGiU4cjZ1pbewF6ZmBMj7jCEWxA6pmgTooYTCStHZFitsEgnut7V3YpKt8ptgT1hgK5DuLS4baqXHQXj'
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
        code: htlc_contract,
        //значение хранилища
        storage: {
                unused: true,
                date:'',
                sender:'tz1LiBrF9gibgH5Lf6a7gDjoUfSEg6nxPKsz',
                dest:'tz1LiBrF9gibgH5Lf6a7gDjoUfSEg6nxPKsz',
                hash:char2Bytes('Hello'),
                value:0,
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
