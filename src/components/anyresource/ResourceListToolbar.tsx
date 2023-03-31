import {Box, Button, Stack, Text} from "@chakra-ui/react"
import Link from "next/link"
import {FC, useCallback} from "react"
import DebouncedSearchInput from "../shared/DebouncedSearchInput/DebouncedSearchInput"
import {ListViewChildrenProps} from "../shared/ListView/ListView"
import ListViewMetaInfo from "../shared/ListViewMetaInfo/ListViewMetaInfo"
import ProductListActions from "../products/list/ProductListActions"
import ProductStatusFilter from "../products/list/ProductStatusFilter"
import BooleanFilter from "./BooleanFilter"
import ColumnSelector from "./ColumnSelector"

interface ProductListToolbarProps extends Omit<ListViewChildrenProps, "renderContent"> {
  columns: string[]
  userColumns: string[]
  properties: any
  resource: string
  onBulkPromote: () => void
  onBulkEdit: () => void
  onUpdateColumns: (newValue: any) => void
}

const ResourceListToolbar: FC<ProductListToolbarProps> = ({
  meta,
  viewModeToggle,
  updateQuery,
  onBulkPromote,
  onBulkEdit,
  onUpdateColumns,
  filterParams,
  queryParams,
  selected,
  columns,
  userColumns,
  properties,
  resource
}) => {
  const renderResourceActionsMenu = useCallback(() => {
    return columns.map((c, idx) => {
      switch (properties[c]?.type) {
        case "boolean":
          return (
            <BooleanFilter
              key={idx}
              value={filterParams[c]}
              name={c}
              onChange={updateQuery(c.toLocaleLowerCase(), true)}
            />
          )
        default:
          return
      }
    })
  }, [columns, filterParams, properties, updateQuery])

  return (
    <>
      <Stack direction="row" mb={2}>
        <Stack direction={["column", "column", "column", "row"]}>
          <DebouncedSearchInput
            label={`Search ${resource}`}
            value={queryParams["Search"]}
            onSearch={updateQuery("s", true)}
          />
          {/* <Stack direction="row">
            <ColumnSelector allColumns={columns} userColumns={userColumns} onChange={onUpdateColumns} />
          </Stack> */}
          <Stack direction="row">{renderResourceActionsMenu()}</Stack>
        </Stack>
        <Box as="span" flexGrow="1"></Box>
        <Stack direction={["column", "column", "column", "row"]}>
          <Stack direction="row" order={[1, 1, 1, 0]}>
            {meta && <ListViewMetaInfo range={meta.ItemRange} total={meta.TotalCount} />}
            <Box as="span" width="2"></Box>
            {viewModeToggle}
          </Stack>
          <Box order={[0, 0, 0, 1]} mt={0}>
            <Link passHref href="/products/new">
              <Button variant="solid" colorScheme="primary" as="a" mb={3}>
                Create placeholder
              </Button>
            </Link>
          </Box>
        </Stack>
      </Stack>
      <Stack direction="row" mb={5}>
        <ColumnSelector allColumns={columns} userColumns={userColumns} onChange={onUpdateColumns} />
      </Stack>
    </>
  )
}

export default ResourceListToolbar
