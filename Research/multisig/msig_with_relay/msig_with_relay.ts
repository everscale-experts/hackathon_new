import { BatchOperation, TezosToolkit, ContractAbstraction, WalletOperationBatch } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';
import { b58cencode, char2Bytes, Prefix, prefix } from '@taquito/utils';


const tezos = new TezosToolkit('')


