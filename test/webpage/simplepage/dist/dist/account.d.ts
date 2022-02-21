import { ParamsOfEncodeMessage, ResultOfProcessMessage, ResultOfRunExecutor, Signer, Abi, AbiContract, TonClient, TransactionFees } from "@tonclient/core";
/**
 * Options for an account instance
 */
export declare type AccountOptions = {
    /**
     * Initial data
     */
    initData?: object;
    /**
     * Default is `signerNone`
     */
    signer?: Signer;
    /**
     * If not specified will be calculated on contracts init state.
     */
    address?: string;
    /**
     * If not specified the Account.getDefaultClient() will be used.
     */
    client?: TonClient;
    /**
     * If true, appkit aggressively caches account state.
     * Useful for running `runLocal` and `runLocal` functions in tests.
     */
    useCachedState?: boolean;
};
/**
 * Run options
 */
export declare type AccountRunOptions = {
    /**
     * Is not specified then this.signer
     */
    signer?: Signer;
};
/**
 * Run Local options
 */
export declare type AccountRunLocalOptions = {
    /**
     * If `true` then performs all checks and calculations as node do.
     * If `false` then simplified execution is used.
     */
    performAllChecks?: boolean;
};
/**
 * Object that can be used to send some value before
 * deploying account.
 */
export interface AccountGiver {
    address: string;
    sendTo(address: string, value: number): Promise<void>;
}
/**
 * Deploy options
 */
export declare type AccountDeployOptions = {
    /**
     * Function name that will be run on deploy. Special values:
     * - `undefined` (omitted): library will use `constructor` as a function name.
     * - `null`: library will not produce message body (no init function invocation).
     */
    initFunctionName?: string | null;
    /**
     * Parameters of init function.
     * Note: library ignores this parameter if `initFunctionName` is `null`.
     */
    initInput?: object;
    /**
     * Giver to be used to send amount of value to deploying address
     * before deploying.
     *
     * If `true` then Account.getDefaultGiver() will be used.
     * If omitted then application must prepay address
     * using own logic.
     */
    useGiver?: true | AccountGiver;
};
/**
 * Smart Contract Package
 *
 * This object contains information about smart contract class.
 */
export declare type ContractPackage = {
    /**
     * ABI of smart contract
     */
    abi: AbiContract;
    /**
     * Compiled artifact of the smart contract.
     * This field contains BOC with code and initial data (init state).
     * If it is missing, then application can't deploy account of this contracts.
     */
    tvc?: string;
};
export declare class AccountError extends Error {
    static missingTVC(): AccountError;
}
/**
 * Current type of the account.
 */
export declare enum AccountType {
    /**
     * Account exists in the blockchain but without smart contract.
     */
    uninit = 0,
    /**
     * Account exists in the blockchain with smart contract.
     */
    active = 1,
    /**
     * Account exists in the blockchain but it had frozen.
     */
    frozen = 2,
    /**
     * Account is missing in the blockchain.
     */
    nonExist = 3
}
/**
 * Object to deal with specified account using specified signer (owner).
 *
 * Account instance can be bound to account address
 * or account deploy parameters that uniquely identifies
 * account address.
 */
