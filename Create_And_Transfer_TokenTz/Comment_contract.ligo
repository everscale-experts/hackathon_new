type storage is unit;

type parameter = {
  tokenContract: address,
  tokenId: nat,
  tokenAmount: nat,
  tokenSender: address,
  tokenRecipient: address,
  message: bytes
};


let dest : address = "KT1KR2ft6aRthjkcvTW9FrEPRQoxrfuTpark" as address;

let proxy = ([action, store]: [parameter, storage]): [list<operation>, storage] => {
  let counter: contract<parameter> =
    match ((Tezos.get_contract_opt(dest) as option<contract<parameter>>), {
    Some: (contract: any) => contract,
    None: () => (failwith("Contract not found.") as contract<parameter>)
    });
  /* Reuse the parameter in the subsequent
     transaction or use another one, `mock_param`. */
  let mock_param: parameter = transfer([tokenSender, txs=[tokenRecipient,tokenId, tokenAmount]] );
  let op: operation = Tezos.transaction(action, 0 as tez, counter);
  return [list([op]), store];
};





type comment is michelson_pair(message, "comment")
type entryAction is
  | Message of comment


function comment(const message : message): return is {message}


function main (const p : parameter; const s : storage) : return is
  block {
    skip
  } with case action of
    | Message(params) -> comment(param)
    
  end;
