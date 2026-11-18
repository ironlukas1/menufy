import type { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Palette } from '../theme';

export function Screen({
  theme,
  children,
  scroll = true,
  padded = true,
  contentStyle,
}: {
  theme: Palette;
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const content = (
    <View style={[padded && styles.pad, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.canvas }]} edges={['top', 'left', 'right']}>
      {scroll ? (
        <ScrollView style={styles.root} contentContainerStyle={styles.scrollContent}>
          {content}
        </ScrollView>
      ) : (
        <View style={styles.root}>{content}</View>
      )}
    </SafeAreaView>
  );
}

export function PageHead({
  theme,
  kicker,
  title,
  subtitle,
  right,
}: {
  theme: Palette;
  kicker: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <View style={styles.pageHead}>
      <View style={{ flexShrink: 1 }}>
        <Text style={[styles.kicker, { color: theme.green }]}>{kicker}</Text>
        <Text style={[styles.h1, { color: theme.ink }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: theme.muted }]}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function Panel({
  theme,
  children,
  style,
}: {
  theme: Palette;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        styles.panel,
        { backgroundColor: theme.paper, borderColor: theme.line, shadowColor: theme.shadow },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function SectionTitle({ theme, children }: { theme: Palette; children: ReactNode }) {
  return <Text style={[styles.sectionTitle, { color: theme.ink }]}>{children}</Text>;
}

export function Muted({ theme, children }: { theme: Palette; children: ReactNode }) {
  return <Text style={[styles.muted, { color: theme.muted }]}>{children}</Text>;
}

export function ErrorText({ theme, children }: { theme: Palette; children: ReactNode }) {
  return <Text style={[styles.error, { color: theme.danger }]}>{children}</Text>;
}

export function SuccessText({ theme, children }: { theme: Palette; children: ReactNode }) {
  return <Text style={[styles.success, { color: theme.green }]}>{children}</Text>;
}

export function PrimaryButton({
  theme,
  title,
  onPress,
  disabled,
  danger,
}: {
  theme: Palette;
  title: string;
  onPress: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  const bg = danger ? theme.danger : theme.green;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, { backgroundColor: bg, opacity: disabled ? 0.5 : 1 }]}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );
}

export function SecondaryButton({
  theme,
  title,
  onPress,
  disabled,
}: {
  theme: Palette;
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, styles.secondary, { borderColor: theme.line, opacity: disabled ? 0.5 : 1 }]}
    >
      <Text style={[styles.buttonText, { color: theme.green }]}>{title}</Text>
    </Pressable>
  );
}

export function InlineButton({
  theme,
  title,
  onPress,
}: {
  theme: Palette;
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} hitSlop={6}>
      <Text style={[styles.inline, { color: theme.green }]}>{title}</Text>
    </Pressable>
  );
}

export function ToggleRow({
  theme,
  label,
  description,
  value,
  onChange,
}: {
  theme: Palette;
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={{ flexShrink: 1 }}>
        <Text style={[styles.toggleLabel, { color: theme.ink }]}>{label}</Text>
        {description ? <Text style={[styles.toggleHint, { color: theme.faint }]}>{description}</Text> : null}
      </View>
      <Switch value={value} onValueChange={onChange} tintColor={theme.green} thumbColor="#fff" />
    </View>
  );
}

export function Field({
  theme,
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  multiline,
  hint,
}: {
  theme: Palette;
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  multiline?: boolean;
  hint?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: theme.ink }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.faint}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        multiline={multiline}
        style={[
          styles.input,
          {
            color: theme.ink,
            backgroundColor: theme.subtle,
            borderColor: theme.line,
            minHeight: multiline ? 96 : 46,
          },
          multiline && styles.multiline,
        ]}
      />
      {hint ? <Text style={[styles.fieldHint, { color: theme.faint }]}>{hint}</Text> : null}
    </View>
  );
}

export function EmptyState({
  theme,
  title,
  message,
  action,
}: {
  theme: Palette;
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <Panel theme={theme} style={styles.empty}>
      <Text style={[styles.emptyTitle, { color: theme.ink }]}>{title}</Text>
      <Text style={[styles.muted, { color: theme.muted, textAlign: 'center' }]}>{message}</Text>
      {action ? <View style={styles.emptyAction}>{action}</View> : null}
    </Panel>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  pad: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },
  pageHead: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 18 },
  kicker: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },
  h1: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginTop: 2 },
  subtitle: { fontSize: 14, marginTop: 5 },
  panel: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', marginBottom: 10 },
  muted: { fontSize: 13, lineHeight: 19 },
  error: { fontSize: 13, marginTop: 8 },
  success: { fontSize: 13, marginTop: 8, fontWeight: '600' },
  button: { borderRadius: 14, paddingVertical: 13, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  secondary: { borderWidth: 1, backgroundColor: 'transparent' },
  inline: { fontSize: 14, fontWeight: '700', textDecorationLine: 'underline' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 10 },
  toggleLabel: { fontSize: 14, fontWeight: '600' },
  toggleHint: { fontSize: 12, marginTop: 3 },
  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 14, fontWeight: '700', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  multiline: { textAlignVertical: 'top', paddingTop: 12 },
  fieldHint: { fontSize: 12, marginTop: 5 },
  empty: { alignItems: 'center', paddingVertical: 30 },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  emptyAction: { marginTop: 14 },
});
