import { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import {
  Upload,
  FileImage,
  ArrowUp,
  ArrowDown,
  RotateCw,
  Trash2,
  Download,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Settings2,
  Sliders,
  Layers,
  FileText,
  Loader2,
  Eye
} from 'lucide-react';

interface ImageItem {
  id: string;
  file: File;
  name: string;
  size: number;
  dataUrl: string;
  width: number;
  height: number;
  rotation: number; // 0, 90, 180, 270
}

interface JpgToPdfToolProps {
  onSwitchConverter?: (id: string) => void;
}

export default function JpgToPdfTool({ onSwitchConverter }: JpgToPdfToolProps) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageOrientation, setPageOrientation] = useState<'auto' | 'portrait' | 'landscape'>('auto');
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'fit'>('a4');
  const [pageMargin, setPageMargin] = useState<'none' | 'small' | 'big'>('small');
  const [fitMode, setFitMode] = useState<'contain' | 'stretch'>('contain');
  const [imageQuality, setImageQuality] = useState<number>(0.92);
  const [outputFileName, setOutputFileName] = useState('converted-document.pdf');
  
  const [isConverting, setIsConverting] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [convertedSize, setConvertedSize] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const processUploadedFiles = async (fileList: FileList | File[]) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setPreviewUrl(null);
    setConvertedSize(null);
    setLoadingFiles(true);

    const validFiles = Array.from(fileList).filter(f =>
      f.type.startsWith('image/') ||
      /\.(jpe?g|png|webp|bmp|gif|svg)$/i.test(f.name)
    );

    if (validFiles.length === 0) {
      setErrorMsg('Please select valid image files (JPG, PNG, WebP, GIF, BMP).');
      setLoadingFiles(false);
      return;
    }

    const loadedItems: ImageItem[] = [];

    for (const file of validFiles) {
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
          img.onerror = () => resolve({ width: 800, height: 600 });
          img.src = dataUrl;
        });

        loadedItems.push({
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          file,
          name: file.name,
          size: file.size,
          dataUrl,
          width: dimensions.width,
          height: dimensions.height,
          rotation: 0
        });
      } catch (err) {
        console.error('Failed to load image:', file.name, err);
      }
    }

    if (loadedItems.length > 0) {
      setImages(prev => {
        const next = [...prev, ...loadedItems];
        if (prev.length === 0 && loadedItems[0]) {
          const cleanName = loadedItems[0].name.replace(/\.[^/.]+$/, '');
          setOutputFileName(`${cleanName}-converted.pdf`);
        }
        return next;
      });
      setSuccessMsg(`Loaded ${loadedItems.length} image${loadedItems.length > 1 ? 's' : ''}.`);
    } else {
      setErrorMsg('Failed to process the uploaded image files.');
    }

    setLoadingFiles(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === images.length - 1)
    ) {
      return;
    }
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...images];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);
    setImages(updated);
  };

  const rotateImage = (index: number) => {
    setImages(prev => {
      const copy = [...prev];
      const cur = copy[index];
      if (cur) {
        const nextRotation = (cur.rotation + 90) % 360;
        copy[index] = { ...cur, rotation: nextRotation };
      }
      return copy;
    });
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const clearAll = () => {
    setImages([]);
    setErrorMsg(null);
    setSuccessMsg(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setConvertedSize(null);
  };

  // Convert an ImageItem to high-quality JPEG Uint8Array via Canvas
  const processImageToJpegBytes = async (item: ImageItem): Promise<Uint8Array> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }

        const rads = (item.rotation * Math.PI) / 180;
        const isRotated90or270 = item.rotation === 90 || item.rotation === 270;
        
        const finalWidth = isRotated90or270 ? img.naturalHeight : img.naturalWidth;
        const finalHeight = isRotated90or270 ? img.naturalWidth : img.naturalHeight;

        canvas.width = finalWidth;
        canvas.height = finalHeight;

        // White background for transparent PNGs
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, finalWidth, finalHeight);

        ctx.save();
        ctx.translate(finalWidth / 2, finalHeight / 2);
        ctx.rotate(rads);
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
        ctx.restore();

        canvas.toBlob(
          async (blob) => {
            if (!blob) {
              reject(new Error('Failed to render image to blob'));
              return;
            }
            const buf = await blob.arrayBuffer();
            resolve(new Uint8Array(buf));
          },
          'image/jpeg',
          imageQuality
        );
      };
      img.onerror = reject;
      img.src = item.dataUrl;
    });
  };

  const handleConvertToPdf = async () => {
    if (images.length === 0) {
      setErrorMsg('Please upload at least one image to convert.');
      return;
    }

    setIsConverting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const pdfDoc = await PDFDocument.create();
      
      const marginPoints = pageMargin === 'none' ? 0 : pageMargin === 'small' ? 20 : 40;

      for (const item of images) {
        const isRotated90or270 = item.rotation === 90 || item.rotation === 270;
        const effectiveImgWidth = isRotated90or270 ? item.height : item.width;
        const effectiveImgHeight = isRotated90or270 ? item.width : item.height;

        let pageWidth = 595.28; // A4 standard width in pt
        let pageHeight = 841.89; // A4 standard height in pt

        if (pageSize === 'letter') {
          pageWidth = 612;
          pageHeight = 792;
        } else if (pageSize === 'fit') {
          pageWidth = effectiveImgWidth + marginPoints * 2;
          pageHeight = effectiveImgHeight + marginPoints * 2;
        }

        // Handle Orientation
        if (pageSize !== 'fit') {
          let isLandscape = false;
          if (pageOrientation === 'landscape') {
            isLandscape = true;
          } else if (pageOrientation === 'auto') {
            isLandscape = effectiveImgWidth > effectiveImgHeight;
          }

          if (isLandscape && pageWidth < pageHeight) {
            const temp = pageWidth;
            pageWidth = pageHeight;
            pageHeight = temp;
          } else if (!isLandscape && pageWidth > pageHeight) {
            const temp = pageWidth;
            pageWidth = pageHeight;
            pageHeight = temp;
          }
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Process image data to JPEG Uint8Array
        const jpgBytes = await processImageToJpegBytes(item);
        const embeddedImage = await pdfDoc.embedJpg(jpgBytes);

        const availableWidth = Math.max(10, pageWidth - marginPoints * 2);
        const availableHeight = Math.max(10, pageHeight - marginPoints * 2);

        let drawWidth = availableWidth;
        let drawHeight = availableHeight;
        let drawX = marginPoints;
        let drawY = marginPoints;

        if (fitMode === 'contain' && pageSize !== 'fit') {
          const imgAspect = effectiveImgWidth / effectiveImgHeight;
          const pageAspect = availableWidth / availableHeight;

          if (imgAspect > pageAspect) {
            drawWidth = availableWidth;
            drawHeight = availableWidth / imgAspect;
          } else {
            drawHeight = availableHeight;
            drawWidth = availableHeight * imgAspect;
          }

          drawX = marginPoints + (availableWidth - drawWidth) / 2;
          drawY = marginPoints + (availableHeight - drawHeight) / 2;
        }

        page.drawImage(embeddedImage, {
          x: drawX,
          y: drawY,
          width: drawWidth,
          height: drawHeight
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setPreviewUrl(url);
      setConvertedSize(blob.size);
      setSuccessMsg(`PDF successfully generated with ${images.length} page${images.length > 1 ? 's' : ''}!`);

      // Trigger download automatically
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = outputFileName.endsWith('.pdf') ? outputFileName : `${outputFileName}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err: any) {
      console.error('Conversion error:', err);
      setErrorMsg('Failed to create PDF. Please check images and try again.');
    } finally {
      setIsConverting(false);
    }
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
                  JPG / Image to PDF Converter
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 rounded-full">
                  Client-Side & Private
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Convert JPG, PNG, WebP, and BMP images into clean, multi-page vector PDF documents with custom margins, orientation, and zero server uploads.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {images.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload & Images List */}
        <div className="lg:col-span-7 space-y-6">
          {/* Upload Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files) {
                processUploadedFiles(e.dataTransfer.files);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-400 bg-white dark:bg-slate-900/60 rounded-2xl p-8 text-center cursor-pointer transition group shadow-xs"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files) {
                  processUploadedFiles(e.target.files);
                }
              }}
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/svg+xml"
              className="hidden"
            />
            <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-105 transition">
              {loadingFiles ? (
                <Loader2 className="w-7 h-7 animate-spin" />
              ) : (
                <Upload className="w-7 h-7" />
              )}
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-800 dark:text-slate-100">
              Drag & Drop images here or click to browse
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Supports JPG, JPEG, PNG, WebP, GIF, and BMP. You can select multiple images to merge into a single PDF document.
            </p>
          </div>

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

          {/* Image List & Ordering */}
          {images.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-500" />
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Image Pages & Ordering ({images.length})
                  </h3>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Total raw size: {formatFileSize(images.reduce((acc, curr) => acc + curr.size, 0))}
                </span>
              </div>

              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {images.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 rounded-xl gap-3 transition hover:border-slate-300 dark:hover:border-slate-600"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div className="w-12 h-12 shrink-0 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-200 dark:border-slate-600 flex items-center justify-center relative">
                        <img
                          src={item.dataUrl}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-200"
                          style={{ transform: `rotate(${item.rotation}deg)` }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate max-w-[200px] sm:max-w-xs">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {formatFileSize(item.size)} • {item.width} × {item.height}px
                          {item.rotation > 0 && ` • ${item.rotation}°`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => rotateImage(idx)}
                        title="Rotate 90°"
                        className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(idx, 'up')}
                        disabled={idx === 0}
                        title="Move Up"
                        className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(idx, 'down')}
                        disabled={idx === images.length - 1}
                        title="Move Down"
                        className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(item.id)}
                        title="Remove Image"
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: PDF Settings & Conversion */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Settings2 className="w-5 h-5 text-teal-500" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                PDF Page & Layout Settings
              </h2>
            </div>

            {/* Page Orientation */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Page Orientation
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'auto', label: 'Auto Detect' },
                  { id: 'portrait', label: 'Portrait' },
                  { id: 'landscape', label: 'Landscape' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPageOrientation(opt.id as any)}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border transition text-center ${
                      pageOrientation === opt.id
                        ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-700 dark:text-teal-300 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Page Size */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Page Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'a4', label: 'A4 Standard' },
                  { id: 'letter', label: 'US Letter' },
                  { id: 'fit', label: 'Fit to Image' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPageSize(opt.id as any)}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border transition text-center ${
                      pageSize === opt.id
                        ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-700 dark:text-teal-300 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Margins */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Page Margins
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'none', label: 'No Margin' },
                  { id: 'small', label: 'Small (20pt)' },
                  { id: 'big', label: 'Large (40pt)' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPageMargin(opt.id as any)}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border transition text-center ${
                      pageMargin === opt.id
                        ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-700 dark:text-teal-300 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scaling mode */}
            {pageSize !== 'fit' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Image Scaling
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFitMode('contain')}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border transition text-center ${
                      fitMode === 'contain'
                        ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-700 dark:text-teal-300 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    Fit (Preserve Ratio)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFitMode('stretch')}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border transition text-center ${
                      fitMode === 'stretch'
                        ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-700 dark:text-teal-300 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    Fill (Full Margin Bleed)
                  </button>
                </div>
              </div>
            )}

            {/* Quality Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Image Quality
                </label>
                <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold">
                  {Math.round(imageQuality * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.0"
                step="0.05"
                value={imageQuality}
                onChange={(e) => setImageQuality(parseFloat(e.target.value))}
                className="w-full accent-teal-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Smaller File</span>
                <span>High Resolution</span>
              </div>
            </div>

            {/* Output Filename */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Output File Name
              </label>
              <input
                type="text"
                value={outputFileName}
                onChange={(e) => setOutputFileName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="document.pdf"
              />
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={handleConvertToPdf}
              disabled={images.length === 0 || isConverting}
              className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-white bg-teal-600 hover:bg-teal-500 active:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
            >
              {isConverting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Convert to PDF & Download
                </>
              )}
            </button>

            {previewUrl && (
              <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-900/60 flex items-center justify-between text-xs">
                <span className="text-teal-800 dark:text-teal-200 font-medium">
                  Ready! Size: {convertedSize ? formatFileSize(convertedSize) : 'N/A'}
                </span>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 hover:underline font-semibold"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Open Preview
                </a>
              </div>
            )}
          </div>

          {/* Privacy Guarantee card */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
            <ShieldCheck className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">100% In-Browser Privacy</p>
              <p className="mt-0.5 leading-relaxed">
                Images are processed completely on your local machine using HTML5 Canvas & WebAssembly PDF engine. No photos or documents leave your computer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
