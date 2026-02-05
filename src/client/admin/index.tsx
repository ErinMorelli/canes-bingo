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

import CategoriesIcon from '@mui/icons-material/DiscountRounded';
import ConfigIcon from '@mui/icons-material/TuneRounded';
import GamesIcon from '@mui/icons-material/ExtensionRounded';
import GroupsIcon from '@mui/icons-material/FolderCopyRounded';
import LinkIcon from '@mui/icons-material/Launch';
import PatternsIcon from '@mui/icons-material/PatternRounded';
import SquaresIcon from '@mui/icons-material/ViewCompactRounded';
import UsersIcon from '@mui/icons-material/PeopleRounded';

import {
  Dashboard,
  categories,
  config,
  games,
  groups,
  patterns,
  squares,
  users,
} from './resources'

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
    <Resource name="patterns" icon={PatternsIcon} {...patterns} />
    <Resource name="games" icon={GamesIcon} {...games} />
    <Resource name="users" icon={UsersIcon} {...users} />
    <Resource name="config" icon={ConfigIcon} {...config} />
  </Admin>
);

export default AdminApp;
