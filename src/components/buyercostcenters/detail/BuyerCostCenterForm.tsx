import {Button, ButtonGroup, Card, CardBody, CardHeader, Container} from "@chakra-ui/react"
import {InputControl, ResetButton, SwitchControl} from "components/react-hook-form"
import {CostCenters, PartialDeep, CostCenter} from "ordercloud-javascript-sdk"
import {useRouter} from "hooks/useRouter"
import {yupResolver} from "@hookform/resolvers/yup"
import {useForm} from "react-hook-form"
import {TbChevronLeft} from "react-icons/tb"
import {boolean, object, string} from "yup"
import {useSuccessToast} from "hooks/useToast"
import {getObjectDiff} from "utils"
import {isEmpty} from "lodash"
import {useEffect} from "react"
import SubmitButton from "@/components/react-hook-form/submit-button"

interface CostCenterFormProps {
  buyerId: string
  costCenter?: CostCenter
}
export function BuyerCostCenterForm({buyerId, costCenter}: CostCenterFormProps) {
  const isCreating = !costCenter?.ID
  const router = useRouter()
  const successToast = useSuccessToast()

  const defaultValues: PartialDeep<CostCenter> = {}

  const validationSchema = object().shape({
    Active: boolean(),
    Name: string().required("Name is required"),
    DefaultCatalogID: string()
  })

  const {handleSubmit, control, reset} = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: costCenter?.ID ? costCenter : defaultValues,
    mode: "onBlur"
  })

  useEffect(() => {
    if (costCenter) {
      reset(costCenter)
    }
  }, [costCenter, reset])

  async function createCostCenter(fields: CostCenter) {
    const createdCostCenter = await CostCenters?.Create(buyerId, fields)
    successToast({
      description: "Cost Center created successfully."
    })
    router.replace(`/buyers/${buyerId}/costcenters/${createdCostCenter.ID}`)
  }

  async function updateCostCenter(fields: CostCenter) {
    const costcenterDiff = getObjectDiff(costCenter, fields)
    if (!isEmpty(costcenterDiff)) {
      await CostCenters.Patch(buyerId, costCenter.ID, costcenterDiff)
    }

    successToast({
      description: "Cost Center updated successfully."
    })
  }

  async function onSubmit(fields: CostCenter) {
    if (isCreating) {
      await createCostCenter(fields)
    } else {
      await updateCostCenter(fields)
    }
  }

  return (
    <Container maxW="100%" bgColor="st.mainBackgroundColor" flexGrow={1} p={[4, 6, 8]}>
      <Card as="form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <CardHeader display="flex" flexWrap="wrap" justifyContent="space-between">
          <Button
            onClick={() => router.push(`/buyers/${buyerId}/costcenters`)}
            variant="ghost"
            leftIcon={<TbChevronLeft />}
          >
            Back
          </Button>
          <ButtonGroup>
            <ResetButton control={control} reset={reset} variant="outline">
              Discard Changes
            </ResetButton>
            <SubmitButton control={control} variant="solid" colorScheme="primary">
              Save
            </SubmitButton>
          </ButtonGroup>
        </CardHeader>
        <CardBody display="flex" flexDirection={"column"} gap={4} maxW={{xl: "container.md"}}>
          <InputControl name="ID" label="ID" control={control} validationSchema={validationSchema} />
          <InputControl name="Name" label="Name" control={control} validationSchema={validationSchema} />
          <InputControl name="Description" label="Description" control={control} validationSchema={validationSchema} />
        </CardBody>
      </Card>
    </Container>
  )
}
