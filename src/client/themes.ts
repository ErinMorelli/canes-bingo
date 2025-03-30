import { ThemeConfig } from 'antd';
import { Theme } from './types.ts';

type GetThemeProps = {
  primary: string;
  secondary: string;
  dark?: string;
  light?: string;
};

const getTheme = ({
  primary,
  secondary,
  dark = '#000000',
  light = '#FFFFFF'
}: GetThemeProps): ThemeConfig => ({
  cssVar: true,
  token: {
    colorPrimary: primary,
    colorLink: secondary,
    colorText: secondary,
  },
  components: {
    Button: {
      colorPrimary: dark,
      defaultColor: dark,
    },
    Skeleton: {
      colorFill: '#333',
      colorFillContent: '#222'
    },
    Layout: {
      headerBg: primary,
      headerColor: light,
      footerBg: dark,
      colorText: dark,
    },
    Form: {
      labelColor: dark,
      colorText: dark,
    },
    Typography: {
      colorText: dark,
    },
    Select: {
      colorText: dark,
    },
    Radio: {
      colorText: dark,
    },
    Table: {
      headerColor: '#333',
      colorText: dark,
    },
    Popover: {
      colorBgElevated: light,
      colorTextHeading: primary,
      colorText: dark,
    }
  }
});

const defaultTheme = getTheme({
  primary: '#CE1126',
  secondary: '#A4A9AD'
});

const whalersTheme = getTheme({
  primary: '#046A38',
  secondary: '#A2AAAD',
  dark: '#00205B',
});

const darkTheme = {
  ...defaultTheme,
  token: {
    ...defaultTheme.token,
    colorBorder: '#333F48',
  },
  components: {
    ...defaultTheme.components,
    Button: {
      colorPrimary: '#333F48',
      defaultColor: '#333F48',
    },
    Layout: {
      headerBg: '#333F48',
      headerColor: '#FFFFFF',
      footerBg: '#333F48',
      colorText: '#333F48',
      bodyBg: '#000000'
    },
  },
};

export const themes: Record<string, Theme> = {
  default: {
    config: defaultTheme,
    label: 'Default',
  },
  whalers: {
    config: whalersTheme,
    label: 'Whalers',
  },
  dark: {
    config: darkTheme,
    label: 'Dark',
    customClass: 'dark',
  },
};
