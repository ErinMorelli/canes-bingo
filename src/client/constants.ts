export const API_PREFIX = '/api/v1';
export const LOCAL_STORAGE_PREFIX = 'CanesBingo';

export const MIN_SQUARE_COUNT = 25;

export enum ConfigKey {
  FreeSpace = 'freeSpace',
  HeaderText = 'headerText',
  Theme = 'theme',
  CustomClass = 'customClass',
}

export const StorageKey = {
  ShowOptionsOnLoad: `${LOCAL_STORAGE_PREFIX}:ShowOptionsOnLoad`,
  TourSeen: `${LOCAL_STORAGE_PREFIX}:TourSeen`,
  App: `${LOCAL_STORAGE_PREFIX}:App`,
  Token: 'session',
} as const;
export type StorageKey = typeof StorageKey[keyof typeof StorageKey];

export class Group {
  public static readonly GENERAL = 'general' as const;
  public static readonly LOCATION = 'location' as const;
  public static readonly BROADCAST = 'broadcast' as const;
  public static readonly PLAYERS = 'players' as const;
  public static readonly BALLY = 'bally' as const;

  public static readonly SingleGroups = [
    this.LOCATION,
    this.BROADCAST
  ] as const;

  public static readonly MultiGroups = [
    this.PLAYERS,
    this.BALLY
  ] as const;

  public static readonly AllGroups = [
    ...this.SingleGroups,
    ...this.MultiGroups,
  ] as const;
}

