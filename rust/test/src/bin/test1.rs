use std::collections::HashMap;
use reqwest::Error;

async fn run() -> Result<(), reqwest::Error> {
    println!("3542452354");
    let body = reqwest::get("https://www.rust-lang.org")
        .await?
        .text()
        .await?;
    println!("body = {:?}", body);
    Ok(())
}

#[cfg(feature="json")]
async fn get()  -> Result<(), Error> {
    let mut map = HashMap::new();
    map.insert("int", "0");
    let client = reqwest::Client::new();
    let res = client.post("https://api.tzkt.io/v1/contracts/KT1B81hEJckCtpzBspduvDSSFdK2QbQYVwmp/entrypoints/default/build")
        .json(&map)
        .send()
        .await?;
    Ok(())
        // let res reqwest::get("https://api.tzkt.io/v1/contracts/KT1B81hEJckCtpzBspduvDSSFdK2QbQYVwmp/entrypoints/default/build")
    // .await?
    // .json::<HashMap<String, String>>()
    // .await?;
    // println!("{:?}", res)

    // let mut writer = Vec::new(); //container for body of a response
    // let res = request::get("https://doc.rust-lang.org/", &mut writer).unwrap();
    // let mut writer = Vec::new();
    // let uri: &str = "api.tzkt.io/v1/contracts/tz1WtthyqxFXaC46kBC18UXdqboeTqEjqwtX/entrypoints/transfer/build?value=%7B\"from\":\"KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV\",\"to\":\"KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV\",\"value\":\"1000\"%7D";
    // let body: &[u8; 699] = b"[{'kind': 'transaction','source': 'tz1WtthyqxFXaC46kBC18UXdqboeTqEjqwtX','fee': '512','counter': '3229823','gas_limit': '2151','storage_limit': '0','amount': '0','destination': 'KT1B81hEJckCtpzBspduvDSSFdK2QbQYVwmp','parameters': {'entrypoint': 'default','value': {'int': '5'}},'metadata': {'balance_updates': [{'kind': 'contract','contract': 'tz1WtthyqxFXaC46kBC18UXdqboeTqEjqwtX','change': '-512','origin': 'block'},{'kind': 'freezer','category': 'fees','delegate': 'tz1WVs9DWoMLYcoL24JnsmbDqDShCnxxDt16','cycle': 113,'change': '512','origin': 'block'}],'operation_result': {'status': 'applied','storage': {'int': '5'},'consumed_gas': '2051','consumed_milligas': '2050443','storage_size': '40'}}}]";
    // let body: &[u8; 13] = b"{'int': '10'}";
    // let body: &[u8; 1] = b" ";
    // let res = request::post(uri, body, &mut writer).unwrap();
    // println!("{} {}", res.status_code(), res.reason());
}
#[tokio::main]
async fn main() {
    println!("3542452354");
    let body = reqwest::get("https://www.rust-lang.org").await;
    println!("body = {:?}", body);
}