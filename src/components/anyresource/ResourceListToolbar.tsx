import {Box, Button, Stack, Text} from "@chakra-ui/react"
import Link from "next/link"
import {FC} from "react"
import DebouncedSearchInput from "../shared/DebouncedSearchInput/DebouncedSearchInput"
import {ListViewChildrenProps} from "../shared/ListView/ListView"
import ListViewMetaInfo from "../shared/ListViewMetaInfo/ListViewMetaInfo"
import ProductListActions from "../products/list/ProductListActions"
import ProductStatusFilter from "../products/list/ProductStatusFilter"

interface ProductListToolbarProps extends Omit<ListViewChildrenProps, "renderContent"> {
  onBulkPromote: () => void
  onBulkEdit: () => void
}

const ResourceListToolbar: FC<ProductListToolbarProps> = ({
  meta,
  viewModeToggle,
  updateQuery,
  onBulkPromote,
  onBulkEdit,
  filterParams,
  queryParams,
  selected
}) => {
  return (
    <>
      <Stack direction="row" mb={5}>
        <Stack direction={["column", "column", "column", "row"]}>
          <DebouncedSearchInput
            label="Search {placeholder}"
            value={queryParams["Search"]}
            onSearch={updateQuery("s", true)}
          />
          <Stack direction="row">
            <ProductStatusFilter value={filterParams["Active"]} onChange={updateQuery("active", true)} />
            <ProductListActions selected={selected} onBulkPromote={onBulkPromote} onBulkEdit={onBulkEdit} />
          </Stack>
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
    </>
  )
}

export default ResourceListToolbar
