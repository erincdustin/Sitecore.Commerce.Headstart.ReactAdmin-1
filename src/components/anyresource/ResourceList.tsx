import {Box, Container, HStack, Link, Tag, Text, useDisclosure} from "@chakra-ui/react"
import {DataTableColumn} from "../shared/DataTable/DataTable"
import ListView, {ListViewTableOptions, LocationSearchMap} from "../shared/ListView/ListView"
import {useState, useCallback, useContext, useMemo, useEffect, FC} from "react"
import ResourceActionMenu from "./ResourceActionMenu"
import useApiSpec from "hooks/useApiSpec"
import ocConfig from "constants/ordercloud-config"
import {AuthContext} from "context/auth-context"
import BizUserRequest, {FieldValues} from "./bizUserRequest"
import ResourceListToolbar from "./ResourceListToolbar"
import {flattenNestedProperties} from "utils/spec.utils"
import {useRouter} from "hooks/useRouter"
import {textHelper} from "utils/text.utils"
import {string} from "yup"
import moment from "moment"
import FilterModal from "./modals/FilterModal"

const QueryMap = {
  // ?
  s: "Search",
  sort: "SortBy",
  p: "Page"
}
interface ResourceListProps {
  operation: string
}

const ResourceList: FC<ResourceListProps> = ({operation}) => {
  const [actionProduct, setActionProduct] = useState<any>()
  const deleteDisclosure = useDisclosure()
  const filterDisclosure = useDisclosure()
  const router = useRouter()
  const {listOperationsByResource} = useApiSpec(ocConfig.baseApiUrl)
  const {accessToken} = useContext(AuthContext)
  const resource = useMemo(() => operation.split(".")[0], [operation])
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
  const headers = useMemo(() => {
    return Object.keys(properties).filter((p) => p !== "xp" && p !== "Password")
  }, [properties])
  const getSavedColumnHeaders = useCallback(() => {
    const columns = localStorage.getItem(`${operation}:tableColumns`)
    if (!columns?.length) {
      return headers
    }
    return JSON.parse(columns)
  }, [headers, operation])
  const [columns, setColumns] = useState(getSavedColumnHeaders)

  useEffect(() => {
    localStorage.setItem(`${operation}:tableColumns`, JSON.stringify(columns))
  }, [columns, operation])

  const toggleVisibility = useCallback(
    (e: any) => {
      const isSelected = columns.indexOf(e.target.value) > -1
      if (isSelected) {
        setColumns(
          columns
            .filter((i) => i !== e.target.value)
            .sort((a, b) => {
              return headers.indexOf(a) - headers.indexOf(b)
            })
        )
      } else {
        setColumns(
          [...columns, e.target.value].sort((a, b) => {
            return headers.indexOf(a) - headers.indexOf(b)
          })
        )
      }
    },
    [columns, headers]
  )

  const getUrl = useCallback(
    (name: string, value: string) => {
      let path = `${router.pathname}/${value}`
      if (requiredParamsinPath) {
        requiredParamsinPath.forEach((p) => {
          const paramValue = requiredParams[p]
          path = path.replace(`[${p.toLocaleLowerCase()}]`, paramValue)
        })
      }
      return path
    },
    [requiredParams, requiredParamsinPath, router.pathname]
  )

  const getType = useCallback(
    (header: string) => {
      const type = properties[header].type
      switch (type) {
        case "string":
          return properties[header]?.format === "date-time"
            ? "date-time"
            : properties[header]?.enum
            ? "enum"
            : properties[header]?.maxLength > 200
            ? "long-text"
            : "short-text"
        default:
          return type
      }
    },
    [properties]
  )

  const getCellValue = useCallback(
    (header: string, value: any) => {
      const type = getType(header)
      switch (type) {
        case "date-time":
          return <Text>{moment(value?.toString()).format("YYYY-MM-DD, h:mm:ss A")}</Text>
        case "short-text":
          return header === "ID" ? (
            <Link href={getUrl(header, value?.toString())}>{value?.toString()}</Link>
          ) : (
            <Text>{value?.toString()}</Text>
          ) //TODO: link whole table row to item ID
        case "long-text":
          return (
            <Text w="100%" maxW="400px" noOfLines={2} fontSize="xs" title={value?.toString()}>
              {value?.toString() ? textHelper.stripHTML(value?.toString()) : ""}
            </Text>
          )
        case "array":
          return (
            <HStack spacing={2}>
              {value.map((v) => (
                <Tag size="sm" key={v.toString()} variant="solid" colorScheme="teal">
                  {v.toString()}
                </Tag>
              ))}
            </HStack>
          )
        case "boolean":
          return value !== null ? (
            <Tag size="md" colorScheme={Boolean(value) ? "green" : "red"}>
              {value.toString()}
            </Tag>
          ) : (
            ""
          )
        case "enum":
          return (
            <Tag size="md" colorScheme="yellow">
              {value.toString()}
            </Tag>
          )
        default:
          return <Text>{value?.toString()}</Text>
      }
    },
    [getType, getUrl]
  )

  const ResourceListTableColumns: DataTableColumn<any>[] = useMemo(
    () =>
      columns.map((h) => {
        return {
          header: h,
          accessor: h,
          cell: ({row, value}) => getCellValue(h, value),
          sortable: sortByArray.includes(h)
        }
      }),
    [columns, getCellValue, sortByArray]
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
    [accessToken, listOperationsByResource, operation, requiredParams, resource]
  )

  const renderResourceActionsMenu = useCallback(
    (product: any) => {
      return (
        <ResourceActionMenu
          product={product}
          onOpen={() => setActionProduct(product)}
          // onClose={() => setActionProduct(undefined)}
          onDelete={deleteDisclosure.onOpen}
        />
      )
    },
    [deleteDisclosure.onOpen]
  )

  const getFilterMap = useCallback(() => {
    let filterMap: LocationSearchMap = {}
    headers.forEach((h) => (filterMap[h.toLocaleLowerCase()] = h))
    return filterMap
  }, [headers])

  return (
    <ListView<any>
      service={retrieveItems}
      queryMap={QueryMap}
      filterMap={getFilterMap()}
      itemActions={renderResourceActionsMenu}
      tableOptions={ResourceTableOptions}
      // gridOptions={ProductGridOptions}
    >
      {({renderContent, items, ...listViewChildProps}) => (
        <Container maxW="100%">
          <Box>
            <ResourceListToolbar
              {...listViewChildProps}
              columns={headers}
              userColumns={columns}
              properties={properties}
              resource={resource}
              filterMap={getFilterMap()}
              onUpdateColumns={toggleVisibility}
              onToggleFilters={() => filterDisclosure.onOpen()}
            />
          </Box>
          {renderContent}
          <FilterModal
            columns={columns}
            operation={operation}
            properties={properties}
            disclosure={filterDisclosure}
          />
        </Container>
      )}
    </ListView>
  )
}

export default ResourceList
