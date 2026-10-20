import { X, ShieldCheck, BookOpen, AlertTriangle, Mail, Info, FileCode2, ExternalLink } from 'lucide-react';
import { ModalType } from '../types';
import ContactForm from './ContactForm';
import PrivacyPolicyContent from './PrivacyPolicyContent';
import TermsOfUseContent from './TermsOfUseContent';
import ScientificDisclaimerContent from './ScientificDisclaimerContent';

interface LegalModalsProps {
  modalType: ModalType;
  onClose: () => void;
}

export default function LegalModals({ modalType, onClose }: LegalModalsProps) {
  if (!modalType) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl max-h-[90vh] overflow-y-auto space-y-5">
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
          <div className="space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-2xl text-slate-900 dark:text-white">
                    About ToolNest
                  </h2>
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                    Every Tool. One Place.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                Welcome to <strong>ToolNest</strong>, your all-in-one destination for free online tools designed to make everyday digital tasks simpler, faster, and more convenient.
              </p>
              <p>
                At ToolNest, we believe that useful digital tools should be easy to access and simple to use. Whether you need to convert PDF files, calculate percentages, count words and characters, process documents, or perform everyday calculations, our growing collection of online tools is designed to help you get things done with less effort.
              </p>

              {/* Our Mission */}
              <div className="p-4 sm:p-5 bg-teal-50/50 dark:bg-teal-950/20 rounded-2xl border border-teal-200/50 dark:border-teal-900/40 space-y-2">
                <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                  Our Mission
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Our mission is to make essential online utilities accessible to everyone. We aim to provide a convenient platform where students, professionals, content creators, businesses, and everyday internet users can find useful tools in one place without unnecessary complexity.
                </p>
              </div>

              {/* What We Offer */}
              <div className="space-y-3 pt-2">
                <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                  What We Offer
                </h3>
                <p>
                  ToolNest offers a growing collection of online utilities across multiple categories, including:
                </p>
                <ul className="space-y-2 pl-1">
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white shrink-0">• PDF Tools:</span>
                    <span>Convert, organize, merge, split, and manage PDF documents.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white shrink-0">• Calculators:</span>
                    <span>Perform percentage calculations, date calculations, financial estimates, and other everyday computations.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white shrink-0">• Text Tools:</span>
                    <span>Count words and characters, convert text formats, and simplify common writing tasks.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white shrink-0">• Image and File Tools:</span>
                    <span>Access useful utilities for working with digital files and supported formats.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white shrink-0">• Productivity Tools:</span>
                    <span>Explore practical online utilities designed to save time and improve everyday workflows.</span>
                  </li>
                </ul>
                <p className="text-[11px] text-slate-400 italic">
                  Tool availability and supported features may vary by tool.
                </p>
              </div>

              {/* Why Choose ToolNest? */}
              <div className="space-y-3 pt-2">
                <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                  Why Choose ToolNest?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                    <div className="font-semibold text-slate-900 dark:text-white">Easy to Use</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">A simple interface designed for a smooth user experience.</div>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                    <div className="font-semibold text-slate-900 dark:text-white">One Convenient Platform</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Find multiple useful utilities in one place.</div>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                    <div className="font-semibold text-slate-900 dark:text-white">Mobile-Friendly Experience</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Access the website from smartphones, tablets, and desktop devices.</div>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                    <div className="font-semibold text-slate-900 dark:text-white">Time-Saving Solutions</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Complete common digital tasks without complicated software installations.</div>
                  </div>
                  <div className="p-3 sm:col-span-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                    <div className="font-semibold text-slate-900 dark:text-white">Continuously Improving</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">We aim to improve our tools, usability, and overall website experience over time.</div>
                  </div>
                </div>
              </div>

              {/* Our Commitment to Users */}
              <div className="space-y-2 pt-2">
                <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                  Our Commitment to Users
                </h3>
                <p>
                  We are committed to making ToolNest useful, accessible, and reliable. We continually aim to improve our tools, fix issues, and provide a better experience for our visitors.
                </p>
                <p>
                  We also recognize the importance of user privacy and responsible data handling. Please review our Privacy Policy to understand how information may be collected, processed, or stored when you use our website and its tools.
                </p>
              </div>

              {/* Who Can Use ToolNest? */}
              <div className="space-y-2 pt-2">
                <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                  Who Can Use ToolNest?
                </h3>
                <p>
                  ToolNest is designed for anyone who needs convenient online utilities, including students, teachers, office workers, developers, freelancers, content creators, and small business owners.
                </p>
                <p>
                  Whether you are managing documents, preparing content, or completing a quick calculation, ToolNest aims to help you work more efficiently.
                </p>
              </div>

              {/* Get in Touch */}
              <div className="p-4 sm:p-5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                  Get in Touch
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Your feedback helps us improve. If you have a question, encounter a problem, or have a suggestion for a new tool, please visit our Contact Us page and get in touch with us.
                </p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 pt-1">
                  Thank you for choosing ToolNest.
                </p>
                <div className="text-xs font-semibold text-teal-600 dark:text-teal-400 pt-1">
                  ToolNest — Every Tool. One Place.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: CONTACT */}
        {modalType === 'contact' && (
          <ContactForm />
        )}

        {/* MODAL 3: PRIVACY POLICY */}
        {modalType === 'privacy' && (
          <PrivacyPolicyContent />
        )}

        {/* MODAL 4: TERMS OF USE */}
        {modalType === 'terms' && (
          <TermsOfUseContent />
        )}

        {/* MODAL 5: SCIENTIFIC & LABORATORY DISCLAIMER */}
        {modalType === 'disclaimer' && (
          <ScientificDisclaimerContent />
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
