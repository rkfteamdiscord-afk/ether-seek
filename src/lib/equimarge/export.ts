import { activities, expenseCategories, horseTypes, lessonFormats } from "./catalog";
import type { Workspace } from "./types";

function save(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const stamp = () => new Date().toISOString().slice(0, 10);

/** French spreadsheets expect ";" separators and decimal commas. */
function csvCell(value: string | number | null) {
  if (value === null) return "";
  const text = typeof value === "number" ? String(value).replace(".", ",") : value;
  return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(ws: Workspace) {
  const horseName = (id: string | null) => ws.horses.find((h) => h.id === id)?.name ?? "";
  const rows: Array<Array<string | number | null>> = [
    [
      "Type de ligne",
      "Date",
      "Catégorie / activité",
      "Libellé",
      "Montant (€)",
      "Fréquence",
      "Fin",
      "Cheval",
    ],
    ...ws.expenses.map((e) => [
      "Dépense",
      e.date,
      expenseCategories[e.category].label,
      e.label,
      e.amount,
      e.recurrence === "mensuelle" ? "Chaque mois" : "Ponctuelle",
      e.endDate,
      e.horseId ? horseName(e.horseId) : "Toute l'écurie",
    ]),
    ...ws.revenues.map((r) => [
      "Recette",
      r.date,
      r.kind === "cours" && r.lessonFormat
        ? `${activities.cours.label} – ${lessonFormats[r.lessonFormat]}`
        : activities[r.kind].label,
      r.label,
      r.amount,
      r.recurrence === "mensuelle" ? "Chaque mois" : "Ponctuelle",
      r.endDate,
      "",
    ]),
    ...ws.horses.map((h) => [
      "Cheval",
      h.arrivalDate,
      horseTypes[h.type].label,
      h.name,
      h.type === "pension" ? h.monthlyPrice : null,
      "Pension mensuelle",
      h.departureDate,
      h.name,
    ]),
  ];
  // BOM so Excel opens accents correctly.
  return "﻿" + rows.map((row) => row.map(csvCell).join(";")).join("\r\n");
}

export function downloadCsv(ws: Workspace) {
  save(toCsv(ws), `equimarge-export-${stamp()}.csv`, "text/csv;charset=utf-8");
}

export function downloadJson(ws: Workspace) {
  save(JSON.stringify(ws, null, 2), `equimarge-sauvegarde-${stamp()}.json`, "application/json");
}
