import {
  Badge,
  Button,
  Center,
  Collapse,
  Divider,
  Heading,
  HStack,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Tag,
  Text,
  UseDisclosureProps,
  VStack
} from "@chakra-ui/react"
import {FC, useCallback, useEffect, useState} from "react"
import {IProduct} from "types/ordercloud/IProduct"
import ProductDefaultImage from "../list/ProductDefaultImage"

interface IFilterModal {
  operation: string
  columns: string[]
  properties: any
  disclosure: UseDisclosureProps
  onComplete: () => void
}

const FilterModal: FC<IFilterModal> = ({operation, columns, properties, disclosure, onComplete}) => {
  const {isOpen, onClose} = disclosure
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setLoading(false)
    }
  }, [isOpen])

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        {loading && (
          <Center
            rounded="md"
            position="absolute"
            left={0}
            w="full"
            h="full"
            bg="whiteAlpha.500"
            zIndex={2}
            color="teal"
          >
            <Spinner></Spinner>
          </Center>
        )}
        <ModalHeader>Select Filters</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>filter options!</Text>
        </ModalBody>
        <ModalFooter as={HStack}>
          <Button variant="ghost" onClick={() => console.log("hello")}>
            Add Filters
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default FilterModal
