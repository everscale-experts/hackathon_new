import { Account, AccountType } from '@tonclient/appkit';
import { signerKeys, TonClient } from '@tonclient/core';
import { libNode } from '@tonclient/lib-node';

import HelloWallet from './HelloWallet';
import { KeyPair } from '@tonclient/core/dist/modules';
import * as fs from 'fs';
import * as path from 'path';

const keysFilename = 'keys.json';
const keysPath = path.resolve(__dirname, keysFilename);

// Link the platform-dependable TON-SDK binary with the target Application in Typescript
// This is a Node.js project, so we link the application with `libNode` binary
// from `@tonclient/lib-node` package
// If you want to use this code on other platforms, such as Web or React-Native,
// use  `@tonclient/lib-web` and `@tonclient/lib-react-native` packages accordingly
// (see README in  https://github.com/tonlabs/ton-client-js )
TonClient.useBinaryLibrary(libNode);

async function readKeysFromFileOrGenerateAndSave(keysPath: string): Promise<KeyPair> {
    return fs.promises
        .readFile(keysPath, {encoding: 'utf8'})
        .then(data => JSON.parse(data) as KeyPair)
        .catch(() => TonClient.default.crypto
            // Generate an ed25519 key pair for new account
            .generate_random_sign_keys()
            .then(keys => fs.promises
                .writeFile(keysPath, JSON.stringify(keys), {encoding: 'utf8'})
                .then(() => keys)));
}

/**
 *
 * @param client {TonClient}
 * @returns {Promise<void>}
 */
async function main(client) {
    const keys = await readKeysFromFileOrGenerateAndSave(keysPath);

    const helloAcc = new Account(HelloWallet, {
        signer: signerKeys(keys),
        client,
    });

    const address = await helloAcc.getAddress();
    console.log(`Future address of the contract will be: ${address}`);

    const account = await helloAcc.getAccount();
    if(account.acc_type === AccountType.nonExist) {
        // Request contract deployment funds form a local TON OS SE giver
        // not suitable for other networks.
        // Deploy `hello` contract.
        await helloAcc.deploy({useGiver: true});

        console.log(`Hello contract was deployed at address: ${address}`);
    } else {
        console.log(`Hello contract was exist at address: ${address}`);
    }


    // Call `touch` function
    let response = await helloAcc.run('touch', {});
    console.log(`Contract run transaction with output ${response.decoded.output}, ${response.transaction.id}`);

    // Read local variable `timestamp` with a get method `getTimestamp`
    // This can be done with `runLocal` function. The execution of runLocal is performed off-chain and does not
    // cost any gas.
    response = await helloAcc.runLocal('getTimestamp', {});
    console.log('Contract reacted to your getTimestamp:', response.decoded.output)

    // Send some money to the random address
    const randomAddress =
        '0:' +
        Buffer.from(
            (await client.crypto.generate_random_bytes({length: 32})).bytes,
            'base64'
        ).toString('hex');
    response = await helloAcc.run('sendValue', {
        dest: randomAddress,
        amount: 100_000_000, // 0.1 token
        bounce: true,
    });
    console.log('Contract reacted to your sendValue, target address will recieve:', response.fees.total_output);
}

(async () => {
    const client = new TonClient({
        network: {
            // Local TON OS SE instance URL here
            endpoints: ['http://localhost']
        }
    });
    try {
        console.log('Hello localhost TON!');
        await main(client);
        process.exit(0);
    } catch (error) {
        if (error.code === 504) {
            console.error(`Network is inaccessible. You have to start TON OS SE using \`everdev se start\`.\n` +
                `If you run SE on another port or ip, replace http://localhost ` +
                `endpoint with http://localhost:port or http://ip:port in index.js file.`);
        } else {
            console.error(error);
        }
    }
    client.close();
})();
