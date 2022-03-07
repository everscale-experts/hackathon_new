import { BatchOperation, TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';
import { KeyToken } from '@taquito/michelson-encoder/dist/types/tokens/key';
import { b58cencode, char2Bytes, Prefix, prefix } from '@taquito/utils';
const acc = require('./Account.json');

   const RPC_URL = 'https://rpc.hangzhounet.teztnets.xyz';
const CONTRACT = 'KT1SgnWsMaQnvGuZTjrYACQP9wVYyUz1mTfH'; //адрес опубликованного multisig




//const bytes= char2Bytes("0, LLLL:{adresss:'tz1LiBrF9gibgH5Lf6a7gDjoUfSEg6nxPKsz', value:'10'},Nothing") // создаем строку ддля подписи
//console.log(bytes)

// присваиваем переменным обьект с помощью которого будем подписывать строку 
const signer =new InMemorySigner('edsk31hLYrJqTeHqsLPdo1Ab5SKw7PUXUuWBt95UBFkLj3KrW1Dt6x');
const signer1 = new InMemorySigner('edsk3fa8S4vFkgbgb77iozSS1AJTUg8XMbGV14wqqjHko86ACHkHtn')  
// байтовая уже зашифрованная строка, получил с помощью tezos-client
const bytes = '0x05070707070a000000046252be4f0a0000001601c6958d8e2af23b566c14105fa16526dec49d02c10007070001050502000000350320053d036d0743035d0a00000015003a0f681de989b300fab38bd867439115ac622cbf031e0743036a0080dac409034f034d031b'

// подписыаем строку и получаем сигнатуры
const signature = signer.sign(bytes);
const signature1 = signer1.sign(bytes);

// смотрим схему метода контракта 
// const Tezos = new TezosToolkit(RPC_URL);
// console.log(signature);
// Tezos.contract
//   .at(CONTRACT)
//   .then((c) => {
//     let methods = c.parameterSchema.ExtractSignatures();
//     console.log(JSON.stringify(methods));
//   })
//   .catch((error) => console.log(`Error: ${error}`));



export class token_transfer {
    // настраиваем ссылку на публичный узел тестовой сети
    private tezos: TezosToolkit
    rpcUrl: string
  
    constructor(rpcUrl: string) {
      this.tezos = new TezosToolkit(rpcUrl);
      this.rpcUrl = rpcUrl;
  
      //считываем почту, пароль и мнемоническую фразу, из которой можно получить приватный ключ
      this.tezos.setSignerProvider(InMemorySigner.fromFundraiser(acc.email, acc.password, acc.mnemonic.join(' ')));

    }
    public async transfer(contract1: string,) {
      
       const contract = await this.tezos.contract.at(contract1);
       // вызываем метод контракта и пописываем сигнатурами
       //const op = await contract.methods.main('0x05070707070a000000046252be4f0a0000001601c6958d8e2af23b566c14105fa16526dec49d02c10007070001050502000000350320053d036d0743035d0a00000015003a0f681de989b300fab38bd867439115ac622cbf031e0743036a0080dac409034f034d031b',[(await signature).prefixSig, (await signature1).prefixSig]).send();
       const op=await contract.methods.main({
      schema:{
         payload: {
             counter: "0",
             action: {
                 operation: bytes,
                 
             }
         },
         sigs: [
             (await signature).prefixSig,
             (await signature1).prefixSig,
         ]
     }}).send()




       await op.confirmation();
        console.log(op.hash);
      


        
    }
   }




new token_transfer(RPC_URL).transfer(CONTRACT);
  

