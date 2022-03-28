import { BatchOperation, TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';


const RPC_URL = 'https://rpc.hangzhounet.teztnets.xyz';
const CONTRACT = 'KT1WGc5s9WwGHi5TUGAGvX9dSP1sbD8qdEc6'; //адрес опубликованного контракта
const id_transaction = 2;
const id_token=3;
const amount=100000;
const HTLC_adress='tz1i5w4BTmwB51efYjcziq6G5eJC5ra2gqHF';

const signer = new InMemorySigner('edskRdkUMmmBorjeetbGiU4cjZ1pbewF6ZmBMj7jCEWxA6pmgTooYTCStHZFitsEgnut7V3YpKt8ptgT1hgK5DuLS4baqXHQXj');

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
    public async transfer() {
      
      const contract = await this.tezos.wallet.at(CONTRACT);
      
        const storage: any = await contract.storage();
        const proposal = await storage.proposals.get(id_transaction);
        if (proposal==undefined) {
          const batch = await this.tezos.wallet.batch()
          .withContractCall(contract.methods.transfer_token_proposal(
            'KT1X7iHDQB6iQvejCkwVqE2Nk78fdrcbw66s',
            id_token,
            amount,
            HTLC_adress,
          ));
          batch.send();
          const batchOp = await batch.send();
           console.log("Operation hash:", batchOp.opHash);
        }
        console.log(JSON.stringify(proposal, null, 2));
     

        

  
        
    }
   }


new token_transfer(RPC_URL).transfer()
