import { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import {
  Upload,
  Trash2,
  Download,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Eye,
  Loader2,
  CheckSquare,
  Square,
  FileText
} from 'lucide-react';
import { pdfjsLib } from '../../utils/pdfHelper';

interface PageThumbnail {
  pageNumber: number;
  dataUrl: string;
}

export default function PdfRemovePagesTool() {
  const [file, setFile] = useState<{
    name: string;
    size: number;
    buffer: ArrayBuffer;
    numPages: number;
  } | null>(null);

  const [pages, setPages] = useState<PageThumbnail[]>([]);
  const [selectedPagesToRemove, setSelectedPagesToRemove] = useState<Set<number>>(new Set());
  const [rangeInput, setRangeInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [outputFileName, setOutputFileName] = useState<string>('pages-removed.pdf');

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
    setSelectedPagesToRemove(new Set());
    setRangeInput('');

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
      const loadedPages: PageThumbnail[] = [];

      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const viewport = page.getViewport({ scale: 0.45 });
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
          dataUrl: canvas.toDataURL('image/jpeg', 0.8)
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
      setOutputFileName(`${cleanName}-pages-removed.pdf`);
      setSuccessMsg(`Loaded "${uploadedFile.name}" with ${pdf.numPages} pages. Select pages below to remove.`);
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

  const togglePageRemoval = (pageNumber: number) => {
    setSelectedPagesToRemove(prev => {
      const next = new Set(prev);
      if (next.has(pageNumber)) {
        next.delete(pageNumber);
      } else {
        next.add(pageNumber);
      }
      syncRangeFromSet(next);
      return next;
    });
  };

  const syncRangeFromSet = (set: Set<number>) => {
    const sorted = Array.from(set).sort((a, b) => a - b);
    setRangeInput(sorted.join(', '));
  };

  const handleRangeInputApply = (val: string) => {
    setRangeInput(val);
    if (!file) return;
    const parts = val.split(',').map(s => s.trim()).filter(Boolean);
    const newSet = new Set<number>();

    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.max(1, start); i <= Math.min(file.numPages, end); i++) {
            newSet.add(i);
          }
        }
      } else {
        const num = parseInt(part, 10);
        if (!isNaN(num) && num >= 1 && num <= file.numPages) {
          newSet.add(num);
        }
      }
    }
    setSelectedPagesToRemove(newSet);
  };

  const selectEvenPages = () => {
    if (!file) return;
    const newSet = new Set<number>();
    for (let i = 2; i <= file.numPages; i += 2) {
      newSet.add(i);
    }
    setSelectedPagesToRemove(newSet);
    syncRangeFromSet(newSet);
  };

  const selectOddPages = () => {
    if (!file) return;
    const newSet = new Set<number>();
    for (let i = 1; i <= file.numPages; i += 2) {
      newSet.add(i);
    }
    setSelectedPagesToRemove(newSet);
    syncRangeFromSet(newSet);
  };

  const clearSelection = () => {
    setSelectedPagesToRemove(new Set());
    setRangeInput('');
  };

  const invertSelection = () => {
    if (!file) return;
    const newSet = new Set<number>();
    for (let i = 1; i <= file.numPages; i++) {
      if (!selectedPagesToRemove.has(i)) {
        newSet.add(i);
      }
    }
    setSelectedPagesToRemove(newSet);
    syncRangeFromSet(newSet);
  };

  const handleRemoveAndDownload = async () => {
    if (!file) return;
    if (selectedPagesToRemove.size === 0) {
      setErrorMsg('Please select at least one page to remove.');
      return;
    }
    if (selectedPagesToRemove.size >= file.numPages) {
      setErrorMsg('Cannot remove all pages from the PDF. At least one page must remain.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const srcDoc = await PDFDocument.load(file.buffer, { ignoreEncryption: true });
      const newDoc = await PDFDocument.create();

      const pagesToKeepIndices: number[] = [];
      for (let i = 0; i < file.numPages; i++) {
        if (!selectedPagesToRemove.has(i + 1)) {
          pagesToKeepIndices.push(i);
        }
      }

      const copiedPages = await newDoc.copyPages(srcDoc, pagesToKeepIndices);
      copiedPages.forEach(p => newDoc.addPage(p));

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = outputFileName || 'cleaned-document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccessMsg(
        `Successfully removed ${selectedPagesToRemove.size} page${
          selectedPagesToRemove.size > 1 ? 's' : ''
        }. Downloaded "${link.download}" with ${pagesToKeepIndices.length} remaining pages.`
      );
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to process and remove pages. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const remainingCount = file ? file.numPages - selectedPagesToRemove.size : 0;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              Remove Pages from PDF
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select or type page numbers to permanently delete from your PDF. Fast, secure, and 100% in-browser.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-4 h-4" />
            100% Client-Side Privacy
          </div>
        </div>

        {/* Upload Zone */}
        {!file && (
          <div className="mt-6">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 rounded-2xl p-10 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-800/20"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={e => {
                  if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                }}
              />
              <div className="w-16 h-16 bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Click to browse or drag and drop your PDF here
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Supports all multi-page PDF documents. Zero server uploads.
              </p>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Generating high-resolution page previews...
            </p>
          </div>
        )}

        {/* Main Work Area */}
        {file && !isLoading && (
          <div className="mt-6 space-y-6">
            {/* File info bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-red-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-xs md:max-w-md">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatFileSize(file.size)} • {file.numPages} Total Pages
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Change File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={e => {
                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                  }}
                />
              </div>
            </div>

            {/* Selection Controls */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Quick Select:</span>
                  <button
                    onClick={selectOddPages}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Odd Pages
                  </button>
                  <button
                    onClick={selectEvenPages}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Even Pages
                  </button>
                  <button
                    onClick={invertSelection}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Invert
                  </button>
                  <button
                    onClick={clearSelection}
                    className="px-2.5 py-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                <div className="text-xs">
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    {selectedPagesToRemove.size} to remove
                  </span>
                  <span className="text-slate-400 mx-1.5">•</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {remainingCount} to keep
                  </span>
                </div>
              </div>

              {/* Range input */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                  Pages to remove:
                </label>
                <input
                  type="text"
                  value={rangeInput}
                  onChange={e => handleRangeInputApply(e.target.value)}
                  placeholder="e.g. 1, 3, 5-8"
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Page Previews Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-[500px] overflow-y-auto p-2 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50">
              {pages.map(page => {
                const isMarked = selectedPagesToRemove.has(page.pageNumber);
                return (
                  <div
                    key={page.pageNumber}
                    onClick={() => togglePageRemoval(page.pageNumber)}
                    className={`group relative rounded-xl border-2 cursor-pointer transition-all p-2 flex flex-col items-center bg-white dark:bg-slate-800 ${
                      isMarked
                        ? 'border-red-500 ring-2 ring-red-500/20 opacity-75'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {/* Badge */}
                    <div className="w-full flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        p. {page.pageNumber}
                      </span>
                      {isMarked ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-100 dark:bg-red-950/80 text-red-600 rounded flex items-center gap-0.5">
                          <Trash2 className="w-2.5 h-2.5" />
                          Delete
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Keep</span>
                      )}
                    </div>

                    {/* Thumbnail */}
                    <div className="relative w-full aspect-[3/4] bg-slate-100 dark:bg-slate-900 rounded overflow-hidden flex items-center justify-center">
                      <img
                        src={page.dataUrl}
                        alt={`Page ${page.pageNumber}`}
                        className={`max-w-full max-h-full object-contain ${
                          isMarked ? 'grayscale filter brightness-75' : ''
                        }`}
                      />
                      {isMarked && (
                        <div className="absolute inset-0 bg-red-600/20 backdrop-blur-[0.5px] flex items-center justify-center">
                          <Trash2 className="w-8 h-8 text-red-600 drop-shadow" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Output configuration & Action */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                  Save as:
                </span>
                <input
                  type="text"
                  value={outputFileName}
                  onChange={e => setOutputFileName(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-white"
                />
              </div>

              <button
                onClick={handleRemoveAndDownload}
                disabled={isProcessing || selectedPagesToRemove.size === 0 || remainingCount === 0}
                className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Cleaned PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Remove {selectedPagesToRemove.size} Page{selectedPagesToRemove.size > 1 ? 's' : ''} & Download
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 rounded-xl flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 rounded-xl flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
}
