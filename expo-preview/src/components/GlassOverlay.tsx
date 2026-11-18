import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassSurface } from './Glass';
import type { Palette } from '../theme';

type Props = {
  visible: boolean;
  title: string;
  theme: Palette;
  onClose: () => void;
  children: ReactNode;
  /** Allow the panel to fill most of the screen (search / filters). */
  tall?: boolean;
};

/**
 * Exclusive floating glass panel over a dimmed, non-scrollable background.
 * A native modal is used so the dim also covers the system tab bar.
 */
export function GlassOverlay({ visible, title, theme, onClose, children, tall = false }: Props) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[styles.root, { backgroundColor: theme.overlay }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Zavrieť prekrytie"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboard}
        >
          <GlassSurface
            theme={theme}
            intensity="regular"
            style={[
              styles.panel,
              {
                marginTop: insets.top + 12,
                marginBottom: insets.bottom + 12,
                maxHeight: height - insets.top - insets.bottom - 24,
                backgroundColor: theme.paper,
              },
              tall && styles.tall,
            ]}
          >
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.ink }]}>{title}</Text>
              <Pressable accessibilityRole="button" onPress={onClose} hitSlop={8}>
                <Text style={[styles.close, { color: theme.green }]}>Zavrieť</Text>
              </Pressable>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
              {children}
            </ScrollView>
          </GlassSurface>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-start', paddingHorizontal: 14 },
  keyboard: { flex: 1 },
  panel: {
    borderRadius: 28,
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  tall: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 10,
  },
  title: { fontSize: 20, fontWeight: '700' },
  close: { fontSize: 15, fontWeight: '600' },
  content: { paddingHorizontal: 20, paddingBottom: 24 },
});
