import { BatchOperation, TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';


const RPC_URL = 'https://rpc.hangzhounet.teztnets.xyz';
const CONTRACT = 'KT1WGc5s9WwGHi5TUGAGvX9dSP1sbD8qdEc6'; //адрес мультисига 
const id_transaction = 10; // id транзакции совпадает со счетчиком htlc контракта 
const id_token=3;    // id токена перевод которого булет выполнен берем из htlc контракта 
const amount=100000;  // количество токенов в меньших единицах токена берем из htlc контракта 
const HTLC_adress='tz1i5w4BTmwB51efYjcziq6G5eJC5ra2gqHF'; // адресс получателя токенов (htlc контракт)
// привытный ключь релэя с помощью которго будет выполнено подписание транзакции 
const signer = new InMemorySigner('edskRdkUMmmBorjeetbGiU4cjZ1pbewF6ZmBMj7jCEWxA6pmgTooYTCStHZFitsEgnut7V3YpKt8ptgT1hgK5DuLS4baqXHQXj');

export class token_transfer {
    // настраиваем ссылку на публичный узел тестовой сети
    private tezos: TezosToolkit;
    rpcUrl: string;
  
    constructor(rpcUrl: string) {
      this.tezos = new TezosToolkit(rpcUrl);
      this.rpcUrl = rpcUrl;
  
      //присваем то кем будут подписаны последующие вызовы методы контракта 
      this.tezos.setSignerProvider(signer);
    }
    public async transfer() {
      
      const contract = await this.tezos.wallet.at(CONTRACT);
      
        const storage: any = await contract.storage();
        const proposal = await storage.proposals.get(id_transaction);
        console.log(JSON.stringify(proposal, null, 2));
        // проверяем есть такой пропосал или нет 
        if (proposal==undefined) {
          // если нет то создаем пропозал 
          const op1= contract.methods.transfer_token_proposal(
            'KT1X7iHDQB6iQvejCkwVqE2Nk78fdrcbw66s', // адресс контракта токенов один и тот же, так как все токены будут на нем
            id_token, 
            amount,
            HTLC_adress,
          ).send();
          console.log('Hash: ',(await op1).opHash);
          // ждем подтверждения транзакции 
          console.log((await (await op1).confirmation(1)).completed); // ждем подтверждения транзакции
          
        }
        
        //подписываем пропозал 
        const op2 = contract.methods.vote_proposal(id_transaction,true).send();
        console.log('Hash: ',(await op2).opHash);
        console.log((await (await op2).confirmation(1)).completed);// ждем подтверждения транзакции
        //пытаемся отправить транзакцию 
        const op3 = contract.methods.execute_proposal(id_transaction).send();
        console.log('Hash: ',(await op3).opHash);
   
        
        
    }
   }


new token_transfer(RPC_URL).transfer()
