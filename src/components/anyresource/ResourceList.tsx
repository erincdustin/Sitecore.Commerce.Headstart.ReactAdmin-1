import {CheckCircleIcon, DeleteIcon, EditIcon, NotAllowedIcon, SettingsIcon} from "@chakra-ui/icons"
import {Container, Icon, IconButton, Menu, MenuButton, MenuDivider, MenuItem, MenuList} from "@chakra-ui/react"
import {ListPage} from "ordercloud-javascript-sdk"
import {TbDotsVertical} from "react-icons/tb"
import {DataTableColumn} from "../shared/DataTable/DataTable"
import ListView, {ListViewTableOptions} from "../shared/ListView/ListView"
import buyerSpec from "./buyerSpec"
import buyerList from "./buyerList"
import ResourceListToolbar from "./ResourceListToolbar"

const QueryMap = {
  // ?
  s: "Search",
  sort: "SortBy",
  p: "Page"
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

const ResourceTableOptions: ListViewTableOptions<any> = {
  columns: ResourceListTableColumns
}

const ResourceList = () => {
  return (
    <ListView<any>
      service={getBuyersAsync}
      queryMap={QueryMap}
      itemActions={renderResourceActionsMenu}
      tableOptions={ResourceTableOptions}
    >
      {({renderContent, ...listViewChildProps}) => (
        <Container maxW="container.2xl">
          <ResourceListToolbar {...listViewChildProps} />
          {renderContent}
        </Container>
      )}
    </ListView>
  )
}

export default ResourceList
