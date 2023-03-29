import {DeleteIcon, EditIcon, SettingsIcon} from "@chakra-ui/icons"
import {Icon, IconButton, Menu, MenuButton, MenuDivider, MenuItem, MenuList} from "@chakra-ui/react"
import Link from "next/link"
import {FC} from "react"
import {TbDotsVertical} from "react-icons/tb"
import {IProduct} from "types/ordercloud/IProduct"

interface IProductActionMenu {
  product: IProduct
  onOpen?: () => void
  onClose?: () => void
  onDelete: () => void
  onPromote: () => void
}

const ProductActionMenu: FC<IProductActionMenu> = ({product, onOpen, onClose, onDelete, onPromote}) => {
  return (
    <Menu computePositionOnMount isLazy onOpen={onOpen} onClose={onClose} strategy="fixed">
      <MenuButton
        as={IconButton}
        aria-label={`Product action menu for ${product.Name}`}
        variant="ghost"
        colorScheme="secondary"
      >
        <Icon as={TbDotsVertical} mt={1} />
      </MenuButton>
      <MenuList>
        <Link passHref href={`/products/${product.ID}`}>
          <MenuItem as="a" justifyContent="space-between">
            Edit <EditIcon />
          </MenuItem>
        </Link>
        <MenuItem color="blue.500" justifyContent="space-between" onClick={onPromote}>
          Promote <SettingsIcon />
        </MenuItem>
        <MenuDivider />
        <MenuItem justifyContent="space-between" color="red.500" onClick={onDelete}>
          Delete <DeleteIcon />
        </MenuItem>
      </MenuList>
    </Menu>
  )
}

export default ProductActionMenu
