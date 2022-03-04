import {
  default as getProvider,
  PROVIDERS,
  UTILS
} from "https://everscale-connect.svoi.dev/everscale/getProvider.mjs";
import TIP31Root from "https://everscale-connect.svoi.dev/everscale/contracts/TIP31Root.mjs";

window.getProvider = getProvider;
window.PROVIDERS = PROVIDERS;
window.UTILS = UTILS;
let EVER = null;
const provider = localStorage.getItem('provider') || 0;



/*Connect with EVERWallet
------------------------------*/
async function connect_everwallet(){
  const DEFAULT_WALLET = PROVIDERS.EVERWallet;
  console.log(DEFAULT_WALLET);
  const EVER = await getProvider({}, DEFAULT_WALLET);
  console.log(EVER);
  await EVER.requestPermissions();
  localStorage.setItem('provider', JSON.stringify(EVER));

  //await EVER.start();
}
window.connect_everwallet = connect_everwallet;
/*----------------------------*/

/*----------------------------*/
/*Send tokens with everscalewallet
------------------------------*/
async function send_everscalewallet(){
  const EVER = await getProvider({}, PROVIDERS.EverscaleWallet);
  await EVER.start();
  const token = await (new TIP31Root(EVER)).init('0:87d795ddc35363a7374eb43a7f2edeca30d79a736470f6ada169bcfc58851a2c');
  console.log(token);
  const CURRENT_USER_WALLET_ADDRESS = (await EVER.getWallet()).address;
  console.log(CURRENT_USER_WALLET_ADDRESS);
  const wallet = await token.getWalletByMultisig(CURRENT_USER_WALLET_ADDRESS);
  var form = document.querySelector('#myform');
  var formData = new FormData(form);
  var address = formData.get('address');
  const AMOUNT = 1;
  const DESTINATION_WALLET = await token.getWalletAddressByMultisig(address);
  const transferPayload = await wallet.transferPayload(DESTINATION_WALLET, AMOUNT);
  const transfer = await EVER.walletTransfer(wallet.address, 1000000000, transferPayload, true)



}
window.send_everscalewallet = send_everscalewallet;

/*----------------------------*/



/*
const DEFAULT_WALLET = PROVIDERS.EVERWallet;
//  const DEFAULT_WALLET = PROVIDERS.EverscaleWallet;


let EVER = null;
try {

//Initialize provider
EVER = await getProvider({

}, DEFAULT_WALLET);
await EVER.requestPermissions();
await EVER.start();
} catch (e) {
console.log(e);
alert('Everscale connection error ' + e.message);
}
window.EVER = EVER;*/

//Ton punks contract
/*let tip31 = await (new TIP31Root(EVER)).init('0:87d795ddc35363a7374eb43a7f2edeca30d79a736470f6ada169bcfc58851a2c');
console.log(tip31);
window.tip31 = tip31;;

let tokenInfo = await tip31.getTokenInfo()

console.log(tokenInfo);

alert('Token name ' + tokenInfo.name); */
/*const WHISKEY_TOKEN_ADDRESS = '0:b95d8f510a029401dda2b1d3b9ec1b656238fa19e96d0b4dbcc41ee82821b6ab';
const CURRENT_USER_WALLET_ADDRESS = (await EVER.getWallet()).address;
let token = await (new TIP31Root(EVER)).init(WHISKEY_TOKEN_ADDRESS);
console.log(token);
let wallet = await token.getWalletByMultisig(CURRENT_USER_WALLET_ADDRESS);
console.log(wallet);
console.log('User balance', await wallet.getBalance());

const AMOUNT = 1;
const DESTINATION_MULTISIG = '0:129dc05b739d8ab9161ac710b92e1e3dcfb32e284a509ed8180e978554b1e16b';
const DESTINATION_WALLET = await token.getWalletAddressByMultisig(DESTINATION_MULTISIG);
let transferPayload = await wallet.transferPayload(DESTINATION_WALLET, AMOUNT);
await EVER.walletTransfer(wallet.address, 1e9, transferPayload, true);*/



/*let wallet = await tip31.getWalletByMultisig((await EVER.getWallet()).address);
if(await wallet.isDeployed()){
alert('Wallet is deployed');
} else {
alert('Wallet is not deployed');
}
*/
