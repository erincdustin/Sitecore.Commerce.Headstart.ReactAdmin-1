import {BuyerCostCenterForm} from "@/components/buyercostcenters/detail/BuyerCostCenterForm"
import ProtectedContent from "components/auth/ProtectedContent"
import {appPermissions} from "config/app-permissions.config"
import {useRouter} from "next/router"

const NewBuyerCostCenterPage = () => {
  const router = useRouter()

  return (
    <ProtectedContent hasAccess={appPermissions.BuyerUserGroupManager}>
      <BuyerCostCenterForm buyerId={router.query.buyerid as string} />
    </ProtectedContent>
  )
}

export default NewBuyerCostCenterPage
