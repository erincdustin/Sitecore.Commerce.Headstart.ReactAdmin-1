
import React from "react"
import ResourceList from "@/components/anyresource/ResourceList"

/* This declare the page title and enable the breadcrumbs in the content header section. */
export async function getServerSideProps() {
  return {
    props: {
      header: {
        title: "Catalogs List",
        metas: {
          hasBreadcrumbs: true,
          hasBuyerContextSwitch: true
        }
      },
      revalidate: 5 * 60
    }
  }
}

const CatalogsList = () => {
  return (
    <>
      <ResourceList operation="Catalogs.List" />
    </>
  )
}

export default CatalogsList
