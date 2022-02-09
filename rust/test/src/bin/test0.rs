use http_req::request;
use http_req::response::StatusCode;
use std::str;

// It sends GET http request and prints response as a string
fn main() {
    let mut writer = Vec::new(); //container for body of a response
    let mut res = request::get("https://doc.rust-lang.org", &mut writer).unwrap();
    println!("Status: {} {}", res.status_code(), res.reason());
    println!("{}", res.headers());
    if res.status_code() == StatusCode::new(302) {
        let location = "https://www.rust-lang.org/learn";
        let location2 =res.headers().get("Location");
        println!("{}", location2.unwrap());
        // ERROR
        let _res2 = request::get(location, &mut writer).unwrap();
    }

    // workaround:
    res = request::get("https://www.rust-lang.org/learn", &mut writer).unwrap();
    println!("Status: {} {}", res.status_code(), res.reason());
    println!("Headers: {}", res.headers());
    let html_code = match str::from_utf8(&writer) {
        Ok(v) => v,
        Err(e) => panic!("Invalid UTF-8 string: {}", e),
    };
    println!("{}", html_code);
    // for value in writer {
    //     println!("{}", value);
    // }
}