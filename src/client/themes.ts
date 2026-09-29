import { ThemeConfig } from 'antd';

import { Theme } from './types';

import { MarkColours } from './bingoMark';

/**
 * Drop-in replacement for src/client/themes.ts, carrying the redesign's tokens.
 *
 * Same shape as the current file — one `getTheme` factory, one `themes` record keyed
 * `default` / `whalers` / `dark`, each with `config`, `label` and an optional `customClass`
 * — so nothing downstream of `themes` has to change.
 *
 * What is different, and why:
 *
 * 1. `secondary` is no longer used for body text. The brand silvers (#A4A9AD, #A2AAAD) measure
 *    2.3:1 on white, so the current `colorText: secondary` fails WCAG AA everywhere it lands on
 *    a light ground. Body text now uses `text` / `muted`, which are darkened steps of the same
 *    hue. The silvers survive only where they actually work — muted text on the dark footer —
 *    which antd has no token for, so they ship as the separate `footerMuted` export below.
 * 2. Colour roles are named for what they are (`surface`, `fill`, `border`) rather than being
 *    derived from `dark` / `light`, because the redesign has more than two grounds per theme.
 * 3. Shape tokens (radius, control height, font) are shared across all three themes — only
 *    colour varies. 44px control height is the iOS minimum hit target.
 * 4. The Dark theme keeps the accent red as a FILL only. #CE1126 cannot reach 4.5:1 on #333F48,
 *    so accent-coloured text falls back to white there (`accentText`).
 *
 * Not expressible as antd tokens, and still owned by style.scss: the Anton display face, the
 * diagonal clip-path on the header, and the board grid itself.
 */

type GetThemeProps = {
  /** Brand accent. Fills, active states, focus rings. */
  primary: string;
  /** Darkest brand ground: footer, inverted chips, FREE square. */
  dark?: string;
  light?: string;
  /** Page ground behind the shell. */
  shell?: string;
  /** Card / header / row surface. */
  surface?: string;
  /** Body text. */
  text?: string;
  /** Secondary text that still has to clear 4.5:1. */
  muted?: string;
  /** Hairlines and control outlines. */
  border?: string;
  /** Segmented-control tracks, tag backgrounds, table headers. */
  fill?: string;
  /** Accent-as-text. Falls back to white where the accent cannot clear 4.5:1. */
  accentText?: string;
  /** The OFF state of a Switch track. */
  trackOff?: string;
};

const shared = {
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
  fontSize: 15,
  borderRadius: 12,
  borderRadiusLG: 14,
  borderRadiusSM: 9,
  controlHeight: 44,
  controlHeightSM: 36,
  controlHeightLG: 50,
  wireframe: false,
};

