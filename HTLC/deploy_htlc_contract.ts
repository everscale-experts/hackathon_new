// для того чтобы пользоватся кодом пишем в командной строке
//1) npm install -g yarn
//2) yarn
//3) npx ts-node deploy_multisig.ts


import { TezosToolkit,MichelsonMap } from '@taquito/taquito'
import { importKey } from '@taquito/signer'
import * as fs from 'fs';
import {char2Bytes} from '@taquito/utils';
import { readFileSync } from "fs";

const htlc_contract: string = fs.readFileSync('./htlc_contract.tz').toString();
const provider = 'https://rpc.hangzhounet.teztnets.xyz'

async function deploy() {
  const tezos = new TezosToolkit(provider)
  await importKey(
    tezos,
    'edskRdkUMmmBorjeetbGiU4cjZ1pbewF6ZmBMj7jCEWxA6pmgTooYTCStHZFitsEgnut7V3YpKt8ptgT1hgK5DuLS4baqXHQXj'
  )
  const chests = new MichelsonMap(); 
  const transfers_amounts = new MichelsonMap();
    try {

      const op = await tezos.contract.originate({
        //код смарт-контракта
        code: htlc_contract,
        //значение хранилища
        storage: {
                counter:0,
                chests,
                transfers_amounts,
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