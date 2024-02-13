import {
  Create,
  Datagrid,
  DeleteButton,
  Edit,
  EditButton,
  List,
  required,
  SimpleForm,
  TextField,
  TextInput,
  WrapperField,
} from 'react-admin';
import camelCase from 'lodash.camelcase';

export const ConfigList = () => (
  <List perPage={100} pagination={false}>
    <Datagrid bulkActionButtons={false} rowClick="edit">
      <TextField source="key" />
      <TextField source="value" />
      <WrapperField>
        <EditButton />
        <DeleteButton mutationMode="pessimistic" />
      </WrapperField>
    </Datagrid>
  </List>
);

export const ConfigEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput name="key" source="key" disabled fullWidth />
      <TextInput name="value" source="value" validate={required()} fullWidth />
    </SimpleForm>
  </Edit>
);

export const ConfigCreate = () => (
  <Create
    redirect="list"
    transform={(data: { key: string }) => ({
      ...data,
      key: camelCase(data.key),
    })}
  >
    <SimpleForm>
      <TextInput name="key" source="key" validate={required()} fullWidth />
      <TextInput name="value" source="value" validate={required()} fullWidth />
    </SimpleForm>
  </Create>
);

export default {
  list: ConfigList,
  create: ConfigCreate,
  edit: ConfigEdit,
  options: {
    label: 'Config'
  },
}
