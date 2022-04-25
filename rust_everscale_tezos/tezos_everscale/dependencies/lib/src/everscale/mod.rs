use lazy_static::lazy_static;
pub mod get_functions;
pub mod multisig;
pub mod contract;
pub mod message;
pub mod config;
pub mod htlc;
pub use get_functions as get;

lazy_static! {
    pub static ref MAIN_ENDPOINTS: Vec<String> = vec![
        "https://main2.ton.dev".to_string(),
        "https://main3.ton.dev".to_string(),
        "https://main4.ton.dev".to_string(),
    ];

    pub static ref NET_ENDPOINTS: Vec<String> = vec![
        "https://net.ton.dev".to_string(),
        "https://net1.ton.dev".to_string(),
        "https://net5.ton.dev".to_string(),
    ];

    pub static ref SE_ENDPOINTS: Vec<String> = vec![
        "http://0.0.0.0/".to_string(),
        "http://127.0.0.1/".to_string(),
        "http://localhost/".to_string(),
    ];
}