use ureq::json;

fn batch(parameters) {

}

fn send_operations(parameters) {

}

fn transfer() {
    let params = json!("{
        to: \"KT1MeAHVkJp87r9neejmaxCfaccoUfXAssy1\",
        amount: 1,
        parameter: {
            entrypoint: \"transfer\",
            value: {
                prim: \"Pair\",
                args: [{
                    string: \"tz1gVYfPffnmhyZkiEXadeg5SS8uerbXo2DM\"
                }, {
                    prim: \"Pair\",
                    args: [{
                        string: \"tz1f1c3WWBBd4wGF57sJNgej9vKSCG5GTLjd\"
                    }, {
                        int: \"2\"
                    }]
                }]
            }
        }
    }");
}

fn main() {

}