import { Link } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, CircleDashed, Info, XCircle } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { formatDate } from "../engine/format";
import { DISCLAIMER } from "../profile";
import type { SectionMeta } from "../types";
import type { Badge } from "../engine/scoring";

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>
  );
}

const buttonBase =
  "ay-btn-arrow inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-base font-semibold transition-[color,background-color,box-shadow,transform] duration-200 active:scale-[0.98] motion-reduce:active:scale-100 disabled:cursor-not-allowed disabled:opacity-60";
const buttonVariants = {
  primary: "bg-ay-navy text-white hover:bg-ay-navy-2 shadow-sm",
  secondary: "border border-ay-navy/25 bg-white text-ay-navy hover:bg-ay-sky",
  sand: "bg-ay-sand text-ay-ink hover:bg-ay-sand-2",
  ghost: "text-ay-navy hover:bg-ay-sky",
  danger: "border border-ay-bad/30 bg-white text-ay-bad hover:bg-ay-bad-bg",
};
export type ButtonVariant = keyof typeof buttonVariants;

export function buttonClass(variant: ButtonVariant = "primary", className?: string) {
  return cn(buttonBase, buttonVariants[variant], className);
}

export function Button({
  variant = "primary",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant }) {
  return <button type="button" className={buttonClass(variant, className)} {...props} />;
}

