import { useState, useMemo } from 'react';
import {
  FlaskConical,
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Scale,
  Leaf
} from 'lucide-react';
import { copyToClipboard, formatNumber } from '../../utils/formatters';

interface SynthesisPreset {
  name: string;
  r1Name: string;
  r1Mw: string;
  r1Mass: string;
  r1Coeff: string;
  r2Name: string;
  r2Mw: string;
  r2Mass: string;
  r2Coeff: string;
  prodName: string;
  prodMw: string;
  prodCoeff: string;
  actualMass: string;
  purity: string;
  lod: string;
}

const PRESETS: SynthesisPreset[] = [
  {
    name: 'Aspirin Synthesis',
    r1Name: 'Salicylic Acid',
    r1Mw: '138.12',
    r1Mass: '5.00',
    r1Coeff: '1',
    r2Name: 'Acetic Anhydride',
    r2Mw: '102.09',
    r2Mass: '7.00',
    r2Coeff: '1',
    prodName: 'Acetylsalicylic Acid (Aspirin)',
    prodMw: '180.16',
    prodCoeff: '1',
    actualMass: '5.62',
    purity: '98.5',
    lod: '0.8'
  },
  {
    name: 'Paracetamol Synthesis',
    r1Name: '4-Aminophenol',
    r1Mw: '109.13',
    r1Mass: '4.50',
    r1Coeff: '1',
    r2Name: 'Acetic Anhydride',
    r2Mw: '102.09',
    r2Mass: '5.20',
    r2Coeff: '1',
    prodName: 'Acetaminophen (Paracetamol)',
    prodMw: '151.16',
    prodCoeff: '1',
    actualMass: '5.40',
    purity: '99.2',
    lod: '0.4'
  },
  {
    name: 'Benzoic Acid Recrystallization',
    r1Name: 'Crude Benzoic Acid',
    r1Mw: '122.12',
    r1Mass: '10.00',
    r1Coeff: '1',
    r2Name: 'Water (Solvent)',
    r2Mw: '18.02',
    r2Mass: '0',
    r2Coeff: '0',
    prodName: 'Pure Benzoic Acid',
    prodMw: '122.12',
    prodCoeff: '1',
    actualMass: '8.45',
    purity: '99.8',
    lod: '0.2'
  }
];

