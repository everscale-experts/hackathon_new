mod tonos;
use chrono::Local;
use chrono::TimeZone;
use ton_client::ClientContext;
use ton_client::abi::Abi;
use ton_client::abi::FunctionHeader;
use ton_client::abi::ResultOfEncodeMessage;
use ton_client::abi::encode_message;
use ton_client::crypto::KeyPair;
use tonos::process_message;
use ton_client::tvm::ParamsOfRunTvm;
use ton_client::tvm::run_tvm;
use tonos::Config;
use tonos::TonClient;
use tonos::create_client_verbose;
use tonos::load_abi;
use tonos::load_ton_address;
use serde_json::Value;
use serde_json::to_string_pretty;
use tonos::now;
use tonos::now_ms;
use tonos::prepare_execution_options;
use tonos::prepare_message_params;
use tonos::query_account_field;

fn get_json_field(file: &str, name: &str) -> Value {
    serde_json::from_str::<Value>(std::fs::read_to_string(file).unwrap().as_str())
        .unwrap()[name]
        .clone()
}

// async fn submit_transaction(
//     address: &str,
//     dest: &str,
//     amount: &str,
//     msg: &str
// ) -> Result<(), String> {
// }

async fn run_local(
    ton: TonClient,
    abi: Abi,
    msg: String,
    acc_boc: String,
    bc_config: Option<&str>,
) -> Result<serde_json::Value, String> {
    let execution_options = prepare_execution_options(bc_config)?;
    let result = run_tvm(
        ton.clone(),
        ParamsOfRunTvm {
            message: msg,
            account: acc_boc,
            abi: Some(abi.clone()),
            return_updated_account: Some(true),
            execution_options,
            ..Default::default()
        },
    ).await
        .map_err(|e| format!("{:#}", e))?;
    let res = result.decoded.and_then(|d| d.output)
        .ok_or("Failed to decode the result. Check that abi matches the contract.")?;
    Ok(res)
}

pub async fn call_contract_with_client(
    ton: std::sync::Arc<ClientContext>,
    conf: Config,
    addr: &str,
    abi: String,
    method: &str,
    params: &str,
    keys: Option<String>,
    local: bool,
    is_fee: bool,
) -> Result<serde_json::Value, String> {
    let abi = load_abi(&abi)?;

    let expire_at = conf.lifetime + now()?;
    let time = now_ms();
    let header = FunctionHeader {
        expire: Some(expire_at),
        time: Some(time),
        ..Default::default()
    };
    let msg_params = prepare_message_params(
        addr,
        abi.clone(),
        method,
        params,
        Some(header),
        keys.clone(),
    )?;

    let needs_encoded_msg = is_fee ||
        local ||
        conf.async_call ||
        conf.local_run;

    if needs_encoded_msg {
        let mut msg = encode_message(ton.clone(), msg_params.clone()).await
            .map_err(|e| format!("failed to create inbound message: {}", e))?;
        let signature1 = ton_client::crypto::sign(ton.clone(), ton_client::crypto::ParamsOfSign{ unsigned: msg.message.clone(), keys: KeyPair { 
            public: "f8780f83d8c5951de73cb3c07b134ecd5d00917a9083e3ea30721ca10063defc".to_owned(),
            secret: "c9188e64524c0a30418d9f6d05a252e5c67d817de560bd5a14a6b0d3ac63d497".to_owned(),
        }}).unwrap().signed;
        let signature2 = ton_client::crypto::sign(ton.clone(), ton_client::crypto::ParamsOfSign{ unsigned: signature1.clone(), keys: KeyPair { 
            public: "e795829a2d866d52b611e40ccc0cda9b720565a15d3aa62b96073baab45e7d27".to_owned(),
            secret: "248acf719f50d079f7f719830a88d490dab45a67c917a9e479b2e991eaed5711".to_owned(),
        }}).unwrap().signed;
        let signature3 = ton_client::crypto::sign(ton.clone(), ton_client::crypto::ParamsOfSign{ unsigned: signature2.clone(), keys: KeyPair { 
            public: "8b9be2bea26b47c293b28f8361ec63ea325a53105c866110b2525d4a38deff11".to_owned(),
            secret: "6fba472ef24db9b9d99580f6d8bdd8bde4ae6f5ce51f79089190e7c3b659362a".to_owned(),
        }}).unwrap().signed;
        // println!("{}", signature1);
        // println!("{}", signature2);
        // println!("{}", signature3);
        // println!("{}", msg.message);
        // if let Some(d) = msg.data_to_sign {
            // println!("data to sign: {}", d);
        // }
        // println!("{}", msg.address);
        // println!("{}", msg.message_id);
        // msg.message = signature3;

        if local {
            if !conf.is_json {
                println!("Running get-method...");
            }
            let acc_boc = query_account_field(ton.clone(), addr, "boc").await?;
            return run_local(ton.clone(), abi, msg.message.clone(), acc_boc, None).await;
        }
        if conf.local_run || is_fee {
            tonos::emulate_locally(ton.clone(), addr, msg.message.clone(), is_fee).await?;
            if is_fee {
                return Ok(Value::Null);
            }
        }
        if conf.async_call {
            return tonos::send_message_and_wait(ton,
                                         Some(abi),
                                         msg.message,
                                         conf).await;
        }
    }

    if !conf.is_json {
        print!("Expire at: ");
        let expire_at = Local.timestamp(expire_at as i64 , 0);
        println!("{}", expire_at.to_rfc2822());
    }
    process_message(ton.clone(), msg_params, conf.is_json).await
}

#[tokio::main]
async fn main() {
    let address = get_json_field("config.json", "address");
    let config = Config::from_json(
        serde_json::from_str(
            std::fs::read_to_string(
                "run_config.json"
            ).unwrap().as_str()
        ).expect("failed to parse json")
    );
    let ton = create_client_verbose(&config).unwrap();
    let abi = std::fs::read_to_string("SafeMultisigWallet.abi.json")
        .map_err(|e| format!("failed to read ABI file: {}", e.to_string())).unwrap();
    // let send_res = submit_transaction(
    //     address.as_str().unwrap(),
    //     "0:6f4bdf89f15df6be4204e4a9a78661ce709b750655d191a5911a2c3c6f6ece1d",
    //     "1000000000",
    //     "",
    // ).await;
    // let send_res = call_contract_with_client(
    //     ton.clone(),
    //     config.clone(),
    //     address.as_str().unwrap(),
    //     abi.clone(),
    //     "submitTransaction",
    //     r#"{
    //         "dest": "0:6f4bdf89f15df6be4204e4a9a78661ce709b750655d191a5911a2c3c6f6ece1d",
    //         "value": "1000000000",
    //         "bounce": "false",
    //         "allBalance": "false",
    //         "payload": ""
    //     }"#,
    //     Some("wallet.scmsig3.json".to_owned()),
    //     true,
    //     false,
    // ).await;
    let send_res = call_contract_with_client(
        ton.clone(),
        config.clone(),
        address.as_str().unwrap(),
        abi.clone(),
        "confirmTransaction",
        r#"{
            "dest": "0:6f4bdf89f15df6be4204e4a9a78661ce709b750655d191a5911a2c3c6f6ece1d",
            "value": "1000000000",
            "bounce": "false",
            "allBalance": "false",
            "payload": ""
        }"#,
        Some("wallet.scmsig3.json".to_owned()),
        false,
        false,
    ).await;
    println!("{}", to_string_pretty(&send_res).unwrap());
    // transId 1: 7077990478994424385
    // transId 2: 7077990715217625665
    // transId 3: 7077991067404943937
}