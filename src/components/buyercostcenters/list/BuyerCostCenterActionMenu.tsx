import ProtectedContent from "@/components/auth/ProtectedContent"
import {DeleteIcon, EditIcon} from "@chakra-ui/icons"
import {Icon, IconButton, Menu, MenuButton, MenuDivider, MenuItem, MenuList} from "@chakra-ui/react"
import {appPermissions} from "config/app-permissions.config"
import Link from "next/link"
import {CostCenter} from "ordercloud-javascript-sdk"
import {FC} from "react"
import {TbDotsVertical} from "react-icons/tb"

interface IBuyerCostCenterActionMenu {
  buyerid: string
  buyercostcenter: CostCenter
  onOpen?: () => void
  onClose?: () => void
  onDelete: () => void
}

const BuyerCostCenterActionMenu: FC<IBuyerCostCenterActionMenu> = ({
  buyerid,
  buyercostcenter,
  onOpen,
  onClose,
  onDelete
}) => {
  return (
    <Menu computePositionOnMount isLazy onOpen={onOpen} onClose={onClose} strategy="fixed">
      <MenuButton as={IconButton} aria-label={`Action menu for ${buyercostcenter.Name}`} variant="ghost">
        <Icon as={TbDotsVertical} mt={1} />
      </MenuButton>
      <MenuList>
        <Link passHref href={`/buyers/${buyerid}/costcenters/${buyercostcenter.ID}`}>
          <MenuItem as="a" justifyContent="space-between">
            Edit <EditIcon />
          </MenuItem>
        </Link>
        <MenuDivider />
        <MenuItem justifyContent="space-between" color="red.500" onClick={onDelete}>
          Delete <DeleteIcon />
        </MenuItem>
      </MenuList>
    </Menu>
  )
}

export default BuyerCostCenterActionMenu
