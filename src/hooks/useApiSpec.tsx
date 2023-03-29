import {useCallback, useEffect, useMemo, useState} from "react"
import SwaggerParser from "swagger-parser"
import {OpenAPI, OpenAPIV3} from "openapi-types"
import {groupBy, sortBy, keyBy, mapValues, values, flatten} from "lodash"
import lunr from "lunr"

const localStoragePrefix = "OcOpenApi."

const STOP_WORDS = [
  "a",
  "able",
  "about",
  "across",
  "after",
  "almost",
  "also",
  "am",
  "among",
  "an",
  "and",
  "any",
  "are",
  "as",
  "at",
  "be",
  "because",
  "been",
  "but",
  "by",
  "can",
  "cannot",
  "could",
  "dear",
  "did",
  "do",
  "does",
  "either",
  "else",
  "ever",
  "every",
  "for",
  "from",
  "got",
  "had",
  "has",
  "have",
  "he",
  "her",
  "hers",
  "him",
  "his",
  "how",
  "however",
  "i",
  "if",
  "in",
  "into",
  "is",
  "it",
  "its",
  "just",
  "least",
  "let",
  "like",
  "likely",
  "may",
  "might",
  "most",
  "must",
  "neither",
  "no",
  "nor",
  "not",
  "of",
  "off",
  "often",
  "on",
  "only",
  "or",
  "other",
  "our",
  "own",
  "rather",
  "said",
  "say",
  "says",
  "she",
  "should",
  "since",
  "so",
  "some",
  "than",
  "that",
  "the",
  "their",
  "them",
  "then",
  "there",
  "these",
  "they",
  "this",
  "tis",
  "to",
  "too",
  "twas",
  "us",
  "wants",
  "was",
  "we",
  "were",
  "what",
  "when",
  "where",
  "which",
  "while",
  "who",
  "whom",
  "why",
  "will",
  "with",
  "would",
  "yet",
  "you",
  "your"
]

export const initializeIndex = (operations: any[], resources: ApiResource[]): lunr.Index => {
  /**
   * See lunr documentation for details: https://lunrjs.com/docs/index.html
   * Splitting up the path because I found that it produces more accurate
   * results.
   */
  return lunr(function () {
    this.ref("operationId")
    this.field("summary")
    this.field("splitPath")
    this.field("description")
    this.field("resource")

    /**
     * Remove the default stop words filter in favor of our own modified version
     * that doesn't include "me", "my", "get", or "all". This will allow users to
     * search for "get" and still receive some results. Similarly, it will allow
     * users to search for things under Me and My stuff.
     *
     * Original values: https://github.com/olivernn/lunr.js/blob/56f571b11fc4c3e0b4f44c6e33889e3406e6d7f9/lib/stop_word_filter.js#L43-L163
     */
    this.pipeline.remove(lunr.stopWordFilter)
    // this.pipeline.remove(lunr.stemmer);
    // this.searchPipeline.remove(lunr.stemmer);
    const customStopWords = lunr.generateStopWordFilter(STOP_WORDS)
    lunr.Pipeline.registerFunction(customStopWords, "customStopWords")
    this.pipeline.add(customStopWords)

    /*
     * We can probably take advantage of pipelines to weight certain search terms
     * more heavily - such as giving more weight to HTTP verbs like POST, PUT, CREATE, etc.
     *
     * See searchPipeline in Builder properties: https://lunrjs.com/docs/lunr.Builder.html
     */

    operations.forEach((operation) => {
      const resource = resources.find((r) => operation.tags[0] === r.name)

      this.add({
        operationId: operation.operationId,

        /**
         * Add resource name to the beginning of summary because it improves
         * search results on Me psuedo resource
         */
        summary: `${resource ? resource.name : ""} ${operation.summary}`,

        /**
         * Add verb to the beginning of path array because for some reason it
         * improves the search results (instead of having verb as it's own token)
         */
        splitPath: [operation.verb, ...operation.path.split("/")],
        description: operation.description
      })
    })
  })
}

export interface ApiSection extends OpenAPIV3.TagObject {
  "x-id": string
}

