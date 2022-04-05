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
yarn
#npm i --save @tonclient/core
```

## Install bridge package (depends on target JS platform)

The bridge package will download precompiled binaries from TON Labs cloud storage.
If you want to rebuild binary from sources see [build binaries](#build binaries) section.

### NodeJs
```shell script
#npm i --save @tonclient/lib-node
```

### Web
```shell script
#npm i --save @tonclient/lib-web
```
