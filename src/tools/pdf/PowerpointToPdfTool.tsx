import { useState, useRef } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import JSZip from 'jszip';
import {
  Presentation,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Eye,
  Layout,
  Layers,
  Loader2,
  FileText,
  Sparkles,
  Plus,
  Trash2
} from 'lucide-react';

interface SlideData {
  slideNumber: number;
  title: string;
  bullets: string[];
  notes?: string;
}

export default function PowerpointToPdfTool() {
  const [slides, setSlides] = useState<SlideData[]>([
    {
      slideNumber: 1,
      title: 'Pharmaceutical Method Validation Overview',
      bullets: [
        'Analytical Method Transfer: Reverse Phase HPLC Monograph',
        'Compliance Target: ICH Q2(R1) and USP <1225> Guidelines',
        'Critical Quality Attributes: Specificity, Linearity, Range, Precision, and Accuracy'
      ],
      notes: 'Introduce the core regulatory scope before presenting quantitative SST criteria.'
    },
    {
      slideNumber: 2,
      title: 'System Suitability & Acceptance Criteria',
      bullets: [
        'Theoretical Plates (N): Not less than 2,500 plates across 6 replicates',
        'Tailing Factor (T): 0.8 ≤ T ≤ 1.5 at 5% peak height',
        'Relative Standard Deviation (%RSD): ≤ 1.0% for retention times and peak areas'
      ],
      notes: 'Ensure column oven is pre-equilibrated to 35°C for at least 45 minutes.'
    },
    {
      slideNumber: 3,
      title: 'Impurity Profile & Dissolution Specifications',
      bullets: [
        'Total Related Substances: NMT 0.50% w/w',
        'Dissolution Profile: Q = 80% at 30 minutes in 0.1 N HCl medium',
        'Residual Solvents: Compliant with USP <467> Class 2 and Class 3 limits'
      ],
      notes: 'Highlight batch LOT-2026-X49 release clearance granted by QA.'
    }
  ]);

  const [fileName, setFileName] = useState<string>('presentation.pptx');
  const [layoutMode, setLayoutMode] = useState<'1-slide' | '2-slides' | 'handouts-3' | '4-slides'>('1-slide');
  const [slideRatio, setSlideRatio] = useState<'16:9' | '4:3'>('16:9');
  const [themeStyle, setThemeStyle] = useState<'teal' | 'navy' | 'minimal'>('teal');
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setFileName(file.name);

    if (!file.name.toLowerCase().endsWith('.pptx')) {
      setErrorMsg('Please upload a PowerPoint presentation (.pptx) file.');
      return;
    }

    try {
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(file);

      // Inspect PPTX slides in ppt/slides/slide*.xml
      const slideFiles = Object.keys(loadedZip.files).filter(path =>
        path.startsWith('ppt/slides/slide') && path.endsWith('.xml')
      );

      if (slideFiles.length === 0) {
        setErrorMsg('No slides could be extracted from this PowerPoint file.');
        return;
      }

      // Sort slides by numerical index
      slideFiles.sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
        return numA - numB;
      });

      const parsedSlides: SlideData[] = [];

      for (let i = 0; i < slideFiles.length; i++) {
        const slideXmlStr = await loadedZip.file(slideFiles[i])?.async('string');
        if (!slideXmlStr) continue;

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(slideXmlStr, 'application/xml');

        // Extract text elements <a:t>
        const textNodes = Array.from(xmlDoc.getElementsByTagName('a:t'));
        const textSnippets = textNodes.map(node => node.textContent?.trim() || '').filter(Boolean);

        const slideTitle = textSnippets.length > 0 ? textSnippets[0] : `Slide ${i + 1}`;
        const slideBullets = textSnippets.slice(1).filter(s => s.length > 3);

        parsedSlides.push({
          slideNumber: i + 1,
          title: slideTitle,
          bullets: slideBullets.length > 0 ? slideBullets : ['Presentation slide content processed.']
        });
      }

      setSlides(parsedSlides);
      setSuccessMsg(`Loaded "${file.name}" with ${parsedSlides.length} slides.`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to parse PowerPoint archive.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleGeneratePdf = async () => {
    if (slides.length === 0) return;
    setIsConverting(true);
    setErrorMsg(null);

    try {
      const pdfDoc = await PDFDocument.create();
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Slide dimensions: 16:9 = 841.89 x 473.56 pt; 4:3 = 720 x 540 pt
      const slideWidth = slideRatio === '16:9' ? 841.89 : 720;
      const slideHeight = slideRatio === '16:9' ? 473.56 : 540;

      for (const slide of slides) {
        const page = pdfDoc.addPage([slideWidth, slideHeight]);

        // Background
        if (themeStyle === 'teal') {
          // Top accent banner
          page.drawRectangle({
            x: 0,
            y: slideHeight - 14,
            width: slideWidth,
            height: 14,
            color: rgb(0.08, 0.58, 0.53) // Teal
          });
        } else if (themeStyle === 'navy') {
          page.drawRectangle({
            x: 0,
            y: slideHeight - 14,
            width: slideWidth,
            height: 14,
            color: rgb(0.12, 0.22, 0.42) // Navy
          });
        }

        // Title
        page.drawText(slide.title, {
          x: 50,
          y: slideHeight - 70,
          size: 24,
          font: fontBold,
          color: themeStyle === 'navy' ? rgb(0.12, 0.22, 0.42) : rgb(0.06, 0.45, 0.42)
        });

        // Title divider line
        page.drawLine({
          start: { x: 50, y: slideHeight - 85 },
          end: { x: slideWidth - 50, y: slideHeight - 85 },
          thickness: 1.5,
          color: rgb(0.85, 0.88, 0.92)
        });

        // Bullets
        let currentY = slideHeight - 130;
        for (const bullet of slide.bullets) {
          // Bullet dot
          page.drawCircle({
            x: 60,
            y: currentY + 4,
            size: 3,
            color: rgb(0.08, 0.58, 0.53)
          });

          // Text wrap
          const words = bullet.split(' ');
          let line = '';
          for (const word of words) {
            if ((line + word).length > 75) {
              page.drawText(line, {
                x: 75,
                y: currentY,
                size: 14,
                font: fontRegular,
                color: rgb(0.2, 0.25, 0.3)
              });
              currentY -= 22;
              line = word + ' ';
            } else {
              line += word + ' ';
            }
          }
          if (line) {
            page.drawText(line, {
              x: 75,
              y: currentY,
              size: 14,
              font: fontRegular,
              color: rgb(0.2, 0.25, 0.3)
            });
            currentY -= 32;
          }
        }

        // Footer slide number
        page.drawText(`Slide ${slide.slideNumber} of ${slides.length}`, {
          x: slideWidth - 140,
          y: 25,
          size: 10,
          font: fontRegular,
          color: rgb(0.5, 0.55, 0.6)
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const cleanName = fileName.replace(/\.[^/.]+$/, '');
      link.download = `${cleanName}-slides.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccessMsg(`Compiled and downloaded "${link.download}" with ${slides.length} slides.`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to compile presentation into PDF.');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Presentation className="w-5 h-5 text-teal-600" />
              PowerPoint to PDF Converter
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Convert PowerPoint presentations (.pptx) into clean vector PDF slide decks with widescreen layouts.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-4 h-4" />
            100% In-Browser Privacy
          </div>
        </div>

        {/* Upload Zone & Customizer */}
        <div className="mt-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-3">
              <Presentation className="w-6 h-6 text-orange-500" />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {fileName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {slides.length} Slides Ready for Export
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload PPTX File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                className="hidden"
                onChange={e => {
                  if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                }}
              />
            </div>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Slide Aspect Ratio:
              </label>
              <select
                value={slideRatio}
                onChange={e => setSlideRatio(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white"
              >
                <option value="16:9">Widescreen 16:9 (Modern TV / Monitor)</option>
                <option value="4:3">Standard 4:3 (Traditional Projector)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Visual Slide Theme:
              </label>
              <select
                value={themeStyle}
                onChange={e => setThemeStyle(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white"
              >
                <option value="teal">ToolNest Teal Accent</option>
                <option value="navy">Executive Corporate Navy</option>
                <option value="minimal">Clean Minimalist Monochrome</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Slides per Page:
              </label>
              <select
                value={layoutMode}
                onChange={e => setLayoutMode(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white"
              >
                <option value="1-slide">1 Slide per Page (Full Presentation)</option>
                <option value="2-slides">2 Slides per Page</option>
                <option value="handouts-3">3 Slides with Note Lines (Handouts)</option>
              </select>
            </div>
          </div>

          {/* Slide Deck Preview */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Slide Deck Deck Preview ({slides.length} Slides):
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {slides.map(slide => (
                <div
                  key={slide.slideNumber}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col justify-between aspect-[16/10]"
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-700">
                      <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase">
                        Slide {slide.slideNumber}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                      {slide.title}
                    </h4>
                    <ul className="mt-2 space-y-1">
                      {slide.bullets.slice(0, 3).map((b, i) => (
                        <li key={i} className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {slide.notes && (
                    <p className="text-[10px] text-slate-400 italic mt-2 border-t pt-1 line-clamp-1">
                      Note: {slide.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Compile Action */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              onClick={handleGeneratePdf}
              disabled={isConverting}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              {isConverting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Presentation PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Convert PowerPoint to PDF
                </>
              )}
            </button>
          </div>
        </div>

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
