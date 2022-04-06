export const TokenMultisig = [
  {
    "prim": "storage",
    "args": [
      {
        "prim": "pair",
        "args": [
          { "prim": "nat", "annots": [ "%counter" ] },
          { "prim": "pair", "args": [ { "prim": "nat", "annots": [ "%threshold" ] }, { "prim": "list", "args": [ { "prim": "key" } ], "annots": [ "%keys" ] } ] }
        ]
      }
    ]
  },
  {
    "prim": "parameter",
    "args": [
      {
        "prim": "or",
        "args": [
          { "prim": "unit", "annots": [ "%default" ] },
          {
            "prim": "pair",
            "args": [
              {
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
              },
              { "prim": "list", "args": [ { "prim": "option", "args": [ { "prim": "signature" } ] } ], "annots": [ ":sigs" ] }
            ],
            "annots": [ "%main_parameter" ]
          }
        ]
      }
    ]
  },
  {
    "prim": "code",
    "args": [
      [
        {
          "prim": "CAST",
          "args": [
            {
              "prim": "pair",
              "args": [
                {
                  "prim": "or",
                  "args": [
                    { "prim": "unit" },
                    {
                      "prim": "pair",
                      "args": [
                        {
                          "prim": "pair",
                          "args": [
                            { "prim": "nat" },
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
                                            { "prim": "pair", "args": [ { "prim": "address" }, { "prim": "mutez" } ] },
                                            { "prim": "option", "args": [ { "prim": "key_hash" } ] }
                                          ]
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
                                                    { "prim": "pair", "args": [ { "prim": "address" }, { "prim": "pair", "args": [ { "prim": "address" }, { "prim": "nat" } ] } ] },
                                                    {
                                                      "prim": "list",
                                                      "args": [
                                                        {
                                                          "prim": "pair",
                                                          "args": [
                                                            { "prim": "address" },
                                                            {
                                                              "prim": "list",
                                                              "args": [
                                                                {
                                                                  "prim": "pair",
                                                                  "args": [ { "prim": "address" }, { "prim": "pair", "args": [ { "prim": "nat" }, { "prim": "nat" } ] } ]
                                                                }
                                                              ]
                                                            }
                                                          ]
                                                        }
                                                      ]
                                                    }
                                                  ]
                                                }
                                              ]
                                            },
                                            {
                                              "prim": "pair",
                                              "args": [
                                                { "prim": "address" },
                                                { "prim": "or", "args": [ { "prim": "option", "args": [ { "prim": "key_hash" } ] }, { "prim": "nat" } ] }
                                              ]
                                            }
                                          ]
                                        }
                                      ]
                                    },
                                    { "prim": "lambda", "args": [ { "prim": "unit" }, { "prim": "list", "args": [ { "prim": "operation" } ] } ] }
                                  ]
                                },
                                { "prim": "pair", "args": [ { "prim": "nat" }, { "prim": "list", "args": [ { "prim": "key" } ] } ] }
                              ]
                            }
                          ]
                        },
                        { "prim": "list", "args": [ { "prim": "option", "args": [ { "prim": "signature" } ] } ] }
                      ]
                    }
                  ]
                },
                { "prim": "pair", "args": [ { "prim": "nat" }, { "prim": "pair", "args": [ { "prim": "nat" }, { "prim": "list", "args": [ { "prim": "key" } ] } ] } ] }
              ]
            }
          ]
        },
        { "prim": "UNPAIR" },
        {
          "prim": "IF_LEFT",
          "args": [
            [ { "prim": "DROP" }, { "prim": "NIL", "args": [ { "prim": "operation" } ] }, { "prim": "PAIR" } ],
            [
              { "prim": "PUSH", "args": [ { "prim": "mutez" }, { "int": "0" } ] },
              { "prim": "AMOUNT" },
              { "prim": "COMPARE" },
              { "prim": "EQ" },
              {
                "prim": "IF",
                "args": [
                  [],
                  [
                    { "prim": "PUSH", "args": [ { "prim": "string" }, { "string": "Some tokens were sent to this contract outside of a unit entry point." } ] },
                    { "prim": "FAILWITH" }
                  ]
                ]
              },
              { "prim": "SWAP" },
              { "prim": "DUP" },
              {
                "prim": "DIP",
                "args": [
                  [
                    { "prim": "SWAP" },
                    { "prim": "UNPAIR" },
                    { "prim": "DUP" },
                    { "prim": "SELF_ADDRESS" },
                    { "prim": "CHAIN_ID" },
                    { "prim": "PAIR" },
                    { "prim": "PAIR" },
                    { "prim": "DIP", "args": [ [ { "prim": "DUP" }, { "prim": "DIP", "args": [ [ { "prim": "CDR" }, { "prim": "SWAP" } ] ] }, { "prim": "CAR" } ] ] },
                    { "prim": "PACK" },
                    { "prim": "SWAP" }
                  ]
                ]
              },
              { "prim": "DUP" },
              { "prim": "DIP", "args": [ [ { "prim": "CDR" }, { "prim": "SWAP" } ] ] },
              { "prim": "CAR" },
              { "prim": "COMPARE" },
              { "prim": "EQ" },
              { "prim": "IF", "args": [ [], [ { "prim": "PUSH", "args": [ { "prim": "string" }, { "string": "Counters do not match." } ] }, { "prim": "FAILWITH" } ] ] },
              { "prim": "DIP", "args": [ [ { "prim": "SWAP" } ] ] },
              { "prim": "DUP" },
              {
                "prim": "DIP",
                "args": [
                  [
                    { "prim": "CDR" },
                    { "prim": "PUSH", "args": [ { "prim": "nat" }, { "int": "0" } ] },
                    { "prim": "SWAP" },
                    {
                      "prim": "ITER",
                      "args": [
                        [
                          { "prim": "DIP", "args": [ [ { "prim": "SWAP" } ] ] },
                          { "prim": "SWAP" },
                          {
                            "prim": "IF_CONS",
                            "args": [
                              [
                                {
                                  "prim": "IF_NONE",
                                  "args": [
                                    [ { "prim": "SWAP" }, { "prim": "DROP" } ],
                                    [
                                      { "prim": "SWAP" },
                                      {
                                        "prim": "DIP",
                                        "args": [
                                          [
                                            { "prim": "SWAP" },
                                            {
                                              "prim": "DIP",
                                              "args": [ [ { "prim": "DIP", "args": [ [ { "prim": "DIP", "args": [ [ { "prim": "DUP" } ] ] }, { "prim": "SWAP" } ] ] } ] ]
                                            },
                                            { "prim": "DIP", "args": [ { "int": "2" }, [ { "prim": "DUP" } ] ] },
                                            { "prim": "DIG", "args": [ { "int": "2" } ] },
                                            { "prim": "DIP", "args": [ [ { "prim": "CHECK_SIGNATURE" } ] ] },
                                            { "prim": "SWAP" },
                                            { "prim": "IF", "args": [ [ { "prim": "DROP" } ], [ { "prim": "FAILWITH" } ] ] },
                                            { "prim": "PUSH", "args": [ { "prim": "nat" }, { "int": "1" } ] },
                                            { "prim": "ADD" }
                                          ]
                                        ]
                                      }
                                    ]
                                  ]
                                }
                              ],
                              [ { "prim": "FAILWITH" } ]
                            ]
                          },
                          { "prim": "SWAP" }
                        ]
                      ]
                    }
                  ]
                ]
              },
              { "prim": "CAR" },
              { "prim": "COMPARE" },
              { "prim": "LE" },
              { "prim": "IF", "args": [ [], [ { "prim": "PUSH", "args": [ { "prim": "string" }, { "string": "Quorum not present" } ] }, { "prim": "FAILWITH" } ] ] },
              { "prim": "IF_CONS", "args": [ [ { "prim": "FAILWITH" } ], [ { "prim": "DROP" } ] ] },
              { "prim": "DIP", "args": [ [ { "prim": "UNPAIR" }, { "prim": "PUSH", "args": [ { "prim": "nat" }, { "int": "1" } ] }, { "prim": "ADD" }, { "prim": "PAIR" } ] ] },
              {
                "prim": "IF_LEFT",
                "args": [
                  [
                    {
                      "prim": "IF_LEFT",
                      "args": [
                        [
                          {
                            "prim": "IF_LEFT",
                            "args": [
                              [
                                {
                                  "prim": "IF_LEFT",
                                  "args": [
                                    [
                                      { "prim": "DUP" },
                                      { "prim": "CDR" },
                                      { "prim": "PUSH", "args": [ { "prim": "mutez" }, { "int": "0" } ] },
                                      { "prim": "COMPARE" },
                                      { "prim": "EQ" },
                                      {
                                        "prim": "IF",
                                        "args": [ [ { "prim": "PUSH", "args": [ { "prim": "string" }, { "string": "Zero value transfer" } ] }, { "prim": "FAILWITH" } ], [] ]
                                      },
                                      { "prim": "DUP" },
                                      { "prim": "CAR" },
                                      { "prim": "CONTRACT", "args": [ { "prim": "unit" } ] },
                                      { "prim": "IF_NONE", "args": [ [ { "prim": "UNIT" }, { "prim": "FAILWITH" } ], [] ] },
                                      { "prim": "SWAP" },
                                      { "prim": "CDR" },
                                      { "prim": "UNIT" },
                                      { "prim": "TRANSFER_TOKENS" },
                                      { "prim": "DIP", "args": [ [ { "prim": "NIL", "args": [ { "prim": "operation" } ] } ] ] },
                                      { "prim": "CONS" }
                                    ],
                                    [ { "prim": "DIP", "args": [ [ { "prim": "NIL", "args": [ { "prim": "operation" } ] } ] ] }, { "prim": "SET_DELEGATE" }, { "prim": "CONS" } ]
                                  ]
                                }
                              ],
                              [
                                { "prim": "DIP", "args": [ [ { "prim": "NIL", "args": [ { "prim": "operation" } ] } ] ] },
                                {
                                  "prim": "IF_LEFT",
                                  "args": [
                                    [
                                      { "prim": "UNPAIR" },
                                      { "prim": "SWAP" },
                                      {
                                        "prim": "IF_LEFT",
                                        "args": [
                                          [
                                            {
                                              "prim": "DIP",
                                              "args": [
                                                [
                                                  {
                                                    "prim": "CONTRACT",
                                                    "args": [
                                                      {
                                                        "prim": "pair",
                                                        "args": [ { "prim": "address" }, { "prim": "pair", "args": [ { "prim": "address" }, { "prim": "nat" } ] } ]
                                                      }
                                                    ],
                                                    "annots": [ "%transfer" ]
                                                  },
                                                  {
                                                    "prim": "IF_NONE",
                                                    "args": [
                                                      [
                                                        { "prim": "PUSH", "args": [ { "prim": "string" }, { "string": "bad address for get_entrypoint (%transfer)" } ] },
                                                        { "prim": "FAILWITH" }
                                                      ],
                                                      []
                                                    ]
                                                  },
                                                  { "prim": "PUSH", "args": [ { "prim": "mutez" }, { "int": "0" } ] }
                                                ]
                                              ]
                                            },
                                            { "prim": "TRANSFER_TOKENS" }
                                          ],
                                          [
                                            {
                                              "prim": "DIP",
                                              "args": [
                                                [
                                                  {
                                                    "prim": "CONTRACT",
                                                    "args": [
                                                      {
                                                        "prim": "list",
                                                        "args": [
                                                          {
                                                            "prim": "pair",
                                                            "args": [
                                                              { "prim": "address" },
                                                              {
                                                                "prim": "list",
                                                                "args": [
                                                                  {
                                                                    "prim": "pair",
                                                                    "args": [ { "prim": "address" }, { "prim": "pair", "args": [ { "prim": "nat" }, { "prim": "nat" } ] } ]
                                                                  }
                                                                ]
                                                              }
                                                            ]
                                                          }
                                                        ]
                                                      }
                                                    ],
                                                    "annots": [ "%transfer" ]
                                                  },
                                                  {
                                                    "prim": "IF_NONE",
                                                    "args": [
                                                      [
                                                        { "prim": "PUSH", "args": [ { "prim": "string" }, { "string": "bad address for get_entrypoint (%transfer)" } ] },
                                                        { "prim": "FAILWITH" }
                                                      ],
                                                      []
                                                    ]
                                                  },
                                                  { "prim": "PUSH", "args": [ { "prim": "mutez" }, { "int": "0" } ] }
                                                ]
                                              ]
                                            },
                                            { "prim": "TRANSFER_TOKENS" }
                                          ]
                                        ]
                                      }
                                    ],
                                    [
                                      { "prim": "UNPAIR" },
                                      { "prim": "SWAP" },
                                      {
                                        "prim": "IF_LEFT",
                                        "args": [
                                          [
                                            {
                                              "prim": "DIP",
                                              "args": [
                                                [
                                                  { "prim": "CONTRACT", "args": [ { "prim": "option", "args": [ { "prim": "key_hash" } ] } ], "annots": [ "%setDelegate" ] },
                                                  {
                                                    "prim": "IF_NONE",
                                                    "args": [
                                                      [
                                                        { "prim": "PUSH", "args": [ { "prim": "string" }, { "string": "bad address for get_entrypoint (%setDelegate)" } ] },
                                                        { "prim": "FAILWITH" }
                                                      ],
                                                      []
                                                    ]
                                                  },
                                                  { "prim": "PUSH", "args": [ { "prim": "mutez" }, { "int": "0" } ] }
                                                ]
                                              ]
                                            },
                                            { "prim": "TRANSFER_TOKENS" }
                                          ],
                                          [
                                            {
                                              "prim": "DIP",
                                              "args": [
                                                [
                                                  { "prim": "CONTRACT", "args": [ { "prim": "nat" } ], "annots": [ "%vest" ] },
                                                  {
                                                    "prim": "IF_NONE",
                                                    "args": [
                                                      [
                                                        { "prim": "PUSH", "args": [ { "prim": "string" }, { "string": "bad address for get_entrypoint (%vest)" } ] },
                                                        { "prim": "FAILWITH" }
                                                      ],
                                                      []
                                                    ]
                                                  },
                                                  { "prim": "PUSH", "args": [ { "prim": "mutez" }, { "int": "0" } ] }
                                                ]
                                              ]
                                            },
                                            { "prim": "TRANSFER_TOKENS" }
                                          ]
                                        ]
                                      }
                                    ]
                                  ]
                                },
                                { "prim": "CONS" }
                              ]
                            ]
                          }
                        ],
                        [ { "prim": "SWAP" }, { "prim": "DIP", "args": [ [ { "prim": "UNIT" }, { "prim": "EXEC" } ] ] }, { "prim": "SWAP" } ]
                      ]
                    }
                  ],
                  [ { "prim": "DIP", "args": [ [ { "prim": "CAR" } ] ] }, { "prim": "SWAP" }, { "prim": "PAIR" }, { "prim": "NIL", "args": [ { "prim": "operation" } ] } ]
                ]
              },
              { "prim": "PAIR" }
            ]
          ]
        }
      ]
    ]
  }
]
