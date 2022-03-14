export const SchemaOfParams2 = {
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
 
  

