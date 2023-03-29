import {Box, ButtonGroup, Center, IconButton, Stack, Text} from "@chakra-ui/react"
import {useRouter} from "next/router"
import {ListPage, ListPageWithFacets, Product} from "ordercloud-javascript-sdk"
import {ReactElement, useCallback, useEffect, useMemo, useState} from "react"
import {HiOutlineViewGrid, HiOutlineViewList} from "react-icons/hi"
import DataGrid, {IDataGrid} from "../DataGrid/DataGrid"
import DataTable, {IDataTable} from "../DataTable/DataTable"
import Pagination from "../Pagination/Pagination"

export interface IDefaultResource {
  ID?: string
  Name?: string
}

export interface ListViewTableOptions<T>
  extends Omit<IDataTable<T>, "data" | "selected" | "handleSelectionChange" | "rowActions"> {}

export interface ListViewGridOptions<T>
  extends Omit<IDataGrid<T>, "data" | "selected" | "handleSelectionChange" | "gridItemActions"> {}

export type ListViewTemplate = ReactElement | ReactElement[] | string

interface IListView<T = any, F = any> {
  initialViewMode?: "grid" | "table"
  service?: (...args) => Promise<ListPage<T>>
  itemActions: (item: T) => ReactElement
  tableOptions: ListViewTableOptions<T>
  gridOptions?: ListViewGridOptions<T>
  paramMap?: {[key: string]: string}
  queryMap?: {[key: string]: string}
  children?: (props: ListViewChildrenProps) => ReactElement
  noResultsMessage?: ListViewTemplate
  noDataMessage?: ListViewTemplate
}

export interface ListViewChildrenProps {
  metaInformationDisplay: React.ReactElement
  viewModeToggle: React.ReactElement
  updateQuery: (queryKey: string) => (value: string | boolean | number) => void
  routeParams: any
  queryParams: any
  selected: string[]
  loading: boolean
  renderContent: ListViewTemplate
}

const ListView = <T extends IDefaultResource>({
  service,
  paramMap,
  queryMap,
  itemActions,
  tableOptions,
  gridOptions,
  initialViewMode = "grid",
  children,
  noResultsMessage = "No results :(",
  noDataMessage = "Nothing here yet."
}: IListView<T>) => {
  const [data, setData] = useState<(T extends Product ? ListPageWithFacets<T> : ListPage<T>) | undefined>()
  const [viewMode, setViewMode] = useState<"grid" | "table">(initialViewMode)
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const handleSelectAll = useCallback(() => {
    setSelected((s) => (s.length && s.length === data.Items.length ? [] : data.Items.map((i) => i.ID)))
  }, [data])

  const handleSelectChange = useCallback((id: string, isSelected: boolean) => {
    setSelected((s) => (isSelected ? [...s, id] : s.filter((sid) => sid !== id)))
  }, [])

  const {push, pathname, isReady, query} = useRouter()

  const mapRouterQuery = useCallback(
    (map?: {[key: string]: string}) => {
      let result = {}
      if (!isReady) return result
      if (!map) return result
      Object.entries(query).forEach(([key, val]: [string, string]) => {
        if (map[key]) {
          result[map[key]] = val
        }
      })
      return result
    },
    [query, isReady]
  )

  const params = useMemo(() => {
    return {
      routeParams: mapRouterQuery(paramMap),
      queryParams: mapRouterQuery(queryMap)
    }
  }, [paramMap, queryMap, mapRouterQuery])

  const fetchData = useCallback(async () => {
    let response
    setLoading(true)
    // if (Object.values(params.routeParams).length) {
    //   response = await service(...Object.values(params.routeParams), params.queryParams)
    // } else {
    //   response = await service(params.queryParams)
    // }
    response = await service()
    setData(response)
    setLoading(false)
  }, [service])

  useEffect(() => {
    if (isReady) {
      fetchData()
    }
  }, [fetchData, isReady])

  const viewModeToggle = useMemo(() => {
    return (
      <ButtonGroup isAttached variant="secondaryButton">
        <IconButton
          aria-label="Grid View"
          isActive={viewMode === "grid"}
          icon={<HiOutlineViewGrid />}
          onClick={() => setViewMode("grid")}
        />
        <IconButton
          aria-label="List View"
          isActive={viewMode === "table"}
          icon={<HiOutlineViewList />}
          onClick={() => setViewMode("table")}
        />
      </ButtonGroup>
    )
  }, [viewMode])

  const handleUpdateQuery = useCallback(
    (queryKey: string) => (value: string | boolean | number) => {
      push({pathname: pathname, query: {...query, [queryKey]: value}})
    },
    [push, pathname, query]
  )

  const metaInformationDisplay = useMemo(() => {
    if (!data) return
    return (
      <Text
        alignSelf="center"
        flexShrink={0}
        fontWeight="bold"
      >{`${data.Meta.ItemRange[0]} - ${data.Meta.ItemRange[1]} of ${data.Meta.TotalCount}`}</Text>
    )
  }, [data])

  const currentPage = useMemo(() => {
    return params.queryParams["Page"] ? Number(params.queryParams["Page"]) : 1
  }, [params.queryParams])

  const renderContent = useMemo(() => {
    if (loading || (!loading && data)) {
      return (
        <Box mb={5}>
          {/* {viewMode === "grid" ? (
            //GRID VIEW
            <DataGrid
              {...gridOptions}
              loading={loading}
              gridItemActions={itemActions}
              data={data && data.Items}
              selected={selected}
              onSelectChange={handleSelectChange}
            />
          ) : ( */}

          <DataTable
            {...tableOptions}
            loading={loading}
            rowActions={itemActions}
            data={data && data.Items}
            selected={selected}
            onSelectChange={handleSelectChange}
            onSelectAll={handleSelectAll}
            currentSort={params.queryParams["SortBy"]}
            // onSortChange={() => console.log("SORT CHANGE")}
          />
          {/* )} */}
          <Center>
            <Pagination
              page={currentPage}
              totalPages={data && data.Meta.TotalPages}
              onChange={handleUpdateQuery("p")}
            />
          </Center>
        </Box>
      )
    }
  }, [
    data,
    loading,
    itemActions,
    tableOptions,
    params,
    selected,
    currentPage,
    handleUpdateQuery,
    handleSelectChange,
    handleSelectAll
  ])

  const childrenProps = useMemo(() => {
    return {
      viewModeToggle,
      metaInformationDisplay,
      updateQuery: handleUpdateQuery,
      routeParams: params.routeParams,
      queryParams: params.queryParams,
      selected,
      loading,
      renderContent
    }
  }, [selected, loading, metaInformationDisplay, viewModeToggle, params, handleUpdateQuery, renderContent])

  return children(childrenProps)
}

export default ListView
