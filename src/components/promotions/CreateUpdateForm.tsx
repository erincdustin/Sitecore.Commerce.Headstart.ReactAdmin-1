import * as Yup from "yup"
import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  Heading,
  InputGroup,
  InputLeftElement,
  ListItem,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Radio,
  Select,
  SimpleGrid,
  UnorderedList
} from "@chakra-ui/react"
import {DeleteIcon} from "@chakra-ui/icons"
import {InputControl, RadioGroupControl, SwitchControl, TextareaControl} from "components/react-hook-form"
import {Tab, TabList, TabPanel, TabPanels, Tabs} from "@chakra-ui/react"
import {useEffect, useState} from "react"
import Card from "../card/Card"
import DatePicker from "../datepicker/DatePicker"
import {ExpressionBuilder} from "./ExpressionBuilder"
import {Promotion, Promotions} from "ordercloud-javascript-sdk"
import {useRouter} from "hooks/useRouter"
import {useCreateUpdateForm} from "hooks/useCreateUpdateForm"
import {IPromotion} from "types/ordercloud/IPromotion"
import PromotionXpCard from "./PromotionXpCard"
import {yupResolver} from "@hookform/resolvers/yup"
import {useForm} from "react-hook-form"
import {emptyStringToNull} from "utils"

export {CreateUpdateForm}

interface CreateUpdateFormProps {
  promotion?: Promotion
}

const EligibleExpressionField = (props) => {
  // TODO: fix this
  // const {values, touched, setFieldValue} = useFormikContext()
  // const [field, meta] = useField(props)

  // useEffect(() => {
  //   const eligibleExpression = async () => {
  //     const elExpression = await buildEligibleExpression(values as any)
  //     setFieldValue(props.name, elExpression)
  //   }
  //   eligibleExpression()
  // }, [props.name, setFieldValue, touched, values])

  // // Simplistic Example to close the loop - then we will use the dnd Expression UI Builder and match to this
  // async function buildEligibleExpression(fields) {
  //   let eligibleExpression = "" //Default value when no condition has been specified.
  //   // Minimum Requirements has been selected
  //   switch (fields.xp_MinimumReq) {
  //     case "min-amount": {
  //       eligibleExpression = `order.Subtotal>= ${fields.xp_MinReqValue}`
  //       break
  //     }
  //     case "min-qty": {
  //       eligibleExpression = `items.quantity()>= ${fields.xp_MinReqValue}`
  //       break
  //     }
  //     default: {
  //       eligibleExpression = "true"
  //       break
  //     }
  //   }

  //   return eligibleExpression
  // }

  // return (
  //   <>
  //     <TextareaControl {...props} {...field} />
  //     {!!meta.touched && !!meta.error && <div>{meta.error}</div>}
  //   </>
  // )
  return <div></div>
}

