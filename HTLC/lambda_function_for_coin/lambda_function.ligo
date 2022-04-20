
type return is list(operation);

type htlc_params is record[
    hash1 : bytes; 
    dest1 : address;
];
const htlcAddress:address=("KT1ATPHjqztswVvw6sGsYFFg1zbhMsaP3qUg":address);

function call_entrypoint (const gt:unit) : return is
   begin
   var operations: list(operation) := nil;
   const entry_point_creatLock : contract (htlc_params) =
    case (Tezos.get_entrypoint_opt ("%createLock", htlcAddress): option(contract(htlc_params))) of [
      Some (contract_b) -> contract_b
    | None -> (failwith ("Not a entrypoint") : (contract(htlc_params)))
    ];

    const params_for_entrypoint:htlc_params = record[
        hash1=("ff7a7aff":bytes);
        dest1=("KT19xGcNnDwB8uYy18k93FjFv9KNDEivbq87":address);
    ];

    operations := Tezos.transaction(params_for_entrypoint, 0mutez,  entry_point_creatLock) # operations;
   end with(operations)
