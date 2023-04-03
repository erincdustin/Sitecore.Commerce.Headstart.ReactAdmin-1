import React from "react"
import {appPermissions} from "constants/app-permissions.config"
import ResourceList from "@/components/anyresource/ResourceList"
import ProtectedContent from "@/components/auth/ProtectedContent"

/* This declare the page title and enable the breadcrumbs in the content header section. */
export async function getServerSideProps() {
  return {
    props: {
      header: {
        title: "User groups List",
        metas: {
          hasBreadcrumbs: true,
          hasBuyerContextSwitch: true
        }
      },
      revalidate: 5 * 60
    }
  }
}

const UsersGroupsList = () => {
  return (
    <ProtectedContent hasAccess={appPermissions.ProductManager}>
      <ResourceList operation="UserGroups.List" resource="User Groups" />
    </ProtectedContent>
  )
}

export default UsersGroupsList
