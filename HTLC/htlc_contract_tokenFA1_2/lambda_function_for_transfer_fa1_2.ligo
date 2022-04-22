
type return is list(operation);

type transfer is michelson_pair(address, "from", michelson_pair(address, "to", nat, "value"), "");

const tokenAddress:address=("KT1X9eKZyo6kQLkJTrjKmVt7MLC33xE6DfZB":address);

function call_entrypoint (const gt:unit) : return is
   begin
   var operations: list(operation) := nil;
    const entry_point : contract (transfer) =
    case (Tezos.get_entrypoint_opt ("%transfer", tokenAddress): option(contract(transfer))) of [
      Some (contract) -> contract
    | None -> (failwith ("Not a contract") : (contract(transfer)))
    ];

    
    var params_for_entrypoint : transfer := (Tezos.self_address,(("KT1MJ4cMX2vgvajHsrX9FtQCwjAr1CorjAbJ":address),10000n));

    operations := Tezos.transaction(params_for_entrypoint, 0mutez,  entry_point) # operations;
   end with(operations)

