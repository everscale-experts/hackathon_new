// для того чтобы пользоватся кодом пишем в командной строке
//1) npm install -g yarn
//2) yarn
//3) npx ts-node deploy_multisig.ts


import { TezosToolkit,MichelsonMap } from '@taquito/taquito'
import { importKey,InMemorySigner } from '@taquito/signer'
import * as fs from 'fs';
import {char2Bytes} from '@taquito/utils';
import { readFileSync } from "fs";

// чтение кода из файла 
const htlc_contract: string = fs.readFileSync('./htlc_contract_tokens.tz').toString(); 
const provider = 'https://hangzhounet.smartpy.io'
const signer = new InMemorySigner('edskRdkUMmmBorjeetbGiU4cjZ1pbewF6ZmBMj7jCEWxA6pmgTooYTCStHZFitsEgnut7V3YpKt8ptgT1hgK5DuLS4baqXHQXj');
async function deploy() {
  const tezos = new TezosToolkit(provider)
  tezos.setSignerProvider(signer)
  const chests = new MichelsonMap(); 
  const balances_token = new MichelsonMap();
  const chests_for_check = new MichelsonMap();
    try {

      const op = await tezos.contract.originate({
        //код смарт-контракта
        code: htlc_contract,
        //значение хранилища
        storage: {
                counter:0, 
                chests,
                balances_token,
                chests_for_check
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