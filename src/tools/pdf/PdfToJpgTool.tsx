import { useState, useRef } from 'react';
import {
  Upload,
  FileImage,
  Download,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Sliders,
  Eye,
  Loader2,
  Layers,
  ZoomIn,
  X
} from 'lucide-react';
import { pdfjsLib } from '../../utils/pdfHelper';

interface RenderedPage {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
}

interface PdfToJpgToolProps {
  onSwitchConverter?: (id: string) => void;
}

export default function PdfToJpgTool({ onSwitchConverter }: PdfToJpgToolProps) {
  const [file, setFile] = useState<{
    name: string;
    size: number;
    buffer: ArrayBuffer;
  } | null>(null);

  const [totalPages, setTotalPages] = useState<number>(0);
  const [imageFormat, setImageFormat] = useState<'jpeg' | 'png'>('jpeg');
  const [resolutionScale, setResolutionScale] = useState<number>(1.5); // 1.5x = ~108 DPI
  const [jpgQuality, setJpgQuality] = useState<number>(0.92);
  const [pageRangeMode, setPageRangeMode] = useState<'all' | 'custom'>('all');
  const [customRangeText, setCustomRangeText] = useState<string>('1');

  const [renderedPages, setRenderedPages] = useState<RenderedPage[]>([]);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [renderProgress, setRenderProgress] = useState<{ current: number; total: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [modalPreview, setModalPreview] = useState<RenderedPage | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFileUpload = async (uploadedFile: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setRenderedPages([]);

    if (
      uploadedFile.type !== 'application/pdf' &&
      !uploadedFile.name.toLowerCase().endsWith('.pdf')
    ) {
      setErrorMsg('Please select a valid PDF document (.pdf).');
      return;
    }

    try {
      const buffer = await uploadedFile.arrayBuffer();
      // Test read with pdfjs
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
      const pdf = await loadingTask.promise;

      setFile({
        name: uploadedFile.name,
        size: uploadedFile.size,
        buffer
      });
      setTotalPages(pdf.numPages);
      setCustomRangeText(pdf.numPages > 1 ? `1-${Math.min(pdf.numPages, 5)}` : '1');
      setSuccessMsg(`Loaded "${uploadedFile.name}" (${pdf.numPages} pages). Select options and click Convert.`);
    } catch (err: any) {
      console.error('Failed to load PDF:', err);
      setErrorMsg('Could not read this PDF. It may be password-protected or encrypted.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const parseTargetPageNumbers = (total: number): number[] => {
    if (pageRangeMode === 'all') {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages = new Set<number>();
    const parts = customRangeText.split(',').map(s => s.trim());

    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-').map(s => s.trim());
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          const minP = Math.max(1, Math.min(start, end));
          const maxP = Math.min(total, Math.max(start, end));
          for (let p = minP; p <= maxP; p++) {
            pages.add(p);
          }
        }
      } else {
        const p = parseInt(part, 10);
        if (!isNaN(p) && p >= 1 && p <= total) {
          pages.add(p);
        }
      }
    }

    const res = Array.from(pages).sort((a, b) => a - b);
    return res.length > 0 ? res : [1];
  };

  const handleStartConversion = async () => {
    if (!file) {
      setErrorMsg('Please upload a PDF document first.');
      return;
    }

    setIsRendering(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setRenderedPages([]);

    try {
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(file.buffer) });
      const pdf = await loadingTask.promise;
      const targetPageNums = parseTargetPageNumbers(pdf.numPages);

      setRenderProgress({ current: 0, total: targetPageNums.length });

      const results: RenderedPage[] = [];

      for (let i = 0; i < targetPageNums.length; i++) {
        const pageNum = targetPageNums[i];
        setRenderProgress({ current: i + 1, total: targetPageNums.length });

        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: resolutionScale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        // Render white background
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };

        await page.render(renderContext as any).promise;

        const mimeType = imageFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
        const dataUrl = canvas.toDataURL(mimeType, imageFormat === 'jpeg' ? jpgQuality : undefined);

        // Approximate size calculation from base64
        const base64Len = dataUrl.length - dataUrl.indexOf(',') - 1;
        const sizeBytes = Math.floor((base64Len * 3) / 4);

        results.push({
          pageNumber: pageNum,
          dataUrl,
          width: canvas.width,
          height: canvas.height,
          sizeBytes
        });
      }

      setRenderedPages(results);
      setSuccessMsg(`Rendered ${results.length} high-resolution image${results.length > 1 ? 's' : ''}!`);
    } catch (err: any) {
      console.error('PDF to Image error:', err);
      setErrorMsg('Failed to render PDF pages. Please verify the document is not corrupted.');
    } finally {
      setIsRendering(false);
      setRenderProgress(null);
    }
  };

  const downloadSinglePage = (page: RenderedPage) => {
    if (!file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const ext = imageFormat === 'jpeg' ? 'jpg' : 'png';
    const link = document.createElement('a');
    link.href = page.dataUrl;
    link.download = `${baseName}-page-${page.pageNumber}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllPages = () => {
    if (renderedPages.length === 0) return;
    renderedPages.forEach((page, idx) => {
      setTimeout(() => {
        downloadSinglePage(page);
      }, idx * 250);
    });
  };

  const resetAll = () => {
    setFile(null);
    setTotalPages(0);
    setRenderedPages([]);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 rounded-xl border border-teal-100 dark:border-teal-900/40">
              <FileImage className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  PDF to JPG & Image Converter
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 rounded-full">
                  Client-Side & Fast
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Extract and render PDF document pages into high-resolution JPG or PNG images with customizable DPI, lossless quality, and complete privacy.
              </p>
            </div>
          </div>

          {file && (
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition self-start md:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Document
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload or Preview */}
        <div className="lg:col-span-7 space-y-6">
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
                <Upload className="w-7 h-7" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-800 dark:text-slate-100">
                Drag & Drop a PDF document here or browse
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Select any PDF file to extract all pages as high-resolution images or choose specific page numbers.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-sm">
                    {file.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {formatFileSize(file.size)} • {totalPages} Page{totalPages > 1 ? 's' : ''} detected
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/40 transition"
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

              {/* Converted images display */}
              {renderedPages.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Rendered Images ({renderedPages.length})
                    </span>
                    <button
                      type="button"
                      onClick={downloadAllPages}
                      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white bg-teal-600 hover:bg-teal-500 rounded-lg shadow-xs transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download All Images
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1">
                    {renderedPages.map((page) => (
                      <div
                        key={page.pageNumber}
                        className="group bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl p-2.5 flex flex-col justify-between hover:border-teal-400 dark:hover:border-teal-500 transition shadow-xs"
                      >
                        <div
                          onClick={() => setModalPreview(page)}
                          className="aspect-[3/4] bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200/80 dark:border-slate-700/80 cursor-pointer relative"
                        >
                          <img
                            src={page.dataUrl}
                            alt={`Page ${page.pageNumber}`}
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                            <ZoomIn className="w-6 h-6 text-white drop-shadow-md" />
                          </div>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              Page {page.pageNumber}
                            </span>
                            <p className="text-[10px] text-slate-400">
                              {formatFileSize(page.sizeBytes)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => downloadSinglePage(page)}
                            title="Download this page image"
                            className="p-1.5 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/60 rounded-lg transition"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                  {isRendering ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
                      <p className="font-medium text-slate-700 dark:text-slate-300">
                        Rendering Page {renderProgress?.current} of {renderProgress?.total}...
                      </p>
                    </div>
                  ) : (
                    <p>Select your conversion options on the right and click "Start Conversion".</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Feedback Messages */}
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
        </div>

        {/* Right Column: Settings & Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Sliders className="w-5 h-5 text-teal-500" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Image Extraction Settings
              </h2>
            </div>

            {/* Output Format */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Image Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setImageFormat('jpeg')}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border transition text-center ${
                    imageFormat === 'jpeg'
                      ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-700 dark:text-teal-300 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750'
                  }`}
                >
                  JPG (Fast & Compact)
                </button>
                <button
                  type="button"
                  onClick={() => setImageFormat('png')}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border transition text-center ${
                    imageFormat === 'png'
                      ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-700 dark:text-teal-300 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750'
                  }`}
                >
                  PNG (Crisp Lossless)
                </button>
              </div>
            </div>

            {/* Resolution Scale */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Resolution & DPI
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { scale: 1.0, label: 'Standard (72 DPI)' },
                  { scale: 1.5, label: 'High (108 DPI)' },
                  { scale: 2.0, label: 'Ultra (144 DPI)' }
                ].map((item) => (
                  <button
                    key={item.scale}
                    type="button"
                    onClick={() => setResolutionScale(item.scale)}
                    className={`py-2 px-2 text-[11px] font-medium rounded-xl border transition text-center ${
                      resolutionScale === item.scale
                        ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-700 dark:text-teal-300 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Slider (JPG only) */}
            {imageFormat === 'jpeg' && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    JPG Compression Quality
                  </label>
                  <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold">
                    {Math.round(jpgQuality * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.0"
                  step="0.05"
                  value={jpgQuality}
                  onChange={(e) => setJpgQuality(parseFloat(e.target.value))}
                  className="w-full accent-teal-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>
            )}

            {/* Page Range Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Pages to Convert
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPageRangeMode('all')}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border transition text-center ${
                    pageRangeMode === 'all'
                      ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-700 dark:text-teal-300 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750'
                  }`}
                >
                  All Pages ({totalPages || '—'})
                </button>
                <button
                  type="button"
                  onClick={() => setPageRangeMode('custom')}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border transition text-center ${
                    pageRangeMode === 'custom'
                      ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-700 dark:text-teal-300 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750'
                  }`}
                >
                  Custom Range
                </button>
              </div>

              {pageRangeMode === 'custom' && (
                <div className="pt-1.5">
                  <input
                    type="text"
                    value={customRangeText}
                    onChange={(e) => setCustomRangeText(e.target.value)}
                    placeholder="e.g. 1-3, 5, 8"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Comma separated numbers or ranges (e.g. 1, 3-5). Max: {totalPages}.
                  </p>
                </div>
              )}
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={handleStartConversion}
              disabled={!file || isRendering}
              className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-white bg-teal-600 hover:bg-teal-500 active:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
            >
              {isRendering ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Rendering {renderProgress ? `${renderProgress.current}/${renderProgress.total}` : ''}...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Convert PDF to Images
                </>
              )}
            </button>
          </div>

          {/* Privacy Guarantee card */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
            <ShieldCheck className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">100% In-Browser Privacy</p>
              <p className="mt-0.5 leading-relaxed">
                Pages are rendered directly to HTML5 Canvas via PDF.js running entirely inside your browser. No files are uploaded to any server.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      {modalPreview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                  Page {modalPreview.pageNumber} Preview
                </h3>
                <p className="text-xs text-slate-400">
                  {modalPreview.width} × {modalPreview.height}px • {formatFileSize(modalPreview.sizeBytes)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadSinglePage(modalPreview)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-teal-600 hover:bg-teal-500 rounded-lg transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => setModalPreview(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
              <img
                src={modalPreview.dataUrl}
                alt={`Page ${modalPreview.pageNumber}`}
                className="max-w-full max-h-full object-contain rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
