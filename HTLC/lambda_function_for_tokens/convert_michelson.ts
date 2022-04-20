import {TezosToolkit, MANAGER_LAMBDA} from '@taquito/taquito';
import {InMemorySigner} from '@taquito/signer';
import {char2Bytes} from '@taquito/utils';
import { Schema } from "@taquito/michelson-encoder";
import {Parser} from './taquito-michel-codec/src/taquito-michel-codec'


const code = `{ DROP ;
  PUSH address "KT1Exj7HLktuik8JiKtUavzsHB9heThHUQSf" ;
  CONTRACT %createLock
    (pair (pair (nat %amount_tokens) (address %dest1))
          (pair (bytes %hash1) (address %tokenAddress))) ;
  IF_NONE { PUSH string "Not a entrypoint" ; FAILWITH } {} ;
  NIL operation ;
  SWAP ;
  PUSH mutez 0 ;
  PUSH address "KT19xGcNnDwB8uYy18k93FjFv9KNDEivbq87" ;
  PUSH bytes 0xff7a7aff ;
  PAIR ;
  PUSH address "KT19xGcNnDwB8uYy18k93FjFv9KNDEivbq87" ;
  PUSH nat 1000 ;
  PAIR ;
  PAIR ;
  TRANSFER_TOKENS ;
  CONS }
`;

const p = new Parser();

const result = p.parseMichelineExpression(code);
console.log(JSON.stringify(result,null,2));

