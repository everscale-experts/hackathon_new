type storage = unit;

type parameter = {
  tokenContract: contract,
  tokenId: nat,
  tokenAmount: nat,
  tokenSender: address,
  tokenRecipient: address,
  message: bytes
};

let main = ([p, s] : [parameter, storage]) : [list <operation>, storage] => {
 // your code
};



//ссылки в помощь https://ligolang.org/docs/advanced/entrypoints-contracts/#inter-contract-invocations
//https://tezostaquito.io/docs/batch_API
//https://netezos.dev/docs/tezos-forging.html#forge-an-operation-group