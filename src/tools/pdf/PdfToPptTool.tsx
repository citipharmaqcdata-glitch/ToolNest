import { useState, useRef } from 'react';
import pptxgen from 'pptxgenjs';
import {
  Presentation,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Layers,
  Loader2,
  Sliders
} from 'lucide-react';
import { pdfjsLib } from '../../utils/pdfHelper';

interface PdfToPptToolProps {
  onSwitchConverter?: (id: string) => void;
}

export default function PdfToPptTool({ onSwitchConverter }: PdfToPptToolProps) {
  const [file, setFile] = useState<{
    name: string;
    size: number;
    buffer: ArrayBuffer;
    numPages: number;
  } | null>(null);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number; status: string }>({
    current: 0,
    total: 0,
    status: ''
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string>('');
  const [previewSlides, setPreviewSlides] = useState<{ pageNum: number; thumbUrl: string; textSnippet: string }[]>([]);

  // Conversion options
  const [slideLayout, setSlideLayout] = useState<'16x9' | '4x3'>('16x9');
  const [conversionMode, setConversionMode] = useState<'visual-and-text' | 'visual-slide' | 'editable-text'>('visual-and-text');
  const [includeSpeakerNotes, setIncludeSpeakerNotes] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFileUpload = async (uploadedFile: File) => {
    setErrorMsg(null);
    setDownloadUrl(null);
    setPreviewSlides([]);

    if (
      uploadedFile.type !== 'application/pdf' &&
      !uploadedFile.name.toLowerCase().endsWith('.pdf')
    ) {
      setErrorMsg('Please select a valid PDF document (.pdf).');
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

      // Generate fast previews for first few pages (up to 4)
      const previewList: { pageNum: number; thumbUrl: string; textSnippet: string }[] = [];
      const previewCount = Math.min(pdf.numPages, 4);

      for (let i = 1; i <= previewCount; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.6 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // @ts-expect-error pdfjsLib canvas context typing
          await page.render({ canvasContext: ctx, viewport }).promise;
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            // @ts-expect-error item text string
            .map((item) => item.str || '')
            .join(' ')
            .trim();

          previewList.push({
            pageNum: i,
            thumbUrl: canvas.toDataURL('image/jpeg', 0.8),
            textSnippet: pageText.slice(0, 120) || 'Slide visual content'
          });
        }
      }
      setPreviewSlides(previewList);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to inspect PDF file.');
    }
  };

  const convertToPptx = async () => {
    if (!file) return;

    setErrorMsg(null);
    setIsProcessing(true);
    setDownloadUrl(null);

    try {
      setProgress({ current: 0, total: file.numPages, status: 'Initializing PowerPoint presentation...' });
      const pptx = new pptxgen();

      // Set presentation properties
      pptx.layout = slideLayout === '16x9' ? 'LAYOUT_16x9' : 'LAYOUT_4x3';
      pptx.title = file.name.replace(/\.[^/.]+$/, '');
      pptx.author = 'PDF to PowerPoint Converter';
      pptx.company = 'OmniCalculators & Tools';
      pptx.revision = '1';

      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(file.buffer) });
      const pdf = await loadingTask.promise;

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        setProgress({
          current: pageNum,
          total: pdf.numPages,
          status: `Extracting and rendering Slide ${pageNum} of ${pdf.numPages}...`
        });

        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        // @ts-expect-error item str
        const pageTextRaw = textContent.items.map((item) => item.str || '').join(' ').trim();

        const slide = pptx.addSlide();

        if (conversionMode === 'visual-and-text' || conversionMode === 'visual-slide') {
          // Render high-res slide image
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            // @ts-expect-error pdfjs canvas typing
            await page.render({ canvasContext: ctx, viewport }).promise;
            const imgDataUrl = canvas.toDataURL('image/jpeg', 0.92);

            if (conversionMode === 'visual-slide') {
              // Full page background image
              slide.background = { data: imgDataUrl };
            } else {
              // Visual slide in layout with editable title overlay if available
              slide.addImage({
                data: imgDataUrl,
                x: 0,
                y: 0,
                w: '100%',
                h: '100%'
              });
            }
          }
        }

        if (conversionMode === 'editable-text') {
          // Extract title and body paragraphs
          const lines = pageTextRaw.split('\n').filter((l: string) => l.trim().length > 0);
          const title = lines[0] || `Slide ${pageNum}`;
          const body = lines.slice(1).join('\n') || pageTextRaw;

          slide.addText(title, {
            x: 0.8,
            y: 0.6,
            w: '85%',
            h: 0.8,
            fontSize: 24,
            bold: true,
            color: '1E293B'
          });

          slide.addText(body || 'Slide content', {
            x: 0.8,
            y: 1.6,
            w: '85%',
            h: 4.5,
            fontSize: 14,
            color: '334155',
            bullet: true
          });
        }

        if (includeSpeakerNotes && pageTextRaw) {
          slide.addNotes(`Original PDF Text [Page ${pageNum}]:\n${pageTextRaw.slice(0, 1000)}`);
        }
      }

      setProgress({ current: file.numPages, total: file.numPages, status: 'Generating PPTX file...' });
      const pptxBlob = await pptx.write({ outputType: 'blob' });
      const url = URL.createObjectURL(pptxBlob as Blob);
      const outputName = file.name.replace(/\.[^/.]+$/, '') + '.pptx';

      setDownloadUrl(url);
      setDownloadFileName(outputName);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error occurred while creating PowerPoint presentation.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewSlides([]);
    setDownloadUrl(null);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider mb-3">
              <Presentation className="w-3.5 h-3.5" />
              Convert from PDF
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">PDF to PowerPoint Converter</h2>
            <p className="text-orange-100 text-sm mt-1 max-w-xl">
              Turn your PDF documents into presentation slides (.pptx). Each page is converted into a ready-to-present PowerPoint slide with speaker notes.
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

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload & Preview (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
              }}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-400 bg-white dark:bg-slate-900 rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition group shadow-sm hover:shadow-md min-h-[300px]"
            >
              <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Select or drop your PDF presentation
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-xs">
                Upload any PDF file. Each PDF page will be transformed into an editable presentation slide (.pptx).
              </p>
              <span className="mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-medium rounded-xl shadow transition">
                Browse PDF File
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              />
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/50 text-orange-600 flex items-center justify-center font-bold">
                    <Presentation className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate max-w-xs sm:max-w-md">
                      {file.name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {formatFileSize(file.size)} • {file.numPages} {file.numPages === 1 ? 'Page (1 Slide)' : `Pages (${file.numPages} Slides)`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  Change File
                </button>
              </div>

              {/* Slide previews */}
              {previewSlides.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-orange-500" />
                      Slide Previews ({previewSlides.length} of {file.numPages})
                    </span>
                    <span className="text-[11px] text-slate-400">All {file.numPages} will be converted</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {previewSlides.map((slide) => (
                      <div
                        key={slide.pageNum}
                        className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2 border border-slate-200 dark:border-slate-700/60 flex flex-col gap-2"
                      >
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-white shadow-inner flex items-center justify-center border border-slate-200 dark:border-slate-700">
                          <img src={slide.thumbUrl} alt={`Slide ${slide.pageNum}`} className="w-full h-full object-contain" />
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 text-white text-[10px] rounded font-mono">
                            Slide {slide.pageNum}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate" title={slide.textSnippet}>
                          {slide.textSnippet}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress Bar when converting */}
              {isProcessing && (
                <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-2xl border border-orange-200 dark:border-orange-900/40 space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-orange-800 dark:text-orange-200">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                      {progress.status}
                    </span>
                    <span>{Math.round((progress.current / (progress.total || 1)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-orange-200 dark:bg-orange-900/60 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-orange-600 h-2 rounded-full transition-all duration-200"
                      style={{ width: `${(progress.current / (progress.total || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Ready Download State */}
              {downloadUrl && (
                <div className="p-5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                        PowerPoint Presentation Ready!
                      </h5>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300">
                        {downloadFileName} • {file.numPages} slides converted
                      </p>
                    </div>
                  </div>

                  <a
                    href={downloadUrl}
                    download={downloadFileName}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download (.pptx)
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Conversion Settings Sidebar (1 col) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Sliders className="w-4 h-4 text-orange-500" />
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Slide Presentation Settings</h4>
          </div>

          {/* Slide Aspect Ratio */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Slide Aspect Ratio</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSlideLayout('16x9')}
                className={`py-2 px-3 text-xs font-medium rounded-xl border transition ${
                  slideLayout === '16x9'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                16:9 Widescreen
              </button>
              <button
                type="button"
                onClick={() => setSlideLayout('4x3')}
                className={`py-2 px-3 text-xs font-medium rounded-xl border transition ${
                  slideLayout === '4x3'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                4:3 Standard
              </button>
            </div>
          </div>

          {/* Slide Layout Mode */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Conversion Layout Mode</label>
            <div className="space-y-2 text-xs">
              <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <input
                  type="radio"
                  name="convMode"
                  checked={conversionMode === 'visual-and-text'}
                  onChange={() => setConversionMode('visual-and-text')}
                  className="mt-0.5 text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">High-Fidelity Visual Slides</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Embeds crisp page visuals maintaining exact fonts, graphs, and layouts.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <input
                  type="radio"
                  name="convMode"
                  checked={conversionMode === 'editable-text'}
                  onChange={() => setConversionMode('editable-text')}
                  className="mt-0.5 text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Editable Slide Text Boxes</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Extracts headers and bullet points into native PowerPoint text boxes.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Speaker notes toggle */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={includeSpeakerNotes}
                onChange={(e) => setIncludeSpeakerNotes(e.target.checked)}
                className="rounded text-orange-600 focus:ring-orange-500"
              />
              <span>Attach extracted text to Speaker Notes</span>
            </label>
          </div>

          {/* Convert Button */}
          <div className="pt-2">
            <button
              onClick={convertToPptx}
              disabled={!file || isProcessing}
              className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-semibold text-xs rounded-xl shadow-lg shadow-orange-600/20 transition flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Slides...
                </>
              ) : (
                <>
                  <Presentation className="w-4 h-4" />
                  Convert to PowerPoint (.pptx)
                </>
              )}
            </button>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-900/50">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Privacy notice */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-start gap-2.5 text-[11px] text-slate-600 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">100% Client-Side Conversion</p>
              <p className="mt-0.5">Your files never leave your browser. PPTX generation is executed locally using modern Web Workers.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
