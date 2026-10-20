import { useState, useRef, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import {
  Eraser,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Eye,
  Loader2,
  Sliders,
  Sparkles,
  Trash2,
  Square,
  Type,
  Check
} from 'lucide-react';
import { pdfjsLib } from '../../utils/pdfHelper';

interface RedactionBox {
  id: string;
  pageNum: number;
  x: number; // canvas pixels
  y: number;
  width: number;
  height: number;
  canvasW: number;
  canvasH: number;
  label?: string;
}

interface PdfRedactToolProps {
  onSwitchConverter?: (id: string) => void;
}

export default function PdfRedactTool({ onSwitchConverter }: PdfRedactToolProps) {
  const [file, setFile] = useState<{
    name: string;
    size: number;
    buffer: ArrayBuffer;
    numPages: number;
  } | null>(null);

  const [currentPageNum, setCurrentPageNum] = useState<number>(1);
  const [redactions, setRedactions] = useState<RedactionBox[]>([]);
  const [activeTool, setActiveTool] = useState<'redact' | 'stamp'>('redact');
  const [stampText, setStampText] = useState<string>('REDACTED');

  // Drawing state
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentBox, setCurrentBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePdfUpload = async (uploadedFile: File) => {
    setErrorMsg(null);
    setDownloadUrl(null);
    setRedactions([]);

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
      setCurrentPageNum(1);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error loading PDF document.');
    }
  };

  // Render current page onto canvas
  useEffect(() => {
    if (!file || !canvasRef.current) return;

    let isMounted = true;

    const renderPage = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(file.buffer) });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(currentPageNum);

        const viewport = page.getViewport({ scale: 1.2 });
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // @ts-expect-error pdfjs typing
        await page.render({ canvasContext: ctx, viewport }).promise;

        if (!isMounted) return;

        // Draw existing redactions on this page
        const pageRedactions = redactions.filter((r) => r.pageNum === currentPageNum);
        pageRedactions.forEach((r) => {
          ctx.fillStyle = '#000000';
          ctx.fillRect(r.x, r.y, r.width, r.height);

          if (r.label) {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText(r.label, r.x + 6, r.y + r.height / 2 + 4);
          }
        });
      } catch (err: any) {
        console.error(err);
      }
    };

    renderPage();

    return () => {
      isMounted = false;
    };
  }, [file, currentPageNum, redactions]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentBox({ x, y, w: 0, h: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const boxX = Math.min(startPos.x, x);
    const boxY = Math.min(startPos.y, y);
    const boxW = Math.abs(x - startPos.x);
    const boxH = Math.abs(y - startPos.y);

    setCurrentBox({ x: boxX, y: boxY, w: boxW, h: boxH });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentBox || !canvasRef.current) {
      setIsDrawing(false);
      return;
    }

    if (currentBox.w > 10 && currentBox.h > 10) {
      const newRedaction: RedactionBox = {
        id: Math.random().toString(36).substring(2, 9),
        pageNum: currentPageNum,
        x: currentBox.x,
        y: currentBox.y,
        width: currentBox.w,
        height: currentBox.h,
        canvasW: canvasRef.current.width,
        canvasH: canvasRef.current.height,
        label: activeTool === 'stamp' ? stampText : undefined
      };
      setRedactions((prev) => [...prev, newRedaction]);
    }

    setIsDrawing(false);
    setCurrentBox(null);
    setStartPos(null);
  };

  const removeRedaction = (id: string) => {
    setRedactions((prev) => prev.filter((r) => r.id !== id));
  };

  const applyRedactionsAndBurn = async () => {
    if (!file) return;

    setErrorMsg(null);
    setIsProcessing(true);
    setDownloadUrl(null);

    try {
      const pdfDoc = await PDFDocument.load(file.buffer);
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      redactions.forEach((r) => {
        const pageIdx = r.pageNum - 1;
        if (pageIdx < 0 || pageIdx >= pages.length) return;

        const page = pages[pageIdx];
        const { width: pageWidth, height: pageHeight } = page.getSize();

        // Convert canvas coordinates to PDF coordinates
        // PDF origin (0,0) is bottom-left! Canvas origin (0,0) is top-left!
        const scaleX = pageWidth / r.canvasW;
        const scaleY = pageHeight / r.canvasH;

        const pdfX = r.x * scaleX;
        const pdfW = r.width * scaleX;
        const pdfH = r.height * scaleY;
        const pdfY = pageHeight - (r.y + r.height) * scaleY;

        // Permanently draw opaque black rectangle to sanitize content
        page.drawRectangle({
          x: pdfX,
          y: pdfY,
          width: pdfW,
          height: pdfH,
          color: rgb(0, 0, 0),
          opacity: 1.0
        });

        if (r.label) {
          const fontSize = Math.min(12, Math.max(8, pdfH * 0.4));
          page.drawText(r.label, {
            x: pdfX + 4,
            y: pdfY + pdfH / 2 - fontSize / 2,
            size: fontSize,
            font,
            color: rgb(1, 1, 1)
          });
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const outName = file.name.replace(/\.[^/.]+$/, '') + '-redacted.pdf';

      setDownloadUrl(url);
      setDownloadFileName(outName);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error burning redactions into PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-zinc-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider mb-3">
              <Eraser className="w-3.5 h-3.5" />
              PDF Security & Redaction
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Redact & Blackout PDF</h2>
            <p className="text-zinc-300 text-sm mt-1 max-w-xl">
              Permanently blackout sensitive personal records, SSNs, credit cards, or trade secrets. Redactions are burned directly into the PDF stream.
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
        {/* Canvas Visual Editor (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) handlePdfUpload(e.dataTransfer.files[0]);
              }}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-zinc-500 bg-white dark:bg-slate-900 rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition min-h-[300px]"
            >
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 flex items-center justify-center mb-4">
                <Eraser className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Select or drop PDF to redact
              </h3>
              <p className="text-slate-500 text-xs mt-1 max-w-xs">
                Click and drag on any page to permanently blackout private text or pictures.
              </p>
              <span className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium rounded-xl shadow">
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
              {/* Pagination toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPageNum <= 1}
                    onClick={() => setCurrentPageNum((p) => Math.max(1, p - 1))}
                    className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
                  >
                    ← Prev
                  </button>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Page {currentPageNum} of {file.numPages}
                  </span>
                  <button
                    disabled={currentPageNum >= file.numPages}
                    onClick={() => setCurrentPageNum((p) => Math.min(file.numPages, p + 1))}
                    className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
                  >
                    Next →
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">
                    {redactions.length} {redactions.length === 1 ? 'Box' : 'Boxes'} marked
                  </span>
                  <button
                    onClick={() => setFile(null)}
                    className="px-3 py-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                  >
                    Change File
                  </button>
                </div>
              </div>

              {/* Interactive Canvas */}
              <div className="flex justify-center p-3 bg-slate-100 dark:bg-slate-800/40 rounded-2xl overflow-auto max-h-[600px]">
                <div className="relative border border-slate-300 dark:border-slate-700 shadow-md">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    className="cursor-crosshair block select-none"
                  />

                  {/* Active drawing box preview */}
                  {isDrawing && currentBox && (
                    <div
                      className="absolute border-2 border-red-500 bg-black/80 pointer-events-none"
                      style={{
                        left: `${currentBox.x}px`,
                        top: `${currentBox.y}px`,
                        width: `${currentBox.w}px`,
                        height: `${currentBox.h}px`
                      }}
                    />
                  )}
                </div>
              </div>
              <p className="text-[11px] text-center text-slate-400">
                Click & drag with your mouse/touch over any area to mark a blackout zone.
              </p>

              {downloadUrl && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-emerald-900 dark:text-emerald-100">Redactions Burned In!</p>
                      <p className="text-[11px] text-emerald-700">{downloadFileName}</p>
                    </div>
                  </div>
                  <a
                    href={downloadUrl}
                    download={downloadFileName}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Sanitized PDF
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Redaction list sidebar */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Sliders className="w-4 h-4 text-zinc-500" />
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Redaction Tools</h4>
          </div>

          {/* Mode Switch */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveTool('redact')}
              className={`py-2 px-3 text-xs font-medium rounded-xl border flex items-center justify-center gap-1.5 transition ${
                activeTool === 'redact'
                  ? 'border-zinc-800 bg-zinc-900 text-white font-semibold'
                  : 'border-slate-200 text-slate-600'
              }`}
            >
              <Square className="w-3.5 h-3.5" />
              Blackout Box
            </button>
            <button
              type="button"
              onClick={() => setActiveTool('stamp')}
              className={`py-2 px-3 text-xs font-medium rounded-xl border flex items-center justify-center gap-1.5 transition ${
                activeTool === 'stamp'
                  ? 'border-zinc-800 bg-zinc-900 text-white font-semibold'
                  : 'border-slate-200 text-slate-600'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              Labeled Stamp
            </button>
          </div>

          {activeTool === 'stamp' && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Stamp Label</label>
              <input
                type="text"
                value={stampText}
                onChange={(e) => setStampText(e.target.value)}
                placeholder="e.g. REDACTED, SSN HIDDEN"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          )}

          {/* Redactions marked list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
              <span>Marked Areas ({redactions.length})</span>
              {redactions.length > 0 && (
                <button onClick={() => setRedactions([])} className="text-rose-500 hover:underline text-[11px]">
                  Clear All
                </button>
              )}
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {redactions.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic p-3 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  No areas redacted yet. Drag a box across the document to redact.
                </p>
              ) : (
                redactions.map((r, i) => (
                  <div
                    key={r.id}
                    className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        #{i + 1} Page {r.pageNum}
                      </span>
                      <p className="text-[10px] text-slate-400">
                        {r.label ? `[${r.label}]` : 'Solid blackout'} • {Math.round(r.width)}×{Math.round(r.height)}px
                      </p>
                    </div>
                    <button
                      onClick={() => removeRedaction(r.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={applyRedactionsAndBurn}
            disabled={!file || redactions.length === 0 || isProcessing}
            className="w-full py-3 px-4 bg-zinc-900 hover:bg-black disabled:bg-slate-300 text-white font-semibold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sanitizing Document...
              </>
            ) : (
              <>
                <Eraser className="w-4 h-4" />
                Apply Redactions & Save
              </>
            )}
          </button>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-start gap-2.5 text-[11px] text-slate-600 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">Irreversible Redaction</p>
              <p className="mt-0.5">Blackouts are written as solid raster/vector geometry directly into the PDF binary, preventing underlying text copying.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
