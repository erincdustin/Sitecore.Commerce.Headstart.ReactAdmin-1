import {Box, Container, Link, useDisclosure} from "@chakra-ui/react"
import {ListPage} from "ordercloud-javascript-sdk"
import {DataTableColumn} from "../shared/DataTable/DataTable"
import ListView, {ListViewTableOptions} from "../shared/ListView/ListView"
// import buyerSpec from "./buyerSpec"
// import buyerList from "./buyerList"
import {useState, useCallback, useContext, useMemo, useEffect, FC} from "react"
import ProductBulkEditModal from "../products/modals/ProductBulkEditModal"
import ProductDeleteModal from "../products/modals/ProductDeleteModal"
import ProductPromotionModal from "../products/modals/ProductPromotionModal"
import ResourceActionMenu from "./ResourceActionMenu"
import useApiSpec from "hooks/useApiSpec"
import ocConfig from "constants/ordercloud-config"
import {AuthContext} from "context/auth-context"
import BizUserRequest, {FieldValues} from "./bizUserRequest"
import ResourceListToolbar from "./ResourceListToolbar"
import {flattenNestedProperties} from "utils/spec.utils"
import {useRouter} from "hooks/useRouter"

const QueryMap = {
  // ?
  s: "Search",
  sort: "SortBy",
  p: "Page"
}

const FilterMap = {
  active: "Active"
}

// const resource = "Users"
// const operation = "Users.List"

const DEFAULT_SORT_ORDER = [
  "OwnerID",
  "DefaultPriceScheduleID",
  "AutoForward",
  "ID",
  "ParentID",
  "IsParent",
  "Name",
  "Description",
  "QuantityMultiplier",
  "ShipWeight",
  "ShipHeight",
  "ShipWidth",
  "ShipLength",
  "DefaultCatalogID",
  "CategoryCount",
  "Active",
  "SpecCount",
  "VariantCount",
  "ShipFromAddressID",
  "Inventory.Enabled",
  "Inventory.NotificationPoint",
  "Inventory.VariantLevelTracking",
  "Inventory.OrderCanExceed",
  "Inventory.QuantityAvailable",
  "Inventory.LastUpdated",
  "DateCreated",
  "Returnable",
  "AllSuppliersCanSell",
  "DefaultSupplierID"
]

interface ResourceListProps {
  resource: string
  operation: string
}

const ResourceList: FC<ResourceListProps> = ({resource, operation}) => {
  const [actionProduct, setActionProduct] = useState<any>()
  const deleteDisclosure = useDisclosure()
  const promoteDisclosure = useDisclosure()
  const editDisclosure = useDisclosure()
  const router = useRouter()
  const {listOperationsByResource} = useApiSpec(ocConfig.baseApiUrl)
  const {accessToken} = useContext(AuthContext)
  const selectedOperation = useMemo(
    () => listOperationsByResource[resource].find((o) => o.operationId === operation),
    [listOperationsByResource, operation, resource]
  )
  const requiredParamsinPath = useMemo(
    () =>
      selectedOperation && selectedOperation?.parameters
        ? selectedOperation.parameters.filter((p) => p.in === "path" && p.required).map((p) => p.name)
        : [],
    [selectedOperation]
  )
  const requiredParams = useMemo(() => {
    let paramsObj = {}
    requiredParamsinPath.forEach((p) => {
      paramsObj[p] = router.query[p.toLocaleLowerCase()] as string
    })
    return paramsObj
  }, [requiredParamsinPath, router.query])
  const properties = useMemo(
    () =>
      selectedOperation
        ? flattenNestedProperties(
            selectedOperation.responses["200"].content["application/json"].schema.properties.Items.items.properties
          )
        : {},
    [selectedOperation]
  )
  const sortByArray = useMemo(
    () => selectedOperation.parameters.find((p) => p.name === "sortBy")?.schema.items.enum || [],
    [selectedOperation]
  )
  const headers = useMemo(
    () =>
      Object.keys(properties)
        .filter((p) => p !== "xp")
        .sort((a, b) => {
          return DEFAULT_SORT_ORDER.indexOf(a) - DEFAULT_SORT_ORDER.indexOf(b)
        }),
    [properties]
  )
  const getSavedColumnHeaders = useCallback(() => {
    const columns = localStorage.getItem(`${operation}:tableColumns`)
    if (!columns?.length) {
      return headers
    }
    return JSON.parse(columns)
  }, [headers])
  const [columns, setColumns] = useState(getSavedColumnHeaders)

  useEffect(() => {
    localStorage.setItem(`${operation}:tableColumns`, JSON.stringify(columns))
  }, [columns])

  const toggleVisibility = useCallback(
    (e: any) => {
      const isSelected = columns.indexOf(e.target.value) > -1
      if (isSelected) {
        setColumns(columns.filter((i) => i !== e.target.value))
      } else {
        setColumns([...columns, e.target.value])
      }
    },
    [columns]
  )

  const getUrl = useCallback(
    (name: string, value: string) => {
      let path = `${router.pathname}/${value}`
      if (requiredParamsinPath) {
        requiredParamsinPath.forEach((p) => {
          const paramValue = requiredParams[p]
          path = path.replace(`[${p.toLocaleLowerCase()}]`, paramValue) // TODO: fix for non-required params i.e. buyer catalogs
        })
      }
      return path
    },
    [requiredParams, requiredParamsinPath, router.pathname]
  )

  const ResourceListTableColumns: DataTableColumn<any>[] = useMemo(
    () =>
      columns.map((h) => {
        return {
          header: h,
          accessor: h,
          cell: ({row, value}) =>
            h === "ID" ? <Link href={getUrl(h, value?.toString())}>{value?.toString()}</Link> : value?.toString(),
          sortable: sortByArray.includes(h)
        }
      }),
    [columns, router.pathname, sortByArray]
  )
  const ResourceTableOptions: ListViewTableOptions<any> = useMemo(() => {
    return {
      responsive: {
        base: ResourceListTableColumns?.filter((c) => c.header === "ID" || c.header === "Name"), // TODO: make dynamic
        md: ResourceListTableColumns,
        lg: ResourceListTableColumns,
        xl: ResourceListTableColumns
      }
    }
  }, [ResourceListTableColumns])

  const retrieveItems = useCallback(
    async (options: any, cancelToken) => {
      const request = new BizUserRequest(
        accessToken,
        {
          body: {} as FieldValues,
          params: {...options, ...requiredParams},
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
            <ResourceListToolbar
              {...listViewChildProps}
              onBulkEdit={editDisclosure.onOpen}
              onBulkPromote={() => {
                setActionProduct(undefined)
                promoteDisclosure.onOpen()
              }}
              columns={headers}
              userColumns={columns}
              properties={properties}
              resource={resource}
              onUpdateColumns={toggleVisibility}
            />
          </Box>
          {renderContent}
        </Container>
      )}
    </ListView>
  )
}

export default ResourceList
