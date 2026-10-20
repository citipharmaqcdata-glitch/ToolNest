import { useState, useMemo } from 'react';
import {
  Pipette,
  RotateCcw,
  Copy,
  Check,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Plus,
  Trash2,
  Sparkles,
  BarChart2
} from 'lucide-react';
import { copyToClipboard, formatNumber } from '../../utils/formatters';

interface StandardPoint {
  id: string;
  name: string;
  concentration: string;
  absorbance: string;
}

export default function SpectrophotometryCalculator() {
  const [tab, setTab] = useState<'beer-lambert' | 'transmittance' | 'calibration'>('beer-lambert');

  // --- TAB 1: Beer-Lambert Law Solver ---
  // A = e * b * c
  const [solveFor, setSolveFor] = useState<'absorbance' | 'extinction' | 'pathlength' | 'concentration'>('concentration');
  const [absorbanceInput, setAbsorbanceInput] = useState<string>('0.582');
  const [extinctionInput, setExtinctionInput] = useState<string>('9740'); // L/(mol*cm)
  const [pathlengthInput, setPathlengthInput] = useState<string>('1.0'); // cm
  const [pathUnit, setPathUnit] = useState<'cm' | 'mm'>('cm');
  const [concentrationInput, setConcentrationInput] = useState<string>('0.0000598'); // mol/L
  const [concUnit, setConcUnit] = useState<'M' | 'mM' | 'uM' | 'mg/L'>('uM');
  const [molarMassInput, setMolarMassInput] = useState<string>('194.19'); // g/mol (e.g. caffeine)
  const [dilutionFactor, setDilutionFactor] = useState<string>('1');

  // --- TAB 2: Transmittance <-> Absorbance ---
  const [transPercentInput, setTransPercentInput] = useState<string>('26.2');
  const [absTransInput, setAbsTransInput] = useState<string>('0.582');
  const [transSource, setTransSource] = useState<'transmittance' | 'absorbance'>('transmittance');

  // --- TAB 3: Multi-point Standard Calibration Curve ---
  const [standards, setStandards] = useState<StandardPoint[]>([
    { id: '1', name: 'Std 1', concentration: '10', absorbance: '0.125' },
    { id: '2', name: 'Std 2', concentration: '20', absorbance: '0.248' },
    { id: '3', name: 'Std 3', concentration: '30', absorbance: '0.370' },
    { id: '4', name: 'Std 4', concentration: '40', absorbance: '0.495' },
    { id: '5', name: 'Std 5', concentration: '50', absorbance: '0.618' }
  ]);
  const [unknownAbsorbance, setUnknownAbsorbance] = useState<string>('0.420');
  const [sampleDilution, setSampleDilution] = useState<string>('5');

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = async (text: string, key: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    }
  };

  // Convert path length to standard cm
  const pathInCm = useMemo(() => {
    const val = parseFloat(pathlengthInput) || 0;
    return pathUnit === 'mm' ? val / 10 : val;
  }, [pathlengthInput, pathUnit]);

  // Convert concentration input to M (mol/L)
  const concInM = useMemo(() => {
    const val = parseFloat(concentrationInput) || 0;
    const mw = parseFloat(molarMassInput) || 1;
    if (concUnit === 'mM') return val * 1e-3;
    if (concUnit === 'uM') return val * 1e-6;
    if (concUnit === 'mg/L') return (val * 1e-3) / (mw > 0 ? mw : 1);
    return val;
  }, [concentrationInput, concUnit, molarMassInput]);

  // Convert standard M (mol/L) into active concUnit
  const formatConcFromM = (mVal: number, targetUnit: 'M' | 'mM' | 'uM' | 'mg/L') => {
    const mw = parseFloat(molarMassInput) || 1;
    if (targetUnit === 'mM') return mVal * 1e3;
    if (targetUnit === 'uM') return mVal * 1e6;
    if (targetUnit === 'mg/L') return mVal * mw * 1e3;
    return mVal;
  };

  // Calculation for Beer-Lambert solver
  const beerLambertResult = useMemo(() => {
    const A = parseFloat(absorbanceInput) || 0;
    const e = parseFloat(extinctionInput) || 0;
    const b = pathInCm;
    const c = concInM;
    const df = parseFloat(dilutionFactor) || 1;

    switch (solveFor) {
      case 'absorbance': {
        if (e <= 0 || b <= 0 || c <= 0) return null;
        const calcA = e * b * c;
        return {
          label: 'Calculated Absorbance (A)',
          value: calcA,
          formatted: formatNumber(calcA, 4),
          unit: 'AU (Absorbance Units)',
          note: `A = ${formatNumber(e, 2)} × ${formatNumber(b, 2)} cm × ${formatNumber(c, 6)} M`
        };
      }
      case 'concentration': {
        if (e <= 0 || b <= 0) return null;
        const calcC_M = A / (e * b);
        const undilutedC_M = calcC_M * (df > 0 ? df : 1);
        const displayC = formatConcFromM(undilutedC_M, concUnit);
        return {
          label: `Sample Concentration (${concUnit})`,
          value: displayC,
          formatted: formatNumber(displayC, 4),
          unit: concUnit,
          molarValue: undilutedC_M,
          note: `c = A / (ε × b) ${df > 1 ? `× Dilution Factor (${df})` : ''}`
        };
      }
      case 'extinction': {
        if (b <= 0 || c <= 0) return null;
        const calcE = A / (b * c);
        return {
          label: 'Molar Absorptivity (ε)',
          value: calcE,
          formatted: formatNumber(calcE, 2),
          unit: 'L / (mol · cm)',
          note: `ε = A / (b × c) = ${formatNumber(A, 4)} / (${formatNumber(b, 2)} cm × ${formatNumber(c, 6)} M)`
        };
      }
      case 'pathlength': {
        if (e <= 0 || c <= 0) return null;
        const calcB_cm = A / (e * c);
        const displayB = pathUnit === 'mm' ? calcB_cm * 10 : calcB_cm;
        return {
          label: `Path Length (${pathUnit})`,
          value: displayB,
          formatted: formatNumber(displayB, 3),
          unit: pathUnit,
          note: `b = A / (ε × c)`
        };
      }
    }
  }, [solveFor, absorbanceInput, extinctionInput, pathInCm, concInM, dilutionFactor, concUnit, pathUnit]);

  // Calibration curve linear regression: y = m*x + c
  const calibrationStats = useMemo(() => {
    const validPoints = standards
      .map(p => ({
        x: parseFloat(p.concentration),
        y: parseFloat(p.absorbance)
      }))
      .filter(p => !isNaN(p.x) && !isNaN(p.y));

    if (validPoints.length < 2) return null;

    const n = validPoints.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;
    let sumY2 = 0;

    for (const p of validPoints) {
      sumX += p.x;
      sumY += p.y;
      sumXY += p.x * p.y;
      sumX2 += p.x * p.x;
      sumY2 += p.y * p.y;
    }

    const denominator = n * sumX2 - sumX * sumX;
    if (denominator === 0) return null;

    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    // Pearson correlation r & r^2
    const numR = n * sumXY - sumX * sumY;
    const denR = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    const r = denR !== 0 ? numR / denR : 0;
    const r2 = r * r;

    // Unknown interpolation: x = (y - c) / m
    const unkAbs = parseFloat(unknownAbsorbance);
    const df = parseFloat(sampleDilution) || 1;
    let unknownConc = null;
    let finalSampleConc = null;

    if (!isNaN(unkAbs) && slope !== 0) {
      unknownConc = (unkAbs - intercept) / slope;
      finalSampleConc = unknownConc * (df > 0 ? df : 1);
    }

    return {
      slope,
      intercept,
      r,
      r2,
      pointsCount: n,
      unknownConc,
      finalSampleConc
    };
  }, [standards, unknownAbsorbance, sampleDilution]);

  // Transmittance <-> Absorbance conversions
  const transmittanceCalculations = useMemo(() => {
    if (transSource === 'transmittance') {
      const tPercent = parseFloat(transPercentInput);
      if (isNaN(tPercent) || tPercent <= 0) return { a: null, tPercent: null };
      const a = 2 - Math.log10(tPercent);
      return { a, tPercent };
    } else {
      const a = parseFloat(absTransInput);
      if (isNaN(a) || a < 0) return { a: null, tPercent: null };
      const tPercent = Math.pow(10, 2 - a);
      return { a, tPercent };
    }
  }, [transPercentInput, absTransInput, transSource]);

  // Presets
  const applyPreset = (preset: { name: string; e: string; mw: string; b: string }) => {
    setExtinctionInput(preset.e);
    setMolarMassInput(preset.mw);
    setPathlengthInput(preset.b);
    setPathUnit('cm');
    setConcUnit('uM');
  };

  const currentAbsorbanceForWarning =
    solveFor === 'absorbance'
      ? beerLambertResult?.value || 0
      : parseFloat(absorbanceInput) || 0;

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
        <button
          onClick={() => setTab('beer-lambert')}
          className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
            tab === 'beer-lambert'
              ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Pipette className="w-4 h-4" />
          Beer-Lambert Law (A = ε·b·c)
        </button>
        <button
          onClick={() => setTab('calibration')}
          className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
            tab === 'calibration'
              ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Standard Calibration Curve
        </button>
        <button
          onClick={() => setTab('transmittance')}
          className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
            tab === 'transmittance'
              ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          %Transmittance ↔ Absorbance
        </button>
      </div>

      {/* TAB 1: BEER-LAMBERT LAW SOLVER */}
      {tab === 'beer-lambert' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Controls */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-heading font-semibold text-slate-900 dark:text-white text-base">
                    Analytical Spectrophotometry Parameters
                  </h3>
                  <p className="text-[11px] text-slate-500">Calculate unknown variable using Beer-Lambert relation</p>
                </div>
                <button
                  onClick={() => {
                    setAbsorbanceInput('0.582');
                    setExtinctionInput('9740');
                    setPathlengthInput('1.0');
                    setConcentrationInput('0.0000598');
                    setDilutionFactor('1');
                  }}
                  className="text-xs text-slate-500 hover:text-teal-600 flex items-center gap-1 py-1 px-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>

              {/* Solve For Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Variable to Calculate:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: 'concentration', label: 'Concentration (c)' },
                    { id: 'absorbance', label: 'Absorbance (A)' },
                    { id: 'extinction', label: 'Molar Extinction (ε)' },
                    { id: 'pathlength', label: 'Path Length (b)' }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setSolveFor(item.id as any)}
                      className={`py-2 px-2.5 text-xs font-medium rounded-lg border transition-all text-center ${
                        solveFor === item.id
                          ? 'bg-teal-600 border-teal-600 text-white font-semibold shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Presets */}
              <div>
                <div className="text-[11px] text-slate-500 font-medium mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  Common QC Spectrophotometry Presets:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => applyPreset({ name: 'Caffeine', e: '9740', mw: '194.19', b: '1.0' })}
                    className="text-xs py-1 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    Caffeine (273 nm, ε=9,740)
                  </button>
                  <button
                    onClick={() => applyPreset({ name: 'KMnO4', e: '2400', mw: '158.03', b: '1.0' })}
                    className="text-xs py-1 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    KMnO₄ (525 nm, ε=2,400)
                  </button>
                  <button
                    onClick={() => applyPreset({ name: 'Paracetamol', e: '10800', mw: '151.16', b: '1.0' })}
                    className="text-xs py-1 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    Paracetamol (257 nm, ε=10,800)
                  </button>
                </div>
              </div>

              {/* Input Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Absorbance (if not calculating A) */}
                {solveFor !== 'absorbance' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Absorbance (A)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={absorbanceInput}
                      onChange={e => setAbsorbanceInput(e.target.value)}
                      placeholder="e.g. 0.582"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono text-slate-900 dark:text-white"
                    />
                    <span className="text-[10px] text-slate-400">Optimal linear range: 0.1 to 1.0 AU</span>
                  </div>
                )}

                {/* Extinction Coefficient (if not calculating e) */}
                {solveFor !== 'extinction' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Molar Absorptivity (ε) <span className="text-[10px] text-slate-400">L/(mol·cm)</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={extinctionInput}
                      onChange={e => setExtinctionInput(e.target.value)}
                      placeholder="e.g. 9740"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                )}

                {/* Path Length (if not calculating b) */}
                {solveFor !== 'pathlength' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Cuvette Path Length (b)
                      </label>
                      <div className="flex text-[10px] gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded">
                        <button
                          onClick={() => setPathUnit('cm')}
                          className={`px-1.5 py-0.5 rounded ${pathUnit === 'cm' ? 'bg-white dark:bg-slate-900 font-bold' : ''}`}
                        >
                          cm
                        </button>
                        <button
                          onClick={() => setPathUnit('mm')}
                          className={`px-1.5 py-0.5 rounded ${pathUnit === 'mm' ? 'bg-white dark:bg-slate-900 font-bold' : ''}`}
                        >
                          mm
                        </button>
                      </div>
                    </div>
                    <input
                      type="number"
                      step="any"
                      value={pathlengthInput}
                      onChange={e => setPathlengthInput(e.target.value)}
                      placeholder="e.g. 1.0"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                )}

                {/* Concentration (if not calculating c) */}
                {solveFor !== 'concentration' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Concentration (c)
                      </label>
                      <select
                        value={concUnit}
                        onChange={e => setConcUnit(e.target.value as any)}
                        className="text-[10px] bg-slate-100 dark:bg-slate-800 rounded px-1.5 py-0.5 border-none"
                      >
                        <option value="uM">µM (micromolar)</option>
                        <option value="mM">mM (millimolar)</option>
                        <option value="M">M (mol/L)</option>
                        <option value="mg/L">mg/L (ppm)</option>
                      </select>
                    </div>
                    <input
                      type="number"
                      step="any"
                      value={concentrationInput}
                      onChange={e => setConcentrationInput(e.target.value)}
                      placeholder="e.g. 50"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                )}

                {/* Additional Helpers: Molar Mass & Dilution */}
                {solveFor === 'concentration' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Concentration Result Unit
                      </label>
                      <select
                        value={concUnit}
                        onChange={e => setConcUnit(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white"
                      >
                        <option value="uM">µM (micromolar)</option>
                        <option value="mM">mM (millimolar)</option>
                        <option value="M">M (molar / mol/L)</option>
                        <option value="mg/L">mg/L (parts per million)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Dilution Factor (if diluted)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={dilutionFactor}
                        onChange={e => setDilutionFactor(e.target.value)}
                        placeholder="1.0"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono text-slate-900 dark:text-white"
                      />
                    </div>

                    {concUnit === 'mg/L' && (
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Compound Molar Mass (g/mol) <span className="text-[10px] text-slate-400">Required for mg/L</span>
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={molarMassInput}
                          onChange={e => setMolarMassInput(e.target.value)}
                          placeholder="e.g. 194.19"
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono text-slate-900 dark:text-white"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Result & Analytical QC Warnings Card */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="font-heading font-semibold text-sm text-slate-900 dark:text-white">
                    Calculation Result
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400">
                    A = ε·b·c
                  </span>
                </div>

                <div className="bg-teal-50/70 dark:bg-teal-950/30 p-4 rounded-xl border border-teal-100 dark:border-teal-900/40 space-y-1">
                  <span className="text-xs text-teal-800 dark:text-teal-300 font-medium">
                    {beerLambertResult?.label || 'Result'}
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white">
                      {beerLambertResult ? beerLambertResult.formatted : '—'}
                    </span>
                    <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                      {beerLambertResult?.unit}
                    </span>
                  </div>
                  {beerLambertResult?.note && (
                    <div className="text-[11px] text-slate-500 font-mono pt-1">
                      {beerLambertResult.note}
                    </div>
                  )}

                  {beerLambertResult && (
                    <button
                      onClick={() =>
                        handleCopy(
                          `${beerLambertResult.formatted} ${beerLambertResult.unit}`,
                          'bl-result'
                        )
                      }
                      className="mt-3 w-full py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {copiedKey === 'bl-result' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedKey === 'bl-result' ? 'Copied to Clipboard' : 'Copy Result'}
                    </button>
                  )}
                </div>

                {/* Photometric QC Warning */}
                {currentAbsorbanceForWarning > 1.5 && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <div className="font-semibold">High Absorbance (A &gt; 1.5 AU)</div>
                      <div className="text-[11px] text-amber-700 dark:text-amber-400">
                        Stray light and detector nonlinearity may reduce accuracy. Consider diluting sample to bring A within 0.2–0.8.
                      </div>
                    </div>
                  </div>
                )}

                {currentAbsorbanceForWarning < 0.1 && currentAbsorbanceForWarning > 0 && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl flex items-start gap-2 text-xs text-blue-800 dark:text-blue-300">
                    <HelpCircle className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-semibold">Low Absorbance (A &lt; 0.1 AU)</div>
                      <div className="text-[11px] text-blue-700 dark:text-blue-400">
                        Photometric read errors are magnified at very low absorbances. Use a longer pathlength or more concentrated sample.
                      </div>
                    </div>
                  </div>
                )}

                {currentAbsorbanceForWarning >= 0.1 && currentAbsorbanceForWarning <= 1.5 && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl flex items-start gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                    <div>
                      <div className="font-semibold">Optimal Photometric Range</div>
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                        Absorbance is within the linear dynamic range for standard UV-Vis spectrophotometers.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MULTI-POINT CALIBRATION CURVE */}
      {tab === 'calibration' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Standards Table */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-heading font-semibold text-slate-900 dark:text-white text-base">
                    Calibration Standards Points
                  </h3>
                  <p className="text-[11px] text-slate-500">Linear regression analysis: Absorbance (y) vs Concentration (x)</p>
                </div>
                <button
                  onClick={() => {
                    const nextId = (standards.length + 1).toString();
                    setStandards([...standards, { id: nextId, name: `Std ${nextId}`, concentration: '', absorbance: '' }]);
                  }}
                  className="py-1 px-2.5 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800 rounded-lg text-xs font-medium flex items-center gap-1 hover:bg-teal-100"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Point
                </button>
              </div>

              {/* Table */}
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {standards.map((point, idx) => (
                  <div key={point.id} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                    <span className="w-14 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {point.name}
                    </span>
                    <div className="flex-1">
                      <input
                        type="number"
                        step="any"
                        value={point.concentration}
                        onChange={e => {
                          const updated = [...standards];
                          updated[idx].concentration = e.target.value;
                          setStandards(updated);
                        }}
                        placeholder="Conc (x)"
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        step="any"
                        value={point.absorbance}
                        onChange={e => {
                          const updated = [...standards];
                          updated[idx].absorbance = e.target.value;
                          setStandards(updated);
                        }}
                        placeholder="Abs (y)"
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                      />
                    </div>
                    {standards.length > 2 && (
                      <button
                        onClick={() => setStandards(standards.filter(s => s.id !== point.id))}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Unknown sample input */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Unknown Sample Absorbance (y)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={unknownAbsorbance}
                    onChange={e => setUnknownAbsorbance(e.target.value)}
                    placeholder="e.g. 0.420"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Sample Dilution Factor
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={sampleDilution}
                    onChange={e => setSampleDilution(e.target.value)}
                    placeholder="1.0"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Regression Results & Interpolation */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <h4 className="font-heading font-semibold text-sm text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                  Linear Regression (y = mx + c)
                </h4>

                {calibrationStats ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <div className="text-[11px] text-slate-400">Slope (m)</div>
                        <div className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                          {formatNumber(calibrationStats.slope, 5)}
                        </div>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <div className="text-[11px] text-slate-400">Y-Intercept (c)</div>
                        <div className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                          {formatNumber(calibrationStats.intercept, 5)}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-teal-50/70 dark:bg-teal-950/30 rounded-xl border border-teal-100 dark:border-teal-900/40">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-teal-800 dark:text-teal-300">
                          Coefficient of Determination (R²)
                        </span>
                        <span className="font-mono font-bold text-base text-teal-900 dark:text-teal-200">
                          {formatNumber(calibrationStats.r2, 4)}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Pearson r = {formatNumber(calibrationStats.r, 4)} (
                        {calibrationStats.r2 >= 0.995 ? 'USP/ICH Compliant (≥ 0.995)' : 'Poor linearity (< 0.995)'}
                        )
                      </div>
                    </div>

                    {/* Unknown Interpolation Result */}
                    <div className="p-4 bg-slate-100 dark:bg-slate-800/70 rounded-xl space-y-2">
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Unknown Sample Concentration
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                          {calibrationStats.finalSampleConc !== null
                            ? formatNumber(calibrationStats.finalSampleConc, 4)
                            : '—'}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          (Orig: {calibrationStats.unknownConc !== null ? formatNumber(calibrationStats.unknownConc, 3) : '—'})
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Equation: x = (y - {formatNumber(calibrationStats.intercept, 4)}) /{' '}
                        {formatNumber(calibrationStats.slope, 4)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Enter at least 2 valid standard points to compute linear regression.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TRANSMITTANCE <-> ABSORBANCE */}
      {tab === 'transmittance' && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div>
            <h3 className="font-heading font-semibold text-base text-slate-900 dark:text-white">
              Transmittance (%T) & Absorbance (A) Converter
            </h3>
            <p className="text-xs text-slate-500">
              Photometric relationship: A = 2 - log₁₀(%T) and %T = 10^(2 - A)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Transmittance Input */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                transSource === 'transmittance'
                  ? 'border-teal-500 bg-teal-50/30 dark:bg-teal-950/20'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                % Transmittance (%T)
              </label>
              <input
                type="number"
                step="any"
                value={transPercentInput}
                onFocus={() => setTransSource('transmittance')}
                onChange={e => {
                  setTransSource('transmittance');
                  setTransPercentInput(e.target.value);
                }}
                placeholder="e.g. 26.2"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-lg font-mono font-bold text-slate-900 dark:text-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">100% = Clear blank, 0% = Total opacity</span>
            </div>

            {/* Absorbance Input */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                transSource === 'absorbance'
                  ? 'border-teal-500 bg-teal-50/30 dark:bg-teal-950/20'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Absorbance (AU)
              </label>
              <input
                type="number"
                step="any"
                value={absTransInput}
                onFocus={() => setTransSource('absorbance')}
                onChange={e => {
                  setTransSource('absorbance');
                  setAbsTransInput(e.target.value);
                }}
                placeholder="e.g. 0.582"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-lg font-mono font-bold text-slate-900 dark:text-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">A = 1.0 means 10% transmittance</span>
            </div>
          </div>

          {/* Visual Bar Indicator */}
          {transmittanceCalculations.tPercent !== null && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
                <span>Light Transmitted: {formatNumber(transmittanceCalculations.tPercent, 2)}%</span>
                <span>Light Absorbed: {formatNumber(100 - transmittanceCalculations.tPercent, 2)}%</span>
              </div>
              <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-teal-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, transmittanceCalculations.tPercent))}%` }}
                />
                <div
                  className="h-full bg-slate-400 dark:bg-slate-600 transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, 100 - transmittanceCalculations.tPercent))}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
