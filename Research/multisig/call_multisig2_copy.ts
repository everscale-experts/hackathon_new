import {BatchOperation, TezosToolkit, MANAGER_LAMBDA} from '@taquito/taquito';
import {InMemorySigner} from '@taquito/signer';
import {KeyToken} from '@taquito/michelson-encoder/dist/types/tokens/key';
import {b58cencode, char2Bytes, Prefix, prefix} from '@taquito/utils';

const acc = require('./Account.json');

const RPC_URL = 'https://rpc.hangzhounet.teztnets.xyz';
//const CONTRACT = 'KT1SYmWUEZu13tycy5cLEaYuDtoG6Zf6DsxL'; //адрес опубликованного multisig
const CONTRACT = 'KT1M1Y1bw52xydrn2q2zQ64qDc1zFbn8UEBZ'


// присваиваем переменным обьект с помощью которого будем подписывать строку
const signer = new InMemorySigner('edsk31hLYrJqTeHqsLPdo1Ab5SKw7PUXUuWBt95UBFkLj3KrW1Dt6x');
//const signer1 = new InMemorySigner('edsk3fa8S4vFkgbgb77iozSS1AJTUg8XMbGV14wqqjHko86ACHkHtn')
// // байтовая уже зашифрованная строка, получил с помощью tezos-client
//const bytes = '0x05070707070a000000046252be4f0a0000001601c6958d8e2af23b566c14105fa16526dec49d02c10007070001050502000000340320053d036d0743035d0a00000015003a0f681de989b300fab38bd867439115ac622cbf031e0743036a0080897a034f034d031b'

// подписыаем строку и получаем сигнатуры
// const signature = signer.sign(bytes);
// const signature1 = signer1.sign(bytes);


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
        console.log("Transaction strated")
        const contract = await this.tezos.contract.at(contract1);

        // Utility function that mimics the PAIR operation of michelson
        // file deepcode ignore no-any: any is good enough
        const pair = ({data, type}: any, value: any) => {
            return {
                data: {
                    prim: 'Pair',
                    args: [{"string": value}, data]
                },
                type: {
                    prim: 'pair',
                    args: [{prim: "address"}, type]
                }
            }
        }

        // Packing the data that need to be sign by each party of the multi-sig
        // The data passed to this step is specific to this multi-sig implementation
        // file deepcode ignore no-any: any is good enough
        const {packed} = await this.tezos.rpc.packData(pair({
            data: {
                prim: 'Pair',
                args: [
                    {int: "2"},
                    {
                        prim: 'Left',
                        args: [MANAGER_LAMBDA.transferImplicit("tz1Qw2LiqMNwJXKKzimAVMWj5W467Hrd6dP7", 0.5)]
                    }
                ]
            } as any,
            type: {
                "prim": "pair",
                "args":
                    [{
                        "prim": "nat",
                        "annots": ["%counter"]
                    },
                        {
                            "prim": "or",
                            "args":
                                [{
                                    "prim": "lambda",
                                    "args":
                                        [{"prim": "unit"},
                                            {
                                                "prim": "list",
                                                "args":
                                                    [{
                                                        "prim":
                                                            "operation"
                                                    }]
                                            }],
                                    "annots":
                                        ["%operation"]
                                },
                                    {
                                        "prim": "pair",
                                        "args":
                                            [{
                                                "prim": "nat",
                                                "annots":
                                                    ["%threshold"]
                                            },
                                                {
                                                    "prim": "list",
                                                    "args":
                                                        [{"prim": "key"}],
                                                    "annots":
                                                        ["%keys"]
                                                }],
                                        "annots":
                                            ["%change_keys"]
                                    }],
                            "annots": [":action"]
                        }],
                "annots": [":payload"]
            }
        }, contract1))

        // const signature1 = signer1.sign(packed, new Uint8Array())
        const signature = signer.sign(packed, new Uint8Array());
        console.log(packed);

        // До этого места работает.
        const op = await contract.methods.main(
            // Counter
            '2',
            // Sub function
            'operation',
            // Action
            MANAGER_LAMBDA.transferImplicit("tz1Qw2LiqMNwJXKKzimAVMWj5W467Hrd6dP7", 0.5),
            // Signature list
            [(await signature).prefixSig]
        ).send()
        console.log("Awaiting confirmation...")
        await op.confirmation();
        console.log(op.hash);
    }
}


new token_transfer(RPC_URL).transfer(CONTRACT);


