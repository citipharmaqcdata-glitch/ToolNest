import { X, ShieldCheck, BookOpen, AlertTriangle, Mail, Info, FileCode2, ExternalLink } from 'lucide-react';
import { ModalType } from '../types';

interface LegalModalsProps {
  modalType: ModalType;
  onClose: () => void;
}

export default function LegalModals({ modalType, onClose }: LegalModalsProps) {
  if (!modalType) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl max-h-[90vh] overflow-y-auto space-y-5">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* MODAL 1: ABOUT */}
        {modalType === 'about' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center">
                <Info className="w-4 h-4" />
              </div>
              <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white">
                About ToolNest
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong>ToolNest</strong> is designed with a simple vision: <em>"Every tool. One place."</em> It consolidates daily math, chemical calculation, analytical laboratory verification, developer utilities, text analyzers, and image processing into a fast, single-destination web app.
            </p>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="font-semibold text-slate-900 dark:text-white">Core Architectural Pillars:</div>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>$0 Initial Budget:</strong> Built completely with free, open-source browser web technologies.</li>
                <li><strong>100% In-Browser Privacy:</strong> Your text, numbers, and images never touch a backend server or 3rd-party tracking database.</li>
                <li><strong>Mobile-First Usability:</strong> Smooth, accessible experience on Android smartphones, tablets, and desktop workstations alike.</li>
              </ul>
            </div>
          </div>
        )}

        {/* MODAL 2: CONTACT */}
        {modalType === 'contact' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white">
                Contact & Feedback
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Have suggestions for new laboratory formulas, feature requests, bug reports, or questions? We welcome community contributions and feedback.
            </p>
            <div className="p-4 bg-teal-50/60 dark:bg-teal-950/30 rounded-2xl border border-teal-100 dark:border-teal-900/40 space-y-2 text-xs text-teal-900 dark:text-teal-200">
              <div className="font-semibold">Project Contact:</div>
              <p className="font-mono text-sm font-medium">citipharmaqcdata@gmail.com</p>
              <p className="text-[11px] text-teal-700 dark:text-teal-300">
                Managed and maintained via GitHub and Google AI Studio.
              </p>
            </div>
          </div>
        )}

        {/* MODAL 3: PRIVACY POLICY */}
        {modalType === 'privacy' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white">
                Privacy Policy
              </h2>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                <strong>Client-Side Processing Guarantee:</strong> ToolNest does not transmit your personal data, calculations, JSON code, or uploaded media files to any remote servers. All file compression, word counts, and chemical formula evaluations are executed solely within your browser's JavaScript engine.
              </p>
              <p>
                <strong>Local Storage:</strong> Your user preferences (such as Dark/Light theme mode and Favorite tools list) are stored exclusively on your device in standard browser <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">localStorage</code>.
              </p>
              <p>
                <strong>No Third-Party Trackers:</strong> ToolNest does not employ invasive advertising trackers, fingerprinting libraries, or profiling telemetry.
              </p>
            </div>
          </div>
        )}

        {/* MODAL 4: TERMS OF USE */}
        {modalType === 'terms' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center">
                <FileCode2 className="w-4 h-4" />
              </div>
              <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white">
                Terms of Use
              </h2>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                ToolNest is provided free of charge for educational, research, calculation, and utility purposes on an "as is" and "as available" basis without warranties of any kind.
              </p>
              <p>
                While every effort is made to maintain scientific and mathematical precision, you agree that decisions involving chemical preparation, financial investments, tax filings, or medicine must be verified by qualified professionals and appropriate standard operating procedures.
              </p>
            </div>
          </div>
        )}

        {/* MODAL 5: SCIENTIFIC & LABORATORY DISCLAIMER */}
        {modalType === 'disclaimer' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white">
                Scientific & Laboratory Disclaimer
              </h2>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="p-4 bg-amber-50/80 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/40 space-y-2 text-amber-900 dark:text-amber-200 text-xs">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Mandatory SOP & Pharmacopeia Notice
                </div>
                <p>
                  All laboratory reagents, chemical concentrations, molarity formulations, and pharmaceutical quality control statistics (%RSD, assay, dissolution) provided by ToolNest are intended as general calculations and study aids.
                </p>
                <p>
                  Actual laboratory preparation and commercial product release must <strong>always</strong> follow approved site-specific Standard Operating Procedures (SOPs), Safety Data Sheets (SDS), and the current official monographs and guidelines from <strong>USP, BP, Ph. Eur., JP, and ICH</strong>.
                </p>
              </div>
              <p>
                <strong>Assumptions:</strong> Calculations such as ppm to mg/L assume dilute aqueous matrices with approximate density of 1.00 g/cm³. For non-aqueous, viscous, or dense formulations, accurate specific gravity measurements must be factored in.
              </p>
            </div>
          </div>
        )}

        {/* MODAL 6: FREE GITHUB & MOBILE DEPLOYMENT GUIDE */}
        {modalType === 'github-guide' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white">
                Free Hosting & Android Mobile GitHub Guide
              </h2>
            </div>
            
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Here is the exact step-by-step workflow to publish and manage ToolNest for <strong>$0 completely free</strong> directly from an Android mobile phone or desktop browser.
            </p>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              {/* Step 1 */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="font-semibold text-slate-900 dark:text-white">
                  Step 1: Create a Free GitHub Repository on Android
                </div>
                <p>
                  1. Open Chrome on your Android phone and log in to <a href="https://github.com" target="_blank" rel="noreferrer" className="text-teal-600 underline">github.com</a>.<br/>
                  2. Tap the <strong>+</strong> icon in the top right → <strong>New repository</strong>.<br/>
                  3. Set Repository name: <code className="font-mono bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">toolnest</code>.<br/>
                  4. Choose <strong>Public</strong> (allows free hosting on Vercel or GitHub Pages).<br/>
                  5. Click <strong>Create repository</strong>.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="font-semibold text-slate-900 dark:text-white">
                  Step 2: Connect or Export from Google AI Studio
                </div>
                <p>
                  In Google AI Studio, tap <strong>Share</strong> or <strong>Export to GitHub</strong> in the top header. Authenticate your GitHub account and select your <code className="font-mono">toolnest</code> repository. All code will be automatically committed!
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="font-semibold text-slate-900 dark:text-white">
                  Step 3: Deploy for $0 on Vercel (Recommended 1-Click Option)
                </div>
                <p>
                  1. Go to <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-teal-600 underline">vercel.com</a> on your phone and tap <strong>Sign Up with GitHub</strong>.<br/>
                  2. Tap <strong>Add New... → Project</strong> and select your <code className="font-mono">toolnest</code> repo.<br/>
                  3. Vercel automatically detects <strong>Vite + React</strong>. Leave settings as default.<br/>
                  4. Tap <strong>Deploy</strong>. In 30 seconds, your site is live with a free, permanent HTTPS URL (e.g. <code className="font-mono">https://toolnest.vercel.app</code>)!
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="font-semibold text-slate-900 dark:text-white">
                  Step 4: Alternative Free Hosting: GitHub Pages
                </div>
                <p>
                  If using GitHub Pages, set <code className="font-mono">base: '/toolnest/'</code> in <code className="font-mono">vite.config.ts</code>, then go to <strong>Repo Settings → Pages → Build and deployment → Source: GitHub Actions → Static HTML</strong>.
                </p>
              </div>

              {/* Step 5 */}
              <div className="p-3.5 bg-teal-50 dark:bg-teal-950/30 rounded-xl border border-teal-100 dark:border-teal-900/40 text-teal-900 dark:text-teal-200 space-y-1">
                <div className="font-semibold">How to Edit Code Later from Android Phone:</div>
                <p>
                  Whenever you want to add new tools or change text, simply open <code className="font-mono">github.com/&lt;YOUR_USERNAME&gt;/toolnest</code> in your mobile browser, navigate to any file, tap the pencil icon to edit, and tap <strong>Commit changes</strong>. Vercel automatically redeploys your updates in seconds!
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
