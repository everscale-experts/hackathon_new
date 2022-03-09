// import {RpcClientInterface} from "@taquito/rpc"
// import { TezosToolkit } from '@taquito/taquito'
// import { importKey } from '@taquito/signer'
import { Schema } from "@taquito/michelson-encoder";

// const Tezos = new TezosToolkit("https://rpc.hangzhounet.teztnets.xyz")



// const script = Tezos.rpc.getScript('KT1SYmWUEZu13tycy5cLEaYuDtoG6Zf6DsxL')

// const schema = Schema.fromRPCResponse({script})

// console.log(script)

import { TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';


async function example() {
    const provider = 'https://rpc.hangzhounet.teztnets.xyz';
    const signer: any = new InMemorySigner('edsk31hLYrJqTeHqsLPdo1Ab5SKw7PUXUuWBt95UBFkLj3KrW1Dt6x');
        const tezos = new TezosToolkit(provider);
    tezos.setSignerProvider( signer );
    try {
       
        const contract = await tezos.contract.at('KT1SYmWUEZu13tycy5cLEaYuDtoG6Zf6DsxL');
 
        console.log("Showing schem...");
        // получаем схему 
        const schema = await contract.entrypoints.entrypoints
        // выводим схему в json формате
        console.log(JSON.stringify(schema, null, 2))
        
        
       
        const schem1= {
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
                },
                {
                  prim: "list",
                  args: [
                    {
                      prim: "option",
                      args: [
                        {
                          prim: "signature"
                        }
                      ]
                    }
                  ],
                  annots: [
                    ":sigs"
                  ]
                }
              ]
          
         }

        
    } catch (ex) {
        console.log(ex)
    }
}

example();


