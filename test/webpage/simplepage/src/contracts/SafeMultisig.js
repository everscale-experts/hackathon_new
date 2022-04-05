const abi = {
	"ABI version": 2,
	"header": ["pubkey", "time", "expire"],
	"functions": [
		{
			"name": "constructor",
			"inputs": [
				{"name":"owners","type":"uint256[]"},
				{"name":"reqConfirms","type":"uint8"}
			],
			"outputs": [
			]
		},
		{
			"name": "acceptTransfer",
			"inputs": [
				{"name":"payload","type":"bytes"}
			],
			"outputs": [
			]
		},
		{
			"name": "sendTransaction",
			"inputs": [
				{"name":"dest","type":"address"},
				{"name":"value","type":"uint128"},
				{"name":"bounce","type":"bool"},
				{"name":"flags","type":"uint8"},
				{"name":"payload","type":"cell"}
			],
			"outputs": [
			]
		},
		{
			"name": "submitTransaction",
			"inputs": [
				{"name":"dest","type":"address"},
				{"name":"value","type":"uint128"},
				{"name":"bounce","type":"bool"},
				{"name":"allBalance","type":"bool"},
				{"name":"payload","type":"cell"}
			],
			"outputs": [
				{"name":"transId","type":"uint64"}
			]
		},
		{
			"name": "confirmTransaction",
			"inputs": [
				{"name":"transactionId","type":"uint64"}
			],
			"outputs": [
			]
		},
		{
			"name": "isConfirmed",
			"inputs": [
				{"name":"mask","type":"uint32"},
				{"name":"index","type":"uint8"}
			],
			"outputs": [
				{"name":"confirmed","type":"bool"}
			]
		},
		{
			"name": "getParameters",
			"inputs": [
			],
			"outputs": [
				{"name":"maxQueuedTransactions","type":"uint8"},
				{"name":"maxCustodianCount","type":"uint8"},
				{"name":"expirationTime","type":"uint64"},
				{"name":"minValue","type":"uint128"},
				{"name":"requiredTxnConfirms","type":"uint8"}
			]
		},
		{
			"name": "getTransaction",
			"inputs": [
				{"name":"transactionId","type":"uint64"}
			],
			"outputs": [
				{"components":[{"name":"id","type":"uint64"},{"name":"confirmationsMask","type":"uint32"},{"name":"signsRequired","type":"uint8"},{"name":"signsReceived","type":"uint8"},{"name":"creator","type":"uint256"},{"name":"index","type":"uint8"},{"name":"dest","type":"address"},{"name":"value","type":"uint128"},{"name":"sendFlags","type":"uint16"},{"name":"payload","type":"cell"},{"name":"bounce","type":"bool"}],"name":"trans","type":"tuple"}
			]
		},
		{
			"name": "getTransactions",
			"inputs": [
			],
			"outputs": [
				{"components":[{"name":"id","type":"uint64"},{"name":"confirmationsMask","type":"uint32"},{"name":"signsRequired","type":"uint8"},{"name":"signsReceived","type":"uint8"},{"name":"creator","type":"uint256"},{"name":"index","type":"uint8"},{"name":"dest","type":"address"},{"name":"value","type":"uint128"},{"name":"sendFlags","type":"uint16"},{"name":"payload","type":"cell"},{"name":"bounce","type":"bool"}],"name":"transactions","type":"tuple[]"}
			]
		},
		{
			"name": "getTransactionIds",
			"inputs": [
			],
			"outputs": [
				{"name":"ids","type":"uint64[]"}
			]
		},
		{
			"name": "getCustodians",
			"inputs": [
			],
			"outputs": [
				{"components":[{"name":"index","type":"uint8"},{"name":"pubkey","type":"uint256"}],"name":"custodians","type":"tuple[]"}
			]
		}
	],
	"data": [
	],
	"events": [
		{
			"name": "TransferAccepted",
			"inputs": [
				{"name":"payload","type":"bytes"}
			],
			"outputs": [
			]
		}
	]
};

const contractPackageSM = {
  abi,
  tvc:'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'
}
module.exports = contractPackageSM;
