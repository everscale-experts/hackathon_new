"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var core_1 = require("@tonclient/core");
var lib_web_1 = require("@tonclient/lib-web");
//import AbstractProvider from '../AbstractProvider';
//import { ContractNames } from '../../../constants';
core_1.TonClient.useBinaryLibrary(lib_web_1.libWeb);
var TonSDK = /** @class */ (function () {
    function TonSDK(initParams) {
        // this.contracts = {};
        this.signerHandle = 0;
        this.client = new core_1.TonClient({
            network: {
                endpoints: ['net.ton.dev']
            },
            abi: {
            // message_expiration_timeout: 200000,
            }
        });
        this.init(initParams === null || initParams === void 0 ? void 0 : initParams.mnemonic);
    }
    /*async getAddress(publicKey = this.getPublicKey(false)): Promise<string> {
      const { address } = this;

      if (!address) {
        await this.whenReady();
        if (!publicKey) {
          return '0';
        }
        const rawContract = TonSDK.getContractRaw('controller');
        const deployOptions = {
          abi: {
            type: 'Contract',
            value: rawContract.abi,
          },
          deploy_set: {
            tvc: rawContract.tvc,

            initial_pubkey: publicKey,
          },
          call_set: {
            function_name: 'constructor',
          },
          signer: {
            type: 'External',
            public_key: publicKey,
          },
        } as const;

        const result = await this.client.abi
          .encode_message(deployOptions)
          .catch((e) => {
            // eslint-disable-next-line no-console
            console.error(deployOptions);
            // eslint-disable-next-line no-console
            console.error(e);
          });

        if (!result) {
          // eslint-disable-next-line no-console
          console.error('Not able to detect address');
          throw new Error('Not able to detect address');
        }

        // eslint-disable-next-line no-console
        console.log(`Future address of the contract will be: ${result.address}`);
        this.address = result.address;
      }

      return this.address;
    }
  */
    /*  async init(mnemonic?: string) {
        await TonSDK.timeout(1000);

        if (!mnemonic && localStorage.getItem('tonium_mnemonic')) {
          // eslint-disable-next-line no-param-reassign
          mnemonic = localStorage.getItem('tonium_mnemonic') as string;
        }

        if (mnemonic) {
          const keys = await this.keyPairFromPhrase(mnemonic);
          this.keys = signerKeys(keys as KeyPair);
          localStorage.setItem('tonSdkPublic', this.keys.keys.public);
          // console.log('this.keys: ', localStorage.getItem('tonSdkPublic'));
          localStorage.setItem('tonium_mnemonic', mnemonic);
        } else {
          // todo grab from local storage and dencode it
          // todo ask pasword from user to decode mnemonic
          // below from SDK to operate on mnemonic
          //       mnemonic_words – Prints the list of words from the specified dictionary
          // mnemonic_from_random – Generates a random mnemonic from the specified dictionary and word count
          // mnemonic_from_entropy – Generates mnemonic from pre-generated entropy
          // mnemonic_verify – The phrase supplied will be checked for word length and validated according to the checksum specified in BIP0039.
          // mnemonic_derive_sign_keys – Validates the seed phrase, generates master key and then derives the key pair from the master key and the specified path
          // hdkey_xprv_from_mnemonic – Generates an extended master private key that will be the root for all the derived keys
        }

        // const signingBox = await signerSigningBox((await this.client.crypto.register_signing_box(signingBox)).handle);
        // const signingBox = await this.client.crypto.register_signing_box({
        //   get_public_key: async () => {
        //     return {
        //       public_key: '0',
        //     };
        //   },
        //   sing: async (params: any) => {
        //     // todo maybe here
        //   },
        // });
        // this.signerHandle = signingBox.handle;

        // const contracts = ['rootToken', 'exchanger', 'controller'] as const;

        // const network = await this.getNetwork();
        // contracts.forEach((key) => {
        //   const rawContract = TonSDK.getContractRaw(key);
        //   if (!rawContract) {
        //     // eslint-disable-next-line no-console
        //     return console.error('Contract not found', key);
        //   }
        //   this.contracts[key] = new Account(
        //     {
        //       abi: rawContract.abi,
        //       tvc: rawContract.tvc,
        //     },
        //     {
        //       signer: this.keys,
        //       address: rawContract.address[network],
        //       client: this.client,
        //     },
        //   );
        //   return true;
        // });

        this.nowReady();
      }

      // eslint-disable-next-line class-methods-use-this
      logout() {
        localStorage.removeItem('tonium_mnemonic');
        return true;
      }

      async getCodeFromTvc(tvc: string) {
        const codeFromTvc = await this.client.boc.get_code_from_tvc({
          tvc,
        });
        return codeFromTvc.code;
      }

      async getContractAtAddress(
        contract: keyof typeof ContractNames,
        address?: any,
        initialParams?: {},
      ) {
        const rawContract = TonSDK.getContractRaw(contract);
        if (!rawContract) {
          // eslint-disable-next-line no-console
          console.error('Contract not found', contract);
          return false;
        }
        const network = await this.getNetwork();

        const realAddres =
          address !== 'undefined' ? address : rawContract.address[network as any];
        const tonContract = new Account(
          {
            abi: rawContract.abi,
            tvc: rawContract.tvc,
          },
          {
            signer: this.keys,
            address: realAddres,
            client: this.client,
            initData: initialParams,
          },
        );
        return tonContract;
      }
    */
    TonSDK.prototype.keyPairFromPhrase = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var HD_PATH, SEED_PHRASE_WORD_COUNT, SEED_PHRASE_DICTIONARY_ENGLISH, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        HD_PATH = "m/44'/396'/0'/0/0";
                        SEED_PHRASE_WORD_COUNT = input.split(' ').length;
                        SEED_PHRASE_DICTIONARY_ENGLISH = 1;
                        return [4 /*yield*/, this.client.crypto.mnemonic_derive_sign_keys({
                                dictionary: SEED_PHRASE_DICTIONARY_ENGLISH,
                                word_count: SEED_PHRASE_WORD_COUNT,
                                phrase: input,
                                path: HD_PATH
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    return TonSDK;
}());
exports["default"] = TonSDK;
