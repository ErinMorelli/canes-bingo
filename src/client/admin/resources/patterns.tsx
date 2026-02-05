import {
  Create,
  Datagrid,
  DeleteButton,
  Edit,
  EditButton,
  List,
  required,
  Show,
  SimpleForm,
  SimpleShowLayout,
  TextField,
  TextInput,
  TopToolbar,
  WrapperField,
} from 'react-admin';

import { PatternSquare } from '@app/types.ts';

import { PatternField, PatternInput } from '../elements';

const transformPattern = (data: { name: string; squares: PatternSquare[] }) => ({
  name: data.name,
  squares: JSON.stringify(data.squares),
});

export const PatternsList = () => (
  <List perPage={100} pagination={false}>
    <Datagrid bulkActionButtons={false} rowClick="show">
      <TextField source="id" label="ID" sortable={false} />
      <TextField source="name" sortable={false} />
      <PatternField source="squares" size={6} />
      <WrapperField>
        <EditButton />
        <DeleteButton mutationMode="pessimistic" />
      </WrapperField>
    </Datagrid>
  </List>
);

export const PatternsEdit = () => (
  <Edit transform={transformPattern}>
    <SimpleForm>
      <TextInput disabled source="id" name="id" label="ID" />
      <TextInput source="name" name="name" validate={required()} fullWidth />
      <PatternInput source="squares" name="squares" />
    </SimpleForm>
  </Edit>
);

export const PatternCreate = () => (
  <Create redirect="list" transform={transformPattern}>
    <SimpleForm>
      <TextInput source="name" name="name" validate={required()} fullWidth />
      <PatternInput source="squares" name="squares" />
    </SimpleForm>
  </Create>
);

export const PatternShow = () => (
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
      <PatternField source="squares" />
    </SimpleShowLayout>
  </Show>
);

export default {
  list: PatternsList,
  edit: PatternsEdit,
  create: PatternCreate,
  show: PatternShow,
};
