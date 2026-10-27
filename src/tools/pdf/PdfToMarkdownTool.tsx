import { useState, useRef } from 'react';
import {
  FileCode,
  Upload,
  Download,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Eye,
  Columns,
  FileText,
  Loader2,
  Sparkles
} from 'lucide-react';
import { pdfjsLib } from '../../utils/pdfHelper';

export default function PdfToMarkdownTool() {
  const [file, setFile] = useState<{
    name: string;
    size: number;
    buffer: ArrayBuffer;
    numPages: number;
  } | null>(null);

  const [markdownText, setMarkdownText] = useState<string>('');
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [includePageDividers, setIncludePageDividers] = useState<boolean>(true);
  const [detectTables, setDetectTables] = useState<boolean>(true);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
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
    setMarkdownText('');

    if (
      uploadedFile.type !== 'application/pdf' &&
      !uploadedFile.name.toLowerCase().endsWith('.pdf')
    ) {
      setErrorMsg('Please select a valid PDF document (.pdf).');
      return;
    }

    setIsConverting(true);
    try {
      const buffer = await uploadedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;

      let fullMd = `# ${uploadedFile.name.replace(/\.[^/.]+$/, '')}\n\n`;

      for (let p = 1; p <= pdf.numPages; p++) {
        if (includePageDividers && p > 1) {
          fullMd += `\n\n---\n<!-- Page ${p} -->\n\n`;
        }

        const page = await pdf.getPage(p);
        const textContent = await page.getTextContent();
        const items = textContent.items as any[];

        if (items.length === 0) continue;

        // Group text items by Y coordinate (lines)
        const lineMap = new Map<number, any[]>();
        for (const item of items) {
          const y = Math.round(item.transform[5]);
          if (!lineMap.has(y)) {
            lineMap.set(y, []);
          }
          lineMap.get(y)!.push(item);
        }

        // Sort descending by Y (top of page down to bottom)
        const sortedYs = Array.from(lineMap.keys()).sort((a, b) => b - a);

        for (const y of sortedYs) {
          const lineItems = lineMap.get(y)!;
          lineItems.sort((a, b) => a.transform[4] - b.transform[4]); // sort left to right

          const lineStr = lineItems.map(i => i.str).join(' ').trim();
          if (!lineStr) continue;

          const maxFontSize = Math.max(...lineItems.map(i => Math.abs(i.transform[0]) || 12));

          // Detect Markdown structural elements
          if (maxFontSize >= 20) {
            fullMd += `\n# ${lineStr}\n`;
          } else if (maxFontSize >= 15) {
            fullMd += `\n## ${lineStr}\n`;
          } else if (maxFontSize >= 13 && lineStr.length < 50) {
            fullMd += `\n### ${lineStr}\n`;
          } else if (lineStr.startsWith('•') || lineStr.startsWith('-') || lineStr.startsWith('*')) {
            fullMd += `- ${lineStr.replace(/^[•\-\*]\s*/, '')}\n`;
          } else if (/^\d+[\.\)]\s+/.test(lineStr)) {
            fullMd += `${lineStr}\n`;
          } else if (detectTables && (lineStr.includes('|') || lineItems.length >= 4)) {
            // Tabular line representation
            const cells = lineStr.split(/\s{2,}|\t/);
            if (cells.length >= 2) {
              fullMd += `| ${cells.join(' | ')} |\n`;
            } else {
              fullMd += `${lineStr}\n\n`;
            }
          } else {
            fullMd += `${lineStr}\n\n`;
          }
        }
      }

      setFile({
        name: uploadedFile.name,
        size: uploadedFile.size,
        buffer,
        numPages: pdf.numPages
      });
      setMarkdownText(fullMd);
      setSuccessMsg(`Successfully converted "${uploadedFile.name}" into clean Markdown!`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to parse PDF document.');
    } finally {
      setIsConverting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(markdownText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarkdownFile = () => {
    if (!file) return;
    const blob = new Blob([markdownText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.name.replace(/\.[^/.]+$/, '')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCode className="w-5 h-5 text-teal-600" />
              PDF to Markdown Converter
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Extract PDF documents into structured GitHub-flavored Markdown (.md) preserving headings, tables, code, and bullet lists.
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
                <FileCode className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Click to browse or drop your PDF document here
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Converts multi-page documents, documentation manuals, and whitepapers into Markdown.
              </p>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {isConverting && (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Analyzing typography & parsing Markdown structure...
            </p>
          </div>
        )}

        {/* Workspace */}
        {file && !isConverting && (
          <div className="mt-6 space-y-4">
            {/* Header info & action bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-teal-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-xs md:max-w-md">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatFileSize(file.size)} • {file.numPages} Pages • {markdownText.split(/\s+/).length.toLocaleString()} Words
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy .md'}
                </button>
                <button
                  onClick={downloadMarkdownFile}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download .md
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

            {/* View Mode Switcher */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode('split')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                    viewMode === 'split' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Split View
                </button>
                <button
                  onClick={() => setViewMode('editor')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                    viewMode === 'editor' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Raw Markdown
                </button>
                <button
                  onClick={() => setViewMode('preview')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                    viewMode === 'preview' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Live Preview
                </button>
              </div>

              <span className="text-[11px] text-slate-500">
                Edit raw Markdown on the left to live-update preview
              </span>
            </div>

            {/* Split / Editor / Preview Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(viewMode === 'split' || viewMode === 'editor') && (
                <div className={`${viewMode === 'editor' ? 'md:col-span-2' : ''} space-y-1`}>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Raw Markdown Output
                  </span>
                  <textarea
                    rows={16}
                    value={markdownText}
                    onChange={e => setMarkdownText(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              )}

              {(viewMode === 'split' || viewMode === 'preview') && (
                <div className={`${viewMode === 'preview' ? 'md:col-span-2' : ''} space-y-1`}>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Rendered Document Preview
                  </span>
                  <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl min-h-[320px] max-h-[460px] overflow-y-auto prose dark:prose-invert prose-xs max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                      {markdownText}
                    </pre>
                  </div>
                </div>
              )}
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
