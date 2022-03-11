//import { TONClient, setWasmOptions, abiContract } from 'ton-client-web-js';
import freeton from 'freeton';
import { Account } from '@tonclient/appkit';
import contractPackage from './contracts/TONTokenWallet.js';
import contractPackageRoot from './contracts/RootTokenContract.js';
import contractPackageSM from './contracts/SafeMultisig.js';
import contractPackageWallet from './contracts/TIP3Wallet.js';
import acc from './contracts/Account.js'

import {
  signerKeys,
  TonClient,
  MessageBodyType,
  signerNone,
  abiContract,
} from "@tonclient/core";
import { libWeb } from '@tonclient/lib-web';
import {
  Address,
  ProviderRpcClient,
  TvmException
} from 'everscale-inpage-provider';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { TezosToolkit } from '@taquito/taquito'
import { InMemorySigner } from '@taquito/signer'
//import { TempleWallet } from '@temple-wallet/dapp';

TonClient.useBinaryLibrary(libWeb);
const Tezos = new TezosToolkit("https://mainnet-tezos.giganode.io");
const wallet = new BeaconWallet({ name: "EVERTEZ Bridge" });
//Tezos.setWalletProvider(wallet);
const contract = "KT19LybspUkGTZxGMSKVRMDcpoRS24JapqH1";
const amount = 10;
const sender = "tz1Nt3vKhbZpVdCrqgxR9sZDFqUty2h7SMRM";
const receiver = 'tz1KfoG6WnXeeRxipcmvod34BQX2KUu34VFY';


const transferCommentAbi = {
  "ABI version": 2,
  "functions": [
    {
      "name": "transfer",
      "id": "0x00000000",
      "inputs": [{"name":"comment","type":"bytes"}],
      "outputs": []
    }
  ],
  "events": [],
  "data": []
}

async function getCommentPayload(){
  const client = new TonClient({
    network: {
      endpoints: ['net.ton.dev']
    }
  });
  const text = "tz1KfoG6WnXeeRxipcmvod34BQX2KUu34VFY!";
  const payload = (await client.abi.encode_message_body({
    abi: abiContract(transferCommentAbi),
    call_set: {
      function_name: "transfer",
      input: {
        comment: Buffer.from(text).toString("hex"),
      },
    },
    is_internal: true,
    signer: signerNone(),
  })).body;
  console.log(payload)
}
window.getCommentPayload = getCommentPayload;



async function send_with_tezos(){
  const tezos = new TezosToolkit('https://hangzhounet.api.tez.ie');
  console.log(tezos);
  tezos.setSignerProvider(InMemorySigner.fromFundraiser(acc.email, acc.password, acc.mnemonic.join(' ')))
  tezos.contract
  .at(contract) //обращаемся к контракту по адресу
  .then((contract) => {
    console.log(`Sending ${amount} from ${sender} to ${receiver}...`)
    //обращаемся к точке входа transfer, передаем ей адреса отправителя и получателя, а также количество токенов для отправки.
    return contract.methods.transfer([{
      from_: sender,
      txs:[
        {
          to_:receiver,
          token_id: 1,
          amount: amount
        }
      ]
    }]).send()

  })
  .then((op) => {
    console.log(`Awaiting for ${op.hash} to be confirmed...`)
    return op.confirmation(1).then(() => op.hash) //ждем одно подтверждение сети
  })
  .then((hash) => console.log(`Hash: https://hangzhou.tzstats.com/${hash}`)) //получаем хеш операции
    .catch((error) => console.log(`Error: ${JSON.stringify(error, null, 2)}`))
  }

  window.send_with_tezos = send_with_tezos;



  async function logout_beacon(){
    await wallet.clearActiveAccount();
    console.log("disconnect");
  }
  window.logout_beacon = logout_beacon;


  async function login_with_tezos(){

    const auth = await wallet.requestPermissions({
      network: {
        type: 'mainnet' | 'granadanet' | 'hangzhounet' | 'custom',
      },
    });
    console.log(auth);
    //const AMOUNT = 2 //количество токенов для отправки. Можете ввести другое число

    /*Tezos.wallet
    .at('KT1KR2ft6aRthjkcvTW9FrEPRQoxrfuTpark')
    .then((contract) => contract.methods.transfer([{
    from_: "tz1eGERZcJeTuBy5HxbTr8j3PzJdPrSUhHmn",
    txs:[
    {
    to_:`tz1LiBrF9gibgH5Lf6a7gDjoUfSEg6nxPKsz`,
    token_id: 1,
    amount: 2
  }
]
}]).send()

})
.then((op) => {
console.log(`Awaiting for ${op.hash} to be confirmed...`)
return op.confirmation(1).then(() => op.hash) //ждем одно подтверждение сети
})
.then((hash) => console.log(`Hash: https://hangzhou.tzstats.com/${hash}`)) //получаем хеш операции
.catch((error) => console.log(`Error: ${JSON.stringify(error, null, 2)}`))*/

/*const userAddress = await wallet.getPKH();
console.log(userAddress)
Tezos.setWalletProvider(wallet);*/
/*Tezos.wallet
.transfer({ to: 'tz1NhNv9g7rtcjyNsH8Zqu79giY5aTqDDrzB', amount: 0.2 })
.send()
.then((op) => {
println(`Hash: ${op.opHash}`);

op.confirmation()
.then((result) => {
console.log(result);
if (result.completed) {
println('Transaction correctly processed!');
} else {
println('An error has occurred');
}
})
.catch((err) => println(err));
});*/

}
window.login_with_tezos = login_with_tezos;

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
const TIP3Wallet = {
  abi: contractPackageWallet.abi,
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
  localStorage.removeItem('broxus_address');
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
  const provider = await new freeton.providers.ExtensionProvider(window.freeton);
  const signer =  await provider.getSigner();
  const network = signer.network.server;
  const address = signer.wallet.address;
  var form = document.querySelector('#myform');
  var formData = new FormData(form);
  var address_recepient = formData.get('address');
  const tokenvalue = parseFloat(formData.get('token')) * 1000000000;

  console.log(signer.network.server);
  console.log(signer.wallet.address);


  const trasnfer = await signer.wallet.transfer(
    address_recepient,
    tokenvalue.toString(),
  );
  console.log(trasnfer)

  //const signer = await provider.getSigner();
}
window.login_extraton = login_extraton;


/* Login in Everwallet*/

async function send_everwallet(){
  const client = await getTONWeb();
  window.client = client;
  console.log(client);
  const walletInfo = await client.accounts.getWalletInfo();
  console.log(walletInfo);
  const account = await client.accounts.getAccount();
  console.log(account);
  var form = document.querySelector('#myform');
  var formData = new FormData(form);
  var address_recepient = formData.get('address');
  const tokenvalue = parseFloat(formData.get('token')) * 1000000000;


  const send = await client.accounts.walletTransfer(
    account.public,
    walletInfo.address,
    address_recepient,
    tokenvalue.toString(),
  );

  console.log(send);

  //const signer = await provider.getSigner();
}
window.send_everwallet = send_everwallet;





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
