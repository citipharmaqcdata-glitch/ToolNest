import { useState } from 'react';
import { Copy, RotateCcw, Check, AlertCircle, ArrowRight } from 'lucide-react';
import { copyToClipboard, formatNumber } from '../../utils/formatters';

export default function DilutionCalculator() {
  const [target, setTarget] = useState<'v1' | 'c1' | 'v2' | 'c2'>('v1');

  // Values
  const [c1, setC1] = useState<string>('10');
  const [c1Unit, setC1Unit] = useState<string>('M');
  const [v1, setV1] = useState<string>('20');
  const [v1Unit, setV1Unit] = useState<string>('mL');

  const [c2, setC2] = useState<string>('0.5');
  const [c2Unit, setC2Unit] = useState<string>('M');
  const [v2, setV2] = useState<string>('400');
  const [v2Unit, setV2Unit] = useState<string>('mL');

  const [copied, setCopied] = useState(false);

  // Conversion factors relative to base unit (M or L)
  const concFactor = (unit: string) => {
    switch (unit) {
      case 'M': return 1;
      case 'mM': return 1e-3;
      case 'uM': return 1e-6;
      case 'nM': return 1e-9;
      case '% (w/v)': return 10; // 1% = 10 g/L
      case 'mg/mL': return 1;
      case 'g/L': return 1;
      default: return 1;
    }
  };

  const volFactor = (unit: string) => {
    switch (unit) {
      case 'L': return 1;
      case 'mL': return 1e-3;
      case 'uL': return 1e-6;
      default: return 1e-3;
    }
  };

  const handleReset = () => {
    setC1('10');
    setV1('20');
    setC2('0.5');
    setV2('400');
  };

  // Evaluate
  let resultVal: number | null = null;
  let resultUnit: string = '';
  let diluentVolume: number | null = null;
  let steps: string[] = [];

  const numC1 = parseFloat(c1);
  const numV1 = parseFloat(v1);
  const numC2 = parseFloat(c2);
  const numV2 = parseFloat(v2);

  if (target === 'v1') {
    // V1 = (C2 * V2) / C1
    if (!isNaN(numC1) && !isNaN(numC2) && !isNaN(numV2) && numC1 > 0 && numC2 >= 0 && numV2 >= 0) {
      const c1Base = numC1 * concFactor(c1Unit);
      const c2Base = numC2 * concFactor(c2Unit);
      const v2Base = numV2 * volFactor(v2Unit); // in Liters
      const v1Liters = (c2Base * v2Base) / c1Base;

      // express in chosen v1Unit
      resultVal = v1Liters / volFactor(v1Unit);
      resultUnit = v1Unit;
      
      const v2InV1Unit = v2Base / volFactor(v1Unit);
      diluentVolume = Math.max(0, v2InV1Unit - resultVal);

      steps = [
        `Base stock concentration (C1) = ${formatNumber(c1Base, 6)} base`,
        `Base final concentration (C2) = ${formatNumber(c2Base, 6)} base`,
        `Base final volume (V2) = ${formatNumber(v2Base, 6)} L`,
        `V1 = (C2 × V2) ÷ C1 = (${formatNumber(c2Base, 4)} × ${formatNumber(v2Base, 4)}) ÷ ${formatNumber(c1Base, 4)} = ${formatNumber(v1Liters, 6)} L`,
        `Add ${formatNumber(diluentVolume, 4)} ${resultUnit} of diluent / solvent to ${formatNumber(resultVal, 4)} ${resultUnit} of stock solution.`
      ];
    }
  } else if (target === 'c2') {
    // C2 = (C1 * V1) / V2
    if (!isNaN(numC1) && !isNaN(numV1) && !isNaN(numV2) && numV2 > 0 && numC1 >= 0 && numV1 >= 0) {
      const c1Base = numC1 * concFactor(c1Unit);
      const v1Base = numV1 * volFactor(v1Unit);
      const v2Base = numV2 * volFactor(v2Unit);
      const c2Base = (c1Base * v1Base) / v2Base;

      resultVal = c2Base / concFactor(c2Unit);
      resultUnit = c2Unit;

      steps = [
        `Initial amount = C1 × V1 = ${formatNumber(c1Base * v1Base, 6)}`,
        `Final volume (V2) = ${formatNumber(v2Base, 6)} L`,
        `C2 = (C1 × V1) ÷ V2 = ${formatNumber(c2Base, 6)} base units`
      ];
    }
  } else if (target === 'v2') {
    // V2 = (C1 * V1) / C2
    if (!isNaN(numC1) && !isNaN(numV1) && !isNaN(numC2) && numC2 > 0 && numC1 >= 0 && numV1 >= 0) {
      const c1Base = numC1 * concFactor(c1Unit);
      const v1Base = numV1 * volFactor(v1Unit);
      const c2Base = numC2 * concFactor(c2Unit);
      const v2Liters = (c1Base * v1Base) / c2Base;

      resultVal = v2Liters / volFactor(v2Unit);
      resultUnit = v2Unit;

      const v1InV2Unit = v1Base / volFactor(v2Unit);
      diluentVolume = Math.max(0, resultVal - v1InV2Unit);

      steps = [
        `V2 = (C1 × V1) ÷ C2 = ${formatNumber(v2Liters, 6)} L`,
        `Diluent to add = V2 - V1 = ${formatNumber(diluentVolume, 4)} ${resultUnit}`
      ];
    }
  } else if (target === 'c1') {
    // C1 = (C2 * V2) / V1
    if (!isNaN(numC2) && !isNaN(numV2) && !isNaN(numV1) && numV1 > 0 && numC2 >= 0 && numV2 >= 0) {
      const c2Base = numC2 * concFactor(c2Unit);
      const v2Base = numV2 * volFactor(v2Unit);
      const v1Base = numV1 * volFactor(v1Unit);
      const c1Base = (c2Base * v2Base) / v1Base;

      resultVal = c1Base / concFactor(c1Unit);
      resultUnit = c1Unit;

      steps = [
        `C1 = (C2 × V2) ÷ V1 = ${formatNumber(c1Base, 6)} base units`
      ];
    }
  }

  const handleCopy = async () => {
    if (resultVal !== null) {
      const text = `${formatNumber(resultVal, 4)} ${resultUnit}`;
      const success = await copyToClipboard(text);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Target Selector */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Target to find:</span>
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
          <button
            onClick={() => setTarget('v1')}
            className={`py-1.5 px-3 text-xs font-medium rounded-md transition-all ${
              target === 'v1' ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Initial Volume (V1)
          </button>
          <button
            onClick={() => setTarget('c2')}
            className={`py-1.5 px-3 text-xs font-medium rounded-md transition-all ${
              target === 'c2' ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Final Concentration (C2)
          </button>
          <button
            onClick={() => setTarget('v2')}
            className={`py-1.5 px-3 text-xs font-medium rounded-md transition-all ${
              target === 'v2' ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Final Volume (V2)
          </button>
          <button
            onClick={() => setTarget('c1')}
            className={`py-1.5 px-3 text-xs font-medium rounded-md transition-all ${
              target === 'c1' ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Initial Stock Conc (C1)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Form Inputs */}
        <div className="md:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-heading font-semibold text-slate-900 dark:text-white text-base">
              Solution Dilution Equation (C₁V₁ = C₂V₂)
            </h3>
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1.5 py-1 px-2.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* C1 */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Initial Concentration (C1) {target === 'c1' && '(Target to Find)'}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="any"
                  disabled={target === 'c1'}
                  value={target === 'c1' ? (resultVal !== null ? formatNumber(resultVal, 4) : '') : c1}
                  onChange={(e) => setC1(e.target.value)}
                  placeholder="e.g. 10"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 disabled:bg-teal-50/40 dark:disabled:bg-teal-950/20 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
                <select
                  value={c1Unit}
                  onChange={(e) => setC1Unit(e.target.value)}
                  className="px-2.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs font-medium"
                >
                  <option value="M">M</option>
                  <option value="mM">mM</option>
                  <option value="uM">µM</option>
                  <option value="% (w/v)">% (w/v)</option>
                  <option value="mg/mL">mg/mL</option>
                </select>
              </div>
            </div>

            {/* V1 */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Initial Stock Volume (V1) {target === 'v1' && '(Target to Find)'}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="any"
                  disabled={target === 'v1'}
                  value={target === 'v1' ? (resultVal !== null ? formatNumber(resultVal, 4) : '') : v1}
                  onChange={(e) => setV1(e.target.value)}
                  placeholder="e.g. 20"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 disabled:bg-teal-50/40 dark:disabled:bg-teal-950/20 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
                <select
                  value={v1Unit}
                  onChange={(e) => setV1Unit(e.target.value)}
                  className="px-2.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs font-medium"
                >
                  <option value="mL">mL</option>
                  <option value="L">L</option>
                  <option value="uL">µL</option>
                </select>
              </div>
            </div>

            {/* C2 */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Final Concentration (C2) {target === 'c2' && '(Target to Find)'}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="any"
                  disabled={target === 'c2'}
                  value={target === 'c2' ? (resultVal !== null ? formatNumber(resultVal, 4) : '') : c2}
                  onChange={(e) => setC2(e.target.value)}
                  placeholder="e.g. 0.5"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 disabled:bg-teal-50/40 dark:disabled:bg-teal-950/20 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
                <select
                  value={c2Unit}
                  onChange={(e) => setC2Unit(e.target.value)}
                  className="px-2.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs font-medium"
                >
                  <option value="M">M</option>
                  <option value="mM">mM</option>
                  <option value="uM">µM</option>
                  <option value="% (w/v)">% (w/v)</option>
                  <option value="mg/mL">mg/mL</option>
                </select>
              </div>
            </div>

            {/* V2 */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Final Working Volume (V2) {target === 'v2' && '(Target to Find)'}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="any"
                  disabled={target === 'v2'}
                  value={target === 'v2' ? (resultVal !== null ? formatNumber(resultVal, 4) : '') : v2}
                  onChange={(e) => setV2(e.target.value)}
                  placeholder="e.g. 400"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 disabled:bg-teal-50/40 dark:disabled:bg-teal-950/20 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
                <select
                  value={v2Unit}
                  onChange={(e) => setV2Unit(e.target.value)}
                  className="px-2.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs font-medium"
                >
                  <option value="mL">mL</option>
                  <option value="L">L</option>
                  <option value="uL">µL</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-50 to-teal-50/30 dark:from-slate-900 dark:to-slate-800/60 p-6 rounded-2xl border border-teal-100/60 dark:border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span>Required {target.toUpperCase()} Value</span>
              <span>C₁V₁ = C₂V₂</span>
            </div>

            <div className="space-y-3">
              <div className="text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums flex items-baseline gap-2">
                {resultVal !== null ? formatNumber(resultVal, 4) : '—'}
                <span className="text-base font-normal text-teal-700 dark:text-teal-400">
                  {resultUnit}
                </span>
              </div>

              {diluentVolume !== null && (
                <div className="p-3 bg-teal-50 dark:bg-teal-950/30 rounded-xl border border-teal-100 dark:border-teal-900/40 text-xs text-teal-900 dark:text-teal-300 space-y-1">
                  <div className="font-semibold">Preparation Instruction:</div>
                  <div>Pipette <strong className="font-mono">{formatNumber(resultVal || 0, 4)} {resultUnit}</strong> of stock solution (C₁).</div>
                  <div>Add diluent to reach a final volume of <strong className="font-mono">{v2} {v2Unit}</strong> (~<strong className="font-mono">{formatNumber(diluentVolume, 4)} {resultUnit}</strong> solvent).</div>
                </div>
              )}
            </div>

            {steps.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Derivation:</span>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 font-mono">
                  {steps.map((st, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-teal-600 dark:text-teal-400">›</span>
                      <span>{st}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-3">
            <button
              onClick={handleCopy}
              disabled={resultVal === null}
              className="w-full py-2 px-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied Result!' : 'Copy Result'}
            </button>

            <div className="p-2.5 bg-amber-50/80 dark:bg-amber-950/20 rounded-lg border border-amber-200/60 dark:border-amber-800/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <span>
                <strong>Safety Note:</strong> For concentrated acids (e.g. H₂SO₄, HCl), always add acid to water (never water to concentrated acid) to avoid thermal splattering.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
