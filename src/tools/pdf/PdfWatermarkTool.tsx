import { useState, useRef } from 'react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import {
  Stamp,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Eye,
  Loader2,
  Sliders,
  Type,
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import { pdfjsLib } from '../../utils/pdfHelper';

interface PdfWatermarkToolProps {
  onSwitchConverter?: (id: string) => void;
}

export default function PdfWatermarkTool({ onSwitchConverter }: PdfWatermarkToolProps) {
  const [file, setFile] = useState<{
    name: string;
    size: number;
    buffer: ArrayBuffer;
    numPages: number;
  } | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');

  // Text watermark options
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState<number>(48);
  const [textColor, setTextColor] = useState<string>('#DC2626'); // Red
  const [opacity, setOpacity] = useState<number>(0.3);
  const [rotationAngle, setRotationAngle] = useState<number>(45); // Degrees
  const [position, setPosition] = useState<'center' | 'diagonal' | 'repeat' | 'top' | 'bottom'>('diagonal');

  // Image watermark options
  const [watermarkImage, setWatermarkImage] = useState<{
    dataUrl: string;
    buffer: ArrayBuffer;
    name: string;
    type: string;
  } | null>(null);
  const [imageScale, setImageScale] = useState<number>(0.4);

  // Page range options
  const [pageSelection, setPageSelection] = useState<'all' | 'custom'>('all');
  const [customRange, setCustomRange] = useState<string>('1-');

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string>('');

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  const handlePdfUpload = async (uploadedFile: File) => {
    setErrorMsg(null);
    setDownloadUrl(null);
    setPreviewUrl(null);

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

      // Render 1st page preview
      const firstPage = await pdf.getPage(1);
      const viewport = firstPage.getViewport({ scale: 0.8 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // @ts-expect-error pdfjs canvas typing
        await firstPage.render({ canvasContext: ctx, viewport }).promise;
        setPreviewUrl(canvas.toDataURL('image/jpeg', 0.85));
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error parsing PDF document.');
    }
  };

  const handleImageUpload = (imgFile: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      imgFile.arrayBuffer().then((buffer) => {
        setWatermarkImage({
          dataUrl,
          buffer,
          name: imgFile.name,
          type: imgFile.type
        });
      });
    };
    reader.readAsDataURL(imgFile);
  };

  const hexToRgb = (hex: string) => {
    const cleanHex = hex.replace('#', '');
    const bigint = parseInt(cleanHex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r: r / 255, g: g / 255, b: b / 255 };
  };

  const applyWatermark = async () => {
    if (!file) return;

    setErrorMsg(null);
    setIsProcessing(true);
    setDownloadUrl(null);

    try {
      const pdfDoc = await PDFDocument.load(file.buffer);
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const { r, g, b } = hexToRgb(textColor);

      let embeddedImage: any = null;
      if (watermarkType === 'image' && watermarkImage) {
        if (watermarkImage.type.includes('png')) {
          embeddedImage = await pdfDoc.embedPng(watermarkImage.buffer);
        } else {
          embeddedImage = await pdfDoc.embedJpg(watermarkImage.buffer);
        }
      }

      pages.forEach((page, idx) => {
        const pageNum = idx + 1;
        if (pageSelection === 'custom') {
          // Check range
          const parts = customRange.split(',').map((p) => p.trim());
          let inRange = false;
          for (const part of parts) {
            if (part.includes('-')) {
              const [startStr, endStr] = part.split('-');
              const start = parseInt(startStr, 10) || 1;
              const end = parseInt(endStr, 10) || pages.length;
              if (pageNum >= start && pageNum <= end) inRange = true;
            } else if (parseInt(part, 10) === pageNum) {
              inRange = true;
            }
          }
          if (!inRange) return;
        }

        const { width, height } = page.getSize();

        if (watermarkType === 'text') {
          const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
          const textHeight = font.heightAtSize(fontSize);

          if (position === 'diagonal' || position === 'center') {
            const rotDegrees = position === 'diagonal' ? rotationAngle : 0;
            // Center of page
            page.drawText(watermarkText, {
              x: width / 2 - (textWidth / 2) * Math.cos((rotDegrees * Math.PI) / 180),
              y: height / 2 - (textHeight / 2) * Math.sin((rotDegrees * Math.PI) / 180),
              size: fontSize,
              font,
              color: rgb(r, g, b),
              opacity,
              rotate: degrees(rotDegrees)
            });
          } else if (position === 'top') {
            page.drawText(watermarkText, {
              x: width / 2 - textWidth / 2,
              y: height - 50,
              size: fontSize,
              font,
              color: rgb(r, g, b),
              opacity
            });
          } else if (position === 'bottom') {
            page.drawText(watermarkText, {
              x: width / 2 - textWidth / 2,
              y: 50,
              size: fontSize,
              font,
              color: rgb(r, g, b),
              opacity
            });
          } else if (position === 'repeat') {
            // Tile pattern across page
            for (let y = 100; y < height; y += 220) {
              for (let x = -50; x < width + 100; x += textWidth + 80) {
                page.drawText(watermarkText, {
                  x,
                  y,
                  size: fontSize * 0.75,
                  font,
                  color: rgb(r, g, b),
                  opacity: opacity * 0.7,
                  rotate: degrees(rotationAngle)
                });
              }
            }
          }
        } else if (watermarkType === 'image' && embeddedImage) {
          const imgDims = embeddedImage.scale(imageScale);
          page.drawImage(embeddedImage, {
            x: width / 2 - imgDims.width / 2,
            y: height / 2 - imgDims.height / 2,
            width: imgDims.width,
            height: imgDims.height,
            opacity
          });
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const outName = file.name.replace(/\.[^/.]+$/, '') + '-watermarked.pdf';

      setDownloadUrl(url);
      setDownloadFileName(outName);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error applying watermark to PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider mb-3">
              <Stamp className="w-3.5 h-3.5" />
              Edit PDF
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Add Watermark to PDF</h2>
            <p className="text-teal-100 text-sm mt-1 max-w-xl">
              Stamp custom text stamps or company logo images across your PDF pages. Configure opacity, angle, positioning, and page ranges.
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
        {/* Left Column: Upload & Live Visual Preview */}
        <div className="lg:col-span-2 space-y-4">
          {!file ? (
            <div
              onClick={() => pdfInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) handlePdfUpload(e.dataTransfer.files[0]);
              }}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 bg-white dark:bg-slate-900 rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition min-h-[300px]"
            >
              <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center mb-4">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Select or drop PDF to watermark
              </h3>
              <p className="text-slate-500 text-xs mt-1 max-w-xs">
                Supports all PDF documents. Stamp text or logos instantly in your browser.
              </p>
              <span className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-xl shadow">
                Browse PDF File
              </span>
              <input
                ref={pdfInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handlePdfUpload(e.target.files[0])}
              />
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate max-w-md">
                    {file.name}
                  </h4>
                  <p className="text-xs text-slate-500">{file.numPages} pages</p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                >
                  Change File
                </button>
              </div>

              {/* Watermark Visual Overlay Preview */}
              {previewUrl && (
                <div className="flex flex-col items-center justify-center p-4 bg-slate-100 dark:bg-slate-800/40 rounded-2xl">
                  <div className="relative border border-slate-300 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden max-w-sm">
                    <img src={previewUrl} alt="First page preview" className="w-full h-auto block select-none" />

                    {/* Overlay simulator */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                      {watermarkType === 'text' ? (
                        <span
                          style={{
                            color: textColor,
                            opacity,
                            transform: `rotate(${position === 'diagonal' ? -rotationAngle : 0}deg)`,
                            fontSize: `${fontSize * 0.4}px`,
                            fontWeight: 'bold',
                            letterSpacing: '2px',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {watermarkText || 'WATERMARK'}
                        </span>
                      ) : watermarkImage ? (
                        <img
                          src={watermarkImage.dataUrl}
                          alt="Logo stamp"
                          style={{
                            opacity,
                            transform: `scale(${imageScale})`,
                            maxWidth: '70%',
                            maxHeight: '70%'
                          }}
                        />
                      ) : (
                        <span className="text-xs text-slate-400 bg-white/70 px-2 py-1 rounded">Upload stamp image below</span>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">Simulated preview on Page 1</p>
                </div>
              )}

              {downloadUrl && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-emerald-900 dark:text-emerald-100">Watermark Applied Successfully!</p>
                      <p className="text-[11px] text-emerald-700">{downloadFileName}</p>
                    </div>
                  </div>
                  <a
                    href={downloadUrl}
                    download={downloadFileName}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PDF
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Sliders className="w-4 h-4 text-teal-500" />
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Watermark Settings</h4>
          </div>

          {/* Type Toggle: Text or Image */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setWatermarkType('text')}
              className={`py-2 px-3 text-xs font-medium rounded-xl border flex items-center justify-center gap-1.5 transition ${
                watermarkType === 'text'
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-600 font-semibold'
                  : 'border-slate-200 text-slate-600'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              Text Stamp
            </button>
            <button
              type="button"
              onClick={() => setWatermarkType('image')}
              className={`py-2 px-3 text-xs font-medium rounded-xl border flex items-center justify-center gap-1.5 transition ${
                watermarkType === 'image'
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-600 font-semibold'
                  : 'border-slate-200 text-slate-600'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Image / Logo
            </button>
          </div>

          {watermarkType === 'text' ? (
            <div className="space-y-4">
              {/* Presets */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Quick Presets</label>
                <div className="flex flex-wrap gap-1.5">
                  {['CONFIDENTIAL', 'DRAFT', 'APPROVED', 'ORIGINAL', 'DO NOT COPY'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setWatermarkText(p)}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[11px] font-medium text-slate-700 dark:text-slate-300 rounded-lg transition"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Watermark text */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Watermark Text</label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="e.g. STRICTLY CONFIDENTIAL"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Color & Size */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300"
                    />
                    <span className="text-xs font-mono text-slate-600">{textColor}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Font Size ({fontSize}pt)</label>
                  <input
                    type="range"
                    min="18"
                    max="100"
                    step="2"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                </div>
              </div>

              {/* Position */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Layout Position</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <option value="diagonal">Diagonal Across Page (45°)</option>
                  <option value="center">Center Horizontal</option>
                  <option value="repeat">Tiled Mosaic Pattern</option>
                  <option value="top">Top Header</option>
                  <option value="bottom">Bottom Footer</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Logo or Stamp Image</label>
                <button
                  type="button"
                  onClick={() => imgInputRef.current?.click()}
                  className="w-full py-2.5 px-3 border border-dashed border-teal-500 rounded-xl text-xs font-medium text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/30 flex items-center justify-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {watermarkImage ? watermarkImage.name : 'Choose Logo / Stamp (PNG, JPG)'}
                </button>
                <input
                  ref={imgInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Image Scale ({Math.round(imageScale * 100)}%)
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.5"
                  step="0.05"
                  value={imageScale}
                  onChange={(e) => setImageScale(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>
            </div>
          )}

          {/* Opacity Slider */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
              <span>Transparency Opacity</span>
              <span>{Math.round(opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.9"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-full accent-teal-600"
            />
          </div>

          {/* Page Range */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Apply to Pages</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPageSelection('all')}
                className={`py-1.5 px-3 rounded-lg border text-xs font-medium ${
                  pageSelection === 'all'
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-600 font-semibold'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                All Pages
              </button>
              <button
                type="button"
                onClick={() => setPageSelection('custom')}
                className={`py-1.5 px-3 rounded-lg border text-xs font-medium ${
                  pageSelection === 'custom'
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-600 font-semibold'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                Custom Range
              </button>
            </div>
            {pageSelection === 'custom' && (
              <input
                type="text"
                value={customRange}
                onChange={(e) => setCustomRange(e.target.value)}
                placeholder="e.g. 2-5, 8"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              />
            )}
          </div>

          {/* Action button */}
          <button
            onClick={applyWatermark}
            disabled={!file || isProcessing}
            className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-semibold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Stamping PDF...
              </>
            ) : (
              <>
                <Stamp className="w-4 h-4" />
                Apply Watermark
              </>
            )}
          </button>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
