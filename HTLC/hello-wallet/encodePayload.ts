import { abiContract, signerNone, TonClient } from '@tonclient/core';
import HelloWallet from './HelloWallet';

interface ILocalCallSet {
    function_name: string,
    input: {
        dest: string;
        hash: string;
        timeout: number;
    }
}

export function encodePayload(client: TonClient, callSet: ILocalCallSet): Promise<string> {
    return client.abi
        .encode_message_body({
            abi: abiContract(HelloWallet.abi),
            call_set: callSet,
            is_internal: true,
            signer: signerNone(),
        })
        .then(encodedMessage => encodedMessage.body);
}
