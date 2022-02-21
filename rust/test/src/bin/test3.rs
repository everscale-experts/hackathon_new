use http_req::request;
use http_req::response::StatusCode;

fn main() {
    // let mut writer = Vec::new();
    // let mut res = request::get("https://doc.rust-lang.org", &mut writer).unwrap();
    // println!("Status: {} {}", res.status_code(), res.reason());
    // println!("{}", res.headers());
    // if res.status_code() == StatusCode::new(302) {
    //     let location = "https://www.rust-lang.org/learn";
    //     let location2 =res.headers().get("Location");
    //     println!("{}", location2.unwrap());
    //     // ERROR
    //     let _res2 = request::get(location, &mut writer).unwrap();
    // }
    let mut writer: Vec<u8> = Vec::new();
    let body = "{
        \"from\":\"tz1f1WndyZoUQWU3ujAMCy4b1VtuYhxpc82R\",
        \"to\":\"tz1f1WndyZoUQWU3ujAMCy4b1VtuYhxpc82R\",
        \"value\":\"1\"
    }".as_bytes();
    let url = "https://api.hangzhounet.tzkt.io/v1/contracts/tz1WtthyqxFXaC46kBC18UXdqboeTqEjqwtX/entrypoints/transfer/build";
    let mut res = request::post(url, body, &mut writer);
    println!("Status: {} {}", res.status_code(), res.reason());
    println!("{}", res.headers());
}