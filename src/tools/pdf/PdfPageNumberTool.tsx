import { useState, useRef } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import {
  Binary,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  Sliders,
  Sparkles
} from 'lucide-react';
import { pdfjsLib } from '../../utils/pdfHelper';

interface PdfPageNumberToolProps {
  onSwitchConverter?: (id: string) => void;
}

export default function PdfPageNumberTool({ onSwitchConverter }: PdfPageNumberToolProps) {
  const [file, setFile] = useState<{
    name: string;
    size: number;
    buffer: ArrayBuffer;
    numPages: number;
  } | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Page numbering settings
  const [numberFormat, setNumberFormat] = useState<string>('Page {n} of {total}');
  const [position, setPosition] = useState<'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left'>('bottom-center');
  const [fontSize, setFontSize] = useState<number>(11);
  const [textColor, setTextColor] = useState<string>('#334155');
  const [startPage, setStartPage] = useState<number>(1); // e.g. start numbering from page 2 (skip cover)
  const [startNumber, setStartNumber] = useState<number>(1);
  const [margin, setMargin] = useState<number>(30); // pt from edge

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePdfUpload = async (uploadedFile: File) => {
    setErrorMsg(null);
    setDownloadUrl(null);
    setPreviewUrl(null);

    if (
      uploadedFile.type !== 'application/pdf' &&
      !uploadedFile.name.toLowerCase().endsWith('.pdf')
    ) {
      setErrorMsg('Please select a valid PDF file.');
      return;
    }

    try {
      const buffer = await uploadedFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
      const pdf = await loadingTask.promise;

      setFile({
        name: uploadedFile.name,
        size: uploadedFile.size,
        buffer,
        numPages: pdf.numPages
      });

      const firstPage = await pdf.getPage(1);
      const viewport = firstPage.getViewport({ scale: 0.8 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // @ts-expect-error pdfjs canvas typing
        await firstPage.render({ canvasContext: ctx, viewport }).promise;
        setPreviewUrl(canvas.toDataURL('image/jpeg', 0.85));
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error parsing PDF document.');
    }
  };

  const hexToRgb = (hex: string) => {
    const cleanHex = hex.replace('#', '');
    const bigint = parseInt(cleanHex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r: r / 255, g: g / 255, b: b / 255 };
  };

  const getLabelForPage = (pageIdx: number, total: number) => {
    const currentNum = startNumber + (pageIdx + 1 - startPage);
    return numberFormat
      .replace('{n}', String(currentNum))
      .replace('{total}', String(total));
  };

  const applyPageNumbers = async () => {
    if (!file) return;

    setErrorMsg(null);
    setIsProcessing(true);
    setDownloadUrl(null);

    try {
      const pdfDoc = await PDFDocument.load(file.buffer);
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const { r, g, b } = hexToRgb(textColor);

      const totalNumberedPages = pages.length - (startPage - 1);

      pages.forEach((page, idx) => {
        const pageNum = idx + 1;
        if (pageNum < startPage) return; // Skip pages before startPage

        const label = getLabelForPage(idx, totalNumberedPages > 0 ? totalNumberedPages : pages.length);
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(label, fontSize);

        let x = 0;
        let y = 0;

        switch (position) {
          case 'bottom-center':
            x = (width - textWidth) / 2;
            y = margin;
            break;
          case 'bottom-right':
            x = width - margin - textWidth;
            y = margin;
            break;
          case 'bottom-left':
            x = margin;
            y = margin;
            break;
          case 'top-center':
            x = (width - textWidth) / 2;
            y = height - margin;
            break;
          case 'top-right':
            x = width - margin - textWidth;
            y = height - margin;
            break;
          case 'top-left':
            x = margin;
            y = height - margin;
            break;
        }

        page.drawText(label, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(r, g, b)
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const outName = file.name.replace(/\.[^/.]+$/, '') + '-numbered.pdf';

      setDownloadUrl(url);
      setDownloadFileName(outName);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error adding page numbers to PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider mb-3">
              <Binary className="w-3.5 h-3.5" />
              Edit PDF
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Add Page Numbers to PDF</h2>
            <p className="text-blue-100 text-sm mt-1 max-w-xl">
              Insert customized pagination into PDF documents with ease. Choose position, typography, numbering format, and cover page exclusions.
            </p>
          </div>

          {onSwitchConverter && (
            <button
              onClick={() => onSwitchConverter('pdf-converter-hub')}
              className="self-start md:self-center px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-xs font-semibold transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              All PDF Converters
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) handlePdfUpload(e.dataTransfer.files[0]);
              }}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-white dark:bg-slate-900 rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition min-h-[300px]"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mb-4">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Select or drop PDF to paginate
              </h3>
              <p className="text-slate-500 text-xs mt-1 max-w-xs">
                Add clean, automated page numbering to reports, theses, proposals, or multi-page documents.
              </p>
              <span className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-xl shadow">
                Browse PDF File
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handlePdfUpload(e.target.files[0])}
              />
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate max-w-md">
                    {file.name}
                  </h4>
                  <p className="text-xs text-slate-500">{file.numPages} pages</p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                >
                  Change File
                </button>
              </div>

              {previewUrl && (
                <div className="flex flex-col items-center justify-center p-4 bg-slate-100 dark:bg-slate-800/40 rounded-2xl">
                  <div className="relative border border-slate-300 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden max-w-sm">
                    <img src={previewUrl} alt="First page preview" className="w-full h-auto block select-none" />

                    {/* Live overlay showing position */}
                    <div
                      className={`absolute px-2 py-0.5 font-mono text-[11px] font-bold rounded ${
                        position.includes('top') ? 'top-4' : 'bottom-4'
                      } ${
                        position.includes('center')
                          ? 'left-1/2 -translate-x-1/2'
                          : position.includes('right')
                          ? 'right-4'
                          : 'left-4'
                      }`}
                      style={{ color: textColor, backgroundColor: 'rgba(255,255,255,0.7)' }}
                    >
                      {getLabelForPage(0, file.numPages)}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">Live pagination position preview</p>
                </div>
              )}

              {downloadUrl && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-emerald-900 dark:text-emerald-100">Page Numbers Added!</p>
                      <p className="text-[11px] text-emerald-700">{downloadFileName}</p>
                    </div>
                  </div>
                  <a
                    href={downloadUrl}
                    download={downloadFileName}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Numbered PDF
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Sliders className="w-4 h-4 text-blue-500" />
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Pagination Settings</h4>
          </div>

          {/* Numbering Format */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Format</label>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {[
                { label: 'Page {n} of {total}', val: 'Page {n} of {total}' },
                { label: '{n} / {total}', val: '{n} / {total}' },
                { label: 'Page {n}', val: 'Page {n}' },
                { label: '- {n} -', val: '- {n} -' },
                { label: '{n}', val: '{n}' }
              ].map((fmt) => (
                <button
                  key={fmt.val}
                  type="button"
                  onClick={() => setNumberFormat(fmt.val)}
                  className={`py-1.5 px-2.5 rounded-lg border text-left font-mono text-[11px] transition ${
                    numberFormat === fmt.val
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 font-semibold'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Position Grid */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Position on Page</label>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {[
                { id: 'top-left', label: 'Top Left' },
                { id: 'top-center', label: 'Top Center' },
                { id: 'top-right', label: 'Top Right' },
                { id: 'bottom-left', label: 'Bottom Left' },
                { id: 'bottom-center', label: 'Bottom Center' },
                { id: 'bottom-right', label: 'Bottom Right' }
              ].map((pos) => (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => setPosition(pos.id as any)}
                  className={`py-2 px-1 text-center rounded-lg border text-[11px] font-medium transition ${
                    position === pos.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 font-semibold'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          {/* Skip First Pages (Cover Page) */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Start from page</label>
              <input
                type="number"
                min="1"
                max={file ? file.numPages : 100}
                value={startPage}
                onChange={(e) => setStartPage(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
              <p className="text-[10px] text-slate-400">Set 2 to skip cover</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">First number</label>
              <input
                type="number"
                min="1"
                value={startNumber}
                onChange={(e) => setStartNumber(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
              <p className="text-[10px] text-slate-400">Initial count index</p>
            </div>
          </div>

          {/* Typography */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Font Size ({fontSize}pt)</label>
              <input
                type="range"
                min="8"
                max="24"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Margin ({margin}pt)</label>
              <input
                type="range"
                min="15"
                max="80"
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
          </div>

          <button
            onClick={applyPageNumbers}
            disabled={!file || isProcessing}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Numbering Pages...
              </>
            ) : (
              <>
                <Binary className="w-4 h-4" />
                Add Page Numbers
              </>
            )}
          </button>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
