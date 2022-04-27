use crate::tezos::get::*;
use crate::tezos::operation::*;

pub(crate) fn transfer_mutez_proposal(
    branch: &str,
    tme_id: usize,
    amount: u64,
) -> serde_json::Value {
    let sender = get_address_by_tme(tme_id);
    let counter = get_address_counter(
        sender["address"].as_str().unwrap().to_string(),
    ) + 1;
    let parameters = serde_json::json!({
        "entrypoint": "transfer_mutez_proposal",
        "value": build_parameters(
            tezos_multisig().as_str(),
            "transfer_mutez_proposal",
            serde_json::json!({
                "mutez_amount": amount,
                "destination": tezos_coin_htlc()
            }),
        ).unwrap(),
    });
    let test_op = serde_json::json!([{
        "kind": "transaction",
        "source": sender["address"],
        "destination": tezos_multisig(),
        "fee": "100000",
        "counter": format!("{}", counter as u64),
        "gas_limit": "10300",
        "storage_limit": "256",
        "amount": "0",
        "parameters": parameters,
    }]);
    let run_op_res = simulate_operation(
        branch,
        test_op,
    ).unwrap();
    serde_json::json!({
        "kind": "transaction",
        "source": sender["address"],
        "destination": tezos_multisig(),
        "fee": format!("{}", estimate_operation_fee(
            &run_op_res.consumed_gas.parse::<u64>().unwrap(),
            &run_op_res.storage_size.parse::<u64>().unwrap(),
        )),
        "counter": format!("{}", counter as u64),
        "gas_limit": format!("{}", run_op_res.consumed_gas.parse::<u64>().unwrap() + 100),
        "storage_limit": format!("{}", run_op_res.used_storage.parse::<u64>().unwrap() + 257),
        "amount": "0",
        "parameters": parameters,
    })
}

pub(crate) fn transfer_token_proposal(
    branch: &str,
    tme_id: usize,
    amount: u64,
) -> serde_json::Value {
    let sender = get_address_by_tme(tme_id);
    let counter = get_address_counter(
        sender["address"].as_str().unwrap().to_string(),
    ) + 1;
    let parameters = serde_json::json!({
        "entrypoint": "transfer_token_proposal",
        "value": build_parameters(
            tezos_multisig().as_str(),
            "transfer_token_proposal",
            serde_json::json!({
                "token_contract": tezos_token_address(),
                "token_id": 1u64,
                "token_amount": amount,
                "destination": tezos_htlc()
            }),
        ).unwrap(),
    });
    let test_op = serde_json::json!([{
        "kind": "transaction",
        "source": sender["address"],
        "destination": tezos_multisig(),
        "fee": "100000",
        "counter": format!("{}", counter as u64),
        "gas_limit": "10300",
        "storage_limit": "256",
        "amount": "0",
        "parameters": parameters,
    }]);
    let run_op_res = simulate_operation(
        branch,
        test_op,
    ).unwrap();
    serde_json::json!({
        "kind": "transaction",
        "source": sender["address"],
        "destination": tezos_multisig(),
        "fee": format!("{}", estimate_operation_fee(
            &run_op_res.consumed_gas.parse::<u64>().unwrap(),
            &run_op_res.storage_size.parse::<u64>().unwrap(),
        )),
        "counter": format!("{}", counter as u64),
        "gas_limit": format!("{}", run_op_res.consumed_gas.parse::<u64>().unwrap() + 100),
        "storage_limit": format!("{}", run_op_res.used_storage.parse::<u64>().unwrap() + 257),
        "amount": "0",
        "parameters": parameters,
    })
}

pub(crate) fn lambda_proposal(
    branch: &str,
    tme_id: usize,
    dest: &str,
    hash: &str,
) -> serde_json::Value {
    let sender = get_address_by_tme(tme_id);
    let counter = get_address_counter(
        sender["address"].as_str().unwrap().to_string(),
    ) + 1;
    let parameters = serde_json::json!({
        "entrypoint": "lambda_proposal",
        "value": build_parameters(
            tezos_multisig().as_str(),
            "lambda_proposal",
            serde_json::json!(format!(
                r#"[
                    {{ "prim": "DROP" }},
                    {{
                        "prim": "PUSH",
                        "args": [
                            {{ "prim": "address" }},
                            {{ "string": "{htlc2_coins}" }}
                        ]
                    }},
                    {{
                        "prim": "CONTRACT",
                        "annots": [ "%createLock" ],
                        "args": [
                            {{
                                "prim": "pair",
                                "args": [
                                    {{
                                        "prim": "address",
                                        "annots": [ "%dest1" ]
                                    }},
                                    {{
                                        "prim": "bytes",
                                        "annots": [ "%hash1" ]
                                    }}
                                ]
                            }}
                        ]
                    }},
                    {{
                        "prim": "IF_NONE",
                        "args": [
                            [
                                {{
                                    "prim": "PUSH",
                                    "args": [
                                        {{ "prim": "string" }},
                                        {{ "string": "Not a entrypoint" }}
                                    ]
                                }},
                                {{ "prim": "FAILWITH" }}
                            ], []
                        ]
                    }},
                    {{
                        "prim": "NIL",
                        "args": [
                            {{ "prim": "operation" }}
                        ]
                    }},
                    {{
                        "prim": "SWAP"
                    }},
                    {{
                        "prim": "PUSH",
                        "args": [
                            {{ "prim": "mutez" }},
                            {{ "int": "0" }}
                        ]
                    }},
                    {{
                        "prim": "PUSH",
                        "args": [
                            {{ "prim": "bytes" }},
                            {{ "bytes": "{hash}" }}
                        ]
                    }},
                    {{
                        "prim": "PUSH",
                        "args": [
                            {{ "prim": "address" }},
                            {{ "string": "{destination}" }}
                        ]
                    }},
                    {{ "prim": "PAIR" }},
                    {{ "prim": "TRANSFER_TOKENS" }},
                    {{ "prim": "CONS" }}
                ]"#,
                htlc2_coins = tezos_coin_htlc(),
                hash = hash,
                destination = dest,
            )
        )).unwrap(),
    });
    let test_op = serde_json::json!([{
        "kind": "transaction",
        "source": sender["address"],
        "destination": tezos_multisig(),
        "fee": "100000",
        "counter": format!("{}", counter as u64),
        "gas_limit": "10300",
        "storage_limit": "256",
        "amount": "0",
        "parameters": parameters,
    }]);
    let run_op_res = simulate_operation(
        branch,
        test_op,
    ).unwrap();
    serde_json::json!({
        "kind": "transaction",
        "source": sender["address"],
        "destination": tezos_multisig(),
        "fee": format!("{}", estimate_operation_fee(
            &run_op_res.consumed_gas.parse::<u64>().unwrap(),
            &run_op_res.storage_size.parse::<u64>().unwrap(),
        )),
        "counter": format!("{}", counter as u64),
        "gas_limit": format!("{}", run_op_res.consumed_gas.parse::<u64>().unwrap() + 100),
        "storage_limit": format!("{}", run_op_res.used_storage.parse::<u64>().unwrap() + 257),
        "amount": "0",
        "parameters": parameters,
    })
}