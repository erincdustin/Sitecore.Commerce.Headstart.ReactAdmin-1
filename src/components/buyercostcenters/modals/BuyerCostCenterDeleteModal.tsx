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
import {CostCenter, CostCenters} from "ordercloud-javascript-sdk"
import {FC, useCallback, useEffect, useState} from "react"

interface IBuyerCostCenterDeleteModal {
  buyerId: string
  buyercostcenters?: CostCenter[]
  disclosure: UseDisclosureProps
  onComplete: (idsToRemove: string[]) => void
}

const BuyerCostCenterDeleteModal: FC<IBuyerCostCenterDeleteModal> = ({
  buyerId,
  buyercostcenters,
  disclosure,
  onComplete
}) => {
  const {isOpen, onClose} = disclosure
  const [showbuyercostcenters, setShowbuyercostcenters] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setLoading(false)
      setShowbuyercostcenters(false)
    }
  }, [isOpen])

  const handleSubmit = useCallback(async () => {
    setLoading(true)
    try {
      await Promise.all(buyercostcenters.map((buyercostcenter) => CostCenters.Delete(buyerId, buyercostcenter?.ID)))
      onComplete(buyercostcenters.map((buyercostcenter) => buyercostcenter.ID))
      onClose()
    } finally {
      setLoading(false)
    }
  }, [buyerId, buyercostcenters, onComplete, onClose])

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
        <ModalHeader>Are you sure?</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <HStack justifyContent="space-between" mb={5}>
            <Heading size="sm" as="h5">
              {`Deleting ${buyercostcenters.length} Selected costcenter${buyercostcenters.length === 1 ? "" : "s"}`}
            </Heading>
            <Button variant="link" onClick={() => setShowbuyercostcenters((s) => !s)}>
              {showbuyercostcenters ? "Hide" : "Show"}
            </Button>
          </HStack>
          <Collapse in={showbuyercostcenters}>
            <List mb={5}>
              {buyercostcenters.map((buyercostcenter, i) => (
                <>
                  <ListItem key={buyercostcenter.ID} as={HStack}>
                    <HStack flexGrow={1} justifyContent="space-between">
                      <VStack alignItems="start">
                        <Badge>{buyercostcenter.ID}</Badge>
                        <Text>{buyercostcenter.Name}</Text>
                      </VStack>
                    </HStack>
                  </ListItem>
                  {i < buyercostcenters.length - 1 && <Divider my={3} />}
                </>
              ))}
            </List>
          </Collapse>
          <Text>
            This is an irreversible, destructive action. Please make sure that you have selected the right buyer
            costcenter.
          </Text>
        </ModalBody>
        <ModalFooter as={HStack}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="red" onClick={handleSubmit}>
            Delete Cost Center
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default BuyerCostCenterDeleteModal
