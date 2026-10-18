import { useState } from 'react';
import { Copy, RotateCcw, Check, Tag } from 'lucide-react';
import { copyToClipboard, formatNumber } from '../../utils/formatters';

export default function DiscountCalculator() {
  const [originalPrice, setOriginalPrice] = useState<string>('120');
  const [discountPercent, setDiscountPercent] = useState<string>('25');
  const [extraDiscount, setExtraDiscount] = useState<string>('10');
  const [salesTax, setSalesTax] = useState<string>('8.25');
  const [copied, setCopied] = useState<boolean>(false);

  const numOriginal = parseFloat(originalPrice);
  const numDisc1 = parseFloat(discountPercent) || 0;
  const numDisc2 = parseFloat(extraDiscount) || 0;
  const numTax = parseFloat(salesTax) || 0;

  let finalPrice: number | null = null;
  let savingsAmount: number | null = null;
  let taxAmount: number | null = null;
  let priceAfterDiscount: number | null = null;
  let effectiveDiscountRate: number | null = null;

  if (!isNaN(numOriginal) && numOriginal >= 0) {
    // Apply primary discount
    const priceAfterFirst = numOriginal * (1 - numDisc1 / 100);
    // Apply second stackable discount on remainder
    const priceAfterSecond = priceAfterFirst * (1 - numDisc2 / 100);
    
    priceAfterDiscount = priceAfterSecond;
    savingsAmount = numOriginal - priceAfterSecond;
    
    // Apply sales tax
    taxAmount = priceAfterSecond * (numTax / 100);
    finalPrice = priceAfterSecond + taxAmount;

    effectiveDiscountRate = numOriginal > 0 ? (savingsAmount / numOriginal) * 100 : 0;
  }

  const handleCopy = async () => {
    if (finalPrice !== null) {
      const text = `Original: $${originalPrice}, Final: $${formatNumber(finalPrice, 2)}, Total Savings: $${formatNumber(savingsAmount || 0, 2)}`;
      const success = await copyToClipboard(text);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    }
  };

  const handleReset = () => {
    setOriginalPrice('100');
    setDiscountPercent('20');
    setExtraDiscount('0');
    setSalesTax('0');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Form Inputs */}
        <div className="md:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-heading font-semibold text-slate-900 dark:text-white text-base">
              Pricing Details
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
              Original Retail Price ($)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm">$</span>
              <input
                type="number"
                step="any"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="100.00"
                className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Primary Discount (%)
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                placeholder="20"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
              <span className="absolute right-3.5 top-2.5 text-slate-400 text-sm">%</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Additional Coupon / Promo Discount (% Optional)
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={extraDiscount}
                onChange={(e) => setExtraDiscount(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
              <span className="absolute right-3.5 top-2.5 text-slate-400 text-sm">%</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Estimated Sales Tax (% Optional)
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={salesTax}
                onChange={(e) => setSalesTax(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
              <span className="absolute right-3.5 top-2.5 text-slate-400 text-sm">%</span>
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="md:col-span-6 bg-gradient-to-br from-slate-50 to-teal-50/30 dark:from-slate-900 dark:to-slate-800/60 p-6 rounded-2xl border border-teal-100/60 dark:border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span>Final Payable Price</span>
              <span>After discounts & tax</span>
            </div>

            {finalPrice !== null ? (
              <div className="space-y-4">
                <div className="p-4 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-teal-100 dark:border-teal-900/40">
                  <div className="text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
                    ${formatNumber(finalPrice, 2)}
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                    You save ${formatNumber(savingsAmount || 0, 2)} ({formatNumber(effectiveDiscountRate || 0, 1)}% effective discount)
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-500">Original Price:</span>
                    <span className="font-mono font-medium line-through text-slate-400">${formatNumber(numOriginal, 2)}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-500">Subtotal After Discounts:</span>
                    <span className="font-mono font-medium text-slate-800 dark:text-slate-200">${formatNumber(priceAfterDiscount || 0, 2)}</span>
                  </div>
                  {numTax > 0 && (
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-slate-500">Sales Tax ({numTax}%):</span>
                      <span className="font-mono font-medium text-slate-800 dark:text-slate-200">+${formatNumber(taxAmount || 0, 2)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-2 text-sm font-semibold text-slate-900 dark:text-white">
                    <span>Total You Pay:</span>
                    <span className="font-mono text-teal-600 dark:text-teal-400">${formatNumber(finalPrice, 2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-400">Enter pricing to compute total.</div>
            )}
          </div>

          <div className="pt-3">
            <button
              onClick={handleCopy}
              disabled={finalPrice === null}
              className="w-full py-2 px-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Summary'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
