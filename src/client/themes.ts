import { ThemeConfig } from 'antd';

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
      colorText: secondary,
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

export const themes: Record<string, ThemeConfig> = {
  default: defaultTheme,
  whalers: whalersTheme,
};
