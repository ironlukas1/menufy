import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import Icon from "@/components/Icon";
import { supabase } from "@/supabase";
import { useProto } from "@/proto/ProtoContext";

function AuthShell({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
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
  const mode = sp.get("mode") === "signup" ? "signup" : "login";
  const next = sp.get("next") || "/";
  const [email, setEmail] = useState(sp.get("email") ?? "");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resent, setResent] = useState(false);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [verify, setVerify] = useState(false);

  const switchMode = (m: string) => {
    setError(null);
    setSp({ mode: m, ...(next !== "/" ? { next } : {}) });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setUnconfirmed(false);
    const mail = email.trim();
    if (mode === "signup") {
      if (pw !== pw2) return setError("Zadané heslá sa nezhodujú.");
      if (pw.length < 8 || !/[A-Z]/.test(pw) || !/\d/.test(pw))
        return setError("Heslo musí mať min. 8 znakov, aspoň 1 veľké písmeno a 1 číslo.");
    }
    setBusy(true);
    if (mode === "login") {
      const { error: err } = await supabase.auth.signInWithPassword({ email: mail, password: pw });
      setBusy(false);
      if (!err) return nav(next);
      if (err.code === "email_not_confirmed") {
        setUnconfirmed(true);
        return setError("E-mail ešte nie je overený. Skontrolujte schránku.");
      }
      return setError("Zadané heslo nezodpovedá zadanému e-mailu.");
    }
    const { data, error: err } = await supabase.auth.signUp({
      email: mail,
      password: pw,
      options: { emailRedirectTo: `${window.location.origin}/verified` },
    });
    setBusy(false);
    if (err) return setError(err.code === "user_already_exists" ? "E-mailová adresa je už zaregistrovaná." : err.message);
    // with email confirmation on, an existing address returns a user with no identities
    if (data.user && data.user.identities?.length === 0) return setError("E-mailová adresa je už zaregistrovaná.");
    if (data.session) return nav(next);
    setVerify(true);
  };

  const resend = async () => {
    const { error: err } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/verified` },
    });
    if (err) return setError(err.message);
    setResent(true);
  };

  if (verify)
    return (
      <AuthShell title="Overte e-mail" sub={`Poslali sme overovací odkaz na ${email.trim()}. Po jeho otvorení budete prihlásený.`}>
        {resent && <p className="success-note" role="status">Odkaz sme poslali znova.</p>}
        {error && <ErrorMsg>{error}</ErrorMsg>}
        <button className="btn-ghost block" onClick={resend}>Poslať odkaz znova</button>
        <button type="button" className="inline-link center" onClick={() => setVerify(false)}>
          Späť na prihlásenie
        </button>
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
        {unconfirmed && (
          <button type="button" className="btn-ghost block" onClick={resend}>
            {resent ? "Odkaz sme poslali znova" : "Poslať overovací e-mail znova"}
          </button>
        )}
        <button className="btn-primary block" disabled={busy}>{mode === "login" ? "Prihlásiť sa" : "Registrovať"}</button>
        {mode === "login" && (
          <Link to="/forgot-password" className="inline-link center">
            Zabudli ste heslo?
          </Link>
        )}
      </form>
    </AuthShell>
  );
}

export function Verified() {
  const { loggedIn } = useProto();
  const err = new URLSearchParams(window.location.hash.slice(1)).get("error_code");
  const [waited, setWaited] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setWaited(true), 4000);
    return () => clearTimeout(t);
  }, []);

  if (loggedIn)
    return (
      <AuthShell title="E-mail overený" sub="Váš účet je aktívny a ste prihlásený.">
        <Link className="btn-primary block" to="/">
          Pokračovať
        </Link>
      </AuthShell>
    );
  if (err || waited)
    return (
      <AuthShell title="Overenie zlyhalo">
        <ErrorMsg>
          {err === "otp_expired"
            ? "Odkaz je neplatný alebo už bol použitý. Ak ste ho už otvorili, e-mail je pravdepodobne overený – skúste sa prihlásiť."
            : "E-mail sa nepodarilo overiť. Skúste sa prihlásiť alebo si nechajte poslať nový odkaz."}
        </ErrorMsg>
        <Link className="btn-primary block" to="/login">
          Prihlásiť sa
        </Link>
      </AuthShell>
    );
  return <AuthShell title="Overujeme e-mail…" />;
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
