import { GlassIconButton } from './Glass';
import type { Palette } from '../theme';

type Props = {
  active: boolean;
  theme: Palette;
  onPress: () => void;
  size?: number;
};

/** Real native glass heart; there is no hidden web heart in the native UI. */
export function HeartButton({ active, theme, onPress, size = 40 }: Props) {
  return (
    <GlassIconButton
      icon={active ? 'heart.fill' : 'heart'}
      label={active ? 'Odobrať z obľúbených' : 'Pridať do obľúbených'}
      theme={theme}
      active={active}
      onPress={onPress}
      size={size}
    />
  );
}
