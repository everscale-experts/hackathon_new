import {TezosToolkit, MANAGER_LAMBDA} from '@taquito/taquito';
import {InMemorySigner} from '@taquito/signer';
import {char2Bytes} from '@taquito/utils';
import { Schema } from "@taquito/michelson-encoder";





const RPC_URL = 'https://hangzhounet.smartpy.io'; // rpc тестнета

const CONTRACT = 'KT1JMWkKAtB8eNMTYSAmkRuS3xjKHdkgTVGW';// адрес опубликованного контракта


// присваиваем переменным обьект с помощью которого будем подписывать транзакции
const signer = new InMemorySigner('edskRdkUMmmBorjeetbGiU4cjZ1pbewF6ZmBMj7jCEWxA6pmgTooYTCStHZFitsEgnut7V3YpKt8ptgT1hgK5DuLS4baqXHQXj');
const signer1 = new InMemorySigner('edsk3kvk241t24haGeub1yJhrMHuFzTLo4uLc9gCbvhS91atVr4TTZ')


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
        console.log("Transaction strated")
        // предлагаем сделать трансфер токенов
        const op = await contract.methods.lambda_proposal(
            [{"prim":"DROP"},{"prim":"PUSH","args":[{"prim":"address"},{"string":"KT1Exj7HLktuik8JiKtUavzsHB9heThHUQSf"}]},{"prim":"CONTRACT","annots":["%createLock"],"args":[{"prim":"pair","args":[{"prim":"pair","args":[{"prim":"pair","args":[{"prim":"nat","annots":["%amount_tokens"]},{"prim":"address","annots":["%dest1"]}]},{"prim":"pair","args":[{"prim":"bytes","annots":["%hash1"]},{"prim":"nat","annots":["%id_tokens"]}]}]},{"prim":"address","annots":["%tokenAddress"]}]}]},{"prim":"IF_NONE","args":[[{"prim":"PUSH","args":[{"prim":"string"},{"string":"Not a entrypoint"}]},{"prim":"FAILWITH"}],[]]},{"prim":"NIL","args":[{"prim":"operation"}]},{"prim":"SWAP"},{"prim":"PUSH","args":[{"prim":"mutez"},{"int":"0"}]},{"prim":"PUSH","args":[{"prim":"address"},{"string":"KT19xGcNnDwB8uYy18k93FjFv9KNDEivbq87"}]},{"prim":"PUSH","args":[{"prim":"nat"},{"int":"1"}]},{"prim":"PUSH","args":[{"prim":"bytes"},{"bytes":"ff7a7aff"}]},{"prim":"PAIR"},{"prim":"PUSH","args":[{"prim":"address"},{"string":"KT19xGcNnDwB8uYy18k93FjFv9KNDEivbq87"}]},{"prim":"PUSH","args":[{"prim":"nat"},{"int":"1000"}]},{"prim":"PAIR"},{"prim":"PAIR"},{"prim":"PAIR"},{"prim":"TRANSFER_TOKENS"},{"prim":"CONS"}]
        ).send()
        

        console.log("Awaiting confirmation...")
        await op.confirmation();
        console.log(op.hash);

        // соглашаемся с предложенной транзакцией первый раз
        // const op1= contract.methods.vote_proposal(
        //     // номер транзакции с которой человек соглашается и пишет true, либо не соглашается и пишет false
        //     //ОБЯЗАТЕЛЬНО поменять перед выполнением транзакции на новое значение!!!
        //     '1',  // это число можно взять если посмотрев текущий storage контракта.
        //     'true'
        // ).send()

        // console.log("Awaiting confirmation...")
        // await (await op1).confirmation();
        // console.log((await op1).hash);

        // // меняем подписывающего человека с signer на signer1
        // // и все транзакции которые идут за этой строкой будут подписаны с помощью signer1
        // this.tezos.setSignerProvider(signer1);
        // const contract2 = await this.tezos.contract.at(contract1);
        // // соглашаемся с предложенной транзакцией второй раз
        // const op2=contract2.methods.vote_proposal(
        //     '1',  //ОБЯЗАТЕЛЬНО поменять перед выполнением транзакции на новое значение!!!
        //     'true'
        // ).send()

        // console.log("Awaiting confirmation...")
        // await (await op2).confirmation();
        // console.log((await op2).hash);
        // // выполняем транзакцию, после того, как на ней собралось минимальное количество подписей
        // // это может подписать любой владелец кошелька
        // const op3=contract.methods.execute_proposal(
        //     //ОБЯЗАТЕЛЬНО поменять перед выполнением транзакции на новое значение!!!
        //     '1'          // номер транзакции которую мы выполняем
        //     // это число можно взять если посмотрев текущий storage контракта
        //     ).send()
        // console.log("Awaiting confirmation...")
        // await (await op3).confirmation();
        // console.log((await op3).hash);
        // console.log('Complete transaction!!!!')
    }
}


new token_transfer(RPC_URL).transfer(CONTRACT);


