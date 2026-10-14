// jsPDF only exports "node" and "browser" builds; the edge server build resolves
// neither, so the report loads the browser bundle by path (see report-pdf.ts).
declare module "jspdf/dist/jspdf.es.min.js" {
  export * from "jspdf";
}
