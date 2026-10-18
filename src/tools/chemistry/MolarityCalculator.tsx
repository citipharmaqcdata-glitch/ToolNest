import { useState } from 'react';
import { Copy, RotateCcw, Check, AlertCircle, Info } from 'lucide-react';
import { copyToClipboard, formatNumber } from '../../utils/formatters';

const COMMON_REAGENTS = [
  { name: 'Custom Reagent', mw: 0 },
  { name: 'Sodium Chloride (NaCl)', mw: 58.44 },
  { name: 'Sodium Hydroxide (NaOH)', mw: 40.00 },
  { name: 'Tris Base (C4H11NO3)', mw: 121.14 },
  { name: 'Glucose (C6H12O6)', mw: 180.16 },
  { name: 'EDTA Disodium (C10H14N2Na2O8·2H2O)', mw: 372.24 },
  { name: 'Potassium Chloride (KCl)', mw: 74.55 },
  { name: 'Sodium Bicarbonate (NaHCO3)', mw: 84.01 },
  { name: 'Citric Acid (C6H8O7)', mw: 192.12 },
];

export default function MolarityCalculator() {
  const [solveFor, setSolveFor] = useState<'mass' | 'molarity' | 'volume'>('mass');
  const [selectedReagent, setSelectedReagent] = useState('Sodium Chloride (NaCl)');
  const [mw, setMw] = useState<string>('58.44');
  
  // Parameters
  const [molarity, setMolarity] = useState<string>('0.5'); // M
  const [molarityUnit, setMolarityUnit] = useState<'M' | 'mM' | 'uM'>('M');
  const [volume, setVolume] = useState<string>('500'); // mL
  const [volumeUnit, setVolumeUnit] = useState<'mL' | 'L' | 'uL'>('mL');
  const [mass, setMass] = useState<string>('14.61'); // g
  const [massUnit, setMassUnit] = useState<'g' | 'mg' | 'ug'>('g');

  const [copied, setCopied] = useState(false);

  const handleReagentChange = (name: string) => {
    setSelectedReagent(name);
    const item = COMMON_REAGENTS.find(r => r.name === name);
    if (item && item.mw > 0) {
      setMw(String(item.mw));
    }
  };

  // Convert inputs to SI base: Molarity in mol/L, Volume in L, Mass in g
  const getVolumeInLiters = (val: number, unit: string) => {
    if (unit === 'L') return val;
    if (unit === 'mL') return val / 1000;
    if (unit === 'uL') return val / 1000000;
    return val;
  };

  const getMolarityInMolPerL = (val: number, unit: string) => {
    if (unit === 'M') return val;
    if (unit === 'mM') return val / 1000;
    if (unit === 'uM') return val / 1000000;
    return val;
  };

  const getMassInGrams = (val: number, unit: string) => {
    if (unit === 'g') return val;
    if (unit === 'mg') return val / 1000;
    if (unit === 'ug') return val / 1000000;
    return val;
  };

  const numMw = parseFloat(mw);
  let computedResult: { value: number; unit: string; moles: number } | null = null;
  let calculationSteps: string[] = [];

  if (!isNaN(numMw) && numMw > 0) {
    if (solveFor === 'mass') {
      const numM = parseFloat(molarity);
      const numV = parseFloat(volume);
      if (!isNaN(numM) && !isNaN(numV) && numM >= 0 && numV >= 0) {
        const mBase = getMolarityInMolPerL(numM, molarityUnit);
        const vBase = getVolumeInLiters(numV, volumeUnit);
        const moles = mBase * vBase;
        const massGrams = moles * numMw;
        
        // Pick friendly display unit
        let displayVal = massGrams;
        let displayUnit = 'g';
        if (massGrams < 0.001) {
          displayVal = massGrams * 1e6;
          displayUnit = 'µg';
        } else if (massGrams < 1) {
          displayVal = massGrams * 1000;
          displayUnit = 'mg';
        }

        computedResult = { value: displayVal, unit: displayUnit, moles };
        calculationSteps = [
          `Volume in Liters (V) = ${vBase} L`,
          `Molarity in mol/L (M) = ${mBase} mol/L`,
          `Moles required (n = M × V) = ${formatNumber(moles, 6)} mol`,
          `Mass required (m = n × MW) = ${formatNumber(moles, 6)} mol × ${numMw} g/mol = ${formatNumber(massGrams, 4)} g`
        ];
      }
    } else if (solveFor === 'molarity') {
      const numMass = parseFloat(mass);
      const numV = parseFloat(volume);
      if (!isNaN(numMass) && !isNaN(numV) && numMass >= 0 && numV > 0) {
        const massG = getMassInGrams(numMass, massUnit);
        const vBase = getVolumeInLiters(numV, volumeUnit);
        const moles = massG / numMw;
        const mBase = moles / vBase;

        let displayVal = mBase;
        let displayUnit = 'M (mol/L)';
        if (mBase < 0.001) {
          displayVal = mBase * 1e6;
          displayUnit = 'µM';
        } else if (mBase < 1) {
          displayVal = mBase * 1000;
          displayUnit = 'mM';
        }

        computedResult = { value: displayVal, unit: displayUnit, moles };
        calculationSteps = [
          `Mass in Grams (m) = ${massG} g`,
          `Moles of solute (n = m ÷ MW) = ${massG} g ÷ ${numMw} g/mol = ${formatNumber(moles, 6)} mol`,
          `Volume in Liters (V) = ${vBase} L`,
          `Molarity (M = n ÷ V) = ${formatNumber(moles, 6)} mol ÷ ${vBase} L = ${formatNumber(mBase, 6)} mol/L`
        ];
      }
    } else if (solveFor === 'volume') {
      const numMass = parseFloat(mass);
      const numM = parseFloat(molarity);
      if (!isNaN(numMass) && !isNaN(numM) && numMass >= 0 && numM > 0) {
        const massG = getMassInGrams(numMass, massUnit);
        const mBase = getMolarityInMolPerL(numM, molarityUnit);
        const moles = massG / numMw;
        const vBase = moles / mBase; // in Liters

        let displayVal = vBase * 1000; // default mL
        let displayUnit = 'mL';
        if (vBase >= 1) {
          displayVal = vBase;
          displayUnit = 'L';
        } else if (vBase < 0.0001) {
          displayVal = vBase * 1e6;
          displayUnit = 'µL';
        }

        computedResult = { value: displayVal, unit: displayUnit, moles };
        calculationSteps = [
          `Moles of solute (n = m ÷ MW) = ${massG} g ÷ ${numMw} g/mol = ${formatNumber(moles, 6)} mol`,
          `Target Molarity (M) = ${mBase} mol/L`,
          `Volume required (V = n ÷ M) = ${formatNumber(moles, 6)} ÷ ${mBase} = ${formatNumber(vBase, 5)} L (${formatNumber(displayVal, 3)} ${displayUnit})`
        ];
      }
    }
  }

  const handleCopy = async () => {
    if (computedResult) {
      const text = `${formatNumber(computedResult.value, 4)} ${computedResult.unit}`;
      const success = await copyToClipboard(text);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    }
  };

  const handleReset = () => {
    setMolarity('1');
    setVolume('1000');
    setMass('58.44');
  };

  return (
    <div className="space-y-6">
      {/* Solve For Picker */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Solve for:</span>
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
          <button
            onClick={() => setSolveFor('mass')}
            className={`py-1.5 px-3 text-xs font-medium rounded-md transition-all ${
              solveFor === 'mass' ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Required Mass (m)
          </button>
          <button
            onClick={() => setSolveFor('molarity')}
            className={`py-1.5 px-3 text-xs font-medium rounded-md transition-all ${
              solveFor === 'molarity' ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Molarity (M)
          </button>
          <button
            onClick={() => setSolveFor('volume')}
            className={`py-1.5 px-3 text-xs font-medium rounded-md transition-all ${
              solveFor === 'volume' ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Final Volume (V)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Input Parameters */}
        <div className="md:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-heading font-semibold text-slate-900 dark:text-white text-base">
              Solution Parameters
            </h3>
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1.5 py-1 px-2.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          {/* Preset Reagent Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Select Preset Reagent or Custom Solute
            </label>
            <select
              value={selectedReagent}
              onChange={(e) => handleReagentChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            >
              {COMMON_REAGENTS.map((r) => (
                <option key={r.name} value={r.name}>
                  {r.name} {r.mw > 0 ? `(${r.mw} g/mol)` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Molecular Weight */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Molecular Weight / Formula Mass (MW in g/mol)
            </label>
            <input
              type="number"
              step="any"
              value={mw}
              onChange={(e) => {
                setMw(e.target.value);
                setSelectedReagent('Custom Reagent');
              }}
              placeholder="e.g. 58.44"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          {/* Molarity Input (if not solving for molarity) */}
          {solveFor !== 'molarity' && (
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Target Concentration / Molarity
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="any"
                  value={molarity}
                  onChange={(e) => setMolarity(e.target.value)}
                  placeholder="e.g. 0.5"
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
                <select
                  value={molarityUnit}
                  onChange={(e) => setMolarityUnit(e.target.value as any)}
                  className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs font-medium"
                >
                  <option value="M">M (mol/L)</option>
                  <option value="mM">mM (mmol/L)</option>
                  <option value="uM">µM (µmol/L)</option>
                </select>
              </div>
            </div>
          )}

          {/* Volume Input (if not solving for volume) */}
          {solveFor !== 'volume' && (
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Solution Volume
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="any"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  placeholder="e.g. 500"
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
                <select
                  value={volumeUnit}
                  onChange={(e) => setVolumeUnit(e.target.value as any)}
                  className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs font-medium"
                >
                  <option value="mL">mL</option>
                  <option value="L">L</option>
                  <option value="uL">µL</option>
                </select>
              </div>
            </div>
          )}

          {/* Mass Input (if solving for molarity or volume) */}
          {solveFor !== 'mass' && (
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Mass of Solute
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="any"
                  value={mass}
                  onChange={(e) => setMass(e.target.value)}
                  placeholder="e.g. 14.61"
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
                <select
                  value={massUnit}
                  onChange={(e) => setMassUnit(e.target.value as any)}
                  className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs font-medium"
                >
                  <option value="g">g</option>
                  <option value="mg">mg</option>
                  <option value="ug">µg</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-50 to-teal-50/30 dark:from-slate-900 dark:to-slate-800/60 p-6 rounded-2xl border border-teal-100/60 dark:border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span>Calculated Result</span>
              <span>Formula: M = m ÷ (MW × V)</span>
            </div>

            <div className="space-y-3">
              <div className="text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums flex items-baseline gap-2">
                {computedResult ? formatNumber(computedResult.value, 4) : '—'}
                <span className="text-base font-normal text-teal-700 dark:text-teal-400">
                  {computedResult ? computedResult.unit : ''}
                </span>
              </div>
              {computedResult && (
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <p>Equivalent to <span className="font-semibold text-slate-800 dark:text-slate-200">{formatNumber(computedResult.moles, 6)} moles</span> of solute.</p>
                </div>
              )}
            </div>

            {/* Step-by-step breakdown */}
            {calculationSteps.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Calculation Steps:</span>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 font-mono">
                  {calculationSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-teal-600 dark:text-teal-400">›</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-3">
            <button
              onClick={handleCopy}
              disabled={!computedResult}
              className="w-full py-2 px-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied Result!' : 'Copy Result'}
            </button>

            {/* Laboratory Safety Disclaimer */}
            <div className="p-2.5 bg-amber-50/80 dark:bg-amber-950/20 rounded-lg border border-amber-200/60 dark:border-amber-800/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <span>
                <strong>Laboratory Safety Notice:</strong> Always add solid solute to partial solvent, dissolve completely, then adjust to final volume in a calibrated volumetric flask. Consult the chemical SDS and follow applicable SOPs.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
