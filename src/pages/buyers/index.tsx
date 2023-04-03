
import ProtectedContent from "components/auth/ProtectedContent"
import React from "react"
import {appPermissions} from "constants/app-permissions.config"
import {dateHelper} from "utils/date.utils"
import {useRouter} from "hooks/useRouter"
import {useSuccessToast} from "hooks/useToast"
import ResourceList from "@/components/anyresource/ResourceList"

/* This declare the page title and enable the breadcrumbs in the content header section. */
export async function getStaticProps() {
  return {
    props: {
      header: {
        title: "Buyers List",
        metas: {
          hasBreadcrumbs: true
        }
      },
      revalidate: 5 * 60
    }
  }
}

const ProtectedBuyersList = () => {
  return (
    <ProtectedContent hasAccess={appPermissions.ProductManager}>
    <ResourceList operation="Buyers.List" resource="Buyers" />
  </ProtectedContent>
  )
}

export default ProtectedBuyersList
