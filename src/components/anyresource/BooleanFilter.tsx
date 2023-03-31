import {ChevronDownIcon} from "@chakra-ui/icons"
import {Button, HStack, Menu, MenuButton, MenuItemOption, MenuList, MenuOptionGroup, Tag, Text} from "@chakra-ui/react"
import {FC} from "react"

interface IBooleanFilter {
  value: any
  name: string
  onChange: (newValue: any) => void
}

const BooleanFilter: FC<IBooleanFilter> = ({value, name, onChange}) => {
  return (
    <Menu>
      <MenuButton as={Button} py={0} variant="outline">
        <HStack alignContent="center" h="100%">
          <Text>{name}</Text>
          <Tag colorScheme={value && value.length ? (value === "true" ? "success" : "danger") : "secondary"}>
            {value && value.length ? (value === "true" ? "true" : "false") : "Any"}
          </Tag>
          <ChevronDownIcon />
        </HStack>
      </MenuButton>
      <MenuList>
        <MenuOptionGroup defaultValue={value} title={`Filter by ${name}`} type="radio" onChange={onChange}>
          <MenuItemOption value={""}>Any</MenuItemOption>
          <MenuItemOption value="true">True</MenuItemOption>
          <MenuItemOption value="false">False</MenuItemOption>
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  )
}

export default BooleanFilter
