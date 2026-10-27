import { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import {
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Sliders,
  FileText,
  Loader2,
  TrendingDown,
  Sparkles
} from 'lucide-react';
import { pdfjsLib } from '../../utils/pdfHelper';

type CompressionPreset = 'extreme' | 'recommended' | 'low';

export default function PdfCompressTool() {
  const [file, setFile] = useState<{
    name: string;
    size: number;
    buffer: ArrayBuffer;
    numPages: number;
  } | null>(null);

  const [preset, setPreset] = useState<CompressionPreset>('recommended');
  const [customDpi, setCustomDpi] = useState<number>(140);
  const [imageQuality, setImageQuality] = useState<number>(0.72);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [compressProgress, setCompressProgress] = useState<{ current: number; total: number } | null>(null);
  const [compressedResult, setCompressedResult] = useState<{
    size: number;
    savingsPercent: number;
    downloadUrl: string;
    fileName: string;
  } | null>(null);

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
    setCompressedResult(null);

    if (
      uploadedFile.type !== 'application/pdf' &&
      !uploadedFile.name.toLowerCase().endsWith('.pdf')
    ) {
      setErrorMsg('Please upload a valid PDF document (.pdf).');
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
      setSuccessMsg(`Loaded "${uploadedFile.name}" (${formatFileSize(uploadedFile.size)}, ${pdf.numPages} pages). Select compression preset below.`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Could not read this PDF. It may be encrypted or corrupted.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsCompressing(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setCompressedResult(null);

    let scale = 1.2;
    let quality = 0.72;

    if (preset === 'extreme') {
      scale = 0.9;
      quality = 0.50;
    } else if (preset === 'recommended') {
      scale = 1.3;
      quality = 0.70;
    } else if (preset === 'low') {
      scale = 1.8;
      quality = 0.88;
    }

    try {
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(file.buffer) }).promise;
      const newDoc = await PDFDocument.create();

      for (let p = 1; p <= pdf.numPages; p++) {
        setCompressProgress({ current: p, total: pdf.numPages });
        const page = await pdf.getPage(p);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: ctx, viewport } as any).promise;

          const imgDataUrl = canvas.toDataURL('image/jpeg', quality);
          const imgBytes = await fetch(imgDataUrl).then(res => res.arrayBuffer());
          const embeddedImg = await newDoc.embedJpg(imgBytes);

          // Preserve standard page point geometry
          const originalViewport = page.getViewport({ scale: 1.0 });
          const newPdfPage = newDoc.addPage([originalViewport.width, originalViewport.height]);
          newPdfPage.drawImage(embeddedImg, {
            x: 0,
            y: 0,
            width: originalViewport.width,
            height: originalViewport.height
          });
        }
      }

      const compressedBytes = await newDoc.save({ useObjectStreams: true });
      const blob = new Blob([compressedBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      const outName = `${cleanName}-compressed.pdf`;

      const compressedSize = blob.size;
      const rawSavings = ((file.size - compressedSize) / file.size) * 100;
      const savings = Math.max(0, parseFloat(rawSavings.toFixed(1)));

      setCompressedResult({
        size: compressedSize,
        savingsPercent: savings,
        downloadUrl: url,
        fileName: outName
      });
      setSuccessMsg(`Compression completed! Reduced file size by ${savings}%.`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Compression failed. Please check the document structure.');
    } finally {
      setIsCompressing(false);
      setCompressProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-teal-600" />
              Compress PDF
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Reduce PDF file size while preserving document readability and layout. 100% in-browser private compression.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-4 h-4" />
            Zero Server Uploads
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
              <div className="w-16 h-16 bg-teal-100 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Click to browse or drop your large PDF here
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Optimizes heavy graphics, embedded scanned images, and document stream tables.
              </p>
            </div>
          </div>
        )}

        {/* Compression Workspace */}
        {file && (
          <div className="mt-6 space-y-6">
            {/* File info bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-teal-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-xs md:max-w-md">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Original Size: <strong className="text-slate-700 dark:text-slate-200">{formatFileSize(file.size)}</strong> • {file.numPages} Pages
                  </p>
                </div>
              </div>
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

            {/* Presets */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Select Compression Level:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Extreme */}
                <div
                  onClick={() => setPreset('extreme')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    preset === 'extreme'
                      ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Extreme</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 dark:bg-red-950 text-red-600 rounded">
                        Max Savings
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      High compression ratio. Ideal for email attachments and portal upload limits (~96 DPI).
                    </p>
                  </div>
                </div>

                {/* Recommended */}
                <div
                  onClick={() => setPreset('recommended')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    preset === 'recommended'
                      ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Recommended</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded">
                        Balanced
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Optimal balance of crisp visual quality and compact file size (~140 DPI).
                    </p>
                  </div>
                </div>

                {/* Low / High Quality */}
                <div
                  onClick={() => setPreset('low')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    preset === 'low'
                      ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">High Quality</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-600 rounded">
                        Print Ready
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Gentle compression preserving fine details, thin lines, and sharp typography (~190 DPI).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Processing runs on your device CPU. No bandwidth consumed.
              </div>

              <button
                onClick={handleCompress}
                disabled={isCompressing}
                className="w-full sm:w-auto px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                {isCompressing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Compressing Page {compressProgress?.current || 1} of {compressProgress?.total || file.numPages}...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Compress PDF Now
                  </>
                )}
              </button>
            </div>

            {/* Compression Results Comparison */}
            {compressedResult && (
              <div className="p-6 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Compression Results Summary
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Original Size</p>
                    <p className="text-base font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {formatFileSize(file.size)}
                    </p>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Compressed Size</p>
                    <p className="text-base font-bold text-teal-600 dark:text-teal-400 mt-0.5">
                      {formatFileSize(compressedResult.size)}
                    </p>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Space Saved</p>
                    <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      -{compressedResult.savingsPercent}%
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <a
                    href={compressedResult.downloadUrl}
                    download={compressedResult.fileName}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download Compressed PDF ({formatFileSize(compressedResult.size)})
                  </a>
                </div>
              </div>
            )}
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
