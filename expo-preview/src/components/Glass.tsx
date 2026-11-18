import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import type { Palette } from '../theme';

/** Expo Go ships the glass API on iOS 26+; gracefully fall back elsewhere. */
export function useGlassAvailable(): boolean {
  return useMemo(() => {
    try {
      return isLiquidGlassAvailable() && isGlassEffectAPIAvailable();
    } catch {
      return false;
    }
  }, []);
}

type GlassSurfaceProps = {
  children?: ReactNode;
  theme: Palette;
  style?: StyleProp<ViewStyle>;
  interactive?: boolean;
  tintColor?: string;
  intensity?: 'clear' | 'regular' | 'none';
};

export function GlassSurface({
  children,
  theme,
  style,
  interactive = false,
  tintColor,
  intensity = 'regular',
}: GlassSurfaceProps) {
  const glass = useGlassAvailable();

  if (glass) {
    return (
      <GlassView
        style={style}
        glassEffectStyle={intensity}
        isInteractive={interactive}
        colorScheme={theme.dark ? 'dark' : 'light'}
        tintColor={tintColor}
      >
        {children}
      </GlassView>
    );
  }

  return (
    <View
      style={[
        {
          backgroundColor: theme.glassBg,
          borderColor: theme.glassBorder,
          borderWidth: StyleSheet.hairlineWidth,
          shadowColor: theme.shadow,
          shadowOpacity: 1,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 6 },
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

type GlassIconButtonProps = {
  icon: SFSymbol;
  label: string;
  theme: Palette;
  onPress: () => void;
  active?: boolean;
  badge?: number;
  disabled?: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function GlassIconButton({
  icon,
  label,
  theme,
  onPress,
  active = false,
  badge,
  disabled = false,
  size = 46,
  style,
}: GlassIconButtonProps) {
  const tint = active
    ? theme.dark
      ? '#7ee0ad'
      : theme.green
    : theme.dark
      ? '#e8efe9'
      : theme.ink;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active, disabled }}
      disabled={disabled}
      hitSlop={6}
      onPress={onPress}
      style={[{ width: size, height: size }, style]}
    >
      <GlassSurface
        theme={theme}
        interactive
        tintColor={active ? (theme.dark ? 'rgba(47,154,101,0.35)' : 'rgba(23,107,67,0.28)') : undefined}
        style={[StyleSheet.absoluteFill, { borderRadius: size / 2 }]}
      />
      <View pointerEvents="none" style={styles.content}>
        <SymbolView name={icon} size={22} weight="semibold" tintColor={tint} />
        {badge ? (
          <View style={[styles.badge, { backgroundColor: theme.green }]}>
            <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 1,
    right: 1,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});