export interface ApiResource extends OpenAPIV3.TagObject {
  "x-section-id": string
}

const buildOperations = (spec?: OpenAPI.Document) => {
  if (!spec) return []
  return flatten(
    values(
      mapValues(spec.paths, (ops, path) => {
        return values(
          mapValues(ops, (o: any, verb) => {
            const tags = o.tags[0] === "Me" ? [GetSubSectionName(path)] : o.tags
            return {...o, verb, path, tags}
          })
        )
      })
    )
  )
}

const buildResources = (spec?: OpenAPI.Document): ApiResource[] => {
  if (!spec) return []
  return spec.tags
    ? (spec.tags.filter((tag) => tag["x-section-id"]).concat(GetSubsectionsToAdd()) as ApiResource[])
    : []
}

const groupOperationsByResource = (operations) => {
  return mapValues(
    groupBy(operations, (o) => {
      return o.tags[0]
    }),
    (group) => sortBy(group, (o) => o.path)
  )
}

const useApiSpec = (baseUrl: string) => {
  const [spec, setSpec] = useState<OpenAPIV3.Document | undefined>(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(`${localStoragePrefix}${baseUrl}`)
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : undefined
    } catch (error) {
      // If error also return initialValue
      console.log(error)
      return undefined
    }
  })

  const retrieveSpec = useCallback(async (url: string) => {
    const result = await SwaggerParser.dereference(`${url}/v1/openapi/v3`)
    const v3doc = result as OpenAPIV3.Document
    if (v3doc.servers) {
      v3doc.servers[0].url = `${url}/v1`
    }
    // Clear out swagger specs in localStorage to prevent capacity errors
    const keys = Object.keys(window.localStorage)
    keys.filter((k) => k.includes("OcOpenApi")).map((i) => window.localStorage.removeItem(i))
    window.localStorage.setItem(`${localStoragePrefix}${url}`, JSON.stringify(v3doc))
    setSpec(v3doc)
  }, [])

  const validateSpecVersion = useCallback(
    async (url: string, version: string) => {
      const result = await fetch(`${url}/env`)
      const resultJson = await result.json()
      if (resultJson.BuildNumber && resultJson.BuildNumber !== version) {
        console.log(`Current spec (v${version}) is outdated, updating to ${resultJson.BuildNumber}`)
        retrieveSpec(url)
      }
    },
    [retrieveSpec]
  )

  useEffect(() => {
    if (
      spec &&
      spec.info &&
      spec.info.version &&
      spec.info.version.split(".").length === 4 &&
      spec.servers &&
      spec.servers[0].url === `${baseUrl}/v1`
    ) {
      validateSpecVersion(baseUrl, spec.info.version)
    }
  }, [spec, baseUrl, validateSpecVersion])

  useEffect(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(`${localStoragePrefix}${baseUrl}`)
      // Parse stored json or if none return initialValue
      item ? setSpec(JSON.parse(item)) : retrieveSpec(baseUrl)
    } catch (error) {
      // If error also return initialValue
      retrieveSpec(baseUrl)
    }
  }, [baseUrl, retrieveSpec])

  const result = useMemo(() => {
    const operations = buildOperations(spec)
    const resources = buildResources(spec)
    const operationsByResource = groupOperationsByResource(operations)
    const hookableOperationsByResource = groupOperationsByResource(operations.filter((o) => o.verb !== "get"))
    const listOperationsByResource = groupOperationsByResource(operations.filter((o) => o.verb === "get"))
    const hookableResources = resources.filter((r) => Object.keys(hookableOperationsByResource).includes(r.name))
    const listResources = resources.filter((r) => Object.keys(listOperationsByResource).includes(r.name))
    const operationsById = keyBy(operations, "operationId")
    const filteredResources = resources.filter((r) => !!operationsByResource[r.name])

    const roles = spec ? (spec as any).components.schemas.Webhook.properties.ElevatedRoles.items.enum : []
    //transformations
    return {
      operations,
      operationsByResource,
      hookableOperationsByResource,
      listOperationsByResource,
      sections: spec && spec.tags ? spec.tags.filter((tag) => tag["x-id"]) : [],
      resources: filteredResources, //filter out empty resources
      hookableResources,
      listResources,
      index: initializeIndex(operations, resources),
      operationsById,
      findResource: (operationId: string): ApiResource | undefined => {
        if (!spec) return

        const operation = operationsById[operationId]
        if (!operation) return
        const resourceName = operation.tags[0]
        return filteredResources.find((resource) => resource.name === resourceName)
      },
      findOperation: (operationId: string): any | undefined => {
        const operation = operationsById[operationId]
        if (operation && operation.parameters && operation.parameters.length) {
          operation.parameters.forEach((param) => {
            switch (param.schema.type) {
              case "string":
                param.value = ""
                break
              case "integer":
                param.value = param.required ? 0 : undefined
                break
              case "boolean":
                param.value = false
                break
              default:
                break
            }
          })
        }
        return operation
      },
      availableRoles: roles,
      spec
    }
  }, [spec])

  return result
}

