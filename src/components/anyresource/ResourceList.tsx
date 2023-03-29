import {Box, Container, useDisclosure} from "@chakra-ui/react"
import {ListPage} from "ordercloud-javascript-sdk"
import {DataTableColumn} from "../shared/DataTable/DataTable"
import ListView, {ListViewTableOptions} from "../shared/ListView/ListView"
// import buyerSpec from "./buyerSpec"
// import buyerList from "./buyerList"
import {useState, useCallback, useContext} from "react"
import ProductListToolbar from "../products/list/ProductListToolbar"
import ProductBulkEditModal from "../products/modals/ProductBulkEditModal"
import ProductDeleteModal from "../products/modals/ProductDeleteModal"
import ProductPromotionModal from "../products/modals/ProductPromotionModal"
import ResourceActionMenu from "./ResourceActionMenu"
import useApiSpec from "hooks/useApiSpec"
import ocConfig from "constants/ordercloud-config"
import {AuthContext} from "context/auth-context"
import BizUserRequest, {FieldValues} from "./bizUserRequest"

const QueryMap = {
  // ?
  s: "Search",
  sort: "SortBy",
  p: "Page"
}

const FilterMap = {
  active: "Active"
}

// const properties = buyerSpec.responses["200"].content["application/json"].schema.properties.Items.items.properties
// const headers = Object.keys(properties).filter((p) => p !== "xp")
// const ResourceListTableColumns: DataTableColumn<any>[] = headers.map((h) => {
//   return {
//     header: h,
//     accessor: h,
//     cell: ({row, value}) => value.toString(),
//     sortable: true
//   }
// })

// const ResourceTableOptions: ListViewTableOptions<any> = {
//   responsive: {
//     base: ResourceListTableColumns,
//     md: ResourceListTableColumns,
//     lg: ResourceListTableColumns,
//     xl: ResourceListTableColumns
//   }
// }

// const getBuyers = () => Promise.resolve(buyerList)

// const getBuyersAsync: () => Promise<ListPage<any>> = async () => {
//   return await getBuyers()
// }

const resource = "Buyers"
const operation = "Buyers.List"

const ResourceList = () => {
  const [actionProduct, setActionProduct] = useState<any>()
  const deleteDisclosure = useDisclosure()
  const promoteDisclosure = useDisclosure()
  const editDisclosure = useDisclosure()
  const {listOperationsByResource} = useApiSpec(ocConfig.baseApiUrl)
  const {accessToken} = useContext(AuthContext)
  const selectedOperation = listOperationsByResource[resource].find((o) => o.operationId === operation)
  const properties = selectedOperation
    ? selectedOperation.responses["200"].content["application/json"].schema.properties.Items.items.properties
    : {}
  const headers = Object.keys(properties).filter((p) => p !== "xp")
  const ResourceListTableColumns: DataTableColumn<any>[] = headers.map((h) => {
    return {
      header: h,
      accessor: h,
      cell: ({row, value}) => value.toString(),
      sortable: true
    }
  })
  const ResourceTableOptions: ListViewTableOptions<any> = {
    responsive: {
      base: ResourceListTableColumns,
      md: ResourceListTableColumns,
      lg: ResourceListTableColumns,
      xl: ResourceListTableColumns
    }
  }

  const retrieveItems = useCallback(
    async (options: any, cancelToken) => {
      const request = new BizUserRequest(
        accessToken,
        {
          body: {} as FieldValues,
          params: {...options.filters, options},
          locked: {}
        },
        listOperationsByResource[resource].find((o) => o.operationId === operation)
      )
      const response = await request.send()
      return response.data
    },
    [accessToken, listOperationsByResource]
  )

  const renderResourceActionsMenu = useCallback(
    (product: any) => {
      return (
        <ResourceActionMenu
          product={product}
          onOpen={() => setActionProduct(product)}
          // onClose={() => setActionProduct(undefined)}
          onDelete={deleteDisclosure.onOpen}
          onPromote={promoteDisclosure.onOpen}
        />
      )
    },
    [deleteDisclosure.onOpen, promoteDisclosure.onOpen]
  )

  return (
    <ListView<any>
      service={retrieveItems}
      queryMap={QueryMap}
      filterMap={FilterMap}
      itemActions={renderResourceActionsMenu}
      tableOptions={ResourceTableOptions}
      // gridOptions={ProductGridOptions}
    >
      {({renderContent, items, ...listViewChildProps}) => (
        <Container maxW="100%">
          <Box>
            <ProductListToolbar
              {...listViewChildProps}
              onBulkEdit={editDisclosure.onOpen}
              onBulkPromote={() => {
                setActionProduct(undefined)
                promoteDisclosure.onOpen()
              }}
            />
          </Box>
          {renderContent}
          <ProductBulkEditModal
            onComplete={listViewChildProps.upsertItems}
            products={items ? items.filter((p) => listViewChildProps.selected.includes(p.ID)) : []}
            disclosure={editDisclosure}
          />
          <ProductDeleteModal
            onComplete={listViewChildProps.removeItems}
            products={
              actionProduct
                ? [actionProduct]
                : items
                ? items.filter((p) => listViewChildProps.selected.includes(p.ID))
                : []
            }
            disclosure={deleteDisclosure}
          />
          <ProductPromotionModal
            products={
              actionProduct
                ? [actionProduct]
                : items
                ? items.filter((p) => listViewChildProps.selected.includes(p.ID))
                : []
            }
            disclosure={promoteDisclosure}
          />
        </Container>
      )}
    </ListView>
  )
}

export default ResourceList
