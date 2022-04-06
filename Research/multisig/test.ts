import { BatchOperation, TezosToolkit, MANAGER_LAMBDA } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';
import { KeyToken } from '@taquito/michelson-encoder/dist/types/tokens/key';
import { b58cencode, char2Bytes, Prefix, prefix } from '@taquito/utils';
import { Schema, ParameterSchema } from '@taquito/michelson-encoder';
import {TokenMultisig} from './TokenMultisig'
import{genericMultisig} from '././multisig_example_in_taquito/multisig'

const tezos = new TezosToolkit('https://rpc.hangzhounet.teztnets.xyz');

const script = tezos.rpc.getScript('KT1NKRT1sdGZjpsN8qNNEX3fqNnSi6ReujSK')
const schema = new ParameterSchema(TokenMultisig[1].args[0] as any);

console.log(JSON.stringify(schema, null, 2))