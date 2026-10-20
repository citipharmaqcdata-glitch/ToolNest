import { useState, useRef } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as XLSX from 'xlsx';
import {
  FileText,
  FileSpreadsheet,
  Code2,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Settings2,
  Eye,
  Loader2,
  Layers,
  Table as TableIcon
} from 'lucide-react';

type OfficeMode = 'word' | 'excel' | 'html';

interface OfficeToPdfToolProps {
  initialMode?: OfficeMode;
  onSwitchConverter?: (id: string) => void;
}

export default function OfficeToPdfTool({ initialMode = 'word', onSwitchConverter }: OfficeToPdfToolProps) {
  const [activeMode, setActiveMode] = useState<OfficeMode>(initialMode);

  // --- Word to PDF State ---
  const [docTitle, setDocTitle] = useState('Quality Control Analytical Report');
  const [docContent, setDocContent] = useState(
    `# 1. Executive Summary\nThis document provides an overview of batch testing, analytical potency, and finished product verification adhering to current pharmacopoeial monographs.\n\n# 2. Materials & Methods\nTesting was conducted using calibrated instruments under ISO 17025 accredited procedures. High Performance Liquid Chromatography (HPLC) was operated with standard reverse-phase C18 columns.\n\n# 3. Acceptance Criteria\n- Assay Potency: 98.0% - 102.0% of label claim\n- Impurities / Related Substances: Not more than 0.5%\n- Moisture Content: Less than 1.0%\n\n# 4. Results & Conclusion\nAll release criteria have been met with zero non-conformances observed. Release approved by QA.`
  );
  const [docFont, setDocFont] = useState<'Helvetica' | 'Times' | 'Courier'>('Helvetica');
  const [docFontSize, setDocFontSize] = useState<number>(11);

  // --- Excel to PDF State ---
  const [excelData, setExcelData] = useState<any[][]>([
    ['Sample ID', 'Assay (% Potency)', 'Dissolution (45 min)', 'Moisture (KF %)', 'Status'],
    ['LOT-2026-A101', '99.8%', '96.4%', '0.42%', 'Pass'],
    ['LOT-2026-A102', '100.2%', '97.1%', '0.38%', 'Pass'],
    ['LOT-2026-A103', '99.4%', '95.8%', '0.45%', 'Pass'],
    ['LOT-2026-A104', '101.1%', '98.0%', '0.36%', 'Pass'],
    ['LOT-2026-A105', '98.9%', '96.9%', '0.40%', 'Pass']
  ]);
  const [excelFileName, setExcelFileName] = useState('analytical-batch-log.xlsx');
  const [sheetNames, setSheetNames] = useState<string[]>(['Sheet1']);
  const [currentSheet, setCurrentSheet] = useState<string>('Sheet1');
  const [excelOrientation, setExcelOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [excelZebra, setExcelZebra] = useState<boolean>(true);

  // --- HTML to PDF State ---
  const [htmlTemplate, setHtmlTemplate] = useState<'invoice' | 'lab' | 'letter'>('lab');
  const [htmlCode, setHtmlCode] = useState<string>(`<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 24px; color: #1e293b; line-height: 1.5; }
    .header { border-bottom: 2px solid #0d9488; padding-bottom: 12px; margin-bottom: 20px; }
    .title { font-size: 22px; font-weight: bold; color: #0f766e; }
    .subtitle { font-size: 13px; color: #64748b; }
    .badge { display: inline-block; padding: 4px 10px; background: #ccfbf1; color: #0f766e; border-radius: 9999px; font-weight: bold; font-size: 11px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th { background: #f1f5f9; text-align: left; padding: 8px 12px; font-size: 12px; border: 1px solid #cbd5e1; }
    td { padding: 8px 12px; font-size: 12px; border: 1px solid #e2e8f0; }
    .footer { margin-top: 30px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">Certificate of Analysis (CoA)</div>
    <div class="subtitle">Pharmaceutical Quality Assurance & Release Specification</div>
  </div>
  <p><strong>Compound:</strong> Paracetamol Active Pharmaceutical Ingredient (API)</p>
  <p><strong>Batch:</strong> PAC-2026-9921 | <strong>Mfg Date:</strong> October 2026</p>
  <table>
    <thead>
      <tr><th>Parameter</th><th>Specification</th><th>Observed Value</th><th>Compliance</th></tr>
    </thead>
    <tbody>
      <tr><td>Assay Potency</td><td>98.0% - 102.0%</td><td>100.1%</td><td><span class="badge">CONFORMS</span></td></tr>
      <tr><td>Loss on Drying</td><td>&le; 0.5%</td><td>0.18%</td><td><span class="badge">CONFORMS</span></td></tr>
      <tr><td>Heavy Metals</td><td>&le; 10 ppm</td><td>&lt; 5 ppm</td><td><span class="badge">CONFORMS</span></td></tr>
      <tr><td>USP Melting Point</td><td>168°C - 172°C</td><td>169.5°C</td><td><span class="badge">CONFORMS</span></td></tr>
    </tbody>
  </table>
  <div class="footer">Confidential Analytical QC Record • Stamped & Validated Client-Side</div>
</body>
</html>`);

  // General state
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const wordFileRef = useRef<HTMLInputElement>(null);
  const excelFileRef = useRef<HTMLInputElement>(null);
  const htmlPreviewIframeRef = useRef<HTMLIFrameElement>(null);

  // --- Handlers for Word ---
  const handleWordFileUpload = async (file: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const text = await file.text();
      setDocTitle(file.name.replace(/\.[^/.]+$/, ''));
      setDocContent(text);
      setSuccessMsg(`Imported text from "${file.name}".`);
    } catch (e) {
      setErrorMsg('Could not read text from this file. You can paste the content directly.');
    }
  };

  const generateWordPdf = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const pdfDoc = await PDFDocument.create();
      let fontRef = await pdfDoc.embedFont(StandardFonts.Helvetica);
      let boldFontRef = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      if (docFont === 'Times') {
        fontRef = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        boldFontRef = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
      } else if (docFont === 'Courier') {
        fontRef = await pdfDoc.embedFont(StandardFonts.Courier);
        boldFontRef = await pdfDoc.embedFont(StandardFonts.CourierBold);
      }

      const pageWidth = 595.28; // A4
      const pageHeight = 841.89;
      const margin = 45;
      const printableWidth = pageWidth - margin * 2;

      let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      let currentY = pageHeight - margin;

      // Header: Document Title
      currentPage.drawText(docTitle, {
        x: margin,
        y: currentY,
        size: 16,
        font: boldFontRef,
        color: rgb(0.06, 0.46, 0.43) // teal
      });
      currentY -= 28;

      // Draw header divider line
      currentPage.drawLine({
        start: { x: margin, y: currentY + 10 },
        end: { x: pageWidth - margin, y: currentY + 10 },
        thickness: 1,
        color: rgb(0.8, 0.85, 0.85)
      });

      // Split lines
      const rawLines = docContent.split('\n');

      for (const line of rawLines) {
        if (currentY < margin + 40) {
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          currentY = pageHeight - margin;
        }

        const trimmed = line.trim();
        if (!trimmed) {
          currentY -= 8;
          continue;
        }

        const isHeading = trimmed.startsWith('#');
        const headingText = isHeading ? trimmed.replace(/^#+\s*/, '') : trimmed;
        const font = isHeading ? boldFontRef : fontRef;
        const size = isHeading ? docFontSize + 3 : docFontSize;
        const textColor = isHeading ? rgb(0.1, 0.15, 0.2) : rgb(0.2, 0.25, 0.3);

        // Word wrap long line
        const words = headingText.split(' ');
        let curLine = '';

        for (const word of words) {
          const testLine = curLine ? `${curLine} ${word}` : word;
          const textWidth = font.widthOfTextAtSize(testLine, size);

          if (textWidth > printableWidth && curLine) {
            currentPage.drawText(curLine, {
              x: margin + (trimmed.startsWith('-') || trimmed.startsWith('•') ? 10 : 0),
              y: currentY,
              size,
              font,
              color: textColor
            });
            currentY -= size + 5;
            curLine = word;

            if (currentY < margin + 40) {
              currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
              currentY = pageHeight - margin;
            }
          } else {
            curLine = testLine;
          }
        }

        if (curLine) {
          currentPage.drawText(curLine, {
            x: margin + (trimmed.startsWith('-') || trimmed.startsWith('•') ? 10 : 0),
            y: currentY,
            size,
            font,
            color: textColor
          });
          currentY -= size + 6;
        }
      }

      // Add page numbers
      const totalPages = pdfDoc.getPageCount();
      for (let i = 0; i < totalPages; i++) {
        const p = pdfDoc.getPage(i);
        p.drawText(`Page ${i + 1} of ${totalPages}`, {
          x: pageWidth / 2 - 25,
          y: margin / 2,
          size: 9,
          font: fontRef,
          color: rgb(0.5, 0.5, 0.5)
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${docTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setSuccessMsg(`Word Document converted to PDF (${totalPages} pages)!`);
    } catch (e: any) {
      console.error(e);
      setErrorMsg('Failed to generate PDF from Word document.');
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Handlers for Excel ---
  const handleExcelFileUpload = async (file: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      setSheetNames(wb.SheetNames);
      setCurrentSheet(wb.SheetNames[0] || 'Sheet1');
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
      setExcelData(rows.filter(r => r.length > 0));
      setExcelFileName(file.name);
      setSuccessMsg(`Loaded "${file.name}" with ${rows.length} rows.`);
    } catch (e) {
      setErrorMsg('Could not parse Excel spreadsheet file.');
    }
  };

  const generateExcelPdf = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const isLandscape = excelOrientation === 'landscape';
      const pageWidth = isLandscape ? 841.89 : 595.28;
      const pageHeight = isLandscape ? 595.28 : 841.89;
      const margin = 36;
      const printableWidth = pageWidth - margin * 2;

      let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      let currentY = pageHeight - margin;

      // Title
      currentPage.drawText(excelFileName.replace(/\.[^/.]+$/, ''), {
        x: margin,
        y: currentY,
        size: 14,
        font: boldFont,
        color: rgb(0.06, 0.46, 0.43)
      });
      currentY -= 24;

      if (excelData.length === 0) {
        throw new Error('No table data to render.');
      }

      const colCount = Math.max(...excelData.map(r => r.length));
      const colWidth = Math.max(40, printableWidth / Math.max(1, colCount));
      const rowHeight = 20;

      for (let rIdx = 0; rIdx < excelData.length; rIdx++) {
        if (currentY < margin + rowHeight) {
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          currentY = pageHeight - margin;
        }

        const isHeader = rIdx === 0;
        const row = excelData[rIdx] || [];

        // Row background
        if (isHeader) {
          currentPage.drawRectangle({
            x: margin,
            y: currentY - 5,
            width: printableWidth,
            height: rowHeight,
            color: rgb(0.85, 0.94, 0.93)
          });
        } else if (excelZebra && rIdx % 2 === 0) {
          currentPage.drawRectangle({
            x: margin,
            y: currentY - 5,
            width: printableWidth,
            height: rowHeight,
            color: rgb(0.97, 0.98, 0.99)
          });
        }

        // Draw cells
        for (let cIdx = 0; cIdx < colCount; cIdx++) {
          const val = row[cIdx] !== undefined ? String(row[cIdx]) : '';
          const x = margin + cIdx * colWidth + 6;
          const y = currentY;

          currentPage.drawText(val.slice(0, 24), {
            x,
            y,
            size: isHeader ? 9 : 8,
            font: isHeader ? boldFont : font,
            color: isHeader ? rgb(0.06, 0.35, 0.33) : rgb(0.2, 0.25, 0.3)
          });
        }

        // Row border
        currentPage.drawLine({
          start: { x: margin, y: currentY - 5 },
          end: { x: margin + printableWidth, y: currentY - 5 },
          thickness: 0.5,
          color: rgb(0.8, 0.85, 0.88)
        });

        currentY -= rowHeight;
      }

      // Add page numbers
      const totalPages = pdfDoc.getPageCount();
      for (let i = 0; i < totalPages; i++) {
        const p = pdfDoc.getPage(i);
        p.drawText(`Page ${i + 1} of ${totalPages}`, {
          x: pageWidth / 2 - 20,
          y: margin / 2,
          size: 8,
          font,
          color: rgb(0.5, 0.5, 0.5)
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${excelFileName.replace(/\.[^/.]+$/, '')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setSuccessMsg(`Excel Spreadsheet converted to PDF (${totalPages} pages)!`);
    } catch (e: any) {
      console.error(e);
      setErrorMsg('Failed to convert Excel to PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Handlers for HTML to PDF ---
  const handleHtmlTemplateChange = (tmpl: 'invoice' | 'lab' | 'letter') => {
    setHtmlTemplate(tmpl);
    if (tmpl === 'lab') {
      setHtmlCode(`<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; padding: 24px; color: #1e293b; }
    .header { border-bottom: 2px solid #0d9488; padding-bottom: 12px; }
    .title { font-size: 20px; font-weight: bold; color: #0f766e; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px; font-size: 12px; }
    th { background: #f8fafc; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">Certificate of Analysis (CoA)</div>
    <p>Pharmaceutical Quality Testing Specification</p>
  </div>
  <table>
    <tr><th>Test</th><th>Specification</th><th>Result</th><th>Status</th></tr>
    <tr><td>HPLC Assay</td><td>98.0% - 102.0%</td><td>100.2%</td><td>PASS</td></tr>
    <tr><td>Moisture (KF)</td><td>&le; 0.5%</td><td>0.21%</td><td>PASS</td></tr>
  </table>
</body>
</html>`);
    } else if (tmpl === 'invoice') {
      setHtmlCode(`<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; padding: 24px; color: #0f172a; }
    .inv-header { display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; }
    .total { font-size: 18px; font-weight: bold; color: #0d9488; text-align: right; margin-top: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th, td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
    th { background: #f1f5f9; text-align: left; }
  </style>
</head>
<body>
  <div class="inv-header">
    <h2>INVOICE #INV-2026-089</h2>
    <p>Date: October 19, 2026</p>
  </div>
  <p><strong>Billed To:</strong> Quality Laboratories Inc.</p>
  <table>
    <tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
    <tr><td>HPLC Analytical Column C18</td><td>2</td><td>$450.00</td><td>$900.00</td></tr>
    <tr><td>Buffer Salts & Reagents Kit</td><td>5</td><td>$85.00</td><td>$425.00</td></tr>
  </table>
  <div class="total">Grand Total: $1,325.00</div>
</body>
</html>`);
    } else {
      setHtmlCode(`<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Georgia, serif; padding: 40px; color: #1e293b; line-height: 1.6; }
    .header { margin-bottom: 30px; }
    .sig { margin-top: 50px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h3>Pharmaceutical Regulatory Affairs</h3>
    <p>Date: October 19, 2026</p>
  </div>
  <p>Dear Regulatory Director,</p>
  <p>We hereby submit the comprehensive analytical dossier and validation reports for the upcoming manufacturing campaign. All analytical methods have undergone full validation in accordance with ICH Q2(R1) guidelines.</p>
  <div class="sig">
    <p>Respectfully submitted,</p>
    <p>Head of Quality Compliance</p>
  </div>
</body>
</html>`);
    }
  };

  const generateHtmlPdf = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      // Use hidden iframe printing or convert via canvas
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '794px';
      iframe.style.height = '1123px';
      iframe.style.border = 'none';
      iframe.style.zIndex = '-9999';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (!doc) throw new Error('Could not access iframe document');

      doc.open();
      doc.write(htmlCode);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
          setIsProcessing(false);
          setSuccessMsg('PDF Print dialogue opened! Choose "Save as PDF".');
        }, 1000);
      }, 500);
    } catch (e: any) {
      console.error(e);
      setErrorMsg('Failed to initialize HTML print engine.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 rounded-xl border border-teal-100 dark:border-teal-900/40">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Word, Excel & HTML to PDF Converter
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 rounded-full">
                  3-in-1 Suite
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Convert Word documents (.docx, .txt), Excel spreadsheets (.xlsx, .csv), and HTML code into clean, publication-ready vector PDF files.
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setActiveMode('word')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeMode === 'word'
                  ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Word to PDF
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('excel')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeMode === 'excel'
                  ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Excel to PDF
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('html')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeMode === 'html'
                  ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              HTML to PDF
            </button>
          </div>
        </div>
      </div>

      {/* Mode 1: Word to PDF */}
      {activeMode === 'word' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-500" />
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Document Editor & Markdown Input
                </h3>
              </div>
              <button
                type="button"
                onClick={() => wordFileRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/50 transition"
              >
                <Upload className="w-3.5 h-3.5" />
                Import File
              </button>
              <input
                type="file"
                ref={wordFileRef}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleWordFileUpload(e.target.files[0]);
                  }
                }}
                accept=".txt,.doc,.docx,.md"
                className="hidden"
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Document Title
                </label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Body Content (supports headings starting with #, lists with -)
                </label>
                <textarea
                  rows={14}
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  className="w-full mt-1 p-3 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Typography & Formatting
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Font Family
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Helvetica', 'Times', 'Courier'].map((font) => (
                    <button
                      key={font}
                      type="button"
                      onClick={() => setDocFont(font as any)}
                      className={`py-2 px-2 text-xs font-medium rounded-xl border transition text-center ${
                        docFont === font
                          ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-700 dark:text-teal-300'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Body Font Size ({docFontSize}pt)
                </label>
                <input
                  type="range"
                  min="9"
                  max="14"
                  step="1"
                  value={docFontSize}
                  onChange={(e) => setDocFontSize(parseInt(e.target.value, 10))}
                  className="w-full accent-teal-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={generateWordPdf}
                disabled={isProcessing}
                className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-white bg-teal-600 hover:bg-teal-500 active:bg-teal-700 shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Convert Word to PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Excel to PDF */}
      {activeMode === 'excel' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-teal-500" />
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Spreadsheet Preview ({excelData.length} Rows)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => excelFileRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/50 transition"
              >
                <Upload className="w-3.5 h-3.5" />
                Import .xlsx / .csv
              </button>
              <input
                type="file"
                ref={excelFileRef}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleExcelFileUpload(e.target.files[0]);
                  }
                }}
                accept=".xlsx,.xls,.csv"
                className="hidden"
              />
            </div>

            {/* Table Grid */}
            <div className="overflow-x-auto max-h-[420px] rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    {excelData[0]?.map((col, idx) => (
                      <th key={idx} className="p-2.5 font-semibold text-slate-700 dark:text-slate-300">
                        {String(col)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {excelData.slice(1).map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className={excelZebra && rIdx % 2 === 1 ? 'bg-slate-50/50 dark:bg-slate-800/40' : ''}
                    >
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-2.5 text-slate-600 dark:text-slate-300">
                          {String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                PDF Table Formatting
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Page Layout
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setExcelOrientation('landscape')}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border transition text-center ${
                      excelOrientation === 'landscape'
                        ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-700 dark:text-teal-300'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Landscape (Wide)
                  </button>
                  <button
                    type="button"
                    onClick={() => setExcelOrientation('portrait')}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border transition text-center ${
                      excelOrientation === 'portrait'
                        ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-700 dark:text-teal-300'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Portrait (Tall)
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Zebra Striped Rows
                </span>
                <input
                  type="checkbox"
                  checked={excelZebra}
                  onChange={(e) => setExcelZebra(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
              </div>

              <button
                type="button"
                onClick={generateExcelPdf}
                disabled={isProcessing}
                className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-white bg-teal-600 hover:bg-teal-500 active:bg-teal-700 shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Convert Excel to PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: HTML to PDF */}
      {activeMode === 'html' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-teal-500" />
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  HTML & CSS Editor
                </h3>
              </div>
              <div className="flex items-center gap-1">
                {(['lab', 'invoice', 'letter'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleHtmlTemplateChange(t)}
                    className={`px-2 py-1 text-[11px] font-medium rounded-lg capitalize transition ${
                      htmlTemplate === t
                        ? 'bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={16}
              value={htmlCode}
              onChange={(e) => setHtmlCode(e.target.value)}
              className="w-full p-3 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
            />
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Live Preview
                </h3>
                <span className="text-[11px] text-slate-400">Rendered sandbox</span>
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white h-[320px]">
                <iframe
                  ref={htmlPreviewIframeRef}
                  title="HTML Preview"
                  srcDoc={htmlCode}
                  className="w-full h-full border-none"
                  sandbox="allow-same-origin"
                />
              </div>

              <button
                type="button"
                onClick={generateHtmlPdf}
                disabled={isProcessing}
                className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-white bg-teal-600 hover:bg-teal-500 active:bg-teal-700 shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Preparing PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Convert HTML to PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {errorMsg && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-sm rounded-xl border border-rose-200 dark:border-rose-900/50">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-sm rounded-xl border border-emerald-200 dark:border-emerald-900/50">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Privacy Guarantee card */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
        <ShieldCheck className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-200">100% Client-Side Conversion</p>
          <p className="mt-0.5 leading-relaxed">
            All documents, spreadsheets, and HTML markup are parsed and compiled into PDF vector streams strictly within your browser.
          </p>
        </div>
      </div>
    </div>
  );
}
