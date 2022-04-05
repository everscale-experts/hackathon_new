import config from './everscale/config.json';

type address = string;

export interface IToken {
    "symbol": string;
    "name"?: string;
    "decimals"?: number;
    "root"?: address;
    "wallet": address;
    "seed"?: string;
    "pubkey"?: string;
    "privkey"?: string;
}

export interface IConfig {
    coin: {
        address: address;
        seed?: string;
        pubkey?: string;
        privkey?: string;
    },
    tokens: IToken[];
}

// verifying that IConfig structure is the same as used in relay/everscale/config.json
export const data: IConfig = config;
