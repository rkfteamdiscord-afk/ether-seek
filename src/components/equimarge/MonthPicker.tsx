import { ChevronLeft, ChevronRight } from "lucide-react";

import { useReadyWorkspace } from "@/components/equimarge/WorkspaceProvider";
import { addMonths, currentMonth } from "@/lib/equimarge/calc";
import { monthLabel } from "@/lib/equimarge/format";

/** Month switcher with big arrows, shared by the dashboard, entries and report. */
export function MonthPicker() {
  const { month, setMonth } = useReadyWorkspace();
  const latest = addMonths(currentMonth(), 1);
  return (
    <div
      className="inline-flex items-center rounded-full border border-border bg-card p-1"
      role="group"
      aria-label="Choix du mois"
    >
      <button
        type="button"
        className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-secondary"
        aria-label="Mois précédent"
        onClick={() => setMonth(addMonths(month, -1))}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <span className="min-w-36 text-center font-semibold capitalize" aria-live="polite">
        {monthLabel(month)}
      </span>
      <button
        type="button"
        className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-secondary disabled:opacity-40"
        aria-label="Mois suivant"
        disabled={month >= latest}
        onClick={() => setMonth(addMonths(month, 1))}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
