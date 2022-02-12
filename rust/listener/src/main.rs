use actix_web::{post, web, HttpResponse, Responder};
use actix_web::{App, HttpServer, web};
use log::info;
use serde::{Serialize, Deserialize};
use std::process::Command;
use std::io::{self, Write};

#[derive(Deserialize)]
pub struct Request {
    commands: String,
}

#[derive(Serialize)]
pub struct Response {
    result: bool,
}

#[post("/execute")]
pub async fn execute_command(request: web::Json<Request>) -> impl Responder {
    info!("validating password for {}", request.commands);

    let process = Command::new("sh")
        .arg(&request.commands)
        .status()
        .expect("Failed to execute command");

    info!("status: {}", &process.to_string());

    if process.success() {
        HttpResponse::Ok().json(Response { result: true })
    } else {
        HttpResponse::Ok().json(Response { result: false })
    }
}

extern crate simple_logger;

mod executor {
    pub mod validate_password;
    pub mod execute;
}

#[actix_rt::main]
async fn main() -> std::io::Result<()> {
    simple_logger:: init_with_level(log::Level::Info).unwrap();

    HttpServer::new(|| {
        App::new()
            .service(
                web::scope("/serv/")
                    .service(executor::validate_password::validate_password)
                    .service(executor::execute::execute_command)
            )
    })
        .workers(10)
        .keep_alive(15)
        .bind("127.0.0.1:8088")?
        .run()
        .await
}