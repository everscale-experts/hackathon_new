use serde_json::Value;

use crate::tezos::multisig::create_and_vote_proposal;
use crate::tezos::operation::*;
use crate::tezos::get::*;

fn msig_to_htlc_group(
    branch: &str,
    tme_id: usize,
    proposal_id: u64,
    hash: &str,
    address: &str,
    tokens: u64,
) -> Vec<serde_json::Value> {
    let mut group = Vec::<serde_json::Value>::new();
    let sender = get_address_by_tme(tme_id);
    let counter = get_address_counter(sender["address"].as_str().unwrap().to_string()) + 1;
    let test_op = test_execute_proposal_json(counter, sender.clone(), proposal_id);
    let additional_gas = 7000; // for token transfer
    let run_op_res = simulate_operation(
        branch.clone(),
        test_op,
    ).unwrap();
    group.push(execute_proposal_json(
        counter,
        sender.clone(),
        format!("{}", estimate_operation_fee(
            &run_op_res.consumed_gas.parse::<u64>().unwrap(),
            &run_op_res.storage_size.parse::<u64>().unwrap(),
        )).as_str(),
        format!("{}", run_op_res.consumed_gas.parse::<u64>().unwrap() + 200 + additional_gas).as_str(),
        format!("{}", run_op_res.used_storage.parse::<u64>().unwrap()).as_str(),
        proposal_id,
    ));
    let params_for_create_lock = serde_json::json!({
        "entrypoint": "createLock",
        "value": build_parameters(
            tezos_htlc().as_str(),
            "createLock",
            serde_json::json!({
                "tokenAddress": tezos_token_address(),
                "pair": {
                    "id_tokens": 1u64,
                    "pair": {
                        "amount_tokens": tokens,
                        "pair": {
                            "hash": hash,
                            "dest": address,
                        }
                    }
                }
            }),
        ).unwrap()
    });
    let run_op_res = simulate_operation(
        branch.clone(),
        serde_json::json!([{
            "kind": "transaction",
            "source": sender["address"],
            "destination": tezos_htlc(),
            "fee": "100000",
            "counter": format!("{}", counter),
            "gas_limit": "10300",
            "storage_limit": "256",
            "amount": "0",
            "parameters": params_for_create_lock,
        }]),
    ).unwrap();
    let additional_gas: u64 = 6100;
    // let additional_gas: u64 = get_gas_for_lock(rpc, endpoint, branch, tokens, counter, sender.clone());
    group.push(serde_json::json!({
        "kind": "transaction",
        "source": sender["address"],
        "destination": tezos_htlc(),
        "fee": format!("{}", estimate_operation_fee(
            &run_op_res.consumed_gas.parse::<u64>().unwrap(),
            &run_op_res.storage_size.parse::<u64>().unwrap(),
        )),
        "counter": format!("{}", counter + 1),
        "gas_limit": format!("{}", run_op_res.consumed_gas.parse::<u64>().unwrap() + 100 + additional_gas),
        "storage_limit": format!("{}", run_op_res.used_storage.parse::<u64>().unwrap() + 257),
        "amount": "0",
        "parameters": params_for_create_lock,
    }));
    group
}

fn msig_to_htlc_group_with_coins(
    branch: &str,
    tme_id: usize,
    proposal_id: u64,
) -> Vec<serde_json::Value> {
    let mut group = Vec::<serde_json::Value>::new();
    let sender = get_address_by_tme(tme_id);
    let counter = get_address_counter(
        sender["address"].as_str().unwrap().to_string(),
    ) + 1;
    let test_op = test_execute_proposal_json(counter, sender.clone(), proposal_id);
    let additional_gas = 3000;
    let run_op_res = simulate_operation(
        branch.clone(),
        test_op,
    ).unwrap();
    group.push(execute_proposal_json(
        counter,
        sender,
        format!("{}", estimate_operation_fee(
            &run_op_res.consumed_gas.parse::<u64>().unwrap(),
            &run_op_res.storage_size.parse::<u64>().unwrap(),
        )).as_str(),
        format!("{}", run_op_res.consumed_gas.parse::<u64>().unwrap() + 200 + additional_gas).as_str(),
        format!("{}", run_op_res.used_storage.parse::<u64>().unwrap()).as_str(),
        proposal_id,
    ));
    group
}

fn execute_proposal_json(
    counter: u64,
    sender: Value,
    fee: &str,
    gas_limit: &str,
    storage_limit: &str,
    proposal_id: u64,
) -> Value {
    serde_json::json!({
        "kind": "transaction",
        "source": sender["address"],
        "destination": tezos_multisig(),
        "fee": fee,
        "counter": format!("{}", counter as u64),
        "gas_limit": gas_limit,
        "storage_limit": storage_limit,
        "amount": "0",
        "parameters": {
            "entrypoint": "execute_proposal",
            "value": { "int" : format!("{}", proposal_id) }
        }
    })
}

fn test_execute_proposal_json(
    counter: u64,
    sender: Value,
    proposal_id: u64,
) -> Value {
    serde_json::json!([execute_proposal_json(
        counter,
        sender,
        "100000",
        "10300",
        "257",
        proposal_id,
    )])
}

pub fn create_batch(hash: &str, dest: &str) {
    let tezos_msig_executor = 1;
    let branch = get_block_hash();
    // prop = 0 - for calling transfer_token_proposal
    // prop = 1 - for calling transfer_mutez_proposal
    // prop = 2 - for calling lambda_proposal
    // let proposal_id = create_and_vote_proposal(branch.as_str(), 0, dest, hash);
    let group = msig_to_htlc_group(
        branch.as_str(),
        tezos_msig_executor,
        // proposal_id,
        51,
        hash,
        dest,
        1000,
    );
    let res = sign_operation(
        branch.as_str(),
        tezos_msig_executor,
        group,
    ).unwrap();
    let inject_res = inject_operations(res.operation_with_signature.as_str()).unwrap();
    println!("https://hangzhou2net.tzkt.io/{}", inject_res.as_str().unwrap());
    println!("{}", inject_res);
}

pub fn create_batch_with_coins(hash: &str, dest: &str) {
    let tezos_msig_executor = 1;
    let branch = get_block_hash();
    for i in 1..3 {
        let proposal_id = create_and_vote_proposal(branch.as_str(), i, dest, hash);
        let group = msig_to_htlc_group_with_coins(
            branch.as_str(),
            tezos_msig_executor,
            proposal_id,
            // 51,
        );
        let res = sign_operation(
            branch.as_str(),
            tezos_msig_executor,
            group,
        ).unwrap();
        let inject_res = inject_operations(res.operation_with_signature.as_str()).unwrap();
        println!("https://hangzhou2net.tzkt.io/{}", inject_res.as_str().unwrap());
        println!("{}", inject_res);
    }
}