const HelloWalletContract = {
    abi: {
        "ABI version": 2,
        "version": "2.2",
        "header": [
            "time",
            "expire"
        ],
        "functions": [
            {
                "name": "constructor",
                "inputs": [],
                "outputs": []
            },
            {
                "name": "renderHelloWorld",
                "inputs": [],
                "outputs": [
                    {
                        "name": "value0",
                        "type": "string"
                    }
                ]
            },
            {
                "name": "touch",
                "inputs": [],
                "outputs": []
            },
            {
                "name": "getTimestamp",
                "inputs": [],
                "outputs": [
                    {
                        "name": "value0",
                        "type": "uint256"
                    }
                ]
            },
            {
                "name": "sendValue",
                "inputs": [
                    {
                        "name": "dest",
                        "type": "address"
                    },
                    {
                        "name": "amount",
                        "type": "uint128"
                    },
                    {
                        "name": "bounce",
                        "type": "bool"
                    }
                ],
                "outputs": []
            },
            {
                "name": "createLockWithCoins",
                "inputs": [
                    {
                        "name": "dest",
                        "type": "address"
                    },
                    {
                        "name": "hash",
                        "type": "uint256"
                    },
                    {
                        "name": "timeout",
                        "type": "uint32"
                    }
                ],
                "outputs": []
            },
            {
                "name": "createLockWithTokens",
                "inputs": [
                    {
                        "name": "hash",
                        "type": "uint256"
                    }
                ],
                "outputs": []
            },
            {
                "name": "openLock",
                "inputs": [
                    {
                        "name": "dest",
                        "type": "address"
                    },
                    {
                        "name": "secret",
                        "type": "string"
                    }
                ],
                "outputs": []
            },
            {
                "name": "timestamp",
                "inputs": [],
                "outputs": [
                    {
                        "name": "timestamp",
                        "type": "uint32"
                    }
                ]
            },
            {
                "name": "locker",
                "inputs": [],
                "outputs": [
                    {
                        "components": [
                            {
                                "name": "sender",
                                "type": "address"
                            },
                            {
                                "name": "dest",
                                "type": "address"
                            },
                            {
                                "name": "hash",
                                "type": "uint256"
                            },
                            {
                                "name": "value",
                                "type": "uint128"
                            },
                            {
                                "name": "expiredTimestamp",
                                "type": "uint32"
                            }
                        ],
                        "name": "locker",
                        "type": "map(address,tuple)"
                    }
                ]
            }
        ],
        "data": [],
        "events": [
            {
                "name": "IgotTheKey",
                "inputs": [
                    {
                        "name": "secret",
                        "type": "string"
                    }
                ],
                "outputs": []
            },
            {
                "name": "TheLockIsAdded",
                "inputs": [
                    {
                        "name": "dest",
                        "type": "address"
                    }
                ],
                "outputs": []
            }
        ],
        "fields": [
            {
                "name": "_pubkey",
                "type": "uint256"
            },
            {
                "name": "_timestamp",
                "type": "uint64"
            },
            {
                "name": "_constructorFlag",
                "type": "bool"
            },
            {
                "name": "timestamp",
                "type": "uint32"
            },
            {
                "components": [
                    {
                        "name": "sender",
                        "type": "address"
                    },
                    {
                        "name": "dest",
                        "type": "address"
                    },
                    {
                        "name": "hash",
                        "type": "uint256"
                    },
                    {
                        "name": "value",
                        "type": "uint128"
                    },
                    {
                        "name": "expiredTimestamp",
                        "type": "uint32"
                    }
                ],
                "name": "locker",
                "type": "map(address,tuple)"
            }
        ]
    },
    tvc: "te6ccgECKQEABQUAAgE0AwEBAcACAEPQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgBCSK7VMg4wMgwP/jAiDA/uMC8gsmBQQoAujtRNDXScMB+GaNCGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAT4aSHbPNMAAY4SgQIA1xgg+QFY+EIg+GX5EPKo3tM/AfhDIbnytCD4I4ED6KiCCBt3QKC58rT4Y9MfAfgjvPK50x8B2zzyPAkGA1LtRNDXScMB+GYi0NMD+kAw+GmpOADcIccA4wIh1w0f8rwh4wMB2zzyPCUlBgM8IIIQHLaidLvjAiCCEFD1wjy74wIgghBotV8/u+MCFAsHAiggghBoF+U1uuMCIIIQaLVfP7rjAgoIAlAw+EJu4wD4RvJz0fhC8uBl+EUgbpIwcN74Qrry4Gb4APgj+GrbPPIACRsBSu1E0NdJwgGOGnDtRND0BXBt+Gv4aoBA9A7yvdcL//hicPhj4w0gAVAw0ds8+EohjhyNBHAAAAAAAAAAAAAAAAA6BflNYMjOyx/JcPsA3vIAIARQIIIQH51kg7rjAiCCEDcxLkW64wIgghA7Y9R+uuMCIIIQUPXCPLrjAhIQDgwDKjD4RvLgTPhCbuMA0//R2zww2zzyACANGwACMAM8MPhG8uBM+EJu4wAhk9TR0N76QNN/0gDR2zzjAPIAIA8iAEz4RSBukjBw3vhCuvLgZvgAEsjPhYDKAM+EQM4B+gKAa89AyXD7AAMmMPhG8uBM+EJu4wDR2zww2zzyACARGwAM+AD4I/hqA2gw+Eby4Ez4Qm7jANHbPCGOHCPQ0wH6QDAxyM+HIM6CEJ+dZIPPC4HL/8lw+wCRMOLjAPIAIBMiAAT4SgRQIIIQBzQsSrrjAiCCEBFWFOK64wIgghAbeIQRuuMCIIIQHLaidLrjAiEaGRUDODD4RvLgTPhCbuMAIZPU0dDe+kDU0ds8MNs88gAgFhsB6iDQ/hQwIfhLgQEL9AtvoeMAIG7y0GQgbvJ/+CMhbxS8mPgAIG8TIW8Qji4gbxIi+QC68uBk+AAhjQRwAAAAAAAAAAAAAAAAHKZpkKDIzszJcPsAIG8TIW8R4sjPhYjOAfoCgGvPQMlw+wBb+EuBAQv0WTD4axcBBtDbPBgAIPpA1NHQ+kDT/9N/0x/RbwUBUDDR2zz4SyGOHI0EcAAAAAAAAAAAAAAAACbeIQRgyM70AMlw+wDe8gAgAz4w+Eby4Ez4Qm7jACGT1NHQ3vpA0//TH9HbPDDbPPIAIBwbACz4S/hK+EP4QsjL/8s/z4PLH/QAye1UApJopv5gghA7msoAvPLgZCL4S4EBC/QKb6Ex8tBk+EkjVQJopv5gghAF9eEAobV/+CNVBKC1H28F2zzJIfhLgQEL9DMB+GuOgN4wHx0BQojQ/hQwII0EcAAAAAAAAAAAAAAAABqhWoGgyM7OyXD7AB4AJFRoZSBsb2NrIGlzIGFkZGVkLgAibyVeMMjOVTDIzsv/y3/LH80ALu1E0NP/0z/TADHTH/QE0fhr+Gr4Y/hiAlww+Eby4EzR2zwhjhsj0NMB+kAwMcjPhyDOghCHNCxKzwuBzMlw+wCRMOLjAPIAIyIAKO1E0NP/0z8x+ENYyMv/yz/Oye1UAQKIJAAUaGVsbG9Xb3JsZAAK+Eby4EwCCvSkIPShKCcAFHNvbCAwLjU4LjEAAA==",
    code: "te6ccgECJgEABNgABCSK7VMg4wMgwP/jAiDA/uMC8gsjAgElAujtRNDXScMB+GaNCGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAT4aSHbPNMAAY4SgQIA1xgg+QFY+EIg+GX5EPKo3tM/AfhDIbnytCD4I4ED6KiCCBt3QKC58rT4Y9MfAfgjvPK50x8B2zzyPAYDA1LtRNDXScMB+GYi0NMD+kAw+GmpOADcIccA4wIh1w0f8rwh4wMB2zzyPCIiAwM8IIIQHLaidLvjAiCCEFD1wjy74wIgghBotV8/u+MCEQgEAiggghBoF+U1uuMCIIIQaLVfP7rjAgcFAlAw+EJu4wD4RvJz0fhC8uBl+EUgbpIwcN74Qrry4Gb4APgj+GrbPPIABhgBSu1E0NdJwgGOGnDtRND0BXBt+Gv4aoBA9A7yvdcL//hicPhj4w0dAVAw0ds8+EohjhyNBHAAAAAAAAAAAAAAAAA6BflNYMjOyx/JcPsA3vIAHQRQIIIQH51kg7rjAiCCEDcxLkW64wIgghA7Y9R+uuMCIIIQUPXCPLrjAg8NCwkDKjD4RvLgTPhCbuMA0//R2zww2zzyAB0KGAACMAM8MPhG8uBM+EJu4wAhk9TR0N76QNN/0gDR2zzjAPIAHQwfAEz4RSBukjBw3vhCuvLgZvgAEsjPhYDKAM+EQM4B+gKAa89AyXD7AAMmMPhG8uBM+EJu4wDR2zww2zzyAB0OGAAM+AD4I/hqA2gw+Eby4Ez4Qm7jANHbPCGOHCPQ0wH6QDAxyM+HIM6CEJ+dZIPPC4HL/8lw+wCRMOLjAPIAHRAfAAT4SgRQIIIQBzQsSrrjAiCCEBFWFOK64wIgghAbeIQRuuMCIIIQHLaidLrjAh4XFhIDODD4RvLgTPhCbuMAIZPU0dDe+kDU0ds8MNs88gAdExgB6iDQ/hQwIfhLgQEL9AtvoeMAIG7y0GQgbvJ/+CMhbxS8mPgAIG8TIW8Qji4gbxIi+QC68uBk+AAhjQRwAAAAAAAAAAAAAAAAHKZpkKDIzszJcPsAIG8TIW8R4sjPhYjOAfoCgGvPQMlw+wBb+EuBAQv0WTD4axQBBtDbPBUAIPpA1NHQ+kDT/9N/0x/RbwUBUDDR2zz4SyGOHI0EcAAAAAAAAAAAAAAAACbeIQRgyM70AMlw+wDe8gAdAz4w+Eby4Ez4Qm7jACGT1NHQ3vpA0//TH9HbPDDbPPIAHRkYACz4S/hK+EP4QsjL/8s/z4PLH/QAye1UApJopv5gghA7msoAvPLgZCL4S4EBC/QKb6Ex8tBk+EkjVQJopv5gghAF9eEAobV/+CNVBKC1H28F2zzJIfhLgQEL9DMB+GuOgN4wHBoBQojQ/hQwII0EcAAAAAAAAAAAAAAAABqhWoGgyM7OyXD7ABsAJFRoZSBsb2NrIGlzIGFkZGVkLgAibyVeMMjOVTDIzsv/y3/LH80ALu1E0NP/0z/TADHTH/QE0fhr+Gr4Y/hiAlww+Eby4EzR2zwhjhsj0NMB+kAwMcjPhyDOghCHNCxKzwuBzMlw+wCRMOLjAPIAIB8AKO1E0NP/0z8x+ENYyMv/yz/Oye1UAQKIIQAUaGVsbG9Xb3JsZAAK+Eby4EwCCvSkIPShJSQAFHNvbCAwLjU4LjEAAA==",
    codeHash: "1bfdda7148123b8b5d1ba8f6a5a9e2498a083057b8c471a2218a739bc0851888",
};
export default HelloWalletContract;