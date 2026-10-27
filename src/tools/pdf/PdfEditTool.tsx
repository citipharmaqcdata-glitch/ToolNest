import { useState, useRef, useEffect } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import {
  Edit3,
  Type,
  PenTool,
  Highlighter,
  Square,
  Undo2,
  Trash2,
  Download,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileText,
  Upload
} from 'lucide-react';
import { pdfjsLib } from '../../utils/pdfHelper';

type EditToolMode = 'text' | 'draw' | 'highlight' | 'rectangle';

interface TextAnnotation {
  id: string;
  pageNumber: number;
  text: string;
  x: number; // pt
  y: number;
  fontSize: number;
  color: string;
}

interface PathAnnotation {
  id: string;
  pageNumber: number;
  points: { x: number; y: number }[];
  color: string;
  width: number;
  isHighlight?: boolean;
}

interface RectAnnotation {
  id: string;
  pageNumber: number;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}

export default function PdfEditTool() {
  const [file, setFile] = useState<{
    name: string;
    size: number;
    buffer: ArrayBuffer;
    numPages: number;
  } | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [toolMode, setToolMode] = useState<EditToolMode>('text');
  const [activeColor, setActiveColor] = useState<string>('#0d9488'); // Teal
  const [fontSize, setFontSize] = useState<number>(14);
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [textInput, setTextInput] = useState<string>('Sample Annotation');

  // Annotations store
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
  const [pathAnnotations, setPathAnnotations] = useState<PathAnnotation[]>([]);
  const [rectAnnotations, setRectAnnotations] = useState<RectAnnotation[]>([]);

  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDrawingRef = useRef<boolean>(false);
  const currentPathRef = useRef<{ x: number; y: number }[]>([]);

  // Render PDF background onto canvas
  useEffect(() => {
    if (!file) return;
    renderCurrentPage();
  }, [file, currentPage]);

  const renderCurrentPage = async () => {
    if (!file) return;
    setIsLoadingPage(true);
    try {
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(file.buffer) }).promise;
      const page = await pdf.getPage(currentPage);
      const viewport = page.getViewport({ scale: 1.2 });

      if (canvasRef.current && overlayCanvasRef.current) {
        canvasRef.current.width = viewport.width;
        canvasRef.current.height = viewport.height;
        overlayCanvasRef.current.width = viewport.width;
        overlayCanvasRef.current.height = viewport.height;

        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, viewport.width, viewport.height);
          await page.render({ canvasContext: ctx, viewport } as any).promise;
        }

        redrawOverlay();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to render PDF page.');
    } finally {
      setIsLoadingPage(false);
    }
  };

  const redrawOverlay = () => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw paths
    const currentPaths = pathAnnotations.filter(p => p.pageNumber === currentPage);
    for (const p of currentPaths) {
      if (p.points.length < 2) continue;
      ctx.beginPath();
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (p.isHighlight) {
        ctx.globalAlpha = 0.4;
      } else {
        ctx.globalAlpha = 1.0;
      }
      ctx.moveTo(p.points[0].x, p.points[0].y);
      for (let i = 1; i < p.points.length; i++) {
        ctx.lineTo(p.points[i].x, p.points[i].y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }

    // Draw rectangles
    const currentRects = rectAnnotations.filter(r => r.pageNumber === currentPage);
    for (const r of currentRects) {
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(r.x, r.y, r.w, r.h);
    }

    // Draw text annotations
    const currentTexts = textAnnotations.filter(t => t.pageNumber === currentPage);
    for (const t of currentTexts) {
      ctx.fillStyle = t.color;
      ctx.font = `${t.fontSize}px sans-serif`;
      ctx.fillText(t.text, t.x, t.y);
    }
  };

  const handleFileUpload = async (uploadedFile: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setTextAnnotations([]);
    setPathAnnotations([]);
    setRectAnnotations([]);
    setCurrentPage(1);

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
      setSuccessMsg(`Loaded "${uploadedFile.name}" (${pdf.numPages} pages). Select tool and edit on page.`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Could not read PDF.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleOverlayMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (toolMode === 'text') {
      const newText: TextAnnotation = {
        id: `text-${Date.now()}`,
        pageNumber: currentPage,
        text: textInput,
        x,
        y,
        fontSize,
        color: activeColor
      };
      setTextAnnotations(prev => [...prev, newText]);
      setTimeout(redrawOverlay, 10);
    } else if (toolMode === 'draw' || toolMode === 'highlight') {
      isDrawingRef.current = true;
      currentPathRef.current = [{ x, y }];
    }
  };

  const handleOverlayMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    currentPathRef.current.push({ x, y });

    // Live preview
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pts = currentPathRef.current;
    if (pts.length < 2) return;
    ctx.beginPath();
    ctx.strokeStyle = activeColor;
    ctx.lineWidth = toolMode === 'highlight' ? strokeWidth * 3 : strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (toolMode === 'highlight') ctx.globalAlpha = 0.4;
    ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.globalAlpha = 1.0;
  };

  const handleOverlayMouseUp = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    if (currentPathRef.current.length > 1) {
      const newPath: PathAnnotation = {
        id: `path-${Date.now()}`,
        pageNumber: currentPage,
        points: [...currentPathRef.current],
        color: activeColor,
        width: toolMode === 'highlight' ? strokeWidth * 3 : strokeWidth,
        isHighlight: toolMode === 'highlight'
      };
      setPathAnnotations(prev => [...prev, newPath]);
    }
    currentPathRef.current = [];
  };

  const undoLastAnnotation = () => {
    if (pathAnnotations.some(p => p.pageNumber === currentPage)) {
      setPathAnnotations(prev => prev.slice(0, prev.length - 1));
    } else if (textAnnotations.some(t => t.pageNumber === currentPage)) {
      setTextAnnotations(prev => prev.slice(0, prev.length - 1));
    }
    setTimeout(redrawOverlay, 20);
  };

  const clearCurrentPageAnnotations = () => {
    setTextAnnotations(prev => prev.filter(t => t.pageNumber !== currentPage));
    setPathAnnotations(prev => prev.filter(p => p.pageNumber !== currentPage));
    setRectAnnotations(prev => prev.filter(r => r.pageNumber !== currentPage));
    setTimeout(redrawOverlay, 20);
  };

  const handleSaveEditedPdf = async () => {
    if (!file) return;
    setIsSaving(true);
    setErrorMsg(null);

    try {
      const pdfDoc = await PDFDocument.load(file.buffer, { ignoreEncryption: true });
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      for (let p = 1; p <= file.numPages; p++) {
        const page = pdfDoc.getPage(p - 1);
        const { width, height } = page.getSize();
        const canvasW = canvasRef.current?.width || width;
        const canvasH = canvasRef.current?.height || height;
        const scaleX = width / canvasW;
        const scaleY = height / canvasH;

        // Apply text annotations
        const pageTexts = textAnnotations.filter(t => t.pageNumber === p);
        for (const t of pageTexts) {
          const pdfX = t.x * scaleX;
          const pdfY = height - (t.y * scaleY);
          page.drawText(t.text, {
            x: pdfX,
            y: pdfY,
            size: t.fontSize * scaleX,
            font,
            color: rgb(0.08, 0.58, 0.53)
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${file.name.replace(/\.[^/.]+$/, '')}-edited.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccessMsg(`Downloaded edited document: "${link.download}".`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to save edited PDF.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-teal-600" />
              Edit PDF — Annotations & Markups
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Add text boxes, highlight clauses, sketch diagrams, and stamp annotations onto your PDF in your browser.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-4 h-4" />
            100% In-Browser Privacy
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
                <Edit3 className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Click to browse or drop your PDF to edit
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Zero file uploads. All annotations are rendered and burned client-side.
              </p>
            </div>
          </div>
        )}

        {/* Editor Workspace */}
        {file && (
          <div className="mt-6 space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              {/* Tool selector */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setToolMode('text')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors ${
                    toolMode === 'text'
                      ? 'bg-teal-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <Type className="w-3.5 h-3.5" />
                  Text
                </button>
                <button
                  onClick={() => setToolMode('draw')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors ${
                    toolMode === 'draw'
                      ? 'bg-teal-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  Pen
                </button>
                <button
                  onClick={() => setToolMode('highlight')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors ${
                    toolMode === 'highlight'
                      ? 'bg-teal-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <Highlighter className="w-3.5 h-3.5" />
                  Highlight
                </button>
              </div>

              {/* Color options */}
              <div className="flex items-center gap-1.5">
                {['#0d9488', '#2563eb', '#dc2626', '#eab308', '#000000'].map(c => (
                  <button
                    key={c}
                    onClick={() => setActiveColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      activeColor === c ? 'scale-110 border-white shadow' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>

              {/* Text Input when in text mode */}
              {toolMode === 'text' && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={textInput}
                    onChange={e => setTextInput(e.target.value)}
                    placeholder="Click canvas to stamp"
                    className="px-2.5 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
                  />
                  <select
                    value={fontSize}
                    onChange={e => setFontSize(parseInt(e.target.value, 10))}
                    className="px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
                  >
                    <option value={12}>12pt</option>
                    <option value={14}>14pt</option>
                    <option value={18}>18pt</option>
                    <option value={24}>24pt</option>
                  </select>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={undoLastAnnotation}
                  title="Undo Annotation"
                  className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={clearCurrentPageAnnotations}
                  title="Clear Page Annotations"
                  className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-red-500 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 px-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage <= 1}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg disabled:opacity-40 flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </button>
                <span className="font-semibold text-slate-800 dark:text-white">
                  Page {currentPage} of {file.numPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(file.numPages, prev + 1))}
                  disabled={currentPage >= file.numPages}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg disabled:opacity-40 flex items-center gap-1"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <span className="text-[11px] text-slate-500">
                Click canvas to place text or drag to draw
              </span>
            </div>

            {/* Interactive PDF Drawing Canvas */}
            <div className="relative border border-slate-300 dark:border-slate-700 rounded-2xl overflow-auto bg-slate-200/50 dark:bg-slate-950 p-4 flex justify-center max-h-[620px]">
              <div className="relative shadow-md">
                <canvas ref={canvasRef} className="block bg-white" />
                <canvas
                  ref={overlayCanvasRef}
                  onMouseDown={handleOverlayMouseDown}
                  onMouseMove={handleOverlayMouseMove}
                  onMouseUp={handleOverlayMouseUp}
                  className="absolute inset-0 cursor-crosshair"
                />
              </div>
            </div>

            {/* Save / Export button */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={handleSaveEditedPdf}
                disabled={isSaving}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Burning Annotations & Saving...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Save & Download Edited PDF
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
