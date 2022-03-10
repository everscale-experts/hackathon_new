import { MichelsonMap, TezosToolkit } from '@taquito/taquito';
import { importKey } from '@taquito/signer';
import { b58cencode, char2Bytes, Prefix, prefix } from '@taquito/utils';
import { fa2TokenFactory } from './fa2-token-factory';

const provider = 'https://rpc.hangzhounet.teztnets.xyz'

const nodeCrypto = require('crypto');

async function createAddress() {
  const tezos = new TezosToolkit(provider)

  const keyBytes = Buffer.alloc(32);
  nodeCrypto.randomFillSync(keyBytes)

  const key = b58cencode(new Uint8Array(keyBytes), prefix[Prefix.P2SK]);
  await importKey(tezos, key);

  return tezos;
}

async function example() {
  const tezos = new TezosToolkit(provider)
  await importKey(
    tezos,
    'edskRdkUMmmBorjeetbGiU4cjZ1pbewF6ZmBMj7jCEWxA6pmgTooYTCStHZFitsEgnut7V3YpKt8ptgT1hgK5DuLS4baqXHQXj'//приватный ключ создателя контракта
  );
  
  try {
    console.log('Deploying contract...');
    


			const ledger = new MichelsonMap();
			ledger.set(
				{
					owner: 'tz1i5w4BTmwB51efYjcziq6G5eJC5ra2gqHF',//адресс кошелька владельца 
					token_id: 1
				},
				990000000000000000,// количество токенов в сатошинах
				
			);
			ledger.set(
				{
					owner: 'tz1i5w4BTmwB51efYjcziq6G5eJC5ra2gqHF',
					token_id: 2,
				},
				990000000000000000,
			);
			ledger.set(
				{
					owner: 'tz1i5w4BTmwB51efYjcziq6G5eJC5ra2gqHF',
					token_id: 3,
				},
				990000000000000000,
			);

			const url = 'https://storage.googleapis.com/tzip-16/fa2-token-factory.json';
			const bytesUrl = char2Bytes(url);
			const metadata = new MichelsonMap();
			metadata.set('', bytesUrl);

			const operators = new MichelsonMap();

			const token_admins = new MichelsonMap();
			token_admins.set('1', {
				0: 'tz1i5w4BTmwB51efYjcziq6G5eJC5ra2gqHF',
				1: true
			});
			token_admins.set('2', {
				0: 'tz1i5w4BTmwB51efYjcziq6G5eJC5ra2gqHF',
				1: true
			});
			token_admins.set('3', {
				0: 'tz1i5w4BTmwB51efYjcziq6G5eJC5ra2gqHF',
				1: true
			});

			const token_metadata = new MichelsonMap();
			const token1 = new MichelsonMap();
			token1.set('name', char2Bytes('wrap tea'));
			token1.set('symbol', char2Bytes('wTEA'));
			token1.set('decimals', '39');
			// token1.set("icon", char2Bytes('https://icon-library.com/images/194204.svg.svg'))//ссылка на иконку
			const token2 = new MichelsonMap();
			token2.set('name', char2Bytes('wrap ever'));
			token2.set('symbol', char2Bytes('wEVER'));
			token2.set('decimals', '39');
            const token3 = new MichelsonMap();
			token3.set('name', char2Bytes('wrap bridge'));
			token3.set('symbol', char2Bytes('wBRIDGE'));
			token3.set('decimals', '39');

			token_metadata.set('1', {
				token_id: '1',
				token_info: token1,
			});
			token_metadata.set('2', {
				token_id: '2',
				token_info: token2,
			});
			token_metadata.set('3', {
				token_id: '3',
				token_info: token3,
			});

			const token_total_supply = new MichelsonMap();
			token_total_supply.set('1', '990000000000000000');
			token_total_supply.set('2', '990000000000000000');
			token_total_supply.set('3', '9900000000000000002');

			const op = await tezos.contract.originate({
				code: fa2TokenFactory,
				storage: {
					admin: await tezos.signer.publicKeyHash(),
					exchange_address: 'KT1DGRPQUwLJyCZnM8WKtwDGiKDSMv4hftk4',
					last_token_id: '3',
					ledger,
					metadata,
					operators,
					token_admins,
					token_metadata,
					token_total_supply,
				}
			});

    console.log('Awaiting confirmation...');
    const contract = await op.contract();
    console.log('Contract address',contract.address);
    console.log('Gas Used', op.consumedGas);
    console.log('Operation hash:', op.hash, 'Included in block level:', op.includedInBlock);
  } catch (ex) {
    console.error(ex);
  }
}

example();