export default function CompoundPurityYieldCalculator() {
  // Reactant 1
  const [r1Name, setR1Name] = useState<string>('Salicylic Acid');
  const [r1Mass, setR1Mass] = useState<string>('5.00'); // grams
  const [r1Mw, setR1Mw] = useState<string>('138.12'); // g/mol
  const [r1Coeff, setR1Coeff] = useState<string>('1');

  // Reactant 2
  const [hasSecondReactant, setHasSecondReactant] = useState<boolean>(true);
  const [r2Name, setR2Name] = useState<string>('Acetic Anhydride');
  const [r2Mass, setR2Mass] = useState<string>('7.00'); // grams
  const [r2Mw, setR2Mw] = useState<string>('102.09'); // g/mol
  const [r2Coeff, setR2Coeff] = useState<string>('1');

  // Target Product
  const [prodName, setProdName] = useState<string>('Acetylsalicylic Acid (Aspirin)');
  const [prodMw, setProdMw] = useState<string>('180.16'); // g/mol
  const [prodCoeff, setProdCoeff] = useState<string>('1');
  const [actualMass, setActualMass] = useState<string>('5.62'); // isolated grams

  // Analytical Quality Control & Corrections
  const [enablePurityCorrection, setEnablePurityCorrection] = useState<boolean>(true);
  const [purityPercent, setPurityPercent] = useState<string>('98.5'); // HPLC / Assay %
  const [lodPercent, setLodPercent] = useState<string>('0.8'); // % LOD or moisture

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = async (text: string, key: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    }
  };

  const handleApplyPreset = (p: SynthesisPreset) => {
    setR1Name(p.r1Name);
    setR1Mw(p.r1Mw);
    setR1Mass(p.r1Mass);
    setR1Coeff(p.r1Coeff);

    if (parseFloat(p.r2Mass) > 0 && parseFloat(p.r2Mw) > 0) {
      setHasSecondReactant(true);
      setR2Name(p.r2Name);
      setR2Mw(p.r2Mw);
      setR2Mass(p.r2Mass);
      setR2Coeff(p.r2Coeff);
    } else {
      setHasSecondReactant(false);
    }

    setProdName(p.prodName);
    setProdMw(p.prodMw);
    setProdCoeff(p.prodCoeff);
    setActualMass(p.actualMass);
    setPurityPercent(p.purity);
    setLodPercent(p.lod);
  };

  // Calculations
  const yieldCalculations = useMemo(() => {
    const m1 = parseFloat(r1Mass) || 0;
    const mw1 = parseFloat(r1Mw) || 1;
    const c1 = parseFloat(r1Coeff) || 1;

    const m2 = parseFloat(r2Mass) || 0;
    const mw2 = parseFloat(r2Mw) || 1;
    const c2 = parseFloat(r2Coeff) || 1;

    const mwProd = parseFloat(prodMw) || 1;
    const cProd = parseFloat(prodCoeff) || 1;
    const mActual = parseFloat(actualMass) || 0;

    const purity = (parseFloat(purityPercent) || 100) / 100;
    const lod = (parseFloat(lodPercent) || 0) / 100;

    // Reactant 1 moles
    const moles1 = mw1 > 0 ? m1 / mw1 : 0;
    const maxProductMolesFromR1 = c1 > 0 ? (moles1 / c1) * cProd : 0;

    let limitingReagentName = r1Name;
    let theoreticalMoles = maxProductMolesFromR1;

    if (hasSecondReactant && m2 > 0 && mw2 > 0 && c2 > 0) {
      const moles2 = m2 / mw2;
      const maxProductMolesFromR2 = (moles2 / c2) * cProd;

      if (maxProductMolesFromR2 < maxProductMolesFromR1) {
        limitingReagentName = r2Name;
        theoreticalMoles = maxProductMolesFromR2;
      }
    }

    const theoreticalMassGrams = theoreticalMoles * mwProd;

    // Isolated (crude) yield %
    const crudeYieldPercent =
      theoreticalMassGrams > 0 ? (mActual / theoreticalMassGrams) * 100 : 0;

    // Corrected pure anhydrous yield
    const pureMassGrams =
      enablePurityCorrection
        ? mActual * purity * Math.max(0, 1 - lod)
        : mActual;

    const pureYieldPercent =
      theoreticalMassGrams > 0 ? (pureMassGrams / theoreticalMassGrams) * 100 : 0;

    // Atom Economy
    // Atom Economy = (MW of Product * cProd) / sum(MW of reactants * coeff) * 100
    const totalReactantMw =
      mw1 * c1 + (hasSecondReactant && m2 > 0 ? mw2 * c2 : 0);
    const atomEconomy =
      totalReactantMw > 0 ? ((mwProd * cProd) / totalReactantMw) * 100 : 0;

    return {
      moles1,
      limitingReagentName,
      theoreticalMoles,
      theoreticalMassGrams,
      crudeYieldPercent,
      pureMassGrams,
      pureYieldPercent,
      atomEconomy
    };
  }, [
    r1Mass,
    r1Mw,
    r1Coeff,
    r1Name,
    hasSecondReactant,
    r2Mass,
    r2Mw,
    r2Coeff,
    r2Name,
    prodMw,
    prodCoeff,
    actualMass,
    enablePurityCorrection,
    purityPercent,
    lodPercent
  ]);

  return (
    <div className="space-y-6">
      {/* Header & Presets */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-heading font-semibold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              Chemical Synthesis Yield & Analytical Purity
            </h3>
            <p className="text-[11px] text-slate-500">
              Calculate stoichiometric theoretical yield, limiting reagent, and HPLC/moisture-corrected pure yield
            </p>
          </div>
          <button
            onClick={() => handleApplyPreset(PRESETS[0])}
            className="text-xs text-slate-500 hover:text-teal-600 flex items-center gap-1 py-1 px-2.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        {/* Synthesis Presets */}
        <div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            Standard Synthesis Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyPreset(p)}
                className="py-1 px-3 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Stoichiometry & Parameters */}
        <div className="lg:col-span-7 space-y-5">
          {/* Reactants Section */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                1. Starting Reactants
              </span>
              <button
                onClick={() => setHasSecondReactant(!hasSecondReactant)}
                className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline"
              >
                {hasSecondReactant ? 'Remove 2nd Reactant' : '+ Add 2nd Reactant'}
              </button>
            </div>

            {/* Reactant 1 */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Reactant A</span>
                {yieldCalculations.limitingReagentName === r1Name && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300">
                    Limiting Reagent
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="col-span-2">
                  <label className="block text-[10px] text-slate-500 mb-0.5">Name</label>
                  <input
                    type="text"
                    value={r1Name}
                    onChange={e => setR1Name(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Mass (g)</label>
                  <input
                    type="number"
                    step="any"
                    value={r1Mass}
                    onChange={e => setR1Mass(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">MW (g/mol)</label>
                  <input
                    type="number"
                    step="any"
                    value={r1Mw}
                    onChange={e => setR1Mw(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Reactant 2 */}
            {hasSecondReactant && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Reactant B</span>
                  {yieldCalculations.limitingReagentName === r2Name && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300">
                      Limiting Reagent
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[10px] text-slate-500 mb-0.5">Name</label>
                    <input
                      type="text"
                      value={r2Name}
                      onChange={e => setR2Name(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Mass (g)</label>
                    <input
                      type="number"
                      step="any"
                      value={r2Mass}
                      onChange={e => setR2Mass(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">MW (g/mol)</label>
                    <input
                      type="number"
                      step="any"
                      value={r2Mw}
                      onChange={e => setR2Mw(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Product & Isolated Mass */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <span className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider block pb-2 border-b border-slate-100 dark:border-slate-800">
              2. Target Isolated Product
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={prodName}
                  onChange={e => setProdName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Product MW (g/mol)
                </label>
                <input
                  type="number"
                  step="any"
                  value={prodMw}
                  onChange={e => setProdMw(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Isolated Actual Mass (g)
                </label>
                <input
                  type="number"
                  step="any"
                  value={actualMass}
                  onChange={e => setActualMass(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-teal-700 dark:text-teal-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Product Coeff
                </label>
                <input
                  type="number"
                  step="any"
                  value={prodCoeff}
                  onChange={e => setProdCoeff(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Analytical Purity & LOD Correction */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                3. QC Assay & Moisture Correction
              </span>
              <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enablePurityCorrection}
                  onChange={e => setEnablePurityCorrection(e.target.checked)}
                  className="rounded text-teal-600"
                />
                Enable Correction
              </label>
            </div>

            {enablePurityCorrection && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Chemical Purity / Assay (% w/w)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={purityPercent}
                    onChange={e => setPurityPercent(e.target.value)}
                    placeholder="e.g. 98.5"
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                  <span className="text-[10px] text-slate-400">HPLC Area % or titration potency</span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Loss on Drying / Moisture (% LOD)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={lodPercent}
                    onChange={e => setLodPercent(e.target.value)}
                    placeholder="e.g. 0.8"
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                  <span className="text-[10px] text-slate-400">Moisture / residual solvent to subtract</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Calculated Yields, Theoretical Output & Atom Economy */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h4 className="font-heading font-semibold text-sm text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
              Yield Summary & Metrics
            </h4>

            {/* Pure Yield Banner */}
            <div className="p-4 bg-teal-50/70 dark:bg-teal-950/30 rounded-xl border border-teal-100 dark:border-teal-900/40 space-y-1">
              <span className="text-xs font-semibold text-teal-800 dark:text-teal-300">
                {enablePurityCorrection ? 'Analytical Pure Yield (% Anhydrous)' : 'Crude Percentage Yield'}
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
                  {formatNumber(
                    enablePurityCorrection
                      ? yieldCalculations.pureYieldPercent
                      : yieldCalculations.crudeYieldPercent,
                    2
                  )}
                  %
                </span>
                <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                  {yieldCalculations.pureYieldPercent > 100 ? (
                    <span className="text-rose-600 font-bold">&gt;100% (Check Purity/Drying)</span>
                  ) : (
                    'Normal Range'
                  )}
                </span>
              </div>

              <button
                onClick={() =>
                  handleCopy(
                    `${formatNumber(yieldCalculations.pureYieldPercent, 2)}%`,
                    'yield-result'
                  )
                }
                className="mt-3 w-full py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedKey === 'yield-result' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'yield-result' ? 'Copied' : 'Copy Yield'}
              </button>
            </div>

            {/* Breakdown Grid */}
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex items-center justify-between">
                <span className="text-slate-500">Theoretical Yield</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatNumber(yieldCalculations.theoreticalMassGrams, 3)} g (
                  {formatNumber(yieldCalculations.theoreticalMoles * 1000, 2)} mmol)
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex items-center justify-between">
                <span className="text-slate-500">Actual Isolated Mass</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {actualMass} g
                </span>
              </div>

              {enablePurityCorrection && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex items-center justify-between">
                  <span className="text-slate-500">Pure Active Substance</span>
                  <span className="font-mono font-bold text-teal-700 dark:text-teal-400">
                    {formatNumber(yieldCalculations.pureMassGrams, 3)} g
                  </span>
                </div>
              )}

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex items-center justify-between">
                <span className="text-slate-500">Limiting Reagent</span>
                <span className="font-bold text-amber-700 dark:text-amber-400">
                  {yieldCalculations.limitingReagentName}
                </span>
              </div>
            </div>

            {/* Green Chemistry Metric: Atom Economy */}
            <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/40 flex items-start gap-2.5">
              <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <div className="font-semibold text-emerald-900 dark:text-emerald-300 flex items-center justify-between">
                  <span>Reaction Atom Economy</span>
                  <span className="font-mono font-bold">{formatNumber(yieldCalculations.atomEconomy, 1)}%</span>
                </div>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-400">
                  Percentage of reactant atoms incorporated into the desired target product.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
