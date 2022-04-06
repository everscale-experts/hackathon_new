import {
  TonClient,
  signerSigningBox,
  signerNone,
  signerKeys,
  KeyPair,
  accountForExecutorUninit,
} from '@tonclient/core';

import { libWeb } from '@tonclient/lib-web';
import { Account } from '@tonclient/appkit';

//import AbstractProvider from '../AbstractProvider';
//import { ContractNames } from '../../../constants';

TonClient.useBinaryLibrary(libWeb);

class TonSDK {
  client!: TonClient;

  private mnemonic!: string;

  signerHandle: number = 0;

  // contracts: {
  //   rootToken?: any;
  //   exchanger?: any;
  //   controller?: any;
  // };

  keys: any;

  constructor(initParams?: { mnemonic?: string }) {
    // this.contracts = {};

    this.client = new TonClient({
      network: {
        endpoints: ['net.ton.dev'], // dev
        // message_processing_timeout: 200000,
      },
      abi: {
        // message_expiration_timeout: 200000,
      },
    });

    this.init(initParams?.mnemonic);
  }


  async keyPairFromPhrase(input: string) {
    const HD_PATH = "m/44'/396'/0'/0/0";
    const SEED_PHRASE_WORD_COUNT = input.split(' ').length;
    const SEED_PHRASE_DICTIONARY_ENGLISH = 1;

    // should check 12 or 24 word by raise on another
    const result = await this.client.crypto.mnemonic_derive_sign_keys({
      dictionary: SEED_PHRASE_DICTIONARY_ENGLISH,
      word_count: SEED_PHRASE_WORD_COUNT,
      phrase: input,
      path: HD_PATH,
    });
    return result;
  }

}

export default TonSDK;
