import { useState, useRef, useMemo } from 'react';
import { PDFDocument } from 'pdf-lib';
import {
  Upload,
  Split,
  Download,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  FileText,
  Loader2,
  CheckSquare,
  Square
} from 'lucide-react';

export default function PdfSplitTool() {
  const [file, setFile] = useState<{
    name: string;
    size: number;
    pageCount: number;
    buffer: ArrayBuffer;
  } | null>(null);

  const [extractMode, setExtractMode] = useState<'picker' | 'range'>('picker');
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [rangeInput, setRangeInput] = useState<string>('1');
  const [outputFileName, setOutputFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
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
    setIsLoadingFile(true);

    if (uploadedFile.type !== 'application/pdf' && !uploadedFile.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please upload a valid PDF document (.pdf).');
      setIsLoadingFile(false);
      return;
    }

    try {
      const buffer = await uploadedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = pdfDoc.getPageCount();

      setFile({
        name: uploadedFile.name,
        size: uploadedFile.size,
        pageCount: count,
        buffer
      });

      // Default selection: page 1
      setSelectedPages([1]);
      setRangeInput(count > 1 ? `1-${Math.min(count, 3)}` : '1');
      const baseName = uploadedFile.name.replace(/\.[^/.]+$/, '');
      setOutputFileName(`${baseName}-extracted.pdf`);
    } catch (err: any) {
      console.error('Error loading PDF for split:', err);
      setErrorMsg('Could not read this PDF. It may be password-protected or corrupted.');
    } finally {
      setIsLoadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const togglePageSelection = (pageNum: number) => {
    setSelectedPages(prev =>
      prev.includes(pageNum) ? prev.filter(p => p !== pageNum) : [...prev, pageNum].sort((a, b) => a - b)
    );
  };

  const selectAllPages = () => {
    if (!file) return;
    const all = Array.from({ length: file.pageCount }, (_, i) => i + 1);
    setSelectedPages(all);
  };

  const selectOddPages = () => {
    if (!file) return;
    const odds = Array.from({ length: file.pageCount }, (_, i) => i + 1).filter(p => p % 2 !== 0);
    setSelectedPages(odds);
  };

  const selectEvenPages = () => {
    if (!file) return;
    const evens = Array.from({ length: file.pageCount }, (_, i) => i + 1).filter(p => p % 2 === 0);
    setSelectedPages(evens);
  };

  const clearSelection = () => {
    setSelectedPages([]);
  };

  // Parse range input like "1-3, 5, 8-10"
  const parsedRangePages = useMemo(() => {
    if (!file) return [];
    const parts = rangeInput.split(',').map(s => s.trim()).filter(Boolean);
    const pagesSet = new Set<number>();

    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-').map(s => s.trim());
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end) && start > 0 && end >= start) {
          for (let i = start; i <= Math.min(end, file.pageCount); i++) {
            pagesSet.add(i);
          }
        }
      } else {
        const num = parseInt(part, 10);
        if (!isNaN(num) && num > 0 && num <= file.pageCount) {
          pagesSet.add(num);
        }
      }
    }

    return Array.from(pagesSet).sort((a, b) => a - b);
  }, [rangeInput, file]);

  const activePagesToExtract = extractMode === 'picker' ? selectedPages : parsedRangePages;

  const handleExtract = async () => {
    if (!file) return;
    if (activePagesToExtract.length === 0) {
      setErrorMsg('Please select at least 1 page to extract.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const srcDoc = await PDFDocument.load(file.buffer, { ignoreEncryption: true });
      const newPdf = await PDFDocument.create();

      // Zero-indexed page indices in pdf-lib
      const indicesToCopy = activePagesToExtract.map(p => p - 1);
      const copiedPages = await newPdf.copyPages(srcDoc, indicesToCopy);
      copiedPages.forEach(p => newPdf.addPage(p));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = downloadUrl;
      const safeName = outputFileName.trim().endsWith('.pdf')
        ? outputFileName.trim()
        : `${outputFileName.trim() || 'extracted'}.pdf`;
      link.download = safeName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      setSuccessMsg(`Extracted ${activePagesToExtract.length} pages into "${safeName}".`);
    } catch (err: any) {
      console.error('Extract error:', err);
      setErrorMsg('Failed to extract pages. Please ensure the document is not password-protected.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setSelectedPages([]);
    setRangeInput('1');
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  return (
    <div className="space-y-6">
      {/* Privacy Banner */}
      <div className="flex items-center gap-3 p-4 bg-teal-50/70 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-800/40 rounded-2xl text-teal-900 dark:text-teal-200 text-xs sm:text-sm">
        <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
        <div>
          <span className="font-semibold">100% In-Browser Execution:</span> Your file is processed directly inside your browser memory. No data is transmitted to external servers.
        </div>
      </div>

      {/* Upload Box if no file */}
      {!file ? (
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileUpload(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-400 rounded-3xl p-10 text-center transition-colors bg-white/60 dark:bg-slate-900/60"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={e => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />
          <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3">
            {isLoadingFile ? <Loader2 className="w-7 h-7 animate-spin" /> : <Upload className="w-7 h-7" />}
          </div>
          <h3 className="font-heading font-semibold text-base sm:text-lg text-slate-800 dark:text-white">
            Upload PDF to split or extract, or <span className="text-teal-600 dark:text-teal-400 underline">browse</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Extract custom page ranges or individual pages quickly and privately.
          </p>
        </div>
      ) : (
        /* Loaded File & Split Options */
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-6 shadow-xs">
          {/* File Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading font-semibold text-sm sm:text-base text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-md">
                  {file.name}
                </h4>
                <p className="text-xs text-slate-500">
                  {file.pageCount} {file.pageCount === 1 ? 'page' : 'pages'} &bull; {formatFileSize(file.size)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="py-1.5 px-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Choose Another File
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setExtractMode('picker')}
              className={`py-1.5 px-4 rounded-lg text-xs font-medium transition-all ${
                extractMode === 'picker'
                  ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Interactive Page Picker
            </button>
            <button
              type="button"
              onClick={() => setExtractMode('range')}
              className={`py-1.5 px-4 rounded-lg text-xs font-medium transition-all ${
                extractMode === 'range'
                  ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Page Range Expression (e.g. 1-3, 5)
            </button>
          </div>

          {/* Mode 1: Interactive Picker */}
          {extractMode === 'picker' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-600 dark:text-slate-400">
                  Click pages to toggle selection ({selectedPages.length} of {file.pageCount} selected):
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAllPages}
                    className="text-teal-600 dark:text-teal-400 hover:underline font-medium"
                  >
                    Select All
                  </button>
                  <span>&bull;</span>
                  <button
                    type="button"
                    onClick={selectOddPages}
                    className="text-teal-600 dark:text-teal-400 hover:underline font-medium"
                  >
                    Odd Pages
                  </button>
                  <span>&bull;</span>
                  <button
                    type="button"
                    onClick={selectEvenPages}
                    className="text-teal-600 dark:text-teal-400 hover:underline font-medium"
                  >
                    Even Pages
                  </button>
                  <span>&bull;</span>
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="text-rose-500 hover:underline font-medium"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-64 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                {Array.from({ length: file.pageCount }, (_, i) => i + 1).map(pageNum => {
                  const isSelected = selectedPages.includes(pageNum);
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => togglePageSelection(pageNum)}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                      <span className="font-heading font-semibold text-xs">{pageNum}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mode 2: Range Input */}
          {extractMode === 'range' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Specify Pages or Ranges (from 1 to {file.pageCount})
                </label>
                <input
                  type="text"
                  value={rangeInput}
                  onChange={e => setRangeInput(e.target.value)}
                  placeholder="e.g. 1-3, 5, 8"
                  className="w-full sm:max-w-md px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Examples: "1-5" (first five pages), "1, 3, 5" (specific pages), or "2-4, 7-9" (multiple groups).
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Resolved Pages to Extract: </span>
                {parsedRangePages.length > 0 ? (
                  <span className="text-teal-600 dark:text-teal-400 font-mono">
                    {parsedRangePages.join(', ')} ({parsedRangePages.length} total)
                  </span>
                ) : (
                  <span className="text-rose-500">None (Check your range expression)</span>
                )}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Extracted File Name
              </label>
              <input
                type="text"
                value={outputFileName}
                onChange={e => setOutputFileName(e.target.value)}
                placeholder="extracted-pages.pdf"
                className="w-full sm:max-w-sm px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <button
              type="button"
              disabled={activePagesToExtract.length === 0 || isProcessing}
              onClick={handleExtract}
              className="w-full sm:w-auto py-3 px-6 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-medium text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Extracting in Browser...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Extract & Download ({activePagesToExtract.length} {activePagesToExtract.length === 1 ? 'Page' : 'Pages'})
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      {errorMsg && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-xl text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs sm:text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
    </div>
  );
}
