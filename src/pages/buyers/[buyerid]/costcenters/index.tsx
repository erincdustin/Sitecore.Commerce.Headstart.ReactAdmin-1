import React from "react"
import {useRouter} from "hooks/useRouter"
import BuyerCostCenterList from "@/components/buyercostcenters/list/BuyerCostCenterList"
import ProtectedContent from "@/components/auth/ProtectedContent"
import {appPermissions} from "config/app-permissions.config"

const CostCentersList = () => {
  const router = useRouter()
  const buyerid = router.query.buyerid as string

  return <BuyerCostCenterList buyerid={buyerid} />
}

export default CostCentersList
