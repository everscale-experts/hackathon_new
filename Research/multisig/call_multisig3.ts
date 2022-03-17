import {BatchOperation, TezosToolkit, MANAGER_LAMBDA} from '@taquito/taquito';
import {InMemorySigner} from '@taquito/signer';
import {KeyToken} from '@taquito/michelson-encoder/dist/types/tokens/key';
import {b58cencode, char2Bytes, Prefix, prefix} from '@taquito/utils';
import {schema_param} from './schema_msig_coin'
const acc = require('./Account.json');

const RPC_URL = 'https://mainnet.api.tez.ie';

const CONTRACT = 'KT1Cecn3A2A4i9EmSqug45iyzUUQc4F7C9yM'


// присваиваем переменным обьект с помощью которого будем подписывать строку
const signer = new InMemorySigner('edskRrZRXU2vgyFgMt94BKY2Fv1bQCFLrgwo2DwseLoYDvpjZeNohKC1afZtRT55NhhLfAj46PGVL1jAy8WEJZ1m4n3F2Kkc7i');



export class token_transfer {
    // настраиваем ссылку на публичный узел тестовой сети
    private tezos: TezosToolkit
    rpcUrl: string

    constructor(rpcUrl: string) {
        this.tezos = new TezosToolkit(rpcUrl);
        this.rpcUrl = rpcUrl;


        this.tezos.setSignerProvider(signer);

    }

    public async transfer(contract1: string,) {
        
        const contract = await this.tezos.contract.at(contract1);
        console.log("Transaction strated")
   
        const op = await contract.methods.transfer_mutez_proposal(
        '100',
        'tz1i5w4BTmwB51efYjcziq6G5eJC5ra2gqHF'
        ).send()
        console.log("Awaiting confirmation...")
        await op.confirmation();
        console.log(op.hash);
    }
}
//   status: 500,
//   statusText: 'Internal Server Error',
//   body: '[{"kind":"branch","id":"proto.011-PtHangz2.implicit.empty_implicit_contract","implicit":"tz1LiBrF9gibgH5Lf6a7gDjoUfSEg6nxPKsz"}]\n',
//   url: 'https://mainnet.api.tez.ie/chains/main/blocks/head/helpers/scripts/run_operation'

new token_transfer(RPC_URL).transfer(CONTRACT);


