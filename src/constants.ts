import { ThemeConfig } from 'antd';

export const FREE_SPACE = 'ALL-STAR AHO ★';

export const THEME: ThemeConfig = {
  token: {
    colorPrimary: '#C81025',
  },
  components: {
    Button: {
      colorPrimary: '#000000'
    },
    Skeleton: {
      colorFill: '#333',
      colorFillContent: '#222'
    }
  }
};
