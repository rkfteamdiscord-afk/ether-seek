import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { euros, eurosRound, monthLabel, shortMonthLabel } from "@/lib/equimarge/format";
import type { MonthKey } from "@/lib/equimarge/types";

interface Point {
  month: MonthKey;
  revenue: number;
  expenses: number;
}

const series = [
  { key: "revenue", label: "Recettes", color: "var(--em-revenue)" },
  { key: "expenses", label: "Dépenses", color: "var(--em-expense)" },
] as const;

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: Point }>;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;
  const margin = point.revenue - point.expenses;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-sm shadow-lg">
      <p className="font-semibold capitalize">{monthLabel(point.month)}</p>
      {series.map((s) => (
        <p key={s.key} className="mt-1 flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ background: s.color }}
            aria-hidden="true"
          />
          {s.label} : <span className="font-semibold tabular-nums">{euros(point[s.key])}</span>
        </p>
      ))}
      <p className="mt-1 border-t border-border pt-1">
        {margin >= 0 ? "Il reste" : "Il manque"}{" "}
        <span className="font-semibold tabular-nums">{euros(Math.abs(margin))}</span>
      </p>
    </div>
  );
}

export function MonthlyChart({ data }: { data: Point[] }) {
  const [asTable, setAsTable] = useState(false);
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <ul className="flex gap-4 text-sm" aria-label="Légende">
          {series.map((s) => (
            <li key={s.key} className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-sm"
                style={{ background: s.color }}
                aria-hidden="true"
              />
              {s.label}
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="min-h-10 rounded-full px-3 text-sm font-semibold text-primary hover:bg-secondary"
          onClick={() => setAsTable((v) => !v)}
          aria-pressed={asTable}
        >
          {asTable ? "Voir le graphique" : "Voir en tableau"}
        </button>
      </div>
      {asTable ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[0.95rem]">
            <thead className="text-muted-foreground">
              <tr>
                <th className="py-2 pr-3 font-semibold">Mois</th>
                <th className="py-2 pr-3 text-right font-semibold">Recettes</th>
                <th className="py-2 pr-3 text-right font-semibold">Dépenses</th>
                <th className="py-2 text-right font-semibold">Résultat</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.month} className="border-t border-border">
                  <td className="py-2 pr-3 capitalize">{monthLabel(d.month)}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{eurosRound(d.revenue)}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{eurosRound(d.expenses)}</td>
                  <td className="py-2 text-right font-semibold tabular-nums">
                    {eurosRound(d.revenue - d.expenses)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          className="h-64 w-full sm:h-72"
          role="img"
          aria-label="Recettes et dépenses des six derniers mois"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              barGap={2}
              barCategoryGap="22%"
              margin={{ top: 8, right: 4, left: 4, bottom: 0 }}
            >
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="0" />
              <XAxis
                dataKey="month"
                tickFormatter={shortMonthLabel}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
                tick={{ fill: "var(--muted-foreground)", fontSize: 13 }}
              />
              <YAxis
                width={56}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${Math.round(v / 100) / 10} k€` : `${v} €`
                }
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.6 }} />
              {series.map((s) => (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.label}
                  fill={s.color}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
