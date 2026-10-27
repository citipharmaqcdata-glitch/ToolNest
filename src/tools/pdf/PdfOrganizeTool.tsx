import { useState, useRef } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import {
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Eye,
  Loader2,
  MoveLeft,
  MoveRight,
  RotateCw,
  RotateCcw,
  Copy,
  Trash2,
  Plus,
  RotateCcw as ResetIcon,
  LayoutGrid,
  FileText
} from 'lucide-react';
import { pdfjsLib } from '../../utils/pdfHelper';

interface PageItem {
  id: string;
  originalPageNumber: number; // 1-indexed
  dataUrl: string;
  rotation: number; // 0, 90, 180, 270
  isBlank?: boolean;
}

export default function PdfOrganizeTool() {
  const [file, setFile] = useState<{
    name: string;
    size: number;
    buffer: ArrayBuffer;
    numPages: number;
  } | null>(null);

  const [pages, setPages] = useState<PageItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [outputFileName, setOutputFileName] = useState<string>('organized-document.pdf');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFileUpload = async (uploadedFile: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);
    setPages([]);

    if (
      uploadedFile.type !== 'application/pdf' &&
      !uploadedFile.name.toLowerCase().endsWith('.pdf')
    ) {
      setErrorMsg('Please select a valid PDF document (.pdf).');
      setIsLoading(false);
      return;
    }

    try {
      const buffer = await uploadedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
      const pdfLibDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const loadedPages: PageItem[] = [];

      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const pdfLibPage = pdfLibDoc.getPage(p - 1);
        const initialRot = pdfLibPage.getRotation().angle || 0;

        const viewport = page.getViewport({ scale: 0.45 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: ctx, viewport } as any).promise;
        }

        loadedPages.push({
          id: `page-${p}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          originalPageNumber: p,
          dataUrl: canvas.toDataURL('image/jpeg', 0.8),
          rotation: initialRot
        });
      }

      setFile({
        name: uploadedFile.name,
        size: uploadedFile.size,
        buffer,
        numPages: pdf.numPages
      });
      setPages(loadedPages);
      const cleanName = uploadedFile.name.replace(/\.[^/.]+$/, '');
      setOutputFileName(`${cleanName}-organized.pdf`);
      setSuccessMsg(`Loaded "${uploadedFile.name}" with ${pdf.numPages} pages. Reorder, rotate, or duplicate pages below.`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Could not read this PDF. It may be password-protected or corrupted.');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const movePage = (index: number, direction: 'left' | 'right') => {
    if (
      (direction === 'left' && index === 0) ||
      (direction === 'right' && index === pages.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    setPages(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  const rotatePage = (index: number, delta: number) => {
    setPages(prev => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        rotation: (next[index].rotation + delta + 360) % 360
      };
      return next;
    });
  };

  const duplicatePage = (index: number) => {
    setPages(prev => {
      const target = prev[index];
      const cloned: PageItem = {
        ...target,
        id: `page-copy-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
      };
      const next = [...prev];
      next.splice(index + 1, 0, cloned);
      return next;
    });
  };

  const deletePage = (index: number) => {
    if (pages.length <= 1) {
      setErrorMsg('At least one page must remain in the document.');
      return;
    }
    setPages(prev => prev.filter((_, i) => i !== index));
  };

  const addBlankPage = () => {
    // Generate blank thumbnail
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 300, 400);
      ctx.strokeStyle = '#E2E8F0';
      ctx.strokeRect(10, 10, 280, 380);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Blank Page', 150, 200);
    }

    const blankItem: PageItem = {
      id: `blank-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      originalPageNumber: -1,
      dataUrl: canvas.toDataURL(),
      rotation: 0,
      isBlank: true
    };
    setPages(prev => [...prev, blankItem]);
  };

  const handleSaveOrganizedPdf = async () => {
    if (!file || pages.length === 0) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const srcDoc = await PDFDocument.load(file.buffer, { ignoreEncryption: true });
      const newDoc = await PDFDocument.create();

      for (const item of pages) {
        if (item.isBlank) {
          // Standard A4 blank page
          const blankPage = newDoc.addPage([595.28, 841.89]);
          blankPage.setRotation(degrees(item.rotation));
        } else {
          const originalIndex = item.originalPageNumber - 1;
          const [copiedPage] = await newDoc.copyPages(srcDoc, [originalIndex]);
          copiedPage.setRotation(degrees(item.rotation));
          newDoc.addPage(copiedPage);
        }
      }

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = outputFileName || 'organized-document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccessMsg(`Successfully saved organized PDF with ${pages.length} pages.`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to compile organized PDF. Please try again.');
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
              <LayoutGrid className="w-5 h-5 text-teal-600" />
              Organize PDF Pages
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Visually sort, reorder, rotate, duplicate, or insert blank pages into your PDF documents.
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
                <LayoutGrid className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Click to browse or drop your PDF document here
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Visual interactive organizer with live page thumbnail manipulation.
              </p>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Loading visual page organizer workspace...
            </p>
          </div>
        )}

        {/* Organizer Workspace */}
        {file && !isLoading && (
          <div className="mt-6 space-y-6">
            {/* Header info & action bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-teal-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-xs md:max-w-md">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatFileSize(file.size)} • {pages.length} Pages in New Layout
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={addBlankPage}
                  className="px-3 py-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 rounded-xl hover:bg-teal-100 flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Blank Page
                </button>
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
            </div>

            {/* Visual Page Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 max-h-[600px] overflow-y-auto">
              {pages.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 flex flex-col shadow-sm hover:shadow-md transition-shadow relative"
                >
                  {/* Top bar */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700/60 mb-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1">
                      <span className="w-5 h-5 bg-teal-600 text-white rounded-full flex items-center justify-center text-[10px]">
                        {index + 1}
                      </span>
                      {item.isBlank ? (
                        <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">(Blank)</span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Orig p.{item.originalPageNumber}</span>
                      )}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {item.rotation}°
                    </span>
                  </div>

                  {/* Thumbnail */}
                  <div className="relative w-full aspect-[3/4] bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center p-2 mb-3">
                    <img
                      src={item.dataUrl}
                      alt={`Page ${index + 1}`}
                      style={{ transform: `rotate(${item.rotation}deg)` }}
                      className="max-w-full max-h-full object-contain transition-transform duration-200"
                    />
                  </div>

                  {/* Controls Toolbar */}
                  <div className="grid grid-cols-6 gap-1 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    {/* Move Left */}
                    <button
                      onClick={() => movePage(index, 'left')}
                      disabled={index === 0}
                      title="Move Left"
                      className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 flex items-center justify-center"
                    >
                      <MoveLeft className="w-3.5 h-3.5" />
                    </button>
                    {/* Move Right */}
                    <button
                      onClick={() => movePage(index, 'right')}
                      disabled={index === pages.length - 1}
                      title="Move Right"
                      className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 flex items-center justify-center"
                    >
                      <MoveRight className="w-3.5 h-3.5" />
                    </button>
                    {/* Rotate CCW */}
                    <button
                      onClick={() => rotatePage(index, -90)}
                      title="Rotate -90°"
                      className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    {/* Rotate CW */}
                    <button
                      onClick={() => rotatePage(index, 90)}
                      title="Rotate +90°"
                      className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                    {/* Duplicate */}
                    <button
                      onClick={() => duplicatePage(index)}
                      title="Duplicate Page"
                      className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => deletePage(index)}
                      disabled={pages.length <= 1}
                      title="Delete Page"
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 disabled:opacity-30 flex items-center justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Output configuration & Save Action */}
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
                onClick={handleSaveOrganizedPdf}
                disabled={isProcessing || pages.length === 0}
                className="w-full sm:w-auto px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Compiling Organized PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Save & Download Organized PDF ({pages.length} Pages)
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
