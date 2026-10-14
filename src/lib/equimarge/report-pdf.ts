import { activityResults, alertsFor, horseCosts, monthSummary, recommendations } from "./calc";
import { horseTypes } from "./catalog";
import { eurosRound, monthLabel } from "./format";
import type { MonthKey, Workspace } from "./types";

/** jsPDF's standard fonts only know WinAnsi: swap the few characters outside it. */
function pdfText(value: string) {
  return value
    .replace(/[\u202f\u00a0]/g, " ")
    .replace(/\u2212/g, "-")
    .replace(/[\u2018\u2019]/g, "'");
}

type RGB = [number, number, number];

const COLORS = {
  ink: [47, 58, 42] as RGB,
  muted: [110, 112, 96] as RGB,
  sage: [86, 112, 74] as RGB,
  sageSoft: [228, 235, 220] as RGB,
  beige: [246, 241, 231] as RGB,
  good: [22, 128, 90] as RGB,
  warn: [190, 120, 30] as RGB,
  bad: [190, 50, 40] as RGB,
};

/** Builds the monthly PDF report and triggers its download in the browser. */
export async function downloadMonthlyReport(workspace: Workspace, month: MonthKey) {
  const { jsPDF } = await import("jspdf/dist/jspdf.es.min.js");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const margin = 16;
  const inner = width - margin * 2;
  let y = 0;

  const summary = monthSummary(workspace, month);
  const results = activityResults(workspace, month);
  const alerts = alertsFor(workspace, month).slice(0, 5);
  const costs = horseCosts(workspace, month).sort((a, b) => b.total - a.total);
  const tips = recommendations(workspace, month);

  const setColor = (c: RGB) => doc.setTextColor(c[0], c[1], c[2]);
  const ensure = (needed: number) => {
    if (y + needed > height - 18) {
      doc.addPage();
      y = margin;
    }
  };
  const paragraph = (text: string, size = 10.5, color = COLORS.ink, indent = 0) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    setColor(color);
    const lines = doc.splitTextToSize(pdfText(text), inner - indent) as string[];
    ensure(lines.length * size * 0.45 + 2);
    doc.text(lines, margin + indent, y);
    y += lines.length * size * 0.45 + 2;
  };
  const heading = (text: string) => {
    // Keep a heading with at least its first rows.
    ensure(26);
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    setColor(COLORS.sage);
    doc.text(pdfText(text), margin, y);
    y += 2;
    doc.setDrawColor(...COLORS.sageSoft);
    doc.setLineWidth(0.6);
    doc.line(margin, y, width - margin, y);
    y += 6;
  };

  // Header band
  doc.setFillColor(...COLORS.beige);
  doc.rect(0, 0, width, 38, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  setColor(COLORS.sage);
  doc.text("EquiMarge", margin, 13);
  doc.setFontSize(20);
  setColor(COLORS.ink);
  doc.text(pdfText(workspace.structure.name), margin, 24);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  setColor(COLORS.muted);
  doc.text(pdfText(`Rapport mensuel · ${monthLabel(month)}`), margin, 32);
  y = 50;

  // Health
  const healthColor =
    summary.health === "vert"
      ? COLORS.good
      : summary.health === "orange"
        ? COLORS.warn
        : COLORS.bad;
  doc.setFillColor(...healthColor);
  doc.circle(margin + 3, y - 1.3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  setColor(COLORS.ink);
  doc.text(`Santé financière : ${summary.health}`, margin + 9, y);
  y += 7;
  paragraph(summary.healthSentence, 11);

  // Key figures
  heading("Les chiffres clés");
  const figures: Array<[string, string]> = [
    ["Recettes", eurosRound(summary.revenue)],
    ["Dépenses", eurosRound(summary.expenses)],
    ["Résultat", eurosRound(summary.margin)],
    ["Coût moyen d'un cheval", eurosRound(summary.averageHorseCost)],
  ];
  const boxWidth = (inner - 9) / 4;
  ensure(24);
  figures.forEach(([label, value], i) => {
    const x = margin + i * (boxWidth + 3);
    doc.setFillColor(...COLORS.beige);
    doc.roundedRect(x, y, boxWidth, 20, 2, 2, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    setColor(COLORS.muted);
    doc.text(pdfText(label), x + 3, y + 6);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    setColor(i === 2 ? (summary.margin >= 0 ? COLORS.good : COLORS.bad) : COLORS.ink);
    doc.text(pdfText(value), x + 3, y + 15);
  });
  y += 27;
  paragraph(
    `${summary.horseCount} chevaux présents. Chaque cheval vous coûte en moyenne ${eurosRound(summary.averageHorseCost)} par mois, tout compris.`,
  );

  // Activities
  heading("Résultat par activité");
  const columns = [margin, margin + 70, margin + 110, margin + 150];
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  setColor(COLORS.muted);
  ["Activité", "Revenus", "Coûts", "Marge"].forEach((t, i) => doc.text(t, columns[i]!, y));
  y += 5;
  for (const r of results) {
    ensure(7);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    setColor(COLORS.ink);
    doc.text(pdfText(r.label), columns[0]!, y);
    doc.text(pdfText(eurosRound(r.revenue)), columns[1]!, y);
    doc.text(pdfText(eurosRound(r.cost)), columns[2]!, y);
    doc.setFont("helvetica", "bold");
    setColor(r.margin >= 0 ? COLORS.good : COLORS.bad);
    doc.text(
      pdfText(`${r.margin >= 0 ? "+" : "-"}${eurosRound(Math.abs(r.margin))}`),
      columns[3]!,
      y,
    );
    y += 6.5;
  }

  // Alerts
  if (alerts.length) {
    heading("Points d'attention");
    for (const alert of alerts) {
      ensure(14);
      doc.setFillColor(...(alert.level === "rouge" ? COLORS.bad : COLORS.warn));
      doc.circle(margin + 1.5, y - 1.2, 1.3, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      setColor(COLORS.ink);
      doc.text(pdfText(alert.title), margin + 5, y);
      y += 5;
      paragraph(alert.message, 10, COLORS.muted, 5);
      y += 1;
    }
  }

  // Recommendations
  heading("3 recommandations");
  tips.forEach((tip, i) => {
    ensure(14);
    doc.setFillColor(...COLORS.sage);
    doc.circle(margin + 3, y - 1.3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(String(i + 1), margin + 3, y, { align: "center" });
    paragraph(tip, 10.5, COLORS.ink, 9);
    y += 1.5;
  });

  // Horse costs
  heading("Coût de chaque cheval");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  setColor(COLORS.muted);
  const hc = [margin, margin + 55, margin + 100, margin + 140];
  ["Cheval", "Type", "Coût du mois", "Rapporte"].forEach((t, i) => doc.text(t, hc[i]!, y));
  y += 5;
  for (const c of costs) {
    ensure(7);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    setColor(COLORS.ink);
    doc.text(pdfText(c.horse.name), hc[0]!, y);
    doc.text(pdfText(horseTypes[c.horse.type].short), hc[1]!, y);
    doc.text(pdfText(eurosRound(c.total)), hc[2]!, y);
    doc.text(c.horse.type === "proprietaire" ? "-" : pdfText(eurosRound(c.income)), hc[3]!, y);
    y += 6;
  }

  // Footer on every page
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    setColor(COLORS.muted);
    doc.text(
      pdfText(
        `EquiMarge · généré le ${new Date().toLocaleDateString("fr-FR")} · page ${p}/${pages}`,
      ),
      margin,
      height - 8,
    );
  }

  const safeName = workspace.structure.name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  doc.save(`rapport-equimarge-${safeName || "structure"}-${month}.pdf`);
}
