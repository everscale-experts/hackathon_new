// первая попытка задеплоить мультисиг, возникала ошибка 

// import { Schema } from '@taquito/michelson-encoder/dist/types/schema/storage';
// import { TezosToolkit } from '@taquito/taquito';
// const Tezos = new TezosToolkit('https://rpc.hangzhounet.teztnets.xyz');



// const genericMultisigJSONfile = require('./multisig.json')
// // generic.json is referring to Michelson source code in JSON representation

// Tezos.contract
//   .originate({
//     code: genericMultisigJSONfile,
//     storage: {
//       counter: 0,
//       threshold: 1,
//       keys: ['edpkuAPjD8jVpbDUEQBXUdp1v9eNhLLo3JxUBBMTwWdw7Fm9tnHZTL'],
//     },
//   })
//   .then((originationOp) => {
//     console.log(`Waiting for confirmation of origination for ${originationOp.contractAddress}...`);
//     return originationOp.contract();
//   })
//   .then((contract) => {
//     console.log(`Origination completed.`);
//   })
//   .catch((error) => console.log(`Error: ${JSON.stringify(error, null, 2)}`));



// второй способ развертывания смарт контракта, все работает 
import { TezosToolkit } from '@taquito/taquito'
import { importKey } from '@taquito/signer'

const provider = 'https://rpc.hangzhounet.teztnets.xyz'

