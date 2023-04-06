import {Box, Button, Stack, Tag, HStack, TagCloseButton, TagLabel} from "@chakra-ui/react"
import Link from "next/link"
import {FC, useCallback} from "react"
import DebouncedSearchInput from "../shared/DebouncedSearchInput/DebouncedSearchInput"
import {ListViewChildrenProps} from "../shared/ListView/ListView"
import ListViewMetaInfo from "../shared/ListViewMetaInfo/ListViewMetaInfo"
import ProductListActions from "../products/list/ProductListActions"
import ProductStatusFilter from "../products/list/ProductStatusFilter"
import BooleanFilter from "./BooleanFilter"
import ColumnSelector from "./ColumnSelector"
import {useRouter} from "hooks/useRouter"

interface ProductListToolbarProps extends Omit<ListViewChildrenProps, "renderContent"> {
  columns: string[]
  userColumns: string[]
  properties: any
  resource: string
  filterMap: any
  // onBulkPromote: () => void
  // onBulkEdit: () => void
  onUpdateColumns: (newValue: any) => void
  onToggleFilters: () => void
}

const ResourceListToolbar: FC<ProductListToolbarProps> = ({
  meta,
  viewModeToggle,
  updateQuery,
  onUpdateColumns,
  deleteQueryKey,
  onToggleFilters,
  filterParams,
  queryParams,
  selected,
  columns,
  filterMap,
  userColumns,
  properties,
  resource
}) => {
  const {query} = useRouter()
  const renderFilterChips = useCallback(() => {
    return (
      <HStack spacing={2}>
        {Object.entries(query)
          .filter(([key, val]: [string, string]) =>
            columns.map((c) => c.toLocaleLowerCase()).includes(key.toLocaleLowerCase())
          )
          .map(([key, val]: [string, string]) => (
            <Tag size="lg" key={key} borderRadius="full" variant="solid">
              <TagLabel>{key.charAt(0).toUpperCase() + key.slice(1)}</TagLabel>
              <TagCloseButton type="button" onClick={deleteQueryKey(key)} />
            </Tag>
          ))}
      </HStack>
    )
  }, [columns, deleteQueryKey, query])

  return (
    <>
      <Stack direction="row" mb={2}>
        <Stack direction={["column", "column", "column", "row"]}>
          <DebouncedSearchInput
            label={`Search ${resource}`}
            value={queryParams["Search"]}
            onSearch={updateQuery("s", true)}
          />
          {/* <Stack direction="row">{renderResourceActionsMenu()}</Stack> */}
          {/* <Button onClick={onToggleFilters}>Add Filters</Button> */}
          <Stack direction="row">{renderFilterChips()}</Stack>
        </Stack>
        <Box as="span" flexGrow="1"></Box>
        <Stack direction={["column", "column", "column", "row"]}>
          <Stack direction="row" order={[1, 1, 1, 0]}>
            {meta && <ListViewMetaInfo range={meta.ItemRange} total={meta.TotalCount} />}
            <Box as="span" width="2"></Box>
            {viewModeToggle}
          </Stack>
        </Stack>
      </Stack>
      <Stack direction="row" mb={5}>
        <ColumnSelector allColumns={columns} userColumns={userColumns} onChange={onUpdateColumns} />
      </Stack>
    </>
  )
}

export default ResourceListToolbar
