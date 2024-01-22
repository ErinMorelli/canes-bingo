import {
  BooleanField,
  Create,
  Datagrid,
  DeleteButton,
  Edit,
  EditButton,
  List,
  ReferenceManyField,
  required,
  Show,
  SimpleForm,
  SimpleShowLayout,
  TextField,
  TextInput,
  TopToolbar,
  WrapperField,
} from 'react-admin';
import camelCase from 'lodash.camelcase';

const GroupsList = () => (
  <List perPage={100} pagination={false}>
    <Datagrid bulkActionButtons={false} rowClick="show">
      <TextField source="id" label="ID" sortable={false} />
      <TextField source="name" sortable={false} />
      <TextField source="label" sortable={false} />
      <TextField source="description" emptyText="-" sortable={false} />
      <WrapperField>
        <EditButton />
        <DeleteButton mutationMode="pessimistic" />
      </WrapperField>
    </Datagrid>
  </List>
);

const GroupEdit = () => (
  <Edit
    transform={(data: { id: number, name: string }) => ({
      ...data,
      groupId: data.id,
      name: camelCase(data.name),
    })}
  >
    <SimpleForm>
      <TextInput disabled source="id" name="ID" />
      <TextInput source="name" name="name" validate={required()} fullWidth />
      <TextInput source="label" name="label" validate={required()} fullWidth />
      <TextInput source="description" name="description" fullWidth />
    </SimpleForm>
  </Edit>
);

const GroupCreate = () => (
  <Create
    redirect="list"
    transform={(data: { name: string }) => ({
      ...data,
      name: camelCase(data.name),
    })}
  >
    <SimpleForm>
      <TextInput source="name" name="name" validate={required()} fullWidth />
      <TextInput source="label" name="label" validate={required()} fullWidth />
      <TextInput source="description" name="description" fullWidth />
    </SimpleForm>
  </Create>
);

const GroupShow = () => (
  <Show
    actions={
      <TopToolbar>
        <EditButton />
        <DeleteButton mutationMode="pessimistic" />
      </TopToolbar>
    }
  >
    <SimpleShowLayout spacing={3}>
      <TextField source="id" label="ID" />
      <TextField source="name" />
      <TextField source="label" />
      <TextField source="description" emptyText="-" />
      <ReferenceManyField label="Categories" reference="categories" target="group_id">
        <Datagrid bulkActionButtons={false} rowClick="show">
          <TextField source="id" label="ID" sortable={false} />
          <TextField source="name"  sortable={false}/>
          <TextField source="label" sortable={false} />
          <BooleanField source="isDefault" label="Default" sortable={false} />
        </Datagrid>
      </ReferenceManyField>
    </SimpleShowLayout>
  </Show>
);

export default {
  list: GroupsList,
  edit: GroupEdit,
  create: GroupCreate,
  show: GroupShow,
};
