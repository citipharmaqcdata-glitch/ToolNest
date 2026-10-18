import { useState } from 'react';
import { Copy, RotateCcw, Check, Microscope, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { copyToClipboard, formatNumber } from '../../utils/formatters';

export default function AssayCalculator() {
  // Standard parameters
  const [stdWeight, setStdWeight] = useState<string>('50.2'); // mg
  const [stdVol1, setStdVol1] = useState<string>('100'); // mL
  const [stdAliquot, setStdAliquot] = useState<string>('5'); // mL
  const [stdVol2, setStdVol2] = useState<string>('50'); // mL
  const [stdPurity, setStdPurity] = useState<string>('99.6'); // %
  const [stdArea, setStdArea] = useState<string>('3150000'); // Response

  // Sample parameters
  const [avgTabletWeight, setAvgTabletWeight] = useState<string>('650.0'); // mg
  const [sampleWeight, setSampleWeight] = useState<string>('325.0'); // mg of composite powder
  const [sampleVol1, setSampleVol1] = useState<string>('100'); // mL
  const [sampleAliquot, setSampleAliquot] = useState<string>('5'); // mL
  const [sampleVol2, setSampleVol2] = useState<string>('50'); // mL
  const [labelClaim, setLabelClaim] = useState<string>('250.0'); // mg / tablet
  const [sampleArea, setSampleArea] = useState<string>('3120000'); // Response

  // Moisture / LOD correction
  const [enableLodCorrection, setEnableLodCorrection] = useState<boolean>(false);
  const [lodPercent, setLodPercent] = useState<string>('1.8'); // % moisture / LOD

  // Acceptance criteria range
  const [minLimit, setMinLimit] = useState<string>('90.0');
  const [maxLimit, setMaxLimit] = useState<string>('110.0');

  const [copied, setCopied] = useState<boolean>(false);

  // Parsing numbers
  const wStd = parseFloat(stdWeight) || 0;
  const vStd1 = parseFloat(stdVol1) || 1;
  const alStd = parseFloat(stdAliquot) || 1;
  const vStd2 = parseFloat(stdVol2) || 1;
  const purStd = (parseFloat(stdPurity) || 100) / 100;
  const rStd = parseFloat(stdArea) || 0;

  const wAvg = parseFloat(avgTabletWeight) || 0;
  const wSmp = parseFloat(sampleWeight) || 0;
  const vSmp1 = parseFloat(sampleVol1) || 1;
  const alSmp = parseFloat(sampleAliquot) || 1;
  const vSmp2 = parseFloat(sampleVol2) || 1;
  const claim = parseFloat(labelClaim) || 0;
  const rSmp = parseFloat(sampleArea) || 0;

  const lod = (parseFloat(lodPercent) || 0) / 100;
  const minLim = parseFloat(minLimit) || 90.0;
  const maxLim = parseFloat(maxLimit) || 110.0;

  // Standard concentration (mg/mL)
  const stdConc = vStd1 > 0 && vStd2 > 0 ? (wStd / vStd1) * (alStd / vStd2) * purStd : 0;

  // Dilution factors
  const stdDilutionFactor = vStd1 > 0 && vStd2 > 0 ? (wStd / vStd1) * (alStd / vStd2) : 0;
  const smpDilutionFactor =
    vSmp1 > 0 && vSmp2 > 0 && alSmp > 0 ? (vSmp1 / alSmp) * vSmp2 : 0;

  // Active drug content in sample solution
  // Amount (mg) per tablet:
  // = (R_sample / R_std) * (W_std / V_std1) * (Al_std / V_std2) * (V_smp1 / W_smp) * (V_smp2 / Al_smp) * W_avg * Purity_std
  let mgPerTablet = 0;
  if (rStd > 0 && wSmp > 0 && vSmp1 > 0 && alSmp > 0 && vSmp2 > 0) {
    const smpConc = (rSmp / rStd) * stdConc;
    // total mg in initial sample flask = smpConc * (vSmp2 / alSmp) * vSmp1
    const totalMgInSamplePowder = smpConc * (vSmp2 / alSmp) * vSmp1;
    // mg in one average tablet:
    mgPerTablet = (totalMgInSamplePowder / wSmp) * wAvg;
  }

  // % Assay as-is
  const assayAsIs = claim > 0 ? (mgPerTablet / claim) * 100 : 0;

  // % Assay on dried / anhydrous basis
  const assayDried = enableLodCorrection && lod < 1 ? assayAsIs / (1 - lod) : assayAsIs;

  const finalAssay = enableLodCorrection ? assayDried : assayAsIs;
  const isCompliant = finalAssay >= minLim && finalAssay <= maxLim;

  const handleReset = () => {
    setStdWeight('50.2');
    setStdVol1('100');
    setStdAliquot('5');
    setStdVol2('50');
    setStdPurity('99.6');
    setStdArea('3150000');
    setAvgTabletWeight('650.0');
    setSampleWeight('325.0');
    setSampleVol1('100');
    setSampleAliquot('5');
    setSampleVol2('50');
    setLabelClaim('250.0');
    setSampleArea('3120000');
    setEnableLodCorrection(false);
    setLodPercent('1.8');
    setMinLimit('90.0');
    setMaxLimit('110.0');
  };

  const handleCopy = async () => {
    const text = `--- Pharmaceutical QC Assay & Potency Certificate ---
Label Claim: ${labelClaim} mg/unit | Average Weight: ${avgTabletWeight} mg
Standard Weight: ${stdWeight} mg (Purity: ${stdPurity}%)
Sample Weight Taken: ${sampleWeight} mg
Sample Response: ${sampleArea} | Standard Response: ${stdArea}

Results:
Active Drug Content: ${formatNumber(mgPerTablet, 2)} mg / unit
Assay (As-Is): ${formatNumber(assayAsIs, 2)}%
${enableLodCorrection ? `Assay (Dried/Anhydrous Basis at ${lodPercent}% LOD): ${formatNumber(assayDried, 2)}%\n` : ''}
Acceptance Criteria: ${minLimit}% - ${maxLimit}%
Compliance: ${isCompliant ? 'COMPLIES WITH SPECIFICATION (PASSED)' : 'OUT OF SPECIFICATION (OOS)'}`;

    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-heading font-semibold text-base text-slate-900 dark:text-white">
              Analytical QC Assay & Potency Setup
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Standard chromatographic HPLC or UV-Vis finished product tablet/capsule assay
            </p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        {/* Core Product Specification */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Label Claim (mg / unit)
            </label>
            <input
              type="number"
              value={labelClaim}
              onChange={(e) => setLabelClaim(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              placeholder="250.0"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Average Tablet Weight (mg)
            </label>
            <input
              type="number"
              value={avgTabletWeight}
              onChange={(e) => setAvgTabletWeight(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              placeholder="650.0"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Specification Min (%)
            </label>
            <input
              type="number"
              value={minLimit}
              onChange={(e) => setMinLimit(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              placeholder="90.0"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Specification Max (%)
            </label>
            <input
              type="number"
              value={maxLimit}
              onChange={(e) => setMaxLimit(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              placeholder="110.0"
            />
          </div>
        </div>

        {/* Dual Panels: Standard Preparation vs Sample Preparation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Reference Standard */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
              <span>Reference Standard Preparation</span>
              <span className="font-mono text-teal-600 dark:text-teal-400">
                Conc: {formatNumber(stdConc, 4)} mg/mL
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Weight (mg)</label>
                <input
                  type="number"
                  value={stdWeight}
                  onChange={(e) => setStdWeight(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Flask 1 (mL)</label>
                <input
                  type="number"
                  value={stdVol1}
                  onChange={(e) => setStdVol1(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Aliquot (mL)</label>
                <input
                  type="number"
                  value={stdAliquot}
                  onChange={(e) => setStdAliquot(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Flask 2 (mL)</label>
                <input
                  type="number"
                  value={stdVol2}
                  onChange={(e) => setStdVol2(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Purity (%)</label>
                <input
                  type="number"
                  value={stdPurity}
                  onChange={(e) => setStdPurity(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Area / Abs</label>
                <input
                  type="number"
                  value={stdArea}
                  onChange={(e) => setStdArea(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Test Sample Preparation */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
              <span>Test Sample Preparation</span>
              <span className="font-mono text-slate-500">Finished Product</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Powder Wt (mg)</label>
                <input
                  type="number"
                  value={sampleWeight}
                  onChange={(e) => setSampleWeight(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Flask 1 (mL)</label>
                <input
                  type="number"
                  value={sampleVol1}
                  onChange={(e) => setSampleVol1(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Aliquot (mL)</label>
                <input
                  type="number"
                  value={sampleAliquot}
                  onChange={(e) => setSampleAliquot(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Flask 2 (mL)</label>
                <input
                  type="number"
                  value={sampleVol2}
                  onChange={(e) => setSampleVol2(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] text-slate-500 mb-1">Sample Area / Abs</label>
                <input
                  type="number"
                  value={sampleArea}
                  onChange={(e) => setSampleArea(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Moisture / LOD Option */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200/60 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
          <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={enableLodCorrection}
              onChange={(e) => setEnableLodCorrection(e.target.checked)}
              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span>Apply Loss On Drying (LOD) / Karl Fischer moisture correction (Dried Basis)</span>
          </label>

          {enableLodCorrection && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">Water / LOD %:</span>
              <input
                type="number"
                step="0.1"
                value={lodPercent}
                onChange={(e) => setLodPercent(e.target.value)}
                className="w-16 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
              />
            </div>
          )}
        </div>
      </div>

      {/* Outcome Results Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* % Assay Result */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="text-xs text-slate-500 font-medium">
            Assay Result ({enableLodCorrection ? 'Dried Basis' : 'As-Is'})
          </div>
          <div className="text-3xl font-bold font-mono text-teal-600 dark:text-teal-400 mt-2">
            {formatNumber(finalAssay, 2)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Acceptance limit: {minLimit}% – {maxLimit}%
          </div>
        </div>

        {/* Active Substance Amount */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="text-xs text-slate-500 font-medium">Drug Content Per Unit</div>
          <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white mt-2">
            {formatNumber(mgPerTablet, 2)} mg
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Claimed strength: {labelClaim} mg
          </div>
        </div>

        {/* Compliance Status */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="text-xs text-slate-500 font-medium">QC Status Assessment</div>
          <div className="mt-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${
                isCompliant
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              }`}
            >
              {isCompliant ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {isCompliant ? 'PASSES SPECIFICATION' : 'OUT OF SPECIFICATION (OOS)'}
            </span>
          </div>
          <div className="mt-3">
            <button
              onClick={handleCopy}
              className="w-full py-1.5 px-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy QC Certificate'}
            </button>
          </div>
        </div>
      </div>

      {/* Formula Audit Reference */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
        <div className="font-semibold text-slate-800 dark:text-slate-200">
          Standard Finished Product Assay Calculation Equation:
        </div>
        <div className="font-mono text-[11px] bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 overflow-x-auto">
          Assay (%) = (R_sample / R_standard) × (W_std / V_std1) × (Al_std / V_std2) × (V_smp1 / Al_smp) × (V_smp2 / W_smp) × W_avg × Purity_std × (100 / Claim)
        </div>
      </div>
    </div>
  );
}
