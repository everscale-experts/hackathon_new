use super::get::*; /* import from mod */
use crate::tezos::proposals::*;
use crate::tezos::operation::*;

pub fn vote_method(
    branch: &str,
    tme_id: usize,
    proposal_id: u64
) -> serde_json::Value {
    let sender = get_address_by_tme(tme_id);
    let counter = get_address_counter(
        sender["address"].as_str().unwrap().to_string(),
    ) + 1;
    let parameters = serde_json::json!({
        "entrypoint": "vote_proposal",
        "value": build_parameters(
            tezos_multisig().as_ref(),
            "vote_proposal",
            serde_json::json!({
                "proposal_id": proposal_id,
                "approval": true,
            }),
        ).unwrap()
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

pub fn create_and_vote_proposal(branch: &str, prop: usize, dest: &str, hash: &str) -> u64{
    create_proposal(branch, prop, dest, hash);
    let proposal_id = get_proposal_id();
    let mut votes = vec![];
    for i in 0..3 {
        let group = vec![vote_method(branch, i, proposal_id)];
        let sign_res = sign_operation(
            branch,
            i,
            group,
        ).unwrap();
        let hash = inject_operations(
            sign_res.operation_with_signature.as_str(),
        ).unwrap().as_str().unwrap().to_string();
        println!("Vote {}: {}", i + 1, hash);
        votes.push(hash);
        // println!("Vote {}: {}", i + 1, if inject_res.is_ok() { "ok" } else { "failed" });
    }
    println!("{}\n", if await_confirmations(votes) { "Applied" } else { "Failed" });
    proposal_id
}

pub fn create_proposal(branch: &str, prop: usize, dest: &str, hash: &str) {
    let tme_id = 2;
    let group = if prop == 0 {
        vec![transfer_token_proposal(branch, tme_id, 1000)]
    } else if prop == 1{
        vec![transfer_mutez_proposal(branch, tme_id, 1100000)]
    } else {
        vec![lambda_proposal(branch, tme_id, dest, hash)]
    };
    let sign_res = sign_operation(
        branch,
        tme_id,
        group,
    ).unwrap();
    let hash = inject_operations(
        sign_res.operation_with_signature.as_str(),
    ).unwrap().as_str().unwrap().to_string();
    println!("{}", hash);
    println!("{}\n", if await_confirmation(hash.as_str()) { "Applied" } else { "Failed" });
}