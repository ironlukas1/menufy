import type { ReactNode } from "react";
import Icon, { type IconName } from "./Icon";

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
  return (
    <label className="field">
      {icon && <Icon name={icon} size={18} />}
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
        {children}
      </select>
      <Icon name="chevron" size={16} />
    </label>
  );
}
