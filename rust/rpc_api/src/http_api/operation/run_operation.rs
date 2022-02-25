use types::{NewOperationGroup, NewOperationWithKind};
use crate::api::{
    GetChainID, RunOperation, RunOperationResult,
    TransportError, RunOperationError, RunOperationJson,
};
use crate::http_api::HttpApi;

fn run_operation_url(base_url: &str) -> String {
    format!("{}/chains/main/blocks/head/helpers/scripts/run_operation", base_url)
}

impl From<ureq::Error> for RunOperationError {
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

impl From<std::io::Error> for RunOperationError {
    fn from(error: std::io::Error) -> Self {
        Self::Transport(TransportError(Box::new(error)))
    }
}

impl RunOperation for HttpApi {
    fn run_operation(
        &self,
        operation_group: &NewOperationGroup,
    ) -> RunOperationResult
    {
        let body = ureq::json!({
            // "chain_id": self.get_chain_id()?,
            "chain_id": "NetXZSsxBpMQeAT",
            "operation": {
                "branch": &operation_group.branch,
                // this is necessary to be valid signature for this call
                // to work, but doesn't need to match the actual operation signature.
                "signature": "edsigthZLBZKMBUCwHpMCXHkGtBSzwh7wdUxqs7C1LRMk64xpcVU8tyBDnuFuf9CLkdL3urGem1zkHXFV9JbBBabi6k8QnhW4RG",
                "contents": operation_group.to_operations_vec()
                    .into_iter()
                    .map(|op| NewOperationWithKind::from(op))
                    .collect::<Vec<_>>(),
            },
        });
        println!("************run operation body***************");
        println!("{:#?}", body);
        println!("************run operation body***************");
        Ok(self.client.post(&run_operation_url(&self.base_url))
           .send_json(body)?
           .into_json::<RunOperationJson>()?
           .into())
    }
}
