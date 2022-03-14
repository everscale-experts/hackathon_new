import { BatchOperation, TezosToolkit, MANAGER_LAMBDA } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';
import { KeyToken } from '@taquito/michelson-encoder/dist/types/tokens/key';
import { b58cencode, char2Bytes, Prefix, prefix } from '@taquito/utils';
import {SchemaOfParams1} from './schema1';
import {SchemaOfParams2} from './schema2';

const acc = require('./Account.json');

const RPC_URL = 'https://rpc.hangzhounet.teztnets.xyz';
const CONTRACT_MSIG = 'KT1NKRT1sdGZjpsN8qNNEX3fqNnSi6ReujSK'; //адрес опубликованного multisig
const CONTRACT='KT19xGcNnDwB8uYy18k93FjFv9KNDEivbq87'; // адресс контракта токенов 
const RECEIVER = 'tz1LiBrF9gibgH5Lf6a7gDjoUfSEg6nxPKsz';
const AMOUNT = '1'; //количество токенов для отправки в сатошах, меньших единицах токена. Можете ввести другое число
const ID='1';


// присваиваем переменным обьект с помощью которого будем подписывать строку 
const signer =new InMemorySigner('edskRrZRXU2vgyFgMt94BKY2Fv1bQCFLrgwo2DwseLoYDvpjZeNohKC1afZtRT55NhhLfAj46PGVL1jAy8WEJZ1m4n3F2Kkc7i');
  


export class token_transfer {
    // настраиваем ссылку на публичный узел тестовой сети
    private tezos: TezosToolkit;
    rpcUrl: string;
  
    constructor(rpcUrl: string) {
      this.tezos = new TezosToolkit(rpcUrl);
      this.rpcUrl = rpcUrl;
  
      //считываем почту, пароль и мнемоническую фразу, из которой можно получить приватный ключ
      this.tezos.setSignerProvider(signer);

     }
     public async transfer(contractmsig: string,contract1:string,receiver:string, amount:string, id:string) {
        
        const contract = await this.tezos.contract.at(contractmsig);
        console.log("Packing started...");

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
         // prim: 'Pair', // передача пары аргументов 
         //        args: [
         //            {"int": "1"},//счетчик 
         //            {  // выбираем одно из двух значений or
         //                prim: 'Left',
         //                args: [{
         //                   prim:'Left',
         //                   args:[{
         //                      prim:'Right',
         //                      args:[{
         //                         prim:'Left',
         //                         args:[{
         //                            prim:'Pair',// передача пары аргументов 
         //                            args:[
         //                               {'string':contract1}, //адресс контракта токенов 
         //                            {
                                       
         //                               prim:'Right', // если надо transferFA1.2 - Left, если transferFA2 то пишем Right
         //                               args:[    
         //                                     [
         //                                        {
         //                                           prim:'Pair',
         //                                           args:[
         //                                              {
         //                                                 string:contractmsig, // адресс отправитель 
         //                                              },
         //                                              [
         //                                                 {
         //                                                    prim:'Pair',
         //                                                    args:[
         //                                                       {
         //                                                          string:receiver // адресс получатель
         //                                                       },
         //                                                       {
         //                                                          prim:'Pair',
         //                                                          args:[
         //                                                             {int:id}, // id токена
         //                                                             {int:amount} // количество в сатошинах 
         //                                                          ]
         //                                                       }
         //                                                    ]
         //                                                 }
         //                                              ]
         //                                           ]
         //                                        }
         //                                     ]
         //                                     // пересылка токенов стандарта FA1.2
         //                                     // prim:'Pair',
         //                                     // args:[
         //                                     //    {string:'KT19LybspUkGTZxGMSKVRMDcpoRS24JapqH1'},
         //                                     //    {
         //                                     //       prim:'Pair',
         //                                     //       args:[
         //                                     //          {string:'KT19LybspUkGTZxGMSKVRMDcpoRS24JapqH1'},
         //                                     //          {int:'100'}
         //                                     //       ]
         //                                     //    }
         //                                     // ]
         //                               ]
         //                            }
         //                            ]
         //                         }]
         //                      }]
         //                   }]
         //                }]
         //            }
         //        ]
                

         //передача данных в лямбда функцию, в данной ситуации трансфер монет 
         // prim: 'Pair',
         //        args: [
         //            {"int": "0"},
         //            {
         //                prim: 'Left',
         //                args: [{
         //                   prim:'Right',
         //                   args:[MANAGER_LAMBDA.transferImplicit("tz1Qw2LiqMNwJXKKzimAVMWj5W467Hrd6dP7", 1)]
         //                }]
         //            }
         //        ]


         //трансфер монет
         

               prim:'Pair',
            args:[
               {'int':'1'},
               {
                  prim:'Left',
                  args:[{
                     prim:'Left',
                     args:[{
                        prim:'Left',
                        args:[{
                           prim:'Left',
                           args:[{
                              prim: 'Pair',
                              args:[
                                 {'string':'tz1Qw2LiqMNwJXKKzimAVMWj5W467Hrd6dP7'},
                                 {'int':'1000'},
                              ]
                           }]
                        }]
                     }]
                  }]
               }
            ]
     
         
      
      
         } as any,
         type: SchemaOfParams1  //схема параметров 
          },contractmsig));
       

       const signature = signer.sign(packed, new Uint8Array()); // подписание строки и получение сигнатуры

   console.log('Transaction started...');
   try{
   const op = await contract.methods.main_parameter(
      // Counter
      '1',
      // вызов метода трансфера токенов 
      // 'transferFA',
      // contract1,//адресс контракта токена 
      // 'transferFA2',
      // [{
      //    from_:contractmsig,
      //    txs:[{
      //       to_:receiver,
      //       token_id:id,
      //       amount:amount,
      //    }]
      // }],
      '1',
      'tz1Qw2LiqMNwJXKKzimAVMWj5W467Hrd6dP7',
      '1000',
      
      //'1' чтобы добраться до LLLL
      //'3' чтобы добраться до R
      
   
      [(await signature).prefixSig]
    ).send()

      console.log('Awaiting confirmation...');
      await op.confirmation();
        console.log(op.hash);
      }catch(er){console.log(er)}
   } }




new token_transfer(RPC_URL).transfer(CONTRACT_MSIG,CONTRACT,RECEIVER,AMOUNT,ID);
  




// параметры которые можно указывать в PAIR
// '    "ABS" , "IF" , "SENDER" , "VOTING_POWER" , "False" , "NEVER" , "DUG" , "chest" , "BLAKE2B" ,
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




