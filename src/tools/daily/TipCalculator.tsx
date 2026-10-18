import { useState } from 'react';
import { Copy, RotateCcw, Check, Users, Receipt } from 'lucide-react';
import { copyToClipboard, formatNumber } from '../../utils/formatters';

const PRESET_TIPS = [10, 15, 18, 20, 25];

export default function TipCalculator() {
  const [billAmount, setBillAmount] = useState<string>('84.50');
  const [tipPercent, setTipPercent] = useState<number>(18);
  const [customTip, setCustomTip] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [splitCount, setSplitCount] = useState<number>(2);
  const [copied, setCopied] = useState<boolean>(false);

  const numBill = parseFloat(billAmount);
  const effectiveTipRate = isCustom ? (parseFloat(customTip) || 0) : tipPercent;

  let totalTip = 0;
  let totalBill = 0;
  let tipPerPerson = 0;
  let totalPerPerson = 0;

  if (!isNaN(numBill) && numBill >= 0 && splitCount > 0) {
    totalTip = (numBill * effectiveTipRate) / 100;
    totalBill = numBill + totalTip;
    tipPerPerson = totalTip / splitCount;
    totalPerPerson = totalBill / splitCount;
  }

  const handleCopy = async () => {
    const text = `Bill: $${formatNumber(numBill, 2)}, Tip (${effectiveTipRate}%): $${formatNumber(totalTip, 2)}, Total: $${formatNumber(totalBill, 2)} ($${formatNumber(totalPerPerson, 2)}/person for ${splitCount} people)`;
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleReset = () => {
    setBillAmount('50.00');
    setTipPercent(18);
    setIsCustom(false);
    setCustomTip('');
    setSplitCount(1);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Form Inputs */}
        <div className="md:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-heading font-semibold text-slate-900 dark:text-white text-base">
              Bill & Gratuity Details
            </h3>
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1.5 py-1 px-2.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Bill Amount ($)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm">$</span>
              <input
                type="number"
                step="any"
                value={billAmount}
                onChange={(e) => setBillAmount(e.target.value)}
                placeholder="50.00"
                className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Select Tip Percentage
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {PRESET_TIPS.map((rate) => (
                <button
                  key={rate}
                  onClick={() => {
                    setTipPercent(rate);
                    setIsCustom(false);
                  }}
                  className={`py-2 text-xs font-medium rounded-lg transition-all ${
                    !isCustom && tipPercent === rate
                      ? 'bg-teal-600 text-white shadow-xs font-semibold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {rate}%
                </button>
              ))}
              <button
                onClick={() => setIsCustom(true)}
                className={`py-2 text-xs font-medium rounded-lg transition-all ${
                  isCustom
                    ? 'bg-teal-600 text-white shadow-xs font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Custom
              </button>
            </div>
            {isCustom && (
              <div className="mt-2.5 relative">
                <input
                  type="number"
                  step="any"
                  value={customTip}
                  onChange={(e) => setCustomTip(e.target.value)}
                  placeholder="Enter custom tip %"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
                <span className="absolute right-3.5 top-2 text-slate-400 text-xs">%</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Split Between People
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSplitCount(Math.max(1, splitCount - 1))}
                className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-lg flex items-center justify-center transition-colors"
              >
                -
              </button>
              <div className="flex-1 text-center font-mono font-bold text-lg text-slate-900 dark:text-white flex items-center justify-center gap-2">
                <Users className="w-4 h-4 text-teal-600" />
                <span>{splitCount} {splitCount === 1 ? 'person' : 'people'}</span>
              </div>
              <button
                onClick={() => setSplitCount(splitCount + 1)}
                className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-lg flex items-center justify-center transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="md:col-span-6 bg-gradient-to-br from-slate-50 to-teal-50/30 dark:from-slate-900 dark:to-slate-800/60 p-6 rounded-2xl border border-teal-100/60 dark:border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span>Split Bill Breakdown</span>
              <span>{splitCount} {splitCount === 1 ? 'payer' : 'payers'}</span>
            </div>

            <div className="space-y-4">
              {/* Highlight Per Person */}
              <div className="p-4 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-teal-100 dark:border-teal-900/40">
                <div className="text-[11px] font-medium text-slate-400 uppercase">Total Per Person</div>
                <div className="text-3xl font-bold font-mono tracking-tight text-teal-600 dark:text-teal-400 tabular-nums mt-0.5">
                  ${formatNumber(totalPerPerson, 2)}
                </div>
                {splitCount > 1 && (
                  <div className="text-xs text-slate-500 mt-1">
                    Includes ${formatNumber(tipPerPerson, 2)} tip per person
                  </div>
                )}
              </div>

              {/* Grand Total Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-500">Base Bill:</span>
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200">${formatNumber(numBill || 0, 2)}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-500">Tip Amount ({effectiveTipRate}%):</span>
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200">+${formatNumber(totalTip, 2)}</span>
                </div>
                <div className="flex items-center justify-between py-2 text-sm font-semibold text-slate-900 dark:text-white">
                  <span>Grand Total:</span>
                  <span className="font-mono text-teal-600 dark:text-teal-400">${formatNumber(totalBill, 2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3">
            <button
              onClick={handleCopy}
              className="w-full py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Split Summary'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
