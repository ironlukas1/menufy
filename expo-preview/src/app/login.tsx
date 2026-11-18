import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  ErrorText,
  Field,
  InlineButton,
  Muted,
  Panel,
  PrimaryButton,
  Screen,
  SuccessText,
} from '../components/NativeUi';
import { useMenufy } from '../providers/MenufyProvider';
import { useMenufyTheme } from '../theme';

type Mode = 'login' | 'signup' | 'verify' | 'forgot';

const redirectTo = () => Linking.createURL('/verified');

export default function LoginScreen() {
  const { theme: themeMode, signIn, signUp, resendVerification, resetPassword, refreshProfile } = useMenufy();
  const theme = useMenufyTheme(themeMode);

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setMessage(null);
  };

  const submitAuth = async () => {
    if (busy) return;
    setError(null);
    setMessage(null);
    const mail = email.trim();

    if (mode === 'signup') {
      if (username.trim().length < 2 || username.trim().length > 60) {
        setError('Používateľské meno musí mať 2 až 60 znakov.');
        return;
      }
      if (password !== confirm) {
        setError('Zadané heslá sa nezhodujú.');
        return;
      }
      if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
        setError('Heslo musí mať min. 8 znakov, aspoň 1 veľké písmeno a 1 číslo.');
        return;
      }
    }

    setBusy(true);
    try {
      if (mode === 'login') {
        const problem = await signIn(mail, password);
        if (problem) {
          setError(problem);
          if (/overený/i.test(problem)) {
            setMode('verify');
          }
          return;
        }
        close();
        return;
      }

      const problem = await signUp(mail, password, username, redirectTo());
      if (problem) {
        setError(problem);
        return;
      }
      await refreshProfile();
      setMessage('Poslali sme overovací odkaz na váš e-mail. Po jeho otvorení budete prihlásený.');
      setMode('verify');
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const problem = await resendVerification(email.trim(), redirectTo());
      if (problem) setError(problem);
      else setMessage('Odkaz sme poslali znova.');
    } finally {
      setBusy(false);
    }
  };

  const forgot = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const problem = await resetPassword(email.trim(), redirectTo());
      if (problem) setError(problem);
      else {
        setMessage('Odkaz na obnovenie hesla sme poslali na váš e-mail.');
        setMode('forgot');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen theme={theme}>
      <View style={styles.top}>
        <InlineButton theme={theme} title="Späť" onPress={close} />
      </View>

      <Panel theme={theme}>
        <Text style={[styles.title, { color: theme.ink }]}>
          {mode === 'verify'
            ? 'Overte e-mail'
            : mode === 'forgot'
              ? 'Zabudnuté heslo'
              : mode === 'signup'
                ? 'Vytvoriť účet'
                : 'Vitajte späť'}
        </Text>
        <Muted theme={theme}>
          {mode === 'verify'
            ? `Poslali sme overovací odkaz na ${email.trim()}. Po jeho otvorení budete prihlásený.`
            : mode === 'forgot'
              ? 'Zadajte e-mail a pošleme vám odkaz na obnovenie hesla.'
              : mode === 'signup'
                ? 'Registrácia vám umožní ukladať obľúbené reštaurácie a Hodnotenia.'
                : 'Prihláste sa a majte všetky menu, obľúbené a nastavenia na jednom mieste.'}
        </Muted>

        {error ? <ErrorText theme={theme}>{error}</ErrorText> : null}
        {message ? <SuccessText theme={theme}>{message}</SuccessText> : null}

        {mode === 'verify' ? (
          <View style={styles.actions}>
            <PrimaryButton theme={theme} title={busy ? 'Odosielame…' : 'Poslať odkaz znova'} onPress={() => void resend()} disabled={busy} />
            <InlineButton theme={theme} title="Späť na prihlásenie" onPress={() => switchMode('login')} />
          </View>
        ) : mode === 'forgot' ? (
          <View style={styles.actions}>
            <Field
              theme={theme}
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              placeholder="meno@domena.sk"
              keyboardType="email-address"
            />
            <PrimaryButton theme={theme} title={busy ? 'Odosielame…' : 'Obnoviť heslo'} onPress={() => void forgot()} disabled={busy} />
            <InlineButton theme={theme} title="Späť na prihlásenie" onPress={() => switchMode('login')} />
          </View>
        ) : (
          <>
            <View style={styles.segmented}>
              {(['login', 'signup'] as const).map((item) => (
                <Pressable
                  key={item}
                  accessibilityRole="button"
                  onPress={() => switchMode(item)}
                  style={[styles.segment, mode === item && { backgroundColor: theme.green }]}
                >
                  <Text style={[styles.segmentText, { color: mode === item ? '#fff' : theme.ink }]}>
                    {item === 'login' ? 'Prihlásiť sa' : 'Registrovať sa'}
                  </Text>
                </Pressable>
              ))}
            </View>

            {mode === 'signup' ? (
              <Field
                theme={theme}
                label="Používateľské meno"
                value={username}
                onChangeText={setUsername}
                placeholder="Vaše meno alebo prezývka"
                hint="Toto meno sa zobrazí pri vašich recenziách."
              />
            ) : null}

            <Field
              theme={theme}
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              placeholder="meno@domena.sk"
              keyboardType="email-address"
            />
            <Field
              theme={theme}
              label="Heslo"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              hint={mode === 'signup' ? 'Min. 8 znakov, aspoň 1 veľké písmeno a 1 číslo.' : undefined}
            />
            {mode === 'signup' ? (
              <Field
                theme={theme}
                label="Potvrdiť heslo"
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry
              />
            ) : null}

            <PrimaryButton
              theme={theme}
              title={busy ? 'Odosielame…' : mode === 'login' ? 'Prihlásiť sa' : 'Registrovať'}
              onPress={() => void submitAuth()}
              disabled={busy}
            />
            {mode === 'login' ? (
              <InlineButton theme={theme} title="Zabudli ste heslo?" onPress={() => switchMode('forgot')} />
            ) : null}
          </>
        )}
      </Panel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: 'flex-start', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 6 },
  actions: { marginTop: 14 },
  segmented: { flexDirection: 'row', gap: 6, marginBottom: 16 },
  segment: { flex: 1, borderRadius: 999, paddingVertical: 10, alignItems: 'center', backgroundColor: '#f0f3f0' },
  segmentText: { fontSize: 13, fontWeight: '700' },
});
