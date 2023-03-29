import {ListPage} from "ordercloud-javascript-sdk/dist/models"

const buyerList: ListPage<any> = {
  Meta: {
    Page: 1,
    PageSize: 20,
    TotalCount: 3,
    TotalPages: 1,
    ItemRange: [1, 3],
    NextPageKey: null
  },
  Items: [
    {
      ID: "buyer01",
      Name: "buyer01",
      DefaultCatalogID: "buyer01",
      Active: true,
      DateCreated: "2023-03-14T15:47:54.577+00:00",
      xp: null
    },
    {
      ID: "buyer02",
      Name: "buyer02",
      DefaultCatalogID: "buyer02",
      Active: false,
      DateCreated: "2023-03-14T16:53:54.083+00:00",
      xp: null
    },
    {
      ID: "buyer03",
      Name: "buyer03",
      DefaultCatalogID: "buyer03",
      Active: true,
      DateCreated: "2023-03-14T16:53:59.21+00:00",
      xp: null
    }
  ]
}

export default buyerList
