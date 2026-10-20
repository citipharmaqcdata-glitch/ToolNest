import { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import {
  Crop,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Eye,
  Loader2,
  Sliders,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { pdfjsLib } from '../../utils/pdfHelper';

interface PdfCropToolProps {
  onSwitchConverter?: (id: string) => void;
}

export default function PdfCropTool({ onSwitchConverter }: PdfCropToolProps) {
  const [file, setFile] = useState<{
    name: string;
    size: number;
    buffer: ArrayBuffer;
    numPages: number;
  } | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pageWidth, setPageWidth] = useState<number>(595);
  const [pageHeight, setPageHeight] = useState<number>(842);

  // Margins in points (1 inch = 72 pt, 1 cm = 28.35 pt)
  const [marginTop, setMarginTop] = useState<number>(20);
  const [marginBottom, setMarginBottom] = useState<number>(20);
  const [marginLeft, setMarginLeft] = useState<number>(20);
  const [marginRight, setMarginRight] = useState<number>(20);

  const [unit, setUnit] = useState<'pt' | 'mm' | 'in'>('pt');
  const [applyToAll, setApplyToAll] = useState<boolean>(true);

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
      setPageWidth(viewport.width);
      setPageHeight(viewport.height);

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
      setErrorMsg(err.message || 'Error reading PDF document.');
    }
  };

  const getPtValue = (val: number): number => {
    if (unit === 'mm') return val * 2.83465;
    if (unit === 'in') return val * 72;
    return val;
  };

  const handleCrop = async () => {
    if (!file) return;

    setErrorMsg(null);
    setIsProcessing(true);
    setDownloadUrl(null);

    try {
      const pdfDoc = await PDFDocument.load(file.buffer);
      const pages = pdfDoc.getPages();

      const topPt = getPtValue(marginTop);
      const bottomPt = getPtValue(marginBottom);
      const leftPt = getPtValue(marginLeft);
      const rightPt = getPtValue(marginRight);

      pages.forEach((page, idx) => {
        if (!applyToAll && idx > 0) return;

        const { width, height } = page.getSize();
        const newX = leftPt;
        const newY = bottomPt;
        const newWidth = Math.max(50, width - leftPt - rightPt);
        const newHeight = Math.max(50, height - topPt - bottomPt);

        // Adjust mediaBox and cropBox in pdf-lib
        page.setCropBox(newX, newY, newWidth, newHeight);
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const outName = file.name.replace(/\.[^/.]+$/, '') + '-cropped.pdf';

      setDownloadUrl(url);
      setDownloadFileName(outName);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error cropping PDF document.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider mb-3">
              <Crop className="w-3.5 h-3.5" />
              Edit PDF
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Crop PDF Margins</h2>
            <p className="text-emerald-100 text-sm mt-1 max-w-xl">
              Trim whitespace, margins, or headers/footers from PDF pages. Preview the crop bounds live and adjust margins in points, millimeters, or inches.
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
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 bg-white dark:bg-slate-900 rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition min-h-[300px]"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mb-4">
                <Crop className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Select or drop PDF to crop
              </h3>
              <p className="text-slate-500 text-xs mt-1 max-w-xs">
                Trim extra blank margins or scanner borders from your PDF documents.
              </p>
              <span className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-xl shadow">
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

              {/* Crop Bounds Visualizer */}
              {previewUrl && (
                <div className="flex flex-col items-center justify-center p-4 bg-slate-100 dark:bg-slate-800/40 rounded-2xl">
                  <div className="relative border border-slate-300 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden max-w-sm">
                    <img src={previewUrl} alt="First page preview" className="w-full h-auto block select-none" />

                    {/* Darkened crop margins overlay */}
                    <div
                      className="absolute top-0 left-0 right-0 bg-black/40 pointer-events-none transition-all"
                      style={{ height: `${(getPtValue(marginTop) / 842) * 100}%` }}
                    />
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-black/40 pointer-events-none transition-all"
                      style={{ height: `${(getPtValue(marginBottom) / 842) * 100}%` }}
                    />
                    <div
                      className="absolute top-0 bottom-0 left-0 bg-black/40 pointer-events-none transition-all"
                      style={{ width: `${(getPtValue(marginLeft) / 595) * 100}%` }}
                    />
                    <div
                      className="absolute top-0 bottom-0 right-0 bg-black/40 pointer-events-none transition-all"
                      style={{ width: `${(getPtValue(marginRight) / 595) * 100}%` }}
                    />

                    {/* Border highlight for kept content */}
                    <div className="absolute inset-0 border-2 border-dashed border-emerald-400 pointer-events-none m-2" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">Darkened edges represent trimmed areas</p>
                </div>
              )}

              {downloadUrl && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-emerald-900 dark:text-emerald-100">PDF Cropped Successfully!</p>
                      <p className="text-[11px] text-emerald-700">{downloadFileName}</p>
                    </div>
                  </div>
                  <a
                    href={downloadUrl}
                    download={downloadFileName}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Cropped PDF
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Sliders className="w-4 h-4 text-emerald-500" />
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Crop Margins</h4>
          </div>

          {/* Unit Toggle */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Measurement Unit</label>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {(['pt', 'mm', 'in'] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className={`py-1.5 rounded-lg border font-mono text-[11px] transition ${
                    unit === u
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 font-semibold'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  {u.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Margin inputs */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Top Margin ({unit})</label>
              <input
                type="number"
                min="0"
                max="200"
                value={marginTop}
                onChange={(e) => setMarginTop(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Bottom Margin ({unit})</label>
              <input
                type="number"
                min="0"
                max="200"
                value={marginBottom}
                onChange={(e) => setMarginBottom(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Left ({unit})</label>
                <input
                  type="number"
                  min="0"
                  max="150"
                  value={marginLeft}
                  onChange={(e) => setMarginLeft(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Right ({unit})</label>
                <input
                  type="number"
                  min="0"
                  max="150"
                  value={marginRight}
                  onChange={(e) => setMarginRight(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={applyToAll}
                onChange={(e) => setApplyToAll(e.target.checked)}
                className="rounded text-emerald-600"
              />
              <span>Apply identical crop to all pages</span>
            </label>
          </div>

          <button
            onClick={handleCrop}
            disabled={!file || isProcessing}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Cropping Document...
              </>
            ) : (
              <>
                <Crop className="w-4 h-4" />
                Crop PDF Pages
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
