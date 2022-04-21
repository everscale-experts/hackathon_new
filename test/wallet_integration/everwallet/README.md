# Installation

## Prerequisites

- Node.js 14 LTS
- Yarn package manager
- TVM Linker [https://github.com/tonlabs/TVM-linker]

Command to check:
```bash
node -v
sudo npm install --global yarn
```

*Package probably works OK on other Node.js versions, but we use 14 version in our testing pipelines so we quarantee its stable work only on 14 version.*

## Install core package

```shell script
cd test/wallet_integration/everwallet
yarn
#npm i --save @tonclient/core
git submodule update --init
```

## Run

```bash
npx ts-node 4transfer_TIP3.ts
```
## Instruction

### Create & Deploy TIP3-Token

``` bash
npx ts-node 1create_TIP.ts
```
You can change in the file
name:"ERT34",
symbol:"ERT34",
decimals:3,

### Create & Deploy TIP3-Token-Wallet

``` bash
npx ts-node 2deploy_TIP_wallet.ts
```
### Mint & Grant TIP3-Token (depricated)

To mint TIP-3 tokens

``` bash
npx ts-node 3mint_TIP3.ts
```
### Create wallet for you! with toncli

To create TokenWallet for your Wallet

```bash
./tonos-cli call 0:7f6225f4b84d9889593fb1d9366e12132b6b0c007db813f17897e33033e9a9ae deployWallet '{"_answer_id":"0", "pubkey":"0x+pubkey", "tokens":"10000000000","evers":"2000000000"}' --sign deploy.keys.json --abi flex/tokens-fungible/RootTokenContract.abi
```

### To look the Balance

```bash
./tonos-cli run 0:fac2714d40492bf96ed0ff4231a41d274af3b2a36283debce112434a9ceb9647 getBalance {} --abi flex/tokens-fungible/TONTokenWallet.abi
./tonos-cli run 0:bdd066bacf2357ca05e3571422d38d12b7dffb584682d9fa6a33b0ea940375f1 getBalance {} --abi flex/tokens-fungible/TONTokenWallet.abi
```

### For trasnfer

```bash
npx ts-node 4transfer_TIP3.ts
```


### Процесс от и до если хочется очень
