import { abiContract, signerNone } from '@tonclient/core';
import HelloWallet from './HelloWallet';


export async function encodePayload(text: string) {
    return (await this.client.abi.encode_message_body({
        abi: abiContract(HelloWallet.abi),
        call_set: {
            function_name: 'createLockWithCoins',
            input: {
                payload: Buffer.from(text).toString('hex'),
            },
        },
        is_internal: true,
        signer: signerNone(),
    })).body;
}
