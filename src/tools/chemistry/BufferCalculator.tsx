import { useState, useMemo } from 'react';
import {
  TestTubes,
  RotateCcw,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Thermometer,
  Layers,
  FileText,
  Settings2
} from 'lucide-react';
import { copyToClipboard, formatNumber } from '../../utils/formatters';

interface BufferPreset {
  id: string;
  name: string;
  commonName: string;
  recommendedPh: number;
  pKa: number;
  dpKa_dT?: number; // temperature coefficient
  acidName: string;
  acidMw: number;
  acidIsLiquid?: boolean;
  acidDensity?: number; // g/mL
  acidPurityPercent?: number; // % w/w
  baseName: string;
  baseMw: number;
  baseCharge?: number;
  acidCharge?: number;
  notes: string;
}

const BUFFER_PRESETS: BufferPreset[] = [
  {
    id: 'pbs-phosphate',
    name: 'Phosphate Buffer (PBS / Sorensen)',
    commonName: 'Phosphate (pKa₂ = 7.20)',
    recommendedPh: 7.4,
    pKa: 7.20,
    dpKa_dT: -0.0028,
    acidName: 'Sodium Dihydrogen Phosphate Monohydrate (NaH₂PO₄·H₂O)',
    acidMw: 137.99,
    baseName: 'Disodium Hydrogen Phosphate Anhydrous (Na₂HPO₄)',
    baseMw: 141.96,
    acidCharge: 1,
    baseCharge: 2,
    notes: 'Biological standard (PBS), physiological pH 7.2–7.6, enzymatic assays and chromatographic separations.'
  },
  {
    id: 'acetate-usp',
    name: 'Acetate Buffer (USP / EP)',
    commonName: 'Acetate (pKa = 4.76)',
    recommendedPh: 4.75,
    pKa: 4.76,
    dpKa_dT: 0.0002,
    acidName: 'Glacial Acetic Acid (CH₃COOH 100%)',
    acidMw: 60.05,
    acidIsLiquid: true,
    acidDensity: 1.049,
    acidPurityPercent: 100,
    baseName: 'Sodium Acetate Trihydrate (CH₃COONa·3H₂O)',
    baseMw: 136.08,
    acidCharge: 0,
    baseCharge: 1,
    notes: 'Standard pharmacopoeial dissolution buffer, acidic HPLC reverse-phase mobile phase component.'
  },
  {
    id: 'citrate',
    name: 'Citrate Buffer (Acidic)',
    commonName: 'Citrate (pKa₂ = 4.76)',
    recommendedPh: 4.5,
    pKa: 4.76,
    dpKa_dT: -0.0016,
    acidName: 'Citric Acid Monohydrate (C₆H₈O₇·H₂O)',
    acidMw: 210.14,
    baseName: 'Trisodium Citrate Dihydrate (Na₃C₆H₅O₇·2H₂O)',
    baseMw: 294.10,
    acidCharge: 1,
    baseCharge: 2,
    notes: 'Chelating agent and stabilizer, widely used for antigen retrieval and parenteral formulation.'
  },
  {
    id: 'tris-hcl',
    name: 'Tris-HCl Buffer',
    commonName: 'Tris / Tromethamine (pKa = 8.06)',
    recommendedPh: 8.0,
    pKa: 8.06,
    dpKa_dT: -0.028, // Strong temperature dependence!
    acidName: 'Tris Hydrochloride (Tris-HCl)',
    acidMw: 157.60,
    baseName: 'Tris Base (Tromethamine Free Base)',
    baseMw: 121.14,
    acidCharge: 1,
    baseCharge: 0,
    notes: 'Critical for biochemistry, DNA/RNA electrophoresis, enzyme kinetics. Note: Strong temperature dependence (-0.028 pH/°C).'
  },
  {
    id: 'hepes',
    name: 'HEPES Buffer (Good’s Buffer)',
    commonName: 'HEPES (pKa = 7.55)',
    recommendedPh: 7.5,
    pKa: 7.55,
    dpKa_dT: -0.014,
    acidName: 'HEPES Free Acid',
    acidMw: 238.30,
    baseName: 'HEPES Sodium Salt',
    baseMw: 260.29,
    acidCharge: 0,
    baseCharge: 1,
    notes: 'Zwitterionic Good’s buffer for mammalian cell culture and enzyme assays at physiological pH.'
  },
  {
    id: 'formate-lcms',
    name: 'Ammonium Formate (LC-MS Volatile)',
    commonName: 'Formate (pKa = 3.75)',
    recommendedPh: 3.8,
    pKa: 3.75,
    dpKa_dT: 0.0,
    acidName: 'Formic Acid (HCOOH 98%)',
    acidMw: 46.03,
    acidIsLiquid: true,
    acidDensity: 1.22,
    acidPurityPercent: 98,
    baseName: 'Ammonium Formate (HCOONH₄)',
    baseMw: 63.06,
    acidCharge: 0,
    baseCharge: 1,
    notes: 'Volatile HPLC and LC-MS mobile phase additive preventing non-volatile salt precipitation in ion source.'
  },
  {
    id: 'bicarbonate',
    name: 'Ammonium Bicarbonate / Carbonate',
    commonName: 'Carbonate / Bicarbonate (pKa = 6.35)',
    recommendedPh: 7.8,
    pKa: 6.35,
    dpKa_dT: -0.009,
    acidName: 'Ammonium Bicarbonate (NH₄HCO₃)',
    acidMw: 79.06,
    baseName: 'Ammonium Carbonate ((NH₄)₂CO₃)',
    baseMw: 96.09,
    acidCharge: 1,
    baseCharge: 2,
    notes: 'Volatile mobile phase and protein digest buffer (trypsin digestion).'
  }
];

