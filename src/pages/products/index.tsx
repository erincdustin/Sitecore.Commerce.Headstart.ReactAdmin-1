import ResourceList from "@/components/anyresource/ResourceList"
import ProductList from "@/components/products/list/ProductList"
import ProtectedContent from "components/auth/ProtectedContent"
import {appPermissions} from "constants/app-permissions.config"

/* This declare the page title and enable the breadcrumbs in the content header section. */
export async function getServerSideProps() {
  return {
    props: {
      header: {
        title: "Products List",
        metas: {
          hasBreadcrumbs: true,
          hasBuyerContextSwitch: false
        }
      }
    }
  }
}

const ProtectedProducts = () => {
  return (
    <ProtectedContent hasAccess={appPermissions.ProductManager}>
      <ResourceList operation="Products.List" />
    </ProtectedContent>
  )
}

export default ProtectedProducts
