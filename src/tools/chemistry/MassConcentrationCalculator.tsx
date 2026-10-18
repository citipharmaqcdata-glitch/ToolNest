import { useState } from 'react';
import { Copy, RotateCcw, Check, Scale, Info } from 'lucide-react';
import { copyToClipboard, formatNumber } from '../../utils/formatters';

export default function MassConcentrationCalculator() {
  const [calcMode, setCalcMode] = useState<'conc' | 'mass' | 'vol'>('conc');
  const [mass, setMass] = useState<string>('250');
  const [massUnit, setMassUnit] = useState<string>('mg');
  const [volume, setVolume] = useState<string>('500');
  const [volumeUnit, setVolumeUnit] = useState<string>('mL');
  const [targetConc, setTargetConc] = useState<string>('0.5');
  const [targetConcUnit, setTargetConcUnit] = useState<string>('g/L');
  const [copied, setCopied] = useState(false);

  // Normalize mass to grams
  const toGrams = (val: number, unit: string) => {
    switch (unit) {
      case 'kg': return val * 1000;
      case 'g': return val;
      case 'mg': return val / 1000;
      case 'ug': return val / 1e6;
      default: return val;
    }
  };

  // Normalize volume to Liters
  const toLiters = (val: number, unit: string) => {
    switch (unit) {
      case 'L': return val;
      case 'mL': return val / 1000;
      case 'uL': return val / 1e6;
      default: return val / 1000;
    }
  };

  const numMass = parseFloat(mass);
  const numVol = parseFloat(volume);
  const numConc = parseFloat(targetConc);

  let gPerL: number | null = null;
  let steps: string[] = [];

  if (calcMode === 'conc') {
    if (!isNaN(numMass) && !isNaN(numVol) && numVol > 0 && numMass >= 0) {
      const g = toGrams(numMass, massUnit);
      const l = toLiters(numVol, volumeUnit);
      gPerL = g / l;
      steps = [
        `Mass in grams = ${formatNumber(g, 6)} g`,
        `Volume in liters = ${formatNumber(l, 6)} L`,
        `Mass concentration (C = m / V) = ${formatNumber(g, 6)} g ÷ ${formatNumber(l, 6)} L = ${formatNumber(gPerL, 4)} g/L`
      ];
    }
  } else if (calcMode === 'mass') {
    if (!isNaN(numConc) && !isNaN(numVol) && numConc >= 0 && numVol >= 0) {
      const l = toLiters(numVol, volumeUnit);
      // Let's assume targetConc is in targetConcUnit
      let gLFactor = 1;
      if (targetConcUnit === 'mg/mL' || targetConcUnit === 'g/L') gLFactor = 1;
      else if (targetConcUnit === 'mg/L' || targetConcUnit === 'ppm') gLFactor = 0.001;
      else if (targetConcUnit === 'ug/mL') gLFactor = 0.001;
      else if (targetConcUnit === '% (w/v)') gLFactor = 10; // 1% = 10 g/L

      const targetGperL = numConc * gLFactor;
      const requiredGrams = targetGperL * l;
      gPerL = targetGperL;

      steps = [
        `Target concentration in g/L = ${formatNumber(targetGperL, 4)} g/L`,
        `Volume = ${formatNumber(l, 4)} L`,
        `Mass required = C × V = ${formatNumber(requiredGrams, 4)} g (${formatNumber(requiredGrams * 1000, 2)} mg)`
      ];
    }
  }

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Selector */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Calculation target:</span>
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
          <button
            onClick={() => setCalcMode('conc')}
            className={`py-1.5 px-3 text-xs font-medium rounded-md transition-all ${
              calcMode === 'conc' ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Calculate Concentration (C)
          </button>
          <button
            onClick={() => setCalcMode('mass')}
            className={`py-1.5 px-3 text-xs font-medium rounded-md transition-all ${
              calcMode === 'mass' ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Required Mass for Target (m)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-heading font-semibold text-slate-900 dark:text-white text-base">
              Mass & Volume Inputs
            </h3>
            <button
              onClick={() => { setMass('250'); setVolume('500'); setTargetConc('0.5'); }}
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1.5 py-1 px-2.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          {calcMode === 'conc' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Solute Mass
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="any"
                    value={mass}
                    onChange={(e) => setMass(e.target.value)}
                    placeholder="e.g. 250"
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                  <select
                    value={massUnit}
                    onChange={(e) => setMassUnit(e.target.value)}
                    className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs font-medium"
                  >
                    <option value="g">g</option>
                    <option value="mg">mg</option>
                    <option value="ug">µg</option>
                    <option value="kg">kg</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Total Solution Volume
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
                    onChange={(e) => setVolumeUnit(e.target.value)}
                    className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs font-medium"
                  >
                    <option value="mL">mL</option>
                    <option value="L">L</option>
                    <option value="uL">µL</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {calcMode === 'mass' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Desired Target Concentration
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="any"
                    value={targetConc}
                    onChange={(e) => setTargetConc(e.target.value)}
                    placeholder="e.g. 0.5"
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                  <select
                    value={targetConcUnit}
                    onChange={(e) => setTargetConcUnit(e.target.value)}
                    className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs font-medium"
                  >
                    <option value="g/L">g/L</option>
                    <option value="mg/mL">mg/mL</option>
                    <option value="ppm">ppm (mg/L)</option>
                    <option value="ug/mL">µg/mL</option>
                    <option value="% (w/v)">% (w/v)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Target Batch Volume
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
                    onChange={(e) => setVolumeUnit(e.target.value)}
                    className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs font-medium"
                  >
                    <option value="mL">mL</option>
                    <option value="L">L</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Results Panel with Equivalent Units */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-50 to-teal-50/30 dark:from-slate-900 dark:to-slate-800/60 p-6 rounded-2xl border border-teal-100/60 dark:border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span>Concentration Table</span>
              <span>C = m ÷ V</span>
            </div>

            {gPerL !== null ? (
              <div className="space-y-4">
                <div>
                  <div className="text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
                    {formatNumber(gPerL, 4)} <span className="text-sm font-normal text-teal-600 dark:text-teal-400">g/L</span>
                  </div>
                </div>

                {/* Multilateral Unit Equivalents Grid */}
                <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                  <div className="font-semibold text-slate-700 dark:text-slate-300">Equivalent Units (Aqueous):</div>
                  <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400 font-mono">
                    <div className="p-2 bg-white/70 dark:bg-slate-800/60 rounded-lg border border-slate-200/50 dark:border-slate-700">
                      <div className="text-[10px] text-slate-400 uppercase">mg/mL</div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">{formatNumber(gPerL, 4)} mg/mL</div>
                    </div>
                    <div className="p-2 bg-white/70 dark:bg-slate-800/60 rounded-lg border border-slate-200/50 dark:border-slate-700">
                      <div className="text-[10px] text-slate-400 uppercase">ppm (mg/L)</div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">{formatNumber(gPerL * 1000, 2)} ppm</div>
                    </div>
                    <div className="p-2 bg-white/70 dark:bg-slate-800/60 rounded-lg border border-slate-200/50 dark:border-slate-700">
                      <div className="text-[10px] text-slate-400 uppercase">% w/v (g/100mL)</div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">{formatNumber(gPerL / 10, 4)}%</div>
                    </div>
                    <div className="p-2 bg-white/70 dark:bg-slate-800/60 rounded-lg border border-slate-200/50 dark:border-slate-700">
                      <div className="text-[10px] text-slate-400 uppercase">ppb (µg/L)</div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">{formatNumber(gPerL * 1e6, 1)} ppb</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-400">Enter valid mass and volume to calculate concentration.</div>
            )}
          </div>

          <div className="space-y-3 pt-3">
            <button
              onClick={() => {
                if (gPerL !== null) handleCopy(`${formatNumber(gPerL, 4)} g/L (${formatNumber(gPerL * 1000, 2)} ppm)`);
              }}
              disabled={gPerL === null}
              className="w-full py-2 px-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied Values!' : 'Copy Concentration'}
            </button>

            <div className="p-2.5 bg-slate-100 dark:bg-slate-800/70 rounded-lg text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-teal-600" />
              <span>
                <strong>Aqueous Assumption:</strong> ppm = mg/L assumes solution density is approximately 1.00 g/cm³ (pure water at 20°C–25°C). For non-aqueous or highly dense matrices, true density must be applied.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
