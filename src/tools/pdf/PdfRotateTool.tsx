import { useState, useRef } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import {
  RotateCw,
  RotateCcw,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Eye,
  Loader2,
  Layers,
  Sparkles
} from 'lucide-react';
import { pdfjsLib } from '../../utils/pdfHelper';

interface PageThumbnail {
  pageNumber: number;
  dataUrl: string;
  originalRotation: number;
  currentRotation: number; // 0, 90, 180, 270
}

interface PdfRotateToolProps {
  onSwitchConverter?: (id: string) => void;
}

export default function PdfRotateTool({ onSwitchConverter }: PdfRotateToolProps) {
  const [file, setFile] = useState<{
    name: string;
    size: number;
    buffer: ArrayBuffer;
    numPages: number;
  } | null>(null);

  const [pages, setPages] = useState<PageThumbnail[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [outputFileName, setOutputFileName] = useState<string>('rotated-document.pdf');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFileUpload = async (uploadedFile: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);
    setPages([]);

    if (
      uploadedFile.type !== 'application/pdf' &&
      !uploadedFile.name.toLowerCase().endsWith('.pdf')
    ) {
      setErrorMsg('Please select a valid PDF document (.pdf).');
      setIsLoading(false);
      return;
    }

    try {
      const buffer = await uploadedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
      const pdfLibDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

      const loadedPages: PageThumbnail[] = [];

      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const pdfLibPage = pdfLibDoc.getPage(p - 1);
        const existingRot = pdfLibPage.getRotation().angle || 0;

        // Render low-res preview thumbnail
        const viewport = page.getViewport({ scale: 0.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: ctx, viewport } as any).promise;
        }

        loadedPages.push({
          pageNumber: p,
          dataUrl: canvas.toDataURL('image/jpeg', 0.8),
          originalRotation: existingRot,
          currentRotation: existingRot
        });
      }

      setFile({
        name: uploadedFile.name,
        size: uploadedFile.size,
        buffer,
        numPages: pdf.numPages
      });
      setPages(loadedPages);
      const cleanName = uploadedFile.name.replace(/\.[^/.]+$/, '');
      setOutputFileName(`${cleanName}-rotated.pdf`);
      setSuccessMsg(`Loaded "${uploadedFile.name}" (${pdf.numPages} pages). Rotate individual pages or all pages below.`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Could not read this PDF. It may be password-protected or corrupted.');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const rotateSinglePage = (pageNumber: number, delta: number) => {
    setPages(prev =>
      prev.map(p => {
        if (p.pageNumber === pageNumber) {
          const nextRot = (p.currentRotation + delta + 360) % 360;
          return { ...p, currentRotation: nextRot };
        }
        return p;
      })
    );
  };

  const rotateAllPages = (delta: number) => {
    setPages(prev =>
      prev.map(p => ({
        ...p,
        currentRotation: (p.currentRotation + delta + 360) % 360
      }))
    );
  };

  const resetAllRotations = () => {
    setPages(prev =>
      prev.map(p => ({
        ...p,
        currentRotation: p.originalRotation
      }))
    );
  };

  const handleSaveRotatedPdf = async () => {
    if (!file) return;
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const pdfDoc = await PDFDocument.load(file.buffer, { ignoreEncryption: true });

      pages.forEach((p, idx) => {
        const page = pdfDoc.getPage(idx);
        page.setRotation(degrees(p.currentRotation));
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = outputFileName.endsWith('.pdf') ? outputFileName : `${outputFileName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setSuccessMsg(`Rotated PDF successfully saved and downloaded!`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to save rotated PDF.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-xl border border-purple-100 dark:border-purple-900/40">
              <RotateCw className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Rotate PDF Pages
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 rounded-full">
                  Visual Page Control
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Rotate PDF pages 90°, 180°, or 270° clockwise or counter-clockwise. Modify individual pages or apply bulk rotation across all pages.
              </p>
            </div>
          </div>

          {file && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => rotateAllPages(90)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
              >
                <RotateCw className="w-3.5 h-3.5" />
                Rotate All Right (90°)
              </button>
              <button
                type="button"
                onClick={() => rotateAllPages(-90)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Rotate All Left (90°)
              </button>
              <button
                type="button"
                onClick={resetAllRotations}
                className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upload Zone */}
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
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-400 bg-white dark:bg-slate-900/60 rounded-2xl p-10 text-center cursor-pointer transition group shadow-xs"
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
          <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition">
            {isLoading ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : (
              <Upload className="w-7 h-7" />
            )}
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-800 dark:text-slate-100">
            Upload PDF to Rotate Pages
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Drag & drop your document or browse. All thumbnail rendering and page transformations happen locally in your browser.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* File summary & Save bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-md">
                {file.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatFileSize(file.size)} • {file.numPages} Page{file.numPages > 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input
                type="text"
                value={outputFileName}
                onChange={(e) => setOutputFileName(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-48"
              />
              <button
                type="button"
                onClick={handleSaveRotatedPdf}
                disabled={isSaving}
                className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 active:bg-purple-700 disabled:opacity-50 rounded-xl shadow-md transition flex items-center gap-2 shrink-0"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    Download PDF
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Pages Grid */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Page Visual Inspector ({pages.length} Pages)
              </h3>
              <span className="text-xs text-slate-400">
                Click rotate buttons on each page to turn individually
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[550px] overflow-y-auto pr-1">
              {pages.map((p) => {
                const rotationDelta = (p.currentRotation - p.originalRotation + 360) % 360;
                return (
                  <div
                    key={p.pageNumber}
                    className="group bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 flex flex-col justify-between hover:border-purple-400 dark:hover:border-purple-500 transition shadow-xs"
                  >
                    <div className="relative aspect-[3/4] bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center p-2">
                      <img
                        src={p.dataUrl}
                        alt={`Page ${p.pageNumber}`}
                        className="max-w-full max-h-full object-contain transition-transform duration-200"
                        style={{ transform: `rotate(${rotationDelta}deg)` }}
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-semibold">
                        {p.pageNumber}
                      </span>
                      {p.currentRotation !== 0 && (
                        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-purple-600 text-white text-[10px] font-bold">
                          {p.currentRotation}°
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/50">
                      <button
                        type="button"
                        onClick={() => rotateSinglePage(p.pageNumber, -90)}
                        title="Rotate Left 90°"
                        className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <span className="text-[11px] font-medium text-slate-500">
                        {p.currentRotation}°
                      </span>
                      <button
                        type="button"
                        onClick={() => rotateSinglePage(p.pageNumber, 90)}
                        title="Rotate Right 90°"
                        className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
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

      {/* Privacy guarantee */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
        <ShieldCheck className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-200">Private In-Browser Processing</p>
          <p className="mt-0.5 leading-relaxed">
            Page rotation adjusts internal PDF transformation matrices directly inside your browser memory. No pages are uploaded or cached externally.
          </p>
        </div>
      </div>
    </div>
  );
}
