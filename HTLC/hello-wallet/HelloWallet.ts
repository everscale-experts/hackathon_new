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
    tvc: "te6ccgECIwEABDEAAgE0AwEBAcACAEPQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgBCSK7VMg4wMgwP/jAiDA/uMC8gsgBQQiAujtRNDXScMB+GaNCGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAT4aSHbPNMAAY4SgQIA1xgg+QFY+EIg+GX5EPKo3tM/AfhDIbnytCD4I4ED6KiCCBt3QKC58rT4Y9MfAfgjvPK50x8B2zzyPAgGA1LtRNDXScMB+GYi0NMD+kAw+GmpOADcIccA4wIh1w0f8rwh4wMB2zzyPB8fBgM8IIIQH51kg7vjAiCCEGgX5TW74wIgghBotV8/uuMCEQkHAlAw+EJu4wD4RvJz0fhC8uBl+EUgbpIwcN74Qrry4Gb4APgj+GrbPPIACBUBSu1E0NdJwgGOGnDtRND0BXBt+Gv4aoBA9A7yvdcL//hicPhj4w0aBFAgghA3MS5FuuMCIIIQO2PUfrrjAiCCEFD1wjy64wIgghBoF+U1uuMCDw0LCgFQMNHbPPhKIY4cjQRwAAAAAAAAAAAAAAAAOgX5TWDIzssfyXD7AN7yABoDKjD4RvLgTPhCbuMA0//R2zww2zzyABoMFQACMAM8MPhG8uBM+EJu4wAhk9TR0N76QNN/0gDR2zzjAPIAGg4cAEz4RSBukjBw3vhCuvLgZvgAEsjPhYDKAM+EQM4B+gKAa89AyXD7AAMmMPhG8uBM+EJu4wDR2zww2zzyABoQFQAM+AD4I/hqBFAgghAHNCxKuuMCIIIQG3iEEbrjAiCCEBy2onS64wIgghAfnWSDuuMCGxkUEgNoMPhG8uBM+EJu4wDR2zwhjhwj0NMB+kAwMcjPhyDOghCfnWSDzwuBy//JcPsAkTDi4wDyABoTHAAE+EoDODD4RvLgTPhCbuMAIZPU0dDe+kDU0ds8MNs88gAaFhUALPhL+Er4Q/hCyMv/yz/Pg8sf9ADJ7VQB6iDQ/hQwIfhLgQEL9AtvoeMAIG7y0GQgbvJ/+CMhbxS8mPgAIG8TIW8Qji4gbxIi+QC68uBk+AAhjQRwAAAAAAAAAAAAAAAAHKZpkKDIzszJcPsAIG8TIW8R4sjPhYjOAfoCgGvPQMlw+wBb+EuBAQv0WTD4axcBBtDbPBgAIPpA1NHQ+kDT/9N/0x/RbwUBUDDR2zz4SyGOHI0EcAAAAAAAAAAAAAAAACbeIQRgyM70AMlw+wDe8gAaAC7tRNDT/9M/0wAx0x/0BNH4a/hq+GP4YgJcMPhG8uBM0ds8IY4bI9DTAfpAMDHIz4cgzoIQhzQsSs8LgczJcPsAkTDi4wDyAB0cACjtRNDT/9M/MfhDWMjL/8s/zsntVAECiB4AFGhlbGxvV29ybGQACvhG8uBMAgr0pCD0oSIhABRzb2wgMC41OC4xAAA=",
    code: "te6ccgECIAEABAQABCSK7VMg4wMgwP/jAiDA/uMC8gsdAgEfAujtRNDXScMB+GaNCGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAT4aSHbPNMAAY4SgQIA1xgg+QFY+EIg+GX5EPKo3tM/AfhDIbnytCD4I4ED6KiCCBt3QKC58rT4Y9MfAfgjvPK50x8B2zzyPAUDA1LtRNDXScMB+GYi0NMD+kAw+GmpOADcIccA4wIh1w0f8rwh4wMB2zzyPBwcAwM8IIIQH51kg7vjAiCCEGgX5TW74wIgghBotV8/uuMCDgYEAlAw+EJu4wD4RvJz0fhC8uBl+EUgbpIwcN74Qrry4Gb4APgj+GrbPPIABRIBSu1E0NdJwgGOGnDtRND0BXBt+Gv4aoBA9A7yvdcL//hicPhj4w0XBFAgghA3MS5FuuMCIIIQO2PUfrrjAiCCEFD1wjy64wIgghBoF+U1uuMCDAoIBwFQMNHbPPhKIY4cjQRwAAAAAAAAAAAAAAAAOgX5TWDIzssfyXD7AN7yABcDKjD4RvLgTPhCbuMA0//R2zww2zzyABcJEgACMAM8MPhG8uBM+EJu4wAhk9TR0N76QNN/0gDR2zzjAPIAFwsZAEz4RSBukjBw3vhCuvLgZvgAEsjPhYDKAM+EQM4B+gKAa89AyXD7AAMmMPhG8uBM+EJu4wDR2zww2zzyABcNEgAM+AD4I/hqBFAgghAHNCxKuuMCIIIQG3iEEbrjAiCCEBy2onS64wIgghAfnWSDuuMCGBYRDwNoMPhG8uBM+EJu4wDR2zwhjhwj0NMB+kAwMcjPhyDOghCfnWSDzwuBy//JcPsAkTDi4wDyABcQGQAE+EoDODD4RvLgTPhCbuMAIZPU0dDe+kDU0ds8MNs88gAXExIALPhL+Er4Q/hCyMv/yz/Pg8sf9ADJ7VQB6iDQ/hQwIfhLgQEL9AtvoeMAIG7y0GQgbvJ/+CMhbxS8mPgAIG8TIW8Qji4gbxIi+QC68uBk+AAhjQRwAAAAAAAAAAAAAAAAHKZpkKDIzszJcPsAIG8TIW8R4sjPhYjOAfoCgGvPQMlw+wBb+EuBAQv0WTD4axQBBtDbPBUAIPpA1NHQ+kDT/9N/0x/RbwUBUDDR2zz4SyGOHI0EcAAAAAAAAAAAAAAAACbeIQRgyM70AMlw+wDe8gAXAC7tRNDT/9M/0wAx0x/0BNH4a/hq+GP4YgJcMPhG8uBM0ds8IY4bI9DTAfpAMDHIz4cgzoIQhzQsSs8LgczJcPsAkTDi4wDyABoZACjtRNDT/9M/MfhDWMjL/8s/zsntVAECiBsAFGhlbGxvV29ybGQACvhG8uBMAgr0pCD0oR8eABRzb2wgMC41OC4xAAA=",
    codeHash: "e8fde5c6b48eb19cfaaff9394c53b8752b37b5146a21828d877cba76fa4f1f33",
};
export default HelloWalletContract;