export const LOCAL_STORAGE_PREFIX = 'CanesBingo';
export const IMGUR_CLIENT_ID = import.meta.env.VITE_IMGUR_CLIENT_ID;

export const MIN_SQUARE_COUNT = 25;

/**
 * The compact breakpoint, in px. Must stay in step with `$bp-compact` in
 * style.scss — the stylesheet owns every responsive rule except the handful
 * that decide a React prop rather than a style.
 */
export const BP_COMPACT = 720;

/**
 * The wide breakpoint, in px — where the squares database swaps its stacked
 * cards for a table. Must stay in step with `$bp-wide` in style.scss.
 */
export const BP_WIDE = 1040;

export const DEFAULT_PATTERN_SIZE = 50;
export const PATTERN_COLUMNS = [...new Array(5).keys()];
export const PATTERN_ROWS = [...new Array(5).keys()];

export enum ConfigKey {
  FreeSpace = 'freeSpace',
  HeaderText = 'headerText',
  Theme = 'theme',
  CustomClass = 'customClass',
  FestiveLights = 'festiveLights',
}

export const StorageKey = {
  ShowOptionsOnLoad: `${LOCAL_STORAGE_PREFIX}:ShowOptionsOnLoad`,
  TourSeen: `${LOCAL_STORAGE_PREFIX}:TourSeen`,
  App: `${LOCAL_STORAGE_PREFIX}:App`,
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
