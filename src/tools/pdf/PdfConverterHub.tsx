import { useState } from 'react';
import {
  FileImage,
  FileText,
  FileSpreadsheet,
  Code2,
  Archive,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Presentation,
  RotateCw,
  Binary,
  Stamp,
  Crop,
  Eraser,
  Lock,
  Unlock,
  FileDiff,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import JpgToPdfTool from './JpgToPdfTool';
import PdfToJpgTool from './PdfToJpgTool';
import OfficeToPdfTool from './OfficeToPdfTool';
import PdfToOfficeTool from './PdfToOfficeTool';
import PdfToPptTool from './PdfToPptTool';
import PdfRotateTool from './PdfRotateTool';
import PdfPageNumberTool from './PdfPageNumberTool';
import PdfWatermarkTool from './PdfWatermarkTool';
import PdfCropTool from './PdfCropTool';
import PdfRedactTool from './PdfRedactTool';
import PdfProtectTool from './PdfProtectTool';
import PdfCompareTool from './PdfCompareTool';

export type ConverterToolType =
  | 'hub'
  | 'jpg-to-pdf'
  | 'word-to-pdf'
  | 'excel-to-pdf'
  | 'html-to-pdf'
  | 'pdf-to-jpg'
  | 'pdf-to-word'
  | 'pdf-to-ppt'
  | 'pdf-to-excel'
  | 'pdf-to-pdfa'
  | 'pdf-rotate'
  | 'pdf-page-numbers'
  | 'pdf-watermark'
  | 'pdf-crop'
  | 'pdf-redact'
  | 'pdf-protect'
  | 'pdf-unlock'
  | 'pdf-compare';

interface PdfConverterHubProps {
  initialConverter?: ConverterToolType;
}

export default function PdfConverterHub({ initialConverter = 'hub' }: PdfConverterHubProps) {
  const [activeConverter, setActiveConverter] = useState<ConverterToolType>(initialConverter);
  const [filterSection, setFilterSection] = useState<'all' | 'to-pdf' | 'from-pdf' | 'edit-pdf' | 'security'>('all');

  const CONVERTERS_TO_PDF = [
    {
      id: 'jpg-to-pdf',
      name: 'JPG to PDF',
      desc: 'Convert JPG, PNG, WebP images to a single or multi-page PDF document with custom margins.',
      icon: FileImage,
      badge: 'Most Popular',
      color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
    },
    {
      id: 'word-to-pdf',
      name: 'WORD to PDF',
      desc: 'Convert Word documents (.doc, .docx, .txt) and formatted articles into clean PDF files.',
      icon: FileText,
      badge: 'Formatting',
      color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
    },
    {
      id: 'excel-to-pdf',
      name: 'EXCEL to PDF',
      desc: 'Transform Excel spreadsheets (.xlsx, .csv) into structured, paginated PDF tables.',
      icon: FileSpreadsheet,
      badge: 'Data Tables',
      color: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800'
    },
    {
      id: 'html-to-pdf',
      name: 'HTML to PDF',
      desc: 'Convert HTML code, web reports, invoices, and Certificates of Analysis to PDF.',
      icon: Code2,
      badge: 'Web & Reports',
      color: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
    }
  ];

  const CONVERTERS_FROM_PDF = [
    {
      id: 'pdf-to-jpg',
      name: 'PDF to JPG',
      desc: 'Extract and render each PDF page into crisp, high-resolution JPG or PNG images.',
      icon: FileImage,
      badge: 'High DPI',
      color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
    },
    {
      id: 'pdf-to-word',
      name: 'PDF to WORD',
      desc: 'Extract text and document headings from PDF into editable Word (.doc) and plain text.',
      icon: FileText,
      badge: 'Editable Doc',
      color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
    },
    {
      id: 'pdf-to-ppt',
      name: 'PDF to POWERPOINT',
      desc: 'Transform PDF pages into editable PowerPoint (.pptx) slides with embedded speaker notes.',
      icon: Presentation,
      badge: 'New',
      color: 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800'
    },
    {
      id: 'pdf-to-excel',
      name: 'PDF to EXCEL',
      desc: 'Extract tabular records and columns from PDF into Excel (.xlsx) and CSV spreadsheets.',
      icon: FileSpreadsheet,
      badge: 'Table Parsing',
      color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
    },
    {
      id: 'pdf-to-pdfa',
      name: 'PDF to PDF/A',
      desc: 'Standardize PDF into ISO 19005-1 compliant PDF/A for long-term legal and QC archival.',
      icon: Archive,
      badge: 'ISO Standard',
      color: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800'
    }
  ];

  const EDIT_PDF_TOOLS = [
    {
      id: 'pdf-rotate',
      name: 'Rotate PDF',
      desc: 'Rotate your PDFs the way you need them. Rotate single pages or entire documents 90°, 180°, or 270°.',
      icon: RotateCw,
      badge: 'Page Control',
      color: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800'
    },
    {
      id: 'pdf-page-numbers',
      name: 'Add Page Numbers',
      desc: 'Insert custom pagination into PDFs. Select typography, position, format, and skip cover pages.',
      icon: Binary,
      badge: 'Pagination',
      color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
    },
    {
      id: 'pdf-watermark',
      name: 'Add Watermark',
      desc: 'Stamp custom text or logo image watermark across PDF pages with rotation and opacity controls.',
      icon: Stamp,
      badge: 'Branding',
      color: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800'
    },
    {
      id: 'pdf-crop',
      name: 'Crop PDF Margins',
      desc: 'Trim whitespace, scanner edges, or page margins with live visual preview and exact measurements.',
      icon: Crop,
      badge: 'Trimming',
      color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
    },
    {
      id: 'pdf-redact',
      name: 'Redact & Edit PDF',
      desc: 'Permanently blackout sensitive personal records, SSNs, and confidential clauses with burned-in masking.',
      icon: Eraser,
      badge: 'Privacy Shield',
      color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700'
    }
  ];

  const PDF_SECURITY_TOOLS = [
    {
      id: 'pdf-protect',
      name: 'Protect PDF',
      desc: 'Encrypt your PDF with a password. Restrict copying, modification, and unauthorized printing.',
      icon: Lock,
      badge: 'Encryption',
      color: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
    },
    {
      id: 'pdf-unlock',
      name: 'Unlock PDF',
      desc: 'Remove PDF password security and permissions restrictions so you can freely view and print.',
      icon: Unlock,
      badge: 'Decryption',
      color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
    },
    {
      id: 'pdf-compare',
      name: 'Compare PDF Files',
      desc: 'Inspect two revisions of a PDF side-by-side or using visual overlay difference to spot altered values.',
      icon: FileDiff,
      badge: 'Audit & Diff',
      color: 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800'
    }
  ];

  // If a specific converter is active, render it with navigation bar
  if (activeConverter !== 'hub') {
    return (
      <div className="space-y-4">
        {/* Navigation Bar between converters */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 flex items-center justify-between text-xs shadow-xs overflow-x-auto gap-2">
          <button
            type="button"
            onClick={() => setActiveConverter('hub')}
            className="flex items-center gap-1.5 px-3 py-1.5 font-semibold text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 bg-slate-100 dark:bg-slate-800 rounded-xl transition shrink-0"
          >
            ← All PDF Tools
          </button>

          {/* Quick tab switch */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {[
              { id: 'jpg-to-pdf', label: 'JPG to PDF' },
              { id: 'word-to-pdf', label: 'Word to PDF' },
              { id: 'excel-to-pdf', label: 'Excel to PDF' },
              { id: 'html-to-pdf', label: 'HTML to PDF' },
              { id: 'pdf-to-jpg', label: 'PDF to JPG' },
              { id: 'pdf-to-word', label: 'PDF to Word' },
              { id: 'pdf-to-ppt', label: 'PDF to PPT' },
              { id: 'pdf-to-excel', label: 'PDF to Excel' },
              { id: 'pdf-to-pdfa', label: 'PDF/A' },
              { id: 'pdf-rotate', label: 'Rotate' },
              { id: 'pdf-page-numbers', label: 'Page Numbers' },
              { id: 'pdf-watermark', label: 'Watermark' },
              { id: 'pdf-crop', label: 'Crop' },
              { id: 'pdf-redact', label: 'Redact' },
              { id: 'pdf-protect', label: 'Protect' },
              { id: 'pdf-compare', label: 'Compare' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveConverter(tab.id as ConverterToolType)}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                  activeConverter === tab.id
                    ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Converter Tool Instance */}
        {activeConverter === 'jpg-to-pdf' && <JpgToPdfTool onSwitchConverter={(id) => setActiveConverter(id as ConverterToolType)} />}
        {activeConverter === 'pdf-to-jpg' && <PdfToJpgTool onSwitchConverter={(id) => setActiveConverter(id as ConverterToolType)} />}
        {activeConverter === 'word-to-pdf' && <OfficeToPdfTool initialMode="word" onSwitchConverter={(id) => setActiveConverter(id as ConverterToolType)} />}
        {activeConverter === 'excel-to-pdf' && <OfficeToPdfTool initialMode="excel" onSwitchConverter={(id) => setActiveConverter(id as ConverterToolType)} />}
        {activeConverter === 'html-to-pdf' && <OfficeToPdfTool initialMode="html" onSwitchConverter={(id) => setActiveConverter(id as ConverterToolType)} />}
        {activeConverter === 'pdf-to-word' && <PdfToOfficeTool initialMode="word" onSwitchConverter={(id) => setActiveConverter(id as ConverterToolType)} />}
        {activeConverter === 'pdf-to-ppt' && <PdfToPptTool onSwitchConverter={(id) => setActiveConverter(id as ConverterToolType)} />}
        {activeConverter === 'pdf-to-excel' && <PdfToOfficeTool initialMode="excel" onSwitchConverter={(id) => setActiveConverter(id as ConverterToolType)} />}
        {activeConverter === 'pdf-to-pdfa' && <PdfToOfficeTool initialMode="pdfa" onSwitchConverter={(id) => setActiveConverter(id as ConverterToolType)} />}
        {activeConverter === 'pdf-rotate' && <PdfRotateTool onSwitchConverter={(id) => setActiveConverter(id as ConverterToolType)} />}
        {activeConverter === 'pdf-page-numbers' && <PdfPageNumberTool onSwitchConverter={(id) => setActiveConverter(id as ConverterToolType)} />}
        {activeConverter === 'pdf-watermark' && <PdfWatermarkTool onSwitchConverter={(id) => setActiveConverter(id as ConverterToolType)} />}
        {activeConverter === 'pdf-crop' && <PdfCropTool onSwitchConverter={(id) => setActiveConverter(id as ConverterToolType)} />}
        {activeConverter === 'pdf-redact' && <PdfRedactTool onSwitchConverter={(id) => setActiveConverter(id as ConverterToolType)} />}
        {activeConverter === 'pdf-protect' && <PdfProtectTool initialMode="protect" onSwitchConverter={(id) => setActiveConverter(id as ConverterToolType)} />}
        {activeConverter === 'pdf-unlock' && <PdfProtectTool initialMode="unlock" onSwitchConverter={(id) => setActiveConverter(id as ConverterToolType)} />}
        {activeConverter === 'pdf-compare' && <PdfCompareTool onSwitchConverter={(id) => setActiveConverter(id as ConverterToolType)} />}
      </div>
    );
  }

  // Master Dashboard View (iLovePDF full suite)
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Complete PDF & Document Converters Suite • 100% In-Browser Privacy
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Universal PDF Converters & Editors
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Convert JPG, Word, Excel, and HTML directly to PDF, export to PowerPoint (.pptx), Word, and Excel, rotate pages, add watermarks, paginate, crop, redact sensitive data, and protect documents with zero server uploads.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="mt-6 flex flex-wrap gap-2 pt-2 border-t border-white/10">
          {[
            { id: 'all', label: 'All PDF Tools' },
            { id: 'to-pdf', label: 'Convert TO PDF' },
            { id: 'from-pdf', label: 'Convert FROM PDF' },
            { id: 'edit-pdf', label: 'Edit PDF' },
            { id: 'security', label: 'PDF Security & Audit' }
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterSection(f.id as any)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
                filterSection === f.id
                  ? 'bg-teal-500 text-white shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section 1: CONVERT TO PDF */}
      {(filterSection === 'all' || filterSection === 'to-pdf') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                CONVERT TO PDF
              </h2>
            </div>
            <span className="text-xs text-slate-400">{CONVERTERS_TO_PDF.length} Tools</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CONVERTERS_TO_PDF.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveConverter(c.id as ConverterToolType)}
                  className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-500 rounded-2xl p-5 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-3 rounded-xl border ${c.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {c.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                      {c.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                      {c.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-teal-600 dark:text-teal-400">
                    <span>Launch Tool</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 2: CONVERT FROM PDF */}
      {(filterSection === 'all' || filterSection === 'from-pdf') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                CONVERT FROM PDF
              </h2>
            </div>
            <span className="text-xs text-slate-400">{CONVERTERS_FROM_PDF.length} Tools</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CONVERTERS_FROM_PDF.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveConverter(c.id as ConverterToolType)}
                  className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 rounded-2xl p-5 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-3 rounded-xl border ${c.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {c.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                      {c.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                      {c.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400">
                    <span>Launch Tool</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 3: EDIT PDF */}
      {(filterSection === 'all' || filterSection === 'edit-pdf') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                EDIT PDF
              </h2>
            </div>
            <span className="text-xs text-slate-400">{EDIT_PDF_TOOLS.length} Tools</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {EDIT_PDF_TOOLS.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveConverter(c.id as ConverterToolType)}
                  className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500 rounded-2xl p-5 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-3 rounded-xl border ${c.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {c.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                      {c.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                      {c.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400">
                    <span>Launch Tool</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 4: PDF SECURITY & AUDIT */}
      {(filterSection === 'all' || filterSection === 'security') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                PDF SECURITY & AUDIT
              </h2>
            </div>
            <span className="text-xs text-slate-400">{PDF_SECURITY_TOOLS.length} Tools</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PDF_SECURITY_TOOLS.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveConverter(c.id as ConverterToolType)}
                  className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-500 rounded-2xl p-5 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-3 rounded-xl border ${c.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {c.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition">
                      {c.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                      {c.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-rose-600 dark:text-rose-400">
                    <span>Launch Tool</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Security & Client-Side Processing Pledge */}
      <div className="p-6 bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-300 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              100% In-Browser & End-to-End Private
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Your PDFs, Word files, images, and data are processed exclusively inside your computer’s memory. No uploads or remote server logs.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-teal-600 dark:text-teal-400">
          <CheckCircle2 className="w-4 h-4" />
          <span>Compliant for Confidential Data</span>
        </div>
      </div>
    </div>
  );
}
