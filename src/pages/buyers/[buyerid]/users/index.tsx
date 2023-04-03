
import React from "react"
import ProtectedContent from "@/components/auth/ProtectedContent"
import {appPermissions} from "constants/app-permissions.config"
import ResourceList from "@/components/anyresource/ResourceList"

/* This declare the page title and enable the breadcrumbs in the content header section. */
export async function getServerSideProps() {
  return {
    props: {
      header: {
        title: "Users List",
        metas: {
          hasBreadcrumbs: true,
          hasBuyerContextSwitch: true
        }
      },
      revalidate: 5 * 60
    }
  }
}

const UsersList = () => {
  return (
    <ProtectedContent hasAccess={appPermissions.ProductManager}>
      <ResourceList operation="Users.List" resource="Users" />
    </ProtectedContent>
  )
}

export default UsersList
