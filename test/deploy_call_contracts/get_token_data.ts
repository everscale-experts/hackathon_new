import { TezosToolkit } from '@taquito/taquito';
import { Tzip16Module } from '@taquito/tzip16';
import { tzip16 } from '@taquito/tzip16';

const Tezos = new TezosToolkit('https://rpc.hangzhounet.teztnets.xyz');
Tezos.addExtension(new Tzip16Module());

async function main() {

const contract = await Tezos.contract.at("KT1DB6jVgAKifGhwtBHzqnNEvtjPM6tJrrx4", tzip16)

const metadata = await contract.tzip16().getMetadata();

console.log(metadata)

}

main();
