import {CheckCircleIcon, DeleteIcon, EditIcon, NotAllowedIcon, SettingsIcon} from "@chakra-ui/icons"
import {
  Box,
  Container,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  useDisclosure
} from "@chakra-ui/react"
import {ListPage, Products} from "ordercloud-javascript-sdk"
import {TbDotsVertical} from "react-icons/tb"
import {DataTableColumn} from "../shared/DataTable/DataTable"
import ListView, {ListViewTableOptions} from "../shared/ListView/ListView"
import buyerSpec from "./buyerSpec"
import buyerList from "./buyerList"
import ResourceListToolbar from "./ResourceListToolbar"
import {useState, useCallback} from "react"
import ProductActionMenu from "../products/list/ProductActionMenu"
import ProductListToolbar from "../products/list/ProductListToolbar"
import ProductBulkEditModal from "../products/modals/ProductBulkEditModal"
import ProductDeleteModal from "../products/modals/ProductDeleteModal"
import ProductPromotionModal from "../products/modals/ProductPromotionModal"

const QueryMap = {
  // ?
  s: "Search",
  sort: "SortBy",
  p: "Page"
}

const FilterMap = {
  active: "Active"
}

const properties = buyerSpec.responses["200"].content["application/json"].schema.properties.Items.items.properties
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

const getBuyers = () => Promise.resolve(buyerList)

const getBuyersAsync: () => Promise<ListPage<any>> = async () => {
  return await getBuyers()
}

const renderResourceActionsMenu = (rowData: any) => {
  return (
    <Menu>
      <MenuButton as={IconButton} aria-label={`Action menu for ${rowData.Name}`} variant="outline" colorScheme="gray">
        <Icon as={TbDotsVertical} mt={1} />
      </MenuButton>
      <MenuList>
        <MenuItem justifyContent="space-between">
          Edit <EditIcon />
        </MenuItem>
        <MenuItem color="blue.500" justifyContent="space-between">
          Promote <SettingsIcon />
        </MenuItem>
        <MenuItem justifyContent="space-between" color={rowData.Active ? "orange.500" : "green.500"}>
          {rowData.Active ? "Deactivate" : "Activate"}
          {rowData.Active ? <NotAllowedIcon /> : <CheckCircleIcon />}
        </MenuItem>
        <MenuDivider />
        <MenuItem justifyContent="space-between" color="red.500">
          Delete <DeleteIcon />
        </MenuItem>
      </MenuList>
    </Menu>
  )
}

// const ResourceTableOptions: ListViewTableOptions<any> = {
//   columns: ResourceListTableColumns
// }

const ResourceList = () => {
  const [actionProduct, setActionProduct] = useState<any>()
  const deleteDisclosure = useDisclosure()
  const promoteDisclosure = useDisclosure()
  const editDisclosure = useDisclosure()

  const renderProductActionsMenu = useCallback(
    (product: any) => {
      return (
        <ProductActionMenu
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
      service={getBuyersAsync}
      queryMap={QueryMap}
      filterMap={FilterMap}
      itemActions={renderProductActionsMenu}
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
