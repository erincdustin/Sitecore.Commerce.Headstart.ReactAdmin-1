const buyerList = {
  responses: {
    "200": {
      description: "",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              Items: {
                type: "array",
                items: {
                  type: "object",
                  example: {
                    ID: "",
                    Name: "",
                    DefaultCatalogID: "",
                    Active: false,
                    DateCreated: "2018-01-01T00:00:00-06:00",
                    xp: {}
                  },
                  properties: {
                    ID: {
                      type: "string",
                      maxLength: 100
                    },
                    Name: {
                      type: "string",
                      maxLength: 100
                    },
                    DefaultCatalogID: {
                      type: "string",
                      description:
                        "If null on POST a new default catalog will be created for the buyer. Used in buyer product queries to allow filtering on categories without explicitly providing a CatalogID."
                    },
                    Active: {
                      type: "boolean",
                      description: "If false, all authentication is prohibited."
                    },
                    DateCreated: {
                      type: "string",
                      format: "date-time",
                      readOnly: true
                    },
                    xp: {
                      type: "object"
                    }
                  }
                }
              },
              Meta: {
                type: "object",
                properties: {
                  Page: {
                    type: "integer",
                    format: "int32"
                  },
                  PageSize: {
                    type: "integer",
                    format: "int32"
                  },
                  TotalCount: {
                    type: "integer",
                    format: "int32"
                  },
                  TotalPages: {
                    type: "integer",
                    format: "int32"
                  },
                  ItemRange: {
                    type: "array",
                    items: {
                      type: "integer",
                      format: "int32"
                    }
                  },
                  NextPageKey: {
                    type: "string"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  operationId: "Buyers.List",
  tags: ["Buyers"],
  parameters: [
    {
      name: "search",
      in: "query",
      description: "Word or phrase to search for.",
      required: false,
      schema: {
        type: "string"
      }
    },
    {
      name: "searchOn",
      in: "query",
      description: "Comma-delimited list of fields to search on.",
      required: false,
      schema: {
        type: "array",
        items: {
          type: "string",
          enum: ["Name", "ID"]
        }
      }
    },
    {
      name: "sortBy",
      in: "query",
      description: "Comma-delimited list of fields to sort by.",
      required: false,
      schema: {
        type: "array",
        items: {
          type: "string",
          enum: ["ID", "Name", "DateCreated", "!ID", "!Name", "!DateCreated"]
        }
      }
    },
    {
      name: "page",
      in: "query",
      description:
        'Page of results to return. Default: 1. When paginating through many items (> page 30), we recommend the "Last ID" method, as outlined in the Advanced Querying documentation.',
      required: false,
      schema: {
        type: "integer"
      }
    },
    {
      name: "pageSize",
      in: "query",
      description: "Number of results to return per page. Default: 20, max: 100.",
      required: false,
      schema: {
        type: "integer"
      }
    },
    {
      name: "filters",
      in: "query",
      description:
        "An object or dictionary representing key/value pairs to apply as filters. Valid keys are top-level properties of the returned model or 'xp.???'",
      required: false,
      schema: {
        type: "object"
      }
    }
  ],
  summary: "Get a list of buyers.",
  description: "",
  security: [
    {
      OAuth2: ["FullAccess", "BuyerAdmin", "BuyerReader"]
    }
  ],
  verb: "get",
  path: "/buyers"
}

export default buyerList
