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
    tvc: "te6ccgECKQEABQAAAgE0AwEBAcACAEPQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgBCSK7VMg4wMgwP/jAiDA/uMC8gsmBQQoAujtRNDXScMB+GaNCGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAT4aSHbPNMAAY4SgQIA1xgg+QFY+EIg+GX5EPKo3tM/AfhDIbnytCD4I4ED6KiCCBt3QKC58rT4Y9MfAfgjvPK50x8B2zzyPAkGA1LtRNDXScMB+GYi0NMD+kAw+GmpOADcIccA4wIh1w0f8rwh4wMB2zzyPCUlBgM8IIIQHLaidLvjAiCCEFD1wjy74wIgghBotV8/u+MCFAsHAiggghBoF+U1uuMCIIIQaLVfP7rjAgoIAlAw+EJu4wD4RvJz0fhC8uBl+EUgbpIwcN74Qrry4Gb4APgj+GrbPPIACRsBSu1E0NdJwgGOGnDtRND0BXBt+Gv4aoBA9A7yvdcL//hicPhj4w0gAVAw0ds8+EohjhyNBHAAAAAAAAAAAAAAAAA6BflNYMjOyx/JcPsA3vIAIARQIIIQH51kg7rjAiCCEDcxLkW64wIgghA7Y9R+uuMCIIIQUPXCPLrjAhIQDgwDKjD4RvLgTPhCbuMA0//R2zww2zzyACANGwACMAM8MPhG8uBM+EJu4wAhk9TR0N76QNN/0gDR2zzjAPIAIA8iAEz4RSBukjBw3vhCuvLgZvgAEsjPhYDKAM+EQM4B+gKAa89AyXD7AAMmMPhG8uBM+EJu4wDR2zww2zzyACARGwAM+AD4I/hqA2gw+Eby4Ez4Qm7jANHbPCGOHCPQ0wH6QDAxyM+HIM6CEJ+dZIPPC4HL/8lw+wCRMOLjAPIAIBMiAAT4SgRQIIIQBzQsSrrjAiCCEBFWFOK64wIgghAbeIQRuuMCIIIQHLaidLrjAiEaGRUDODD4RvLgTPhCbuMAIZPU0dDe+kDU0ds8MNs88gAgFhsB4CH4S4EBC/QLb6HjACBu8tBqIG7yf/gjIW8UvJj4ACBvEyFvEI4uIG8SIvkAuvLga/gAIY0EcAAAAAAAAAAAAAAAABymaZCgyM7MyXD7ACBvEyFvEeLIz4WIzgH6AoBrz0DJcPsAW/hLgQEL9Fkw+GsXAQbQ2zwYACD6QNTR0PpA0//Tf9Mf0W8FAVAw0ds8+EshjhyNBHAAAAAAAAAAAAAAAAAm3iEEYMjO9ADJcPsA3vIAIAM+MPhG8uBM+EJu4wAhk9TR0N76QNP/0x/R2zww2zzyACAcGwAs+Ev4SvhD+ELIy//LP8+Dyx/0AMntVAKSaKb+YIIQO5rKALzy4Ggi+EuBAQv0Cm+hMfLQafhJI1UCaKb+YIIQBfXhAKG1f/gjVQSgtR9vBds8ySH4S4EBC/QzAfhrjoDeMB8dAUKI0P4UMCCNBHAAAAAAAAAAAAAAAAAaoVqBoMjOzslw+wAeACRUaGUgbG9jayBpcyBhZGRlZC4AIm8lXjDIzlUwyM7L/8t/yx/NAC7tRNDT/9M/0wAx0x/0BNH4a/hq+GP4YgJcMPhG8uBM0ds8IY4bI9DTAfpAMDHIz4cgzoIQhzQsSs8LgczJcPsAkTDi4wDyACMiACjtRNDT/9M/MfhDWMjL/8s/zsntVAECiCQAFGhlbGxvV29ybGQACvhG8uBMAgr0pCD0oSgnABRzb2wgMC41OC4yAAA=",
    code: "te6ccgECJgEABNMABCSK7VMg4wMgwP/jAiDA/uMC8gsjAgElAujtRNDXScMB+GaNCGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAT4aSHbPNMAAY4SgQIA1xgg+QFY+EIg+GX5EPKo3tM/AfhDIbnytCD4I4ED6KiCCBt3QKC58rT4Y9MfAfgjvPK50x8B2zzyPAYDA1LtRNDXScMB+GYi0NMD+kAw+GmpOADcIccA4wIh1w0f8rwh4wMB2zzyPCIiAwM8IIIQHLaidLvjAiCCEFD1wjy74wIgghBotV8/u+MCEQgEAiggghBoF+U1uuMCIIIQaLVfP7rjAgcFAlAw+EJu4wD4RvJz0fhC8uBl+EUgbpIwcN74Qrry4Gb4APgj+GrbPPIABhgBSu1E0NdJwgGOGnDtRND0BXBt+Gv4aoBA9A7yvdcL//hicPhj4w0dAVAw0ds8+EohjhyNBHAAAAAAAAAAAAAAAAA6BflNYMjOyx/JcPsA3vIAHQRQIIIQH51kg7rjAiCCEDcxLkW64wIgghA7Y9R+uuMCIIIQUPXCPLrjAg8NCwkDKjD4RvLgTPhCbuMA0//R2zww2zzyAB0KGAACMAM8MPhG8uBM+EJu4wAhk9TR0N76QNN/0gDR2zzjAPIAHQwfAEz4RSBukjBw3vhCuvLgZvgAEsjPhYDKAM+EQM4B+gKAa89AyXD7AAMmMPhG8uBM+EJu4wDR2zww2zzyAB0OGAAM+AD4I/hqA2gw+Eby4Ez4Qm7jANHbPCGOHCPQ0wH6QDAxyM+HIM6CEJ+dZIPPC4HL/8lw+wCRMOLjAPIAHRAfAAT4SgRQIIIQBzQsSrrjAiCCEBFWFOK64wIgghAbeIQRuuMCIIIQHLaidLrjAh4XFhIDODD4RvLgTPhCbuMAIZPU0dDe+kDU0ds8MNs88gAdExgB4CH4S4EBC/QLb6HjACBu8tBqIG7yf/gjIW8UvJj4ACBvEyFvEI4uIG8SIvkAuvLga/gAIY0EcAAAAAAAAAAAAAAAABymaZCgyM7MyXD7ACBvEyFvEeLIz4WIzgH6AoBrz0DJcPsAW/hLgQEL9Fkw+GsUAQbQ2zwVACD6QNTR0PpA0//Tf9Mf0W8FAVAw0ds8+EshjhyNBHAAAAAAAAAAAAAAAAAm3iEEYMjO9ADJcPsA3vIAHQM+MPhG8uBM+EJu4wAhk9TR0N76QNP/0x/R2zww2zzyAB0ZGAAs+Ev4SvhD+ELIy//LP8+Dyx/0AMntVAKSaKb+YIIQO5rKALzy4Ggi+EuBAQv0Cm+hMfLQafhJI1UCaKb+YIIQBfXhAKG1f/gjVQSgtR9vBds8ySH4S4EBC/QzAfhrjoDeMBwaAUKI0P4UMCCNBHAAAAAAAAAAAAAAAAAaoVqBoMjOzslw+wAbACRUaGUgbG9jayBpcyBhZGRlZC4AIm8lXjDIzlUwyM7L/8t/yx/NAC7tRNDT/9M/0wAx0x/0BNH4a/hq+GP4YgJcMPhG8uBM0ds8IY4bI9DTAfpAMDHIz4cgzoIQhzQsSs8LgczJcPsAkTDi4wDyACAfACjtRNDT/9M/MfhDWMjL/8s/zsntVAECiCEAFGhlbGxvV29ybGQACvhG8uBMAgr0pCD0oSUkABRzb2wgMC41OC4yAAA=",
    codeHash: "46d8d238bd61d085a0c322028b9a884d317c071481869a20835ac6797aded0fa",
};
export default HelloWalletContract;