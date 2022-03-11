import { BatchOperation, TezosToolkit, MANAGER_LAMBDA } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';
import { KeyToken } from '@taquito/michelson-encoder/dist/types/tokens/key';
import { b58cencode, char2Bytes, Prefix, prefix } from '@taquito/utils';
import {SchemaOfParams1} from './schema1'

const acc = require('./Account.json');

   const RPC_URL = 'https://rpc.hangzhounet.teztnets.xyz';
const CONTRACT = 'KT1JdLB4zECcXhuW6VWrgKw9BUnpsqbcXjY1'; //адрес опубликованного multisig



// присваиваем переменным обьект с помощью которого будем подписывать строку 
const signer =new InMemorySigner('edskRrZRXU2vgyFgMt94BKY2Fv1bQCFLrgwo2DwseLoYDvpjZeNohKC1afZtRT55NhhLfAj46PGVL1jAy8WEJZ1m4n3F2Kkc7i');
  
// // байтовая уже зашифрованная строка, получил с помощью tezos-client
//const bytes = '05070707070a000000046252be4f0a0000001601885097fd0367dfdfc6946c1dea5c4f758841bb9e0007070001050502000000340320053d036d0743035d0a00000015003a0f681de989b300fab38bd867439115ac622cbf031e0743036a00a0843d034f034d031b'

// подписыаем строку и получаем сигнатуры
//const signature = signer.sign(bytes, new Uint8Array());



export class token_transfer {
    // настраиваем ссылку на публичный узел тестовой сети
    private tezos: TezosToolkit
    rpcUrl: string
  
    constructor(rpcUrl: string) {
      this.tezos = new TezosToolkit(rpcUrl);
      this.rpcUrl = rpcUrl;
  
      //считываем почту, пароль и мнемоническую фразу, из которой можно получить приватный ключ
      this.tezos.setSignerProvider(signer);

     }
     public async transfer(contract1: string,) {
        console.log("Transaction started")
        
        const contract = await this.tezos.contract.at(contract1);
         
       const pair = ({ data, type }: any, value: any) => {
         return {
           data: {
             prim: 'Pair',
             args: [{ "string": value }, data]
           },
           type: {
             prim: 'pair',
             args: [{ prim: "address" }, type]
           }
         }
       }
       const { packed } = await this.tezos.rpc.packData(pair({
         data: {
       
         //   prim: 'Pair',
         //   args: [
         //     { "int": "0" },
         //     {
         //       prim: 'address',
         //       args: [
         //          {'address':'KT1WhqQJyuznPdGD3JM3iqMpaRveeUuVSz9k'},
         //             {prim: 'list',
         //             args:[[{'address':'KT19DgJEiULkUAuvixiGtN9PBHHjP4kvRsii'},
         //             {
         //                prim:'txs',
         //                args:[[{'address':'tz1i5w4BTmwB51efYjcziq6G5eJC5ra2gqHF'},
         //                   {'int':'123'},
         //                   {'int':'1'},
         //                ]],
         //             }]]
                  

         //          }]
         //     }
         //   ]
         prim: 'Pair',
                args: [
                    {"int": "0"},
                    {
                        prim: 'Left',
                        args: [{
                           prim:'Right',
                           args:[MANAGER_LAMBDA.transferImplicit("tz1Qw2LiqMNwJXKKzimAVMWj5W467Hrd6dP7", 1)]
                        }]
                    }
                ]
         } as any,
         type: SchemaOfParams1  //схема параметров 
          }, contract.address))
       console.log(packed)

       const signature = signer.sign(packed, new Uint8Array())


   const op = await contract.methods.main_parameter(
      // Counter
      '0',
      // вызов метода трансфера токенов 
      'transferFA',
      'KT19LybspUkGTZxGMSKVRMDcpoRS24JapqH1',
      'transferFA2',
      [{
         from_:'KT1JdLB4zECcXhuW6VWrgKw9BUnpsqbcXjY1',
         txs:[{
            to_:'tz1Qw2LiqMNwJXKKzimAVMWj5W467Hrd6dP7',
            token_id:'1',
            amount:'7000',
         }]
      }],
      
      // Signature list
      [(await signature).prefixSig]
    ).send()

      await op.confirmation();
        console.log(op.hash);
   } }




new token_transfer(RPC_URL).transfer(CONTRACT);
  




// параметры которые можно указывать в PAIR
// '    At /prim, unexpected string value "Pir" instead of "ABS" , "IF" , "SENDER" , "VOTING_POWER" , "False" , "NEVER" , "DUG" , "chest" , "BLAKE2B" ,
//  "map" , "bls12_381_g2" , "Pair" , "INT" , "option" , "bls12_381_g1" , "storage" , "SIZE" , "view" , "SHA256" , "AND" , "VIEW" , "mutez" , "NIL" , "big_map" 
//  , "SUB" , "SAPLING_VERIFY_UPDATE" , "CHECK_SIGNATURE" , "TOTAL_VOTING_POWER" , "address" , "MAP" , "or" , "ticket" , "ADD" , "IMPLICIT_ACCOUNT" , "SHA512" , "key" 
//  , "LSL" , "bls12_381_fr" , "chest_key" , "sapling_state" , "COMPARE" , "TRANSFER_TOKENS" , "STEPS_TO_QUOTA" , "DROP" , "set" , "BALANCE" , "CONCAT" , "MUL" , "FAILWITH" 
//  , "Elt" , "list" , "OR" , "DIP" , "MEM" , "LOOP_LEFT" , "lambda" , "ITER" , "Some" , "parameter" , "sapling_transaction" , "EMPTY_MAP" , "None" , "SET_DELEGATE" , 
//  "pair" , "AMOUNT" , "string" , "PAIRING_CHECK" , "bytes" , "CHAIN_ID" , "HASH_KEY" , "IF_LEFT" , "CREATE_ACCOUNT" , "LT" , "KECCAK" , "UNPACK" , "SPLIT_TICKET" , 
//  "SELF_ADDRESS" , "unit" , "UNIT" , "LE" , "SOURCE" , "CREATE_CONTRACT" , "Unit" , "DIG" , "NONE" , "ISNAT" , "GE" , "SOME" , "key_hash" , "SELF" , "signature" , 
//  "CAR" , "NOT" , "operation" , "CDR" , "ADDRESS" , "TICKET" , "RIGHT" , "LEFT" , "RENAME" , "True" , "Right" , "PACK" , "IF_CONS" , "SHA3" , "constant" , "UPDATE" , 
//  "EMPTY_SET" , "NEQ" , "LAMBDA" , "timestamp" , "READ_TICKET" , "LOOP" , "Left" , "int" , "LSR" , "EMPTY_BIG_MAP" , "chain_id" , "OPEN_CHEST" , "LEVEL" , "UNPAIR" , 
//  "JOIN_TICKETS" , "PUSH" , "nat" , "GT" , "never" , "NOW" , "IF_NONE" , "PAIR" , "GET_AND_UPDATE" , "XOR" , "CAST" , "bool" , "SAPLING_EMPTY_STATE" , "EDIV" , "EQ" , 
//  "CONTRACT" , "contract" , "EXEC" , "GET" , "NEG" , "SLICE" , "DUP" , "CONS" , "SWAP" , "APPLY" or "code"',
// url: 'https://rpc.hangzhounet.teztnets.xyz/chains/main/blocks/head/helpers/scripts/pack_data'




