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