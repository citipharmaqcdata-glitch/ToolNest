import { useState } from 'react';
import { Copy, RotateCcw, Check, ArrowRight } from 'lucide-react';
import { copyToClipboard, formatNumber } from '../../utils/formatters';

export default function PercentageCalculator() {
  const [tab, setTab] = useState<'of' | 'is-what' | 'change'>('of');
  const [copied, setCopied] = useState(false);

  // Tab 1: What is X% of Y?
  const [x1, setX1] = useState<string>('15');
  const [y1, setY1] = useState<string>('240');

  // Tab 2: X is what % of Y?
  const [x2, setX2] = useState<string>('45');
  const [y2, setY2] = useState<string>('180');

  // Tab 3: % Increase/Decrease from X to Y
  const [x3, setX3] = useState<string>('50');
  const [y3, setY3] = useState<string>('75');

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  // Calculation 1
  const numX1 = parseFloat(x1);
  const numY1 = parseFloat(y1);
  const res1 = !isNaN(numX1) && !isNaN(numY1) ? (numX1 / 100) * numY1 : null;

  // Calculation 2
  const numX2 = parseFloat(x2);
  const numY2 = parseFloat(y2);
  const res2 = !isNaN(numX2) && !isNaN(numY2) && numY2 !== 0 ? (numX2 / numY2) * 100 : null;

  // Calculation 3
  const numX3 = parseFloat(x3);
  const numY3 = parseFloat(y3);
  const diff3 = !isNaN(numX3) && !isNaN(numY3) ? numY3 - numX3 : null;
  const res3 = diff3 !== null && numX3 !== 0 ? (diff3 / Math.abs(numX3)) * 100 : null;

  const handleReset = () => {
    if (tab === 'of') {
      setX1('');
      setY1('');
    } else if (tab === 'is-what') {
      setX2('');
      setY2('');
    } else {
      setX3('');
      setY3('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Segmented Mode Selector */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl max-w-xl">
        <button
          onClick={() => setTab('of')}
          className={`flex-1 min-w-[140px] py-2 px-3 text-xs md:text-sm font-medium rounded-lg transition-all ${
            tab === 'of'
              ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          What is X% of Y?
        </button>
        <button
          onClick={() => setTab('is-what')}
          className={`flex-1 min-w-[140px] py-2 px-3 text-xs md:text-sm font-medium rounded-lg transition-all ${
            tab === 'is-what'
              ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          X is what % of Y?
        </button>
        <button
          onClick={() => setTab('change')}
          className={`flex-1 min-w-[140px] py-2 px-3 text-xs md:text-sm font-medium rounded-lg transition-all ${
            tab === 'change'
              ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          % Increase / Decrease
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Input Form */}
        <div className="md:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-heading font-semibold text-slate-900 dark:text-white text-base">
              {tab === 'of' && 'Calculate X% of a Number'}
              {tab === 'is-what' && 'Find What Percentage X is of Y'}
              {tab === 'change' && 'Calculate Percentage Growth or Decline'}
            </h3>
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1.5 py-1 px-2.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          {tab === 'of' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Percentage (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={x1}
                    onChange={(e) => setX1(e.target.value)}
                    placeholder="e.g. 15"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-mono text-sm"
                  />
                  <span className="absolute right-3.5 top-2.5 text-slate-400 text-sm">%</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Total Value (of Y)
                </label>
                <input
                  type="number"
                  step="any"
                  value={y1}
                  onChange={(e) => setY1(e.target.value)}
                  placeholder="e.g. 240"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-mono text-sm"
                />
              </div>
            </div>
          )}

          {tab === 'is-what' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Part Value (X)
                </label>
                <input
                  type="number"
                  step="any"
                  value={x2}
                  onChange={(e) => setX2(e.target.value)}
                  placeholder="e.g. 45"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Total Value (Y)
                </label>
                <input
                  type="number"
                  step="any"
                  value={y2}
                  onChange={(e) => setY2(e.target.value)}
                  placeholder="e.g. 180"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-mono text-sm"
                />
              </div>
            </div>
          )}

          {tab === 'change' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Initial Value (From X)
                </label>
                <input
                  type="number"
                  step="any"
                  value={x3}
                  onChange={(e) => setX3(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Final Value (To Y)
                </label>
                <input
                  type="number"
                  step="any"
                  value={y3}
                  onChange={(e) => setY3(e.target.value)}
                  placeholder="e.g. 75"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-mono text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-50 to-teal-50/30 dark:from-slate-900 dark:to-slate-800/60 p-6 rounded-2xl border border-teal-100/60 dark:border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span>Computed Output</span>
              <span>Formula: {tab === 'of' ? '(X ÷ 100) × Y' : tab === 'is-what' ? '(X ÷ Y) × 100' : '((Y - X) ÷ |X|) × 100'}</span>
            </div>

            {tab === 'of' && (
              <div className="space-y-3">
                <div className="text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
                  {res1 !== null ? formatNumber(res1, 4) : '—'}
                </div>
                {res1 !== null && (
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-semibold">{x1}%</span> of {y1} equals <span className="font-semibold text-teal-600 dark:text-teal-400">{formatNumber(res1, 4)}</span>
                  </p>
                )}
              </div>
            )}

            {tab === 'is-what' && (
              <div className="space-y-3">
                <div className="text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
                  {res2 !== null ? `${formatNumber(res2, 4)}%` : '—'}
                </div>
                {res2 !== null && (
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {x2} represents <span className="font-semibold text-teal-600 dark:text-teal-400">{formatNumber(res2, 4)}%</span> of {y2}
                  </p>
                )}
              </div>
            )}

            {tab === 'change' && (
              <div className="space-y-3">
                <div className={`text-3xl font-bold font-mono tracking-tight tabular-nums ${
                  res3 !== null && res3 > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : res3 !== null && res3 < 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-900 dark:text-white'
                }`}>
                  {res3 !== null ? `${res3 > 0 ? '+' : ''}${formatNumber(res3, 4)}%` : '—'}
                </div>
                {res3 !== null && (
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {res3 > 0 ? 'Increase of ' : res3 < 0 ? 'Decrease of ' : 'No change '}({diff3 !== null ? `${diff3 > 0 ? '+' : ''}${formatNumber(diff3, 4)}` : '0'} absolute difference)
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2">
            <button
              onClick={() => {
                const val = tab === 'of' ? res1 : tab === 'is-what' ? res2 : res3;
                if (val !== null) handleCopy(String(val));
              }}
              className="flex-1 py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Result'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
