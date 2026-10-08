import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import Icon from "@/components/Icon";
import { useProto } from "@/proto/ProtoContext";

function AuthShell({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <Link to="/" className="top-brand auth-brand">
          <span className="top-brand-mark" />
          <span>menufy</span>
        </Link>
        <h2>{title}</h2>
        {sub && <p className="muted">{sub}</p>}
        {children}
      </div>
    </div>
  );
}

function PasswordField({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  const [show, setShow] = useState(false);
  return (
    <label>
      {label}
      <span className="pw">
        <input type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} placeholder="••••••••" />
        <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Skryť heslo" : "Zobraziť heslo"} aria-pressed={show}>
          <Icon name={show ? "eyeoff" : "eye"} size={18} />
        </button>
      </span>
      {hint && <small>{hint}</small>}
    </label>
  );
}

const ErrorMsg = ({ children }: { children: ReactNode }) => (
  <p className="form-error" role="alert">
    {children}
  </p>
);

export function Login() {
  const [sp, setSp] = useSearchParams();
  const nav = useNavigate();
  const { setLoggedIn } = useProto();
  const mode = sp.get("mode") === "signup" ? "signup" : "login";
  const next = sp.get("next") || "/";
  const forced = sp.get("state");
  const [email, setEmail] = useState(sp.get("email") ?? "");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState<string | null>(
    forced === "error"
      ? "Zadané heslo nezodpovedá zadanému e-mailu."
      : forced === "duplicate"
        ? "E-mailová adresa je už zaregistrovaná."
        : forced === "mismatch"
          ? "Zadané heslá sa nezhodujú."
          : null,
  );
  const [verify, setVerify] = useState(false);

  const switchMode = (m: string) => {
    setError(null);
    setSp({ mode: m, ...(next !== "/" ? { next } : {}) });
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      if (pw === "wrong") return setError("Zadané heslo nezodpovedá zadanému e-mailu.");
      setLoggedIn(true);
      return nav(next);
    }
    if (email.trim() === "existing@example.sk") return setError("E-mailová adresa je už zaregistrovaná.");
    if (pw !== pw2) return setError("Zadané heslá sa nezhodujú.");
    setError(null);
    setLoggedIn(true);
    setVerify(true);
  };

  if (verify)
    return (
      <AuthShell title="Účet vytvorený" sub="Poslali sme vám overovací e-mail. Medzitým môžete pokračovať.">
        <Link className="btn-primary block" to={next}>
          Pokračovať
        </Link>
      </AuthShell>
    );

  return (
    <AuthShell title={mode === "login" ? "Vitajte späť" : "Vytvoriť účet"} sub={next !== "/" ? "Pre túto akciu sa musíte prihlásiť." : undefined}>
      <div className="tabs wide" role="tablist">
        <button role="tab" aria-selected={mode === "login"} className={mode === "login" ? "on" : ""} onClick={() => switchMode("login")}>
          Prihlásiť sa
        </button>
        <button role="tab" aria-selected={mode === "signup"} className={mode === "signup" ? "on" : ""} onClick={() => switchMode("signup")}>
          Registrovať sa
        </button>
      </div>
      <form className="form" onSubmit={submit} noValidate>
        <label>
          E-mail
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="meno@domena.sk" autoComplete="email" />
        </label>
        <PasswordField
          label="Heslo"
          value={pw}
          onChange={setPw}
          hint={mode === "signup" ? "Min. 8 znakov, aspoň 1 veľké písmeno a 1 číslo." : undefined}
        />
        {mode === "signup" && <PasswordField label="Potvrdiť heslo" value={pw2} onChange={setPw2} />}
        {error && <ErrorMsg>{error}</ErrorMsg>}
        <button className="btn-primary block">{mode === "login" ? "Prihlásiť sa" : "Registrovať"}</button>
        {mode === "login" && (
          <Link to="/forgot-password" className="inline-link center">
            Zabudli ste heslo?
          </Link>
        )}
      </form>
    </AuthShell>
  );
}

export function ForgotPassword() {
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const forced = sp.get("state");
  const [email, setEmail] = useState(forced ? "zuzana@example.sk" : "");
  const [result, setResult] = useState<null | "found" | "missing">(forced === "found" ? "found" : forced === "missing" ? "missing" : null);
  const [declined, setDeclined] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setDeclined(false);
    setResult(email.trim().startsWith("nikto") ? "missing" : "found");
  };

  return (
    <AuthShell title="Zabudnuté heslo" sub="Zadajte e-mail a pošleme vám odkaz na obnovenie hesla.">
      <form className="form" onSubmit={submit} noValidate>
        <label>
          E-mail
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="meno@domena.sk" />
        </label>
        <button className="btn-primary block">Obnoviť heslo</button>
      </form>
      {result === "found" && (
        <p className="success-note" role="status">
          Odkaz na obnovenie hesla sme poslali na váš e-mail.{" "}
          <Link to="/reset-password" className="inline-link">
            Otvoriť odkaz (demo)
          </Link>
        </p>
      )}
      {result === "missing" && (
        <div className="form-error" role="alert">
          <p>Zadaná e-mailová adresa sa nepoužíva.</p>
          {!declined ? (
            <>
              <strong>Chcete si vytvoriť účet?</strong>
              <div className="modal-actions left">
                <button className="btn-primary" onClick={() => nav(`/login?mode=signup&email=${encodeURIComponent(email)}`)}>
                  Áno
                </button>
                <button className="btn-ghost" onClick={() => setDeclined(true)}>
                  Nie
                </button>
              </div>
            </>
          ) : null}
        </div>
      )}
      <Link to="/login" className="inline-link center">
        Späť na prihlásenie
      </Link>
    </AuthShell>
  );
}

export function ResetPassword() {
  const nav = useNavigate();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <AuthShell title="Nové heslo" sub="Zadajte a potvrďte nové heslo.">
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          if (pw !== pw2) return setError("Zadané heslá sa nezhodujú.");
          nav("/login");
        }}
        noValidate
      >
        <PasswordField label="Nové heslo" value={pw} onChange={setPw} hint="Min. 8 znakov, aspoň 1 veľké písmeno a 1 číslo." />
        <PasswordField label="Potvrdiť nové heslo" value={pw2} onChange={setPw2} />
        {error && <ErrorMsg>{error}</ErrorMsg>}
        <button className="btn-primary block">Uložiť heslo</button>
      </form>
    </AuthShell>
  );
}
