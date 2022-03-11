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
                "name": "receiveTokens",
                "inputs": [
                    {
                        "name": "hash",
                        "type": "uint256"
                    }
                ],
                "outputs": []
            },
            {
                "name": "verifySecret",
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
    tvc: "te6ccgECIwEABDAAAgE0AwEBAcACAEPQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgBCSK7VMg4wMgwP/jAiDA/uMC8gsgBQQiAujtRNDXScMB+GaNCGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAT4aSHbPNMAAY4SgQIA1xgg+QFY+EIg+GX5EPKo3tM/AfhDIbnytCD4I4ED6KiCCBt3QKC58rT4Y9MfAfgjvPK50x8B2zzyPAgGA1LtRNDXScMB+GYi0NMD+kAw+GmpOADcIccA4wIh1w0f8rwh4wMB2zzyPB8fBgM8IIIQH51kg7vjAiCCEGgX5TW74wIgghBotV8/uuMCEQkHAlAw+EJu4wD4RvJz0fhC8uBl+EUgbpIwcN74Qrry4Gb4APgj+GrbPPIACBoBSu1E0NdJwgGOGnDtRND0BXBt+Gv4aoBA9A7yvdcL//hicPhj4w0eBFAgghA3MS5FuuMCIIIQO2PUfrrjAiCCEElERba64wIgghBoF+U1uuMCDw0LCgFQMNHbPPhKIY4cjQRwAAAAAAAAAAAAAAAAOgX5TWDIzssfyXD7AN7yAB4DKjD4RvLgTPhCbuMA0//R2zww2zzyAB4MGgACMAM8MPhG8uBM+EJu4wAhk9TR0N76QNN/0gDR2zzjAPIAHg4WAEz4RSBukjBw3vhCuvLgZvgAEsjPhYDKAM+EQM4B+gKAa89AyXD7AAMmMPhG8uBM+EJu4wDR2zww2zzyAB4QGgAM+AD4I/hqBE4gggsJ39i64wIgghAHNCxKuuMCIIIQG3iEEbrjAiCCEB+dZIO64wIZFRQSA2gw+Eby4Ez4Qm7jANHbPCGOHCPQ0wH6QDAxyM+HIM6CEJ+dZIPPC4HL/8lw+wCRMOLjAPIAHhMWAAT4SgFQMNHbPPhLIY4cjQRwAAAAAAAAAAAAAAAAJt4hBGDIzvQAyXD7AN7yAB4CXDD4RvLgTNHbPCGOGyPQ0wH6QDAxyM+HIM6CEIc0LErPC4HMyXD7AJEw4uMA8gAXFgAo7UTQ0//TPzH4Q1jIy//LP87J7VQBAogYABRoZWxsb1dvcmxkAzgw+Eby4Ez4Qm7jACGT1NHQ3vpA1NHbPDDbPPIAHhsaACz4S/hK+EP4QsjL/8s/z4PLH/QAye1UAeog0P4UMCH4S4EBC/QLb6HjACBu8tBkIG7yf/gjIW8UvJj4ACBvEyFvEI4uIG8SIvkAuvLgZPgAIY0EcAAAAAAAAAAAAAAAABymaZCgyM7MyXD7ACBvEyFvEeLIz4WIzgH6AoBrz0DJcPsAW/hLgQEL9Fkw+GscAQbQ2zwdACD6QNTR0PpA0//Tf9Mf0W8FAC7tRNDT/9M/0wAx0x/0BNH4a/hq+GP4YgAK+Eby4EwCCvSkIPShIiEAFHNvbCAwLjU4LjEAAA==",
    code: "te6ccgECIAEABAMABCSK7VMg4wMgwP/jAiDA/uMC8gsdAgEfAujtRNDXScMB+GaNCGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAT4aSHbPNMAAY4SgQIA1xgg+QFY+EIg+GX5EPKo3tM/AfhDIbnytCD4I4ED6KiCCBt3QKC58rT4Y9MfAfgjvPK50x8B2zzyPAUDA1LtRNDXScMB+GYi0NMD+kAw+GmpOADcIccA4wIh1w0f8rwh4wMB2zzyPBwcAwM8IIIQH51kg7vjAiCCEGgX5TW74wIgghBotV8/uuMCDgYEAlAw+EJu4wD4RvJz0fhC8uBl+EUgbpIwcN74Qrry4Gb4APgj+GrbPPIABRcBSu1E0NdJwgGOGnDtRND0BXBt+Gv4aoBA9A7yvdcL//hicPhj4w0bBFAgghA3MS5FuuMCIIIQO2PUfrrjAiCCEElERba64wIgghBoF+U1uuMCDAoIBwFQMNHbPPhKIY4cjQRwAAAAAAAAAAAAAAAAOgX5TWDIzssfyXD7AN7yABsDKjD4RvLgTPhCbuMA0//R2zww2zzyABsJFwACMAM8MPhG8uBM+EJu4wAhk9TR0N76QNN/0gDR2zzjAPIAGwsTAEz4RSBukjBw3vhCuvLgZvgAEsjPhYDKAM+EQM4B+gKAa89AyXD7AAMmMPhG8uBM+EJu4wDR2zww2zzyABsNFwAM+AD4I/hqBE4gggsJ39i64wIgghAHNCxKuuMCIIIQG3iEEbrjAiCCEB+dZIO64wIWEhEPA2gw+Eby4Ez4Qm7jANHbPCGOHCPQ0wH6QDAxyM+HIM6CEJ+dZIPPC4HL/8lw+wCRMOLjAPIAGxATAAT4SgFQMNHbPPhLIY4cjQRwAAAAAAAAAAAAAAAAJt4hBGDIzvQAyXD7AN7yABsCXDD4RvLgTNHbPCGOGyPQ0wH6QDAxyM+HIM6CEIc0LErPC4HMyXD7AJEw4uMA8gAUEwAo7UTQ0//TPzH4Q1jIy//LP87J7VQBAogVABRoZWxsb1dvcmxkAzgw+Eby4Ez4Qm7jACGT1NHQ3vpA1NHbPDDbPPIAGxgXACz4S/hK+EP4QsjL/8s/z4PLH/QAye1UAeog0P4UMCH4S4EBC/QLb6HjACBu8tBkIG7yf/gjIW8UvJj4ACBvEyFvEI4uIG8SIvkAuvLgZPgAIY0EcAAAAAAAAAAAAAAAABymaZCgyM7MyXD7ACBvEyFvEeLIz4WIzgH6AoBrz0DJcPsAW/hLgQEL9Fkw+GsZAQbQ2zwaACD6QNTR0PpA0//Tf9Mf0W8FAC7tRNDT/9M/0wAx0x/0BNH4a/hq+GP4YgAK+Eby4EwCCvSkIPShHx4AFHNvbCAwLjU4LjEAAA==",
    codeHash: "45c7355f37565525f9bddfdd4dd773135fdae9e5df8b9872eb5e5914f2c8fbca",
};
export default HelloWalletContract;