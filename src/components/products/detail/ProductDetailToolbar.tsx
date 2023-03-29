import ExportToCsv from "@/components/demo/ExportToCsv"
import LanguageSelector from "@/components/demo/LanguageSelector"
import ViewProduct from "@/components/demo/ViewProduct"
import Link from "next/link"
import ConfirmDelete from "@/components/shared/ConfirmDelete"
import {Box, Button, Stack} from "@chakra-ui/react"
import {useRouter} from "hooks/useRouter"
import {Products} from "ordercloud-javascript-sdk"
import React, {useState} from "react"
import {Control, FieldValues, UseFormReset, useFormState} from "react-hook-form"
import {IProduct} from "types/ordercloud/IProduct"
import {ProductDetailTab} from "./ProductDetail"
import ViewManager from "./ViewManager"

interface ProductDetailToolbarProps {
  product: IProduct
  control: Control<FieldValues, any>
  resetForm: UseFormReset<any>
  viewVisibility: Record<ProductDetailTab, boolean>
  setViewVisibility: (update: Record<ProductDetailTab, boolean>) => void
}

export default function ProductDetailToolbar({
  product,
  control,
  resetForm,
  viewVisibility,
  setViewVisibility
}: ProductDetailToolbarProps) {
  const router = useRouter()
  const [deleteLoading, setDeleteLoading] = useState(false)
  const {isDirty} = useFormState({control})

  const onDelete = async () => {
    try {
      await Products.Delete(product?.ID)
      router.push("/products")
    } finally {
      setDeleteLoading(true)
    }
  }

  const discardChanges = () => {
    resetForm()
  }

  return (
    <Stack direction="row" mb={5}>
      <ViewManager viewVisibility={viewVisibility} setViewVisibility={setViewVisibility} />
      <Link href="/products/new">
        <Button variant="outline">Create</Button>
      </Link>
      <ViewProduct />
      <ExportToCsv />
      <LanguageSelector />
      <ConfirmDelete deleteText="Delete Product" loading={deleteLoading} onDelete={onDelete} />
      <Box as="span" flexGrow="1"></Box>

      <Button type="button" onClick={discardChanges} isDisabled={!isDirty}>
        Discard Changes
      </Button>
      <Button type="submit" variant="solid" colorScheme="primary">
        Save
      </Button>
    </Stack>
  )
}
