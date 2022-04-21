export const schema_param= {
    "prim": "pair",
    "args":
        [{
            "prim": "nat",
            "annots": ["%counter"]
        },
            {
                "prim": "or",
                "args":
                    [{
                        "prim": "lambda",
                        "args":
                            [{"prim": "unit"},
                                {
                                    "prim": "list",
                                    "args":
                                        [{
                                            "prim":
                                                "operation"
                                        }]
                                }],
                        "annots":
                            ["%operation"]
                    },
                        {
                            "prim": "pair",
                            "args":
                                [{
                                    "prim": "nat",
                                    "annots":
                                        ["%threshold"]
                                },
                                    {
                                        "prim": "list",
                                        "args":
                                            [{"prim": "key"}],
                                        "annots":
                                            ["%keys"]
                                    }],
                            "annots":
                                ["%change_keys"]
                        }],
                "annots": [":action"]
            }],
    "annots": [":payload"]
}