use std::io::prelude::*;
use std::net::TcpListener;
use std::net::TcpStream;

fn main() {
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();

    for stream in listener.incoming() {
        let stream = stream.unwrap();

        handle_connection(stream);
    }
}

fn handle_connection(mut stream: TcpStream) {
    let mut buffer = [0; 1024];

    stream.read(&mut buffer).unwrap();

    // println!("{}", String::from_utf8_lossy(&buffer[5..41]));
    // println!("{}", String::from_utf8_lossy(&buffer[5..]));
    let contents = "";
    for s in String::from_utf8_lossy(&buffer[..]).split('/') {
        if s.len() > 7 {
            println!("{}", &s.to_string()[0..7]);
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
