import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import Icon from "@/components/Icon";

type Section = { id: string; title: string; body: ReactNode };

const UPDATED = "15. 10. 2026";

function LegalPage({ title, intro, sections, other }: { title: string; intro: string; sections: Section[]; other: { to: string; label: string } }) {
  const nav = useNavigate();
  const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="page narrow legal-page">
      <button className="back-link" onClick={() => (history.length > 1 ? nav(-1) : nav("/settings"))}>
        <Icon name="back" size={17} /> Späť
      </button>
      <div className="page-head">
        <p className="section-kicker">Právne informácie</p>
        <h2>{title}</h2>
        <p className="muted">Posledná aktualizácia: {UPDATED}</p>
      </div>

      <p className="legal-intro">{intro}</p>

      <div className="panel legal-toc" role="navigation" aria-label="Obsah">
        <strong>Obsah</strong>
        <ol>
          {sections.map((s) => (
            <li key={s.id}>
              <button onClick={() => jump(s.id)}>{s.title}</button>
            </li>
          ))}
        </ol>
      </div>

      <div className="panel legal-doc">
        {sections.map((s, i) => (
          <section key={s.id} id={s.id}>
            <h3>
              <span>{i + 1}.</span> {s.title}
            </h3>
            {s.body}
          </section>
        ))}
      </div>

      <p className="legal-other">
        Pozrite si aj <Link to={other.to}>{other.label}</Link>.
      </p>
    </div>
  );
}

const contact = (
  <p>
    Otázky a žiadosti nám pošlite cez formulár <Link to="/settings">Napíšte nám</Link> v Nastaveniach. Odpovieme do 2 pracovných dní.
  </p>
);

export function Terms() {
  return (
    <LegalPage
      title="Podmienky používania"
      intro="Tieto podmienky upravujú používanie webovej a mobilnej aplikácie menufy. Používaním služby vyjadrujete súhlas s nimi."
      other={{ to: "/privacy", label: "Ochranu osobných údajov" }}
      sections={[
        {
          id: "sluzba",
          title: "Čo je menufy",
          body: (
            <p>
              menufy prehľadne zobrazuje denné a stále menu reštaurácií vo vašom okolí. Služba je pre používateľov bezplatná a funguje aj bez
              registrácie. Registrácia je potrebná iba pre obľúbené reštaurácie a upozornenia.
            </p>
          ),
        },
        {
          id: "ucet",
          title: "Používateľský účet",
          body: (
            <ul>
              <li>Pri registrácii uveďte platný e-mail. Heslo si chráňte a nezdieľajte ho.</li>
              <li>Za činnosť vo svojom účte zodpovedáte vy.</li>
              <li>Účet môžete kedykoľvek zrušiť v Nastaveniach v časti Akcie s účtom.</li>
            </ul>
          ),
        },
        {
          id: "obsah",
          title: "Menu, ceny a alergény",
          body: (
            <>
              <p>
                Menu, ceny, otváracie hodiny a údaje o alergénoch zverejňujú samotné reštaurácie. menufy ich preberá bez úprav a nezaručuje ich
                úplnosť ani správnosť.
              </p>
              <p className="legal-callout">
                <Icon name="info" size={18} />
                Ak máte potravinovú alergiu alebo intoleranciu, zloženie jedla si vždy overte priamo v reštaurácii.
              </p>
            </>
          ),
        },
        {
          id: "objednavky",
          title: "Objednávky a donáška",
          body: (
            <p>
              menufy nepredáva jedlo ani nesprostredkúva platby. Objednávku, donášku aj reklamácie riešite priamo s reštauráciou alebo s
              donáškovou službou, ktorú si zvolíte.
            </p>
          ),
        },
        {
          id: "zakazane",
          title: "Zakázané konanie",
          body: (
            <ul>
              <li>Automatizované sťahovanie obsahu (scraping) bez nášho písomného súhlasu.</li>
              <li>Zásahy do bezpečnosti alebo fungovania služby.</li>
              <li>Vydávanie sa za inú osobu alebo reštauráciu.</li>
            </ul>
          ),
        },
        {
          id: "zodpovednost",
          title: "Dostupnosť a zodpovednosť",
          body: (
            <p>
              Službu poskytujeme tak, ako je. Snažíme sa o jej nepretržitú dostupnosť, no počas údržby alebo pri technických problémoch môže byť
              dočasne nedostupná. Za škodu spôsobenú nepresnými údajmi od reštaurácií nezodpovedáme.
            </p>
          ),
        },
        {
          id: "zmeny",
          title: "Zmeny podmienok",
          body: (
            <p>
              Podmienky môžeme meniť. O podstatných zmenách vás vopred upozorníme v aplikácii alebo e-mailom. Ďalším používaním služby po
              nadobudnutí účinnosti zmien s nimi súhlasíte.
            </p>
          ),
        },
        { id: "kontakt", title: "Kontakt", body: contact },
      ]}
    />
  );
}

