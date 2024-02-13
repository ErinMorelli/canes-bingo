import {
  Admin,
  AppBar,
  AppBarProps,
  defaultDarkTheme,
  defaultLightTheme,
  Layout,
  LayoutProps,
  LoadingIndicator,
  Resource,
  ToggleThemeButton
} from 'react-admin';
import { IconButton, Tooltip } from '@mui/material';

import LinkIcon from '@mui/icons-material/Launch';
import SquaresIcon from '@mui/icons-material/ViewCompactRounded';
import GroupsIcon from '@mui/icons-material/FolderCopyRounded';
import CategoriesIcon from '@mui/icons-material/DiscountRounded';
import UsersIcon from '@mui/icons-material/PeopleRounded';
import ConfigIcon from '@mui/icons-material/TuneRounded';

import Dashboard from './dashboard.tsx';
import groups from './groups.tsx';
import squares from './squares.tsx';
import categories from './categories.tsx';
import users from './users.tsx';
import config from './config.tsx';

import authProvider from './auth.ts';
import dataProvider from './data.ts';

const TopBar = (props: AppBarProps) => (
  <AppBar
    {...props}
    toolbar={(
      <>
        <ToggleThemeButton />
        <LoadingIndicator />
        <Tooltip title="Go to site" enterDelay={300}>
          <IconButton color="inherit" href="/" target="_blank">
            <LinkIcon />
          </IconButton>
        </Tooltip>
      </>
    )}
  />
);

const AppLayout = (props: LayoutProps) => (
  <Layout {...props} appBar={TopBar} appBarAlwaysOn />
);

const AdminApp = () => (
  <Admin
    title="Admin | Carolina Hurricanes Bingo"
    basename="/admin"
    theme={defaultLightTheme}
    darkTheme={defaultDarkTheme}
    defaultTheme="dark"
    dataProvider={dataProvider}
    authProvider={authProvider}
    layout={AppLayout}
    dashboard={Dashboard}
    requireAuth
  >
    <Resource name="squares" icon={SquaresIcon} {...squares} />
    <Resource name="categories" icon={CategoriesIcon} {...categories} />
    <Resource name="groups" icon={GroupsIcon} {...groups} />
    <Resource name="users" icon={UsersIcon} {...users} />
    <Resource name="config" icon={ConfigIcon} {...config} />
  </Admin>
);

export default AdminApp;
