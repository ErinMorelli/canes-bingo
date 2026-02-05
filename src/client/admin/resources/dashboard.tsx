import {
  ChangeEvent,
  Children,
  cloneElement,
  isValidElement,
  PropsWithChildren,
  useEffect,
  useState
} from 'react';
import { Title, useDataProvider } from 'react-admin';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  TextField
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';

import { ConfigKey } from '@app/constants.ts';

const Resource = 'config';

const ConfigId: Record<ConfigKey, number> = {
  [ConfigKey.FreeSpace]: 1,
  [ConfigKey.HeaderText]: 2,
  [ConfigKey.Theme]: 3,
  [ConfigKey.CustomClass]: 4,
  [ConfigKey.Tooltips]: 5,
  [ConfigKey.FestiveLights]: 6,
};

type ConfigResult = {
  id: number;
  key: ConfigKey
  value: string;
};

type ConfigCardProps = {
  configKey: ConfigKey;
  title: string;
  subheader: string;
};

export function ConfigCard({
  configKey,
  title,
  subheader,
  children,
}: PropsWithChildren<ConfigCardProps>) {
  const dataProvider = useDataProvider();

  const [previousData, setPreviousData] = useState<ConfigResult>();
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!value && !previousData) {
      dataProvider
        .getOne<ConfigResult>(Resource, {id: ConfigId[configKey]})
        .then(({data}) => {
          setPreviousData(data);
          setValue(data.value);
        });
    }
  });

  function handleChange(e: ChangeEvent<{ value: string }>) {
    setValue(e.target.value);
  }

  function handleSave() {
    setLoading(true);
    dataProvider
      .update(Resource, {
        id: ConfigId[configKey],
        data: { value },
        previousData,
      })
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  }

  const element = Children.only(children);

  return isValidElement(element) ? (
    <Card variant="outlined" sx={{ flexGrow: 1 }}>
      <CardHeader title={title} subheader={subheader} />
      <CardContent>
        {cloneElement(element, { value , onChange: handleChange })}
      </CardContent>
      <CardActions>
        <LoadingButton onClick={handleSave} loading={loading}>
          Save
        </LoadingButton>
      </CardActions>
    </Card>
  ) : null;
}

export default function Dashboard() {
  return (
    <Box sx={{width: '100%'}}>
      <Title title="Quick Settings"/>
      <div>&nbsp;</div>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <ConfigCard
            configKey={ConfigKey.FreeSpace}
            title="Free Space"
            subheader="Value to display in the center square."
          >
            <TextField variant="standard" fullWidth/>
          </ConfigCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ConfigCard
            configKey={ConfigKey.HeaderText}
            title="Header Text"
            subheader="Value to display at the top of the page."
          >
            <TextField variant="standard" fullWidth/>
          </ConfigCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ConfigCard
            configKey={ConfigKey.CustomClass}
            title="Custom Class"
            subheader="Custom CSS class to apply to the app."
          >
            <TextField variant="standard" fullWidth/>
          </ConfigCard>
        </Grid>
      </Grid>
    </Box>
  );
}
