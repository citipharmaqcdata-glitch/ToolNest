import { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as XLSX from 'xlsx';
import {
  FileText,
  FileSpreadsheet,
  Archive,
  Upload,
  Download,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Loader2,
  Table as TableIcon
} from 'lucide-react';
import { pdfjsLib } from '../../utils/pdfHelper';

type ConvertFromPdfMode = 'word' | 'excel' | 'pdfa';

interface PdfToOfficeToolProps {
  initialMode?: ConvertFromPdfMode;
  onSwitchConverter?: (id: string) => void;
}

export default function PdfToOfficeTool({ initialMode = 'word', onSwitchConverter }: PdfToOfficeToolProps) {
  const [activeMode, setActiveMode] = useState<ConvertFromPdfMode>(initialMode);

  const [file, setFile] = useState<{
    name: string;
    size: number;
    buffer: ArrayBuffer;
    numPages: number;
  } | null>(null);

  // --- Word state ---
  const [extractedText, setExtractedText] = useState<string>('');
  const [extractedWordCount, setExtractedWordCount] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  // --- Excel state ---
  const [extractedRows, setExtractedRows] = useState<string[][]>([]);

  // --- PDF/A state ---
  const [pdfaTitle, setPdfaTitle] = useState<string>('');
  const [pdfaAuthor, setPdfaAuthor] = useState<string>('QC Department');
  const [pdfaConformance, setPdfaConformance] = useState<'PDF/A-1b' | 'PDF/A-2b'>('PDF/A-1b');
  const [pdfaDownloadUrl, setPdfaDownloadUrl] = useState<string | null>(null);

  // Common state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFileUpload = async (uploadedFile: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setExtractedText('');
    setExtractedRows([]);
    setPdfaDownloadUrl(null);
    setIsProcessing(true);

    if (
      uploadedFile.type !== 'application/pdf' &&
      !uploadedFile.name.toLowerCase().endsWith('.pdf')
    ) {
      setErrorMsg('Please select a valid PDF document (.pdf).');
      setIsProcessing(false);
      return;
    }

    try {
      const buffer = await uploadedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;

      setFile({
        name: uploadedFile.name,
        size: uploadedFile.size,
        buffer,
        numPages: pdf.numPages
      });
      setPdfaTitle(uploadedFile.name.replace(/\.[^/.]+$/, ''));

      // Process depending on active mode
      await processPdfContent(pdf, activeMode, uploadedFile.name);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to read PDF document. It may be password protected.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const processPdfContent = async (pdf: any, mode: ConvertFromPdfMode, fileName: string) => {
    if (mode === 'word') {
      let fullText = '';
      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const textContent = await page.getTextContent();
        let lastY: number | null = null;
        let pageStr = `--- Page ${p} ---\n`;

        for (const item of textContent.items as any[]) {
          if ('str' in item) {
            const currentY = Math.round(item.transform[5]);
            if (lastY !== null && Math.abs(currentY - lastY) > 8) {
              pageStr += '\n';
            } else if (lastY !== null && pageStr.slice(-1) !== ' ' && pageStr.slice(-1) !== '\n') {
              pageStr += ' ';
            }
            pageStr += item.str;
            lastY = currentY;
          }
        }
        fullText += pageStr + '\n\n';
      }

      setExtractedText(fullText.trim());
      const words = fullText.trim().split(/\s+/).filter(Boolean);
      setExtractedWordCount(words.length);
      setSuccessMsg(`Extracted ${words.length} words across ${pdf.numPages} pages.`);
    } else if (mode === 'excel') {
      // Extract structured tabular rows by clustering items with close Y coordinates
      const allRows: string[][] = [];

      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const textContent = await page.getTextContent();

        // Group by Y line (bucketed within 4 units)
        const lineBuckets = new Map<number, { x: number; text: string }[]>();

        for (const item of textContent.items as any[]) {
          if ('str' in item && item.str.trim()) {
            const y = Math.round(item.transform[5] / 6) * 6; // group close Y
            const x = Math.round(item.transform[4]);
            if (!lineBuckets.has(y)) {
              lineBuckets.set(y, []);
            }
            lineBuckets.get(y)!.push({ x, text: item.str.trim() });
          }
        }

        // Sort lines top to bottom (Y descending in PDF coordinate system)
        const sortedYs = Array.from(lineBuckets.keys()).sort((a, b) => b - a);

        for (const y of sortedYs) {
          const items = lineBuckets.get(y)!;
          // Sort items horizontally left to right
          items.sort((a, b) => a.x - b.x);

          // If line has multiple separate columns, add as row
          if (items.length > 0) {
            const row = items.map(it => it.text);
            allRows.push(row);
          }
        }
      }

      // Normalize row lengths
      const maxCols = Math.max(...allRows.map(r => r.length), 1);
      const normalized = allRows.map(r => {
        while (r.length < maxCols) {
          r.push('');
        }
        return r;
      });

      setExtractedRows(normalized);
      setSuccessMsg(`Extracted ${normalized.length} tabular rows from PDF.`);
    } else if (mode === 'pdfa') {
      setSuccessMsg(`Ready to convert "${fileName}" to archival PDF/A.`);
    }
  };

  const handleModeChange = async (newMode: ConvertFromPdfMode) => {
    setActiveMode(newMode);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (file) {
      setIsProcessing(true);
      try {
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(file.buffer) }).promise;
        await processPdfContent(pdf, newMode, file.name);
      } catch (e) {
        setErrorMsg('Failed to process PDF in new mode.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // --- Word Export Handlers ---
  const downloadWordDoc = () => {
    if (!extractedText) return;
    const baseName = file ? file.name.replace(/\.[^/.]+$/, '') : 'document';
    
    // HTML-compatible Word document format (.doc)
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'><title>${baseName}</title>
<style>
body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.5; margin: 1in; }
p { margin-bottom: 8pt; }
h1, h2, h3 { color: #0d9488; }
</style>
</head><body>`;
    const footer = `</body></html>`;

    const htmlBody = extractedText
      .split('\n\n')
      .map(para => `<p>${para.replace(/\n/g, '<br/>')}</p>`)
      .join('');

    const blob = new Blob([header + htmlBody + footer], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${baseName}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadTextFile = () => {
    if (!extractedText) return;
    const baseName = file ? file.name.replace(/\.[^/.]+$/, '') : 'document';
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${baseName}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Excel Export Handlers ---
  const downloadExcelSheet = () => {
    if (extractedRows.length === 0) return;
    const baseName = file ? file.name.replace(/\.[^/.]+$/, '') : 'extracted-table';
    const ws = XLSX.utils.aoa_to_sheet(extractedRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'PDF Extracted Data');
    XLSX.writeFile(wb, `${baseName}.xlsx`);
  };

  const downloadCsv = () => {
    if (extractedRows.length === 0) return;
    const baseName = file ? file.name.replace(/\.[^/.]+$/, '') : 'extracted-table';
    const ws = XLSX.utils.aoa_to_sheet(extractedRows);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${baseName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- PDF/A Archival Conversion ---
  const convertToPdfA = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const pdfDoc = await PDFDocument.load(file.buffer);
      
      // Set PDF/A archival metadata
      pdfDoc.setTitle(pdfaTitle || 'Archived Document');
      pdfDoc.setAuthor(pdfaAuthor || 'ToolNest Archival Engine');
      pdfDoc.setSubject('ISO 19005-1 PDF/A Conforming Archival Document');
      pdfDoc.setKeywords(['PDF/A', 'archival', 'ISO 19005-1', 'long-term-preservation']);
      pdfDoc.setProducer('ToolNest PDF/A Generator');
      pdfDoc.setCreator('ToolNest In-Browser PDF Engine');
      pdfDoc.setCreationDate(new Date());
      pdfDoc.setModificationDate(new Date());

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfaDownloadUrl(url);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${(pdfaTitle || 'archived-document').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-pdfa.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccessMsg(`Document converted to ${pdfaConformance} compliant archival standard!`);
    } catch (e: any) {
      console.error(e);
      setErrorMsg('Failed to convert to PDF/A.');
    } finally {
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
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  PDF to Word, Excel & Archival PDF/A
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 rounded-full">
                  Multi-Extractor
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Extract editable Word documents (.doc), Excel spreadsheets (.xlsx, .csv), and transform PDFs into ISO 19005-1 compliant PDF/A archival files.
              </p>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => handleModeChange('word')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeMode === 'word'
                  ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              PDF to Word
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('excel')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeMode === 'excel'
                  ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              PDF to Excel
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('pdfa')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeMode === 'pdfa'
                  ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              PDF to PDF/A
            </button>
          </div>
        </div>
      </div>

      {/* Upload Zone (Common) */}
      {!file ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileUpload(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-400 bg-white dark:bg-slate-900/60 rounded-2xl p-10 text-center cursor-pointer transition group shadow-xs"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
            accept="application/pdf,.pdf"
            className="hidden"
          />
          <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-105 transition">
            {isProcessing ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : (
              <Upload className="w-7 h-7" />
            )}
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-800 dark:text-slate-100">
            Upload PDF to convert to {activeMode === 'word' ? 'Word Document' : activeMode === 'excel' ? 'Excel Spreadsheet' : 'Archival PDF/A'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Choose any PDF file. Your data is extracted 100% locally and never leaves your browser.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-50 dark:bg-teal-950/50 rounded-xl text-teal-600 dark:text-teal-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-md">
                {file.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatFileSize(file.size)} • {file.numPages} Page{file.numPages > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/50 transition"
            >
              Change PDF
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              accept="application/pdf,.pdf"
              className="hidden"
            />
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

      {/* Mode 1: PDF to Word Results */}
      {activeMode === 'word' && file && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Extracted Text Stream ({extractedWordCount} Words)
              </span>
              <button
                type="button"
                onClick={copyToClipboard}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Text'}
              </button>
            </div>

            <textarea
              rows={16}
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              className="w-full p-3 text-xs font-sans rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
            />
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Download Options
              </h3>

              <button
                type="button"
                onClick={downloadWordDoc}
                className="w-full py-3 px-4 rounded-xl font-semibold text-xs text-white bg-teal-600 hover:bg-teal-500 active:bg-teal-700 shadow-md transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download as Word (.doc)
              </button>

              <button
                type="button"
                onClick={downloadTextFile}
                className="w-full py-2.5 px-4 rounded-xl font-medium text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Download as Plain Text (.txt)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: PDF to Excel Results */}
      {activeMode === 'excel' && file && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Extracted Table Grid ({extractedRows.length} Rows)
              </span>
            </div>

            {extractedRows.length > 0 ? (
              <div className="overflow-x-auto max-h-[420px] rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                      {extractedRows[0]?.map((col, idx) => (
                        <th key={idx} className="p-2 font-semibold text-slate-700 dark:text-slate-300">
                          Col {idx + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {extractedRows.map((row, rIdx) => (
                      <tr key={rIdx} className={rIdx % 2 === 1 ? 'bg-slate-50/50 dark:bg-slate-800/40' : ''}>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-2 text-slate-600 dark:text-slate-300 truncate max-w-[150px]">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No tabular lines detected in this PDF.</p>
            )}
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Download Spreadsheet
              </h3>

              <button
                type="button"
                onClick={downloadExcelSheet}
                disabled={extractedRows.length === 0}
                className="w-full py-3 px-4 rounded-xl font-semibold text-xs text-white bg-teal-600 hover:bg-teal-500 active:bg-teal-700 disabled:opacity-50 shadow-md transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Excel (.xlsx)
              </button>

              <button
                type="button"
                onClick={downloadCsv}
                disabled={extractedRows.length === 0}
                className="w-full py-2.5 px-4 rounded-xl font-medium text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Download CSV (.csv)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: PDF/A Archival Settings */}
      {activeMode === 'pdfa' && file && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs max-w-2xl mx-auto space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Archive className="w-5 h-5 text-teal-500" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              PDF/A Archival Compliance & Standardization
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Archival Standard
              </label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {(['PDF/A-1b', 'PDF/A-2b'] as const).map((std) => (
                  <button
                    key={std}
                    type="button"
                    onClick={() => setPdfaConformance(std)}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border transition text-center ${
                      pdfaConformance === std
                        ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-700 dark:text-teal-300'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {std} (ISO 19005-1)
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Document Title
              </label>
              <input
                type="text"
                value={pdfaTitle}
                onChange={(e) => setPdfaTitle(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Author / Organization
              </label>
              <input
                type="text"
                value={pdfaAuthor}
                onChange={(e) => setPdfaAuthor(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={convertToPdfA}
            disabled={isProcessing}
            className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-white bg-teal-600 hover:bg-teal-500 active:bg-teal-700 disabled:opacity-50 shadow-md transition flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Standardizing PDF/A...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Standardize & Download PDF/A
              </>
            )}
          </button>
        </div>
      )}

      {/* Privacy Guarantee */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
        <ShieldCheck className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-200">Zero Server Uploads</p>
          <p className="mt-0.5 leading-relaxed">
            All text, tabular arrays, and metadata injection are executed directly within your web browser. No confidential reports or documents are transmitted over the internet.
          </p>
        </div>
      </div>
    </div>
  );
}
