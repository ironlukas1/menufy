import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

export type Palette = {
  dark: boolean;
  ink: string;
  muted: string;
  faint: string;
  line: string;
  paper: string;
  canvas: string;
  subtle: string;
  green: string;
  greenDark: string;
  greenSoft: string;
  greenLine: string;
  lime: string;
  amber: string;
  danger: string;
  dangerSoft: string;
  tagFg: string;
  tagBg: string;
  glassBg: string;
  glassBorder: string;
  overlay: string;
  shadow: string;
};

const light: Palette = {
  dark: false,
  ink: '#17211b',
  muted: '#69736d',
  faint: '#929b95',
  line: '#dfe5e0',
  paper: '#ffffff',
  canvas: '#f6f8f5',
  subtle: '#fafbf9',
  green: '#176b43',
  greenDark: '#0e5131',
  greenSoft: '#e6f2eb',
  greenLine: '#bedbc9',
  lime: '#c4dc76',
  amber: '#eead39',
  danger: '#b3261e',
  dangerSoft: '#fdecea',
  tagFg: '#8a6320',
  tagBg: '#fff2d9',
  glassBg: 'rgba(255,255,255,0.72)',
  glassBorder: 'rgba(255,255,255,0.75)',
  overlay: 'rgba(10,20,14,0.42)',
  shadow: 'rgba(27,52,38,0.12)',
};

const dark: Palette = {
  dark: true,
  ink: '#e8efe9',
  muted: '#9aa69f',
  faint: '#75807a',
  line: '#2b3630',
  paper: '#18211c',
  canvas: '#0f1612',
  subtle: '#1b2520',
  green: '#2f9a65',
  greenDark: '#1f7a4d',
  greenSoft: '#1b3a2a',
  greenLine: '#2d5a42',
  lime: '#c4dc76',
  amber: '#f0b44a',
  danger: '#f2b8b5',
  dangerSoft: '#3b1f1d',
  tagFg: '#f0c477',
  tagBg: '#3a2f17',
  glassBg: 'rgba(27,37,32,0.78)',
  glassBorder: 'rgba(255,255,255,0.14)',
  overlay: 'rgba(0,0,0,0.62)',
  shadow: 'rgba(0,0,0,0.44)',
};

export function paletteFor(mode: ThemeMode, system: 'light' | 'dark' | null): Palette {
  const resolved = mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;
  return resolved === 'dark' ? dark : light;
}

/** System-driven palette. Screens can pass an override from user preferences. */
export function useMenufyTheme(override?: ThemeMode): Palette {
  const system = useColorScheme();
  return paletteFor(override ?? 'system', system);
}

export const font = {
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  bold: 'System',
} as const;
