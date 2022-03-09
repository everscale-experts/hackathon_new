import { BatchOperation, TezosToolkit, MANAGER_LAMBDA } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';
import { KeyToken } from '@taquito/michelson-encoder/dist/types/tokens/key';
import { b58cencode, char2Bytes, Prefix, prefix } from '@taquito/utils';

const acc = require('./Account.json');

   const RPC_URL = 'https://rpc.hangzhounet.teztnets.xyz';
const CONTRACT = 'KT19DgJEiULkUAuvixiGtN9PBHHjP4kvRsii'; //адрес опубликованного multisig



// присваиваем переменным обьект с помощью которого будем подписывать строку 
const signer =new InMemorySigner('edsk31hLYrJqTeHqsLPdo1Ab5SKw7PUXUuWBt95UBFkLj3KrW1Dt6x');
  
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
       
           prim: 'Pair',
           args: [
             { "int": "0" },
             {
               prim: 'lambda',
               args: [MANAGER_LAMBDA.transferImplicit("tz1Qw2LiqMNwJXKKzimAVMWj5W467Hrd6dP7", 0.5)]
             }
           ]
         } as any,
         type: {
            prim: "pair",
            args: [
              {
                prim: "pair",
                args: [
                  {
                    prim: "nat",
                    annots: [
                      ":counter"
                    ]
                  },
                  {
                    prim: "or",
                    args: [
                      {
                        prim: "or",
                        args: [
                          {
                            prim: "or",
                            args: [
                              {
                                prim: "or",
                                args: [
                                  {
                                    prim: "pair",
                                    args: [
                                      {
                                        prim: "address",
                                        annots: [
                                          ":to"
                                        ]
                                      },
                                      {
                                        prim: "mutez",
                                        annots: [
                                          ":value"
                                        ]
                                      }
                                    ]
                                  },
                                  {
                                    prim: "option",
                                    args: [
                                      {
                                        prim: "key_hash"
                                      }
                                    ],
                                    annots: [
                                      ":delegation"
                                    ]
                                  }
                                ],
                                annots: [
                                  ":direct_action"
                                ]
                              },
                              {
                                prim: "or",
                                args: [
                                  {
                                    prim: "pair",
                                    args: [
                                      {
                                        prim: "address"
                                      },
                                      {
                                        prim: "or",
                                        args: [
                                          {
                                            prim: "pair",
                                            args: [
                                              {
                                                prim: "address"
                                              },
                                              {
                                                prim: "address"
                                              },
                                              {
                                                prim: "nat"
                                              }
                                            ],
                                            annots: [
                                              ":transferFA1.2"
                                            ]
                                          },
                                          {
                                            prim: "list",
                                            args: [
                                              {
                                                prim: "pair",
                                                args: [
                                                  {
                                                    prim: "address",
                                                    annots: [
                                                      ":from_"
                                                    ]
                                                  },
                                                  {
                                                    prim: "list",
                                                    args: [
                                                      {
                                                        prim: "pair",
                                                        args: [
                                                          {
                                                            prim: "address",
                                                            annots: [
                                                              ":to_"
                                                            ]
                                                          },
                                                          {
                                                            prim: "nat",
                                                            annots: [
                                                              ":token_id"
                                                            ]
                                                          },
                                                          {
                                                            prim: "nat",
                                                            annots: [
                                                              ":amount"
                                                            ]
                                                          }
                                                        ]
                                                      }
                                                    ],
                                                    annots: [
                                                      ":txs"
                                                    ]
                                                  }
                                                ]
                                              }
                                            ],
                                            annots: [
                                              ":transferFA2"
                                            ]
                                          }
                                        ]
                                      }
                                    ],
                                    annots: [
                                      ":transferFA"
                                    ]
                                  },
                                  {
                                    prim: "pair",
                                    args: [
                                      {
                                        prim: "address",
                                        annots: [
                                          ":vesting"
                                        ]
                                      },
                                      {
                                        prim: "or",
                                        args: [
                                          {
                                            prim: "option",
                                            args: [
                                              {
                                                prim: "key_hash"
                                              }
                                            ],
                                            annots: [
                                              ":setDelegate"
                                            ]
                                          },
                                          {
                                            prim: "nat",
                                            annots: [
                                              ":vest"
                                            ]
                                          }
                                        ]
                                      }
                                    ]
                                  }
                                ]
                              }
                            ],
                            annots: [
                              ":action"
                            ]
                          },
                          {
                            prim: "lambda",
                            args: [
                              {
                                prim: "unit"
                              },
                              {
                                prim: "list",
                                args: [
                                  {
                                    prim: "operation"
                                  }
                                ]
                              }
                            ]
                          }
                        ],
                        annots: [
                          ":actions"
                        ]
                      },
                      {
                        prim: "pair",
                        args: [
                          {
                            prim: "nat",
                            annots: [
                              ":threshold"
                            ]
                          },
                          {
                            prim: "list",
                            args: [
                              {
                                prim: "key"
                              }
                            ],
                            annots: [
                              ":keys"
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            
            ]
        
       }
         
           
         
       }, contract.address))
       console.log(packed)

       const signature = signer.sign(packed, new Uint8Array())
       console.log(signature)


   const op = await contract.methods.main(
      // Counter
      '0',
      // Sub function
      'LR',
      // Action
      MANAGER_LAMBDA.transferImplicit("tz1Qw2LiqMNwJXKKzimAVMWj5W467Hrd6dP7", 0.5),
      // Signature list
      [(await signature).prefixSig]
    ).send()

      await op.confirmation();
        console.log(op.hash);
   } }




new token_transfer(RPC_URL).transfer(CONTRACT);
  

