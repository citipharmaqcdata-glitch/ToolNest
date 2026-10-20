import { useState, useMemo } from 'react';
import {
  Microscope,
  RotateCcw,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  TrendingUp,
  BarChart2,
  Gauge,
  Layers,
  Activity
} from 'lucide-react';
import { copyToClipboard, formatNumber } from '../../utils/formatters';

interface HplcPreset {
  name: string;
  description: string;
  tr1: number;
  w1: number; // baseline or w0.5
  tr2: number;
  w2: number;
  t0: number;
  widthType: 'baseline' | 'halfHeight';
  columnLengthMm: number;
  columnIdMm: number;
  particleSizeUm: number;
  flowRateMlMin: number;
}

const HPLC_PRESETS: HplcPreset[] = [
  {
    name: 'Paracetamol & 4-Aminophenol (USP SST)',
    description: 'Typical USP system suitability test on C18 150 × 4.6 mm, 5 µm column at 1.0 mL/min.',
    tr1: 3.45,
    w1: 0.18,
    tr2: 4.82,
    w2: 0.22,
    t0: 1.15,
    widthType: 'baseline',
    columnLengthMm: 150,
    columnIdMm: 4.6,
    particleSizeUm: 5.0,
    flowRateMlMin: 1.0
  },
  {
    name: 'Ibuprofen & Related Substance A',
    description: 'Reverse phase isocratic method separating active ingredient from closely eluting degradation product.',
    tr1: 6.20,
    w1: 0.28,
    tr2: 7.15,
    w2: 0.31,
    t0: 1.40,
    widthType: 'baseline',
    columnLengthMm: 150,
    columnIdMm: 4.6,
    particleSizeUm: 5.0,
    flowRateMlMin: 1.2
  },
  {
    name: 'Caffeine & Theophylline (Half-Height Method)',
    description: 'Xanthine derivatives separated on C18 column evaluated using half-height peak widths (W0.5).',
    tr1: 2.80,
    w1: 0.10,
    tr2: 3.90,
    w2: 0.13,
    t0: 0.85,
    widthType: 'halfHeight',
    columnLengthMm: 100,
    columnIdMm: 3.0,
    particleSizeUm: 3.0,
    flowRateMlMin: 0.6
  },
  {
    name: 'Fast UHPLC Separation (Sub-2µm)',
    description: 'High throughput screening on 50 × 2.1 mm, 1.8 µm column running at high linear velocity.',
    tr1: 0.95,
    w1: 0.045,
    tr2: 1.42,
    w2: 0.060,
    t0: 0.32,
    widthType: 'halfHeight',
    columnLengthMm: 50,
    columnIdMm: 2.1,
    particleSizeUm: 1.8,
    flowRateMlMin: 0.5
  }
];