const getTheme = ({
  primary,
  dark = '#000000',
  light = '#FFFFFF',
  shell = '#F4F5F6',
  surface = '#FFFFFF',
  text = '#000000',
  muted = '#5F6467',
  border = '#DFE1E3',
  fill = '#F1F2F3',
  accentText = primary,
  trackOff = '#C6CACC',
}: GetThemeProps): ThemeConfig => ({
  token: {
    ...shared,
    colorPrimary: primary,
    colorInfo: primary,
    colorLink: accentText,
    colorLinkHover: accentText,
    colorLinkActive: accentText,

    colorBgLayout: shell,
    colorBgContainer: surface,
    colorBgElevated: surface,
    colorBgSpotlight: dark,
    colorBgMask: 'rgba(20,24,28,.5)',

    colorText: text,
    colorTextHeading: text,
    colorTextSecondary: muted,
    colorTextTertiary: muted,
    colorTextDescription: muted,
    colorTextPlaceholder: muted,

    colorBorder: border,
    colorBorderSecondary: border,
    colorSplit: border,
    colorFillTertiary: fill,
    colorFillQuaternary: fill,
  },
  components: {
    Button: {
      borderRadius: 10,
      borderRadiusLG: 12,
      fontWeight: 600,
      primaryShadow: 'none',
      defaultShadow: 'none',
      defaultColor: text,
      defaultBorderColor: border,
    },
    Input: {
      borderRadius: 11,
      paddingInline: 14,
      activeShadow: 'none',
      activeBorderColor: primary,
      hoverBorderColor: primary,
      colorText: text,
    },
    Select: {
      borderRadius: 11,
      colorText: text,
      optionSelectedBg: fill,
    },
    Radio: {
      colorText: text,
      buttonSolidCheckedBg: primary,
    },
    Checkbox: {
      borderRadiusSM: 6,
      controlInteractiveSize: 22,
    },
    Switch: {
      colorPrimary: primary,
      handleSize: 26,
      trackHeight: 31,
      trackMinWidth: 52,
      /**
       * The OFF track. antd derives it from `colorTextQuaternary`, which the token block above
       * repoints at `muted` for text purposes — without these two the unchecked switch renders
       * as a near-black slab and darkens further on hover.
       */
      colorTextQuaternary: trackOff,
      colorTextTertiary: trackOff,
    },
    Segmented: {
      trackBg: fill,
      trackPadding: 4,
      itemSelectedBg: primary,
      itemSelectedColor: light,
      itemColor: text,
      itemHoverColor: text,
      borderRadius: 12,
      borderRadiusSM: 9,
    },
    Tag: {
      defaultBg: fill,
      defaultColor: text,
      borderRadiusSM: 12,
      colorBorder: 'transparent',
    },
    Modal: {
      borderRadiusLG: 18,
      contentBg: surface,
      headerBg: surface,
      titleColor: text,
      titleFontSize: 26,
      footerBg: 'transparent',
    },
    Drawer: {
      colorBgElevated: surface,
      footerPaddingBlock: 16,
    },
    Table: {
      headerBg: fill,
      headerColor: muted,
      headerSplitColor: 'transparent',
      borderColor: border,
      rowHoverBg: fill,
      cellPaddingBlock: 15,
      cellPaddingInline: 20,
      borderRadiusLG: 14,
      colorText: text,
    },
    Card: {
      colorBgContainer: surface,
      borderRadiusLG: 12,
      paddingLG: 14,
    },
    Form: {
      labelColor: muted,
      colorText: text,
    },
    Typography: {
      colorText: text,
    },
    Popover: {
      colorBgElevated: dark,
      colorText: light,
      colorTextHeading: light,
      borderRadius: 10,
    },
    Tooltip: {
      colorBgSpotlight: dark,
      colorTextLightSolid: light,
      borderRadius: 10,
    },
    Divider: {
      colorSplit: border,
    },
    Skeleton: {
      colorFill: fill,
      colorFillContent: border,
    },
    Layout: {
      bodyBg: shell,
      /** The redesign moves the brand color off the header bar; the header is a neutral surface. */
      headerBg: surface,
      headerColor: text,
      headerHeight: 100,
      footerBg: dark,
    },
  },
});

const defaultTheme = getTheme({
  primary: '#CE1126',
});

const whalersTheme = getTheme({
  primary: '#046A38',
  dark: '#00205B',
  shell: '#F3F5F5',
  text: '#00205B',
  muted: '#5D6467',
  border: '#DDE0E1',
  fill: '#F0F2F2',
  trackOff: '#C4C9CA',
});

const darkTheme = getTheme({
  primary: '#CE1126',
  dark: '#FFFFFF',
  light: '#FFFFFF',
  shell: '#000000',
  surface: '#333F48',
  text: '#FFFFFF',
  muted: '#C2C7CA',
  border: '#000000',
  fill: '#3E4B55',
  /** Red cannot clear 4.5:1 on #333F48 — it stays a fill, accent text goes white. */
  accentText: '#FFFFFF',
  trackOff: '#5A666F',
});

