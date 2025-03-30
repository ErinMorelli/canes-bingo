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
  MenuItem,
  Select,
  TextField
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';

import { themes } from '@app/themes.ts';
import { ConfigKey } from '@app/constants.ts';

const Resource = 'config';

const Id: Record<ConfigKey, number> = {
  [ConfigKey.FreeSpace]: 1,
  [ConfigKey.HeaderText]: 2,
  [ConfigKey.Theme]: 3,
  [ConfigKey.CustomClass]: 4,
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
    dataProvider
      .getOne<ConfigResult>(Resource, { id: Id[configKey] })
      .then(({ data }) => {
        setPreviousData(data);
        setValue(data.value);
      });
  });

  function handleChange(e: ChangeEvent<{ value: string }>) {
    setValue(e.target.value);
  }

  function handleSave() {
    setLoading(true);
    dataProvider
      .update(Resource, {
        id: Id[configKey],
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
        <Grid item xs={12} md={6}>
          <ConfigCard
            configKey={ConfigKey.FreeSpace}
            title="Free Space"
            subheader="Value to display in the center square."
          >
            <TextField variant="standard" fullWidth/>
          </ConfigCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <ConfigCard
            configKey={ConfigKey.HeaderText}
            title="Header Text"
            subheader="Value to display at the top of the page."
          >
            <TextField variant="standard" fullWidth/>
          </ConfigCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <ConfigCard
            configKey={ConfigKey.Theme}
            title="Theme"
            subheader="The color theme used to style the page."
          >
            <Select variant="standard" fullWidth>
              {Object.keys(themes).map((themeName) => (
                <MenuItem key={themeName} value={themeName}>
                  {themeName}
                </MenuItem>
              ))}
            </Select>
          </ConfigCard>
        </Grid>
        <Grid item xs={12} md={6}>
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
