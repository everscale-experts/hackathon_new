import { TezosToolkit } from '@taquito/taquito'
import { importKey } from '@taquito/signer'
import { MatrixClientStore } from '@airgap/beacon-sdk/dist/cjs/matrix-client/MatrixClientStore'

const { Tezos } = require('@taquito/taquito')
const fs = require('fs')

const provider = 'https://florencenet.api.tez.ie'
const RPC = "https://rpc.hangzhounet.teztnets.xyz";
async function deploy() {
 
  
  const tezos = new TezosToolkit(RPC)
  
  await importKey(
    tezos,
    "rzfxnqsg.skbbgtec@teztnets.xyz", //почта
    "6Uvib1sHKC", //пароль
    [
      "gas",
		"travel",
		"scissors",
		"lab",
		"choose",
		"auction",
		"false",
		"upon",
		"icon",
		"mom",
		"proof",
		"dismiss",
		"name",
		"custom",
		"meat",
    ].join(' '),
    "f3d1c92086b49db7e51ed8727facc129d419e499" //приватный ключ
  )

  
    const op = await tezos.contract.originate({
      // считываем код из файла token.json
      code: JSON.parse(fs.readFileSync('./token.json').toString()),
      // задаем состояние хранилища на языке Michelson. Замените оба адреса на адрес своего аккаунта в тестовой сети,
      // а числа — на количество токенов, которое вы хотите выпустить
      init: '(Pair (Pair { Elt "tz1Nt3vKhbZpVdCrqgxR9sZDFqUty2h7SMRM" (Pair { Elt "tz1Nt3vKhbZpVdCrqgxR9sZDFqUty2h7SMRM" 500 } 500) } { Elt "" 0x68747470733a2f2f676973742e67697468756275736572636f6e74656e742e636f6d2f4d616b73696d6b696e612f36313835393037366431373031626439316233356639346362313437636235312f7261772f313630643964396561356664613038623138396632666466346334346635376137643835626131312f666131322d6d657461646174612e6a736f6e }) 500)',
    })

    //начало развертывания
    console.log('Awaiting confirmation...')
    const contract = await op.contract()
    //отчет о развертывании: количество использованного газа, значение хранилища
    console.log('Gas Used', op.consumedGas)
    //console.log('Storage', await contract.storage())
    //хеш операции, по которому можно найти контракт в блокчейн-обозревателе
    console.log('Operation hash:', op.hash)
    console.log("Adress: ",contract.address)
  
  }


deploy()
