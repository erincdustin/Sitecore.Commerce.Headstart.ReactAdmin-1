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
    return columns
      .filter((c) => c === "Active")
      .map((c, idx) => {
        // TODO: temp. hiding other boolean filters
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
          <Stack direction="row">{renderResourceActionsMenu()}</Stack>
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
