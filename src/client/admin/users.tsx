import {
  Create,
  Datagrid,
  DeleteButton,
  Edit,
  EditButton,
  List,
  PasswordInput,
  required,
  SimpleForm,
  TextField,
  TextInput,
  WrapperField
} from 'react-admin';

export const UsersList = () => (
  <List perPage={100} pagination={false}>
    <Datagrid bulkActionButtons={false} rowClick="show">
      <TextField source="id" label="ID" sortable={false} />
      <TextField source="username"  sortable={false}/>
      <WrapperField>
        <EditButton />
        <DeleteButton mutationMode="pessimistic" />
      </WrapperField>
    </Datagrid>
  </List>
);

export const UserEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput disabled source="id" name="ID" />
      <TextInput disabled source="username" name="username" />
      <PasswordInput source="password" name="password" validate={required()} />
      <PasswordInput
        source="confirm_password"
        name="confirm_password"
        validate={(value, allValues) => {
          if (value !== allValues.password) {
            return 'Passwords do not match';
          }
        }}
      />
    </SimpleForm>
  </Edit>
)

export const UserCreate = () => (
  <Create redirect="list">
    <SimpleForm>
      <TextInput source="username" name="username" validate={required()} />
      <PasswordInput source="password" name="password" validate={required()} />
      <PasswordInput
        source="confirm_password"
        name="confirm_password"
        validate={(value, allValues) => {
          if (value !== allValues.password) {
            return 'Passwords do not match';
          }
        }}
      />
    </SimpleForm>
  </Create>
);


export default {
  list: UsersList,
  edit: UserEdit,
  create: UserCreate,
};
