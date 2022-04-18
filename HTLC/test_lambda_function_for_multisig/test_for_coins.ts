import {TezosToolkit, MANAGER_LAMBDA} from '@taquito/taquito';
import {InMemorySigner} from '@taquito/signer';
import {char2Bytes} from '@taquito/utils';
import { Schema } from "@taquito/michelson-encoder";



const RPC_URL = 'https://hangzhounet.smartpy.io'; // rpc тестнета

const CONTRACT = 'KT1V8J2fBQdVMWRZuMj2BXjgiWDoqrCkqsMs';// адрес опубликованного контракта multisig
const amount = '1100000';
const destination = 'KT19xGcNnDwB8uYy18k93FjFv9KNDEivbq87';
const id_proposal = 12;
const htlc_contract = 'KT1LzFMMsi5kp8vq81rxEprzKNoJEeJbWH7W';

// присваиваем переменным обьект с помощью которого будем подписывать транзакции
const signer = new InMemorySigner('edskRrZRXU2vgyFgMt94BKY2Fv1bQCFLrgwo2DwseLoYDvpjZeNohKC1afZtRT55NhhLfAj46PGVL1jAy8WEJZ1m4n3F2Kkc7i');
const signer1 = new InMemorySigner('edskS7C5R3C2ooTjrCtrz8VeYALfuhGQGLp5siTTdDHchgJmxL1CGfA7Ug777tuzKN7bDqhs4RSFU3FozZSVpykWJpzgQqjvtF');


export class token_transfer {
    // настраиваем ссылку на публичный узел тестовой сети
    private tezos: TezosToolkit
    rpcUrl: string

    constructor(rpcUrl: string) {
        this.tezos = new TezosToolkit(rpcUrl);
        this.rpcUrl = rpcUrl;


        this.tezos.setSignerProvider(signer); // подписываем все транзакции которые идут дальше с помощью signer

    }


    public async transfer(contract1: string,) {


        const contract = await this.tezos.contract.at(contract1);
        console.log("Transactions started")
        const op_1 = await contract.methods.transfer_mutez_proposal(
            amount,
            htlc_contract
        ).send();
        
        console.log("Awaiting confirmation...")
        await op_1.confirmation();
        console.log(op_1.hash);

        //предлагаем сделать трансфер токенов
        const op = await contract.methods.lambda_proposal(
            [
              {
                "prim": "DROP"
              },
              {
                "prim": "PUSH",
                "args": [
                  {
                    "prim": "address"
                  },
                  {
                    "string": htlc_contract // адоесс контракта htlc
                  }
                ]
              },
              {
                "prim": "CONTRACT",
                "annots": [
                  "%createLock"
                ],
                "args": [
                  {
                    "prim": "pair",
                    "args": [
                      {
                        "prim": "address",
                        "annots": [
                          "%dest1"
                        ]
                      },
                      {
                        "prim": "bytes",
                        "annots": [
                          "%hash1"
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                "prim": "IF_NONE",
                "args": [
                  [
                    {
                      "prim": "PUSH",
                      "args": [
                        {
                          "prim": "string"
                        },
                        {
                          "string": "Not a entrypoint"
                        }
                      ]
                    },
                    {
                      "prim": "FAILWITH"
                    }
                  ],
                  []
                ]
              },
              {
                "prim": "NIL",
                "args": [
                  {
                    "prim": "operation"
                  }
                ]
              },
              {
                "prim": "SWAP"
              },
              {
                "prim": "PUSH",
                "args": [
                  {
                    "prim": "mutez"
                  },
                  {
                    "int": "0"
                  }
                ]
              },
              {
                "prim": "PUSH",
                "args": [
                  {
                    "prim": "bytes"
                  },
                  {
                    "bytes": "" // hash секрета
                  }
                ]
              },
              {
                "prim": "PUSH",
                "args": [
                  {
                    "prim": "address"
                  },
                  {
                    "string": destination// адресс получателя
                  }
                ]
              },
              {
                "prim": "PAIR"
              },
              {
                "prim": "TRANSFER_TOKENS"
              },
              {
                "prim": "CONS"
              }
            ]
          ).send()


        console.log("Awaiting confirmation...")
        await op.confirmation();
        console.log(op.hash);
        

        // соглашаемся с предложенной транзакцией первый раз
        const op1= contract.methods.vote_proposal(
            // номер транзакции с которой человек соглашается и пишет true, либо не соглашается и пишет false
            //ОБЯЗАТЕЛЬНО поменять перед выполнением транзакции на новое значение!!!
            id_proposal,  // это число можно взять если посмотрев текущий storage контракта.
            'true'
        ).send()

        console.log("Awaiting confirmation...")
        await (await op1).confirmation();
        console.log((await op1).hash);
        const op_2= contract.methods.vote_proposal(
            // номер транзакции с которой человек соглашается и пишет true, либо не соглашается и пишет false
            //ОБЯЗАТЕЛЬНО поменять перед выполнением транзакции на новое значение!!!
            id_proposal+1,  // это число можно взять если посмотрев текущий storage контракта.
            'true'
        ).send()

        console.log("Awaiting confirmation...")
        await (await op_2).confirmation();
        console.log((await op_2).hash);

        // меняем подписывающего человека с signer на signer1
        // и все транзакции которые идут за этой строкой будут подписаны с помощью signer1
        this.tezos.setSignerProvider(signer1);
        const contract2 = await this.tezos.contract.at(contract1);
        // соглашаемся с предложенной транзакцией второй раз
        const op2=contract2.methods.vote_proposal(
            id_proposal,  //ОБЯЗАТЕЛЬНО поменять перед выполнением транзакции на новое значение!!!
            'true'
        ).send()

        console.log("Awaiting confirmation...")
        await (await op2).confirmation();
        console.log((await op2).hash);

        const op_3=contract2.methods.vote_proposal(
            id_proposal+1,  //ОБЯЗАТЕЛЬНО поменять перед выполнением транзакции на новое значение!!!
            'true'
        ).send()

        console.log("Awaiting confirmation...")
        await (await op_3).confirmation();
        console.log((await op_3).hash);

        // выполняем транзакцию, после того, как на ней собралось минимальное количество подписей
        // это может подписать любой владелец кошелька
        const op3=contract.methods.execute_proposal(
            //ОБЯЗАТЕЛЬНО поменять перед выполнением транзакции на новое значение!!!
            id_proposal          // номер транзакции которую мы выполняем
            // это число можно взять если посмотрев текущий storage контракта
            ).send()
        console.log("Awaiting confirmation...")
        await (await op3).confirmation();
        console.log((await op3).hash);

        const op_4=contract.methods.execute_proposal(
            //ОБЯЗАТЕЛЬНО поменять перед выполнением транзакции на новое значение!!!
            id_proposal+1,          // номер транзакции которую мы выполняем
            // это число можно взять если посмотрев текущий storage контракта
            ).send()
        console.log("Awaiting confirmation...")
        await (await op_4).confirmation();
        console.log((await op_4).hash);
        console.log('Complete transaction!!!!')
    }
}


new token_transfer(RPC_URL).transfer(CONTRACT);


