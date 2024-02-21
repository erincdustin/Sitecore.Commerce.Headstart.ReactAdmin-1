import {Box, Button, ButtonGroup, Container, Icon, Tag, Text, useDisclosure} from "@chakra-ui/react"
import {DataTableColumn} from "@/components/shared/DataTable/DataTable"
import ListView, {ListViewTableOptions} from "@/components/shared/ListView/ListView"
import Link from "next/link"
import {FC, useCallback, useMemo, useState} from "react"
import BuyerCostCenterActionMenu from "./BuyerCostCenterActionMenu"
import BuyerCostCenterListToolbar from "./BuyerCostCenterListToolbar"
import BuyerCostCenterDeleteModal from "../modals/BuyerCostCenterDeleteModal"
import {CostCenters, CostCenter} from "ordercloud-javascript-sdk"

export const BuyerCostCenterColorSchemeMap = {
  "": "gray",
  true: "success",
  false: "danger"
}

interface IBuyerCostCenterList {
  buyerid: string
}

const buyerCostCenterListCall = async (buyerID: any) => {
  return await CostCenters.List(buyerID)
}

const paramMap = {
  buyerid: "BuyerID"
}

const BuyerCostCentersQueryMap = {
  s: "Search",
  sort: "SortBy",
  p: "Page"
}

const BuyerCostCentersFilterMap = {
  active: "Active"
}

const CostCenterIDColumn: DataTableColumn<CostCenter> = {
  header: "CostCenter ID",
  accessor: "ID",
  cell: ({value}) => (
    <Text noOfLines={2} title={value}>
      {value}
    </Text>
  )
}

const CostCenterNameColumn: DataTableColumn<CostCenter> = {
  header: "Name",
  accessor: "Name"
}

const CostCenterDescriptionColumn: DataTableColumn<CostCenter> = {
  header: "Description",
  accessor: "Description"
}

const BuyerCostCenterList: FC<IBuyerCostCenterList> = ({buyerid}) => {
  const [actionBuyerCostCenters, setActionBuyerCostCenters] = useState<CostCenter>()
  const deleteDisclosure = useDisclosure()

  const renderBuyerCostCentersActionMenu = useCallback(
    (buyercostcenter: CostCenter) => {
      return (
        <BuyerCostCenterActionMenu
          buyerid={buyerid}
          buyercostcenter={buyercostcenter}
          onOpen={() => setActionBuyerCostCenters(buyercostcenter)}
          onDelete={deleteDisclosure.onOpen}
        />
      )
    },
    [buyerid, deleteDisclosure.onOpen]
  )

  const BuyerCostCentersTableOptions: ListViewTableOptions<CostCenter> = useMemo(() => {
    return {
      responsive: {
        base: [CostCenterIDColumn, CostCenterNameColumn, CostCenterDescriptionColumn]
      }
    }
  }, [])

  const resolveCostCenterDetailHref = useCallback(
    (c: CostCenter) => {
      return `/buyers/${buyerid}/costcenters/${c.ID}`
    },
    [buyerid]
  )

  return (
    <ListView<CostCenter>
      service={buyerCostCenterListCall}
      tableOptions={BuyerCostCentersTableOptions}
      paramMap={paramMap}
      queryMap={BuyerCostCentersQueryMap}
      filterMap={BuyerCostCentersFilterMap}
      itemHrefResolver={resolveCostCenterDetailHref}
      itemActions={renderBuyerCostCentersActionMenu}
    >
      {({renderContent, items, ...listViewChildProps}) => (
        <Container maxW="100%" bgColor="st.mainBackgroundColor" flexGrow={1} p={[4, 6, 8]}>
          <Box>
            <BuyerCostCenterListToolbar buyerid={buyerid} {...listViewChildProps} />
          </Box>
          {renderContent}
          <BuyerCostCenterDeleteModal
            onComplete={listViewChildProps.removeItems}
            buyerId={buyerid}
            buyercostcenters={
              actionBuyerCostCenters
                ? [actionBuyerCostCenters]
                : items
                ? items.filter((buyercostcenter) => listViewChildProps.selected.includes(buyercostcenter.ID))
                : []
            }
            disclosure={deleteDisclosure}
          />
        </Container>
      )}
    </ListView>
  )
}

export default BuyerCostCenterList
