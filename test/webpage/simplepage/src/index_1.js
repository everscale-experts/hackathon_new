import {
  Address,
  ProviderRpcClient,
  TvmException
} from 'everscale-inpage-provider';
import freeton from 'freeton';


const ever = new ProviderRpcClient();
const wallet_address = localStorage.getItem('wallet_address') || 0;

/* Login in EVERCRYSTAL*/

export async function login(){
  const { accountInteraction } = await ever.requestPermissions({
    permissions: ['basic', 'accountInteraction'],
  });
  if (accountInteraction == null) {
    throw new Error('Insufficient permissions');
  }
  localStorage.setItem('wallet_address', accountInteraction.address);
  var d = new Date();
  d.setTime(d.getTime() + (1*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = 'wallet_address' + "=" + accountInteraction.address+ ";" + expires + ";path=/";
}
window.login = login;

/* Logout in EVERCRYSTAL*/

export async function login_out(){
  await ever.disconnect();
  localStorage.removeItem('wallet_address');
}
window.login_out = login_out;


export async function login_extraton(){
  const provider = await new freeton.providers.ExtensionProvider(window.freeton);
  const signer =  await provider.getSigner();
  console.log(signer)
  const network = await signer.network.server;
  console.log(network)
  const address = await signer.wallet.address;
  console.log(address)

  localStorage.setItem('wallet_address', address);

  //const signer = await provider.getSigner();
}
window.login_extraton = login_extraton;


export async function send(){
  const wallet_address = localStorage.getItem('wallet_address') || 0;
  const send = await ever.sendMessage({
    sender:wallet_address,
    recipient:"0:129dc05b739d8ab9161ac710b92e1e3dcfb32e284a509ed8180e978554b1e16b",
    amount:"10000000000",
    bounce:false,
  })
}
window.send = send;
