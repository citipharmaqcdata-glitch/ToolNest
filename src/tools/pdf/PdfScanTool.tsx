import { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import {
  Camera,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  RotateCw,
  Trash2,
  Plus,
  Sliders,
  Sparkles,
  Loader2,
  FileText,
  RefreshCw,
  Maximize2
} from 'lucide-react';

interface ScannedPage {
  id: string;
  dataUrl: string;
  filter: 'normal' | 'bw' | 'grayscale' | 'contrast';
  rotation: number;
}

export default function PdfScanTool() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('environment');
  const [scannedPages, setScannedPages] = useState<ScannedPage[]>([]);
  const [globalFilter, setGlobalFilter] = useState<'normal' | 'bw' | 'grayscale' | 'contrast'>('contrast');
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'fit'>('a4');
  const [pageMargin, setPageMargin] = useState<number>(20);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [outputFileName, setOutputFileName] = useState<string>('scanned-document.pdf');

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async (facing: 'user' | 'environment' = cameraFacing) => {
    setErrorMsg(null);
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      setStream(mediaStream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setErrorMsg('Could not access device camera. Please check camera permissions or upload images below.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    if (cameraActive) {
      startCamera(nextFacing);
    }
  };

  const applyImageFilter = (dataUrl: string, filterType: 'normal' | 'bw' | 'grayscale' | 'contrast'): Promise<string> => {
    return new Promise((resolve) => {
      if (filterType === 'normal') {
        resolve(dataUrl);
        return;
      }
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imgData.data;

        for (let i = 0; i < d.length; i += 4) {
          const r = d[i];
          const g = d[i + 1];
          const b = d[i + 2];
          // Grayscale luminance
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;

          if (filterType === 'bw') {
            // High-contrast Document B&W threshold
            const v = gray > 140 ? 255 : 0;
            d[i] = v;
            d[i + 1] = v;
            d[i + 2] = v;
          } else if (filterType === 'grayscale') {
            d[i] = gray;
            d[i + 1] = gray;
            d[i + 2] = gray;
          } else if (filterType === 'contrast') {
            // Enhanced contrast
            const factor = (259 * (128 + 255)) / (255 * (259 - 128));
            d[i] = Math.min(255, Math.max(0, factor * (r - 128) + 128));
            d[i + 1] = Math.min(255, Math.max(0, factor * (g - 128) + 128));
            d[i + 2] = Math.min(255, Math.max(0, factor * (b - 128) + 128));
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.src = dataUrl;
    });
  };

  const capturePage = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const rawDataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const filteredUrl = await applyImageFilter(rawDataUrl, globalFilter);

    const newPage: ScannedPage = {
      id: `scan-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      dataUrl: filteredUrl,
      filter: globalFilter,
      rotation: 0
    };

    setScannedPages(prev => [...prev, newPage]);
    setSuccessMsg(`Captured page ${scannedPages.length + 1}!`);
  };

  const handleFileUpload = async (files: FileList) => {
    setErrorMsg(null);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      const reader = new FileReader();
      reader.onload = async (e) => {
        const rawUrl = e.target?.result as string;
        const filteredUrl = await applyImageFilter(rawUrl, globalFilter);
        setScannedPages(prev => [
          ...prev,
          {
            id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            dataUrl: filteredUrl,
            filter: globalFilter,
            rotation: 0
          }
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  const rotatePage = (index: number) => {
    setScannedPages(prev => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        rotation: (next[index].rotation + 90) % 360
      };
      return next;
    });
  };

  const deletePage = (index: number) => {
    setScannedPages(prev => prev.filter((_, i) => i !== index));
  };

  const handleExportPdf = async () => {
    if (scannedPages.length === 0) {
      setErrorMsg('No pages have been scanned or uploaded yet.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const pageItem of scannedPages) {
        // Embed image into PDF
        const imgBytes = await fetch(pageItem.dataUrl).then(res => res.arrayBuffer());
        const embeddedImg = await pdfDoc.embedJpg(imgBytes);

        let pageWidth = 595.28; // A4 pt
        let pageHeight = 841.89;

        if (pageSize === 'letter') {
          pageWidth = 612;
          pageHeight = 792;
        } else if (pageSize === 'fit') {
          pageWidth = embeddedImg.width;
          pageHeight = embeddedImg.height;
        }

        const pdfPage = pdfDoc.addPage([pageWidth, pageHeight]);

        if (pageSize === 'fit') {
          pdfPage.drawImage(embeddedImg, {
            x: 0,
            y: 0,
            width: embeddedImg.width,
            height: embeddedImg.height
          });
        } else {
          // Fit within margins
          const availableW = pageWidth - pageMargin * 2;
          const availableH = pageHeight - pageMargin * 2;
          const imgRatio = embeddedImg.width / embeddedImg.height;
          const pageRatio = availableW / availableH;

          let renderW = availableW;
          let renderH = availableH;

          if (imgRatio > pageRatio) {
            renderH = availableW / imgRatio;
          } else {
            renderW = availableH * imgRatio;
          }

          const posX = pageMargin + (availableW - renderW) / 2;
          const posY = pageMargin + (availableH - renderH) / 2;

          pdfPage.drawImage(embeddedImg, {
            x: posX,
            y: posY,
            width: renderW,
            height: renderH
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = outputFileName || 'scanned-document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccessMsg(`Compiled and downloaded "${link.download}" with ${scannedPages.length} scanned pages.`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to generate scanned PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-teal-600" />
              Scan to PDF
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Capture documents, receipts, certificates, and handwritten notes with your camera and compile into multi-page PDFs.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-4 h-4" />
            100% In-Browser Privacy
          </div>
        </div>

        {/* Camera Feed or Launch */}
        <div className="mt-6 space-y-4">
          <div className="bg-slate-950 rounded-2xl overflow-hidden relative aspect-video max-h-[380px] flex items-center justify-center">
            {cameraActive ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-contain"
                />
                {/* Overlay controls */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    onClick={toggleCameraFacing}
                    title="Flip Camera (Front/Back)"
                    className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-xl backdrop-blur transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold rounded-xl backdrop-blur transition-colors"
                  >
                    Close Camera
                  </button>
                </div>

                {/* Shutter Button */}
                <div className="absolute bottom-4 inset-x-0 flex items-center justify-center">
                  <button
                    onClick={capturePage}
                    className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-white text-xs font-bold rounded-2xl shadow-lg flex items-center gap-2 cursor-pointer transition-all transform active:scale-95"
                  >
                    <Camera className="w-4 h-4" />
                    Capture Page ({scannedPages.length + 1})
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center p-6 space-y-3">
                <div className="w-14 h-14 bg-slate-800 text-teal-400 rounded-2xl flex items-center justify-center mx-auto">
                  <Camera className="w-7 h-7" />
                </div>
                <p className="text-sm font-semibold text-white">Device Camera Offline</p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => startCamera()}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    Start Camera Scanner
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Photo Files
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={e => {
                      if (e.target.files) handleFileUpload(e.target.files);
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Enhancement Filters & PDF Layout Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Document Enhancement Filter:
              </label>
              <select
                value={globalFilter}
                onChange={e => setGlobalFilter(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white"
              >
                <option value="contrast">High Contrast (Clear Text)</option>
                <option value="bw">B&W Document Threshold</option>
                <option value="grayscale">Grayscale</option>
                <option value="normal">Normal Color Photo</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                PDF Page Size:
              </label>
              <select
                value={pageSize}
                onChange={e => setPageSize(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white"
              >
                <option value="a4">Standard A4 (595 × 842 pt)</option>
                <option value="letter">US Letter (612 × 792 pt)</option>
                <option value="fit">Auto-fit to Image Dimensions</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Page Margins:
              </label>
              <select
                value={pageMargin}
                onChange={e => setPageMargin(parseInt(e.target.value, 10))}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white"
              >
                <option value={0}>Zero Margin (Full Bleed)</option>
                <option value={15}>Narrow (15 pt)</option>
                <option value={25}>Normal (25 pt)</option>
                <option value={40}>Wide (40 pt)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Scanned Pages Queue */}
        {scannedPages.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Scanned Pages Queue ({scannedPages.length} Pages)
              </span>
              <button
                onClick={() => setScannedPages([])}
                className="text-xs text-red-500 hover:text-red-700 font-medium"
              >
                Clear All Pages
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 max-h-[360px] overflow-y-auto">
              {scannedPages.map((page, index) => (
                <div
                  key={page.id}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 relative flex flex-col"
                >
                  <div className="flex items-center justify-between mb-1 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    <span>Page {index + 1}</span>
                    <button
                      onClick={() => deletePage(index)}
                      className="text-red-500 hover:text-red-700 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="w-full aspect-[3/4] bg-slate-100 dark:bg-slate-900 rounded overflow-hidden flex items-center justify-center mb-2">
                    <img
                      src={page.dataUrl}
                      alt={`Scanned page ${index + 1}`}
                      style={{ transform: `rotate(${page.rotation}deg)` }}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <button
                    onClick={() => rotatePage(index)}
                    className="w-full py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded text-[10px] font-semibold flex items-center justify-center gap-1"
                  >
                    <RotateCw className="w-3 h-3" />
                    Rotate
                  </button>
                </div>
              ))}
            </div>

            {/* Compile & Download Button */}
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
                onClick={handleExportPdf}
                disabled={isProcessing || scannedPages.length === 0}
                className="w-full sm:w-auto px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Compiling Scanned PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download Scanned PDF ({scannedPages.length} Pages)
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
