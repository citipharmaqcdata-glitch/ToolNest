import { AlertTriangle, ShieldAlert, BookOpen, ExternalLink, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';

export default function ScientificDisclaimerContent() {
  const officialEmail = 'socialeditor804@gmail.com';
  const websiteUrl = 'https://bulkconvert.netlify.app/';

  return (
    <div className="space-y-6 text-slate-700 dark:text-slate-300">
      {/* Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-2xl text-slate-900 dark:text-white">
              Scientific & Laboratory Disclaimer
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
            <span className="text-amber-600 dark:text-amber-400 font-mono text-sm">1.</span>
            Introduction
          </h3>
          <p>
            Welcome to <strong>ToolNest — Every Tool. One Place.</strong>
          </p>
          <p>
            This Scientific & Laboratory Disclaimer applies to scientific calculators, laboratory utilities, chemical concentration calculators, pharmaceutical quality control calculations, and related educational resources available on ToolNest at:
          </p>
          <p className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl font-mono text-xs text-teal-600 dark:text-teal-400 font-semibold break-all">
            <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1.5">
              <span>{websiteUrl}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
          <p>
            ToolNest provides digital tools intended to assist with general calculations, educational activities, preliminary data analysis, and scientific reference purposes.
          </p>
          <p>
            The information, formulas, calculations, conversions, examples, and results provided through these tools are intended as general informational aids. They are not a substitute for professional scientific judgment, laboratory validation, approved procedures, or applicable regulatory requirements.
          </p>
          <p>
            By using any scientific or laboratory-related tool on ToolNest, you acknowledge and agree to the limitations described in this disclaimer.
          </p>
        </div>

        {/* Section 2 */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-amber-600 dark:text-amber-400 font-mono text-sm">2.</span>
            General Informational and Educational Purpose
          </h3>
          <p>
            Scientific and laboratory tools on ToolNest are designed to help users perform common calculations and understand scientific concepts. Depending on the tools available, these may include:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-1 text-xs text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-1.5">• Concentration and dilution calculations.</li>
            <li className="flex items-start gap-1.5">• Molarity, normality, and solution preparation calculations.</li>
            <li className="flex items-start gap-1.5">• Parts per million (ppm) and related unit conversions.</li>
            <li className="flex items-start gap-1.5">• Percentage calculations and percentage error.</li>
            <li className="flex items-start gap-1.5">• Relative standard deviation (%RSD).</li>
            <li className="flex items-start gap-1.5">• Assay and analytical calculation aids.</li>
            <li className="flex items-start gap-1.5">• Dissolution and pharmaceutical quality control calculations.</li>
            <li className="flex items-start gap-1.5">• Unit conversions and other laboratory mathematics.</li>
            <li className="flex items-start gap-1.5 sm:col-span-2">• General scientific and educational utilities.</li>
          </ul>
          <p className="text-xs text-slate-500 pt-1">
            The availability of any particular tool does not imply that its outputs have been validated for a specific laboratory, analytical method, pharmaceutical product, or regulated process. Users must independently verify the suitability and accuracy of results before using them in practical applications.
          </p>
        </div>

        {/* Section 3 */}
        <div className="p-4 sm:p-5 bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl border border-amber-200/80 dark:border-amber-900/50 space-y-2">
          <h3 className="font-heading font-bold text-sm sm:text-base text-amber-900 dark:text-amber-300 flex items-center gap-2">
            <span className="font-mono text-sm">3.</span>
            Mandatory SOP and Pharmacopoeia Notice
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            Laboratory work and pharmaceutical quality decisions must follow applicable approved procedures and regulatory requirements. Calculations and information provided by ToolNest must not replace or override:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 dark:text-slate-300 pl-1">
            <li>Approved, site-specific Standard Operating Procedures (SOPs).</li>
            <li>Current Safety Data Sheets (SDSs).</li>
            <li>Validated analytical methods.</li>
            <li>Approved product specifications and acceptance criteria.</li>
            <li>Applicable official pharmacopoeial requirements, including USP–NF, British Pharmacopoeia (BP), European Pharmacopoeia (Ph. Eur.), and Japanese Pharmacopoeia (JP), where applicable.</li>
            <li>Relevant International Council for Harmonisation (ICH) guidelines.</li>
            <li>Applicable laws, regulations, quality systems, and instructions from qualified personnel.</li>
          </ul>
          <p className="text-xs text-amber-800 dark:text-amber-400 font-medium pt-1">
            The applicable edition, official requirements, and approved method must be determined by the responsible laboratory or organization. A calculation produced by ToolNest does not establish that a laboratory method is validated, a product complies with specifications, or a pharmaceutical batch is suitable for release.
          </p>
        </div>

        {/* Section 4 */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-amber-600 dark:text-amber-400 font-mono text-sm">4.</span>
            Chemical Concentrations and Solution Preparation
          </h3>
          <p>
            Concentration and solution preparation calculations depend on the units, input values, chemical identity, purity, and physical properties of the materials involved. Results may be affected by:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs pl-1 text-slate-600 dark:text-slate-300">
            <li>Incorrect input values or unit selection.</li>
            <li>Reagent purity, potency, or assay value.</li>
            <li>Molecular weight and chemical form.</li>
            <li>Hydration state and stoichiometry.</li>
            <li>Solution density and temperature.</li>
            <li>Solvent composition and material compatibility.</li>
            <li>Chemical reactions, degradation, or instability.</li>
            <li>Significant figures, rounding, and measurement uncertainty.</li>
          </ul>
          <p className="text-xs text-slate-500">
            For example, converting ppm to mg/L may approximately assume a dilute aqueous solution with a density close to 1.00 g/cm³. This approximation may not be appropriate for concentrated, viscous, non-aqueous, or high-density mixtures. Users must verify the assumptions underlying each calculation before applying the result.
          </p>
          <p className="text-xs text-slate-500">
            ToolNest does not guarantee that a calculated quantity will produce the intended final concentration in every practical situation.
          </p>
        </div>

        {/* Section 5 */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-amber-600 dark:text-amber-400 font-mono text-sm">5.</span>
            Pharmaceutical Quality Control Disclaimer
          </h3>
          <p>
            Pharmaceutical quality control involves validated procedures, controlled conditions, documented evidence, trained personnel, and applicable regulatory standards. Any pharmaceutical QC calculation or reference available through ToolNest is provided for general calculation support and educational purposes (e.g. Assay % potency, %RSD, mean/SD statistics, dissolution % release, dilution factors, acceptance limits).
          </p>
          <p>
            These tools do not independently determine whether a pharmaceutical product, raw material, laboratory result, or manufactured batch meets its applicable specifications. Acceptance criteria must come from the approved specification, validated method, applicable pharmacopoeia, regulatory requirements, or other authorized source.
          </p>
          <p className="font-semibold text-slate-900 dark:text-white text-xs">
            ToolNest must not be used as the sole basis for releasing, rejecting, or certifying a pharmaceutical batch. Final quality decisions must be made by appropriately qualified and authorized personnel under the organization's approved quality management system.
          </p>
        </div>

        {/* Section 6 */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-amber-600 dark:text-amber-400 font-mono text-sm">6.</span>
            Laboratory Safety and Chemical Handling
          </h3>
          <p>
            ToolNest is not a chemical safety authority and does not replace professional laboratory safety training or official safety documentation. Before handling chemicals, preparing solutions, operating equipment, or performing laboratory procedures, users must consult applicable Safety Data Sheets (SDS), approved SOPs, equipment instructions, and institutional safety requirements.
          </p>
          <p>Users are responsible for determining appropriate:</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs pl-1 text-slate-600 dark:text-slate-300">
            <li>• Personal protective equipment (PPE).</li>
            <li>• Ventilation and engineering controls.</li>
            <li>• Chemical storage and segregation.</li>
            <li>• Handling and mixing procedures.</li>
            <li>• Spill response and emergency measures.</li>
            <li>• Waste disposal practices.</li>
            <li className="sm:col-span-2">• Compatibility of chemicals, containers, and equipment.</li>
          </ul>
          <p className="text-amber-700 dark:text-amber-400 text-xs font-medium pt-1">
            Never assume that a concentration calculation or formula provided by ToolNest establishes that a chemical mixture is safe to prepare or handle. Chemical reactions may generate heat, gas, pressure, toxic substances, or other hazards.
          </p>
        </div>

        {/* Section 7 */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-amber-600 dark:text-amber-400 font-mono text-sm">7.</span>
            Accuracy, Verification, and Limitations
          </h3>
          <p>
            We aim to make our scientific tools useful and reliable. However, we do not guarantee that all formulas, outputs, references, or calculations will always be accurate, complete, current, or suitable for a particular application.
          </p>
          <p className="text-xs text-slate-500">
            Errors may arise from incorrect inputs, formula limitations, rounding, software defects, misunderstood units, outdated references, or assumptions that do not match actual conditions. For regulated laboratory activities, calculations must be checked and documented in accordance with the applicable quality system and approved procedures.
          </p>
        </div>

        {/* Section 8 */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-amber-600 dark:text-amber-400 font-mono text-sm">8.</span>
            Measurement Uncertainty and Significant Figures
          </h3>
          <p>
            Scientific calculations are often affected by measurement uncertainty, instrument limitations, reagent variability, and rounding. A numerical result displayed by a calculator does not necessarily represent the actual precision or accuracy of a physical measurement.
          </p>
          <p className="text-xs text-slate-500">
            Users should consider the uncertainty and traceability of input measurements, instrument calibration status, significant figures, rounding requirements, error propagation, and the fundamental distinction between numerical precision and analytical measurement accuracy.
          </p>
        </div>

        {/* Section 9 */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-amber-600 dark:text-amber-400 font-mono text-sm">9.</span>
            No Professional Advice or Certification
          </h3>
          <p>
            Information available through ToolNest does not constitute professional scientific, pharmaceutical, chemical, medical, regulatory, engineering, or legal advice. ToolNest does not provide laboratory certification, accreditation, analytical method validation, product certification, or regulatory approval.
          </p>
        </div>

        {/* Section 10 */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-amber-600 dark:text-amber-400 font-mono text-sm">10.</span>
            User Responsibility
          </h3>
          <p>By using scientific or laboratory tools on ToolNest, you agree that you are responsible for:</p>
          <ul className="list-disc list-inside space-y-1 text-xs pl-1 text-slate-600 dark:text-slate-300">
            <li>Entering correct values and selecting appropriate units.</li>
            <li>Checking formulas and assumptions.</li>
            <li>Verifying calculations before practical use.</li>
            <li>Following approved SOPs and applicable safety requirements.</li>
            <li>Consulting current official references where required.</li>
            <li>Obtaining appropriate review and authorization.</li>
            <li>Maintaining required laboratory records and documentation.</li>
            <li>Ensuring that your activities comply with applicable laws and regulations.</li>
          </ul>
        </div>

        {/* Section 11 */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-amber-600 dark:text-amber-400 font-mono text-sm">11.</span>
            Third-Party References and External Resources
          </h3>
          <p>
            ToolNest may refer to external organizations, publications, standards, or resources for general information. Such references are provided for convenience and do not necessarily imply endorsement, affiliation, authorization, or certification by those organizations. Official standards and guidelines may be revised over time; users must consult current authoritative publications.
          </p>
        </div>

        {/* Section 12 */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-amber-600 dark:text-amber-400 font-mono text-sm">12.</span>
            Limitation of Liability
          </h3>
          <p>
            To the fullest extent permitted by applicable law, ToolNest and its operators disclaim liability for losses arising from reliance on scientific calculations, laboratory utilities, formulas, assumptions, or informational content provided through the website.
          </p>
        </div>

        {/* Section 13 */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-amber-600 dark:text-amber-400 font-mono text-sm">13.</span>
            Updates to This Disclaimer
          </h3>
          <p>
            We may update this Scientific & Laboratory Disclaimer to reflect changes in our tools, website functionality, scientific resources, or applicable requirements. Revisions will be published on this page with an updated "Last Updated" date.
          </p>
        </div>

        {/* Section 14: Contact Information */}
        <div className="p-4 sm:p-5 bg-teal-50/60 dark:bg-teal-950/30 rounded-2xl border border-teal-200/60 dark:border-teal-900/40 space-y-2 pt-2">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-teal-600 dark:text-teal-400 font-mono text-sm">14.</span>
            Contact Information
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            If you have questions about this disclaimer or the scientific tools available on ToolNest, please contact us.
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
              <strong>Email:</strong>{' '}
              <a href={`mailto:${officialEmail}`} className="font-mono text-teal-600 dark:text-teal-400 hover:underline font-semibold">
                {officialEmail}
              </a>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
            Please note that contacting ToolNest does not replace the need to consult a qualified laboratory professional, an authorized quality representative, or an official regulatory source for critical laboratory decisions.
          </p>
        </div>

        <div className="text-center pt-2 space-y-1">
          <div className="text-xs font-semibold text-slate-900 dark:text-white">
            ToolNest — Every Tool. One Place.
          </div>
          <div className="text-xs text-amber-700 dark:text-amber-400 italic">
            Scientific calculations are helpful aids. Approved procedures, verified results, and laboratory safety always come first.
          </div>
        </div>
      </div>
    </div>
  );
}