export function Card({
  className,
  children,
  as: Tag = "div",
}: {
  className?: string;
  children: ReactNode;
  as?: "div" | "section" | "article" | "li";
}) {
  return (
    <Tag
      className={cn(
        "ay-shadow rounded-2xl border border-ay-line bg-white p-5 shadow-[0_1px_2px_rgb(11_27_51/0.04),0_8px_24px_-12px_rgb(11_27_51/0.12)] sm:p-6",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm font-semibold uppercase tracking-[0.12em] text-ay-gold">{children}</p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  id,
  level = 2,
}: {
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  id?: string;
  level?: 1 | 2;
}) {
  const Heading = level === 1 ? "h1" : "h2";
  return (
    <div className="max-w-3xl">
      {level === 1 ? <span aria-hidden className="ay-title-rule mb-4" /> : null}
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <Heading
        id={id}
        className={cn(
          "mt-2 font-semibold text-ay-ink",
          level === 1 ? "text-3xl sm:text-[2.6rem] sm:leading-[1.12]" : "text-2xl sm:text-3xl",
        )}
      >
        {title}
      </Heading>
      {intro ? <div className="mt-3 text-lg text-ay-slate">{intro}</div> : null}
    </div>
  );
}

const badgeStyles: Record<Badge, { label: string; className: string; icon: typeof CheckCircle2 }> =
  {
    strong: {
      label: "Strong fit",
      className: "bg-ay-good-bg text-ay-good border-ay-good/25",
      icon: CheckCircle2,
    },
    possible: {
      label: "Possible",
      className: "bg-ay-warn-bg text-ay-warn border-ay-warn/25",
      icon: CircleDashed,
    },
    not: {
      label: "Not recommended for you",
      className: "bg-ay-bad-bg text-ay-bad border-ay-bad/25",
      icon: XCircle,
    },
  };

/** Fit badge with an icon and text so meaning never depends on colour alone. */
export function FitBadge({ badge }: { badge: Badge }) {
  const style = badgeStyles[badge];
  const Icon = style.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-sm font-semibold",
        style.className,
      )}
    >
      <Icon aria-hidden className="size-4" />
      {style.label}
    </span>
  );
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "good" | "warn" | "bad" | "sand";
}) {
  const tones = {
    neutral: "bg-ay-mist text-ay-slate border-ay-line",
    good: "bg-ay-good-bg text-ay-good border-ay-good/20",
    warn: "bg-ay-warn-bg text-ay-warn border-ay-warn/20",
    bad: "bg-ay-bad-bg text-ay-bad border-ay-bad/20",
    sand: "bg-ay-sand text-ay-ink border-ay-sand-2",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-sm font-medium",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function Disclaimer({ className }: { className?: string }) {
  return (
    <aside
      role="note"
      aria-label="Disclaimer"
      className={cn(
        "flex gap-3 rounded-xl border border-ay-line bg-ay-mist p-4 text-sm text-ay-slate",
        className,
      )}
    >
      <Info aria-hidden className="mt-0.5 size-5 shrink-0 text-ay-navy" />
      <p>{DISCLAIMER}</p>
    </aside>
  );
}

export function SampleDataBanner({ what = "Some figures on this page" }: { what?: string }) {
  return (
    <div
      role="status"
      className="flex gap-3 rounded-xl border border-ay-warn/30 bg-ay-warn-bg p-4 text-sm text-ay-warn"
    >
      <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0" />
      <p>
        <strong className="font-semibold">Sample data – to be verified.</strong> {what} are
        indicative sample values that have not yet been checked by our research team. Do not rely on
        them for a decision.
      </p>
    </div>
  );
}

/** Sources and "data last verified on" line shown under every report section. */
export function SourceNote({ meta, className }: { meta: SectionMeta; className?: string }) {
  return (
    <div className={cn("mt-4 border-t border-ay-line pt-3 text-sm text-ay-slate", className)}>
      <p>
        <span className="font-semibold text-ay-ink">
          Data last verified on {formatDate(meta.lastVerified)}
        </span>{" "}
        · {meta.verifiedBy}
      </p>
      {meta.sources.length ? (
        <p className="mt-1">
          Sources:{" "}
          {meta.sources.map((source, index) => (
            <span key={source.label}>
              {index > 0 ? "; " : ""}
              {source.url ? (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-ay-line underline-offset-2 hover:decoration-ay-navy"
                >
                  {source.label}
                </a>
              ) : (
                source.label
              )}
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  emphasis,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  emphasis?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        emphasis ? "border-ay-navy bg-ay-navy text-white" : "border-ay-line bg-white",
      )}
    >
      <p className={cn("text-sm", emphasis ? "text-white/80" : "text-ay-slate")}>{label}</p>
      <p className="mt-1 font-[family-name:var(--font-ay-head)] text-2xl font-semibold tabular-nums">
        {value}
      </p>
      {hint ? (
        <p className={cn("mt-1 text-sm", emphasis ? "text-white/80" : "text-ay-slate")}>{hint}</p>
      ) : null}
    </div>
  );
}

// ---------- form controls (visible labels, errors next to the field) ----------

export function Field({
  id,
  label,
  hint,
  error,
  children,
  optional,
}: {
  id: string;
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  children: ReactNode;
  optional?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block font-semibold text-ay-ink">
        {label} {optional ? <span className="font-normal text-ay-slate">(optional)</span> : null}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="text-sm text-ay-slate">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm font-medium text-ay-bad">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const inputClass =
  "block min-h-11 w-full rounded-lg border border-[#c9d0db] bg-white px-3 py-2 text-base text-ay-ink placeholder:text-ay-slate/70 focus:border-ay-navy-2 focus:outline-none focus:ring-2 focus:ring-ay-navy-2/30 aria-[invalid=true]:border-ay-bad";

export function TextInput(props: ComponentProps<"input">) {
  return <input {...props} className={cn(inputClass, props.className)} />;
}

export function SelectInput(props: ComponentProps<"select">) {
  return <select {...props} className={cn(inputClass, "pr-8", props.className)} />;
}

export function TextArea(props: ComponentProps<"textarea">) {
  return <textarea {...props} className={cn(inputClass, "min-h-28", props.className)} />;
}

export function CheckboxRow({
  id,
  checked,
  onChange,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 size-5 shrink-0 cursor-pointer accent-ay-navy"
      />
      <label htmlFor={id} className="text-base text-ay-ink">
        {children}
      </label>
    </div>
  );
}

export function TextLink({ className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      className={cn(
        "font-semibold text-ay-navy-2 underline decoration-ay-navy-2/30 underline-offset-4 hover:decoration-ay-navy-2",
        className as string,
      )}
    />
  );
}
