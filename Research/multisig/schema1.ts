export const SchemaOfParams1 = [{
    "prim": "pair",
    "args": [
      { "prim": "nat", "annots": [ ":counter" ] },
      {
        "prim": "or",
        "args": [
          {
            "prim": "or",
            "args": [
              {
                "prim": "or",
                "args": [
                  {
                    "prim": "or",
                    "args": [
                      { "prim": "pair", "args": [ { "prim": "address", "annots": [ ":to" ] }, { "prim": "mutez", "annots": [ ":value" ] } ] },
                      { "prim": "option", "args": [ { "prim": "key_hash" } ], "annots": [ ":delegation" ] }
                    ],
                    "annots": [ ":direct_action" ]
                  },
                  {
                    "prim": "or",
                    "args": [
                      {
                        "prim": "pair",
                        "args": [
                          { "prim": "address" },
                          {
                            "prim": "or",
                            "args": [
                              {
                                "prim": "pair",
                                "args": [ { "prim": "address" }, { "prim": "pair", "args": [ { "prim": "address" }, { "prim": "nat" } ] } ],
                                "annots": [ ":transferFA1.2" ]
                              },
                              {
                                "prim": "list",
                                "args": [
                                  {
                                    "prim": "pair",
                                    "args": [
                                      { "prim": "address", "annots": [ ":from_" ] },
                                      {
                                        "prim": "list",
                                        "args": [
                                          {
                                            "prim": "pair",
                                            "args": [
                                              { "prim": "address", "annots": [ ":to_" ] },
                                              { "prim": "pair", "args": [ { "prim": "nat", "annots": [ ":token_id" ] }, { "prim": "nat", "annots": [ ":amount" ] } ] }
                                            ]
                                          }
                                        ],
                                        "annots": [ ":txs" ]
                                      }
                                    ]
                                  }
                                ],
                                "annots": [ ":transferFA2" ]
                              }
                            ]
                          }
                        ],
                        "annots": [ ":transferFA" ]
                      },
                      {
                        "prim": "pair",
                        "args": [
                          { "prim": "address", "annots": [ ":vesting" ] },
                          {
                            "prim": "or",
                            "args": [
                              { "prim": "option", "args": [ { "prim": "key_hash" } ], "annots": [ ":setDelegate" ] },
                              { "prim": "nat", "annots": [ ":vest" ] }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ],
                "annots": [ ":action" ]
              },
              { "prim": "lambda", "args": [ { "prim": "unit" }, { "prim": "list", "args": [ { "prim": "operation" } ] } ] }
            ],
            "annots": [ ":actions" ]
          },
          { "prim": "pair", "args": [ { "prim": "nat", "annots": [ ":threshold" ] }, { "prim": "list", "args": [ { "prim": "key" } ], "annots": [ ":keys" ] } ] }
        ]
      }
    ]
  }];