function CreateUpdateForm({promotion}: CreateUpdateFormProps) {
  const formShape = {
    Name: Yup.string().max(100),
    Code: Yup.string().max(100).required("Code is required"),
    StartDate: Yup.date(),
    ExpirationDate: Yup.date(),
    EligibleExpression: Yup.string().max(400).required("Eligible Expression is required"),
    ValueExpression: Yup.string().max(400).required("Value Expression is required"),
    Description: Yup.string().max(100),
    xp_MinReqValue: Yup.number().transform(emptyStringToNull).nullable().typeError("You must specify a number")
  }
  const {isCreating, successToast, errorToast, validationSchema, defaultValues, onSubmit} =
    useCreateUpdateForm<Promotion>(promotion, formShape, createPromotion, updatePromotion)

  const {
    watch,
    handleSubmit,
    control,
    formState: {isSubmitting, isValid, isDirty},
    reset
  } = useForm({resolver: yupResolver(validationSchema), defaultValues})

  // TODO: this is not very performant, do we really need the values displayed?
  const values = watch() as any

  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  const router = useRouter()

  async function createPromotion(fields: Promotion) {
    await Promotions.Create<IPromotion>(fields)
    successToast({
      description: "Promotion created successfully."
    })
    router.push(`/promotions`)
  }

  async function updatePromotion(fields: Promotion) {
    await Promotions.Save<IPromotion>(fields.ID, fields)
    successToast({
      description: "Promotion updated successfully."
    })
    router.push(`/promotions`)
  }

  async function deletePromotion(promotionid) {
    try {
      await Promotions.Delete(promotionid)
      successToast({
        description: "Promotion deleted successfully."
      })
    } catch (e) {
      errorToast({
        description: "Promotion delete failed"
      })
    }
  }

  return (
    <>
      <Card variant="primaryCard">
        <Box as="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid
            templateAreas={`"main nav"
                  "main nav"
                  "footer footer"`}
            gridTemplateRows={"auto"}
            gridTemplateColumns={"70% 1fr"}
            h="auto"
            gap="1"
            color="blackAlpha.700"
            fontWeight="bold"
          >
            <GridItem pl="2" area={"nav"}>
              <Heading as="h2" noOfLines={1}>
                Overview
              </Heading>
              <UnorderedList>
                <ListItem>Name: {values.Name}</ListItem>
                <ListItem>Description: {values.Description}</ListItem>
                <Divider mt="15" mb="15" />
                <ListItem>Code: {values.Code}</ListItem>
                <Divider mt="15" mb="15" />
                <ListItem>Start Date: {values.StartDate}</ListItem>
                <ListItem>End Date: {values.ExpirationDate}</ListItem>
                <Divider mt="15" mb="15" />
                <ListItem>Can Combine: {values.CanCombine ? "Yes" : "No"}</ListItem>
                <ListItem>Line Item Level: {values.LineItemLevel ? "Yes" : "No"}</ListItem>
                <ListItem>Allow All Buyers: {values.AllowAllBuyers ? "Yes" : "No"}</ListItem>
                <ListItem>Redemption Limit: {values.RedemptionLimit}</ListItem>
                <ListItem>Redemption Limit Per User: {values.RedemptionLimitPerUser}</ListItem>
                <Divider mt="15" mb="15" />
                <ListItem>Fine Print: {values.FinePrint}</ListItem>
                <Divider mt="15" mb="15" />
                <ListItem>Eligible Expression: {values.EligibleExpression}</ListItem>
                <ListItem>Value Expression: {values.ValueExpression}</ListItem>
                <Divider mt="15" mb="15" />
              </UnorderedList>
            </GridItem>
            <GridItem pl="2" area={"main"}>
              <Tabs>
                <TabList>
                  {/* This tab contains all default Promotion API options (No extended propreties) */}
                  <Tab>Default Options</Tab>
                  {/* This tab contains some examples of how we can leverage XP (extended Propreties) */}
                  <Tab>Advanced Rules</Tab>
                  {/* This tab contains another examples to show the flexibility offered by EligibleExpressions and ValueExpression Fileds. */}
                  <Tab>Expression Builder</Tab>
                  {/* This tab contains a way to add any other extended properties. */}
                  <Tab>Extended Properties (xp)</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <SimpleGrid columns={2} spacing={10}>
                      <Box>
                        <InputControl name="Name" label="Promotion Name" helperText="" control={control} />
                        <Divider mt="15" mb="15" />
                        <TextareaControl name="Description" label="Description" control={control} />
                        <Divider mt="15" mb="15" />
                        <FormLabel>Start Date</FormLabel>
                        <DatePicker selectedDate={startDate} onChange={setStartDate} />
                        <input type="hidden" name="StartDate" value={startDate.toISOString()} />
                        <Divider mt="15" mb="15" />
                        <label htmlFor="RedemptionLimit">Redemption Limit</label>
                        <NumberInput defaultValue={100} max={1000} clampValueOnBlur={false}>
                          <NumberInputField name="RedemptionLimit" />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                        <Divider mt="15" mb="15" />
                        <HStack spacing={6}>
                          <SwitchControl name="Active" label="Active" control={control} />
                          <SwitchControl name="AutoApply" label="Auto Apply" control={control} />
                        </HStack>
                        <Divider mt="15" mb="15" />
                        <label htmlFor="Priority">Priority</label>
                        <NumberInput defaultValue={1} max={10} clampValueOnBlur={false}>
                          <NumberInputField name="Priority" />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </Box>
                      <Box>
                        <InputControl name="Code" label="Coupon Code" helperText="" control={control} isRequired />
                        <Divider mt="15" mb="15" />
                        <TextareaControl name="FinePrint" label="Fine Print" control={control} />
                        <Divider mt="15" mb="15" />
                        <FormLabel>End Date</FormLabel>
                        <DatePicker selectedDate={endDate} onChange={setEndDate} />
                        <input type="hidden" name="ExpirationDate" value={endDate.toISOString()} />
                        <Divider mt="15" mb="15" />
                        <label htmlFor="RedemptionLimitPerUser">Redemption Limit per user</label>
                        <NumberInput defaultValue={1} max={10} clampValueOnBlur={false}>
                          <NumberInputField name="RedemptionLimitPerUser" />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                        <Divider mt="15" mb="15" />
                        <HStack spacing={6}>
                          <SwitchControl name="LineItemLevel" label="Line Item Level" control={control} />
                          <SwitchControl name="CanCombine" label="Can be combined" control={control} />
                          <SwitchControl name="AllowAllBuyers" label="Allow all buyers" control={control} />
                        </HStack>
                      </Box>
                    </SimpleGrid>
                  </TabPanel>
                  <TabPanel>
                    <SimpleGrid columns={2} spacing={10}>
                      <Box>
                        <RadioGroupControl name="xp_MinimumReq" label="Minimum requirment" control={control}>
                          <Radio value="none">None</Radio>
                          <Radio value="min-amount">Minimum purchase amount</Radio>
                          <Radio value="min-qty">Minimum quantity of items</Radio>
                        </RadioGroupControl>
                        <InputControl name="xp_MinReqValue" placeholder="Enter amount" control={control} />
                        <Divider mt="15" mb="15" />
                        <label htmlFor="xp_ScopeTo">Eligibility / Scope to</label>
                        <Select name="xp_ScopeTo" placeholder="Select option">
                          <option value="buyers">Buyers</option>
                          <option value="buyersgroup">Buyers Group</option>
                          <option value="suppliers">Suppliers</option>
                          <option value="products">Products</option>
                          <option value="categories">Categories</option>
                        </Select>
                      </Box>
                      <Box>
                        <RadioGroupControl name="xp_Type" label="Promotion Type" control={control}>
                          <Radio value="Percentage">Percentage</Radio>
                          <Radio value="Fixed">Fixed Amount</Radio>
                          <Radio value="Free-shipping">Free Shipping</Radio>
                          <Radio value="BOGO">BOGO</Radio>
                        </RadioGroupControl>

                        {values.xp_Type !== "Free-shipping" && values.xp_Type !== "BOGO" && (
                          <InputGroup>
                            <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                              {values.xp_Type === "Percentage" ? "%" : "$"}
                            </InputLeftElement>
                            <InputControl name="xp_Value" placeholder="Enter amount" control={control} />
                          </InputGroup>
                        )}
                        <Divider mt="15" mb="15" />
                      </Box>
                    </SimpleGrid>
                  </TabPanel>
                  <TabPanel>
                    <SimpleGrid columns={2} spacing={10}>
                      <Box>
                        <EligibleExpressionField name="EligibleExpression" label="Eligible Expression" isRequired />
                      </Box>
                      <Box>
                        <TextareaControl name="ValueExpression" label="Value Expression" control={control} isRequired />
                      </Box>
                    </SimpleGrid>
                    <ExpressionBuilder />
                  </TabPanel>
                  <TabPanel>
                    <SimpleGrid columns={2} spacing={10}>
                      <Box>
                        <PromotionXpCard promotion={promotion} />
                      </Box>
                    </SimpleGrid>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </GridItem>
            <GridItem pl="2" area={"footer"}>
              <Divider mt="15" mb="15" />
              <ButtonGroup>
                <Button
                  variant="solid"
                  colorScheme="primary"
                  type="submit"
                  isLoading={isSubmitting}
                  isDisabled={!isValid || !isDirty}
                >
                  Save
                </Button>
                <Button onClick={reset} type="reset" variant="outline" isLoading={isSubmitting}>
                  Reset
                </Button>
                <Button onClick={() => router.push(`/promotions`)} variant="outline" isLoading={isSubmitting}>
                  Cancel
                </Button>
                {!isCreating && (
                  <Button variant="outline" onClick={() => deletePromotion(values.ID)} leftIcon={<DeleteIcon />}>
                    Delete
                  </Button>
                )}
              </ButtonGroup>
            </GridItem>
          </Grid>
        </Box>
      </Card>
    </>
  )
}
