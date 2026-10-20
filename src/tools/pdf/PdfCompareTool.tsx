import { useState, useRef } from 'react';
import {
  FileDiff,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Eye,
  Loader2,
  Sliders,
  Sparkles,
  ArrowRight,
  ArrowLeftRight,
  Layers,
  Columns
} from 'lucide-react';
import { pdfjsLib } from '../../utils/pdfHelper';

interface PdfDocInfo {
  name: string;
  size: number;
  buffer: ArrayBuffer;
  numPages: number;
}

interface PdfCompareToolProps {
  onSwitchConverter?: (id: string) => void;
}

export default function PdfCompareTool({ onSwitchConverter }: PdfCompareToolProps) {
  const [docA, setDocA] = useState<PdfDocInfo | null>(null);
  const [docB, setDocB] = useState<PdfDocInfo | null>(null);

  const [activePage, setActivePage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'overlay' | 'text-diff'>('side-by-side');
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.5);

  const [pageThumbA, setPageThumbA] = useState<string | null>(null);
  const [pageThumbB, setPageThumbB] = useState<string | null>(null);

  const [textA, setTextA] = useState<string>('');
  const [textB, setTextB] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputARef = useRef<HTMLInputElement>(null);
  const fileInputBRef = useRef<HTMLInputElement>(null);

  const loadPageContent = async (pageNum: number, currentA = docA, currentB = docB) => {
    if (!currentA || !currentB) return;
    setIsLoading(true);

    try {
      // Document A
      if (pageNum <= currentA.numPages) {
        const loadingTaskA = pdfjsLib.getDocument({ data: new Uint8Array(currentA.buffer) });
        const pdfA = await loadingTaskA.promise;
        const pageA = await pdfA.getPage(pageNum);
        const viewportA = pageA.getViewport({ scale: 1.0 });
        const canvasA = document.createElement('canvas');
        canvasA.width = viewportA.width;
        canvasA.height = viewportA.height;
        const ctxA = canvasA.getContext('2d');
        if (ctxA) {
          // @ts-expect-error pdfjs typing
          await pageA.render({ canvasContext: ctxA, viewport: viewportA }).promise;
          setPageThumbA(canvasA.toDataURL('image/jpeg', 0.9));
        }

        const textContentA = await pageA.getTextContent();
        // @ts-expect-error item str
        const strA = textContentA.items.map((it) => it.str || '').join(' ');
        setTextA(strA);
      } else {
        setPageThumbA(null);
        setTextA('[Page not present in Document A]');
      }

      // Document B
      if (pageNum <= currentB.numPages) {
        const loadingTaskB = pdfjsLib.getDocument({ data: new Uint8Array(currentB.buffer) });
        const pdfB = await loadingTaskB.promise;
        const pageB = await pdfB.getPage(pageNum);
        const viewportB = pageB.getViewport({ scale: 1.0 });
        const canvasB = document.createElement('canvas');
        canvasB.width = viewportB.width;
        canvasB.height = viewportB.height;
        const ctxB = canvasB.getContext('2d');
        if (ctxB) {
          // @ts-expect-error pdfjs typing
          await pageB.render({ canvasContext: ctxB, viewport: viewportB }).promise;
          setPageThumbB(canvasB.toDataURL('image/jpeg', 0.9));
        }

        const textContentB = await pageB.getTextContent();
        // @ts-expect-error item str
        const strB = textContentB.items.map((it) => it.str || '').join(' ');
        setTextB(strB);
      } else {
        setPageThumbB(null);
        setTextB('[Page not present in Document B]');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error comparing document pages.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileLoad = async (uploadedFile: File, target: 'A' | 'B') => {
    setErrorMsg(null);
    try {
      const buffer = await uploadedFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
      const pdf = await loadingTask.promise;

      const docInfo: PdfDocInfo = {
        name: uploadedFile.name,
        size: uploadedFile.size,
        buffer,
        numPages: pdf.numPages
      };

      if (target === 'A') {
        setDocA(docInfo);
        if (docB) loadPageContent(activePage, docInfo, docB);
      } else {
        setDocB(docInfo);
        if (docA) loadPageContent(activePage, docA, docInfo);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to inspect PDF file.');
    }
  };

  const maxPages = Math.max(docA?.numPages || 0, docB?.numPages || 0);

  const changePage = (newPage: number) => {
    setActivePage(newPage);
    loadPageContent(newPage);
  };

  // Simple word-level diff computation
  const renderTextDiff = () => {
    const wordsA = textA.split(/\s+/).filter(Boolean);
    const wordsB = textB.split(/\s+/).filter(Boolean);

    const setB = new Set(wordsB);
    const setA = new Set(wordsA);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60">
          <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center justify-between">
            <span>Document A: {docA?.name}</span>
            <span className="text-[11px] text-rose-500 font-semibold">Removed in B</span>
          </h5>
          <div className="leading-relaxed break-words space-x-1">
            {wordsA.map((word, i) => {
              const isRemoved = !setB.has(word);
              return (
                <span
                  key={i}
                  className={isRemoved ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold px-1 rounded' : 'text-slate-700 dark:text-slate-300'}
                >
                  {word}{' '}
                </span>
              );
            })}
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60">
          <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center justify-between">
            <span>Document B: {docB?.name}</span>
            <span className="text-[11px] text-emerald-500 font-semibold">Added in B</span>
          </h5>
          <div className="leading-relaxed break-words space-x-1">
            {wordsB.map((word, i) => {
              const isAdded = !setA.has(word);
              return (
                <span
                  key={i}
                  className={isAdded ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold px-1 rounded' : 'text-slate-700 dark:text-slate-300'}
                >
                  {word}{' '}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider mb-3">
              <FileDiff className="w-3.5 h-3.5" />
              PDF Security & Audit
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Compare PDF Files</h2>
            <p className="text-violet-100 text-sm mt-1 max-w-xl">
              Inspect two revisions of a PDF side-by-side or using visual overlay difference to spot modified numbers, altered clauses, and shifted layouts.
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

      {/* Upload Dual Dropzone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Document A */}
        <div
          onClick={() => fileInputARef.current?.click()}
          className="p-6 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-violet-500 rounded-3xl cursor-pointer transition flex items-center gap-4 shadow-sm"
        >
          <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 flex items-center justify-center shrink-0">
            <Upload className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
              Document A (Original)
            </span>
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">
              {docA ? docA.name : 'Select or drop 1st PDF file'}
            </h4>
            <p className="text-xs text-slate-500">{docA ? `${docA.numPages} Pages` : 'Base reference version'}</p>
          </div>
          <input
            ref={fileInputARef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileLoad(e.target.files[0], 'A')}
          />
        </div>

        {/* Document B */}
        <div
          onClick={() => fileInputBRef.current?.click()}
          className="p-6 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 rounded-3xl cursor-pointer transition flex items-center gap-4 shadow-sm"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center shrink-0">
            <Upload className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Document B (Modified)
            </span>
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">
              {docB ? docB.name : 'Select or drop 2nd PDF file'}
            </h4>
            <p className="text-xs text-slate-500">{docB ? `${docB.numPages} Pages` : 'Revised revision to compare'}</p>
          </div>
          <input
            ref={fileInputBRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileLoad(e.target.files[0], 'B')}
          />
        </div>
      </div>

      {/* Comparison View Container */}
      {docA && docB && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('side-by-side')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'side-by-side'
                    ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                Side-by-Side
              </button>
              <button
                type="button"
                onClick={() => setViewMode('overlay')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'overlay'
                    ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Overlay Diff
              </button>
              <button
                type="button"
                onClick={() => setViewMode('text-diff')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'text-diff'
                    ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <FileDiff className="w-3.5 h-3.5" />
                Text Diff
              </button>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2 text-xs">
              <button
                disabled={activePage <= 1}
                onClick={() => changePage(activePage - 1)}
                className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-40 hover:bg-slate-50"
              >
                ← Prev Page
              </button>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Page {activePage} of {maxPages}
              </span>
              <button
                disabled={activePage >= maxPages}
                onClick={() => changePage(activePage + 1)}
                className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-40 hover:bg-slate-50"
              >
                Next Page →
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
              <p className="text-xs">Rendering diff comparison...</p>
            </div>
          ) : viewMode === 'side-by-side' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {docA.name} (Page {activePage})
                </span>
                <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-center">
                  {pageThumbA ? (
                    <img src={pageThumbA} alt="Page A" className="max-w-full h-auto rounded shadow" />
                  ) : (
                    <div className="py-20 text-xs text-slate-400">Page does not exist in Document A</div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {docB.name} (Page {activePage})
                </span>
                <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-center">
                  {pageThumbB ? (
                    <img src={pageThumbB} alt="Page B" className="max-w-full h-auto rounded shadow" />
                  ) : (
                    <div className="py-20 text-xs text-slate-400">Page does not exist in Document B</div>
                  )}
                </div>
              </div>
            </div>
          ) : viewMode === 'overlay' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between max-w-sm mx-auto text-xs font-medium text-slate-600">
                <span>Doc A</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                  className="w-48 accent-violet-600"
                />
                <span>Doc B ({Math.round(overlayOpacity * 100)}%)</span>
              </div>

              <div className="flex justify-center p-4 bg-slate-100 dark:bg-slate-800/40 rounded-2xl">
                <div className="relative border border-slate-300 dark:border-slate-700 rounded shadow-md overflow-hidden max-w-md">
                  {pageThumbA && <img src={pageThumbA} alt="Doc A Base" className="w-full h-auto block select-none" />}
                  {pageThumbB && (
                    <img
                      src={pageThumbB}
                      alt="Doc B Overlay"
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                      style={{ opacity: overlayOpacity, mixBlendMode: 'difference' }}
                    />
                  )}
                </div>
              </div>
              <p className="text-[11px] text-center text-slate-400">
                Overlay utilizes visual difference blending. Identical pixels cancel out, while alterations glow vibrant red/purple.
              </p>
            </div>
          ) : (
            renderTextDiff()
          )}
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