export default useApiSpec

// This method is used to attach the correct subsection to routes.
const GetSubSectionName = (path: string) => {
  var sec = MeSubSections.find((sec) => sec.paths.includes(path))
  return sec ? sec.name : null
}

const GetSubsectionsToAdd = () => {
  return MeSubSections.filter((sec) => sec.name !== "Me") // There is already a Me subsection
}

const MeSubSections = [
  {
    name: "Me",
    "x-section-id": "MeAndMyStuff",
    paths: ["/me", "/me/register", "/me/password"]
  },
  {
    name: "My Sellers",
    "x-section-id": "MeAndMyStuff",
    paths: ["/me/sellers"]
  },
  {
    name: "My Cost Centers",
    "x-section-id": "MeAndMyStuff",
    paths: ["/me/costcenters"]
  },
  {
    name: "My User Groups",
    "x-section-id": "MeAndMyStuff",
    paths: ["/me/usergroups"]
  },
  {
    name: "My Addresses",
    "x-section-id": "MeAndMyStuff",
    paths: ["/me/addresses", "/me/addresses/{addressID}"]
  },
  {
    name: "My Credit Cards",
    "x-section-id": "MeAndMyStuff",
    paths: ["/me/creditcards", "/me/creditcards/{creditcardID}"]
  },
  {
    name: "My Categories",
    "x-section-id": "MeAndMyStuff",
    paths: ["/me/categories", "/me/categories/{categoryID}"]
  },
  {
    name: "My Products",
    "x-section-id": "MeAndMyStuff",
    paths: [
      "/me/products",
      "/me/products/{productID}",
      "/me/products/{productID}/specs",
      "/me/products/{productID}/specs/{specID}",
      "/me/products/{productID}/variants",
      "/me/products/{productID}/variants/{variantID}"
    ]
  },
  {
    name: "My Product Collections",
    "x-section-id": "MeAndMyStuff",
    paths: [
      "/me/productcollections",
      "/me/productcollections/{productCollectionID}",
      "/me/productcollections/{productCollectionID}/products",
      "/me/productcollections/{productCollectionID}/{productID}"
    ]
  },
  {
    name: "My Variants",
    "x-section-id": "MeAndMyStuff",
    paths: ["/me/products/{productID}/variants", "/me/products/{productID}/variants/{variantID}"]
  },
  {
    name: "My Orders",
    "x-section-id": "MeAndMyStuff",
    paths: ["/me/orders", "/me/orders/approvable"]
  },
  {
    name: "My Promotions",
    "x-section-id": "MeAndMyStuff",
    paths: ["/me/promotions", "/me/promotions/{promotionID}"]
  },
  {
    name: "My Spending Accounts",
    "x-section-id": "MeAndMyStuff",
    paths: ["/me/spendingAccounts", "/me/spendingaccounts/{spendingAccountID}"]
  },
  {
    name: "My Shipments",
    "x-section-id": "MeAndMyStuff",
    paths: ["/me/shipments", "/me/shipments/{shipmentID}", "/me/shipments/{shipmentID}/items"]
  },
  {
    name: "My Catalogs",
    "x-section-id": "MeAndMyStuff",
    paths: ["/me/catalogs", "/me/catalogs/{catalogID}"]
  }
]
