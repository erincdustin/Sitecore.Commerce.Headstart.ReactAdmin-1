import {
  Box,
  Grid,
  GridItem,
  HStack,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure
} from "@chakra-ui/react"
import {Categories, Category} from "ordercloud-javascript-sdk"
import {useCallback, useEffect, useState} from "react"

import Card from "components/card/Card"
import {CreateUpdateForm} from "components/categories"
import ExportToCsv from "components/demo/ExportToCsv"
import {ICategory} from "types/ordercloud/ICategoryXp"
import React from "react"
import TreeView from "components/dndtreeview/TreeView"
import {ocNodeModel} from "@minoru/react-dnd-treeview"
import {useRouter} from "hooks/useRouter"
import ResourceList from "@/components/anyresource/ResourceList"

/* This declare the page title and enable the breadcrumbs in the content header section. */
export async function getServerSideProps() {
  return {
    props: {
      header: {
        title: "Categories List",
        metas: {
          hasBreadcrumbs: true,
          hasBuyerContextSwitch: false
        }
      },
      revalidate: 5 * 60
    }
  }
}

const CategoriesList = (props) => {
  return (
    <>
      <ResourceList operation="Categories.List" />
    </>
  )
}

export default CategoriesList
