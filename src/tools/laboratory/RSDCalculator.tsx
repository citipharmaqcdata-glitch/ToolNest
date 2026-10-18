import { useState } from 'react';
import { Copy, RotateCcw, Check, Microscope, AlertCircle, Info } from 'lucide-react';
import { copyToClipboard, formatNumber } from '../../utils/formatters';

const SAMPLE_REPLICATES = '99.8, 100.2, 99.5, 100.1, 100.4, 99.7';

export default function RSDCalculator() {
  const [dataInput, setDataInput] = useState<string>(SAMPLE_REPLICATES);
  const [copied, setCopied] = useState<boolean>(false);

  // Parse numbers
  const parseNumbers = (raw: string): number[] => {
    return raw
      .split(/[\s,;\n\t]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(Number)
      .filter(n => !isNaN(n));
  };

  const values = parseNumbers(dataInput);
  const n = values.length;

  let mean: number | null = null;
  let sampleSd: number | null = null;
  let popSd: number | null = null;
  let rsd: number | null = null;
  let minVal: number | null = null;
  let maxVal: number | null = null;
  let rangeVal: number | null = null;

  if (n >= 1) {
    const sum = values.reduce((acc, v) => acc + v, 0);
    mean = sum / n;
    minVal = Math.min(...values);
    maxVal = Math.max(...values);
    rangeVal = maxVal - minVal;

    if (n >= 2 && mean !== 0) {
      const sumSqDiff = values.reduce((acc, v) => acc + Math.pow(v - (mean as number), 2), 0);
      sampleSd = Math.sqrt(sumSqDiff / (n - 1));
      popSd = Math.sqrt(sumSqDiff / n);
      rsd = (sampleSd / Math.abs(mean)) * 100;
    }
  }

  const handleCopy = async () => {
    if (mean !== null && sampleSd !== null && rsd !== null) {
      const text = `Replicates (n=${n}): Mean = ${formatNumber(mean, 4)}, SD = ${formatNumber(sampleSd, 4)}, %RSD = ${formatNumber(rsd, 4)}%`;
      const success = await copyToClipboard(text);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    }
  };

  const handleReset = () => {
    setDataInput('');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Input Form */}
        <div className="md:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-heading font-semibold text-slate-900 dark:text-white text-base">
              Analytical Replicates Data
            </h3>
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1.5 py-1 px-2.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5 text-xs text-slate-600 dark:text-slate-400">
              <label className="font-medium">Enter values (separated by commas, spaces, or lines)</label>
              <button
                onClick={() => setDataInput(SAMPLE_REPLICATES)}
                className="text-teal-600 dark:text-teal-400 hover:underline"
              >
                Sample 6-Injection QC Data
              </button>
            </div>
            <textarea
              rows={5}
              value={dataInput}
              onChange={(e) => setDataInput(e.target.value)}
              placeholder="e.g. 99.8, 100.2, 99.5, 100.1, 100.4, 99.7"
              className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Valid numerical observations: <strong className="font-mono text-slate-800 dark:text-slate-200">{n}</strong></span>
            {n < 2 && <span className="text-amber-600 dark:text-amber-400">Requires ≥ 2 values for SD & %RSD</span>}
          </div>
        </div>

        {/* Results Panel */}
        <div className="md:col-span-6 bg-gradient-to-br from-slate-50 to-teal-50/30 dark:from-slate-900 dark:to-slate-800/60 p-6 rounded-2xl border border-teal-100/60 dark:border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span>Statistical Summary</span>
              <span>%RSD = (s ÷ x̄) × 100</span>
            </div>

            {n >= 2 && rsd !== null ? (
              <div className="space-y-4">
                <div className="p-4 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-teal-100 dark:border-teal-900/40">
                  <div className="text-[11px] font-medium text-slate-400 uppercase">Relative Standard Deviation</div>
                  <div className="text-3xl font-bold font-mono tracking-tight text-teal-600 dark:text-teal-400 tabular-nums mt-0.5">
                    {formatNumber(rsd, 4)}%
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Mean (x̄) = {formatNumber(mean || 0, 4)} · Sample SD (s) = {formatNumber(sampleSd || 0, 4)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-slate-700/60">
                    <div className="text-slate-400 text-[10px] uppercase font-medium">Replicates Count (n)</div>
                    <div className="text-base font-bold font-mono text-slate-900 dark:text-white tabular-nums">{n}</div>
                  </div>
                  <div className="p-2.5 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-slate-700/60">
                    <div className="text-slate-400 text-[10px] uppercase font-medium">Data Range</div>
                    <div className="text-base font-bold font-mono text-slate-900 dark:text-white tabular-nums">{formatNumber(rangeVal || 0, 4)}</div>
                  </div>
                  <div className="p-2.5 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-slate-700/60">
                    <div className="text-slate-400 text-[10px] uppercase font-medium">Min Observation</div>
                    <div className="text-sm font-semibold font-mono text-slate-900 dark:text-white tabular-nums">{formatNumber(minVal || 0, 4)}</div>
                  </div>
                  <div className="p-2.5 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-slate-700/60">
                    <div className="text-slate-400 text-[10px] uppercase font-medium">Max Observation</div>
                    <div className="text-sm font-semibold font-mono text-slate-900 dark:text-white tabular-nums">{formatNumber(maxVal || 0, 4)}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-400">Enter at least 2 numerical replicate values to calculate %RSD.</div>
            )}
          </div>

          <div className="space-y-3 pt-3">
            <button
              onClick={handleCopy}
              disabled={rsd === null}
              className="w-full py-2 px-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied Stats!' : 'Copy Summary'}
            </button>

            <div className="p-2.5 bg-slate-100 dark:bg-slate-800/70 rounded-lg text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-teal-600" />
              <span>
                <strong>QC Guidance:</strong> For HPLC/GC system suitability, chromatographic acceptance criteria (e.g. %RSD ≤ 1.0% or ≤ 2.0%) must follow the validated method and current USP/BP monograph.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
