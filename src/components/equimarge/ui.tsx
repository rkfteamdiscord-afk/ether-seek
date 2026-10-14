import { useId, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, CircleAlert, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { HealthLevel } from "@/lib/equimarge/calc";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  intro,
  action,
}: {
  title: string;
  intro?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[1.75rem] font-semibold leading-tight sm:text-3xl">{title}</h1>
        {intro && <p className="mt-1.5 max-w-2xl text-muted-foreground">{intro}</p>}
      </div>
      {action && <div className="flex shrink-0 flex-wrap gap-2">{action}</div>}
    </header>
  );
}

export function Panel({
  title,
  description,
  children,
  className,
  action,
}: {
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card p-4 shadow-[0_1px_2px_oklch(0.4_0.03_80/0.06)] sm:p-6",
        className,
      )}
    >
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-xl font-semibold leading-snug">{title}</h2>}
            {description && (
              <p className="mt-1 text-[0.95rem] text-muted-foreground">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  sentence,
  tone = "neutral",
  icon,
}: {
  label: string;
  value: string;
  sentence?: ReactNode;
  tone?: "neutral" | "good" | "bad";
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center gap-2 text-[0.95rem] font-medium text-muted-foreground">
        {icon}
        {label}
      </div>
      <div
        className={cn(
          "mt-1 font-serif-em text-[1.9rem] font-semibold leading-tight tabular-nums",
          tone === "good" && "text-[var(--em-good)]",
          tone === "bad" && "text-[var(--em-bad)]",
        )}
      >
        {value}
      </div>
      {sentence && (
        <p className="mt-1.5 text-[0.95rem] leading-snug text-muted-foreground">{sentence}</p>
      )}
    </div>
  );
}

const healthStyles: Record<HealthLevel, { label: string; className: string; Icon: typeof Info }> = {
  vert: {
    label: "Vert",
    className: "bg-[var(--em-good-soft)] text-[var(--em-good)] border-[var(--em-good)]/30",
    Icon: CheckCircle2,
  },
  orange: {
    label: "Orange",
    className: "bg-[var(--em-warn-soft)] text-[oklch(0.45_0.11_60)] border-[var(--em-warn)]/40",
    Icon: CircleAlert,
  },
  rouge: {
    label: "Rouge",
    className: "bg-[var(--em-bad-soft)] text-[var(--em-bad)] border-[var(--em-bad)]/30",
    Icon: AlertTriangle,
  },
};

export function HealthBadge({ level, className }: { level: HealthLevel; className?: string }) {
  const style = healthStyles[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold",
        style.className,
        className,
      )}
    >
      <style.Icon className="h-4 w-4" aria-hidden="true" />
      {style.label}
    </span>
  );
}

export function HealthLight({ level }: { level: HealthLevel }) {
  const order: HealthLevel[] = ["rouge", "orange", "vert"];
  const colors: Record<HealthLevel, string> = {
    rouge: "var(--em-bad)",
    orange: "var(--em-warn)",
    vert: "var(--em-good)",
  };
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      {order.map((l) => (
        <span
          key={l}
          className="h-3.5 w-3.5 rounded-full border border-black/5"
          style={{ background: l === level ? colors[l] : "var(--muted)" }}
        />
      ))}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[0.95rem] font-semibold">
        {label}
      </label>
      {children}
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Text input that accepts "1 234,56" and keeps the number keypad on phones. */
export function MoneyInput({
  id,
  value,
  onChange,
  required,
  placeholder = "0,00",
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        className="em-input pr-10 tabular-nums"
        inputMode="decimal"
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
        €
      </span>
    </div>
  );
}

export function Choice<T extends string>({
  value,
  options,
  onChange,
  name,
}: {
  value: T;
  options: { value: T; label: string; hint?: string }[];
  onChange: (value: T) => void;
  name: string;
}) {
  return (
    <div role="radiogroup" className="grid gap-2 sm:grid-cols-2">
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-xl border bg-card p-3 transition-colors",
            value === option.value
              ? "border-primary bg-accent/60"
              : "border-border hover:border-primary/40",
          )}
        >
          <input
            type="radio"
            name={name}
            className="mt-1 h-4 w-4 accent-[var(--primary)]"
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          <span>
            <span className="block font-semibold">{option.label}</span>
            {option.hint && (
              <span className="block text-sm text-muted-foreground">{option.hint}</span>
            )}
          </span>
        </label>
      ))}
    </div>
  );
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="equimarge-dialog max-h-[92dvh] w-[calc(100vw-1.5rem)] max-w-lg overflow-y-auto rounded-2xl bg-card p-5 sm:p-6">
        <DialogHeader className="text-left">
          <DialogTitle className="font-serif-em text-2xl">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-base">{description}</DialogDescription>
          )}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

/** Two-step delete so a thumb slip never erases a horse or an invoice. */
export function ConfirmDelete({
  onConfirm,
  label = "Supprimer",
  what,
}: {
  onConfirm: () => void | Promise<void>;
  label?: string;
  what: string;
}) {
  const [asking, setAsking] = useState(false);
  const id = useId();
  if (!asking)
    return (
      <Button
        type="button"
        variant="ghost"
        className="h-11 text-destructive"
        onClick={() => setAsking(true)}
      >
        {label}
      </Button>
    );
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-labelledby={id}>
      <span id={id} className="text-sm">
        Supprimer {what} ?
      </span>
      <Button type="button" variant="destructive" className="h-11" onClick={() => void onConfirm()}>
        Oui, supprimer
      </Button>
      <Button type="button" variant="outline" className="h-11" onClick={() => setAsking(false)}>
        Annuler
      </Button>
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-10 text-center">
      <svg viewBox="0 0 120 90" className="h-16 w-24" aria-hidden="true">
        <ellipse cx="60" cy="80" rx="52" ry="8" fill="var(--em-sage-soft)" />
        <rect x="28" y="38" width="64" height="40" rx="3" fill="var(--em-brown-soft)" />
        <path d="M22 42 60 14l38 28Z" fill="var(--em-brown)" />
        <rect x="50" y="52" width="20" height="26" rx="2" fill="var(--em-brown)" opacity="0.7" />
      </svg>
      <p className="mt-3 text-lg font-semibold">{title}</p>
      {children && <div className="mt-1 max-w-md text-muted-foreground">{children}</div>}
    </div>
  );
}

export function Explain({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: "info" | "warn" | "bad" | "good";
}) {
  const styles = {
    info: "bg-secondary text-secondary-foreground",
    good: "bg-[var(--em-good-soft)] text-[oklch(0.35_0.08_150)]",
    warn: "bg-[var(--em-warn-soft)] text-[oklch(0.4_0.09_60)]",
    bad: "bg-[var(--em-bad-soft)] text-[oklch(0.42_0.14_28)]",
  } as const;
  return (
    <p className={cn("rounded-xl px-4 py-3 text-[0.98rem] leading-snug", styles[tone])}>
      {children}
    </p>
  );
}

export function today() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