async function deploy() {
  const tezos = new TezosToolkit(provider)
  await importKey(
    tezos,
    'exvxiwgu.etyqlkwu@teztnets.xyz', //почта
    'P5XPyxzZLY', //пароль
    [
        "gather",
		"spawn",
		"purity",
		"clock",
		"filter",
		"nothing",
		"dress",
		"arrange",
		"bamboo",
		"decade",
		"suffer",
		"reject",
		"exile",
		"door",
		"innocent"
    ].join(' '),
    '5634857f4e6b46416a8dfbde1ae10134ee01b125' 
  )

  try {
    const op = await tezos.contract.originate({
      //код смарт-контракта
      code: `parameter
      (or
          (unit %default)
          (pair %main_parameter
              (pair
                  (nat :counter)
                  (or
                      (or :actions
                          (or :action
                              (or :direct_action
                                  (pair
                                      (address :to)
                                      (mutez :value)
                                  )
                                  (option :delegation key_hash)
                              )
                              (or
                                  (pair :transferFA
                                      address
                                      (or
                                          (pair :transferFA1.2
                                              address
                                              (pair
                                                  address
                                                  nat
                                              )
                                          )
                                          (list :transferFA2 (pair
                                                                  (address :from_)
                                                                  (list :txs (pair
                                                                                  (address :to_)
                                                                                  (pair
                                                                                      (nat :token_id)
                                                                                      (nat :amount)
                                                                                  )
                                                                              )
                                                                  )
                                                              )
                                          )
                                      )
                                  )
                                  (pair
                                      (address :vesting)
                                      (or
                                          (option :setDelegate key_hash)
                                          (nat :vest)
                                      )
                                  )
                              )
                          )
                          (lambda unit (list operation))
                      )
                      (pair
                          (nat :threshold)
                          (list :keys key)
                      )
                  )
              )
              (list :sigs (option signature))
          )
      );
  storage   (pair (nat %counter) (pair (nat %threshold) (list %keys key)));
  code
    {
      CAST (pair (or unit (pair (pair nat (or (or (or (or (pair address mutez) (option key_hash)) (or (pair address (or (pair address (pair address nat)) (list (pair address (list (pair address (pair nat nat))))))) (pair address (or (option key_hash) nat)))) (lambda unit (list operation))) (pair nat (list key)))) (list (option signature)))) (pair nat (pair nat (list key))));
      UNPAIR;
      IF_LEFT
        {
          DROP;
          NIL operation;
          PAIR;
        }
        {
          PUSH mutez 0;
          AMOUNT;
          COMPARE;
          EQ;
          IF
            {}
            {
              PUSH string "Some tokens were sent to this contract outside of a unit entry point.";
              FAILWITH;
            };
          SWAP;
          DUP;
          DIP
            {
              SWAP;
              UNPAIR;
              DUP;
              SELF_ADDRESS;
              CHAIN_ID;
              PAIR;
              PAIR;
              DIP
                {
                  DUP;
                  DIP
                    {
                      CDR;
                      SWAP;
                    };
                  CAR;
                };
              PACK;
              SWAP;
            };
          DUP;
          DIP
            {
              CDR;
              SWAP;
            };
          CAR;
          COMPARE;
          EQ;
          IF
            {}
            {
              PUSH string "Counters do not match.";
              FAILWITH;
            };
          DIP
            {
              SWAP;
            };
          DUP;
          DIP
            {
              CDR;
              PUSH nat 0;
              SWAP;
              ITER
                {
                  DIP
                    {
                      SWAP;
                    };
                  SWAP;
                  IF_CONS
                    {
                      IF_NONE
                        {
                          SWAP;
                          DROP;
                        }
                        {
                          SWAP;
                          DIP
                            {
                              SWAP;
                              DIP
                                {
                                  DIP
                                    {
                                      DIP
                                        {
                                          DUP;
                                        };
                                      SWAP;
                                    };
                                };
                              DIP 2 {DUP};
                              DIG 2;
                              DIP
                                {
                                  CHECK_SIGNATURE;
                                };
                              SWAP;
                              IF
                                {
                                  DROP;
                                }
                                {
                                  FAILWITH;
                                };
                              PUSH nat 1;
                              ADD;
                            };
                        };
                    }
                    {
                      FAILWITH;
                    };
                  SWAP;
                };
            };
          CAR;
          COMPARE;
          LE;
          IF
            {}
            {
              PUSH string "Quorum not present";
              FAILWITH;
            };
          IF_CONS
            {
              FAILWITH;
            }
            {
              DROP;
            };
          DIP
            {
              UNPAIR;
              PUSH nat 1;
              ADD;
              PAIR;
            };
          IF_LEFT
            {
              IF_LEFT
                {
                  IF_LEFT
                    {
                      IF_LEFT
                        {
                          DUP;
                          CDR;
                          PUSH mutez 0;
                          COMPARE;
                          EQ;
                          IF
                            {
                              PUSH string "Zero value transfer";
                              FAILWITH;
                            }
                            {};
                          DUP;
                          CAR;
                          CONTRACT unit;
                          IF_NONE
                            {
                              UNIT;
                              FAILWITH;
                            }
                            {};
                          SWAP;
                          CDR;
                          UNIT;
                          TRANSFER_TOKENS;
                          DIP
                            {
                              NIL operation;
                            };
                          CONS;
                        }
                        {
                          DIP
                            {
                              NIL operation;
                            };
                          SET_DELEGATE;
                          CONS;
                        };
                    }
                    {
                      DIP
                        {
                          NIL operation;
                        };
                      IF_LEFT
                        {
                          UNPAIR;
                          SWAP;
                          IF_LEFT
                            {
                              DIP
                                {
                                  CONTRACT %transfer (pair address (pair address nat));
                                  IF_NONE
                                    {
                                      PUSH string "bad address for get_entrypoint (%transfer)";
                                      FAILWITH;
                                    }
                                    {};
                                  PUSH mutez 0;
                                };
                              TRANSFER_TOKENS;
                            }
                            {
                              DIP
                                {
                                  CONTRACT %transfer (list (pair address (list (pair address (pair nat nat)))));
                                  IF_NONE
                                    {
                                      PUSH string "bad address for get_entrypoint (%transfer)";
                                      FAILWITH;
                                    }
                                    {};
                                  PUSH mutez 0;
                                };
                              TRANSFER_TOKENS;
                            };
                        }
                        {
                          UNPAIR;
                          SWAP;
                          IF_LEFT
                            {
                              DIP
                                {
                                  CONTRACT %setDelegate (option key_hash);
                                  IF_NONE
                                    {
                                      PUSH string "bad address for get_entrypoint (%setDelegate)";
                                      FAILWITH;
                                    }
                                    {};
                                  PUSH mutez 0;
                                };
                              TRANSFER_TOKENS;
                            }
                            {
                              DIP
                                {
                                  CONTRACT %vest nat;
                                  IF_NONE
                                    {
                                      PUSH string "bad address for get_entrypoint (%vest)";
                                      FAILWITH;
                                    }
                                    {};
                                  PUSH mutez 0;
                                };
                              TRANSFER_TOKENS;
                            };
                        };
                      CONS;
                    };
                }
                {
                  SWAP;
                  DIP
                    {
                      UNIT;
                      EXEC;
                    };
                  SWAP;
                };
            }
            {
              DIP
                {
                  CAR;
                };
              SWAP;
              PAIR;
              NIL operation;
            };
          PAIR;
        };
    };
           `,
      //значение хранилища
      storage: {
              counter: 0,
              threshold: 1,
              keys: ['edpkuAPjD8jVpbDUEQBXUdp1v9eNhLLo3JxUBBMTwWdw7Fm9tnHZTL'],
            },
    })

    //начало развертывания
    console.log('Awaiting confirmation...')
    const contract = await op.contract()
    //отчет о развертывании: количество использованного газа, значение хранилища
    console.log('Gas Used', op.consumedGas)
    console.log('Storage', await contract.storage())
    //хеш операции, по которому можно найти контракт в блокчейн-обозревателе
    console.log('Operation hash:', op.hash)
  } catch (ex) {
    console.error(ex)
  }
}

deploy()