export declare class Account {
    private static giversByClient;
    /**
     * Returns the giver instance assigned for specified client instance.
     * Or `null` if no giver is associated with this client yet.
     *
     * @param client Client instance looking for.
     */
    static findGiverForClient(client: TonClient): AccountGiver | undefined;
    /**
     * Assigns specified giver as a default for specified client instance.
     * If client already has default giver it will be reassigned.
     *
     * @param client Client instance.
     * @param giver New giver instance or `null` if the default giver for
     * this client must be removed.
     */
    static setGiverForClient(client: TonClient, giver: AccountGiver | null): void;
    private static createGiver;
    /**
     * Returns the default giver for specified client instance.
     * If no giver assigned yet then new one will be created,
     * assigned and returned.
     *
     * @param client Client instance.
     */
    static getGiverForClient(client: TonClient): Promise<AccountGiver>;
    /**
     * Contract package used for this account.
     */
    readonly contract: ContractPackage;
    /**
     * Client instance used to perform all account related tasks.
     */
    readonly client: TonClient;
    /**
     * Abi of this account.
     */
    readonly abi: Abi;
    /**
     * Signer used to sign messages addressed to this account.
     */
    readonly signer: Signer;
    /**
     * Initial data used to form the deploy parameter.
     */
    readonly initData: object | null;
    /**
     * Allow Appkit to use the cached account state, safe for local tests only.
     */
    readonly useCachedState: boolean;
    private address;
    private syncLastTransLt;
    private cachedBoc;
    private subscriptions;
    /**
     * Constructs account instance.
     *
     * @param contract Contract package containing abi and optional tvc data.
     * @param options Account instance options.
     */
    constructor(contract: ContractPackage, options?: AccountOptions);
    /**
     * Returns address of the account.
     *
     * Uses address specified in constructor options
     * or calculates it from deploy data provided in constructor.
     */
    getAddress(): Promise<string>;
    /**
     * Returns params for encoding deploy message.
     * @param options Message encoding options.
     */
    getParamsOfDeployMessage(options?: AccountDeployOptions): ParamsOfEncodeMessage;
    /**
     * Calculates detailed deploy fees.
     */
    calcDeployFees(options?: AccountDeployOptions): Promise<TransactionFees>;
    /**
     * Deploys account into network
     * @param options
     */
    deploy(options?: AccountDeployOptions): Promise<ResultOfProcessMessage>;
    /**
     * Emulate deploy
     * @param options
     */
    deployLocal(options?: AccountDeployOptions): Promise<ResultOfProcessMessage>;
    /**
     * Calculates detailed fees for specified run parameters.
     *
     * @param functionName Name of the function according to the ABI.
     * @param input Object with function parameters (function parameters).
     */
    calcRunFees(functionName: string, input: object): Promise<TransactionFees>;
    /**
     * Process message on network and returns detailed information
     * about results including produced transaction and messages.
     *
     * @param functionName Name of the function according to the ABI.
     * @param input Object with function parameters (function parameters).
     * @param options Run options.
     */
    run(functionName: string, input: object, options?: AccountRunOptions): Promise<ResultOfProcessMessage>;
    /**
     * Evaluates message on local TVM and returns decoded output.
     *
     * @param functionName Name of the function according to the ABI.
     * @param input Object with function parameters (function input).
     * @param options Run options.
     */
    runLocal(functionName: string, input: object, options?: AccountRunLocalOptions): Promise<ResultOfRunExecutor>;
    private needSyncWithTransaction;
    /**
     * Returns raw data of the account in form of BOC.
     * Fetches boc data from network and caches it in private field.
     * `runLocal` updates cached boc.
     * `run` drops cached boc.
     * This function syncs fetching boc with last `run` or `deploy`
     * so fetched boc
     */
    boc(): Promise<string>;
    /**
     * Drops all cached and local data.
     */
    refresh(): void;
    /**
     * Returns parsed data of the account.
     */
    getAccount(): Promise<any>;
    subscribeAccount(fields: string, listener: (account: any) => void | Promise<void>): Promise<void>;
    subscribeTransactions(fields: string, listener: (transaction: any) => void | Promise<void>): Promise<void>;
    subscribeMessages(fields: string, listener: (message: any) => void | Promise<void>): Promise<void>;
    decodeMessage(message: string): Promise<any>;
    decodeMessageBody(body: string, isInternal: boolean): Promise<import("@tonclient/core").DecodedMessageBody>;
    getBalance(): Promise<string>;
    subscribe(collection: string, filter: any, fields: string, listener: (data: any) => void | Promise<void>): Promise<void>;
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
    free(): Promise<void>;
}
export declare const DefaultGiverContract: ContractPackage;
//# sourceMappingURL=account.d.ts.map