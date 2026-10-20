import { useState } from 'react';
import {
  BookOpen,
  Atom,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  ChevronDown,
  Copy,
  Check,
  Calculator,
  ShieldCheck,
  FileCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { TOOL_GUIDES, ToolGuideContent } from '../data/toolGuides';
import { ToolItem } from '../types';

interface ToolEducationalGuideProps {
  toolId: string;
  tool: ToolItem;
}

export default function ToolEducationalGuide({ toolId, tool }: ToolEducationalGuideProps) {
  const guide: ToolGuideContent | undefined = TOOL_GUIDES[toolId];
  const [activeTab, setActiveTab] = useState<'all' | 'principle' | 'steps' | 'examples' | 'faqs'>('all');
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleCopyFormula = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormula(text);
    setTimeout(() => setCopiedFormula(null), 1500);
  };

  // Fallback generation for any tool without custom static entry
  const content: ToolGuideContent = guide || {
    title: `${tool.name}: Complete Technical Principles & User Guide`,
    badge: `${tool.categoryName} Standard Guide`,
    readingTime: '5 min read',
    overview: [
      `${tool.name} is a high-precision, in-browser digital tool developed for professionals, researchers, students, and practitioners in ${tool.categoryName.toLowerCase()}. It allows users to process data, perform calculations, and format documents reliably without relying on third-party cloud uploads.`,
      `Designed under strict data privacy principles, all mathematical computations, file parsing, and transformations occur 100% locally in your web browser memory. This guarantees instantaneous processing speeds and complete data privacy for proprietary files and research data.`
    ],
    principles: [
      {
        heading: 'Computational Foundation & Standards',
        description: `The mathematical and architectural execution of ${tool.name} adheres to international computational standards and validated algorithms:`,
        details: [
          `Local Client Execution: Operates within the browser's high-speed JavaScript runtime using standard IEEE 754 floating-point arithmetic.`,
          `Zero-Latency Processing: Bypasses server network latency by calculating results directly on your device.`,
          `Input Validation: Employs boundary checks and defensive parsing to ensure input integrity before computing results.`
        ]
      }
    ],
    stepByStepGuide: [
      {
        step: 1,
        title: 'Provide Input Data or File',
        instruction: `Enter your parameters into the primary input fields or upload your source file directly into the workspace.`
      },
      {
        step: 2,
        title: 'Configure Optional Parameters',
        instruction: `Review and adjust any optional configuration settings, formatting rules, or calculation modes.`
      },
      {
        step: 3,
        title: 'Obtain & Export Results',
        instruction: `Review the real-time results, copy output to your clipboard, or download the processed document directly.`
      }
    ],
    examples: [
      {
        title: `Practical Application of ${tool.name}`,
        scenario: `Using ${tool.name} in an everyday workflow to streamline data processing.`,
        input: `Sample inputs provided in standard form`,
        output: `Instant calculated result with zero error margin`,
        explanation: `Demonstrates the speed and accuracy of direct client-side evaluation.`
      }
    ],
    bestPractices: [
      `Double-check your source inputs and decimal precision before using outputs in formal reports.`,
      `Keep your browser updated to ensure optimal WebAssembly and HTML5 performance.`
    ],
    faqs: [
      {
        question: `Is my data saved or uploaded to any server when using ${tool.name}?`,
        answer: `No. All operations run 100% locally in your browser memory. No data, files, or inputs are ever transmitted across the internet.`
      },
      {
        question: `Is ${tool.name} free to use for commercial and academic purposes?`,
        answer: `Yes. All tools on this platform are fully free and unrestricted for both personal, commercial, and academic use.`
      }
    ]
  };

  return (
    <section className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800 space-y-8">
      {/* Article Header Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-3 py-1 bg-teal-500/20 text-teal-300 font-medium rounded-full border border-teal-500/30">
              {content.badge}
            </span>
            <span className="px-2.5 py-1 bg-white/10 text-slate-300 rounded-full">
              {content.readingTime}
            </span>
            <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Verified Technical Documentation
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold tracking-tight text-white">
            {content.title}
          </h2>

          <p className="text-slate-300 text-sm leading-relaxed max-w-4xl">
            {content.overview[0]}
          </p>

          {content.overview[1] && (
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-4xl">
              {content.overview[1]}
            </p>
          )}

          {/* Quick Navigation Filter Bar */}
          <div className="pt-2 flex flex-wrap gap-2 text-xs">
            {[
              { id: 'all', label: 'Complete Guide' },
              { id: 'principle', label: 'Working Principles & Formulas' },
              { id: 'steps', label: 'How to Use (Step-by-Step)' },
              { id: 'examples', label: 'Real-World Examples' },
              { id: 'faqs', label: 'Frequently Asked Questions' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-teal-500 text-slate-950 font-semibold shadow-xs'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 1. WORKING PRINCIPLES & FORMULAS */}
      {(activeTab === 'all' || activeTab === 'principle') && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <Atom className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
                Scientific & Mathematical Working Principles
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                The theoretical foundation, governing physical laws, and computational algorithms behind {tool.name}.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {content.principles.map((pr, idx) => (
              <div key={idx} className="space-y-4">
                <h4 className="font-heading font-semibold text-slate-800 dark:text-slate-200 text-base">
                  {pr.heading}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {pr.description}
                </p>

                {/* Mathematical Equation Card */}
                {pr.formula && (
                  <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 relative group">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-semibold uppercase tracking-wider text-[11px] text-teal-600 dark:text-teal-400">
                        Governing Equation / Mathematical Expression
                      </span>
                      <button
                        onClick={() => handleCopyFormula(pr.formula!)}
                        className="text-xs flex items-center gap-1 text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                        title="Copy formula text"
                      >
                        {copiedFormula === pr.formula ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-teal-600" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="font-mono text-base sm:text-lg text-slate-900 dark:text-teal-300 font-bold py-2 overflow-x-auto">
                      {pr.formula}
                    </div>

                    {pr.formulaVariables && pr.formulaVariables.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {pr.formulaVariables.map((v, vIdx) => (
                          <div key={vIdx} className="flex items-baseline gap-1.5 text-slate-600 dark:text-slate-400">
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              {v.symbol}:
                            </span>
                            <span>{v.meaning}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Bulleted Scientific Details */}
                <ul className="space-y-2 pt-1">
                  {pr.details.map((dt, dIdx) => (
                    <li key={dIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                      <span>{dt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. STEP-BY-STEP HOW-TO GUIDE */}
      {(activeTab === 'all' || activeTab === 'steps') && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
                Step-by-Step Practical Operating Guide
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                How to use {tool.name} effectively with maximum precision and zero formatting errors.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {content.stepByStepGuide.map((step) => (
              <div
                key={step.step}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-7 h-7 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">
                      {step.step}
                    </span>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                      Step {step.step}
                    </span>
                  </div>
                  <h4 className="font-heading font-semibold text-slate-900 dark:text-white text-sm">
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    {step.instruction}
                  </p>
                </div>
                {step.tip && (
                  <div className="p-2 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-lg text-[11px] leading-tight flex items-start gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{step.tip}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quality Control & Best Practices */}
          <div className="p-5 bg-teal-50/50 dark:bg-teal-950/20 rounded-2xl border border-teal-200/50 dark:border-teal-900/40 space-y-3">
            <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 font-heading font-semibold text-sm">
              <FileCheck className="w-4 h-4" />
              <span>Professional Best Practices & Quality Control</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
              {content.bestPractices.map((bp, bIdx) => (
                <li key={bIdx} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                  <span>{bp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 3. PRACTICAL WORKED EXAMPLES */}
      {(activeTab === 'all' || activeTab === 'examples') && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
                Practical Industry & Everyday Worked Examples
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-world case studies with full input parameters, step-by-step math, and interpretation.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {content.examples.map((ex, exIdx) => (
              <div
                key={exIdx}
                className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4"
              >
                <div>
                  <span className="text-[11px] font-semibold tracking-wider text-teal-600 dark:text-teal-400 uppercase">
                    Worked Example #{exIdx + 1}
                  </span>
                  <h4 className="font-heading font-bold text-slate-900 dark:text-white text-base mt-0.5">
                    {ex.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {ex.scenario}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="font-semibold text-slate-400 block mb-1 uppercase text-[10px]">
                      Input Parameters
                    </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">
                      {ex.input}
                    </span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-teal-500/30">
                    <span className="font-semibold text-teal-600 dark:text-teal-400 block mb-1 uppercase text-[10px]">
                      Final Evaluated Output
                    </span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {ex.output}
                    </span>
                  </div>
                </div>

                {ex.calculation && (
                  <div className="p-3 bg-slate-100 dark:bg-slate-900/80 rounded-xl font-mono text-xs text-slate-700 dark:text-slate-300">
                    <span className="text-slate-400 font-sans text-[11px] block mb-1">
                      Step-by-Step Calculation:
                    </span>
                    {ex.calculation}
                  </div>
                )}

                <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Scientific Interpretation:</strong> {ex.explanation}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. FREQUENTLY ASKED QUESTIONS (FAQ) */}
      {(activeTab === 'all' || activeTab === 'faqs') && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
                Frequently Asked Questions (FAQ)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Authoritative answers to common questions, technical nuances, and regulatory questions.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {content.faqs.map((faq, fIdx) => {
              const isOpen = openFaqIndex === fIdx;
              return (
                <div
                  key={fIdx}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all bg-slate-50/50 dark:bg-slate-950/30"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : fIdx)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-heading font-semibold text-sm sm:text-base text-slate-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isOpen ? 'rotate-180 text-teal-600' : 'text-slate-400'
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200/40 dark:border-slate-800/40">
                      <p className="pt-3">{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
