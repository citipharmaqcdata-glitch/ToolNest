import { ShieldCheck, Lock, Eye, FileText, Globe, ExternalLink, Mail, CheckCircle2 } from 'lucide-react';

export default function PrivacyPolicyContent() {
  const officialEmail = 'socialeditor804@gmail.com';
  const websiteUrl = 'https://bulkconvert.netlify.app/';

  return (
    <div className="space-y-6 text-slate-700 dark:text-slate-300">
      {/* Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-2xl text-slate-900 dark:text-white">
              Privacy Policy
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
        {/* Section 1: Introduction */}
        <div className="space-y-2">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-teal-600 dark:text-teal-400 font-mono text-sm">1.</span>
            Introduction
          </h3>
          <p>
            Welcome to <strong>ToolNest</strong> ("we," "our," "us," or the "Website").
          </p>
          <p>
            ToolNest is an online platform that provides digital utilities, including PDF tools, file conversion utilities, calculators, text tools, and other productivity tools designed to make everyday online tasks easier.
          </p>
          <p>
            This Privacy Policy explains how information may be collected, used, stored, disclosed, and protected when you visit or use our website at:
          </p>
          <p className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl font-mono text-xs text-teal-600 dark:text-teal-400 font-semibold break-all">
            <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1.5">
              <span>{websiteUrl}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
          <p>
            We respect your privacy and are committed to handling personal information responsibly. This policy also explains your choices regarding cookies, third-party services, and your personal information.
          </p>
          <p>
            By accessing or using ToolNest, you acknowledge that you have read this Privacy Policy. Where consent is required by applicable law, we will request it separately.
          </p>
        </div>

        {/* Section 2: Information We May Collect */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-teal-600 dark:text-teal-400 font-mono text-sm">2.</span>
            Information We May Collect
          </h3>
          <p>
            The information collected depends on how you use our website and which tools or services you access.
          </p>

          <div className="space-y-2 pl-2 border-l-2 border-slate-200 dark:border-slate-700">
            <h4 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
              2.1 Personal Information
            </h4>
            <p>
              ToolNest does not require you to provide personal information merely to browse publicly accessible pages.
            </p>
            <p>
              However, we may collect personal information when you voluntarily provide it, such as when you:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 pl-1">
              <li>Contact us with a question or support request.</li>
              <li>Submit feedback or suggestions.</li>
              <li>Subscribe to updates, if this feature is available.</li>
              <li>Create an account, if user registration is introduced.</li>
              <li>Communicate with us through email or another supported channel.</li>
            </ul>
            <p>
              Depending on the interaction, this information may include your name, email address, message contents, and any other details you choose to provide.
            </p>
            <p className="text-amber-600 dark:text-amber-400 text-xs font-medium">
              Please do not submit passwords, financial account details, or other sensitive information through general contact forms.
            </p>
          </div>

          <div className="space-y-2 pl-2 border-l-2 border-slate-200 dark:border-slate-700 pt-2">
            <h4 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
              2.2 Technical and Usage Information
            </h4>
            <p>
              When you visit ToolNest, certain technical information may be collected automatically by our hosting provider, analytics services, security tools, or other technologies used by the website.
            </p>
            <p>This information may include:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 pl-1">
              <li>IP address.</li>
              <li>Browser type and version.</li>
              <li>Device type and operating system.</li>
              <li>Pages visited and links accessed.</li>
              <li>Date and time of visits.</li>
              <li>Referring websites or pages.</li>
              <li>Approximate geographic location derived from an IP address.</li>
              <li>Error reports and diagnostic information.</li>
            </ul>
            <p>
              We may use this information to maintain website functionality, understand usage patterns, prevent abuse, diagnose errors, and improve our services.
            </p>
            <p className="text-xs text-slate-500">
              The specific information collected depends on the services and technologies actually enabled on our website.
            </p>
          </div>

          <div className="space-y-2 pl-2 border-l-2 border-slate-200 dark:border-slate-700 pt-2">
            <h4 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
              2.3 Files and Documents Processed Through Our Tools
            </h4>
            <p>
              ToolNest may provide tools for processing PDF files, documents, images, text, and other supported formats.
            </p>
            <p>
              When you use these tools, the files or information you submit may be processed in your browser or transmitted to a server or third-party service, depending on how the particular tool is implemented.
            </p>
            <p>
              We aim to process user files only as needed to provide the requested functionality.
            </p>
            <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <div className="font-semibold text-slate-900 dark:text-white">Important Notice:</div>
              <p>
                We do not claim that every tool processes files locally or that all uploaded files are automatically deleted. Processing methods, temporary storage, and deletion practices depend on the implementation of each tool.
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                Before uploading confidential documents, please review the relevant tool's instructions and consider whether the document contains sensitive information.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: How We Use Information */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-teal-600 dark:text-teal-400 font-mono text-sm">3.</span>
            How We Use Information
          </h3>
          <p>Information collected through ToolNest may be used for the following purposes:</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-1">
            {[
              'To operate and maintain our website.',
              'To provide the tools and features you request.',
              'To respond to questions, feedback, and support requests.',
              'To troubleshoot technical problems and improve performance.',
              'To understand how visitors use the website.',
              'To detect fraudulent activity, abuse, and security threats.',
              'To maintain website integrity and prevent unauthorized access.',
              'To comply with applicable legal obligations.',
              'To display advertising, where advertising services are enabled.',
              'To measure advertising performance and website usage, where permitted.',
              'To improve the user experience and develop new features.'
            ].map((purpose, idx) => (
              <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <span>{purpose}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-500 pt-1">
            We do not intend to use personal information for purposes unrelated to the services described in this policy without an appropriate legal basis or notice where required.
          </p>
        </div>

        {/* Section 4: Cookies and Similar Technologies */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-teal-600 dark:text-teal-400 font-mono text-sm">4.</span>
            Cookies and Similar Technologies
          </h3>
          <p>
            ToolNest and certain third-party services may use cookies, local storage, pixels, or similar technologies to remember user preferences, support website functionality, maintain security, understand website traffic, measure advertising effectiveness, and display relevant advertisements where applicable.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <div className="font-semibold text-slate-900 dark:text-white text-xs">Essential Cookies</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Necessary for website security, core functionality, or user-requested preferences.
              </p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <div className="font-semibold text-slate-900 dark:text-white text-xs">Analytics Cookies</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Help us understand visitor behavior and improve the website when analytics services are enabled.
              </p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <div className="font-semibold text-slate-900 dark:text-white text-xs">Advertising Cookies</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Used by advertising services such as Google AdSense to display, measure, or personalize advertisements subject to settings and consent.
              </p>
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <div className="font-semibold text-slate-900 dark:text-white">Managing Cookies:</div>
            <p>
              You can manage or block cookies through your browser settings. Blocking certain cookies may affect some website features. Where legally required, we will seek consent before using non-essential cookies.
            </p>
            <p>
              For information about Google's advertising practices, visit:{' '}
              <a
                href="https://policies.google.com/technologies/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
              >
                <span>policies.google.com/technologies/ads</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>
        </div>

        {/* Section 5: Google AdSense and Third-Party Advertising */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-teal-600 dark:text-teal-400 font-mono text-sm">5.</span>
            Google AdSense and Third-Party Advertising
          </h3>
          <p>
            ToolNest may display advertisements through Google AdSense or other advertising partners.
          </p>
          <p>
            If Google AdSense is enabled, Google and its partners may use cookies, web beacons, IP addresses, or similar technologies to serve advertisements, limit repeated ads, detect invalid traffic, measure performance, and personalize advertising where permitted.
          </p>
          <p>
            Depending on your location, consent choices, and advertising settings, you may receive personalized or non-personalized advertisements. Third-party advertising providers may process information according to their own privacy policies and applicable legal requirements.
          </p>
          <p className="text-xs">
            You can learn more about Google's advertising technologies and controls here:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs pl-1">
            <li>
              Google Advertising:{' '}
              <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-teal-600 dark:text-teal-400 hover:underline">
                https://policies.google.com/technologies/ads
              </a>
            </li>
            <li>
              Google Privacy Policy:{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-teal-600 dark:text-teal-400 hover:underline">
                https://policies.google.com/privacy
              </a>
            </li>
            <li>
              Google Ads Settings:{' '}
              <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" className="text-teal-600 dark:text-teal-400 hover:underline">
                https://adssettings.google.com/
              </a>
            </li>
          </ul>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
            The presence of this section does not mean that AdSense is currently active on ToolNest. It describes practices that apply if we enable the service.
          </p>
        </div>

        {/* Section 6: Third-Party Services and External Websites */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-teal-600 dark:text-teal-400 font-mono text-sm">6.</span>
            Third-Party Services and External Websites
          </h3>
          <p>
            ToolNest may rely on third-party providers to support hosting, file processing, security, analytics, advertising, or other website functions, including:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs pl-1">
            <li>Website hosting and content delivery providers.</li>
            <li>File conversion or document processing services.</li>
            <li>Analytics providers.</li>
            <li>Advertising networks.</li>
            <li>Security and spam-prevention services.</li>
            <li>External websites linked from our pages.</li>
          </ul>
          <p className="text-xs text-slate-500">
            These providers may process certain information as necessary to perform their services. We do not control the privacy practices of independent third-party websites. If you follow an external link, we encourage you to review the privacy policy of the destination website.
          </p>
        </div>

        {/* Section 7: File Security and Retention */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-teal-600 dark:text-teal-400 font-mono text-sm">7.</span>
            File Security and Retention
          </h3>
          <p>
            We recognize that files processed through online tools may contain private or confidential information. We aim to use reasonable measures to protect information handled by our website.
          </p>
          <p>
            However, no internet transmission or electronic storage system can be guaranteed to be completely secure. File retention depends on how a tool operates:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs pl-1">
            <li><strong>Browser-based tools:</strong> May process files locally without transmitting them to our servers.</li>
            <li><strong>Server-based tools:</strong> May temporarily receive or store files to complete a requested operation.</li>
            <li><strong>Third-party processing services:</strong> May apply their own retention and deletion practices.</li>
          </ul>
          <p className="text-xs text-slate-500">
            Where server-side file processing is used, we aim to clearly document how long files are retained and when they are deleted. Please avoid uploading highly sensitive documents unless you understand how the relevant tool handles them.
          </p>
        </div>

        {/* Section 8: Data Sharing and Disclosure */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-teal-600 dark:text-teal-400 font-mono text-sm">8.</span>
            Data Sharing and Disclosure
          </h3>
          <p>
            We do not intend to sell personal information collected directly by ToolNest as part of our ordinary website operations.
          </p>
          <p>We may disclose information in the following circumstances, where appropriate and legally permitted:</p>
          <ul className="list-disc list-inside space-y-1 text-xs pl-1">
            <li><strong>Service providers:</strong> To providers that help operate, secure, host, or improve the website.</li>
            <li><strong>Advertising and analytics partners:</strong> Where enabled, to support advertising, measurement, and analytics in accordance with applicable settings and laws.</li>
            <li><strong>Legal requirements:</strong> When disclosure is reasonably necessary to comply with applicable law, a lawful request, or a court order.</li>
            <li><strong>Security and protection:</strong> When necessary to investigate suspected fraud, abuse, security incidents, or threats to the rights and safety of users or others.</li>
            <li><strong>Business transfers:</strong> If the website or its relevant assets are involved in a merger, acquisition, restructuring, or transfer, subject to appropriate safeguards and applicable law.</li>
          </ul>
        </div>

        {/* Section 9: Data Retention */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-teal-600 dark:text-teal-400 font-mono text-sm">9.</span>
            Data Retention
          </h3>
          <p>
            We retain information only for as long as reasonably necessary for the purposes described in this policy, subject to legal, security, and operational requirements:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs pl-1">
            <li>Contact messages may be retained for as long as needed to respond and maintain relevant records.</li>
            <li>Technical logs may be retained according to hosting and security requirements.</li>
            <li>Analytics information may be retained according to the settings of the analytics provider.</li>
            <li>Uploaded files may be handled according to the processing and deletion rules of the relevant tool.</li>
          </ul>
          <p className="text-xs text-slate-500">
            Where information is no longer required, we aim to delete it or anonymize it where reasonably practicable.
          </p>
        </div>

        {/* Section 10: Your Privacy Rights */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-teal-600 dark:text-teal-400 font-mono text-sm">10.</span>
            Your Privacy Rights
          </h3>
          <p>
            Depending on your location and applicable law, you may have rights regarding your personal information, including the right to:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs pl-1">
            <li>Request access to personal information we hold about you.</li>
            <li>Request correction of inaccurate information.</li>
            <li>Request deletion of personal information.</li>
            <li>Object to or restrict certain processing activities.</li>
            <li>Withdraw consent where processing is based on consent.</li>
            <li>Request a portable copy of certain information.</li>
            <li>Opt out of certain forms of targeted advertising or data sharing where applicable.</li>
            <li>Lodge a complaint with the relevant data protection authority.</li>
          </ul>
          <p className="text-xs text-slate-500">
            To submit a privacy request, please contact us at <strong>{officialEmail}</strong>. We may need to verify your identity before fulfilling certain requests.
          </p>
        </div>

        {/* Section 11: Children's Privacy */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-teal-600 dark:text-teal-400 font-mono text-sm">11.</span>
            Children's Privacy
          </h3>
          <p>
            ToolNest is a general-purpose online utility website and is not specifically designed to collect personal information from children. We do not knowingly collect personal information from children in violation of applicable privacy laws.
          </p>
          <p className="text-xs text-slate-500">
            If you believe that a child has provided personal information to us inappropriately, please contact us so that we can review the matter and take appropriate action.
          </p>
        </div>

        {/* Section 12: International Data Transfers */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-teal-600 dark:text-teal-400 font-mono text-sm">12.</span>
            International Data Transfers
          </h3>
          <p>
            Depending on the hosting provider and third-party services used, information may be processed or stored in countries other than the country where you live. Data protection laws may differ between countries.
          </p>
          <p className="text-xs text-slate-500">
            Where applicable law requires safeguards for international transfers, we aim to use appropriate safeguards or other lawful transfer mechanisms.
          </p>
        </div>

        {/* Section 13: Do Not Track and Privacy Preferences */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-teal-600 dark:text-teal-400 font-mono text-sm">13.</span>
            Do Not Track and Privacy Preferences
          </h3>
          <p>
            Some browsers offer privacy settings or signals intended to limit tracking. Where required by applicable law, we will honor legally recognized opt-out preference signals and other applicable privacy choices.
          </p>
        </div>

        {/* Section 14: Third-Party Links */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-teal-600 dark:text-teal-400 font-mono text-sm">14.</span>
            Third-Party Links
          </h3>
          <p>
            Our website may contain links to third-party websites, services, or resources. These links are provided for convenience and do not mean that ToolNest controls or endorses the privacy practices of those websites. Please review their policies before providing personal information.
          </p>
        </div>

        {/* Section 15: Changes to This Privacy Policy */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-teal-600 dark:text-teal-400 font-mono text-sm">15.</span>
            Changes to This Privacy Policy
          </h3>
          <p>
            We may update this Privacy Policy from time to time to reflect changes in our website, tools, service providers, legal requirements, or privacy practices. When we make changes, we will update the "Last Updated" date at the top of this page.
          </p>
        </div>

        {/* Section 16: Contact Us */}
        <div className="p-4 sm:p-5 bg-teal-50/60 dark:bg-teal-950/30 rounded-2xl border border-teal-200/60 dark:border-teal-900/40 space-y-2 pt-2">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-teal-600 dark:text-teal-400 font-mono text-sm">16.</span>
            Contact Us
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            If you have questions, concerns, or requests regarding this Privacy Policy or the handling of your personal information, please contact us through our Contact Us page.
          </p>
          <div className="space-y-1 text-xs pt-1 text-slate-700 dark:text-slate-300">
            <div><strong>Website:</strong> <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="text-teal-600 dark:text-teal-400 hover:underline">{websiteUrl}</a></div>
            <div><strong>Website Name:</strong> ToolNest</div>
            <div><strong>Contact Email:</strong> <a href={`mailto:${officialEmail}`} className="font-mono text-teal-600 dark:text-teal-400 hover:underline font-semibold">{officialEmail}</a></div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            We will review privacy-related inquiries and respond within a reasonable period, subject to applicable legal requirements.
          </p>
        </div>

        <div className="text-center pt-2 text-xs text-slate-400 font-medium">
          ToolNest — Every Tool. One Place.
        </div>
      </div>
    </div>
  );
}
