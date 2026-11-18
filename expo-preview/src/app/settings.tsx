import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassOverlay } from '../components/GlassOverlay';
import {
  ErrorText,
  Field,
  InlineButton,
  Muted,
  PageHead,
  Panel,
  PrimaryButton,
  Screen,
  SecondaryButton,
  SectionTitle,
  SuccessText,
  ToggleRow,
} from '../components/NativeUi';
import { useMenufy } from '../providers/MenufyProvider';
import { useMenufyTheme } from '../theme';

const faqs = [
  ['Ako často sa menu aktualizuje?', 'Reštaurácie zverejňujú denné menu každé ráno. Aktualizácie sa zobrazia okamžite.'],
  ['Ako zistím alergény?', 'Pri každom jedle sú uvedené čísla alergénov podľa EÚ (1–14). V Filtroch ich môžete vylúčiť.'],
  ['Je menufy spoplatnené?', 'Nie, pre používateľov aj reštaurácie je služba v úvodnej fáze zadarmo.'],
];

export default function SettingsScreen() {
  const {
    theme: themeMode,
    dark,
    setTheme,
    notify,
    setNotify,
    loggedIn,
    email,
    displayName,
    updateDisplayName,
    updatePassword,
    updateEmail,
    deleteAccount,
    signOut,
  } = useMenufy();
  const theme = useMenufyTheme(themeMode);

  const [username, setUsername] = useState(displayName);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSaved, setNameSaved] = useState(false);
  const [nameBusy, setNameBusy] = useState(false);

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);

  const [modal, setModal] = useState<'email' | 'delete' | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSaved, setEmailSaved] = useState(false);
  const [emailBusy, setEmailBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [faq, setFaq] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => setUsername(displayName), [displayName]);

  const saveName = async () => {
    setNameBusy(true);
    setNameError(null);
    setNameSaved(false);
    const problem = await updateDisplayName(username);
    if (problem) setNameError(problem);
    else setNameSaved(true);
    setNameBusy(false);
  };

  const savePassword = async () => {
    setPasswordBusy(true);
    setPasswordError(null);
    setPasswordSaved(false);
    if (password !== passwordConfirm) {
      setPasswordError('Zadané heslá sa nezhodujú.');
      setPasswordBusy(false);
      return;
    }
    if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      setPasswordError('Heslo musí mať min. 8 znakov, aspoň 1 veľké písmeno a 1 číslo.');
      setPasswordBusy(false);
      return;
    }
    const problem = await updatePassword(password);
    if (problem) setPasswordError(problem);
    else {
      setPasswordSaved(true);
      setPassword('');
      setPasswordConfirm('');
    }
    setPasswordBusy(false);
  };

  const saveEmail = async () => {
    setEmailBusy(true);
    setEmailError(null);
    setEmailSaved(false);
    const problem = await updateEmail(newEmail);
    if (problem) setEmailError(problem);
    else {
      setEmailSaved(true);
      setModal(null);
    }
    setEmailBusy(false);
  };

  const confirmDelete = async () => {
    setDeleteError(null);
    const problem = await deleteAccount();
    if (problem) setDeleteError(problem);
    else {
      setModal(null);
      router.replace('/');
    }
  };

  return (
    <>
      <Screen theme={theme}>
        <PageHead theme={theme} kicker="Účet a predvoľby" title="Nastavenia" />

        {!loggedIn ? (
          <Panel theme={theme}>
            <Text style={[styles.panelTitle, { color: theme.ink }]}>Nie ste prihlásený</Text>
            <Muted theme={theme}>Prihláste sa a nastavíte si e-mail, heslo a upozornenia.</Muted>
            <PrimaryButton theme={theme} title="Prihlásiť sa" onPress={() => router.push('/login')} />
          </Panel>
        ) : null}

        {loggedIn ? (
          <>
            <Panel theme={theme}>
              <SectionTitle theme={theme}>Účet</SectionTitle>
              <Field
                theme={theme}
                label="Používateľské meno"
                value={username}
                onChangeText={(value) => {
                  setUsername(value);
                  setNameSaved(false);
                }}
                placeholder="Vaše meno alebo prezývka"
                hint="Toto meno sa zobrazí pri nových recenziách."
              />
              {nameError ? <ErrorText theme={theme}>{nameError}</ErrorText> : null}
              {nameSaved ? <SuccessText theme={theme}>Používateľské meno bolo uložené.</SuccessText> : null}
              <PrimaryButton theme={theme} title={nameBusy ? 'Ukladáme…' : 'Uložiť meno'} onPress={() => void saveName()} disabled={nameBusy} />

              <View style={styles.keyValue}>
                <Text style={[styles.key, { color: theme.muted }]}>Aktuálny e-mail</Text>
                <Text style={[styles.value, { color: theme.ink }]}>{email}</Text>
              </View>
              <SecondaryButton
                theme={theme}
                title="Zmeniť e-mail"
                onPress={() => {
                  setModal('email');
                  setEmailError(null);
                  setEmailSaved(false);
                  setNewEmail('');
                }}
              />
              {emailSaved ? (
                <SuccessText theme={theme}>
                  Nový e-mail sme uložili. Ak je zmena e-mailu chránená potvrdením, pošleme vám odkaz na novú adresu.
                </SuccessText>
              ) : null}
            </Panel>

            <Panel theme={theme}>
              <SectionTitle theme={theme}>Zabezpečenie</SectionTitle>
              <Field
                theme={theme}
                label="Nové heslo"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Min. 8 znakov, 1 veľké písmeno, 1 číslo"
              />
              <Field
                theme={theme}
                label="Potvrdiť nové heslo"
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
                secureTextEntry
                placeholder="Zopakujte nové heslo"
              />
              {passwordError ? <ErrorText theme={theme}>{passwordError}</ErrorText> : null}
              {passwordSaved ? <SuccessText theme={theme}>Heslo bolo zmenené.</SuccessText> : null}
              <PrimaryButton theme={theme} title={passwordBusy ? 'Ukladáme…' : 'Zmeniť heslo'} onPress={() => void savePassword()} disabled={passwordBusy} />
            </Panel>
          </>
        ) : null}

        <Panel theme={theme}>
          <SectionTitle theme={theme}>Predvoľby</SectionTitle>
          <ToggleRow
            theme={theme}
            label="Tmavý režim"
            description={themeMode === 'system' ? `Podľa systému (${dark ? 'tmavý' : 'svetlý'})` : undefined}
            value={dark}
            onChange={(value) => setTheme(value ? 'dark' : 'light')}
          />
          {themeMode !== 'system' ? (
            <InlineButton theme={theme} title="Použiť systémové nastavenie" onPress={() => setTheme('system')} />
          ) : null}

          <Text style={[styles.subhead, { color: theme.ink }]}>Push a e-mailové upozornenia</Text>
          <ToggleRow
            theme={theme}
            label="Denné súhrny menu"
            description="Každé ráno prehľad menu vašich obľúbených."
            value={notify.daily}
            onChange={(value) => setNotify({ daily: value })}
          />
          <ToggleRow
            theme={theme}
            label="Upozornenia obľúbených reštaurácií"
            description="Keď obľúbená reštaurácia zverejní menu."
            value={notify.fav}
            onChange={(value) => setNotify({ fav: value })}
          />
          <ToggleRow
            theme={theme}
            label="Promo a marketingové novinky"
            value={notify.promo}
            onChange={(value) => setNotify({ promo: value })}
          />
        </Panel>

        <Panel theme={theme}>
          <SectionTitle theme={theme}>Podpora a právne informácie</SectionTitle>
          <Text style={[styles.subhead, { color: theme.ink }]}>Časté otázky</Text>
          {faqs.map(([question, answer], index) => (
            <View key={question} style={[styles.faq, { borderBottomColor: theme.line }]}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setFaq(faq === index ? null : index)}
                style={styles.faqButton}
              >
                <Text style={[styles.faqQuestion, { color: theme.ink }]}>{question}</Text>
                <SymbolView name={faq === index ? 'chevron.up' : 'chevron.down'} size={14} tintColor={theme.muted} />
              </Pressable>
              {faq === index ? <Muted theme={theme}>{answer}</Muted> : null}
            </View>
          ))}

          <Text style={[styles.subhead, { color: theme.ink }]}>Napíšte nám</Text>
          {sent ? (
            <SuccessText theme={theme}>Ďakujeme, správu sme prijali. Ozveme sa do 2 pracovných dní.</SuccessText>
          ) : (
            <>
              <Field
                theme={theme}
                label="Správa"
                value={message}
                onChangeText={setMessage}
                placeholder="Čo vám chýba, alebo čo nefunguje?"
                multiline
              />
              <SecondaryButton theme={theme} title="Odoslať" onPress={() => setSent(true)} />
            </>
          )}

          <View style={styles.legalLinks}>
            <InlineButton theme={theme} title="Podmienky používania" onPress={() => router.push('/legal/terms')} />
            <InlineButton theme={theme} title="Ochrana osobných údajov" onPress={() => router.push('/legal/privacy')} />
          </View>
        </Panel>

        {loggedIn ? (
          <Panel theme={theme}>
            <SectionTitle theme={theme}>Akcie s účtom</SectionTitle>
            <SecondaryButton
              theme={theme}
              title="Odhlásiť sa"
              onPress={() => {
                signOut();
                router.replace('/');
              }}
            />
            <PrimaryButton
              theme={theme}
              danger
              title="Zmazať účet"
              onPress={() => {
                setDeleteError(null);
                setModal('delete');
              }}
            />
          </Panel>
        ) : null}
      </Screen>

      <GlassOverlay
        visible={modal === 'email'}
        title="Zmeniť e-mail"
        theme={theme}
        onClose={() => setModal(null)}
      >
        <Field
          theme={theme}
          label="Nový e-mail"
          value={newEmail}
          onChangeText={setNewEmail}
          placeholder="novy@email.sk"
          keyboardType="email-address"
        />
        <Muted theme={theme}>Zmenu overíme e-mailom, aby nikto nepoužil váš účet bez vášho vedomia.</Muted>
        {emailError ? <ErrorText theme={theme}>{emailError}</ErrorText> : null}
        <View style={styles.modalActions}>
          <SecondaryButton theme={theme} title="Zrušiť" onPress={() => setModal(null)} />
          <PrimaryButton theme={theme} title={emailBusy ? 'Ukladáme…' : 'Uložiť'} onPress={() => void saveEmail()} disabled={emailBusy} />
        </View>
      </GlassOverlay>

      <GlassOverlay
        visible={modal === 'delete'}
        title="Zmazať účet?"
        theme={theme}
        onClose={() => setModal(null)}
      >
        <Muted theme={theme}>Tento krok je nevratný. Zmažeme váš účet, obľúbené reštaurácie aj hodnotenia.</Muted>
        {deleteError ? <ErrorText theme={theme}>{deleteError}</ErrorText> : null}
        <View style={styles.modalActions}>
          <SecondaryButton theme={theme} title="Zrušiť" onPress={() => setModal(null)} />
          <PrimaryButton theme={theme} danger title="Áno, zmazať účet" onPress={() => void confirmDelete()} />
        </View>
      </GlassOverlay>
    </>
  );
}

const styles = StyleSheet.create({
  panelTitle: { fontSize: 16, fontWeight: '800', marginBottom: 5 },
  keyValue: { marginVertical: 12 },
  key: { fontSize: 12 },
  value: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  subhead: { fontSize: 14, fontWeight: '800', marginTop: 16, marginBottom: 4 },
  faq: { borderBottomWidth: 1, paddingVertical: 10 },
  faqButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  faqQuestion: { fontSize: 13, fontWeight: '700', flexShrink: 1 },
  legalLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 18 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
});
