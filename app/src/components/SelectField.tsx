import { Children, isValidElement, useEffect, useId, useRef, useState, type ReactElement, type ReactNode } from "react";
import Icon, { type IconName } from "./Icon";

type Opt = { value: string; label: string; node: ReactNode };

const parse = (children: ReactNode): Opt[] =>
  Children.toArray(children).flatMap((c) => {
    if (!isValidElement(c)) return [];
    const { value, label, children } = (c as ReactElement<{ value?: string | number; label?: string; children?: ReactNode }>).props;
    const text = label ?? Children.toArray(children).join("");
    return [{ value: String(value ?? text), label: text, node: children }];
  });

export default function SelectField({
  icon,
  label,
  value,
  onChange,
  children,
}: {
  icon?: IconName;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  const opts = parse(children);
  const selected = Math.max(0, opts.findIndex((o) => o.value === value));
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(selected);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  useEffect(() => {
    if (open) list.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const show = () => {
    setActive(selected);
    setOpen(true);
  };
  const pick = (i: number) => {
    onChange(opts[i].value);
    setOpen(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return show();
      setActive((a) => Math.min(opts.length - 1, Math.max(0, a + (e.key === "ArrowDown" ? 1 : -1))));
    } else if (e.key === "Home" || e.key === "End") {
      if (open) {
        e.preventDefault();
        setActive(e.key === "Home" ? 0 : opts.length - 1);
      }
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (open) pick(active);
      else show();
    } else if (e.key === "Escape" || e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div className={`field ${open ? "open" : ""}`} ref={root}>
      <button
        type="button"
        className="field-button"
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKey}
      >
        {icon && <Icon name={icon} size={18} />}
        <span className="field-value">{opts[selected]?.node}</span>
        <Icon name="chevron" size={16} />
      </button>
      {open && (
        <ul className="field-list" id={id} role="listbox" aria-label={label} ref={list}>
          {opts.map((o, i) => (
            <li
              key={o.value}
              role="option"
              aria-label={o.label}
              aria-selected={i === selected}
              className={`${i === active ? "active" : ""} ${i === selected ? "selected" : ""}`}
              onPointerEnter={() => setActive(i)}
              onClick={() => pick(i)}
            >
              <span className="field-option">{o.node}</span>
              {i === selected && <Icon name="check" size={14} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