export function Privacy() {
  return (
    <LegalPage
      title="Ochrana osobných údajov"
      intro="Vaše údaje spracúvame len v rozsahu potrebnom na fungovanie menufy a v súlade s nariadením GDPR a zákonom č. 18/2018 Z. z."
      other={{ to: "/terms", label: "Podmienky používania" }}
      sections={[
        {
          id: "udaje",
          title: "Aké údaje spracúvame",
          body: (
            <ul>
              <li>
                <strong>Účet:</strong> e-mail a heslo (ukladáme ho len v zašifrovanej podobe).
              </li>
              <li>
                <strong>Predvoľby:</strong> obľúbené reštaurácie, nastavenia upozornení a vzhľadu.
              </li>
              <li>
                <strong>Správy:</strong> obsah správ, ktoré nám pošlete cez formulár.
              </li>
              <li>
                <strong>Poloha:</strong> používa sa iba vo vašom zariadení na výpočet vzdialenosti k reštauráciám. Neodosielame ju ani neukladáme.
              </li>
            </ul>
          ),
        },
        {
          id: "ucel",
          title: "Účel a právny základ",
          body: (
            <ul>
              <li>Vedenie účtu, obľúbené a upozornenia – plnenie zmluvy (čl. 6 ods. 1 písm. b GDPR).</li>
              <li>Marketingové novinky – váš súhlas (čl. 6 ods. 1 písm. a GDPR), ktorý môžete kedykoľvek odvolať v Nastaveniach.</li>
              <li>Bezpečnosť a prevádzka služby – oprávnený záujem (čl. 6 ods. 1 písm. f GDPR).</li>
            </ul>
          ),
        },
        {
          id: "uchovavanie",
          title: "Ako dlho údaje uchovávame",
          body: (
            <p>
              Údaje účtu uchovávame, kým účet existuje. Po zrušení účtu ich vymažeme do 30 dní. Správy z kontaktného formulára uchovávame najviac
              12 mesiacov.
            </p>
          ),
        },
        {
          id: "prijemcovia",
          title: "Komu údaje poskytujeme",
          body: (
            <p>
              Údaje nepredávame a nepoužívame ich na reklamu tretích strán. Prístup k nim má iba poskytovateľ hostingu, ktorý ich spracúva v
              našom mene a v rámci EÚ.
            </p>
          ),
        },
        {
          id: "ulozisko",
          title: "Lokálne úložisko a cookies",
          body: (
            <p>
              V prehliadači si ukladáme iba technické údaje potrebné na fungovanie: prihlásenie a zvolený vzhľad. Nepoužívame sledovacie ani
              reklamné cookies.
            </p>
          ),
        },
        {
          id: "prava",
          title: "Vaše práva",
          body: (
            <>
              <p>Máte právo na prístup k svojim údajom, ich opravu, vymazanie, obmedzenie spracúvania, prenosnosť a právo namietať.</p>
              <p>
                Ak si myslíte, že údaje spracúvame nezákonne, môžete podať sťažnosť na{" "}
                <a href="https://dataprotection.gov.sk" target="_blank" rel="noreferrer">
                  Úrad na ochranu osobných údajov SR
                </a>
                .
              </p>
            </>
          ),
        },
        { id: "kontakt", title: "Kontakt", body: contact },
      ]}
    />
  );
}
