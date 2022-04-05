import {
  TonClient,
  signerSigningBox,
  signerNone,
  signerKeys,
  KeyPair,
  accountForExecutorUninit,
} from '@tonclient/core';

import { Account } from "@tonclient/appkit"
import { libNode } from '@tonclient/lib-node';
TonClient.useBinaryLibrary(libNode);


const address = document.querySelector('#address') as HTMLInputElement;
const token = document.querySelector('#token') as HTMLInputElement;
const seed = document.querySelector('#seed') as HTMLInputElement;
const form: HTMLFormElement = document.querySelector('#myform');

const client = new TonClient({
    network: {
        endpoints: ['net.ton.dev']
    }
});

/*export async function keyPairFromPhrase() {
    const HD_PATH = "m/44'/396'/0'/0/0";
    const SEED_PHRASE_WORD_COUNT = address.split(' ').length;
    const SEED_PHRASE_DICTIONARY_ENGLISH = 1;

    // should check 12 or 24 word by raise on another
    const result = await this.client.crypto.mnemonic_derive_sign_keys({
      dictionary: SEED_PHRASE_DICTIONARY_ENGLISH,
      word_count: SEED_PHRASE_WORD_COUNT,
      phrase: address,
      path: HD_PATH,
    });
    return console.log(result);
  }*/

form.onsubmit = () => {
    const formData = new FormData(form);

    const address = formData.get('address') as string;
    const token = formData.get('token') as string;
    const seed = formData.get('seed') as string;

    console.log(address);
    console.log(token);
    console.log(seed);

    return false; // prevent reload
  };
