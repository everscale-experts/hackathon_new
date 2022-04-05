"use strict";
exports.__esModule = true;
import {
  TonClient,
  signerSigningBox,
  signerNone,
  signerKeys,
  KeyPair,
  accountForExecutorUninit,
} from './@tonclient/core';

import { Account } from "./@tonclient/appkit"
import { libNode } from './@tonclient/lib-node';
TonClient.useBinaryLibrary(libNode);

var address = document.querySelector('#address');
var token = document.querySelector('#token');
var seed = document.querySelector('#seed');
var form = document.querySelector('#myform');
var client = TonClient({
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
form.onsubmit = function () {
    var formData = new FormData(form);
    var address = formData.get('address');
    var token = formData.get('token');
    var seed = formData.get('seed');
    console.log(address);
    console.log(token);
    console.log(seed);
    return false; // prevent reload
};
