import { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import {
  Upload,
  FileStack,
  ArrowUp,
  ArrowDown,
  Trash2,
  Download,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  Plus,
  Loader2
} from 'lucide-react';

interface PdfFileItem {
  id: string;
  name: string;
  size: number;
  pageCount: number;
  buffer: ArrayBuffer;
}

export default function PdfMergeTool() {
  const [files, setFiles] = useState<PdfFileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [outputFileName, setOutputFileName] = useState('merged-document.pdf');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const processUploadedFiles = async (newFileList: FileList | File[]) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoadingFiles(true);

    const validFiles = Array.from(newFileList).filter(f =>
      f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );

    if (validFiles.length === 0) {
      setErrorMsg('Please select valid PDF documents (.pdf).');
      setLoadingFiles(false);
      return;
    }

    const loadedItems: PdfFileItem[] = [];

    for (const file of validFiles) {
      try {
        const buffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const count = pdfDoc.getPageCount();

        loadedItems.push({
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          size: file.size,
          pageCount: count,
          buffer
        });
      } catch (err: any) {
        console.error('Error loading PDF:', err);
        setErrorMsg(`Failed to parse "${file.name}". It may be password-protected or corrupted.`);
      }
    }

    setFiles(prev => [...prev, ...loadedItems]);
    setLoadingFiles(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFiles(e.dataTransfer.files);
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= files.length) return;

    const newArr = [...files];
    const item = newArr.splice(index, 1)[0];
    newArr.splice(targetIndex, 0, item);
    setFiles(newArr);
  };

  const handleRemove = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setFiles([]);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const totalPages = files.reduce((acc, f) => acc + f.pageCount, 0);
  const totalSizeBytes = files.reduce((acc, f) => acc + f.size, 0);

  const handleMergeAndDownload = async () => {
    if (files.length < 2) {
      setErrorMsg('Please upload at least 2 PDF files to merge.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const item of files) {
        const srcDoc = await PDFDocument.load(item.buffer, { ignoreEncryption: true });
        const pageIndices = srcDoc.getPageIndices();
        const copiedPages = await mergedPdf.copyPages(srcDoc, pageIndices);
        copiedPages.forEach(page => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = downloadUrl;
      const safeName = outputFileName.trim().endsWith('.pdf')
        ? outputFileName.trim()
        : `${outputFileName.trim() || 'merged'}.pdf`;
      link.download = safeName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      setSuccessMsg(`Successfully merged ${files.length} PDFs (${totalPages} total pages) into "${safeName}".`);
    } catch (err: any) {
      console.error('Merge error:', err);
      setErrorMsg('An error occurred during merging. Please verify that all files are unencrypted.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Privacy Banner */}
      <div className="flex items-center gap-3 p-4 bg-teal-50/70 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-800/40 rounded-2xl text-teal-900 dark:text-teal-200 text-xs sm:text-sm">
        <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
        <div>
          <span className="font-semibold">100% In-Browser Privacy:</span> Your PDF documents are assembled directly inside your device's memory. No files are uploaded to any server or external cloud.
        </div>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={handleFileDrop}
        onClick={() => fileInputRef.current?.click()}
        className="cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-400 rounded-3xl p-8 text-center transition-colors bg-white/60 dark:bg-slate-900/60"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={e => {
            if (e.target.files && e.target.files.length > 0) {
              processUploadedFiles(e.target.files);
            }
          }}
        />
        <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3">
          {loadingFiles ? <Loader2 className="w-7 h-7 animate-spin" /> : <Upload className="w-7 h-7" />}
        </div>
        <h3 className="font-heading font-semibold text-base sm:text-lg text-slate-800 dark:text-white">
          Drop PDF files here, or <span className="text-teal-600 dark:text-teal-400 underline">browse files</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Select multiple PDFs to merge in order. Client-side, instant & free.
        </p>
      </div>

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

      {/* File List & Reordering */}
      {files.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="font-heading font-semibold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <FileStack className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                Selected PDFs ({files.length})
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Total: {totalPages} pages &bull; ~{formatFileSize(totalSizeBytes)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-1.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add More
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="py-1.5 px-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear All
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {files.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs sm:text-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {item.pageCount} {item.pageCount === 1 ? 'page' : 'pages'} &bull; {formatFileSize(item.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    title="Move up"
                    disabled={index === 0}
                    onClick={() => handleMove(index, 'up')}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    title="Move down"
                    disabled={index === files.length - 1}
                    onClick={() => handleMove(index, 'down')}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    title="Remove"
                    onClick={() => handleRemove(index)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors ml-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Merge Controls */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Output File Name
              </label>
              <input
                type="text"
                value={outputFileName}
                onChange={e => setOutputFileName(e.target.value)}
                placeholder="merged-document.pdf"
                className="w-full sm:max-w-sm px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <button
              type="button"
              disabled={files.length < 2 || isProcessing}
              onClick={handleMergeAndDownload}
              className="w-full sm:w-auto py-3 px-6 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-medium text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Merging in Browser...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Merge & Download PDF ({files.length} files)
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
