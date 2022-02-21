import fs from 'fs';
import {IConfig, IToken} from './types';

const UPPER_LIMIT = 2000;
const BASE_WALLET = '0:12307cc8cac50159ee52a809d44a03f566fee7176ed620e0663a26cbd7047d5d';
const FILE_NAME = './everscale/config_for_listener.json';

const tokens: IToken[] = [];

for (let i = 1; i <= UPPER_LIMIT; i++) {
    tokens.push({
        symbol: 'TEST-' + i.toString().padStart(4, '0'),
        wallet: BASE_WALLET.slice(0, -3) + i.toString(16).padStart(3, '0'),
    });
}

const config: IConfig = {
    coin: {
        address: BASE_WALLET,
    },
    tokens,
};

fs.writeFileSync(FILE_NAME, JSON.stringify(config));
console.log(`Done. Now you have to open the file "${FILE_NAME}" and reformat it for easy reading. Thanks!`);
