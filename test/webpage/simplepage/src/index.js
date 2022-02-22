//import { TONClient, setWasmOptions, abiContract } from 'ton-client-web-js';
import freeton from 'freeton';
import { Account } from '@tonclient/appkit';
import contractPackage from './contracts/TONTokenWallet.js';
import contractPackageRoot from './contracts/RootTokenContract.js';
import contractPackageSM from './contracts/SafeMultisig.js';
import {
  signerKeys,
  TonClient,
  MessageBodyType,
  signerNone,
  //abiContract,
} from "@tonclient/core";
import { libWeb } from '@tonclient/lib-web';
import {
  Address,
  ProviderRpcClient,
  TvmException
} from 'everscale-inpage-provider';

TonClient.useBinaryLibrary(libWeb);

/*Local Storage*/

const broxus_address = localStorage.getItem('broxus_address') || 0;


/* Temporary function for testing */

function addHTML(message) {
  document.body.insertAdjacentHTML("beforeend", `<p>${message}</p>`);
}

/* Contracts(maybe we don't need this) */

const TokenWallet = {
  abi: contractPackage.abi,
  tvc:contractPackage.tvc,
}
const TokenRoot = {
  abi: contractPackageRoot.abi,
  tvc:contractPackageRoot.tvc,
}

/* Auth in EVERCRYSTAL*/

const ever = new ProviderRpcClient();

/* Login in EVERCRYSTAL*/

async function login(){
  const { accountInteraction } = await ever.requestPermissions({
    permissions: ['basic', 'accountInteraction'],
  });
  if (accountInteraction == null) {
    throw new Error('Insufficient permissions');
  }
  localStorage.setItem('broxus_address', accountInteraction.address);

}
window.login = login;

/* Logout in EVERCRYSTAL*/

async function login_out(){
  await ever.disconnect();
}
window.login_out = login_out;

/* Send in EVERCRYSTAL*/

async function send(){
  var form = document.querySelector('#myform');
  var formData = new FormData(form);
  var address = formData.get('address');
  const tokenvalue = parseFloat(formData.get('token')) * 1000000000;
  const send = await ever.sendMessage({
    sender:broxus_address,
    recipient:address,
    amount:tokenvalue.toString(),
    bounce:false,
  })
}
window.send = send;

/* Login in Extraton*/

async function login_extraton(){
  const provider = await new freeton.providers.ExtensionProvider(
    window.freeton,
  );
  //signer = await provider.getSigner();
}
window.login_extraton = login_extraton;


/* Temporary functions for signing via TONSDK */


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
    const tokenvalue = parseFloat(token) * 1000000000;
    console.log(tokenvalue);
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

    const accountroot = new Account(
      TokenRoot,
      {
        signer: signerKeys(keysgen),
        address: "0:7f6225f4b84d9889593fb1d9366e12132b6b0c007db813f17897e33033e9a9ae",
        client
      }
    );
    const wallet_address = await(accountroot.runLocal("getWalletAddress",{pubkey:"0x"+keysgen["public"]}).catch(e => console.log("ERROR:", e)))
    addHTML(`Ваш адрес токена кошелька: ${(wallet_address["decoded"]["output"]["value0"])}`);
    const wallet_address_f = wallet_address["decoded"]["output"]["value0"]
    const tip3create = new Account(
      TokenWallet,
      {
        signer: signerKeys(keysgen),
        address: wallet_address_f,
        client
      }
    );
    const balancedo1 = await(tip3create.runLocal("getBalance",{}).catch(e => console.log("ERROR:", e)))
    addHTML(`Ваш баланс: ${(balancedo1["decoded"]["output"]["value0"])} токенов EVR21`);
    addHTML(`Переводим с вашего кошелька ${wallet_address_f } на кошелек: ${address} в количестве ${token}`);
    const transfer = await(tip3create.run("transfer",{
      answer_addr:wallet_address_f,
      to:address,
      tokens:tokenvalue,
      evers:500000000,
      return_ownership:0,
    }).catch(e => console.log("ERROR:", e)))


  })();
};
window.submitform = submitform;

function balance_check () {
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
    const tokenvalue = parseFloat(token) * 1000000000;
    console.log(tokenvalue);
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



    const accountroot = new Account(
      TokenRoot,
      {
        signer: signerKeys(keysgen),
        address: "0:7f6225f4b84d9889593fb1d9366e12132b6b0c007db813f17897e33033e9a9ae",
        client
      }
    );
    const wallet_address = await(accountroot.runLocal("getWalletAddress",{pubkey:"0x"+keysgen["public"]}).catch(e => console.log("ERROR:", e)))
    addHTML(`Ваш адрес токена кошелька: ${(wallet_address["decoded"]["output"]["value0"])}`);
    const wallet_address_f = wallet_address["decoded"]["output"]["value0"]
    const tip3create = new Account(
      TokenWallet,
      {
        signer: signerKeys(keysgen),
        address: wallet_address_f,
        client
      }
    );
    const balancedo1 = await(tip3create.runLocal("getBalance",{}).catch(e => console.log("ERROR:", e)))
    addHTML(`Ваш баланс: ${(balancedo1["decoded"]["output"]["value0"])/1000000000} токенов EVR21`);
  })();
};
window.balance_check = balance_check;
