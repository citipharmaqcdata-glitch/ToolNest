import { FileCode2, ShieldAlert, CheckCircle2, AlertTriangle, ExternalLink, Mail } from 'lucide-react';

export default function TermsOfUseContent() {
  const officialEmail = 'socialeditor804@gmail.com';
  const websiteUrl = 'https://bulkconvert.netlify.app/';

  return (
    <div className="space-y-6 text-slate-700 dark:text-slate-300">
      {/* Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
            <FileCode2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-2xl text-slate-900 dark:text-white">
              Terms of Use
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span>Last Updated: October 21, 2026</span>
              <span>·</span>
              <span className="text-teal-600 dark:text-teal-400 font-medium">ToolNest</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 text-xs sm:text-sm leading-relaxed">
        {/* Section 1 */}
        <div className="space-y-2">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-teal-600 dark:text-teal-400 font-mono text-sm">1.</span>
            Acceptance of Terms
          </h3>
          <p>
            By accessing or using <strong>ToolNest</strong> ("we," "our," "us," or the "Website") available at{' '}
            <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="text-teal-600 dark:text-teal-400 hover:underline font-mono">
              {websiteUrl}
            </a>
            , you agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree to these terms, please discontinue using our website and its online tools immediately.
          </p>
        </div>

        {/* Section 2 */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-teal-600 dark:text-teal-400 font-mono text-sm">2.</span>
            Description of Service
          </h3>
          <p>
            ToolNest provides free browser-based digital utilities, including PDF converters and editors, unit converters, scientific calculators, laboratory formulas, developer utilities, and text analyzers. The tools are designed to facilitate everyday tasks quickly and conveniently.
          </p>
        </div>

        {/* Section 3 */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-teal-600 dark:text-teal-400 font-mono text-sm">3.</span>
            Permitted and Fair Use
          </h3>
          <p>
            You are granted a non-exclusive, revocable, and non-transferable license to access and use ToolNest for lawful personal, educational, research, and business purposes in accordance with these Terms.
          </p>
        </div>

        {/* Section 4 */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-teal-600 dark:text-teal-400 font-mono text-sm">4.</span>
            Prohibited Activities
          </h3>
          <p>When using ToolNest, you agree not to:</p>
          <ul className="list-disc list-inside space-y-1 text-xs pl-1 text-slate-600 dark:text-slate-300">
            <li>Engage in unauthorized automated scraping, mass data harvesting, or denial-of-service attempts.</li>
            <li>Use the tools to process malicious software, viruses, spyware, or illegal contraband.</li>
            <li>Attempt to bypass, disable, or circumvent any security or architectural controls of the website.</li>
            <li>Use our services in violation of applicable local, national, or international regulations.</li>
          </ul>
        </div>

        {/* Section 5 */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-teal-600 dark:text-teal-400 font-mono text-sm">5.</span>
            User Content & File Processing
          </h3>
          <p>
            You retain full ownership of all files, text, images, and documents you process through ToolNest. We do not claim any intellectual property rights over your user data. You are solely responsible for ensuring you have the legal right to possess and process any uploaded files.
          </p>
        </div>

        {/* Section 6 */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-teal-600 dark:text-teal-400 font-mono text-sm">6.</span>
            Intellectual Property Rights
          </h3>
          <p>
            The ToolNest name, logo, original interface code, designs, and educational content are protected by copyright, trademark, and intellectual property laws. You may not copy, mirror, or redistribute the proprietary framework without prior written consent.
          </p>
        </div>

        {/* Section 7 */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-teal-600 dark:text-teal-400 font-mono text-sm">7.</span>
            Scientific & Professional Disclaimer
          </h3>
          <p>
            All laboratory reagents, chemical concentrations, molarity formulations, and pharmaceutical quality control statistics (%RSD, assay, dissolution) provided by ToolNest are intended as study aids and general calculations.
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            Actual laboratory preparation and commercial product release must always follow approved site-specific Standard Operating Procedures (SOPs), Safety Data Sheets (SDS), and current official monographs (USP, BP, Ph. Eur., JP, ICH).
          </p>
        </div>

        {/* Section 8 */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-teal-600 dark:text-teal-400 font-mono text-sm">8.</span>
            Disclaimer of Warranties
          </h3>
          <p>
            ToolNest and all related tools are provided on an <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> basis without warranties of any kind, whether express, implied, statutory, or otherwise, including but not limited to merchantability, fitness for a particular purpose, or non-infringement.
          </p>
        </div>

        {/* Section 9 */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-teal-600 dark:text-teal-400 font-mono text-sm">9.</span>
            Limitation of Liability
          </h3>
          <p>
            To the maximum extent permitted by applicable law, in no event shall ToolNest, its operators, creators, or affiliates be liable for any direct, indirect, incidental, consequential, special, or punitive damages arising from the use or inability to use our tools.
          </p>
        </div>

        {/* Section 10 */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-teal-600 dark:text-teal-400 font-mono text-sm">10.</span>
            Indemnification
          </h3>
          <p>
            You agree to indemnify and hold harmless ToolNest, its operators, contributors, and agents from any claims, losses, liabilities, damages, or expenses (including reasonable legal fees) resulting from your violation of these Terms.
          </p>
        </div>

        {/* Section 11 */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-teal-600 dark:text-teal-400 font-mono text-sm">11.</span>
            Third-Party Links & Advertising
          </h3>
          <p>
            Our website may display third-party advertisements (such as Google AdSense) or contain links to external third-party websites. ToolNest has no control over the content, terms, or privacy policies of independent third-party services.
          </p>
        </div>

        {/* Section 12 */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-teal-600 dark:text-teal-400 font-mono text-sm">12.</span>
            Modifications to the Service
          </h3>
          <p>
            We reserve the right to modify, suspend, or discontinue any tool, calculator, or feature on ToolNest at any time, with or without prior notice, without liability to you.
          </p>
        </div>

        {/* Section 13 */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-teal-600 dark:text-teal-400 font-mono text-sm">13.</span>
            Changes to These Terms
          </h3>
          <p>
            We may update these Terms of Use periodically. Updated versions will be posted on this page with a revised "Last Updated" date. Continued use of ToolNest after modifications constitutes acceptance of the revised terms.
          </p>
        </div>

        {/* Section 14 */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-teal-600 dark:text-teal-400 font-mono text-sm">14.</span>
            Severability
          </h3>
          <p>
            If any provision of these Terms is determined to be unlawful, void, or unenforceable, that provision shall be deemed severable and shall not affect the validity and enforceability of any remaining provisions.
          </p>
        </div>

        {/* Section 15 */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-teal-600 dark:text-teal-400 font-mono text-sm">15.</span>
            Entire Agreement
          </h3>
          <p>
            These Terms of Use, along with our Privacy Policy, constitute the entire agreement between you and ToolNest regarding your use of the website and services.
          </p>
        </div>

        {/* Section 16 */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-teal-600 dark:text-teal-400 font-mono text-sm">16.</span>
            Governing Law
          </h3>
          <p>
            These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.
          </p>
        </div>

        {/* Section 17 */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-teal-600 dark:text-teal-400 font-mono text-sm">17.</span>
            Feedback and Suggestions
          </h3>
          <p>
            Any feedback, feature requests, or suggestions you submit regarding ToolNest shall be deemed non-confidential, and we may use them freely to improve our tools without obligation or compensation.
          </p>
        </div>

        {/* Section 18: Contact Information (As provided by user) */}
        <div className="p-4 sm:p-5 bg-teal-50/60 dark:bg-teal-950/30 rounded-2xl border border-teal-200/60 dark:border-teal-900/40 space-y-3 pt-2">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-teal-600 dark:text-teal-400 font-mono text-sm">18.</span>
            Contact Information
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            If you have any questions, concerns, or inquiries regarding these Terms of Use, please contact us using the details below.
          </p>
          <div className="space-y-1 text-xs pt-1 text-slate-700 dark:text-slate-300">
            <div><strong>Website Name:</strong> ToolNest</div>
            <div>
              <strong>Website:</strong>{' '}
              <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="text-teal-600 dark:text-teal-400 hover:underline">
                {websiteUrl}
              </a>
            </div>
            <div>
              <strong>Contact Email:</strong>{' '}
              <a href={`mailto:${officialEmail}`} className="font-mono text-teal-600 dark:text-teal-400 hover:underline font-semibold">
                {officialEmail}
              </a>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 pt-1">
            For questions about our website, online tools, technical issues, or these Terms of Use, please email us at the address provided above. We will make reasonable efforts to review and respond to inquiries.
          </p>
        </div>

        <div className="text-center pt-2 text-xs text-slate-400 font-medium">
          ToolNest — Every Tool. One Place.
        </div>
      </div>
    </div>
  );
}
