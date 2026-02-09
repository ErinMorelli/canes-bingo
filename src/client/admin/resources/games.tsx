import {
  BooleanField,
  BooleanInput,
  Create,
  Datagrid,
  DeleteButton,
  Edit,
  EditButton,
  List,
  ReferenceArrayField,
  ReferenceArrayInput,
  Show,
  SimpleForm,
  SimpleShowLayout,
  TextField,
  TextInput,
  TopToolbar,
  WrapperField,
  required,
} from 'react-admin';

import { PatternField } from '../elements';

export const GamesList = () => (
  <List perPage={100} pagination={false}>
    <Datagrid bulkActionButtons={false} rowClick="show">
      <TextField source="id" label="ID" sortable={false} />
      <TextField source="name" sortable={false} />
      <TextField source="description" sortable={false} />
      <PatternField source="patterns[0].squares" label="Pattern" size={6} />
      <BooleanField source="isDefault" label="Default" sortable={false} />
      <WrapperField>
        <EditButton />
        <DeleteButton mutationMode="pessimistic" />
      </WrapperField>
    </Datagrid>
  </List>
);

export const GameEdit = () => (
  <Edit
    transform={(data: { isDefault: boolean }) => ({
      ...data,
      isDefault: data.isDefault || false,
    })}
  >
    <SimpleForm>
      <TextInput disabled source="id" name="id" label="ID" />
      <TextInput source="name" name="name" validate={required()} fullWidth />
      <TextInput source="description" name="description" fullWidth />
      <ReferenceArrayInput name="patterns" source="patternIds" reference="patterns" />
      <BooleanInput source="isDefault" name="isDefault" label="Make default game" />
    </SimpleForm>
  </Edit>
);

export const GameCreate = () => (
  <Create
    redirect="list"
    transform={(data: { isDefault: boolean }) => ({
      ...data,
      isDefault: data.isDefault || false,
    })}
  >
    <SimpleForm>
      <TextInput source="name" name="name" validate={required()} fullWidth />
      <TextInput source="description" name="description" fullWidth />
      <ReferenceArrayInput name="patterns" source="patternIds" reference="patterns" />
      <BooleanInput source="isDefault" name="isDefault" label="Make default game" />
    </SimpleForm>
  </Create>
);

export const GameShow = () => (
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
      <TextField source="description" emptyText="-" />
      <ReferenceArrayField source="patternIds" reference="patterns">
        <Datagrid bulkActionButtons={false} rowClick="show">
          <TextField source="id" label="ID" sortable={false} />
          <TextField source="name" sortable={false} />
          <PatternField source="squares" size={6} />
        </Datagrid>
      </ReferenceArrayField>
      <BooleanField source="isDefault" label="Default" />
    </SimpleShowLayout>
  </Show>
);

export default {
  list: GamesList,
  edit: GameEdit,
  create: GameCreate,
  show: GameShow,
};
