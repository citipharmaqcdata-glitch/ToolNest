import { useState, useRef, ChangeEvent } from 'react';
import { UploadCloud, Download, Image as ImageIcon, ShieldCheck, RefreshCw, FileArchive, ArrowRight } from 'lucide-react';
import { formatBytes } from '../../utils/formatters';

export default function ImageCompressor() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);

  // Compression settings
  const [quality, setQuality] = useState<number>(0.75); // 0.1 to 1.0
  const [maxDimension, setMaxDimension] = useState<string>('original');
  const [outputFormat, setOutputFormat] = useState<string>('image/jpeg');

  // Compressed output
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [compressedDimensions, setCompressedDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setOriginalFile(file);

      const url = URL.createObjectURL(file);
      setOriginalUrl(url);

      const img = new Image();
      img.onload = () => {
        setOriginalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        processCompression(img, file, quality, maxDimension, outputFormat);
      };
      img.src = url;
    }
  };

  const processCompression = (
    img: HTMLImageElement,
    file: File,
    qual: number,
    maxDimStr: string,
    format: string
  ) => {
    setIsProcessing(true);

    let targetWidth = img.naturalWidth;
    let targetHeight = img.naturalHeight;

    if (maxDimStr !== 'original') {
      const maxLimit = parseInt(maxDimStr, 10);
      if (targetWidth > maxLimit || targetHeight > maxLimit) {
        if (targetWidth > targetHeight) {
          targetHeight = Math.round((targetHeight * maxLimit) / targetWidth);
          targetWidth = maxLimit;
        } else {
          targetWidth = Math.round((targetWidth * maxLimit) / targetHeight);
          targetHeight = maxLimit;
        }
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setIsProcessing(false);
      return;
    }

    // Fill white background for JPEGs to prevent black alpha transparent background
    if (format === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          if (compressedUrl) URL.revokeObjectURL(compressedUrl);
          const newUrl = URL.createObjectURL(blob);
          setCompressedBlob(blob);
          setCompressedUrl(newUrl);
          setCompressedDimensions({ width: targetWidth, height: targetHeight });
        }
        setIsProcessing(false);
      },
      format,
      qual
    );
  };

  const recompress = (newQual: number, newMaxDim: string, newFormat: string) => {
    if (!originalUrl || !originalFile) return;
    const img = new Image();
    img.onload = () => {
      processCompression(img, originalFile, newQual, newMaxDim, newFormat);
    };
    img.src = originalUrl;
  };

  const handleDownload = () => {
    if (!compressedBlob || !originalFile) return;
    const extension = outputFormat === 'image/png' ? 'png' : outputFormat === 'image/webp' ? 'webp' : 'jpg';
    const baseName = originalFile.name.replace(/\.[^/.]+$/, '');
    const filename = `${baseName}-compressed.${extension}`;

    const link = document.createElement('a');
    link.href = compressedUrl || '';
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const savingsPercent =
    originalFile && compressedBlob
      ? Math.max(0, Math.round(((originalFile.size - compressedBlob.size) / originalFile.size) * 100))
      : 0;

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {!originalFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-400 bg-white dark:bg-slate-900 rounded-3xl p-10 text-center cursor-pointer transition-all hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="w-16 h-16 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="font-heading font-semibold text-slate-900 dark:text-white text-lg">
            Choose an image to compress
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Select or drag JPG, PNG, or WebP images. All compression happens 100% locally in your browser memory.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Controls bar */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                <ImageIcon className="w-4 h-4 text-teal-600" />
                <span>{originalFile.name}</span>
                <span className="text-slate-400 font-normal">({formatBytes(originalFile.size)})</span>
              </div>
              <button
                onClick={() => {
                  setOriginalFile(null);
                  setOriginalUrl(null);
                  setCompressedBlob(null);
                  setCompressedUrl(null);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Choose Another Image
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Quality Slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>Quality</span>
                  <span className="font-mono text-teal-600 dark:text-teal-400">{Math.round(quality * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={quality}
                  onChange={(e) => {
                    const q = parseFloat(e.target.value);
                    setQuality(q);
                    recompress(q, maxDimension, outputFormat);
                  }}
                  className="w-full accent-teal-600"
                />
              </div>

              {/* Max Dimension */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Max Resolution
                </label>
                <select
                  value={maxDimension}
                  onChange={(e) => {
                    const dim = e.target.value;
                    setMaxDimension(dim);
                    recompress(quality, dim, outputFormat);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs font-medium"
                >
                  <option value="original">Original Dimensions</option>
                  <option value="1920">Max 1920px (Full HD)</option>
                  <option value="1280">Max 1280px (HD)</option>
                  <option value="800">Max 800px (Web Optimized)</option>
                  <option value="400">Max 400px (Thumbnail)</option>
                </select>
              </div>

              {/* Output Format */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Format
                </label>
                <select
                  value={outputFormat}
                  onChange={(e) => {
                    const fmt = e.target.value;
                    setOutputFormat(fmt);
                    recompress(quality, maxDimension, fmt);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs font-medium"
                >
                  <option value="image/jpeg">JPEG (.jpg)</option>
                  <option value="image/webp">WebP (Modern, high ratio)</option>
                  <option value="image/png">PNG (.png)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Comparison Preview & Download */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Original File</span>
                <span className="font-mono text-slate-500">{formatBytes(originalFile.size)}</span>
              </div>
              <div className="aspect-video bg-slate-100 dark:bg-slate-800/60 rounded-xl overflow-hidden flex items-center justify-center p-2">
                {originalUrl && (
                  <img
                    src={originalUrl}
                    alt="Original"
                    className="max-h-full max-w-full object-contain"
                  />
                )}
              </div>
              {originalDimensions && (
                <div className="text-[11px] text-slate-400 font-mono text-center">
                  {originalDimensions.width} × {originalDimensions.height} px
                </div>
              )}
            </div>

            {/* Compressed */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Compressed Output</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="font-bold text-teal-600 dark:text-teal-400">
                      {compressedBlob ? formatBytes(compressedBlob.size) : '...'}
                    </span>
                    {savingsPercent > 0 && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400">
                        (-{savingsPercent}%)
                      </span>
                    )}
                  </div>
                </div>

                <div className="aspect-video bg-slate-100 dark:bg-slate-800/60 rounded-xl overflow-hidden flex items-center justify-center p-2 mt-3">
                  {isProcessing ? (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
                      Compressing...
                    </div>
                  ) : compressedUrl ? (
                    <img
                      src={compressedUrl}
                      alt="Compressed preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : null}
                </div>

                {compressedDimensions && (
                  <div className="text-[11px] text-slate-400 font-mono text-center mt-2">
                    {compressedDimensions.width} × {compressedDimensions.height} px
                  </div>
                )}
              </div>

              <div className="pt-3">
                <button
                  onClick={handleDownload}
                  disabled={!compressedBlob || isProcessing}
                  className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  Download Compressed Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Box */}
      <div className="p-3 bg-slate-100 dark:bg-slate-800/70 rounded-xl text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2 border border-slate-200/50 dark:border-slate-700/50">
        <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <strong>100% In-Browser Privacy:</strong> Your photos are compressed entirely using client-side HTML5 Canvas. No image data is ever uploaded to any cloud server or third party.
        </div>
      </div>
    </div>
  );
}
