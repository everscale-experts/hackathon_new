//import { TONClient, setWasmOptions, abiContract } from 'ton-client-web-js';

import { Account } from '@tonclient/appkit';
import contractPackage from './contracts/TONTokenWallet.js';
import {
  signerKeys,
  TonClient,
  MessageBodyType,
  signerNone,
  //abiContract,
} from "@tonclient/core"
import { libWeb } from '@tonclient/lib-web';

TonClient.useBinaryLibrary(libWeb);


function addHTML(message) {
  document.body.insertAdjacentHTML("beforeend", `<p>${message}</p>`);
}

var address = document.querySelector('#address');
var token = document.querySelector('#token');
var seed = document.querySelector('#seed');
var form = document.querySelector('#myform');

function submitform () {
  (async () => {

    const client = new TonClient({
        network: {
            endpoints: ['net.ton.dev']
        }
    });
  var form = document.querySelector('#myform');
  var formData = new FormData(form);
  var address = formData.get('address');
  var token = formData.get('token');
  var seed = formData.get('seed');
  const SEED_PHRASE_WORD_COUNT = 12;
  const SEED_PHRASE_DICTIONARY_ENGLISH = 1;
  const HD_PATH = "m/44'/396'/0'/0/0";
  const keysgen = (await client.crypto.mnemonic_derive_sign_keys({
                  dictionary: SEED_PHRASE_DICTIONARY_ENGLISH,
                  word_count: SEED_PHRASE_WORD_COUNT,
                  phrase: seed,
                  path: HD_PATH,
              }).catch(e => console.log("ERROR:", e)));


  addHTML(`Ваши ключи:`);
  addHTML(`Публичный: ${keysgen["public"]}`);
  addHTML(`Приватный: ${keysgen["secret"]}`);

  const TokenWallet = {
    abi: contractPackage.abi,
    tvc:contractPackage.tvc,
  }
  console.log(TokenWallet)
  const tip3create = new Account(
    TokenWallet,
    {
      signer: signerKeys(keysgen),
      address: "0:fac2714d40492bf96ed0ff4231a41d274af3b2a36283debce112434a9ceb9647",
      client
    }
  );
  console.log(tip3create)

  const balancedo1 = await(tip3create.runLocal("getBalance",{}).catch(e => console.log("ERROR:", e)))
  addHTML(`Ваш баланс: ${(balancedo1["decoded"]["output"]["value0"])} токенов EVR21`);



})();
};
window.submitform = submitform;

/*window.addEventListener('load', () => {
(async () => {
// Adding an HTML update function
setWasmOptions({
addHTML,
});
let createStart = Date.now();
// creating a TONClient wit a net.ton.dev connection
const client = await TONClient.create({
servers: ['net.ton.dev']
});
// requesting TONClient creation time stamp
addHTML(`Client creation time: ${(Date.now() - createStart)}`);
// displaying the current client version
addHTML(`Client version: ${await client.config.getVersion()}`);
addHTML(`Client connected to: ${await client.config.data.servers}`);
const queryStart = Date.now();
// requesting top 10 accounts sorted by balance from net.ton.dev/graphql
const accounts = await client.queries.accounts.query({}, 'id balance', [{path:'balance', direction:'DESC'}], 10);
//addHTML(`Query time: ${(Date.now() - queryStart)}`);
// displaying the data
///addHTML(`<table>${accounts.map(x => `<tr><td>${x.id}</td><td>${BigInt(x.balance)}</td></tr>`).join('')}</table>`);
// displaying the data received time stamp
//addHTML(`Now is: ${new Date()}`);
})();
});
*/