/** The dark theme inverts the spotlight grounds, so Popover/Tooltip need dark-on-light text. */
darkTheme.components!.Popover = {
  colorBgElevated: '#FFFFFF',
  colorText: '#000000',
  colorTextHeading: '#000000',
  borderRadius: 10,
};
darkTheme.components!.Tooltip = {
  colorBgSpotlight: '#FFFFFF',
  colorTextLightSolid: '#000000',
  borderRadius: 10,
};
darkTheme.components!.Layout = {
  bodyBg: '#000000',
  headerBg: '#333F48',
  headerColor: '#FFFFFF',
  headerHeight: 100,
  footerBg: '#333F48',
};

/**
 * The brand silvers, which are the ONLY place the old `secondary` value still belongs: muted
 * text on the footer's dark ground, where they clear 4.5:1. antd has no footer-text token
 * (Layout exposes `footerBg` only), so style.scss consumes these as a CSS variable:
 *
 *   :root { --footer-muted: #A4A9AD }  .whalers { --footer-muted: #A2AAAD }  .dark { … }
 */
export const footerMuted: Record<string, string> = {
  default: '#A4A9AD',
  whalers: '#A2AAAD',
  dark: '#C2C7CA',
};

/**
 * The bottom sheet's grab handle. This is the redesign's `trackOff` — the same
 * value the Switch's OFF track uses — but antd has no token for a drag
 * affordance, so style.scss consumes it as a CSS variable:
 *
 *   .ant-drawer-section::before { background: var(--sheet-handle) }
 */
/**
 * The favicon mark, per theme.
 *
 * Only the ground moves. The flags stay Canes red in every theme on purpose:
 * the mark is the nautical hurricane warning signal, which *is* a red square
 * with a black centre — recolour it and it stops being that signal and
 * becomes an abstract coloured square. The ground was doing the theming work
 * anyway, so it is the one that changes.
 *
 * (If Whalers should go full green, `flag` here is the single token to
 * change — the referent is the only thing it costs.)
 */
export const markColours: Record<string, MarkColours> = {
  /*
    Light and Whalers take 3b — a white card where the flags are the only
    solid objects, which is how the board itself reads. Dark takes 3c, whose
    slate ground is the one that survives a dark browser tab strip; a white
    card dissolves into it.
  */
  default: {
    variant: 'outline',
    ground: '#FFFFFF',
    flag: '#CE1126',
    centre: '#000000',
    empty: '#C6CACC',
  },
  /*
    Whalers is the one place the flag is not Canes red. It costs the nautical
    referent — a green square with a black centre is not the storm signal —
    but under a deliberate alternate-brand skin that is the point, and green
    on white is the stronger mark anyway (6.72:1 against white, versus red's
    5.63:1).

    The centre stays black rather than Whalers navy: black holds 3.12:1
    against the green, navy only 2.30:1, and black keeps the same figure the
    other two themes draw.
  */
  whalers: {
    variant: 'outline',
    ground: '#FFFFFF',
    flag: '#046A38',
    centre: '#000000',
    empty: '#C8CDCB',
  },
  // 3c verbatim: slate ground, empties at 16% white pre-blended.
  dark: {
    variant: 'dark',
    ground: '#333F48',
    flag: '#CE1126',
    centre: '#000000',
    empty: '#545E65',
  },
};

export const sheetHandle: Record<string, string> = {
  default: '#C6CACC',
  whalers: '#C4C9CA',
  dark: '#5A666F',
};

/**
 * Footer buttons sit on the dark footer ground, not on `colorBgContainer`, so a plain
 * `<Button>` inherits the page-surface colours and comes out white-on-white. antd has no
 * "inverted region" concept — the fix is a second ConfigProvider scoped to the footer:
 *
 *   <ConfigProvider theme={footerButtonTheme}>
 *     <Button icon={<AppstoreOutlined />}>Squares Database</Button>
 *     <Button type="primary" icon={<PlusCircleOutlined />}>Submit a Square</Button>
 *   </ConfigProvider>
 *
 * Ghost-on-dark for the default button, brand accent for the primary. Nothing else in the
 * footer needs it — text and links are plain elements, styled via --footer-muted in SCSS.
 */
