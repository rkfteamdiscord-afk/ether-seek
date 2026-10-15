import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { getBackend, type Collection } from "../../store";
import { Button, inputClass } from "../ui";

/** Saves a document and refreshes every AbroadYield query so the public site updates immediately. */
export function useSaver() {
  const client = useQueryClient();
  const [status, setStatus] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const save = useCallback(
    async <T extends { id: string }>(collection: Collection, item: T, label = "Saved") => {
      try {
        await getBackend().put(collection, item);
        await client.invalidateQueries({ queryKey: ["ay"] });
        setStatus({ tone: "ok", text: `${label} ${new Date().toLocaleTimeString("en-US")}` });
        return true;
      } catch (error) {
        setStatus({ tone: "error", text: error instanceof Error ? error.message : "Save failed" });
        return false;
      }
    },
    [client],
  );
  const remove = useCallback(
    async (collection: Collection, id: string) => {
      try {
        await getBackend().remove(collection, id);
        await client.invalidateQueries({ queryKey: ["ay"] });
        setStatus({ tone: "ok", text: "Deleted" });
      } catch (error) {
        setStatus({
          tone: "error",
          text: error instanceof Error ? error.message : "Delete failed",
        });
      }
    },
    [client],
  );
  return { save, remove, status };
}

export function SaveStatus({ status }: { status: { tone: "ok" | "error"; text: string } | null }) {
  if (!status) return null;
  return (
    <p
      role="status"
      className={cn("text-sm font-medium", status.tone === "ok" ? "text-ay-good" : "text-ay-bad")}
    >
      {status.text}
    </p>
  );
}

export function AdminSection({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-ay-line bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          {description ? <div className="mt-1 text-ay-slate">{description}</div> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** Compact labelled input used in admin forms. */
export function AField({
  label,
  children,
  className,
  hint,
}: {
  label: string;
  children: ReactNode;
  className?: string;
  hint?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="text-sm font-semibold text-ay-ink">{label}</span>
      <span className="mt-1 block">{children}</span>
      {hint ? <span className="mt-0.5 block text-xs text-ay-slate">{hint}</span> : null}
    </label>
  );
}

export function NumInput({
  value,
  onChange,
  step = "any",
  percent = false,
}: {
  value: number;
  onChange: (v: number) => void;
  step?: string;
  percent?: boolean;
}) {
  // Percent fields are edited as human percentages (5.5) and stored as fractions (0.055).
  const shown = percent ? Number((value * 100).toFixed(4)) : value;
  return (
    <span className="relative block">
      <input
        type="number"
        step={step}
        value={Number.isFinite(shown) ? shown : 0}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) onChange(percent ? n / 100 : n);
        }}
        className={cn(inputClass, "min-h-10 py-1.5 tabular-nums", percent && "pr-8")}
      />
      {percent ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-ay-slate"
        >
          %
        </span>
      ) : null}
    </span>
  );
}

export function TextIn({
  value,
  onChange,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(inputClass, "min-h-10 py-1.5")}
    />
  );
}

export function TextBox({
  value,
  onChange,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(inputClass, "min-h-0 py-1.5")}
    />
  );
}

/**
 * JSON editor for nested structures (cost items, risks, checklists, sources). Validates syntax and
 * shape with the provided check before saving.
 */
export function JsonEditor<T>({
  label,
  value,
  onApply,
  validate,
  rows = 10,
}: {
  label: string;
  value: T;
  onApply: (v: T) => void;
  validate?: (v: unknown) => string | null;
  rows?: number;
}) {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2));
  const [error, setError] = useState("");
  const [lastValue, setLastValue] = useState(value);
  if (lastValue !== value) {
    setLastValue(value);
    setText(JSON.stringify(value, null, 2));
  }
  return (
    <div>
      <span className="text-sm font-semibold">{label}</span>
      <textarea
        aria-label={label}
        rows={rows}
        spellCheck={false}
        value={text}
        onChange={(e) => (setText(e.target.value), setError(""))}
        className={cn(inputClass, "mt-1 min-h-0 font-mono text-sm")}
      />
      <div className="mt-1 flex items-center gap-3">
        <Button
          variant="secondary"
          className="min-h-9 px-3 py-1 text-sm"
          onClick={() => {
            try {
              const parsed = JSON.parse(text) as unknown;
              const problem = validate?.(parsed);
              if (problem) return setError(problem);
              onApply(parsed as T);
              setError("");
            } catch (e) {
              setError(e instanceof Error ? `Invalid JSON: ${e.message}` : "Invalid JSON");
            }
          }}
        >
          Apply
        </Button>
        {error ? (
          <span role="alert" className="text-sm text-ay-bad">
            {error}
          </span>
        ) : (
          <span className="text-xs text-ay-slate">Apply, then Save to publish.</span>
        )}
      </div>
    </div>
  );
}

export function toCsv(rows: Array<Record<string, unknown>>): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]!);
  const esc = (v: unknown) => {
    const s = Array.isArray(v) ? v.join("; ") : String(v ?? "");
    // Neutralise spreadsheet formula injection.
    const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
    return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join(
    "\n",
  );
}

export function downloadCsv(name: string, rows: Array<Record<string, unknown>>) {
  const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export const today = () => new Date().toISOString().slice(0, 10);