export default function HplcResolutionCalculator() {
  const [activeTab, setActiveTab] = useState<'resolution' | 'symmetry' | 'column'>('resolution');

  // Tab 1: Resolution Parameters
  const [tr1Str, setTr1Str] = useState<string>('3.45');
  const [tr2Str, setTr2Str] = useState<string>('4.82');
  const [w1Str, setW1Str] = useState<string>('0.18');
  const [w2Str, setW2Str] = useState<string>('0.22');
  const [t0Str, setT0Str] = useState<string>('1.15');
  const [peakWidthType, setPeakWidthType] = useState<'baseline' | 'halfHeight'>('baseline');

  // Tab 2: Symmetry & Tailing Parameters
  const [frontDistA, setFrontDistA] = useState<string>('0.10'); // Distance from front to midpoint (min)
  const [backDistB, setBackDistB] = useState<string>('0.12'); // Distance from midpoint to back (min)
  const [symmetryHeightPercent, setSymmetryHeightPercent] = useState<'5' | '10'>('5'); // 5% for USP Tailing, 10% for Asymmetry

  // Tab 3: Column Geometry & Fluidics
  const [columnLength, setColumnLength] = useState<string>('150'); // mm
  const [columnId, setColumnId] = useState<string>('4.6'); // mm
  const [particleSize, setParticleSize] = useState<string>('5.0'); // µm
  const [flowRate, setFlowRate] = useState<string>('1.0'); // mL/min
  const [solventViscosity, setSolventViscosity] = useState<string>('1.0'); // cP (1 cP ~ water, 0.37 cP ACN, 0.8-1.2 cP mixtures)

  const [copied, setCopied] = useState<boolean>(false);

  // Apply preset
  const handleApplyPreset = (preset: HplcPreset) => {
    setTr1Str(preset.tr1.toString());
    setTr2Str(preset.tr2.toString());
    setW1Str(preset.w1.toString());
    setW2Str(preset.w2.toString());
    setT0Str(preset.t0.toString());
    setPeakWidthType(preset.widthType);
    setColumnLength(preset.columnLengthMm.toString());
    setColumnId(preset.columnIdMm.toString());
    setParticleSize(preset.particleSizeUm.toString());
    setFlowRate(preset.flowRateMlMin.toString());
  };

  // Reset tool
  const handleReset = () => {
    handleApplyPreset(HPLC_PRESETS[0]);
    setFrontDistA('0.10');
    setBackDistB('0.12');
    setSymmetryHeightPercent('5');
    setSolventViscosity('1.0');
  };

  // --- Calculations for Tab 1: Resolution & SST ---
  const resData = useMemo(() => {
    const tr1 = parseFloat(tr1Str);
    const tr2 = parseFloat(tr2Str);
    const w1 = parseFloat(w1Str);
    const w2 = parseFloat(w2Str);
    const t0 = parseFloat(t0Str);

    if (isNaN(tr1) || isNaN(tr2) || isNaN(w1) || isNaN(w2) || isNaN(t0) || w1 <= 0 || w2 <= 0 || tr2 <= tr1) {
      return null;
    }

    // Capacity factors k' = (tr - t0) / t0
    const k1 = t0 > 0 ? (tr1 - t0) / t0 : 0;
    const k2 = t0 > 0 ? (tr2 - t0) / t0 : 0;

    // Selectivity factor alpha = k2 / k1 = (tr2 - t0) / (tr1 - t0)
    const alpha = k1 > 0 ? k2 / k1 : 1;

    // Resolution Rs:
    // Baseline method: Rs = 2 * (tr2 - tr1) / (w1 + w2)
    // Half-height method: Rs = 1.177 * (tr2 - tr1) / (w0.5_1 + w0.5_2)
    let rs = 0;
    let n1 = 0;
    let n2 = 0;

    if (peakWidthType === 'baseline') {
      rs = (2 * (tr2 - tr1)) / (w1 + w2);
      n1 = 16 * Math.pow(tr1 / w1, 2);
      n2 = 16 * Math.pow(tr2 / w2, 2);
    } else {
      rs = (1.177 * (tr2 - tr1)) / (w1 + w2);
      n1 = 5.545 * Math.pow(tr1 / w1, 2);
      n2 = 5.545 * Math.pow(tr2 / w2, 2);
    }

    // USP SST Pass / Fail criteria
    // USP <621> states baseline resolution between critical pairs generally requires Rs >= 1.5,
    // and rugged QC validation typically targets Rs >= 2.0.
    let status: 'excellent' | 'pass' | 'marginal' | 'fail';
    let statusLabel: string;
    let statusDesc: string;

    if (rs >= 2.0) {
      status = 'excellent';
      statusLabel = 'Excellent Resolution (Rs ≥ 2.0)';
      statusDesc = 'Exceeds pharmacopoeial requirement with complete baseline separation and robust method ruggedness.';
    } else if (rs >= 1.5) {
      status = 'pass';
      statusLabel = 'USP Baseline Resolved (1.5 ≤ Rs < 2.0)';
      statusDesc = 'Meets official USP <621> / Ph.Eur. criterion for baseline separation (overlap < 0.1%).';
    } else if (rs >= 1.0) {
      status = 'marginal';
      statusLabel = 'Marginal / Inadequate (1.0 ≤ Rs < 1.5)';
      statusDesc = 'Peaks overlap significantly (~2–5%). Quantitative integration errors and valley baseline issues likely.';
    } else {
      status = 'fail';
      statusLabel = 'Failed Separation (Rs < 1.0)';
      statusDesc = 'Severe peak co-elution. Method does not meet system suitability requirements.';
    }

    return {
      tr1,
      tr2,
      w1,
      w2,
      t0,
      k1,
      k2,
      alpha,
      rs,
      n1,
      n2,
      status,
      statusLabel,
      statusDesc
    };
  }, [tr1Str, tr2Str, w1Str, w2Str, t0Str, peakWidthType]);

  // --- Calculations for Tab 2: Symmetry & Tailing ---
  const symmetryData = useMemo(() => {
    const a = parseFloat(frontDistA);
    const b = parseFloat(backDistB);

    if (isNaN(a) || isNaN(b) || a <= 0 || b <= 0) {
      return null;
    }

    // USP Tailing Factor T at 5% height: T = (a + b) / (2 * a)
    const tailingFactorT = (a + b) / (2 * a);

    // Asymmetry Factor As at 10% height: As = b / a
    const asymmetryFactorAs = b / a;

    // USP specification: usually 0.8 <= T <= 1.8 (or ideal 0.95 - 1.20)
    let diag: 'ideal' | 'acceptable' | 'tailing' | 'severe-tailing' | 'fronting';
    let diagLabel: string;
    let diagDesc: string;

    if (tailingFactorT < 0.8) {
      diag = 'fronting';
      diagLabel = 'Severe Fronting (T < 0.80)';
      diagDesc = 'Peak shows leading front edge. Causes: Column overload (mass overload), severe solvent mismatch, or void at column inlet.';
    } else if (tailingFactorT >= 0.95 && tailingFactorT <= 1.15) {
      diag = 'ideal';
      diagLabel = 'Ideal Symmetric Peak (0.95 ≤ T ≤ 1.15)';
      diagDesc = 'Near perfect Gaussian peak shape. Compliant with all international pharmacopoeias.';
    } else if (tailingFactorT <= 1.5) {
      diag = 'acceptable';
      diagLabel = 'Acceptable Symmetry (1.15 < T ≤ 1.50)';
      diagDesc = 'Standard QC acceptable threshold for complex pharmaceutical APIs and excipients.';
    } else if (tailingFactorT <= 1.8) {
      diag = 'tailing';
      diagLabel = 'Moderate Tailing (1.50 < T ≤ 1.80)';
      diagDesc = 'High tailing. Approaches the maximum allowable limit of USP <621> (T ≤ 2.0 or 1.8). Check silanol activity or pH.';
    } else {
      diag = 'severe-tailing';
      diagLabel = 'Failed / Severe Tailing (T > 1.80)';
      diagDesc = 'Exceeds acceptable analytical QC limits. Possible secondary interactions with unreacted silanol groups, column degradation, or metal chelation.';
    }

    return {
      a,
      b,
      tailingFactorT,
      asymmetryFactorAs,
      diag,
      diagLabel,
      diagDesc
    };
  }, [frontDistA, backDistB]);

  // --- Calculations for Tab 3: Column Fluidics & Pressure ---
  const columnData = useMemo(() => {
    const l = parseFloat(columnLength); // mm
    const id = parseFloat(columnId); // mm
    const dp = parseFloat(particleSize); // µm
    const f = parseFloat(flowRate); // mL/min
    const eta = parseFloat(solventViscosity); // cP

    if (isNaN(l) || isNaN(id) || isNaN(dp) || isNaN(f) || l <= 0 || id <= 0 || dp <= 0 || f <= 0) {
      return null;
    }

    // Column cylinder volume: Vc = pi * r^2 * L = pi * (id/2)^2 * L / 1000 (in mL)
    const radiusCm = (id / 10) / 2;
    const lengthCm = l / 10;
    const colVolMl = Math.PI * Math.pow(radiusCm, 2) * lengthCm;

    // Total porosity for packed silica C18 column epsilon_total ≈ 0.68
    const epsilonTotal = 0.68;
    const voidVolumeMl = colVolMl * epsilonTotal;

    // Dead time t0 = V0 / F (min)
    const estDeadTimeMin = voidVolumeMl / f;

    // Linear mobile phase velocity u = L / (t0 * 60) (mm/s)
    const linearVelocityMmS = l / (estDeadTimeMin * 60);

    // Darcy's / Kozeny-Carman pressure drop estimation:
    // DeltaP = (phi * eta * L * u) / (dp^2)
    // where phi ≈ 1000 for standard spherical packed beds
    // Pressure in bar ≈ (1000 * (eta / 1000 Pa*s) * (L/1000 m) * (u/1000 m/s)) / ( (dp * 1e-6)^2 ) / 1e5
    // Simplified standard HPLC formula:
    // Delta P (bar) ≈ (f * eta * L) / (id^2 * dp^2) * 550 (approx empirical constant)
    const estPressureBar = (f * eta * l * 550) / (Math.pow(id, 2) * Math.pow(dp, 2));
    const estPressurePsi = estPressureBar * 14.5038;

    return {
      colVolMl,
      voidVolumeMl,
      estDeadTimeMin,
      linearVelocityMmS,
      estPressureBar,
      estPressurePsi,
      l,
      id,
      dp,
      f
    };
  }, [columnLength, columnId, particleSize, flowRate, solventViscosity]);

  // Copy report
  const handleCopyReport = async () => {
    if (!resData) return;
    const report = `HPLC CHROMATOGRAPHIC SUITABILITY REPORT
===================================================
Peak 1 Retention Time (tr1): ${resData.tr1.toFixed(2)} min
Peak 1 Width (${peakWidthType}): ${resData.w1.toFixed(3)} min
Peak 1 Capacity Factor (k'1): ${resData.k1.toFixed(2)}
Peak 1 Theoretical Plates (N1): ${Math.round(resData.n1).toLocaleString()} plates

Peak 2 Retention Time (tr2): ${resData.tr2.toFixed(2)} min
Peak 2 Width (${peakWidthType}): ${resData.w2.toFixed(3)} min
Peak 2 Capacity Factor (k'2): ${resData.k2.toFixed(2)}
Peak 2 Theoretical Plates (N2): ${Math.round(resData.n2).toLocaleString()} plates

Void Time (t0): ${resData.t0.toFixed(2)} min
Selectivity Factor (α = k'2 / k'1): ${resData.alpha.toFixed(3)}
USP Chromatographic Resolution (Rs): ${resData.rs.toFixed(2)}
System Suitability Evaluation: ${resData.statusLabel}
${resData.statusDesc}

${symmetryData ? `PEAK SHAPE & SYMMETRY:
- USP Tailing Factor (T at 5% height): ${symmetryData.tailingFactorT.toFixed(3)}
- Asymmetry Factor (As at 10% height): ${symmetryData.asymmetryFactorAs.toFixed(3)}
- Classification: ${symmetryData.diagLabel}
` : ''}
${columnData ? `COLUMN DIMENSIONS & FLUIDICS:
- Column: ${columnData.l} × ${columnData.id} mm, ${columnData.dp} µm
- Void Volume (V0): ${columnData.voidVolumeMl.toFixed(2)} mL
- Linear Velocity (u): ${columnData.linearVelocityMmS.toFixed(2)} mm/s
- Est. Backpressure: ~${Math.round(columnData.estPressureBar)} bar (~${Math.round(columnData.estPressurePsi)} psi)
` : ''}
Standards Reference: USP <621> / European Pharmacopoeia 2.2.46 Chromatography
`;
    const success = await copyToClipboard(report);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Generate points for the live chromatogram SVG
  const chromatogramSvg = useMemo(() => {
    if (!resData) return null;
    const { tr1, tr2, w1, w2, t0 } = resData;

    // Chart scale: x-axis from 0 to tr2 + w2 * 2.5
    const minX = 0;
    const maxX = Math.max(tr2 + w2 * 3, 6);
    const svgWidth = 600;
    const svgHeight = 220;
    const padding = { left: 40, right: 30, top: 30, bottom: 35 };
    const chartW = svgWidth - padding.left - padding.right;
    const chartH = svgHeight - padding.top - padding.bottom;

    const scaleX = (val: number) => padding.left + ((val - minX) / (maxX - minX)) * chartW;
    const scaleY = (val: number) => padding.top + chartH - val * chartH;

    // Peak 1 Gaussian parameters: height = 0.85, sigma = w / 4 (baseline) or w / 2.355 (half-height)
    const sigma1 = peakWidthType === 'baseline' ? w1 / 4 : w1 / 2.355;
    const height1 = 0.85;

    // Peak 2 Gaussian parameters: height = 0.72, sigma = w / 4 or w / 2.355
    const sigma2 = peakWidthType === 'baseline' ? w2 / 4 : w2 / 2.355;
    const height2 = 0.72;

    // Compute curve path
    const numSamples = 200;
    const pathPoints: [number, number][] = [];
    for (let i = 0; i <= numSamples; i++) {
      const t = minX + (i / numSamples) * (maxX - minX);
      const g1 = height1 * Math.exp(-0.5 * Math.pow((t - tr1) / sigma1, 2));
      const g2 = height2 * Math.exp(-0.5 * Math.pow((t - tr2) / sigma2, 2));
      const yVal = Math.min(1.0, g1 + g2);
      pathPoints.push([scaleX(t), scaleY(yVal)]);
    }

    const pathD = pathPoints.map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`).join(' ');
    const areaD = `${pathD} L ${scaleX(maxX).toFixed(1)} ${scaleY(0).toFixed(1)} L ${scaleX(minX).toFixed(1)} ${scaleY(0).toFixed(1)} Z`;

    return {
      svgWidth,
      svgHeight,
      padding,
      chartW,
      chartH,
      scaleX,
      scaleY,
      pathD,
      areaD,
      tr1X: scaleX(tr1),
      tr2X: scaleX(tr2),
      t0X: scaleX(t0),
      tr1Y: scaleY(height1),
      tr2Y: scaleY(height2),
      baselineY: scaleY(0),
      halfHeight1Y: scaleY(height1 / 2),
      halfHeight2Y: scaleY(height2 / 2),
      w1HalfLeft: scaleX(tr1 - w1 / 2),
      w1HalfRight: scaleX(tr1 + w1 / 2),
      w2HalfLeft: scaleX(tr2 - w2 / 2),
      w2HalfRight: scaleX(tr2 + w2 / 2),
      maxX
    };
  }, [resData, peakWidthType]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <Microscope className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
              HPLC Column & Chromatographic Resolution
              <span className="text-xs px-2 py-0.5 rounded-full font-sans font-medium bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300">
                Phase 5 Release
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              USP &lt;621&gt; / EP 2.2.46 System Suitability: Resolution (Rs), selectivity (α), theoretical plates (N), asymmetry & tailing factors.
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

      {/* Preset Buttons */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-teal-500" />
          Quick Pharmacopoeial System Suitability Presets:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {HPLC_PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(p)}
              className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-teal-50/40 dark:hover:bg-teal-950/20 transition-all text-xs"
            >
              <div className="font-semibold text-slate-900 dark:text-white truncate">{p.name}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                {p.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('resolution')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'resolution'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          Two-Peak Resolution (Rs) & SST
        </button>
        <button
          onClick={() => setActiveTab('symmetry')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'symmetry'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          Peak Tailing & Asymmetry
        </button>
        <button
          onClick={() => setActiveTab('column')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'column'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Gauge className="w-4 h-4" />
          Column Geometry & Backpressure
        </button>
      </div>

      {/* TAB 1: RESOLUTION & SYSTEM SUITABILITY */}
      {activeTab === 'resolution' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Inputs (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Peak Measurements
                </span>

                {/* Width mode selector */}
                <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[11px] font-medium">
                  <button
                    type="button"
                    onClick={() => setPeakWidthType('baseline')}
                    className={`px-2 py-1 rounded-md transition-all ${
                      peakWidthType === 'baseline'
                        ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Baseline (W)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeakWidthType('halfHeight')}
                    className={`px-2 py-1 rounded-md transition-all ${
                      peakWidthType === 'halfHeight'
                        ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Half-Height (W₀.₅)
                  </button>
                </div>
              </div>

              {/* Peak 1 */}
              <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-2.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Peak 1 (Preceding Analyte)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Retention Time (t_r1, min)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={tr1Str}
                      onChange={(e) => setTr1Str(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      {peakWidthType === 'baseline' ? 'Baseline Width W₁ (min)' : 'Half-Height Width W₀.₅,₁ (min)'}
                    </label>
                    <input
                      type="number"
                      step="0.005"
                      min="0.001"
                      value={w1Str}
                      onChange={(e) => setW1Str(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Peak 2 */}
              <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-2.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Peak 2 (Trailing Analyte)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Retention Time (t_r2, min)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={tr2Str}
                      onChange={(e) => setTr2Str(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      {peakWidthType === 'baseline' ? 'Baseline Width W₂ (min)' : 'Half-Height Width W₀.₅,₂ (min)'}
                    </label>
                    <input
                      type="number"
                      step="0.005"
                      min="0.001"
                      value={w2Str}
                      onChange={(e) => setW2Str(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Void / Dead Time (t0) */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Column Void / Dead Time (t₀, min)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={t0Str}
                  onChange={(e) => setT0Str(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  Time of unretained peak (e.g., uracil, sodium nitrate, or solvent front).
                </p>
              </div>
            </div>

            {/* Formula Reference Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                USP &lt;621&gt; Resolution Formulas:
              </div>
              <div className="font-mono text-[11px] text-teal-700 dark:text-teal-300">
                {peakWidthType === 'baseline'
                  ? 'Rs = 2 · (tr2 - tr1) / (W1 + W2)'
                  : 'Rs = 1.177 · (tr2 - tr1) / (W0.5,1 + W0.5,2)'}
              </div>
              <div className="font-mono text-[11px] text-teal-700 dark:text-teal-300">
                Selectivity: α = k\'₂ / k\'₁ = (tr2 - t0) / (tr1 - t0)
              </div>
              <div className="font-mono text-[11px] text-teal-700 dark:text-teal-300">
                Capacity factor: k\' = (tr - t0) / t0
              </div>
            </div>
          </div>

          {/* Right Column: Calculated Resolution, Status & Chromatogram Chart (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {resData ? (
              <>
                {/* Resolution Verdict Banner */}
                <div className={`p-5 rounded-2xl border shadow-sm space-y-3 ${
                  resData.status === 'excellent' || resData.status === 'pass'
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60'
                    : resData.status === 'marginal'
                    ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60'
                    : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      {resData.status === 'excellent' || resData.status === 'pass' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      )}
                      System Suitability Resolution
                    </span>
                    <button
                      onClick={handleCopyReport}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg shadow-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied Report!' : 'Copy SST Report'}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-baseline gap-3">
                    <div className="text-4xl font-extrabold font-heading text-slate-900 dark:text-white">
                      Rs = {formatNumber(resData.rs, 2)}
                    </div>
                    <div className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      resData.status === 'excellent' || resData.status === 'pass'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                        : resData.status === 'marginal'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200'
                    }`}>
                      {resData.statusLabel}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {resData.statusDesc}
                  </p>
                </div>

                {/* Key Chromatographic Parameters Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Selectivity (α)
                    </div>
                    <div className="text-xl font-bold font-heading text-teal-600 dark:text-teal-400 mt-1">
                      {formatNumber(resData.alpha, 3)}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">k\'₂ / k\'₁</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Peak 1 Capacity (k\'₁)
                    </div>
                    <div className="text-xl font-bold font-heading text-slate-900 dark:text-white mt-1">
                      {formatNumber(resData.k1, 2)}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Optimum: 1 – 10</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Peak 2 Capacity (k\'₂)
                    </div>
                    <div className="text-xl font-bold font-heading text-slate-900 dark:text-white mt-1">
                      {formatNumber(resData.k2, 2)}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Optimum: 1 – 10</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Plates N₂
                    </div>
                    <div className="text-xl font-bold font-heading text-slate-900 dark:text-white mt-1">
                      {Math.round(resData.n2).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Theoretical plates</div>
                  </div>
                </div>

                {/* Live Chromatogram SVG Chart */}
                {chromatogramSvg && (
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-teal-500" />
                        Chromatogram Visualizer & Peak Elution Profile
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Δtr = {(resData.tr2 - resData.tr1).toFixed(2)} min
                      </span>
                    </div>

                    <div className="w-full overflow-hidden rounded-xl bg-slate-900 p-2 text-white">
                      <svg
                        viewBox={`0 0 ${chromatogramSvg.svgWidth} ${chromatogramSvg.svgHeight}`}
                        className="w-full h-auto select-none"
                      >
                        {/* Background Grid Lines */}
                        <line
                          x1={chromatogramSvg.padding.left}
                          y1={chromatogramSvg.baselineY}
                          x2={chromatogramSvg.svgWidth - chromatogramSvg.padding.right}
                          y2={chromatogramSvg.baselineY}
                          stroke="#334155"
                          strokeWidth="1.5"
                        />
                        <line
                          x1={chromatogramSvg.t0X}
                          y1={chromatogramSvg.padding.top}
                          x2={chromatogramSvg.t0X}
                          y2={chromatogramSvg.baselineY}
                          stroke="#f59e0b"
                          strokeDasharray="3 3"
                          strokeWidth="1"
                        />
                        <text
                          x={chromatogramSvg.t0X}
                          y={chromatogramSvg.padding.top - 5}
                          fill="#f59e0b"
                          fontSize="9"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          t₀ ({resData.t0.toFixed(2)}m)
                        </text>

                        {/* Peak 1 Retention Marker */}
                        <line
                          x1={chromatogramSvg.tr1X}
                          y1={chromatogramSvg.tr1Y}
                          x2={chromatogramSvg.tr1X}
                          y2={chromatogramSvg.baselineY}
                          stroke="#06b6d4"
                          strokeDasharray="2 2"
                          strokeWidth="1"
                        />
                        <text
                          x={chromatogramSvg.tr1X}
                          y={chromatogramSvg.tr1Y - 8}
                          fill="#38bdf8"
                          fontSize="10"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          Peak 1 ({resData.tr1.toFixed(2)}m)
                        </text>

                        {/* Peak 2 Retention Marker */}
                        <line
                          x1={chromatogramSvg.tr2X}
                          y1={chromatogramSvg.tr2Y}
                          x2={chromatogramSvg.tr2X}
                          y2={chromatogramSvg.baselineY}
                          stroke="#14b8a6"
                          strokeDasharray="2 2"
                          strokeWidth="1"
                        />
                        <text
                          x={chromatogramSvg.tr2X}
                          y={chromatogramSvg.tr2Y - 8}
                          fill="#2dd4bf"
                          fontSize="10"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          Peak 2 ({resData.tr2.toFixed(2)}m)
                        </text>

                        {/* Shaded Area under chromatogram curve */}
                        <path
                          d={chromatogramSvg.areaD}
                          fill="url(#peakGradient)"
                          opacity="0.35"
                        />

                        {/* Chromatogram Peak Curve */}
                        <path
                          d={chromatogramSvg.pathD}
                          fill="none"
                          stroke="#2dd4bf"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />

                        {/* Resolution measurement line between apexes */}
                        <line
                          x1={chromatogramSvg.tr1X}
                          y1={chromatogramSvg.padding.top + 15}
                          x2={chromatogramSvg.tr2X}
                          y2={chromatogramSvg.padding.top + 15}
                          stroke="#a855f7"
                          strokeWidth="1.5"
                        />
                        <circle cx={chromatogramSvg.tr1X} cy={chromatogramSvg.padding.top + 15} r="3" fill="#a855f7" />
                        <circle cx={chromatogramSvg.tr2X} cy={chromatogramSvg.padding.top + 15} r="3" fill="#a855f7" />
                        <text
                          x={(chromatogramSvg.tr1X + chromatogramSvg.tr2X) / 2}
                          y={chromatogramSvg.padding.top + 11}
                          fill="#c084fc"
                          fontSize="10"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          Rs = {resData.rs.toFixed(2)}
                        </text>

                        {/* X-axis labels */}
                        <text
                          x={chromatogramSvg.padding.left}
                          y={chromatogramSvg.baselineY + 16}
                          fill="#64748b"
                          fontSize="9"
                          textAnchor="start"
                        >
                          0 min
                        </text>
                        <text
                          x={chromatogramSvg.svgWidth - chromatogramSvg.padding.right}
                          y={chromatogramSvg.baselineY + 16}
                          fill="#64748b"
                          fontSize="9"
                          textAnchor="end"
                        >
                          {chromatogramSvg.maxX.toFixed(1)} min
                        </text>
                        <text
                          x={chromatogramSvg.svgWidth / 2}
                          y={chromatogramSvg.baselineY + 20}
                          fill="#94a3b8"
                          fontSize="10"
                          textAnchor="middle"
                        >
                          Retention Time (minutes)
                        </text>

                        {/* Gradients */}
                        <defs>
                          <linearGradient id="peakGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500">
                Please enter valid chromatogram peak measurements (tr2 must be greater than tr1).
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PEAK TAILING & ASYMMETRY */}
      {activeTab === 'symmetry' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-5">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Peak Symmetry & Shape Dimensions
              </span>

              {/* Height standard selection */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Pharmacopoeial Method
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setSymmetryHeightPercent('5')}
                    className={`py-1.5 px-3 rounded-lg text-center transition-all ${
                      symmetryHeightPercent === '5'
                        ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    USP Tailing T (at 5% height)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSymmetryHeightPercent('10')}
                    className={`py-1.5 px-3 rounded-lg text-center transition-all ${
                      symmetryHeightPercent === '10'
                        ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Asymmetry Factor As (at 10%)
                  </button>
                </div>
              </div>

              {/* Distances a and b */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Front Half-Width a (min)
                  </label>
                  <input
                    type="number"
                    step="0.005"
                    min="0.001"
                    value={frontDistA}
                    onChange={(e) => setFrontDistA(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Leading edge to apex center line</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Back Half-Width b (min)
                  </label>
                  <input
                    type="number"
                    step="0.005"
                    min="0.001"
                    value={backDistB}
                    onChange={(e) => setBackDistB(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Apex center line to trailing edge</p>
                </div>
              </div>

              {/* Explanatory diagram guidance */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <span className="font-semibold text-slate-800 dark:text-slate-200">How to measure:</span>
                <p>
                  Drop a vertical perpendicular line from the peak maximum down to baseline. Measure distance <em>a</em> (front edge to line) and <em>b</em> (line to rear edge) at 5% of peak height (USP &lt;621&gt;) or 10% height (EP).
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-5">
            {symmetryData ? (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Peak Shape & Symmetry Evaluation
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      USP Tailing Factor (T at 5%)
                    </div>
                    <div className="text-3xl font-bold font-heading text-slate-900 dark:text-white mt-1">
                      {formatNumber(symmetryData.tailingFactorT, 3)}
                    </div>
                    <div className="text-[11px] font-mono text-teal-600 dark:text-teal-400 mt-1">
                      T = (a + b) / (2 · a)
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Target: 0.80 ≤ T ≤ 1.50 (USP max ≤ 1.80)
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Asymmetry Factor (As at 10%)
                    </div>
                    <div className="text-3xl font-bold font-heading text-slate-900 dark:text-white mt-1">
                      {formatNumber(symmetryData.asymmetryFactorAs, 3)}
                    </div>
                    <div className="text-[11px] font-mono text-teal-600 dark:text-teal-400 mt-1">
                      As = b / a
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Ideal Gaussian: 1.00
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                  symmetryData.diag === 'ideal' || symmetryData.diag === 'acceptable'
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 text-amber-800 dark:text-amber-300'
                }`}>
                  {symmetryData.diag === 'ideal' || symmetryData.diag === 'acceptable' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold text-sm">{symmetryData.diagLabel}</div>
                    <div className="text-xs mt-1 leading-relaxed opacity-90">{symmetryData.diagDesc}</div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* TAB 3: COLUMN FLUIDICS & BACKPRESSURE */}
      {activeTab === 'column' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-5">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Column Dimensions & Operating Conditions
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Length (L, mm)
                  </label>
                  <input
                    type="number"
                    step="10"
                    min="10"
                    value={columnLength}
                    onChange={(e) => setColumnLength(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Internal Diameter (ID, mm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    value={columnId}
                    onChange={(e) => setColumnId(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Particle Size (dp, µm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={particleSize}
                    onChange={(e) => setParticleSize(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Flow Rate (F, mL/min)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.05"
                    value={flowRate}
                    onChange={(e) => setFlowRate(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Phase Viscosity (η, cP)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  value={solventViscosity}
                  onChange={(e) => setSolventViscosity(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[
                    { label: 'Water (1.0 cP)', val: '1.0' },
                    { label: 'ACN:Water 50:50 (0.8 cP)', val: '0.8' },
                    { label: 'MeOH:Water 50:50 (1.6 cP)', val: '1.6' },
                    { label: 'Pure ACN (0.37 cP)', val: '0.37' }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setSolventViscosity(preset.val)}
                      className={`text-[10px] px-2 py-0.5 rounded border ${
                        solventViscosity === preset.val
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-5">
            {columnData ? (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Hydrodynamic & Backpressure Estimates
                </span>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Estimated Dead Time (t₀)
                    </div>
                    <div className="text-2xl font-bold font-heading text-slate-900 dark:text-white mt-1">
                      {formatNumber(columnData.estDeadTimeMin, 2)} <span className="text-sm font-normal text-slate-500">min</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      At {columnData.f} mL/min
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Void Volume (V₀)
                    </div>
                    <div className="text-2xl font-bold font-heading text-slate-900 dark:text-white mt-1">
                      {formatNumber(columnData.voidVolumeMl, 2)} <span className="text-sm font-normal text-slate-500">mL</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Total cylinder volume: {formatNumber(columnData.colVolMl, 2)} mL
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Linear Velocity (u)
                    </div>
                    <div className="text-2xl font-bold font-heading text-slate-900 dark:text-white mt-1">
                      {formatNumber(columnData.linearVelocityMmS, 2)} <span className="text-sm font-normal text-slate-500">mm/s</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Through packed bed
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Estimated Backpressure (ΔP)
                    </div>
                    <div className="text-2xl font-bold font-heading text-teal-600 dark:text-teal-400 mt-1">
                      ~{Math.round(columnData.estPressureBar)} <span className="text-sm font-normal text-slate-500">bar</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      ~{Math.round(columnData.estPressurePsi)} psi
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/50 dark:border-teal-900/40 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-slate-900 dark:text-white">Note on Darcy Fluidics:</span> Column pressure scales inversely with the square of the particle size (dp⁻²). Reducing particle size from 5.0 µm to 1.8 µm increases pressure by approximately 7.7-fold at identical flow rate.
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
