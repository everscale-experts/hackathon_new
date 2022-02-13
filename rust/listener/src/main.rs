use std::io::prelude::*;
use std::net::TcpListener;
use std::net::TcpStream;
use json;

fn handle_connection(mut stream: TcpStream) {
    let mut buffer = [0; 1024];

    stream.read(&mut buffer).unwrap();

    let contents = "";
    for s in String::from_utf8_lossy(&buffer[..]).split('/') {
        if s.len() > 7 && &s.to_string()[..8] == "comment=" {
            let value_string = &s.to_string()
                .replace("%7B", "{")
                .replace("%7D", "}")
                .replace("%22", "\"");
            println!("{}", value_string);
            let end = s
                .chars()
                .position(|c| c == '}').unwrap() + 1;
            println!("{}", end);
            // println!("{}", &s.to_string());
            let value = json::parse(&value_string[8..end]
            ).unwrap();
            println!("{}", value);
        }
    }

    let response = format!(
        "HTTP/1.1 200 OK\r\nContent-Length: {}\r\n\r\n{}",
        contents.len(),
        contents
    );

    stream.write(response.as_bytes()).unwrap();
    stream.flush().unwrap();
}

fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();

    for stream in listener.incoming() {
        let stream = stream.unwrap();

        handle_connection(stream);
    }
}