export default function BufferCalculator() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('pbs-phosphate');
  const [prepMode, setPrepMode] = useState<'conjugate-pair' | 'acid-titrate' | 'base-titrate'>('conjugate-pair');
  
  // Basic parameters
  const [targetPh, setTargetPh] = useState<string>('7.40');
  const [totalConcentration, setTotalConcentration] = useState<string>('50'); // mM
  const [volume, setVolume] = useState<string>('1000'); // mL
  const [temperatureC, setTemperatureC] = useState<string>('25'); // °C

  // Custom buffer parameters
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>('Custom Buffer');
  const [customPka, setCustomPka] = useState<string>('7.00');
  const [customAcidName, setCustomAcidName] = useState<string>('Weak Acid HA');
  const [customAcidMw, setCustomAcidMw] = useState<string>('120.0');
  const [customBaseName, setCustomBaseName] = useState<string>('Conjugate Base Salt NaA');
  const [customBaseMw, setCustomBaseMw] = useState<string>('142.0');

  // Titrant selection for titration modes
  const [titrantConcentration, setTitrantConcentration] = useState<string>('1.0'); // M (e.g. 1M NaOH or 1M HCl)

  const [copied, setCopied] = useState<boolean>(false);

  // Active Preset definition
  const activePreset = useMemo(() => {
    if (isCustom) {
      return {
        id: 'custom',
        name: customName,
        commonName: customName,
        recommendedPh: parseFloat(customPka) || 7.0,
        pKa: parseFloat(customPka) || 7.0,
        dpKa_dT: 0,
        acidName: customAcidName,
        acidMw: parseFloat(customAcidMw) || 100,
        baseName: customBaseName,
        baseMw: parseFloat(customBaseMw) || 120,
        notes: 'User-specified customized conjugate buffer system.'
      };
    }
    return BUFFER_PRESETS.find(p => p.id === selectedPresetId) || BUFFER_PRESETS[0];
  }, [selectedPresetId, isCustom, customName, customPka, customAcidName, customAcidMw, customBaseName, customBaseMw]);

  // Handle Preset Selection
  const handleSelectPreset = (presetId: string) => {
    if (presetId === 'custom') {
      setIsCustom(true);
      return;
    }
    setIsCustom(false);
    setSelectedPresetId(presetId);
    const p = BUFFER_PRESETS.find(x => x.id === presetId);
    if (p) {
      setTargetPh(p.recommendedPh.toFixed(2));
    }
  };

  // Math calculations
  const calcData = useMemo(() => {
    const ph = parseFloat(targetPh);
    const cTotal_mM = parseFloat(totalConcentration);
    const vol_mL = parseFloat(volume);
    const temp = parseFloat(temperatureC) || 25;
    const titrantM = parseFloat(titrantConcentration) || 1.0;

    if (isNaN(ph) || isNaN(cTotal_mM) || cTotal_mM <= 0 || isNaN(vol_mL) || vol_mL <= 0) {
      return null;
    }

    // Temperature adjusted pKa: pKa(T) = pKa(25°C) + dpKa/dT * (T - 25)
    const dpKa_dT = activePreset.dpKa_dT || 0;
    const effectivePka = activePreset.pKa + dpKa_dT * (temp - 25);

    // Henderson-Hasselbalch: pH = pKa + log10([A-] / [HA])
    // => [A-] / [HA] = 10^(pH - pKa)
    const deltaPhPka = ph - effectivePka;
    const ratioBaseToAcid = Math.pow(10, deltaPhPka); // [A-] / [HA]

    // Total concentration: C_total = [HA] + [A-]
    // [HA] = C_total / (1 + ratio)
    // [A-] = C_total * ratio / (1 + ratio)
    const cTotal_M = cTotal_mM / 1000; // Molar
    const vol_L = vol_mL / 1000; // Liters
    const totalMoles = cTotal_M * vol_L;

    const fractionBase = ratioBaseToAcid / (1 + ratioBaseToAcid);
    const fractionAcid = 1 / (1 + ratioBaseToAcid);

    const molesBase = totalMoles * fractionBase;
    const molesAcid = totalMoles * fractionAcid;

    const concBase_mM = cTotal_mM * fractionBase;
    const concAcid_mM = cTotal_mM * fractionAcid;

    // Masses
    const massBase_g = molesBase * activePreset.baseMw;
    let massAcid_g = molesAcid * activePreset.acidMw;
    let volAcid_mL: number | null = null;

    if (activePreset.acidIsLiquid && activePreset.acidDensity && activePreset.acidPurityPercent) {
      // Mass required of pure acid = massAcid_g
      // Actual solution mass = massAcid_g / (purity / 100)
      // Volume = Solution Mass / Density
      const actualSolMass_g = massAcid_g / (activePreset.acidPurityPercent / 100);
      volAcid_mL = actualSolMass_g / activePreset.acidDensity;
    }

    // Titration method calculations
    // If starting with pure acid (totalMoles) and adding strong base (NaOH) to reach pH:
    // moles NaOH required = molesBase (since each mole of OH- converts 1 mole HA -> A-)
    const volTitrantBase_mL = (molesBase / titrantM) * 1000;
    const massTotalAcidForTitration_g = totalMoles * activePreset.acidMw;

    // If starting with pure base (totalMoles) and adding strong acid (HCl) to reach pH:
    // moles HCl required = molesAcid (since each mole of H+ converts 1 mole A- -> HA)
    const volTitrantAcid_mL = (molesAcid / titrantM) * 1000;
    const massTotalBaseForTitration_g = totalMoles * activePreset.baseMw;

    // Buffer Capacity (Van Slyke equation: beta = 2.303 * C_total * ( [HA][A-] / C_total^2 ) )
    // beta = 2.303 * C_total * fractionBase * fractionAcid
    const bufferCapacityBeta = 2.303 * cTotal_M * fractionBase * fractionAcid;
    const maxBeta = 2.303 * cTotal_M * 0.25; // max occurs when pH = pKa (fraction = 0.5)
    const betaPercentOfMax = maxBeta > 0 ? (bufferCapacityBeta / maxBeta) * 100 : 0;

    // Evaluation of buffer efficacy
    const diffFromPka = Math.abs(deltaPhPka);
    let bufferRating: 'optimal' | 'moderate' | 'weak';
    let bufferRatingText: string;
    if (diffFromPka <= 0.6) {
      bufferRating = 'optimal';
      bufferRatingText = 'Optimal Buffering Range (|pH - pKa| ≤ 0.6)';
    } else if (diffFromPka <= 1.0) {
      bufferRating = 'moderate';
      bufferRatingText = 'Acceptable Buffering Range (|pH - pKa| ≤ 1.0)';
    } else {
      bufferRating = 'weak';
      bufferRatingText = 'Weak Buffer Warning: pH is outside pKa ± 1.0 buffering window';
    }

    return {
      ph,
      cTotal_mM,
      cTotal_M,
      vol_mL,
      vol_L,
      temp,
      effectivePka,
      deltaPhPka,
      ratioBaseToAcid,
      fractionBase,
      fractionAcid,
      concBase_mM,
      concAcid_mM,
      molesBase,
      molesAcid,
      massBase_g,
      massAcid_g,
      volAcid_mL,
      volTitrantBase_mL,
      massTotalAcidForTitration_g,
      volTitrantAcid_mL,
      massTotalBaseForTitration_g,
      titrantM,
      bufferCapacityBeta,
      maxBeta,
      betaPercentOfMax,
      bufferRating,
      bufferRatingText,
      diffFromPka
    };
  }, [targetPh, totalConcentration, volume, temperatureC, activePreset, titrantConcentration]);

  // Generate SOP recipe string
  const recipeText = useMemo(() => {
    if (!calcData) return '';
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    
    let prepInstructions = '';
    if (prepMode === 'conjugate-pair') {
      prepInstructions = `1. Weigh ${formatNumber(calcData.massBase_g, 4)} g of ${activePreset.baseName}.\n` +
        `2. ${activePreset.acidIsLiquid && calcData.volAcid_mL !== null 
          ? `Pipette ${formatNumber(calcData.volAcid_mL, 3)} mL of ${activePreset.acidName} (${formatNumber(calcData.massAcid_g, 4)} g).` 
          : `Weigh ${formatNumber(calcData.massAcid_g, 4)} g of ${activePreset.acidName}.`}\n` +
        `3. Dissolve both components in ~${Math.round(calcData.vol_mL * 0.8)} mL of HPLC-grade deionized water in a volumetric flask or beaker with magnetic stirring.\n` +
        `4. Calibrate pH meter using standard NIST buffer solutions (pH 4.01, 7.00, 10.01) at ${calcData.temp}°C.\n` +
        `5. Verify the pH. If slight adjustment is required, add dropwise 0.1 M HCl or 0.1 M NaOH to reach target pH ${calcData.ph.toFixed(2)}.\n` +
        `6. Bring to final volume (${calcData.vol_mL} mL) with deionized water in a volumetric flask and mix thoroughly.\n` +
        `7. (For HPLC Mobile Phase): Filter through 0.22 µm or 0.45 µm nylon/PTFE membrane and degas via sonication for 10-15 minutes.`;
    } else if (prepMode === 'acid-titrate') {
      prepInstructions = `1. Weigh ${formatNumber(calcData.massTotalAcidForTitration_g, 4)} g of ${activePreset.acidName} (all buffer acid component).\n` +
        `2. Dissolve in ~${Math.round(calcData.vol_mL * 0.8)} mL of HPLC-grade deionized water.\n` +
        `3. Place on magnetic stirrer and immerse calibrated pH electrode.\n` +
        `4. Add approximately ${formatNumber(calcData.volTitrantBase_mL, 2)} mL of ${calcData.titrantM} M NaOH until target pH ${calcData.ph.toFixed(2)} is achieved.\n` +
        `5. Quantitatively transfer to a ${calcData.vol_mL} mL volumetric flask, dilute to volume with deionized water, and invert to mix.`;
    } else {
      prepInstructions = `1. Weigh ${formatNumber(calcData.massTotalBaseForTitration_g, 4)} g of ${activePreset.baseName} (all buffer base component).\n` +
        `2. Dissolve in ~${Math.round(calcData.vol_mL * 0.8)} mL of HPLC-grade deionized water.\n` +
        `3. Place on magnetic stirrer and immerse calibrated pH electrode.\n` +
        `4. Add approximately ${formatNumber(calcData.volTitrantAcid_mL, 2)} mL of ${calcData.titrantM} M HCl until target pH ${calcData.ph.toFixed(2)} is achieved.\n` +
        `5. Quantitatively transfer to a ${calcData.vol_mL} mL volumetric flask, dilute to volume with deionized water, and invert to mix.`;
    }

    return `STANDARD OPERATING PROCEDURE (SOP): BUFFER PREPARATION
=========================================================
Buffer System: ${activePreset.name}
Preparation Mode: ${prepMode === 'conjugate-pair' ? 'Two-Component Conjugate Salt & Acid Pair' : prepMode === 'acid-titrate' ? 'Weak Acid + NaOH Titration' : 'Weak Base + HCl Titration'}
Target pH: ${calcData.ph.toFixed(2)} (Effective pKa at ${calcData.temp}°C = ${calcData.effectivePka.toFixed(2)})
Total Buffer Concentration: ${calcData.cTotal_mM} mM (${calcData.cTotal_M} M)
Total Volume: ${calcData.vol_mL} mL (${calcData.vol_L} L)
Operating Temperature: ${calcData.temp} °C
Date Generated: ${dateStr}

FORMULATION QUANTITIES:
---------------------------------------------------------
- Conjugate Base: ${activePreset.baseName}
  Target Concentration: ${formatNumber(calcData.concBase_mM, 2)} mM
  Mass Required: ${formatNumber(calcData.massBase_g, 4)} g

- Weak Acid: ${activePreset.acidName}
  Target Concentration: ${formatNumber(calcData.concAcid_mM, 2)} mM
  Mass Required: ${formatNumber(calcData.massAcid_g, 4)} g
  ${calcData.volAcid_mL !== null ? `Liquid Volume: ${formatNumber(calcData.volAcid_mL, 3)} mL` : ''}

EQUILIBRIUM & BUFFER CAPACITY:
---------------------------------------------------------
- [Base]/[Acid] Molar Ratio: ${formatNumber(calcData.ratioBaseToAcid, 4)}:1
- Base Fraction: ${(calcData.fractionBase * 100).toFixed(1)}% | Acid Fraction: ${(calcData.fractionAcid * 100).toFixed(1)}%
- Buffer Capacity (β): ${formatNumber(calcData.bufferCapacityBeta, 4)} mol/(L·pH) (${calcData.betaPercentOfMax.toFixed(1)}% of βmax)
- Efficacy Status: ${calcData.bufferRatingText}

STEP-BY-STEP PREPARATION PROTOCOL:
---------------------------------------------------------
${prepInstructions}
`;
  }, [calcData, activePreset, prepMode]);

  const handleCopyRecipe = async () => {
    const success = await copyToClipboard(recipeText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setSelectedPresetId('pbs-phosphate');
    setIsCustom(false);
    setPrepMode('conjugate-pair');
    setTargetPh('7.40');
    setTotalConcentration('50');
    setVolume('1000');
    setTemperatureC('25');
    setTitrantConcentration('1.0');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <TestTubes className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Buffer Preparation & Henderson-Hasselbalch
              <span className="text-xs px-2 py-0.5 rounded-full font-sans font-medium bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300">
                Phase 5 Release
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Exact mass formulation, conjugate salt ratios, temperature compensation, and buffer capacity (β) analysis.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
        </div>
      </div>

      {/* Preset System Selector */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-teal-500" />
            1. Select Pharmacopoeial or Laboratory Buffer System
          </span>
          <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">
            Active pKa: {activePreset.pKa.toFixed(2)}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {BUFFER_PRESETS.map((preset) => {
            const isSelected = !isCustom && selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                className={`p-2.5 rounded-xl text-left border transition-all text-xs flex flex-col justify-between ${
                  isSelected
                    ? 'border-teal-500 bg-teal-50/60 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 font-semibold shadow-sm ring-1 ring-teal-500/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-medium truncate">{preset.commonName}</div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  pH ~{preset.recommendedPh}
                </div>
              </button>
            );
          })}
          <button
            onClick={() => handleSelectPreset('custom')}
            className={`p-2.5 rounded-xl text-left border transition-all text-xs flex flex-col justify-between ${
              isCustom
                ? 'border-teal-500 bg-teal-50/60 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 font-semibold shadow-sm ring-1 ring-teal-500/30'
                : 'border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="font-medium flex items-center gap-1">
              <Settings2 className="w-3 h-3 text-teal-500" />
              Custom
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
              User Defined
            </div>
          </button>
        </div>

        {/* Preset Description / Info banner */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
          <HelpCircle className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-slate-900 dark:text-white mr-1.5">{activePreset.name}:</span>
            {activePreset.notes}
          </div>
        </div>

        {/* Custom buffer editor if active */}
        {isCustom && (
          <div className="p-4 rounded-xl bg-teal-50/30 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-900/60 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Custom System Name
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Acid Dissociation Constant (pKa at 25°C)
              </label>
              <input
                type="number"
                step="0.01"
                value={customPka}
                onChange={(e) => setCustomPka(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Weak Acid HA Name & MW (g/mol)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customAcidName}
                  onChange={(e) => setCustomAcidName(e.target.value)}
                  placeholder="Acid Name"
                  className="w-2/3 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
                <input
                  type="number"
                  step="0.01"
                  value={customAcidMw}
                  onChange={(e) => setCustomAcidMw(e.target.value)}
                  placeholder="MW"
                  className="w-1/3 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
              </div>
            </div>
            <div className="md:col-span-3">
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Conjugate Base Salt A⁻ Name & MW (g/mol)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customBaseName}
                  onChange={(e) => setCustomBaseName(e.target.value)}
                  placeholder="Base Salt Name"
                  className="w-2/3 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
                <input
                  type="number"
                  step="0.01"
                  value={customBaseMw}
                  onChange={(e) => setCustomBaseMw(e.target.value)}
                  placeholder="MW"
                  className="w-1/3 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Parameters & Formulation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Inputs & Mode Selection (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              2. Formulation Parameters
            </span>

            {/* Preparation Mode Tabs */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Preparation Technique
              </label>
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-[11px] font-medium">
                <button
                  type="button"
                  onClick={() => setPrepMode('conjugate-pair')}
                  className={`py-1.5 px-2 rounded-lg text-center transition-all ${
                    prepMode === 'conjugate-pair'
                      ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Dual Salt Pair
                </button>
                <button
                  type="button"
                  onClick={() => setPrepMode('acid-titrate')}
                  className={`py-1.5 px-2 rounded-lg text-center transition-all ${
                    prepMode === 'acid-titrate'
                      ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Acid + NaOH
                </button>
                <button
                  type="button"
                  onClick={() => setPrepMode('base-titrate')}
                  className={`py-1.5 px-2 rounded-lg text-center transition-all ${
                    prepMode === 'base-titrate'
                      ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Base + HCl
                </button>
              </div>
            </div>

            {/* Target pH Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Target pH
                </label>
                <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                  Ideal Window: {(activePreset.pKa - 1.0).toFixed(2)} – {(activePreset.pKa + 1.0).toFixed(2)}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="14"
                  value={targetPh}
                  onChange={(e) => setTargetPh(e.target.value)}
                  className="w-full px-3 py-2.5 text-base font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Total Concentration & Volume */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Buffer Total Conc. (mM)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0.1"
                  value={totalConcentration}
                  onChange={(e) => setTotalConcentration(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Final Volume (mL)
                </label>
                <input
                  type="number"
                  step="50"
                  min="1"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Temperature & Titrant */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                  Temperature (°C)
                </label>
                <input
                  type="number"
                  step="1"
                  value={temperatureC}
                  onChange={(e) => setTemperatureC(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {prepMode !== 'conjugate-pair' ? (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Titrant Conc. (M)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.01"
                    value={titrantConcentration}
                    onChange={(e) => setTitrantConcentration(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              ) : (
                <div className="flex flex-col justify-end">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50">
                    pKa at {temperatureC}°C = <strong className="text-teal-600 dark:text-teal-400">{calcData?.effectivePka.toFixed(2) ?? activePreset.pKa.toFixed(2)}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Quick volume preset chips */}
            <div className="pt-1">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold tracking-wider block mb-1.5">
                Quick Volume Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['250', '500', '1000', '2000'].map((vol) => (
                  <button
                    key={vol}
                    type="button"
                    onClick={() => setVolume(vol)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                      volume === vol
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {vol} mL {vol === '1000' ? '(1 L)' : vol === '2000' ? '(2 L)' : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Buffer Capacity Visual Gauge Card */}
          {calcData && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-500" />
                  Van Slyke Buffer Capacity (β)
                </span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  calcData.bufferRating === 'optimal'
                    ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
                    : calcData.bufferRating === 'moderate'
                    ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
                    : 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400'
                }`}>
                  {calcData.betaPercentOfMax.toFixed(0)}% of Max β
                </span>
              </div>

              {/* Progress Bar of β vs max β */}
              <div className="space-y-1">
                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                  <div
                    className={`h-full transition-all duration-300 ${
                      calcData.bufferRating === 'optimal'
                        ? 'bg-emerald-500'
                        : calcData.bufferRating === 'moderate'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, calcData.betaPercentOfMax))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0 mol/(L·pH)</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    β = {formatNumber(calcData.bufferCapacityBeta, 4)} mol/(L·pH)
                  </span>
                  <span>Max = {formatNumber(calcData.maxBeta, 4)}</span>
                </div>
              </div>

              {/* Range alert */}
              <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                calcData.bufferRating === 'optimal'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40'
                  : calcData.bufferRating === 'moderate'
                  ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/40'
                  : 'bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/40'
              }`}>
                {calcData.bufferRating === 'optimal' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span>{calcData.bufferRatingText}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Calculated Results & SOP Recipe (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {calcData ? (
            <>
              {/* Primary Quantities to Weigh Box */}
              <div className="p-5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-900/60 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    Exact Weighing & Recipe Quantities
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200">
                    {calcData.vol_mL} mL @ {calcData.cTotal_mM} mM
                  </span>
                </div>

                {prepMode === 'conjugate-pair' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Component 1: Base Salt */}
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-900/40 shadow-xs space-y-2">
                      <div className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                        Conjugate Base [A⁻] ({((calcData.fractionBase) * 100).toFixed(1)}%)
                      </div>
                      <div className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                        {formatNumber(calcData.massBase_g, 4)} <span className="text-base font-normal text-slate-500">g</span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                        {activePreset.baseName}
                      </div>
                      <div className="text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-1.5 flex justify-between">
                        <span>MW: {activePreset.baseMw} g/mol</span>
                        <span>Conc: {formatNumber(calcData.concBase_mM, 2)} mM</span>
                      </div>
                    </div>

                    {/* Component 2: Weak Acid */}
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-900/40 shadow-xs space-y-2">
                      <div className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                        Weak Acid [HA] ({((calcData.fractionAcid) * 100).toFixed(1)}%)
                      </div>
                      <div className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                        {activePreset.acidIsLiquid && calcData.volAcid_mL !== null ? (
                          <>
                            {formatNumber(calcData.volAcid_mL, 3)} <span className="text-base font-normal text-slate-500">mL</span>
                            <span className="text-xs font-normal text-slate-400 ml-2">({formatNumber(calcData.massAcid_g, 3)} g)</span>
                          </>
                        ) : (
                          <>
                            {formatNumber(calcData.massAcid_g, 4)} <span className="text-base font-normal text-slate-500">g</span>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                        {activePreset.acidName}
                      </div>
                      <div className="text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-1.5 flex justify-between">
                        <span>MW: {activePreset.acidMw} g/mol</span>
                        <span>Conc: {formatNumber(calcData.concAcid_mM, 2)} mM</span>
                      </div>
                    </div>
                  </div>
                ) : prepMode === 'acid-titrate' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-900/40 shadow-xs space-y-2">
                      <div className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                        Total Acid Required
                      </div>
                      <div className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                        {formatNumber(calcData.massTotalAcidForTitration_g, 4)} <span className="text-base font-normal text-slate-500">g</span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                        {activePreset.acidName}
                      </div>
                      <div className="text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-1.5">
                        Dissolve in ~{Math.round(calcData.vol_mL * 0.8)} mL water
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-900/40 shadow-xs space-y-2">
                      <div className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                        NaOH Titrant to pH {calcData.ph.toFixed(2)}
                      </div>
                      <div className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                        ~{formatNumber(calcData.volTitrantBase_mL, 2)} <span className="text-base font-normal text-slate-500">mL</span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                        {calcData.titrantM} M Sodium Hydroxide (NaOH)
                      </div>
                      <div className="text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-1.5">
                        Moles OH⁻: {formatNumber(calcData.molesBase, 5)} mol
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-900/40 shadow-xs space-y-2">
                      <div className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                        Total Base Required
                      </div>
                      <div className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                        {formatNumber(calcData.massTotalBaseForTitration_g, 4)} <span className="text-base font-normal text-slate-500">g</span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                        {activePreset.baseName}
                      </div>
                      <div className="text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-1.5">
                        Dissolve in ~{Math.round(calcData.vol_mL * 0.8)} mL water
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-900/40 shadow-xs space-y-2">
                      <div className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                        HCl Titrant to pH {calcData.ph.toFixed(2)}
                      </div>
                      <div className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                        ~{formatNumber(calcData.volTitrantAcid_mL, 2)} <span className="text-base font-normal text-slate-500">mL</span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                        {calcData.titrantM} M Hydrochloric Acid (HCl)
                      </div>
                      <div className="text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-1.5">
                        Moles H⁺: {formatNumber(calcData.molesAcid, 5)} mol
                      </div>
                    </div>
                  </div>
                )}

                {/* Henderson-Hasselbalch Breakdown Strip */}
                <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-teal-100 dark:border-teal-900/30 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">Henderson-Hasselbalch Ratio:</span>
                    <span className="font-mono bg-teal-100/60 dark:bg-teal-900/50 px-2 py-0.5 rounded text-teal-800 dark:text-teal-200 font-bold">
                      [A⁻] / [HA] = {formatNumber(calcData.ratioBaseToAcid, 4)}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    pH ({calcData.ph.toFixed(2)}) = pKa ({calcData.effectivePka.toFixed(2)}) + log₁₀({formatNumber(calcData.ratioBaseToAcid, 3)})
                  </div>
                </div>
              </div>

              {/* Printable SOP Recipe Component */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-teal-500" />
                    Standard Operating Procedure (SOP) Recipe
                  </span>
                  <button
                    onClick={handleCopyRecipe}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copied Recipe!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy SOP Protocol
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/60 dark:border-slate-800 font-mono text-[11px] leading-relaxed text-slate-800 dark:text-slate-200 overflow-x-auto whitespace-pre-wrap max-h-72">
                  {recipeText}
                </pre>
              </div>

              {/* Mathematical & Pharmacopoeia Reference */}
              <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  Analytical Principles & Mathematical Basis:
                </div>
                <div className="leading-relaxed">
                  • <strong>Henderson-Hasselbalch Equation:</strong> pH = pKₐ + log₁₀([A⁻]/[HA]). For maximum buffer capacity (β = 0.576 · C_total), formulate buffers within ±1.0 pH unit of the pKa.
                </div>
                <div className="leading-relaxed">
                  • <strong>Van Slyke Buffer Capacity:</strong> β = 2.303 · C_total · ( [HA] · [A⁻] / C_total² ). Quantifies the resistance of the solution to pH changes upon addition of strong acid or base.
                </div>
                <div className="leading-relaxed">
                  • <strong>Temperature Coefficient:</strong> Amine-based buffers (such as Tris) have significant temperature coefficients (dpKa/dT ≈ -0.028 / °C). Always calibrate and measure pH at the intended operating temperature.
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500">
              Please enter valid numerical parameters to generate buffer formulations.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
