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
    "rzfxnqsg.skbbgtec@teztnets.xyz", //почта
    "6Uvib1sHKC", //пароль
    [
      "gas",
		"travel",
		"scissors",
		"lab",
		"choose",
		"auction",
		"false",
		"upon",
		"icon",
		"mom",
		"proof",
		"dismiss",
		"name",
		"custom",
		"meat",
    ].join(' '),
    "f3d1c92086b49db7e51ed8727facc129d419e499"
  );
  
  try {
    console.log('Deploying Tzip12BigMapsTokenMetadata contract...');
    
    const LocalTez1 = await createAddress();
			const localTez1Pkh = await LocalTez1.signer.publicKeyHash();
			const LocalTez2 = await createAddress();
			const localTez2Pkh = await LocalTez2.signer.publicKeyHash();

			const ledger = new MichelsonMap();
			ledger.set(
				{
					owner: "tz1Nt3vKhbZpVdCrqgxR9sZDFqUty2h7SMRM",
					token_id: 1
				},
				10000000,// количество токенов в сатошинах(меньших единиц токена)
				
			);
			ledger.set(
				{
					owner: "tz1Nt3vKhbZpVdCrqgxR9sZDFqUty2h7SMRM",
					token_id: 2
				},
				990000000// количество токенов в сатошинах(меньших единиц токена)
			);

			const url = 'https://storage.googleapis.com/tzip-16/fa2-token-factory.json';
			const bytesUrl = char2Bytes(url);
			const metadata = new MichelsonMap();
			metadata.set('', bytesUrl);

			const operators = new MichelsonMap();

			const token_admins = new MichelsonMap();
			token_admins.set('1', {
				0: localTez1Pkh,
				1: true
			});
			token_admins.set('2', {
				0: localTez2Pkh,
				1: true
			});

			const token_metadata = new MichelsonMap();
			const token1 = new MichelsonMap();
			token1.set('name', char2Bytes('wToken'));
			token1.set('symbol', char2Bytes('wTK'));
			token1.set('decimals', '36');
			const token2 = new MichelsonMap();
			token2.set('name', char2Bytes('AliceToken'));
			token2.set('symbol', char2Bytes('CSD'));
			token2.set('decimals', '30');
			token_metadata.set('1', {
				token_id: '1',
				token_info: token1
			});
			token_metadata.set('2', {
				token_id: '2',
				token_info: token2
			});

			const token_total_supply = new MichelsonMap();
			token_total_supply.set('1', '30000');
			token_total_supply.set('2', '50000');

			const op = await tezos.contract.originate({
				code: fa2TokenFactory,
				storage: {
					admin: await tezos.signer.publicKeyHash(),
					exchange_address: 'KT1DGRPQUwLJyCZnM8WKtwDGiKDSMv4hftk4',
					last_token_id: '2',
					ledger,
					metadata,
					operators,
					token_admins,
					token_metadata,
					token_total_supply
				}
			});

    console.log('Awaiting confirmation...');
    const contract = await op.contract();
    console.log('Tzip12BigMapsTokenMetadata Contract address',contract.address)
    console.log('Gas Used', op.consumedGas);

    console.log('Storage', await contract.storage());
    console.log('Operation hash:', op.hash, 'Included in block level:', op.includedInBlock);
  } catch (ex) {
    console.error(ex);
  }
}

example();