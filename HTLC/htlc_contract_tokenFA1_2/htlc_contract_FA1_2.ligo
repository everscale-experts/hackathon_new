
// объявляем тип для данных в сундуке
type data is record[
  counter: int;
  date   : timestamp;
  dest : address;
  hash   : bytes;
  value  : nat;
  addressToken : address;
]
// тип даных которые берет token_default и вписывает их в сундук и проверяет количество твокенов 
type data_for_check is record[
  owner:address;
  date   : timestamp;
  dest : address;
  hash   : bytes;
  value  : nat;
  addressToken : address;
]

// типы big map стореджа
type balances_token is big_map(address,nat)
type chest is big_map(address, data)
type chests_for_check is big_map(int,data_for_check)

(*объявляем тип storage*)
type storage is record [
    counter: int;
    chests : chest;
    balances_token:balances_token;
    chests_for_check: chests_for_check;
];

type token_id is nat;

// типы для трансфера токенов 
type transfer is michelson_pair(address, "from", michelson_pair(address, "to", nat, "value"), "")

// типы для вызова метода контракта токена getBalance

type balance_of_param is
record [
 address : address;
 contract : contract (nat);
];
// тип для добаления адресса с нулевым балансом 
type addTokenParams_for_entrypoint is record[
    addressContractToken : address;
]

(*объявляем псевдонимы входящих параметров для каждой базовой функции*)

type createLockParams is record[
    tokenAddress:address;
    amount_tokens: nat; 
    hash1 : bytes; 
    dest1 : address;
];
type openLockParams is michelson_pair(address, "dest", bytes,"secret");
type default_tokenParams is nat

(*псевдо-точки входа*)
type parameter is 
| CreateLock of createLockParams
| OpenLock of openLockParams
| Default_token of default_tokenParams

(*тип возвращаемых данных*)
type return is list(operation) * storage


// фуекция которую вызывает контракт токенов 
function default_token(const callback_f :nat; var s :storage): return is 
    begin
    // ищем баланс контракта токенов
    const value_stored : nat = 
    case Big_map.find_opt(Tezos.sender, s.balances_token) of[
        | Some (c) -> c
        | None -> failwith("Error balance token")
    ];
    //записываем баланс до обновления 
    var balance_before: nat:= value_stored;
    // обновляем баланс этого токена 
    const balance_after= callback_f;
    
    const updated_big_map: balances_token = Big_map.update(Tezos.sender, Some(balance_after), s.balances_token);
     s := s with record [balances_token = updated_big_map];

      //записыаем количество переведенных токенов на баланс 
    const amount_tokens_check:nat= abs(balance_before-balance_after);
    // находим в big map по counter значеия которые будем записывать в сундук 
    const value_chest : data_for_check = 
    case Big_map.find_opt(s.counter, s.chests_for_check) of[
        | Some (c) -> c
        | None -> failwith("Error balance token")
    ];
    // делаем так чтобы этот метод не могли вызввать поьзовотели 
    if Tezos.sender =/= value_chest.addressToken
    then failwith("Error: call method contract")
    else skip;
    // проверям верно ли пользователь ввел количество токенов для перевода на htlc contract
    if value_chest.value > amount_tokens_check
    then failwith("Error transfer amount")
    else skip;
    // записываем в сундук данные 
    const data : data = record[
        counter=s.counter;
        date = Tezos.now + 3_600; 
        dest = value_chest.dest; 
        hash = value_chest.hash;
        value =abs(value_chest.value-1n);
        addressToken= value_chest.addressToken;
         ];
     const updated_map: chest = Big_map.update(value_chest.owner, Some(data), s.chests);
     s := s with record [chests = updated_map]; 
     (*После прочтения удаляем запись из big_map*)
    const updated_map : chests_for_check = Big_map.remove (s.counter, s.chests_for_check);
    s := s with record [chests_for_check = updated_map]; 

end with((nil : list(operation)),s)



// добавляет нулевые балансы новых токенов 
function addToken(const addTokenParams_for_entrypoint:addTokenParams_for_entrypoint; var s:storage ): return is 
    begin
    
    case Big_map.find_opt(addTokenParams_for_entrypoint.addressContractToken, s.balances_token) of[
        // если нашли адресс владельца токена, то ищем id токена 
        | Some (_c) -> {skip}
        // если не находим добавляем в big map нулевой баланс
        | None -> {
            const balance_token = 0n;
            const updated_big_map: balances_token = Big_map.update(addTokenParams_for_entrypoint.addressContractToken, Some(balance_token), s.balances_token);
             s := s with record [balances_token = updated_big_map];
        }
    ];

end with ((nil : list(operation)), s);



