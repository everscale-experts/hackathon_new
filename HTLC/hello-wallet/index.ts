import { Account, AccountType } from '@tonclient/appkit';
import { signerKeys, TonClient } from '@tonclient/core';
import { libNode } from '@tonclient/lib-node';
import { ClientError, CryptoModule, KeyPair } from '@tonclient/core/dist/modules';
import { ContractPackage } from '@tonclient/appkit/dist/account';

import HelloWallet from './HelloWallet';
import SafeMultisigWallet from '../safemultisig/SafeMultisigWallet';
import { encodePayload } from './encodePayload';

import * as fs from 'fs';
import * as path from 'path';
// import * as process from 'process';

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

async function deployContract(
    client: TonClient,
    SafeMultisigWallet: ContractPackage,
    keys: KeyPair,
): Promise<Account> {
    const account = new Account(SafeMultisigWallet, {
        signer: signerKeys(keys),
        client,
    });

    const address = await account.getAddress();
    console.log(`Future address of the contract will be: ${address}`);

    const accountData = await account.getAccount();
    if (accountData.acc_type === AccountType.nonExist) {
        console.log(`Account doesn't exist. Deploying...`);
        // Request contract deployment funds form a local TON OS SE giver
        await account.deploy({
            useGiver: true,
            initInput: {
                owners: ['0x' + keys.public],
                reqConfirms: 1,
            }
        });

        console.log(`Hello contract was deployed at address: ${address}`);
    } else {
        console.log(`Hello contract was exist at address: ${address}`);
    }
    return account;
}


/**
 *
 * @param client {TonClient}
 * @returns {Promise<void>}
 */
async function main(client: TonClient) {
    const cryptoModule = new CryptoModule(client);
    const keys = await readKeysFromFileOrGenerateAndSave(keysPath);

    const lockerContract = new Account(HelloWallet, {
        signer: signerKeys(keys),
        client,
    });

    const address = await lockerContract.getAddress();
    console.log(`Future address of the contract will be: ${address}`);

    const account = await lockerContract.getAccount();
    if (account.acc_type === AccountType.nonExist) {
        // Request contract deployment funds form a local TON OS SE giver
        // not suitable for other networks.
        // Deploy `hello` contract.
        await lockerContract.deploy({useGiver: true});

        console.log(`Hello contract was deployed at address: ${address}`);
    } else {
        console.log(`Hello contract was exist at address: ${address}`);
    }


    const multisig = await deployContract(client, SafeMultisigWallet, keys);

    let randomAddress = '0:0010000000123456789012345678901234567890123456789012345678901234';
    const secret = '0000000000123456789012345678901234567890123456789012345678901234';

// 0xdde8c89505d9ec23cb0e0b2f6fb32b96f4945852c2f48f7b1e0dffed179dfa4c
    const hash = await cryptoModule
        .sha256({
            data: Buffer
                .from(secret, 'binary')
                .toString('ascii'),
        })
        .then(resultOfHash => `0x` + resultOfHash.hash);
    console.log(`hash=`, hash);

    // sendTransaction - for 1 custodian only;
    // submitTransaction - for
    let response = await multisig.run('submitTransaction', {
        dest: address,
        value: 1_700_000_000,
        bounce: true,
        allBalance: false,
        payload: await encodePayload(client, {
            function_name: 'createLockWithCoins',
            input: {
                dest: randomAddress,
                hash,
                timeout: 300,
            }
        }),
    }, {
        signer: signerKeys(keys),
    });
    console.log('Contract reacted to your submitTransaction(),' +
        'target address will recieve:', response.fees.total_output);


    response = await lockerContract.run('openLock', {
        dest: randomAddress,
        secret,
    });

    console.log(response);
    // process.exit(0);
    return;


    // Call `touch` function
    response = await lockerContract.run('touch', {});
    console.log(`Contract run transaction with output ${response.decoded?.output}, ${response.transaction?.id}`);

    // Read local variable `timestamp` with a get method `getTimestamp`
    // This can be done with `runLocal` function. The execution of runLocal is performed off-chain and does not
    // cost any gas.
    response = await lockerContract.runLocal('getTimestamp', {});
    console.log('Contract reacted to your getTimestamp:', response.decoded?.output)

    // Send some money to the random address
    randomAddress =
        '0:' +
        Buffer.from(
            (await client.crypto.generate_random_bytes({length: 32})).bytes,
            'base64'
        ).toString('hex');
    response = await lockerContract.run('sendValue', {
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
            // endpoints: ['http://localhost']
            endpoints: [
                'https://net1.ton.dev',
                'https://net5.ton.dev'
            ]
        }
    });
    try {
        console.log('Hello localhost TON!');

        await main(client);
        process.exit(0);
    } catch (error) {
        if (error && (<ClientError>error).code === 504) {
            console.error(`Network is inaccessible. You have to start TON OS SE using \`everdev se start\`.\n` +
                `If you run SE on another port or ip, replace http://localhost ` +
                `endpoint with http://localhost:port or http://ip:port in index.js file.`);
        } else {
            console.error(error);
        }
    }
    client.close();
})();
