const abi = {
  "ABI version": 2,
  "version": "2.2.0",
  "header": [
    "pubkey",
    "time",
    "expire"
  ],
  "functions": [
  {
    "name": "constructor",
    "inputs": [
    { "name":"name", "type":"string" },
    { "name":"symbol", "type":"string" },
    { "name":"decimals", "type":"uint8" },
    { "name":"root_pubkey", "type":"uint256" },
    { "name":"root_owner", "type":"optional(address)" },
    { "name":"total_supply", "type":"uint128" }
    ],
    "outputs": [
    ],
    "id": "0xa"
  },
  {
    "name": "setWalletCode",
    "inputs": [
    { "name":"_answer_id", "type":"uint32" },
    { "name":"wallet_code", "type":"cell" }
    ],
    "outputs": [
    { "name":"value0", "type":"bool" }
    ],
    "id": "0xb"
  },
  {
    "name": "deployWallet",
    "inputs": [
    { "name":"_answer_id", "type":"uint32" },
    { "name":"pubkey", "type":"uint256" },
    { "name":"owner", "type":"optional(address)" },
    { "name":"tokens", "type":"uint128" },
    { "name":"evers", "type":"uint128" }
    ],
    "outputs": [
    { "name":"value0", "type":"address" }
    ],
    "id": "0xc"
  },
  {
    "name": "deployEmptyWallet",
    "inputs": [
    { "name":"_answer_id", "type":"uint32" },
    { "name":"pubkey", "type":"uint256" },
    { "name":"owner", "type":"optional(address)" },
    { "name":"evers", "type":"uint128" }
    ],
    "outputs": [
    { "name":"value0", "type":"address" }
    ],
    "id": "0xd"
  },
  {
    "name": "grant",
    "inputs": [
    { "name":"_answer_id", "type":"uint32" },
    { "name":"dest", "type":"address" },
    { "name":"tokens", "type":"uint128" },
    { "name":"evers", "type":"uint128" }
    ],
    "outputs": [
    ],
    "id": "0xe"
  },
  {
    "name": "mint",
    "inputs": [
    { "name":"_answer_id", "type":"uint32" },
    { "name":"tokens", "type":"uint128" }
    ],
    "outputs": [
    { "name":"value0", "type":"bool" }
    ],
    "id": "0xf"
  },
  {
    "name": "requestTotalGranted",
    "inputs": [
    { "name":"_answer_id", "type":"uint32" }
    ],
    "outputs": [
    { "name":"value0", "type":"uint128" }
    ],
    "id": "0x10"
  },
  {
    "name": "getName",
    "inputs": [
    ],
    "outputs": [
    { "name":"value0", "type":"string" }
    ],
    "id": "0x11"
  },
  {
    "name": "getSymbol",
    "inputs": [
    ],
    "outputs": [
    { "name":"value0", "type":"string" }
    ],
    "id": "0x12"
  },
  {
    "name": "getDecimals",
    "inputs": [
    ],
    "outputs": [
    { "name":"value0", "type":"uint8" }
    ],
    "id": "0x13"
  },
  {
    "name": "getRootKey",
    "inputs": [
    ],
    "outputs": [
    { "name":"value0", "type":"uint256" }
    ],
    "id": "0x14"
  },
  {
    "name": "getTotalSupply",
    "inputs": [
    ],
    "outputs": [
    { "name":"value0", "type":"uint128" }
    ],
    "id": "0x15"
  },
  {
    "name": "getTotalGranted",
    "inputs": [
    ],
    "outputs": [
    { "name":"value0", "type":"uint128" }
    ],
    "id": "0x16"
  },
  {
    "name": "hasWalletCode",
    "inputs": [
    ],
    "outputs": [
    { "name":"value0", "type":"bool" }
    ],
    "id": "0x17"
  },
  {
    "name": "getWalletCode",
    "inputs": [
    ],
    "outputs": [
    { "name":"value0", "type":"cell" }
    ],
    "id": "0x18"
  },
  {
    "name": "getWalletAddress",
    "inputs": [
    { "name":"pubkey", "type":"uint256" },
    { "name":"owner", "type":"optional(address)" }
    ],
    "outputs": [
    { "name":"value0", "type":"address" }
    ],
    "id": "0x19"
  },
  {
    "name": "getWalletCodeHash",
    "inputs": [
    ],
    "outputs": [
    { "name":"value0", "type":"uint256" }
    ],
    "id": "0x1a"
  }
  ],
  "fields": [
    { "name":"__uninitialized", "type":"bool" },
    { "name":"__replay", "type":"uint64" },
    { "name":"name_", "type":"string" },
    { "name":"symbol_", "type":"string" },
    { "name":"decimals_", "type":"uint8" },
    { "name":"root_pubkey_", "type":"uint256" },
    { "name":"root_owner_", "type":"optional(address)" },
    { "name":"total_supply_", "type":"uint128" },
    { "name":"total_granted_", "type":"uint128" },
    { "name":"wallet_code_", "type":"optional(cell)" }
  ],
  "events": [
  ]
};

const contractPackageRoot = {
  abi,
  tvc:'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'
}
module.exports = contractPackageRoot;
