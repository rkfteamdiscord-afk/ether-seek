import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatUsd, formatUsdCompact, waterfallBars, type WaterfallStep } from "../../engine";
import { prefersReducedMotion } from "../motion";

const TAX_KEYS = new Set(["localTax", "federal", "state"]);

function colorFor(step: WaterfallStep) {
  if (step.kind !== "deduction") return step.value >= 0 ? "#12284b" : "#a3261b";
  if (TAX_KEYS.has(step.key)) return "#b5623c";
  if (step.key === "debt") return "#5b6b85";
  return "#c9a66b";
}

/**
 * Waterfall from gross rent to after-tax income (and cash flow when financed). Bars float on an
 * invisible base; every bar carries a signed dollar label, and an accessible table repeats the
 * values so meaning never depends on colour or hover.
 */
export function Waterfall({ steps, title }: { steps: WaterfallStep[]; title: string }) {
  // Bars grow in on first render, never when the visitor prefers reduced motion.
  // After the first draw, simulator changes update instantly.
  const [animate, setAnimate] = useState(() => !prefersReducedMotion());
  useEffect(() => {
    const id = window.setTimeout(() => setAnimate(false), 1200);
    return () => window.clearTimeout(id);
  }, []);
  const bars = waterfallBars(steps).map((bar) => ({
    ...bar,
    color: colorFor(bar),
    name: stepLabel(bar),
    label: shortMoney(bar.kind === "deduction" ? -Math.abs(bar.value) : bar.value),
  }));
  return (
    <figure>
      <figcaption className="sr-only">{title}</figcaption>
      <div className="h-[400px] w-full" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={bars} margin={{ top: 24, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid vertical={false} stroke="#eef0f4" />
            <XAxis
              dataKey="name"
              interval={0}
              angle={-38}
              textAnchor="end"
              height={92}
              tick={{ fill: "#4a5568", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "#dfe3ea" }}
            />
            <YAxis
              tickFormatter={formatUsdCompact}
              width={64}
              tick={{ fill: "#4a5568", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgb(18 40 75 / 0.05)" }}
              content={({ active, payload }) => {
                const item = payload?.[0]?.payload as (typeof bars)[number] | undefined;
                if (!active || !item) return null;
                return (
                  <div className="rounded-lg border border-ay-line bg-white px-3 py-2 text-sm shadow-lg">
                    <p className="font-semibold text-ay-ink">{stepLabel(item)}</p>
                    <p className="tabular-nums text-ay-slate">
                      {item.kind === "deduction"
                        ? `−${formatUsd(Math.abs(item.value))}`
                        : formatUsd(item.value)}
                    </p>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="base"
              stackId="w"
              fill="transparent"
              isAnimationActive={animate}
              animationDuration={900}
              animationEasing="ease-out"
            >
              {bars.map((bar) => (
                <Cell key={bar.key} fill="transparent" />
              ))}
            </Bar>
            <Bar
              dataKey="height"
              stackId="w"
              radius={[4, 4, 0, 0]}
              isAnimationActive={animate}
              animationDuration={900}
              animationEasing="ease-out"
            >
              {bars.map((bar) => (
                <Cell key={bar.key} fill={bar.color} />
              ))}
              <LabelList
                dataKey="label"
                position="top"
                style={{ fill: "#0b1b33", fontSize: 11, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-4 flex flex-wrap gap-4 text-sm text-ay-slate" aria-hidden>
        <Legend color="#12284b" label="Income and totals" />
        <Legend color="#c9a66b" label="Running costs" />
        <Legend color="#b5623c" label="Taxes" />
        <Legend color="#5b6b85" label="Mortgage" />
      </ul>
      <details className="mt-4">
        <summary className="min-h-11 py-2 font-semibold text-ay-navy-2 underline underline-offset-4">
          Show the numbers as a table
        </summary>
        <WaterfallTable steps={steps} />
      </details>
    </figure>
  );
}

function stepLabel(step: WaterfallStep) {
  return step.label.replace(" (after credit)", "");
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span className="inline-block size-3 rounded-sm" style={{ background: color }} />
      {label}
    </li>
  );
}

export function WaterfallTable({ steps }: { steps: WaterfallStep[] }) {
  return (
    <table className="mt-2 w-full text-left text-[0.98rem]">
      <caption className="sr-only">Annual returns step by step, in US dollars</caption>
      <thead>
        <tr className="border-b border-ay-line text-sm text-ay-slate">
          <th scope="col" className="py-2 font-semibold">
            Step
          </th>
          <th scope="col" className="py-2 text-right font-semibold">
            Per year
          </th>
        </tr>
      </thead>
      <tbody>
        {steps.map((step) => (
          <tr
            key={step.key}
            className={
              step.kind === "deduction"
                ? "border-b border-ay-line/60"
                : "border-b border-ay-line bg-ay-mist font-semibold"
            }
          >
            <th scope="row" className="py-2 pr-4 font-[inherit]">
              {step.kind === "deduction" ? "− " : step.kind === "start" ? "" : "= "}
              {step.label}
            </th>
            <td className="py-2 text-right tabular-nums">
              {step.kind === "deduction"
                ? `−${formatUsd(Math.abs(step.value))}`
                : formatUsd(step.value)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** "$13.1K", "$240", "−$1.2K"; rounds to whole dollars below $1,000 and drops the sign on zero. */
function shortMoney(value: number) {
  if (Math.round(Math.abs(value)) === 0) return "$0";
  const abs =
    Math.abs(value) < 1000 ? formatUsd(Math.abs(value)) : formatUsdCompact(Math.abs(value));
  return value < 0 ? `−${abs}` : abs;
}
