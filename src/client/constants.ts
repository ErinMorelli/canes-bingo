import { ThemeConfig } from 'antd';

export const API_PREFIX = '/api/v1';
export const LOCAL_STORAGE_PREFIX = 'CanesBingo';

export const MIN_SQUARE_COUNT = 25;

export const THEME: ThemeConfig = {
  cssVar: true,
  token: {
    colorPrimary: '#046A38', //'#C81025',
  },
  components: {
    Button: {
      colorPrimary: '#00205B',  // '#000000'
    },
    Skeleton: {
      colorFill: '#333',
      colorFillContent: '#222'
    }
  }
};

export enum StorageKey {
  ShowOptionsOnLoad = `${LOCAL_STORAGE_PREFIX}:ShowOptionsOnLoad`,
  TourSeen = `${LOCAL_STORAGE_PREFIX}:TourSeen`,
  App = `${LOCAL_STORAGE_PREFIX}:App`,
  Token = 'session',
}

export class Group {
  public static GENERAL = 'general' as const;
  public static LOCATION = 'location' as const;
  public static BROADCAST = 'broadcast' as const;
  public static PLAYERS = 'players' as const;
  public static BALLY = 'bally' as const;

  public static SingleGroups = [
    this.LOCATION,
    this.BROADCAST
  ] as const;

  public static MultiGroups = [
    this.PLAYERS,
    this.BALLY
  ] as const;

  public static AllGroups = [
    ...this.SingleGroups,
    ...this.MultiGroups,
  ] as const;
}

