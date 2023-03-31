import {ChevronDownIcon} from "@chakra-ui/icons"
import {
  Button,
  Checkbox,
  HStack,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Stack,
  Tag,
  Text
} from "@chakra-ui/react"
import {FC, useCallback, useState} from "react"

interface IBooleanFilter {
  allColumns: string[]
  userColumns: string[]
  onChange: (newValue: any) => void
}

const ColumnSelector: FC<IBooleanFilter> = ({allColumns, userColumns, onChange}) => {
  const renderOptions = useCallback(
    (columnName: string) => {
      return (
        <Checkbox value={columnName} isChecked={userColumns.indexOf(columnName) > -1} onChange={(e) => onChange(e)}>
          {columnName}
        </Checkbox>
      )
    },
    [onChange, userColumns]
  )

  return (
    <Menu>
      <MenuButton as={Button} py={0} variant="outline">
        <HStack alignContent="center" h="100%">
          <Text>Customize Columns</Text>
          <ChevronDownIcon />
        </HStack>
      </MenuButton>
      <MenuList>
        <MenuOptionGroup defaultValue={userColumns} title={`Column Options`} type="radio">
          <Stack direction="column" ml={3}>
            {allColumns.map((c: string) => renderOptions(c))}
          </Stack>
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  )
}

export default ColumnSelector