export const footerButtonTheme: Record<string, ThemeConfig> = Object.fromEntries(
  Object.entries({ default: '#CE1126', whalers: '#046A38', dark: '#CE1126' }).map(
    ([name, accent]) => [
      name,
      {
        token: { ...shared, colorPrimary: accent },
        components: {
          Button: {
            borderRadius: 10,
            fontWeight: 600,
            defaultShadow: 'none',
            primaryShadow: 'none',
            /** 8% white reads as a raised chip on every footer ground without a border. */
            defaultBg: 'rgba(255,255,255,.08)',
            defaultColor: '#FFFFFF',
            defaultBorderColor: 'transparent',
            defaultHoverBg: 'rgba(255,255,255,.16)',
            defaultHoverColor: '#FFFFFF',
            defaultHoverBorderColor: 'transparent',
            defaultActiveBg: 'rgba(255,255,255,.22)',
            defaultActiveColor: '#FFFFFF',
            defaultActiveBorderColor: 'transparent',
          },
        },
      } as ThemeConfig,
    ]
  )
);

/**
 * Header buttons. Three roles sit side by side on the header surface and only ONE of them is
 * a stock antd role:
 *
 *   Generate Card  — inverted: fills with the header's TEXT colour. Not `primary` (that is the
 *                    accent) and not `default` (that is the page surface). Needs the nine
 *                    default* tokens, same as the footer.
 *   Share          — ghost: transparent with a hairline. Also `default`, so it cannot coexist
 *                    with Generate Card in one provider — give it `type="text"` and let the
 *                    text* tokens carry it.
 *   Options        — plain `type="primary"`. Already correct from the page theme; do not wrap it.
 *
 *   <ConfigProvider theme={headerButtonTheme[themeName]}>
 *     <Button>Generate Card</Button>
 *     <Button type="text" icon={<ShareAltOutlined />} />
 *   </ConfigProvider>
 *   <Button type="primary">Options</Button>
 */
export const headerButtonTheme: Record<string, ThemeConfig> = Object.fromEntries(
  (
    [
      // [name, accent, header surface, header ink, hairline]
      ['default', '#CE1126', '#FFFFFF', '#000000', '#DFE1E3'],
      ['whalers', '#046A38', '#FFFFFF', '#00205B', '#DDE0E1'],
      ['dark', '#CE1126', '#333F48', '#FFFFFF', '#000000'],
    ] as const
  ).map(([name, accent, surface, ink, hairline]) => [
    name,
    {
      token: { ...shared, colorPrimary: accent },
      components: {
        Button: {
          borderRadius: 10,
          fontWeight: 600,
          defaultShadow: 'none',
          primaryShadow: 'none',
          /** Inverted fill: the header's ink becomes the button ground. Always 4.5:1 by construction. */
          defaultBg: ink,
          defaultColor: surface,
          defaultBorderColor: ink,
          defaultHoverBg: ink,
          defaultHoverColor: surface,
          defaultHoverBorderColor: ink,
          defaultActiveBg: ink,
          defaultActiveColor: surface,
          defaultActiveBorderColor: ink,
          /** Ghost icon button rides the text* tokens so it can share this provider. */
          textHoverBg: hairline,
          colorText: ink,
        },
      },
    } as ThemeConfig,
  ])
);

/**
 * The 2px rule under the header. Not `colorSplit` — that is the hairline colour (#DFE1E3 and
 * friends) used for borders and dividers; this is a brand rule and reads as a deliberate stripe.
 *
 * It does not follow one token across themes, which is why it cannot be derived:
 *   Light   — black. The accent red would compete with the OPTIONS button right above it.
 *   Dark    — accent red. It is the only place the red appears as a large shape on dark chrome.
 *   Whalers — accent green, same reasoning.
 *
 * No antd token covers it (Layout exposes `headerBg` only), so it ships as a variable for SCSS:
 *
 *   .ant-layout-header { border-bottom: 2px solid var(--header-rule) }
 */
export const headerRule: Record<string, string> = {
  default: '#000000',
  whalers: '#046A38',
  dark: '#CE1126',
};

export const themes: Record<string, Theme> = {
  default: {
    config: defaultTheme,
    label: 'Light',
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
