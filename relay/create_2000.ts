const UPPER_LIMIT = 2000;
const BASE_WALLET = "0:12307cc8cac50159ee52a809d44a03f566fee7176ed620e0663a26cbd7047d5d";

const tokens = [];

for (let i = 1; i <= UPPER_LIMIT; i++) {
    tokens.push({
        symbol: 'TEST-' + i.toString().padStart(4,'0'),
        wallet: BASE_WALLET.slice(0, -3) + i.toString(16).padStart(3,'0'),
    });
}

const config = {
    coin: {
        address: BASE_WALLET,
    },
    tokens
};

console.log(JSON.stringify(config));
