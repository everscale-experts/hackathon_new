const ContractABI = {
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
                "name": "timestamp",
                "inputs": [],
                "outputs": [
                    {
                        "name": "timestamp",
                        "type": "uint32"
                    }
                ]
            }
        ],
        "data": [],
        "events": [],
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
            }
        ]
    },
    tvc: "te6ccgECGAEAAoUAAgE0AwEBAcACAEPQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgBCSK7VMg4wMgwP/jAiDA/uMC8gsVBQQXApztRNDXScMB+GYh2zzTAAGOEoECANcYIPkBWPhCIPhl+RDyqN7TPwH4QyG58rQg+COBA+iogggbd0CgufK0+GPTHwH4I7zyudMfAds88jwIBgNK7UTQ10nDAfhmItDXCwOpOADcIccA4wIh1w0f8rwh4wMB2zzyPBQUBgIoIIIQaBflNbvjAiCCEGi1Xz+64wIJBwJQMPhCbuMA+Ebyc9H4QvLgZfhFIG6SMHDe+EK68uBm+AD4I/hq2zzyAAgRAUTtRNDXScIBjhdw7UTQ9AVw+GqAQPQO8r3XC//4YnD4Y+MNDwRQIIIQBzQsSrrjAiCCEDcxLkW64wIgghA7Y9R+uuMCIIIQaBflNbrjAhANCwoBUDDR2zz4SiGOHI0EcAAAAAAAAAAAAAAAADoF+U1gyM7LH8lw+wDe8gAPAzww+Eby4Ez4Qm7jACGT1NHQ3vpA03/SANHbPOMA8gAPDBEATPhFIG6SMHDe+EK68uBm+AASyM+FgMoAz4RAzgH6AoBrz0DJcPsAAyYw+Eby4Ez4Qm7jANHbPDDbPPIADw4RACj4RSBukjBw3vhCuvLgZvgA+CP4agAm7UTQ0//TP9MAMdMf0fhq+GP4YgJcMPhG8uBM0ds8IY4bI9DTAfpAMDHIz4cgzoIQhzQsSs8LgczJcPsAkTDi4wDyABIRACT4SvhD+ELIy//LP8+Dyx/J7VQBAogTABRoZWxsb1dvcmxkAAr4RvLgTAIK9KQg9KEXFgAUc29sIDAuNTguMQAA",
    code: "te6ccgECFQEAAlgABCSK7VMg4wMgwP/jAiDA/uMC8gsSAgEUApztRNDXScMB+GYh2zzTAAGOEoECANcYIPkBWPhCIPhl+RDyqN7TPwH4QyG58rQg+COBA+iogggbd0CgufK0+GPTHwH4I7zyudMfAds88jwFAwNK7UTQ10nDAfhmItDXCwOpOADcIccA4wIh1w0f8rwh4wMB2zzyPBERAwIoIIIQaBflNbvjAiCCEGi1Xz+64wIGBAJQMPhCbuMA+Ebyc9H4QvLgZfhFIG6SMHDe+EK68uBm+AD4I/hq2zzyAAUOAUTtRNDXScIBjhdw7UTQ9AVw+GqAQPQO8r3XC//4YnD4Y+MNDARQIIIQBzQsSrrjAiCCEDcxLkW64wIgghA7Y9R+uuMCIIIQaBflNbrjAg0KCAcBUDDR2zz4SiGOHI0EcAAAAAAAAAAAAAAAADoF+U1gyM7LH8lw+wDe8gAMAzww+Eby4Ez4Qm7jACGT1NHQ3vpA03/SANHbPOMA8gAMCQ4ATPhFIG6SMHDe+EK68uBm+AASyM+FgMoAz4RAzgH6AoBrz0DJcPsAAyYw+Eby4Ez4Qm7jANHbPDDbPPIADAsOACj4RSBukjBw3vhCuvLgZvgA+CP4agAm7UTQ0//TP9MAMdMf0fhq+GP4YgJcMPhG8uBM0ds8IY4bI9DTAfpAMDHIz4cgzoIQhzQsSs8LgczJcPsAkTDi4wDyAA8OACT4SvhD+ELIy//LP8+Dyx/J7VQBAogQABRoZWxsb1dvcmxkAAr4RvLgTAIK9KQg9KEUEwAUc29sIDAuNTguMQAA",
    codeHash: "a585efbc25d9ca9a3b244f1fdb91f2c2de3e8080244e2d319310492f81837535",
};
module.exports = { ContractABI };
