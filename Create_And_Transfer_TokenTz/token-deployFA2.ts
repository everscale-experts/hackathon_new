import { MichelsonMap, TezosToolkit } from '@taquito/taquito';
import { importKey } from '@taquito/signer';
import { b58cencode, char2Bytes, Prefix, prefix } from '@taquito/utils';
import { fa2TokenFactory } from './fa2-token-factory';

const provider = 'https://rpc.hangzhounet.teztnets.xyz'





async function example() {
  const tezos = new TezosToolkit(provider)
  await importKey(
    tezos,
    'edskRdkUMmmBorjeetbGiU4cjZ1pbewF6ZmBMj7jCEWxA6pmgTooYTCStHZFitsEgnut7V3YpKt8ptgT1hgK5DuLS4baqXHQXj'//приватный ключ создателя контракта
  );
  
  try {
    console.log('Deploying contract...');
    

             // добовляем в big map кошелек с его балансом токенов
			const ledger = new MichelsonMap();
			ledger.set(
				{
					owner: 'tz1i5w4BTmwB51efYjcziq6G5eJC5ra2gqHF',//адресс кошелька владельца 
					token_id: 1     // id токена который создаться на баланс кошелька 
				},
				990000000000000000,// количество токенов в найменьших единицах токена
				
			);
			ledger.set(
				{
					owner: 'tz1i5w4BTmwB51efYjcziq6G5eJC5ra2gqHF',//адресс кошелька владельца 
					token_id: 2,// id токена который создаться на баланс кошелька
				},
				990000000000000000,// количество токенов в найменьших единицах токена
			);
			ledger.set(
				{
					owner: 'tz1i5w4BTmwB51efYjcziq6G5eJC5ra2gqHF',//адресс кошелька владельца 
					token_id: 3,// id токена который создаться на баланс кошелька
				},
				990000000000000000,// количество токенов в найменьших единицах токена
			);

			const url = 'https://storage.googleapis.com/tzip-16/fa2-token-factory.json';
			const bytesUrl = char2Bytes(url);
			const metadata = new MichelsonMap();
			metadata.set('', bytesUrl);

			const operators = new MichelsonMap();

			// администраторы контракта которые могут минтить токены 
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
			// методанные токенов
			const token_metadata = new MichelsonMap();
			// методанные токена с id номером 1
			const token1 = new MichelsonMap();
			token1.set('name', char2Bytes('wrap tea')); // название токена
			token1.set('symbol', char2Bytes('wTEA')); // название токена краткое
			token1.set('decimals', '39'); // количество знаков по после запятой
			token1.set("icon", char2Bytes('https://icon-library.com/images/194204.svg.svg'))//ссылка на иконку
			const token2 = new MichelsonMap();
			token2.set('name', char2Bytes('wrap ever'));// название токена
			token2.set('symbol', char2Bytes('wEVER'));// название токена краткое
			token2.set('decimals', '39');// количество знаков по после запятой
            const token3 = new MichelsonMap();
			token3.set('name', char2Bytes('wrap bridge'));// название токена
			token3.set('symbol', char2Bytes('wBRIDGE'));// название токена краткое
			token3.set('decimals', '39');// количество знаков по после запятой

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

			// максимальное количество токенов, которое может быть сминчено
			const token_total_supply = new MichelsonMap();
			token_total_supply.set('1', '990000000000000000');
			token_total_supply.set('2', '990000000000000000');
			token_total_supply.set('3', '9900000000000000002');

			const op = await tezos.contract.originate({
				code: fa2TokenFactory,
				storage: {
					admin: await tezos.signer.publicKeyHash(),
					// адресс который лучше не менять, зачем он я не знаю
					exchange_address: 'KT1DGRPQUwLJyCZnM8WKtwDGiKDSMv4hftk4',
					// количество видов токенов 
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