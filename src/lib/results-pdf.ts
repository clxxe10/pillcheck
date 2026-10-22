import { jsPDF } from "jspdf";

export type PdfWarning = {
  label: string;
  title: string;
  body: string;
  source: string;
};

export type PdfMedicine = {
  name: string;
  ingredient: string;
  dose: string;
  times: string;
  days: string;
  clinic: string;
  estimated: string;
};

export type PdfSlot = {
  label: string;
  time: string;
  items: { name: string; dose: string }[];
};

export type ResultsPdfDocument = {
  dateLabel: string;
  warningsTitle: string;
  medicinesTitle: string;
  scheduleTitle: string;
  none: string;
  disclaimer: string;
  warnings: PdfWarning[];
  medicines: PdfMedicine[];
  slots: PdfSlot[];
};

const FONT_FILE = "Pretendard-Subset.ttf";
const FONT_NAME = "Pretendard";

/** Local calendar date, so the file matches the day on the results page. */
export function pdfFilename(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `pillcheck-${date.getFullYear()}-${month}-${day}.pdf`;
}

export function buildShareText(input: { medicines: string[]; warnings: string[]; disclaimer: string }) {
  const medicines = input.medicines.filter(Boolean).join("\n");
  const warnings = input.warnings.filter(Boolean).join("\n\n");
  return [medicines, warnings, input.disclaimer].filter(Boolean).join("\n\n");
}

let fontRequest: Promise<Uint8Array> | null = null;

/** Fetched once, only when a PDF is actually created. */
export function loadPdfFont() {
  if (!fontRequest) {
    fontRequest = fetch("/fonts/Pretendard-Subset.ttf")
      .then(async (response) => {
        if (!response.ok) throw new Error("font");
        return new Uint8Array(await response.arrayBuffer());
      })
      .catch((error: unknown) => {
        fontRequest = null;
        throw error;
      });
  }
  return fontRequest;
}

function bytesToBase64(bytes: Uint8Array) {
  const chunk = 0x4000;
  let binary = "";
  for (let index = 0; index < bytes.length; index += chunk) {
    const slice = bytes.subarray(index, index + chunk);
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary);
}

export function createResultsPdf(font: Uint8Array, document: ResultsPdfDocument) {
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  doc.addFileToVFS(FONT_FILE, bytesToBase64(font));
  doc.addFont(FONT_FILE, FONT_NAME, "normal");
  doc.setFont(FONT_NAME, "normal");

  const margin = 16;
  const contentWidth = 210 - margin * 2;
  let y = 20;

  function useFont(size: number, color: string) {
    doc.setFont(FONT_NAME, "normal");
    doc.setFontSize(size);
    const value = Number.parseInt(color.slice(1), 16);
    doc.setTextColor((value >> 16) & 255, (value >> 8) & 255, value & 255);
  }

  function ensure(height: number) {
    if (y + height <= 284) return;
    doc.addPage();
    doc.setFont(FONT_NAME, "normal");
    y = 18;
  }

  function write(text: string, size: number, color: string, gap = 1.4) {
    useFont(size, color);
    const lines = doc.splitTextToSize(text, contentWidth) as string[];
    const lineHeight = size * 0.42;
    ensure(lines.length * lineHeight);
    doc.text(lines, margin, y);
    y += lines.length * lineHeight + gap;
  }

  function heading(text: string) {
    y += 2.5;
    ensure(8);
    doc.setDrawColor(212, 255, 79);
    doc.setLineWidth(1);
    doc.line(margin, y - 4.2, margin + 16, y - 4.2);
    write(text, 13, "#111111", 2);
  }

  doc.setFillColor(212, 255, 79);
  doc.roundedRect(margin, y - 6.2, 8.5, 8.5, 2, 2, "F");
  doc.setFillColor(17, 17, 17);
  doc.ellipse(margin + 4.25, y - 1.95, 2.3, 1.25, "F");
  useFont(18, "#111111");
  doc.text("PillCheck", margin + 12, y);
  y += 6;
  write(document.dateLabel, 11, "#6B6B72", 2);

  heading(document.warningsTitle);
  if (document.warnings.length === 0) {
    write(document.none, 11, "#4A4A50");
  }
  for (const warning of document.warnings) {
    write(warning.label, 10, "#A05A00", 0.6);
    write(warning.title, 12, "#111111", 0.8);
    write(warning.body, 10.5, "#4A4A50", 0.6);
    write(warning.source, 9.5, "#6B6B72", 2.4);
  }

  heading(document.medicinesTitle);
  for (const medicine of document.medicines) {
    write(medicine.name, 12, "#111111", 0.8);
    write(medicine.ingredient, 10.5, "#4A4A50", 0.4);
    write(`${medicine.dose} · ${medicine.times} · ${medicine.days}`, 10.5, "#111111", 0.4);
    write(medicine.clinic, 10, "#6B6B72", medicine.estimated ? 0.3 : 2.2);
    if (medicine.estimated) write(medicine.estimated, 9.5, "#6B6B72", 2.2);
  }

  heading(document.scheduleTitle);
  if (document.slots.length === 0) write(document.none, 11, "#4A4A50");
  for (const slot of document.slots) {
    write(`${slot.label} · ${slot.time}`, 11, "#111111", 0.6);
    for (const item of slot.items) write(`${item.name} · ${item.dose}`, 10.5, "#4A4A50", 0.4);
    y += 1.4;
  }

  y += 2;
  write(document.disclaimer, 9.5, "#6B6B72", 0);

  return new Uint8Array(doc.output("arraybuffer"));
}

function pdfBlob(bytes: Uint8Array) {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Blob([copy], { type: "application/pdf" });
}

export function downloadPdf(bytes: Uint8Array, filename: string) {
  const blob = pdfBlob(bytes);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function pdfFile(bytes: Uint8Array, filename: string) {
  return new File([pdfBlob(bytes)], filename, { type: "application/pdf" });
}
