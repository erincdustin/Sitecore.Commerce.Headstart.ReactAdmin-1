import {CostCenter, CostCenters} from "ordercloud-javascript-sdk"
import {useEffect, useState} from "react"
import {Box, Container, Skeleton} from "@chakra-ui/react"
import {useRouter} from "hooks/useRouter"
import {BuyerCostCenterForm} from "@/components/buyercostcenters/detail/BuyerCostCenterForm"

const BuyerCostCenterPage = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [costCenter, setCostCenter] = useState({} as CostCenter)

  useEffect(() => {
    if (router.query.buyerid && router.query.costcenterid) {
      const getCostCenter = async (buyerId: string, costCenterId: string) => {
        const _costCenter = await CostCenters.Get(buyerId, costCenterId)
        setCostCenter(_costCenter)
        setLoading(false)
      }
      getCostCenter(router.query.buyerid as string, router.query.costcenterid as string)
    }
  }, [router.query.buyerid, router.query.costcenterid])

  if (loading) {
    return (
      <Container maxW="100%" bgColor="st.mainBackgroundColor" flexGrow={1} p={[4, 6, 8]}>
        <Skeleton w="100%" h="544px" borderRadius="md" />
      </Container>
    )
  }

  return (
    <Box padding="GlobalPadding">
      <BuyerCostCenterForm buyerId={router.query.buyerid as string} costCenter={costCenter} />
    </Box>
  )
}

export default BuyerCostCenterPage
