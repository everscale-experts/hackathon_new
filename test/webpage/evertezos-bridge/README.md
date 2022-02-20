# Installation

## Install NVM if you don't have it
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
```

### Switch to correct version of npm
```bash
nvm install 12
```
### Instal server

```bash
yarn
```
### Run server in dev mod
```bash
yarn
```

# Useful links
## Get keys from seed phrase
https://github.com/tonlabs/sdk-samples/blob/master/appkit-examples/signing-box/index.js
