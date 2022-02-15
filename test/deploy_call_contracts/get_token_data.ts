import { TezosToolkit } from '@taquito/taquito';
import { Tzip16Module } from '@taquito/tzip16';
import { tzip16 } from '@taquito/tzip16';

const Tezos = new TezosToolkit('https://rpc.hangzhounet.teztnets.xyz');
Tezos.addExtension(new Tzip16Module());

async function main() {

const contract = await Tezos.contract.at("KT1G1vbz9P4R7cPczYTYzM2qf3xFkTLTsbb4", tzip16)

const metadata = await contract.tzip16().getMetadata();

console.log(metadata)


const contractAddress = "KT1G1vbz9P4R7cPczYTYzM2qf3xFkTLTsbb4";
const tokenId = 1;

const rightcontract = await Tezos.contract.at(contractAddress, tzip16)
.then(contract => {
  console.log(`Initialising the views for ${contractAddress}...`);
  return contract.tzip16().metadataViews();
})
.then (views => {
  return views['token_metadata']().executeView(tokenId)
}).then (result => {
  console.log('Result of the view token_metadata:');
  console.log(`name: ${bytes2Char((Object.values(result)[1]).get('name'))}`);
  console.log(`decimals: ${bytes2Char((Object.values(result)[1]).get('decimals'))}`);
  console.log(`symbol: ${bytes2Char((Object.values(result)[1]).get('symbol'))}`);
  console.log(`extra: ${bytes2Char((Object.values(result)[1]).get('extra'))}`);
})
.catch(error => console.log(`Error: ${JSON.stringify(error, null, 2)}`));

console.log(rightcontract)


}

main();
