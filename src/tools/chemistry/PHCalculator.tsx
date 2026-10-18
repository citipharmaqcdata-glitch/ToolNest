import { useState } from 'react';
import { Copy, RotateCcw, Check, AlertCircle, Info } from 'lucide-react';
import { copyToClipboard, formatNumber } from '../../utils/formatters';

export default function PHCalculator() {
  const [substanceType, setSubstanceType] = useState<'acid' | 'base'>('acid');
  const [proticity, setProticity] = useState<'1' | '2'>('1'); // Monoprotic vs Diprotic
  const [concentration, setConcentration] = useState<string>('0.01'); // M
  const [copied, setCopied] = useState<boolean>(false);

  const numC = parseFloat(concentration);

  let ph: number | null = null;
  let poh: number | null = null;
  let hConc: number | null = null;
  let ohConc: number | null = null;
  let steps: string[] = [];

  if (!isNaN(numC) && numC > 0) {
    const factor = parseInt(proticity, 10);
    const effectiveIonConc = numC * factor;

    if (substanceType === 'acid') {
      hConc = effectiveIonConc;
      ph = -Math.log10(hConc);
      // Bound check for extreme dilutions where water autoionization Kw=1e-14 dominates
      if (hConc < 1e-6) {
        // Approximate quadratic taking water autoionization into account: [H+]^2 - C*[H+] - 1e-14 = 0
        const cVal = effectiveIonConc;
        const actualH = (cVal + Math.sqrt(cVal * cVal + 4e-14)) / 2;
        ph = -Math.log10(actualH);
        hConc = actualH;
      }
      poh = 14 - ph;
      ohConc = Math.pow(10, -poh);

      steps = [
        `Assumed 100% dissociation for strong acid: [H⁺] = ${proticity === '2' ? '2 × ' : ''}C = ${formatNumber(effectiveIonConc, 6)} M`,
        `pH = -log₁₀[H⁺] = -log₁₀(${formatNumber(hConc, 6)}) = ${formatNumber(ph, 3)}`,
        `pOH = 14.00 - pH = ${formatNumber(poh, 3)}`,
        `[OH⁻] = 10^(-pOH) = ${formatNumber(ohConc, 8)} M`
      ];
    } else {
      ohConc = effectiveIonConc;
      poh = -Math.log10(ohConc);
      if (ohConc < 1e-6) {
        const cVal = effectiveIonConc;
        const actualOH = (cVal + Math.sqrt(cVal * cVal + 4e-14)) / 2;
        poh = -Math.log10(actualOH);
        ohConc = actualOH;
      }
      ph = 14 - poh;
      hConc = Math.pow(10, -ph);

      steps = [
        `Assumed 100% dissociation for strong base: [OH⁻] = ${proticity === '2' ? '2 × ' : ''}C = ${formatNumber(effectiveIonConc, 6)} M`,
        `pOH = -log₁₀[OH⁻] = -log₁₀(${formatNumber(ohConc, 6)}) = ${formatNumber(poh, 3)}`,
        `pH = 14.00 - pOH = ${formatNumber(ph, 3)}`,
        `[H⁺] = 10^(-pH) = ${formatNumber(hConc, 8)} M`
      ];
    }
  }

  const handleCopy = async () => {
    if (ph !== null) {
      const text = `pH: ${formatNumber(ph, 2)}, pOH: ${formatNumber(poh || 0, 2)}, [H+]: ${formatNumber(hConc || 0, 6)} M`;
      const success = await copyToClipboard(text);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Input Parameters */}
        <div className="md:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-heading font-semibold text-slate-900 dark:text-white text-base">
              Strong Acid / Base Parameters
            </h3>
            <button
              onClick={() => { setConcentration('0.01'); setSubstanceType('acid'); setProticity('1'); }}
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1.5 py-1 px-2.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Substance Classification
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setSubstanceType('acid')}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                  substanceType === 'acid'
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Strong Acid (e.g. HCl, HNO₃, H₂SO₄)
              </button>
              <button
                onClick={() => setSubstanceType('base')}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                  substanceType === 'base'
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Strong Base (e.g. NaOH, KOH, Ca(OH)₂)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Ion Equivalence (H⁺ or OH⁻ per molecule)
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setProticity('1')}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                  proticity === '1'
                    ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                }`}
              >
                Monoprotic (1:1, e.g. HCl, NaOH)
              </button>
              <button
                onClick={() => setProticity('2')}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                  proticity === '2'
                    ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                }`}
              >
                Diprotic (1:2, e.g. H₂SO₄, Ca(OH)₂)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Molar Concentration (M, mol/L)
            </label>
            <input
              type="number"
              step="any"
              value={concentration}
              onChange={(e) => setConcentration(e.target.value)}
              placeholder="e.g. 0.01"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Output Panel */}
        <div className="md:col-span-6 bg-gradient-to-br from-slate-50 to-teal-50/30 dark:from-slate-900 dark:to-slate-800/60 p-6 rounded-2xl border border-teal-100/60 dark:border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span>Solution Acidity / Basicity</span>
              <span>@ 25°C (Kw = 1.0 × 10⁻¹⁴)</span>
            </div>

            {ph !== null ? (
              <div className="space-y-4">
                <div className="p-4 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-teal-100 dark:border-teal-900/40">
                  <div className="text-[11px] font-medium text-slate-400 uppercase">Calculated pH</div>
                  <div className={`text-4xl font-bold font-mono tracking-tight tabular-nums mt-0.5 ${
                    ph < 7 ? 'text-rose-600 dark:text-rose-400' : ph > 7 ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600'
                  }`}>
                    {formatNumber(ph, 2)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {ph < 3 ? 'Strongly Acidic' : ph < 7 ? 'Weakly Acidic' : ph === 7 ? 'Neutral' : ph < 11 ? 'Weakly Basic' : 'Strongly Basic'}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-slate-700/60 text-center">
                    <div className="text-slate-400 text-[10px] uppercase font-medium">pOH</div>
                    <div className="text-sm font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5">{formatNumber(poh || 0, 2)}</div>
                  </div>
                  <div className="p-2.5 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-slate-700/60 text-center">
                    <div className="text-slate-400 text-[10px] uppercase font-medium">[H⁺]</div>
                    <div className="text-xs font-semibold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5">{hConc ? hConc.toExponential(2) : ''} M</div>
                  </div>
                  <div className="p-2.5 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-slate-700/60 text-center">
                    <div className="text-slate-400 text-[10px] uppercase font-medium">[OH⁻]</div>
                    <div className="text-xs font-semibold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5">{ohConc ? ohConc.toExponential(2) : ''} M</div>
                  </div>
                </div>

                {steps.length > 0 && (
                  <div className="pt-2 text-xs text-slate-500 font-mono space-y-1">
                    {steps.map((s, i) => (
                      <div key={i} className="flex items-start gap-1">
                        <span className="text-teal-600">›</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-slate-400">Enter a valid molar concentration to calculate pH.</div>
            )}
          </div>

          <div className="space-y-3 pt-3">
            <button
              onClick={handleCopy}
              disabled={ph === null}
              className="w-full py-2 px-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy pH Details'}
            </button>

            <div className="p-2.5 bg-slate-100 dark:bg-slate-800/70 rounded-lg text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-teal-600" />
              <span>
                <strong>Method Limitation:</strong> Applies strictly to strong acids and strong bases assuming complete dissociation at 25°C. For weak acids (acetic, citric, etc.) or buffers, the Henderson-Hasselbalch equation and Ka/Kb constants must be used.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
