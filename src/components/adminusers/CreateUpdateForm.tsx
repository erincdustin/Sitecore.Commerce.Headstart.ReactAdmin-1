import * as Yup from "yup"
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Heading,
  Stack,
  Switch,
  Table,
  TableContainer,
  Tbody,
  Td,
  Tr
} from "@chakra-ui/react"
import {InputControl, SwitchControl} from "components/react-hook-form"
import Card from "../card/Card"
import {AdminUserGroups, AdminUsers, User} from "ordercloud-javascript-sdk"
import {useRouter} from "hooks/useRouter"
import {useCreateUpdateForm} from "hooks/useCreateUpdateForm"
import {useState} from "react"
import {textHelper} from "utils"
import {appPermissions} from "constants/app-permissions.config"
import {isEqual, sortBy, difference, pick} from "lodash"
import {IAdminUser} from "types/ordercloud/IAdminUser"
import AdminUserXpCard from "./AdminUserXpCard"
import {useForm} from "react-hook-form"
import {yupResolver} from "@hookform/resolvers/yup"
import SubmitButton from "../react-hook-form/submit-button"
import ResetButton from "../react-hook-form/reset-button"

interface PermissionTableProps {
  assignedPermissions?: string[]
  onPermissionChange: (permissions: string[]) => void
}
const PermissionsTable = (props: PermissionTableProps) => {
  const allPermissions = Object.keys(appPermissions)
  const [assignedPermissions, setAssignedPermissions] = useState(props.assignedPermissions || [])

  const handlePermissionChange = (permission: string) => {
    let updatedPermissions = []
    if (assignedPermissions.includes(permission)) {
      updatedPermissions = assignedPermissions.filter((p) => p !== permission)
    } else {
      updatedPermissions = [...assignedPermissions, permission]
    }
    setAssignedPermissions(updatedPermissions)
    props.onPermissionChange(updatedPermissions)
  }

  return (
    <TableContainer padding={5} backgroundColor="bodyBg" maxWidth={600}>
      <Table>
        <Tbody>
          <Tr>
            <Td colSpan={2}>
              <Heading size="md">Permissions</Heading>
            </Td>
          </Tr>
          {allPermissions.map((permission) => (
            <Tr key={permission}>
              <Td>{textHelper.camelCaseToTitleCase(permission)}</Td>
              <Td textAlign="right">
                <Switch
                  isChecked={assignedPermissions.includes(permission)}
                  onChange={() => handlePermissionChange(permission)}
                ></Switch>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  )
}

export {CreateUpdateForm}
interface CreateUpdateFormProps {
  user?: User
  assignedPermissions?: string[]
}
function CreateUpdateForm({user, assignedPermissions}: CreateUpdateFormProps) {
  let router = useRouter()
  const formShape = {
    Username: Yup.string().max(100).required("Username is required"),
    FirstName: Yup.string().required("First Name is required"),
    LastName: Yup.string().required("Last Name is required"),
    Email: Yup.string().email("Email is invalid").required("Email is required"),
    Phone: Yup.string(),
    Active: Yup.boolean()
  }

  const [permissions, setPermissions] = useState(assignedPermissions || [])

  const handlePermissionChange = (updatedPermissions: string[]) => {
    setPermissions(updatedPermissions)
  }

  const {successToast, validationSchema, defaultValues, onSubmit} = useCreateUpdateForm<User>(
    user,
    formShape,
    createUser,
    updateUser
  )

  const {
    handleSubmit,
    control,
    formState: {isSubmitting},
    reset
  } = useForm({resolver: yupResolver(validationSchema), defaultValues, mode: "onBlur"})

  async function createUser(fields: User) {
    const createdUser = await AdminUsers.Create<IAdminUser>(fields)
    const permissionsToAdd = permissions.map((permission) =>
      AdminUserGroups.SaveUserAssignment({UserGroupID: permission, UserID: createdUser.ID})
    )
    await Promise.all(permissionsToAdd)
    successToast({
      description: "User created successfully."
    })
    router.back()
  }

  async function updateUser(fields: User) {
    const formFields = Object.keys(formShape)
    const updatedUser = await AdminUsers.Patch<IAdminUser>(fields.ID, pick(fields, formFields))
    const permissionsChanged = !isEqual(sortBy(assignedPermissions), sortBy(permissions))
    let successMessage = "User updated successfully."
    if (permissionsChanged) {
      const permissionsToAdd = difference(permissions, assignedPermissions).map((permission) =>
        AdminUserGroups.SaveUserAssignment({UserGroupID: permission, UserID: updatedUser.ID})
      )
      const permissionsToRemove = difference(assignedPermissions, permissions).map((permission) =>
        AdminUserGroups.DeleteUserAssignment(permission, updatedUser.ID)
      )

      await Promise.all([...permissionsToAdd, ...permissionsToRemove])
      successMessage += " Please note, user will need to log out and back in for permission changes to take effect."
    }
    successToast({
      description: successMessage
    })
    router.back()
  }

  return (
    <>
      <Card variant="primaryCard">
        <Flex flexDirection="column" p="10">
          <Box as="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={5}>
              <InputControl name="Username" label="Username" control={control} isRequired />
              <InputControl name="FirstName" label="First name" control={control} isRequired />
              <InputControl name="LastName" label="Last name" control={control} isRequired />
              <InputControl name="Email" label="Email" control={control} isRequired />
              <InputControl name="Phone" label="Phone" control={control} />
              <SwitchControl name="Active" label="Active" control={control} marginBottom={5} />
              <PermissionsTable
                onPermissionChange={handlePermissionChange}
                assignedPermissions={assignedPermissions || []}
              />
              <ButtonGroup>
                <SubmitButton control={control} variant="solid" colorScheme="primary">
                  Save
                </SubmitButton>
                <ResetButton control={control} reset={reset} variant="outline">
                  Discard Changes
                </ResetButton>
                <Button onClick={() => router.back()} variant="outline" isLoading={isSubmitting}>
                  Cancel
                </Button>
              </ButtonGroup>
            </Stack>
          </Box>
        </Flex>
      </Card>
      <Card variant="primaryCard" h={"100%"} closedText="Extended Properties Cards">
        <AdminUserXpCard user={user} />
      </Card>
    </>
  )
}
