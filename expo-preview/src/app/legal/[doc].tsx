import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { InlineButton, Muted, PageHead, Panel, Screen, SectionTitle } from '../../components/NativeUi';
import { useMenufy } from '../../providers/MenufyProvider';
import { useMenufyTheme } from '../../theme';

const UPDATED = '15. 10. 2026';

type Section = { title: string; paragraphs?: string[]; bullets?: string[] };

const documents: Record<'terms' | 'privacy', { title: string; intro: string; other: string; sections: Section[] }> = {
  terms: {
    title: 'Podmienky používania',
    intro: 'Tieto podmienky upravujú používanie webovej a mobilnej aplikácie menufy. Používaním služby vyjadrujete súhlas s nimi.',
    other: 'Ochranu osobných údajov',
    sections: [
      {
        title: 'Čo je menufy',
        paragraphs: [
          'menufy prehľadne zobrazuje denné a stále menu reštaurácií vo vašom okolí. Služba je pre používateľov bezplatná a funguje aj bez registrácie. Registrácia je potrebná iba pre obľúbené reštaurácie a upozornenia.',
        ],
      },
      {
        title: 'Používateľský účet',
        bullets: [
          'Pri registrácii uveďte platný e-mail. Heslo si chráňte a nezdieľajte ho.',
          'Za činnosť vo svojom účte zodpovedáte vy.',
          'Účet môžete kedykoľvek zrušiť v Nastaveniach v časti Akcie s účtom.',
        ],
      },
      {
        title: 'Menu, ceny a alergény',
        paragraphs: [
          'Menu, ceny, otváracie hodiny a údaje o alergénoch zverejňujú samotné reštaurácie. menufy ich preberá bez úprav a nezaručuje ich úplnosť ani správnosť.',
          'Ak máte potravinovú alergiu alebo intoleranciu, zloženie jedla si vždy overte priamo v reštaurácii.',
        ],
      },
      {
        title: 'Objednávky a donáška',
        paragraphs: [
          'menufy nepredáva jedlo ani nesprostredkúva platby. Objednávku, donášku aj reklamácie riešite priamo s reštauráciou alebo s donáškovou službou, ktorú si zvolíte.',
        ],
      },
      {
        title: 'Zakázané konanie',
        bullets: [
          'Automatizované sťahovanie obsahu (scraping) bez nášho písomného súhlasu.',
          'Zásahy do bezpečnosti alebo fungovania služby.',
          'Vydávanie sa za inú osobu alebo reštauráciu.',
        ],
      },
      {
        title: 'Dostupnosť a zodpovednosť',
        paragraphs: [
          'Službu poskytujeme tak, ako je. Snažíme sa o jej nepretržitú dostupnosť, no počas údržby alebo pri technických problémoch môže byť dočasne nedostupná. Za škodu spôsobenú nepresnými údajmi od reštaurácií nezodpovedáme.',
        ],
      },
      {
        title: 'Zmeny podmienok',
        paragraphs: [
          'Podmienky môžeme meniť. O podstatných zmenách vás vopred upozorníme v aplikácii alebo e-mailom. Ďalším používaním služby po nadobudnutí účinnosti zmien s nimi súhlasíte.',
        ],
      },
      {
        title: 'Kontakt',
        paragraphs: ['Otázky a žiadosti nám pošlite cez formulár Napíšte nám v Nastaveniach. Odpovieme do 2 pracovných dní.'],
      },
    ],
  },
  privacy: {
    title: 'Ochrana osobných údajov',
    intro: 'Vaše údaje spracúvame len v rozsahu potrebnom na fungovanie menufy a v súlade s nariadením GDPR a zákonom č. 18/2018 Z. z.',
    other: 'Podmienky používania',
    sections: [
      {
        title: 'Aké údaje spracúvame',
        bullets: [
          'Účet: e-mail a heslo (ukladáme ho len v zašifrovanej podobe).',
          'Predvoľby: obľúbené reštaurácie, nastavenia upozornení a vzhľadu.',
          'Správy: obsah správ, ktoré nám pošlete cez formulár.',
          'Poloha: používa sa iba vo vašom zariadení na výpočet vzdialenosti k reštauráciám. Neodosielame ju ani neukladáme.',
        ],
      },
      {
        title: 'Účel a právny základ',
        bullets: [
          'Vedenie účtu, obľúbené a upozornenia – plnenie zmluvy (čl. 6 ods. 1 písm. b GDPR).',
          'Marketingové novinky – váš súhlas (čl. 6 ods. 1 písm. a GDPR), ktorý môžete kedykoľvek odvolať v Nastaveniach.',
          'Bezpečnosť a prevádzka služby – oprávnený záujem (čl. 6 ods. 1 písm. f GDPR).',
        ],
      },
      {
        title: 'Ako dlho údaje uchovávame',
        paragraphs: [
          'Údaje účtu uchovávame, kým účet existuje. Po zrušení účtu ich vymažeme do 30 dní. Správy z kontaktného formulára uchovávame najviac 12 mesiacov.',
        ],
      },
      {
        title: 'Komu údaje poskytujeme',
        paragraphs: [
          'Údaje nepredávame a nepoužívame ich na reklamu tretích strán. Prístup k nim má iba poskytovateľ hostingu, ktorý ich spracúva v našom mene a v rámci EÚ.',
        ],
      },
      {
        title: 'Lokálne úložisko a cookies',
        paragraphs: [
          'V mobilnej aplikácii si ukladáme iba technické údaje potrebné na fungovanie: prihlásenie a zvolený vzhľad. Nepoužívame sledovacie ani reklamné cookies.',
        ],
      },
      {
        title: 'Vaše práva',
        paragraphs: [
          'Máte právo na prístup k svojim údajom, ich opravu, vymazanie, obmedzenie spracúvania, prenosnosť a právo namietať.',
          'Ak si myslíte, že údaje spracúvame nezákonne, môžete podať sťažnosť na Úrad na ochranu osobných údajov SR.',
        ],
      },
      {
        title: 'Kontakt',
        paragraphs: ['Otázky a žiadosti nám pošlite cez formulár Napíšte nám v Nastaveniach. Odpovieme do 2 pracovných dní.'],
      },
    ],
  },
};

export default function LegalScreen() {
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const { theme: themeMode } = useMenufy();
  const theme = useMenufyTheme(themeMode);
  const document = doc === 'privacy' ? documents.privacy : documents.terms;
  const otherDoc = doc === 'privacy' ? 'terms' : 'privacy';

  return (
    <Screen theme={theme}>
      <PageHead
        theme={theme}
        kicker="Právne informácie"
        title={document.title}
        subtitle={`Posledná aktualizácia: ${UPDATED}`}
      />
      <Panel theme={theme}>
        <Muted theme={theme}>{document.intro}</Muted>
      </Panel>

      {document.sections.map((section, index) => (
        <Panel theme={theme} key={section.title}>
          <SectionTitle theme={theme}>
            {index + 1}. {section.title}
          </SectionTitle>
          {section.paragraphs?.map((paragraph) => (
            <Muted theme={theme} key={paragraph}>
              {paragraph}
            </Muted>
          ))}
          {section.bullets?.map((bullet) => (
            <View key={bullet} style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
              <Muted theme={theme}>•</Muted>
              <View style={{ flexShrink: 1 }}>
                <Muted theme={theme}>{bullet}</Muted>
              </View>
            </View>
          ))}
        </Panel>
      ))}

      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <Muted theme={theme}>Pozrite si aj</Muted>
        <InlineButton
          theme={theme}
          title={document.other}
          onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc: otherDoc } })}
        />
      </View>
    </Screen>
  );
}
