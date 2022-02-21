import { TezosToolkit, Subscription, OperationContent, OpKind } from '@taquito/taquito'
import { importKey } from '@taquito/signer';

interface IAccount {
    pkh: string
    mnemonic: string[]
    email: string
    password: string
    amount: string
    activation_code: string
}

export class Tezos {
  private tezos: TezosToolkit
  private rpcUrl: string
  private account: IAccount
  private subscription: Subscription<OperationContent> = null;

  constructor(rpcUrl: string, account: IAccount) {
    this.rpcUrl = rpcUrl
    this.tezos = new TezosToolkit(this.rpcUrl)
    this.account = account;

    this.tezos.setProvider({ 
      config: { 
        shouldObservableSubscriptionRetry: true, 
        streamerPollingIntervalMilliseconds: 15000 
      }
    });

    importKey(
      this.tezos,
      this.account.email,
      this.account.password,
      this.account.mnemonic.join(' '),
      this.account.activation_code
    ).catch((e) => console.error(e));
  }

  /**
   * Активирует аккаунт и зачисляет монеты.
   *
   * @remarks
   * Активировать аккаунт можно только один раз
   */
  public async activateAccount() {
    const { pkh, activation_code } = this.account;
    const operation = await this.tezos.tz.activate(pkh, activation_code)
    await operation.confirmation()
    console.log("Activation successful!")
  }

  /**
   * @returns Возвращает адрес аккаунта
   */
  public async getAddress() {
    return await this.tezos.wallet.pkh()
  }

  /**
   * Вызывает callback каждый раз, когда на привязанный к инстансу адрес поступают средства.
   */
  public subscribe(callback: (data: any) => void){
    this.subscription = this.tezos.stream.subscribeOperation({
      and: [{destination: this.account.pkh}, {kind: "transaction" }]
    })

    this.subscription.on("data", callback);
  }
  /**
   * Вызывает callback каждый раз, когда происходит взаимодействие с контрактом.
   * @param address Адрес контракта для подписки
   */
  public subscribeContract(address: string, callback: (data: any) => void){
    this.subscription = this.tezos.stream.subscribeOperation({
      and: [{destination: address}]
    })

    this.subscription.on("data", callback);
  }

  /**
   * Отменяет подписку на транзакции при наличии.
   */
  public unsubscribe(){
    if(this.subscription === null) return false;
    this.subscription.close();
    return true;
  }

  /**
   * Возвращает баланс привязанного к инстансу адреса.
   */
  public async getOwnBalance(){
    return this.getBalance(this.account.pkh);
  }

  /**
   * Возвращает баланс указанного адреса.
   * @param address Адрес для получения баланса
   */
  public async getBalance(address: string){
    const balance = await this.tezos.tz.getBalance(address);
    return balance.toNumber() / 1000000;
  }

  /**
   * Совершает перевод с привязанного адреса на указанный.
   * @param address Адрес получателя
   * @param amount Сумма перевода
   * @returns Хэш операции
   */
  public async transfer(address: string, amount: number){
    const op = await this.tezos.contract.transfer({to: address, amount});
    await op.confirmation(1);
    return op.hash;
  }

  /**
   * Совершает перевод токенов
   * @param contract_address Адрес контракта токена
   * @param receiver Адрес получателя
   * @param amount Сумма перевода
   * @returns Hash операции
   */
  public async transferToken(contract_address: string, receiver: string, amount: number) {
    const contract = await this.tezos.contract.at(contract_address);
    const op = await contract.methods.transfer(this.account.pkh, receiver, amount).send()
    return op.confirmation(1).then(() => op.hash)
  }

  /**
   * Создаёт токен и деплоит его в сеть.
   * @param contract_code JSON кода контракта для создания токена.
   * @param initial_balance Количество монет, которые получит привязанный адрес.
   * @returns Адрес контракта токена
   */
  public async createToken(contract_code: any, initial_balance: number){
    const op = await this.tezos.contract.originate({
      code: contract_code,
      init: `(Pair { Elt "${this.account.pkh}" (Pair { Elt "${this.account.pkh}" ${initial_balance} } ${initial_balance}) } ${initial_balance})`,
    })
    const contract = await op.contract()
    return contract.address;
  }

  /**
   * Перевод коинов вместе с токенами одной транзакцией. WIP
   */
  public async _test(){
    return await this.tezos.wallet.transfer({
      to: "KT1U5poZbk19ym28pK2tarU2Lohb8kpgvLME",
      amount: 50,
      parameter: {
        entrypoint: "transfer",
        value:{
           prim: "Pair",
           args: [
              {
                string: "tz1gVYfPffnmhyZkiEXadeg5SS8uerbXo2DM"
              },
              {
                prim: "Pair",
                 args:[
                    {
                      string: "tz1f1c3WWBBd4wGF57sJNgej9vKSCG5GTLjd"
                    },
                    {
                      int: "30"
                    }
                 ]
              }
           ]
        }
     }
    }).send();
  }
}

export interface INotification {
  amount: number
  from: string
  address: string
  isToken: boolean
  contract: string | null
  symbol: string | null
}

export interface ITokenListenerTarget {
  symbol: string
  wallet: string
  contract: string
}

interface ITokenEntry {
  symbol: string
  wallet: string
}

type INotificationHandler = (notification: INotification) => void;

export class MassListener {
  private tezos: TezosToolkit;
  private tokens: Map<string, ITokenEntry>
  private listeners: Subscription<any>[] = []
  constructor(
    rpcUrl: string,
    private coin_targets: string[],
    token_targets: ITokenListenerTarget[]
  ){
    this.tezos = new TezosToolkit(rpcUrl);
    
    const parsed_tokens = token_targets.map(target => ([target.contract, {
      symbol: target.symbol, 
      wallet: target.wallet
    }] as [string, ITokenEntry]));

    this.tokens = new Map(parsed_tokens);
  }

  private getTokenFilter(){
    return [...this.tokens.keys()].map(token => ({destination: token}))
  }

  private subscribeTokens(callback: INotificationHandler){
    const listener = this.tezos.stream.subscribeOperation({
      or: this.getTokenFilter()
    });
    this.listeners.push(listener);
    listener.on("data", data => this.tokenRecievedHandler(data, callback))
  }

  public unsubscribe(){
    this.listeners.forEach(listener => listener.close());
  }

  private tokenRecievedHandler(data: any, callback: INotificationHandler){
    const [{string: reciever}, {int: amount}] = data.parameters.value.args[1].args;
    const tokenEntry = this.tokens.get(data.destination);
    if(reciever === tokenEntry.wallet) {
      callback({
        amount: Number(amount),
        from: data.source,
        address: reciever,
        isToken: true,
        contract: data.destination,
        symbol: tokenEntry.symbol
      })
    }
  }

  public onRecieved(callback: INotificationHandler){
    this.subscribeTokens(callback);
  }
}