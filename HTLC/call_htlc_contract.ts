import { TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';


const tezos = new TezosToolkit('https://rpc.hangzhounet.teztnets.xyz');
const signer = new InMemorySigner('edskRdkUMmmBorjeetbGiU4cjZ1pbewF6ZmBMj7jCEWxA6pmgTooYTCStHZFitsEgnut7V3YpKt8ptgT1hgK5DuLS4baqXHQXj');
tezos.setSignerProvider()

const contract = tezos.contract.at('KT1DGu9gLm5MszYh3zf1uVJvJTJnQD7pqBtg')





