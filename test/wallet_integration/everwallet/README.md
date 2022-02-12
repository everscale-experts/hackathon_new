# Installation

## Prerequisites

- Node.js 14 LTS
- Yarn package manager

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
npx ts-node transfertip.ts
```
## Instruction

### Create & Deploy TIP3-Token

``` bash
npx ts-node create_TIP.ts
```
You can change in the file
name:"ERT34",
symbol:"ERT34",
decimals:3,

### Create & Deploy TIP3-Token-Wallet

``` bash
npx ts-node deploy_TIP_wallet.ts
```
### Mint & Grant TIP3-Token

To mint TIP-3 tokens

``` bash
npx ts-node mint_TIP3.ts
```

Than

```bash
npx ts-node deployroot_TIP3.ts
```
