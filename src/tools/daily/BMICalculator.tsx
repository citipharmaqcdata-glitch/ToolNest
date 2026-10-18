import { useState } from 'react';
import { Copy, RotateCcw, Check, HeartPulse, Scale, Droplet, Info } from 'lucide-react';
import { copyToClipboard, formatNumber } from '../../utils/formatters';

type UnitSystem = 'metric' | 'imperial';
type Gender = 'male' | 'female';

export default function BMICalculator() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState<string>('28');

  // Metric inputs
  const [heightCm, setHeightCm] = useState<string>('175');
  const [weightKg, setWeightKg] = useState<string>('70');

  // Imperial inputs
  const [heightFt, setHeightFt] = useState<string>('5');
  const [heightIn, setHeightIn] = useState<string>('9');
  const [weightLbs, setWeightLbs] = useState<string>('154');

  const [copied, setCopied] = useState<boolean>(false);

  // Compute normalized height in meters and weight in kg
  let hMeters = 0;
  let wKg = 0;

  if (unitSystem === 'metric') {
    hMeters = (parseFloat(heightCm) || 0) / 100;
    wKg = parseFloat(weightKg) || 0;
  } else {
    const ft = parseFloat(heightFt) || 0;
    const inch = parseFloat(heightIn) || 0;
    const totalInches = ft * 12 + inch;
    hMeters = totalInches * 0.0254;
    wKg = (parseFloat(weightLbs) || 0) * 0.45359237;
  }

  // BMI Calculation
  const bmi = hMeters > 0 && wKg > 0 ? wKg / (hMeters * hMeters) : 0;

  // Category determination according to WHO criteria
  let category = 'Normal weight';
  let categoryColor = 'text-emerald-600 dark:text-emerald-400';
  let categoryBg = 'bg-emerald-500/10 border-emerald-500/20';

  if (bmi < 18.5) {
    category = 'Underweight';
    categoryColor = 'text-amber-600 dark:text-amber-400';
    categoryBg = 'bg-amber-500/10 border-amber-500/20';
  } else if (bmi < 25.0) {
    category = 'Normal weight';
    categoryColor = 'text-emerald-600 dark:text-emerald-400';
    categoryBg = 'bg-emerald-500/10 border-emerald-500/20';
  } else if (bmi < 30.0) {
    category = 'Overweight';
    categoryColor = 'text-orange-600 dark:text-orange-400';
    categoryBg = 'bg-orange-500/10 border-orange-500/20';
  } else if (bmi < 35.0) {
    category = 'Obesity Class I';
    categoryColor = 'text-rose-600 dark:text-rose-400';
    categoryBg = 'bg-rose-500/10 border-rose-500/20';
  } else {
    category = 'Obesity Class II/III';
    categoryColor = 'text-red-700 dark:text-red-400';
    categoryBg = 'bg-red-500/10 border-red-500/20';
  }

  // Normal weight range for this height
  const minNormalKg = hMeters > 0 ? 18.5 * (hMeters * hMeters) : 0;
  const maxNormalKg = hMeters > 0 ? 24.9 * (hMeters * hMeters) : 0;

  // Ideal Body Weight (Devine Clinical Formula)
  // Men: 50.0 kg + 2.3 kg per inch over 5 feet
  // Women: 45.5 kg + 2.3 kg per inch over 5 feet
  const totalHeightInches = hMeters / 0.0254;
  const inchesOver5Feet = Math.max(0, totalHeightInches - 60);
  const ibwDevineKg =
    gender === 'male' ? 50.0 + 2.3 * inchesOver5Feet : 45.5 + 2.3 * inchesOver5Feet;

  // Recommended Daily Water Intake (approx 35 mL per kg)
  const waterLiters = (wKg * 35) / 1000;

  // Gauge pointer percentage (15 to 40 BMI scale)
  const clampedBMI = Math.max(15, Math.min(40, bmi));
  const pointerPercent = ((clampedBMI - 15) / (40 - 15)) * 100;

  const handleReset = () => {
    setUnitSystem('metric');
    setGender('male');
    setAge('28');
    setHeightCm('175');
    setWeightKg('70');
    setHeightFt('5');
    setHeightIn('9');
    setWeightLbs('154');
  };

  const handleCopy = async () => {
    const text = `--- ToolNest BMI & Body Health Report ---
Unit System: ${unitSystem}
Height: ${unitSystem === 'metric' ? `${heightCm} cm` : `${heightFt}' ${heightIn}"`}
Weight: ${unitSystem === 'metric' ? `${weightKg} kg` : `${weightLbs} lbs`}

Results:
BMI: ${formatNumber(bmi, 1)} kg/m² (${category})
Healthy Weight Range (18.5 - 24.9): ${formatNumber(minNormalKg, 1)} kg - ${formatNumber(maxNormalKg, 1)} kg (${formatNumber(minNormalKg * 2.20462, 1)} - ${formatNumber(maxNormalKg * 2.20462, 1)} lbs)
Ideal Body Weight (Devine): ${formatNumber(ibwDevineKg, 1)} kg (${formatNumber(ibwDevineKg * 2.20462, 1)} lbs)
Recommended Daily Water Intake: ~${formatNumber(waterLiters, 1)} Liters / day`;

    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Parameter Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-heading font-semibold text-base text-slate-900 dark:text-white">
              Body Dimensions & Units
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Standard World Health Organization (WHO) body mass index calculator
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Unit Switcher */}
            <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center text-xs font-medium">
              <button
                onClick={() => setUnitSystem('metric')}
                className={`py-1 px-3 rounded-lg transition-colors ${
                  unitSystem === 'metric'
                    ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Metric (cm / kg)
              </button>
              <button
                onClick={() => setUnitSystem('imperial')}
                className={`py-1 px-3 rounded-lg transition-colors ${
                  unitSystem === 'imperial'
                    ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Imperial (ft / lbs)
              </button>
            </div>

            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 p-1.5 transition-colors"
              title="Reset values"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Biological Sex
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setGender('male')}
                className={`py-2 text-xs font-medium rounded-xl border transition-all ${
                  gender === 'male'
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Male
              </button>
              <button
                onClick={() => setGender('female')}
                className={`py-2 text-xs font-medium rounded-xl border transition-all ${
                  gender === 'female'
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Female
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Age (Years)
            </label>
            <input
              type="number"
              min="2"
              max="120"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              placeholder="28"
            />
          </div>

          {unitSystem === 'metric' ? (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  min="50"
                  max="260"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  placeholder="175"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  min="20"
                  max="350"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  placeholder="70"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Height (Feet & Inches)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="2"
                    max="8"
                    value={heightFt}
                    onChange={(e) => setHeightFt(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono"
                    placeholder="5 ft"
                  />
                  <input
                    type="number"
                    min="0"
                    max="11"
                    value={heightIn}
                    onChange={(e) => setHeightIn(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono"
                    placeholder="9 in"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  min="40"
                  max="700"
                  value={weightLbs}
                  onChange={(e) => setWeightLbs(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  placeholder="154"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Primary BMI Gauge & Category Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500 font-medium">Your Body Mass Index (BMI)</div>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-4xl sm:text-5xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
                {formatNumber(bmi, 1)}
              </span>
              <span className="text-sm font-medium text-slate-400">kg/m²</span>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-xl border ${categoryBg} ${categoryColor}`}
              >
                {category}
              </span>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="self-start sm:self-center px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Report'}
          </button>
        </div>

        {/* Visual BMI Gauge Range Bar */}
        <div className="space-y-2">
          <div className="relative pt-3 pb-1">
            {/* Visual Pointer Marker */}
            <div
              style={{ left: `${pointerPercent}%` }}
              className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-300"
            >
              <span className="text-[10px] font-bold font-mono text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-700 px-1 rounded shadow-2xs">
                {formatNumber(bmi, 1)}
              </span>
              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-slate-800 dark:border-t-white mt-0.5" />
            </div>

            {/* Segmented Gradient Bar */}
            <div className="h-3.5 w-full rounded-full overflow-hidden flex shadow-inner">
              <div className="w-[14%] bg-amber-400" title="Underweight (< 18.5)" />
              <div className="w-[26%] bg-emerald-500" title="Normal (18.5 - 24.9)" />
              <div className="w-[20%] bg-orange-400" title="Overweight (25 - 29.9)" />
              <div className="w-[20%] bg-rose-500" title="Obese Class I (30 - 34.9)" />
              <div className="w-[20%] bg-red-600" title="Obese Class II/III (35+)" />
            </div>
          </div>

          {/* Scale Labels */}
          <div className="flex justify-between text-[11px] text-slate-400 font-mono px-0.5">
            <span>&lt; 18.5</span>
            <span>18.5 - 24.9</span>
            <span>25 - 29.9</span>
            <span>30 - 34.9</span>
            <span>≥ 35</span>
          </div>
        </div>
      </div>

      {/* Auxiliary Body Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Healthy Weight Range */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Scale className="w-4 h-4 text-teal-600" />
            <span>Healthy Weight Range</span>
          </div>
          <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">
            {formatNumber(minNormalKg, 1)} – {formatNumber(maxNormalKg, 1)} kg
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {formatNumber(minNormalKg * 2.20462, 1)} – {formatNumber(maxNormalKg * 2.20462, 1)} lbs
          </div>
        </div>

        {/* Ideal Body Weight (Devine) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <HeartPulse className="w-4 h-4 text-emerald-600" />
            <span>Ideal Body Weight (IBW)</span>
          </div>
          <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">
            {formatNumber(ibwDevineKg, 1)} kg
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {formatNumber(ibwDevineKg * 2.20462, 1)} lbs (Devine formula)
          </div>
        </div>

        {/* Daily Water Needs */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Droplet className="w-4 h-4 text-cyan-600" />
            <span>Daily Water Intake</span>
          </div>
          <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">
            ~{formatNumber(waterLiters, 1)} Liters / day
          </div>
          <div className="text-[11px] text-slate-400">
            ~{Math.round(waterLiters * 4.2)} standard glasses (240 mL)
          </div>
        </div>
      </div>

      {/* Clinical Notes */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-800 dark:text-slate-200 font-medium">Clinical Context: </strong>
          BMI is a screening metric and does not directly measure body fat percentage, bone density, or muscle mass. Athletes and bodybuilders may have a higher BMI due to muscle without excess adiposity.
        </div>
      </div>
    </div>
  );
}
