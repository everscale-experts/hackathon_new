use ton_client::net::ParamsOfQueryCollection;
use ton_client::ClientContext;
use ton_client::processing::*;
use ton_client::abi::*;
use serde_json::Value;
use std::sync::Arc;
use super::config::Config;
use super::contract::read_keys;

pub async fn send_message_and_wait(
    ton: Arc<ClientContext>,
    abi: Option<Abi>,
    msg: String,
    conf: Config,
) -> Result<serde_json::Value, String> {

    if !conf.is_json {
        println!("Processing... ");
    }
    let callback = |_| {
        async move {}
    };
    let result = send_message(
        ton.clone(),
        ParamsOfSendMessage {
            message: msg.clone(),
            abi: abi.clone(),
            send_events: false,
            ..Default::default()
        },
        callback,
    ).await
        .map_err(|e| format!("{:#}", e))?;

    if !conf.async_call {
        let result = wait_for_transaction(
            ton.clone(),
            ParamsOfWaitForTransaction {
                abi,
                message: msg.clone(),
                shard_block_id: result.shard_block_id,
                send_events: true,
                ..Default::default()
            },
            callback.clone(),
        ).await
            .map_err(|e| format!("{:#}", e))?;
        Ok(result.decoded.and_then(|d| d.output).unwrap_or(serde_json::json!({})))
    } else {
        Ok(serde_json::json!({}))
    }
}

pub async fn process_message(
    ton: Arc<ClientContext>,
    msg: ParamsOfEncodeMessage,
    is_json: bool,
) -> Result<serde_json::Value, String> {
    let callback = |event| { async move {
        match event {
            ProcessingEvent::DidSend { shard_block_id: _, message_id, message: _ } => println!("MessageId: {}", message_id),
            _ => (),
        }
    }};
    let res = if !is_json {
        ton_client::processing::process_message(
            ton,
            ParamsOfProcessMessage {
                message_encode_params: msg,
                send_events: true,
                ..Default::default()
            },
            callback,
        ).await.map_err(|e| format!("{:#}", e))?
    } else {
        ton_client::processing::process_message(
            ton,
            ParamsOfProcessMessage {
                message_encode_params: msg,
                send_events: true,
                ..Default::default()
            },
            |_| { async move {} },
        ).await.map_err(|e| format!("{:#}", e))?
    };
    Ok(res.decoded.and_then(|d| d.output).unwrap_or(serde_json::json!({})))
}

pub async fn decode_msg(ton: Arc<ClientContext>, msg: &str, abi: Abi) -> Value {
    // ton_client::abi::decode_message_body(ton.clone(), ton_client::abi::ParamsOfDecodeMessageBody {
    //     abi,
    //     body: msg.to_owned(),
    //     is_internal: true,
    // }).await.unwrap().value.unwrap()
    ton_client::abi::decode_message(ton, ParamsOfDecodeMessage {
        abi,
        message: msg.to_owned(),
    }).await.unwrap().value.unwrap()
}

pub async fn decode_msg_by_id(ton: Arc<ClientContext>, msg_id: &str, abi: Abi) -> Value {
    let msg = get_msg_body_by_id(ton.clone(), msg_id).await;
    ton_client::abi::decode_message(ton, ParamsOfDecodeMessage {
        abi,
        message: msg,
    }).await.unwrap().value.unwrap()
}

pub async fn decode_msg_body_by_id(ton: Arc<ClientContext>, msg_id: &str, abi: Abi) -> Value {
    let msg = get_msg_body_by_id(ton.clone(), msg_id).await;
    ton_client::abi::decode_message_body(ton, ParamsOfDecodeMessageBody {
        abi,
        is_internal: true,
        body: msg,
    }).await.unwrap().value.unwrap()
}

pub async fn get_msg_body_by_id(ton: Arc<ClientContext>, msg_id: &str) -> String {
    get_msg_by_id(ton.clone(), msg_id).await["body"].as_str().unwrap().to_string()
}

pub async fn get_msg_by_id(ton: Arc<ClientContext>, msg_id: &str) -> Value {
    ton_client::net::query_collection(
        ton,
        ParamsOfQueryCollection {
            collection: "messages".to_string(),
            filter: Some(serde_json::json!({
                "id": {
                    "in": msg_id
                }
            })),
            result: "id dst value body".to_string(),
            limit: None,
            order: None,
        }
    ).await.unwrap().result[0].clone()
}

pub fn prepare_message_params(
    addr: &str,
    abi: Abi,
    method: &str,
    params: Value,
    header: Option<FunctionHeader>,
    keys: Option<String>,
) -> Result<ParamsOfEncodeMessage, String> {
    let keys = keys.map(|k| read_keys(&k)).transpose()?;
    // let params = serde_json::from_str(&params)
    //     .map_err(|e| format!("arguments are not in json format: {}", e))?;
    let call_set = Some(CallSet {
        function_name: method.into(),
        input: Some(params),
        header: header.clone(),
    });

    Ok(ParamsOfEncodeMessage {
        abi,
        address: Some(addr.to_owned()),
        call_set,
        signer: if keys.is_some() {
            Signer::Keys { keys: keys.unwrap() }
        } else {
            Signer::None
        },
        ..Default::default()
    })
}