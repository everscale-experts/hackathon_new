use crate::api::{TransportError, GetVersionInfo, GetVersionInfoResult, GetVersionInfoError};
use crate::http_api::HttpApi;

// fn get_version_info_url(base_url: &str) -> String {
//     let res: String = format!("{}/version", base_url);
//     println!("[... > transfer > execute > build_operation_group > get_version_info > get_version_info_url]");
//     res
// }

impl From<ureq::Error> for GetVersionInfoError {
    fn from(error: ureq::Error) -> Self {
        match error {
            ureq::Error::Transport(error) => {
                Self::Transport(TransportError(Box::new(error)))
            }
            ureq::Error::Status(code, resp) => {
                let status_text = resp.status_text().to_string();
                Self::Unknown(format!(
                    "Http status: ({}, {}){}",
                    code,
                    status_text,
                    match resp.into_string() {
                        Ok(s) => format!(", message: {}", s),
                        Err(_) => "".to_string(),
                    },
                ))
            }
        }
    }
}

impl From<std::io::Error> for GetVersionInfoError {
    fn from(error: std::io::Error) -> Self {
        Self::Transport(TransportError(Box::new(error)))
    }
}

impl GetVersionInfo for HttpApi {
    fn get_version_info(&self) -> GetVersionInfoResult {
        // println!("[... > execute > transfer > execute > build_operation_group > get_version_info]");
        // let value: String = get_version_info_url(&self.base_url);
        // println!("{}", value);
        let value: String = "https://hangzhounet.api.tez.ie/version".to_string();
        // let value: String = "https://rpctest.tzbeta.net/version".to_string();
        Ok(self.client.get(&value)
            .call()?
            .into_json()?)
    }
}
