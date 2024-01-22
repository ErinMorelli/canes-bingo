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
import SquaresIcon from '@mui/icons-material/GridViewRounded';
import GroupsIcon from '@mui/icons-material/FolderCopyRounded';
import CategoriesIcon from '@mui/icons-material/DiscountRounded';
import ConfigIcon from '@mui/icons-material/ViewListRounded';
import UsersIcon from '@mui/icons-material/PeopleRounded';

import config from './config.tsx';
import groups from './groups.tsx';
import squares from './squares.tsx';
import categories from './categories.tsx';
import users from './users.tsx';

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
          <IconButton
            color="inherit"
            aria-label="Go to site"
            href="/"
            target="_blank"
          >
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
    basename="/_admin"
    theme={defaultLightTheme}
    darkTheme={defaultDarkTheme}
    defaultTheme="dark"
    dataProvider={dataProvider}
    authProvider={authProvider}
    layout={AppLayout}
    requireAuth
  >
    <Resource name="squares" icon={SquaresIcon} {...squares} />
    <Resource name="categories" icon={CategoriesIcon} {...categories} />
    <Resource name="groups" icon={GroupsIcon} {...groups} />
    <Resource name="config" icon={ConfigIcon} {...config} />
    <Resource name="users" icon={UsersIcon} {...users} />
  </Admin>
);

export default AdminApp;