function createLock (const tokenAddress:address;const amount_tokens: nat; const hash1 : bytes; const dest1 : address; var s : storage): return is
    begin  
    var operations: list(operation) := nil;
    (*счеткик *)
    s.counter := s.counter + 1;
    const parametr_for_enryPointAddToken : addTokenParams_for_entrypoint = record[
        addressContractToken = tokenAddress;
    ];
    // вызываем функцию addToken
    const fd :return= addToken(parametr_for_enryPointAddToken,s);
    s:=fd.1;
    
    // вызов метода контракта токенов
    const entry_point_balance : contract (balance_of_param) =
    case (Tezos.get_entrypoint_opt ("%getBalance", tokenAddress): option(contract(balance_of_param))) of [
      Some (contract_b) -> contract_b
    | None -> (failwith ("Not a balance_of") : (contract(balance_of_param)))
    ];

    const callback_balance : contract (nat) =
    case (Tezos.get_entrypoint_opt ("%default_token",Tezos.self_address): option(contract(nat))) of [
      Some (contract_b) -> contract_b
    | None -> (failwith ("Error: Not a callback_balance") : (contract(nat)))
    ];

    var balance_htlc_contract : balance_of_param := record [
        address = Tezos.self_address;
        contract = callback_balance
    ];
    
    operations := Tezos.transaction(balance_htlc_contract, 0mutez,  entry_point_balance) # operations;
    (*проверяем перевели ли нам больше токенов чем минимальный перевод или нет*)
    if amount_tokens < 2n
    then failwith("Error: you have transfered few tokens")
    else skip;

    const data_for_check : data_for_check = record[
        owner=Tezos.sender;
        date = Tezos.now + 3_600; 
        dest = dest1; 
        hash = hash1;
        value =amount_tokens;
        addressToken= tokenAddress;
         ];
     const updated_map: chests_for_check = Big_map.update(s.counter, Some(data_for_check), s.chests_for_check);
     s := s with record [chests_for_check = updated_map]; 
     
end with (operations, s)

function openLock (const dest: address; const secret: bytes; var s: storage):return is 
    begin 

    // записываем "ложные" данные, одля того чтобы их перезаписать
     var data : data := record[
        counter= s.counter;
        date = Tezos.now + 3_600; 
        dest = dest; 
        hash = Crypto.sha256(secret);
        value = 0n;
        addressToken= dest;
         ];
    (*поиск нужного сундука*)
    case Big_map.find_opt(Tezos.sender, s.chests) of[
    | Some (c) -> data := c
    | None -> failwith("You have not chest")
    ];
    (*После прочтения удаляем запись из big_map*)
    const updated_map : chest = Big_map.remove (Tezos.sender, s.chests);
    s := s with record [chests = updated_map]; 

    // вызов метода контракта работает 
    const entry_point : contract (transfer) =
    case (Tezos.get_entrypoint_opt ("%transfer", data.addressToken): option(contract(transfer))) of [
      Some (contract) -> contract
    | None -> (failwith ("Not a contract") : (contract(transfer)))
    ];

    var operations: list(operation) := nil;
    
    var transfer_destination : transfer := (Tezos.self_address,(dest,data.value));
    // record[
    //     from_=Tezos.self_address;
    //     to_ = dest;
    //     value= data.value;
    // ];
    const transfer_receiver : transfer = (Tezos.self_address,(Tezos.sender,data.value));
    // record[
    //     from_=Tezos.self_address;
    //     to_ = Tezos.sender;
    //     value= data.value;
    // ];

   
    (*Не просрочена ли транзакция*)
    if Tezos.now > data.date
    then {
        operations := Tezos.transaction(transfer_destination, 0mutez,  entry_point) # operations;
    }
    else {
        if Crypto.sha256(secret) = data.hash
        then{
            operations := Tezos.transaction(transfer_destination, 0mutez,  entry_point) # operations;
        }
        else {
            operations := Tezos.transaction(transfer_destination, 0mutez,  entry_point) # operations;
        }
    };
    // вычетаем сумму из баланса, которую перевели при открытии сундука 
    // ищем баланс токена
    const value_stored : nat = 
    case Big_map.find_opt(data.addressToken, s.balances_token) of[
        | Some (c) -> c
        | None -> failwith("Error balance token")
    ];
   
    const balanse_now =abs(value_stored-data.value);
    // обновляем баланс этого токена 
   
    const updated_big_map: balances_token = Big_map.update(data.addressToken, Some(balanse_now), s.balances_token);
     s := s with record [balances_token = updated_big_map];

end with (operations, s)


function main(const p:parameter; var s:storage): return is 
case p of [
| CreateLock(params)-> createLock(params.tokenAddress,params.amount_tokens,params.hash1,params.dest1,s)
| OpenLock(params)-> openLock(params.0,params.1, s)
| Default_token(params) -> default_token(params, s)
];