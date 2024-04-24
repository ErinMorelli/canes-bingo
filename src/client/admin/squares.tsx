import {
  BooleanField,
  BooleanInput,
  ChipField,
  Create,
  CreateButton,
  Datagrid,
  DeleteButton,
  Edit,
  EditButton,
  ExportButton,
  List,
  ReferenceArrayField,
  ReferenceArrayInput,
  required,
  Show,
  SimpleForm,
  SimpleShowLayout,
  SingleFieldList,
  TextField,
  TextInput,
  TopToolbar,
  WrapperField,
} from 'react-admin';
import { Button } from '@mui/material';
import IdeasIcon from '@mui/icons-material/TipsAndUpdatesRounded';

export const SquaresList = () => (
  <List
    perPage={100}
    pagination={false}
    actions={
      <TopToolbar>
        <CreateButton/>
        <ExportButton/>
          <Button
            size="small"
            variant="text"
            href="https://emorel.li/bingo-suggestions"
            target="_blank"
            startIcon={<IdeasIcon />}
          >Suggestions</Button>
      </TopToolbar>
    }
  >
    <Datagrid bulkActionButtons={false} rowClick="show">
      <TextField source="id" label="ID" sortable={false} />
      <TextField source="value" sortable={false} />
      <TextField source="description" sortable={false} />
      <ReferenceArrayField source="categories" reference="categories" sortable={false}>
        <SingleFieldList linkType="show">
          <ChipField source="label" />
        </SingleFieldList>
      </ReferenceArrayField>
      <BooleanField source="active" sortable={false} />
      <WrapperField>
        <EditButton />
        <DeleteButton mutationMode="pessimistic" />
      </WrapperField>
    </Datagrid>
  </List>
);

export const SquareEdit = () => (
  <Edit
    transform={(data: {
      id: number,
      value: string,
      description: string,
      active: boolean,
      categories: Array<number>
    }) => ({
      squareId: data.id,
      content: data.value,
      description: data.description,
      active: data.active,
      categories: data.categories
    })}
  >
    <SimpleForm>
      <TextInput disabled source="id" name="ID" />
      <TextInput source="value" name="value" validate={required()} fullWidth />
      <TextInput source="description" name="description" fullWidth />
      <ReferenceArrayInput name="categories" source="categories" reference="categories" />
      <BooleanInput source="active" name="active" />
    </SimpleForm>
  </Edit>
);

export const SquareCreate = () => (
  <Create
    redirect="list"
    transform={(data: {
      value: string,
      description: string,
      categories: Array<number>,
      active: boolean,
    }) => ({
      content: data.value,
      description: data.description,
      categories: data.categories,
      active: data.active,
    })}
  >
    <SimpleForm>
      <TextInput source="value" name="value" validate={required()} fullWidth />
      <TextInput source="description" name="description" fullWidth />
      <ReferenceArrayInput name="categories" source="categories" reference="categories" />
      <BooleanInput source="active" name="active" defaultValue={true} />
    </SimpleForm>
  </Create>
);

export const SquareShow = () => (
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
      <TextField source="value" />
      <TextField source="description" />
      <ReferenceArrayField source="categories" reference="categories">
        <SingleFieldList linkType="show">
          <ChipField source="label" />
        </SingleFieldList>
      </ReferenceArrayField>
       <BooleanField source="active" />
    </SimpleShowLayout>
  </Show>
);

export default {
  list: SquaresList,
  edit: SquareEdit,
  create: SquareCreate,
  show: SquareShow,
};
