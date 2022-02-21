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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultGiverContract = exports.Account = exports.AccountType = exports.AccountError = void 0;
const core_1 = require("@tonclient/core");
class AccountError extends Error {
    static missingTVC() {
        return new AccountError("Can't calculate deploy params: missing required TVC.");
    }
}
exports.AccountError = AccountError;
/**
 * Current type of the account.
 */
var AccountType;
(function (AccountType) {
    /**
     * Account exists in the blockchain but without smart contract.
     */
    AccountType[AccountType["uninit"] = 0] = "uninit";
    /**
     * Account exists in the blockchain with smart contract.
     */
    AccountType[AccountType["active"] = 1] = "active";
    /**
     * Account exists in the blockchain but it had frozen.
     */
    AccountType[AccountType["frozen"] = 2] = "frozen";
    /**
     * Account is missing in the blockchain.
     */
    AccountType[AccountType["nonExist"] = 3] = "nonExist";
})(AccountType = exports.AccountType || (exports.AccountType = {}));
/**
 * Object to deal with specified account using specified signer (owner).
 *
 * Account instance can be bound to account address
 * or account deploy parameters that uniquely identifies
 * account address.
 */
class Account {
    /**
     * Constructs account instance.
     *
     * @param contract Contract package containing abi and optional tvc data.
     * @param options Account instance options.
     */
    constructor(contract, options) {
        var _a, _b, _c, _d, _e;
        this.syncLastTransLt = null;
        this.cachedBoc = null;
        this.subscriptions = null;
        this.contract = contract;
        this.client = (_a = options === null || options === void 0 ? void 0 : options.client) !== null && _a !== void 0 ? _a : core_1.TonClient.default;
        this.abi = (0, core_1.abiContract)(contract.abi);
        this.signer = (_b = options === null || options === void 0 ? void 0 : options.signer) !== null && _b !== void 0 ? _b : (0, core_1.signerNone)();
        this.address = (_c = options === null || options === void 0 ? void 0 : options.address) !== null && _c !== void 0 ? _c : null;
        this.initData = (_d = options === null || options === void 0 ? void 0 : options.initData) !== null && _d !== void 0 ? _d : null;
        this.useCachedState = (_e = options === null || options === void 0 ? void 0 : options.useCachedState) !== null && _e !== void 0 ? _e : false;
    }
    /**
     * Returns the giver instance assigned for specified client instance.
     * Or `null` if no giver is associated with this client yet.
     *
     * @param client Client instance looking for.
     */
    static findGiverForClient(client) {
        var _a;
        return (_a = this.giversByClient.find(x => x.client === client)) === null || _a === void 0 ? void 0 : _a.giver;
    }
    /**
     * Assigns specified giver as a default for specified client instance.
     * If client already has default giver it will be reassigned.
     *
     * @param client Client instance.
     * @param giver New giver instance or `null` if the default giver for
     * this client must be removed.
     */
    static setGiverForClient(client, giver) {
        const i = this.giversByClient.findIndex(x => x.client === client);
        if (i >= 0) {
            if (giver) {
                this.giversByClient[i].giver = giver;
            }
            else {
                this.giversByClient.splice(i, 1);
            }
        }
        else if (giver) {
            this.giversByClient.push({
                client,
                giver,
            });
        }
    }
    static createGiver(client) {
        return __awaiter(this, void 0, void 0, function* () {
            const giverKeys = yield getDefaultGiverKeys(client);
            const giverAddress = yield getDefaultGiverAddress(client, giverKeys);
            const giver = new Account(exports.DefaultGiverContract, {
                client,
                address: giverAddress,
                signer: (0, core_1.signerKeys)(giverKeys),
            });
            return {
                address: giverAddress,
                sendTo: (address, value) => __awaiter(this, void 0, void 0, function* () {
                    yield giver.run("sendTransaction", {
                        dest: address,
                        value,
                        bounce: false,
                    });
                }),
            };
        });
    }
    /**
     * Returns the default giver for specified client instance.
     * If no giver assigned yet then new one will be created,
     * assigned and returned.
     *
     * @param client Client instance.
     */
    static getGiverForClient(client) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = this.findGiverForClient(client);
            if (existing) {
                return existing;
            }
            const giver = yield this.createGiver(client);
            this.giversByClient.push({
                client,
                giver,
            });
            return giver;
        });
    }
    /**
     * Returns address of the account.
     *
     * Uses address specified in constructor options
     * or calculates it from deploy data provided in constructor.
     */
    getAddress() {
        return __awaiter(this, void 0, void 0, function* () {
            let address = this.address;
            if (address === null) {
                const deployParams = this.getParamsOfDeployMessage({
                    initFunctionName: null,
                });
                address = (yield this.client.abi.encode_message(deployParams)).address;
                this.address = address;
            }
            return address;
        });
    }
    /**
     * Returns params for encoding deploy message.
     * @param options Message encoding options.
     */
    getParamsOfDeployMessage(options) {
        var _a;
        if (!this.contract.tvc) {
            throw AccountError.missingTVC();
        }
        const params = {
            abi: this.abi,
            signer: this.signer,
            deploy_set: {
                tvc: this.contract.tvc,
            },
        };
        if (this.initData) {
            params.deploy_set.initial_data = this.initData;
        }
        if ((options === null || options === void 0 ? void 0 : options.initFunctionName) !== null) {
            params.call_set = {
                function_name: (_a = options === null || options === void 0 ? void 0 : options.initFunctionName) !== null && _a !== void 0 ? _a : "constructor",
            };
            if ((options === null || options === void 0 ? void 0 : options.initInput) !== undefined) {
                params.call_set.input = options.initInput;
            }
        }
        return params;
    }
    /**
     * Calculates detailed deploy fees.
     */
    calcDeployFees(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const deployParams = yield this.getParamsOfDeployMessage(options);
            const message = yield this.client.abi.encode_message(deployParams);
            const result = yield this.client.tvm.run_executor({
                account: (0, core_1.accountForExecutorUninit)(),
                abi: this.abi,
                message: message.message,
            });
            return result.fees;
        });
    }
    /**
     * Deploys account into network
     * @param options
     */
    deploy(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const deployParams = this.getParamsOfDeployMessage(options);
            const useGiver = options === null || options === void 0 ? void 0 : options.useGiver;
            const giver = useGiver === true ? (yield Account.getGiverForClient(this.client)) : useGiver;
            this.address = (yield this.client.abi.encode_message(deployParams)).address;
            if (giver) {
                yield giver.sendTo(this.address, 10000000000);
            }
            const result = yield this.client.processing.process_message({
                message_encode_params: deployParams,
                send_events: false,
            });
            this.needSyncWithTransaction(result.transaction);
            return result;
        });
    }
    /**
     * Emulate deploy
     * @param options
     */
    deployLocal(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const deployParams = this.getParamsOfDeployMessage(options);
            const { address, message, } = yield this.client.abi.encode_message(deployParams);
            const result = yield this.client.tvm.run_executor({
                account: (0, core_1.accountForExecutorUninit)(),
                abi: this.abi,
                message,
                return_updated_account: true,
            });
            this.address = address;
            this.cachedBoc = result.account;
            return result;
        });
    }
    /**
     * Calculates detailed fees for specified run parameters.
     *
     * @param functionName Name of the function according to the ABI.
     * @param input Object with function parameters (function parameters).
     */
    calcRunFees(functionName, input) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = yield this.client.abi.encode_message({
                address: yield this.getAddress(),
                abi: this.abi,
                signer: this.signer,
                call_set: {
                    function_name: functionName,
                    input,
                },
            });
            let result;
            result = yield this.client.tvm.run_executor({
                account: (0, core_1.accountForExecutorAccount)(yield this.boc()),
                abi: this.abi,
                message: message.message,
            });
            return result.fees;
        });
    }
    /**
     * Process message on network and returns detailed information
     * about results including produced transaction and messages.
     *
     * @param functionName Name of the function according to the ABI.
     * @param input Object with function parameters (function parameters).
     * @param options Run options.
     */
    run(functionName, input, options) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const result = (yield this.client.processing.process_message({
                message_encode_params: {
                    address: yield this.getAddress(),
                    abi: this.abi,
                    signer: (_a = options === null || options === void 0 ? void 0 : options.signer) !== null && _a !== void 0 ? _a : this.signer,
                    call_set: {
                        function_name: functionName,
                        input,
                    },
                },
                send_events: false,
            }));
            this.needSyncWithTransaction(result.transaction);
            return result;
        });
    }
    /**
     * Evaluates message on local TVM and returns decoded output.
     *
     * @param functionName Name of the function according to the ABI.
     * @param input Object with function parameters (function input).
     * @param options Run options.
     */
    runLocal(functionName, input, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = yield this.client.abi.encode_message({
                address: yield this.getAddress(),
                abi: this.abi,
                signer: this.signer,
                call_set: {
                    function_name: functionName,
                    input,
                },
            });
            let result;
            if (options === null || options === void 0 ? void 0 : options.performAllChecks) {
                result = yield this.client.tvm.run_executor({
                    account: (0, core_1.accountForExecutorAccount)(yield this.boc()),
                    abi: this.abi,
                    message: message.message,
                    return_updated_account: true,
                });
            }
            else {
                result = (yield this.client.tvm.run_tvm({
                    account: yield this.boc(),
                    abi: this.abi,
                    message: message.message,
                    return_updated_account: true,
                }));
            }
            if (result.account) {
                this.cachedBoc = result.account;
            }
            return result;
        });
    }
    needSyncWithTransaction(transaction) {
        if (!transaction.aborted && transaction.lt) {
            this.syncLastTransLt = transaction.lt;
            this.cachedBoc = null;
        }
    }
    /**
     * Returns raw data of the account in form of BOC.
     * Fetches boc data from network and caches it in private field.
     * `runLocal` updates cached boc.
     * `run` drops cached boc.
     * This function syncs fetching boc with last `run` or `deploy`
     * so fetched boc
     */
    boc() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.cachedBoc && this.useCachedState) {
                return this.cachedBoc;
            }
            const address = yield this.getAddress();
            const net = this.client.net;
            if (this.syncLastTransLt) {
                const accounts = yield net.query_collection({
                    collection: "accounts",
                    filter: {
                        id: { eq: address },
                        last_trans_lt: { ge: this.syncLastTransLt },
                    },
                    result: "boc",
                });
                if (accounts.result.length > 0) {
                    const boc = accounts.result[0].boc;
                    this.syncLastTransLt = null;
                    this.cachedBoc = boc;
                    return boc;
                }
            }
            const boc = (yield net.wait_for_collection({
                collection: "accounts",
                filter: { id: { eq: this.address } },
                result: "boc",
                timeout: 1000,
            })).result.boc;
            this.cachedBoc = boc;
            return boc;
        });
    }
    /**
     * Drops all cached and local data.
     */
    refresh() {
        this.cachedBoc = null;
    }
    /**
     * Returns parsed data of the account.
     */
    getAccount() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return (yield this.client.boc.parse_account({
                    boc: yield this.boc(),
                })).parsed;
            }
            catch (error) {
                if (error.code !== 603) {
                    throw error;
                }
            }
            return {
                acc_type: AccountType.nonExist,
            };
        });
    }
    subscribeAccount(fields, listener) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.subscribe("accounts", { id: { eq: yield this.getAddress() } }, fields, listener);
        });
    }
    subscribeTransactions(fields, listener) {
        return __awaiter(this, void 0, void 0, function* () {
            const address = yield this.getAddress();
            yield this.subscribe("transactions", {
                account_addr: { eq: address },
                status: { eq: 5 },
            }, fields, listener);
        });
    }
    subscribeMessages(fields, listener) {
        return __awaiter(this, void 0, void 0, function* () {
            const address = yield this.getAddress();
            yield this.subscribe("messages", {
                status: { eq: 5 },
                src: { eq: address },
                OR: {
                    status: { eq: 5 },
                    dst: { eq: address },
                },
            }, fields, listener);
        });
    }
    decodeMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield core_1.TonClient.default.abi.decode_message({
                abi: this.abi,
                message,
            });
        });
    }
    decodeMessageBody(body, isInternal) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield core_1.TonClient.default.abi.decode_message_body({
                abi: this.abi,
                body,
                is_internal: isInternal,
            });
        });
    }
    getBalance() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.getAccount()).balance;
        });
    }
    subscribe(collection, filter, fields, listener) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const prevSubscription = this.subscriptions && this.subscriptions.get(collection);
            if (prevSubscription) {
                (_a = this.subscriptions) === null || _a === void 0 ? void 0 : _a.delete(collection);
                yield this.client.net.unsubscribe(prevSubscription);
            }
            else if (!this.subscriptions) {
                this.subscriptions = new Map();
            }
            const subscription = yield this.client.net.subscribe_collection({
                collection,
                filter,
                result: fields,
            }, ((params, responseType) => {
                if (responseType === 100) {
                    listener(params.result);
                }
            }));
            (_b = this.subscriptions) === null || _b === void 0 ? void 0 : _b.set(collection, subscription);
        });
    }
    /**
     * Free all internal resources related to this instance
     * and allocated inside core.
     *
     * It is a good practice to call this method when you have finished
     * with this Account object.
     *
     * Note that this instance still fully operable.
     * So you can continue to work with this instance.
     */
    free() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.subscriptions) {
                const subscriptions = this.subscriptions.values();
                this.subscriptions = null;
                for (const subscription of subscriptions) {
                    yield this.client.net.unsubscribe(subscription);
                }
            }
        });
    }
}
exports.Account = Account;
Account.giversByClient = [];
function getEnv(name) {
    const globalEval = eval;
    try {
        return globalEval(`process.env.${name}`);
    }
    catch (_a) {
        return undefined;
    }
}
function getDefaultGiverKeys(client) {
    return __awaiter(this, void 0, void 0, function* () {
        const definedSecret = getEnv("TON_GIVER_SECRET");
        if (definedSecret) {
            const definedKeys = yield client.crypto.nacl_sign_keypair_from_secret_key({
                secret: definedSecret,
            });
            definedKeys.secret = definedKeys.secret.substr(0, 64);
            return definedKeys;
        }
        // noinspection SpellCheckingInspection
        return {
            "public": "2ada2e65ab8eeab09490e3521415f45b6e42df9c760a639bcf53957550b25a16",
            "secret": "172af540e43a524763dd53b26a066d472a97c4de37d5498170564510608250c3",
        };
    });
}
function getDefaultGiverAddress(client, keys) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const definedAddress = getEnv("TON_GIVER_ADDRESS");
        if (definedAddress) {
            return definedAddress;
        }
        return (yield client.abi.encode_message({
            abi: (0, core_1.abiContract)(exports.DefaultGiverContract.abi),
            deploy_set: {
                tvc: (_a = exports.DefaultGiverContract.tvc) !== null && _a !== void 0 ? _a : "",
            },
            signer: (0, core_1.signerKeys)(keys),
        })).address;
    });
}
// noinspection SpellCheckingInspection
exports.DefaultGiverContract = {
    abi: {
        "ABI version": 2,
        header: ["time", "expire"],
        functions: [
            {
                name: "sendTransaction",
                inputs: [
                    {
                        "name": "dest",
                        "type": "address",
                    },
                    {
                        "name": "value",
                        "type": "uint128",
                    },
                    {
                        "name": "bounce",
                        "type": "bool",
                    },
                ],
                outputs: [],
            },
            {
                name: "getMessages",
                inputs: [],
                outputs: [
                    {
                        components: [
                            {
                                name: "hash",
                                type: "uint256",
                            },
                            {
                                name: "expireAt",
                                type: "uint64",
                            },
                        ],
                        name: "messages",
                        type: "tuple[]",
                    },
                ],
            },
            {
                name: "upgrade",
                inputs: [
                    {
                        name: "newcode",
                        type: "cell",
                    },
                ],
                outputs: [],
            },
            {
                name: "constructor",
                inputs: [],
                outputs: [],
            },
        ],
        data: [],
        events: [],
    },
    tvc: "te6ccgECGgEAA9sAAgE0BgEBAcACAgPPIAUDAQHeBAAD0CAAQdgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAIm/wD0pCAiwAGS9KDhiu1TWDD0oQkHAQr0pCD0oQgAAAIBIAwKAfz/fyHtRNAg10nCAZ/T/9MA9AX4an/4Yfhm+GKOG/QFbfhqcAGAQPQO8r3XC//4YnD4Y3D4Zn/4YeLTAAGOEoECANcYIPkBWPhCIPhl+RDyqN4j+EL4RSBukjBw3rry4GUh0z/THzQx+CMhAb7yuSH5ACD4SoEBAPQOIJEx3rMLAE7y4Gb4ACH4SiIBVQHIyz9ZgQEA9EP4aiMEXwTTHwHwAfhHbpLyPN4CASASDQIBWBEOAQm46Jj8UA8B/vhBbo4S7UTQ0//TAPQF+Gp/+GH4Zvhi3tFwbW8C+EqBAQD0hpUB1ws/f5NwcHDikSCONyMjI28CbyLIIs8L/yHPCz8xMQFvIiGkA1mAIPRDbwI0IvhKgQEA9HyVAdcLP3+TcHBw4gI1MzHoXwPIghB3RMfighCAAAAAsc8LHyEQAKJvIgLLH/QAyIJYYAAAAAAAAAAAAAAAAM8LZoEDmCLPMQG5lnHPQCHPF5Vxz0EhzeIgyXH7AFswwP+OEvhCyMv/+EbPCwD4SgH0AMntVN5/+GcAxbkWq+f/CC3Rxt2omgQa6ThAM/p/+mAegL8NT/8MPwzfDFHDfoCtvw1OADAIHoHeV7rhf/8MTh8Mbh8Mz/8MPFvfCNJeRnJuPwzcXwAaPwhZGX//CNnhYB8JQD6AGT2qj/8M8AIBIBUTAde7Fe+TX4QW6OEu1E0NP/0wD0Bfhqf/hh+Gb4Yt76QNcNf5XU0dDTf9/XDACV1NHQ0gDf0SIiInPIcc8LASLPCgBzz0AkzxYj+gKAac9Acs9AIMki+wBfBfhKgQEA9IaVAdcLP3+TcHBw4pEggUAJKOLfgjIgG7n/hKIwEhAYEBAPRbMDH4at4i+EqBAQD0fJUB1ws/f5NwcHDiAjUzMehfA18D+ELIy//4Rs8LAPhKAfQAye1Uf/hnAgEgFxYAx7jkYYdfCC3Rwl2omhp/+mAegL8NT/8MPwzfDFvamj8IXwikDdJGDhvXXlwMvwAfCFkZf/8I2eFgHwlAPoAZPaqfAeQfYIQaHaPdqn4ARh8IWRl//wjZ4WAfCUA+gBk9qo//DPACAtoZGAAtr4QsjL//hGzwsA+EoB9ADJ7VT4D/IAgAdacCHHAJ0i0HPXIdcLAMABkJDi4CHXDR+S8jzhUxHAAJDgwQMighD////9vLGS8jzgAfAB+EdukvI83o",
};
//# sourceMappingURL=account.js.map