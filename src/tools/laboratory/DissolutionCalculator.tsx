import { useState } from 'react';
import { Copy, RotateCcw, Check, Plus, Trash2, Info, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { copyToClipboard, formatNumber } from '../../utils/formatters';

interface TimePoint {
  id: string;
  timeMin: number;
  sampleArea: string;
}

export default function DissolutionCalculator() {
  // Method parameters
  const [mediaVolume, setMediaVolume] = useState<string>('900'); // mL
  const [labelClaim, setLabelClaim] = useState<string>('500'); // mg per tablet
  const [stdWeight, setStdWeight] = useState<string>('55.5'); // mg
  const [stdDilution1, setStdDilution1] = useState<string>('100'); // mL
  const [stdDilution2, setStdDilution2] = useState<string>('5'); // aliquot mL
  const [stdDilution3, setStdDilution3] = useState<string>('50'); // final mL
  const [stdPurity, setStdPurity] = useState<string>('99.8'); // %
  const [stdArea, setStdArea] = useState<string>('2450000'); // response / area

  // Sampling parameters
  const [sampleVolume, setSampleVolume] = useState<string>('5'); // mL pulled per timepoint
  const [sampleDilution, setSampleDilution] = useState<string>('1'); // dilution factor of sample
  const [volumeReplaced, setVolumeReplaced] = useState<boolean>(true); // replace with fresh medium?
  const [qSpecification, setQSpecification] = useState<string>('80'); // Q specification %

  // Timepoints
  const [timePoints, setTimePoints] = useState<TimePoint[]>([
    { id: '1', timeMin: 10, sampleArea: '1150000' },
    { id: '2', timeMin: 20, sampleArea: '1890000' },
    { id: '3', timeMin: 30, sampleArea: '2280000' },
    { id: '4', timeMin: 45, sampleArea: '2430000' },
    { id: '5', timeMin: 60, sampleArea: '2470000' }
  ]);

  const [copied, setCopied] = useState<boolean>(false);

  // Calculations
  const mediaVol = parseFloat(mediaVolume) || 0;
  const claimMg = parseFloat(labelClaim) || 0;
  const sWeight = parseFloat(stdWeight) || 0;
  const sDil1 = parseFloat(stdDilution1) || 1;
  const sDil2 = parseFloat(stdDilution2) || 1;
  const sDil3 = parseFloat(stdDilution3) || 1;
  const sPurity = (parseFloat(stdPurity) || 100) / 100;
  const sArea = parseFloat(stdArea) || 0;
  const vSample = parseFloat(sampleVolume) || 0;
  const sampDil = parseFloat(sampleDilution) || 1;
  const qVal = parseFloat(qSpecification) || 80;

  // Standard concentration in mg/mL
  const stdConcMgMl = sDil1 > 0 && sDil3 > 0 ? (sWeight / sDil1) * (sDil2 / sDil3) * sPurity : 0;

  // Calculate cumulative release per time point with volume replacement correction
  let cumulativeLossMg = 0;
  const results = timePoints.map((tp, idx) => {
    const smpArea = parseFloat(tp.sampleArea) || 0;
    if (sArea <= 0 || claimMg <= 0 || mediaVol <= 0) {
      return { ...tp, concMgMl: 0, mgReleased: 0, percentReleased: 0 };
    }

    // Concentration of sample aliquot in vessel (mg/mL)
    const concInAliquot = (smpArea / sArea) * stdConcMgMl * sampDil;

    // Amount in current vessel
    const currentVesselVol = volumeReplaced ? mediaVol : mediaVol - idx * vSample;
    const currentVesselMg = concInAliquot * currentVesselVol;

    // Total cumulative mg released = current vessel amount + sum of drug removed in previous samples
    const totalMg = currentVesselMg + cumulativeLossMg;
    const percent = (totalMg / claimMg) * 100;

    // Update cumulative loss for subsequent timepoints
    cumulativeLossMg += concInAliquot * vSample;

    return {
      ...tp,
      concMgMl: concInAliquot,
      mgReleased: totalMg,
      percentReleased: percent
    };
  });

  const finalTimePoint = results[results.length - 1];
  const meetsQ = finalTimePoint ? finalTimePoint.percentReleased >= qVal : false;

  const handleAddTimePoint = () => {
    const lastTime = timePoints.length > 0 ? timePoints[timePoints.length - 1].timeMin : 0;
    const nextId = (Date.now() + Math.random()).toString();
    setTimePoints([...timePoints, { id: nextId, timeMin: lastTime + 15, sampleArea: '' }]);
  };

  const handleRemoveTimePoint = (id: string) => {
    if (timePoints.length <= 1) return;
    setTimePoints(timePoints.filter((t) => t.id !== id));
  };

  const handleUpdateTimePoint = (id: string, field: 'timeMin' | 'sampleArea', val: string) => {
    setTimePoints(
      timePoints.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            [field]: field === 'timeMin' ? parseFloat(val) || 0 : val
          };
        }
        return t;
      })
    );
  };

  const handleReset = () => {
    setMediaVolume('900');
    setLabelClaim('500');
    setStdWeight('55.5');
    setStdDilution1('100');
    setStdDilution2('5');
    setStdDilution3('50');
    setStdPurity('99.8');
    setStdArea('2450000');
    setSampleVolume('5');
    setSampleDilution('1');
    setVolumeReplaced(true);
    setQSpecification('80');
    setTimePoints([
      { id: '1', timeMin: 10, sampleArea: '1150000' },
      { id: '2', timeMin: 20, sampleArea: '1890000' },
      { id: '3', timeMin: 30, sampleArea: '2280000' },
      { id: '4', timeMin: 45, sampleArea: '2430000' },
      { id: '5', timeMin: 60, sampleArea: '2470000' }
    ]);
  };

  const handleCopySummary = async () => {
    const rows = results
      .map(
        (r) =>
          `${r.timeMin} min: ${formatNumber(r.percentReleased, 2)}% (${formatNumber(r.mgReleased, 2)} mg)`
      )
      .join('\n');

    const text = `--- Dissolution % Release Profile (USP <711>) ---
Label Claim: ${labelClaim} mg | Media: ${mediaVolume} mL
Standard Conc: ${formatNumber(stdConcMgMl, 5)} mg/mL
Q Specification: NLT ${qSpecification}%
Sampling Volume: ${sampleVolume} mL (Media Replaced: ${volumeReplaced ? 'Yes' : 'No'})

Release Profile:
${rows}

Final Status: ${finalTimePoint ? `${formatNumber(finalTimePoint.percentReleased, 1)}% - ${meetsQ ? 'COMPLIES with Q' : 'DOES NOT COMPLY with Q'}` : 'N/A'}`;

    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Configuration Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-heading font-semibold text-base text-slate-900 dark:text-white">
              Dissolution Method & Standard Setup
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Accurate cumulative drug release with sampling volume replacement correction
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

        {/* Essential Method Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Vessel Volume (mL)
            </label>
            <input
              type="number"
              value={mediaVolume}
              onChange={(e) => setMediaVolume(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              placeholder="900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Label Claim (mg / unit)
            </label>
            <input
              type="number"
              value={labelClaim}
              onChange={(e) => setLabelClaim(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              placeholder="500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Sample Volume Pulled (mL)
            </label>
            <input
              type="number"
              value={sampleVolume}
              onChange={(e) => setSampleVolume(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              placeholder="5"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Q Acceptance Limit (%)
            </label>
            <input
              type="number"
              value={qSpecification}
              onChange={(e) => setQSpecification(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              placeholder="80"
            />
          </div>
        </div>

        {/* Standard Preparation Details */}
        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-3">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>Reference Standard Preparation & Response</span>
            <span className="font-mono text-teal-600 dark:text-teal-400">
              Std Conc: {formatNumber(stdConcMgMl, 5)} mg/mL
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Std Weight (mg)</label>
              <input
                type="number"
                value={stdWeight}
                onChange={(e) => setStdWeight(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Flask 1 (mL)</label>
              <input
                type="number"
                value={stdDilution1}
                onChange={(e) => setStdDilution1(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Aliquot (mL)</label>
              <input
                type="number"
                value={stdDilution2}
                onChange={(e) => setStdDilution2(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Final Vol (mL)</label>
              <input
                type="number"
                value={stdDilution3}
                onChange={(e) => setStdDilution3(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Purity (%)</label>
              <input
                type="number"
                value={stdPurity}
                onChange={(e) => setStdPurity(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Std Area/Abs</label>
              <input
                type="number"
                value={stdArea}
                onChange={(e) => setStdArea(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 text-xs">
            <input
              type="checkbox"
              id="volReplaced"
              checked={volumeReplaced}
              onChange={(e) => setVolumeReplaced(e.target.checked)}
              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <label htmlFor="volReplaced" className="text-slate-600 dark:text-slate-300 cursor-pointer">
              Sample volume was replaced with equal fresh dissolution medium at each timepoint
            </label>
          </div>
        </div>
      </div>

      {/* Timepoints Table & Results */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="font-heading font-semibold text-base text-slate-900 dark:text-white">
              Sampling Timepoints & Area Readings
            </h4>
            <p className="text-xs text-slate-500">
              Enter HPLC peak areas or UV spectrophotometer absorbance values
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddTimePoint}
              className="px-3 py-1.5 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-medium rounded-xl hover:bg-teal-100 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Timepoint
            </button>
            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Profile'}
            </button>
          </div>
        </div>

        {/* Interactive Responsive Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-medium">
              <tr>
                <th className="py-3 px-4">Time (min)</th>
                <th className="py-3 px-4">Sample Area / Abs</th>
                <th className="py-3 px-4">Conc (mg/mL)</th>
                <th className="py-3 px-4">Cumulative mg</th>
                <th className="py-3 px-4">Cumulative % Release</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {results.map((tp, idx) => (
                <tr key={tp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-4">
                    <input
                      type="number"
                      value={tp.timeMin}
                      onChange={(e) => handleUpdateTimePoint(tp.id, 'timeMin', e.target.value)}
                      className="w-16 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </td>
                  <td className="py-2.5 px-4">
                    <input
                      type="number"
                      value={tp.sampleArea}
                      onChange={(e) => handleUpdateTimePoint(tp.id, 'sampleArea', e.target.value)}
                      placeholder="Area"
                      className="w-32 px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                    {formatNumber(tp.concMgMl, 4)}
                  </td>
                  <td className="py-2.5 px-4 text-slate-800 dark:text-slate-200">
                    {formatNumber(tp.mgReleased, 2)} mg
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatNumber(tp.percentReleased, 2)}%
                      </span>
                      {tp.percentReleased >= qVal && (
                        <span className="text-[10px] text-teal-600 dark:text-teal-400 font-sans font-medium px-1.5 py-0.2 rounded bg-teal-50 dark:bg-teal-950/40">
                          ≥ Q
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => handleRemoveTimePoint(tp.id)}
                      disabled={timePoints.length <= 1}
                      title="Delete timepoint"
                      className="p-1 text-slate-400 hover:text-rose-500 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Card */}
        {finalTimePoint && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-500">
                Final Timepoint ({finalTimePoint.timeMin} min) Drug Release
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                {formatNumber(finalTimePoint.percentReleased, 2)}%
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Target: NLT {qSpecification}% ({meetsQ ? 'Meets acceptance criteria' : 'Fails acceptance criteria'})
              </div>
            </div>

            <div
              className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                meetsQ
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              }`}
            >
              {meetsQ ? 'PASSED: Complies with Q' : 'FAILED: Below Q Limit'}
            </div>
          </div>
        )}

        {/* USP Pharmacopeial Reference Note */}
        <div className="p-3.5 bg-teal-50/60 dark:bg-teal-950/20 rounded-xl border border-teal-100 dark:border-teal-900/40 flex items-start gap-2.5 text-xs text-teal-800 dark:text-teal-300">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-teal-600 dark:text-teal-400" />
          <div className="leading-relaxed">
            <strong className="font-semibold">USP &lt;711&gt; Compliance: </strong>
            Calculates cumulative dissolved drug taking into account previous sampling aliquots:
            <code className="mx-1 font-mono text-[11px] bg-white/70 dark:bg-slate-900/50 px-1 py-0.5 rounded">
              % Released = [C_n × V_n + Σ(C_i × V_pull)] / Label_Claim × 100
            </code>.
          </div>
        </div>
      </div>
    </div>
  );
}
