import { useState } from 'react';
import { Copy, RotateCcw, Check, TrendingUp, DollarSign, Calendar, PieChart } from 'lucide-react';
import { copyToClipboard, formatNumber } from '../../utils/formatters';

type CompoundingFrequency = '1' | '2' | '4' | '12' | '365';

export default function CompoundInterestCalculator() {
  const [initialPrincipal, setInitialPrincipal] = useState<string>('5000');
  const [monthlyContribution, setMonthlyContribution] = useState<string>('200');
  const [annualRate, setAnnualRate] = useState<string>('7.5');
  const [years, setYears] = useState<string>('10');
  const [frequency, setFrequency] = useState<CompoundingFrequency>('12'); // 12 = monthly
  const [currencySymbol, setCurrencySymbol] = useState<string>('$');
  const [copied, setCopied] = useState<boolean>(false);

  // Parsing
  const P = parseFloat(initialPrincipal) || 0;
  const PMT = parseFloat(monthlyContribution) || 0;
  const r = (parseFloat(annualRate) || 0) / 100;
  const t = Math.max(1, Math.min(60, parseInt(years) || 1));
  const n = parseInt(frequency) || 12;

  // Annual calculation breakdown table
  const schedule: Array<{
    year: number;
    startBalance: number;
    deposits: number;
    interestEarned: number;
    endBalance: number;
  }> = [];

  let currentBal = P;
  let totalDeposited = P;

  for (let y = 1; y <= t; y++) {
    const startBal = currentBal;
    let yearDeposits = 0;
    let yearInterest = 0;

    // Simulate 12 months for this year
    for (let m = 1; m <= 12; m++) {
      currentBal += PMT;
      yearDeposits += PMT;
      // Monthly interest compounding approximation based on frequency
      const monthlyRate = Math.pow(1 + r / n, n / 12) - 1;
      const interestThisMonth = currentBal * monthlyRate;
      currentBal += interestThisMonth;
      yearInterest += interestThisMonth;
    }

    totalDeposited += yearDeposits;

    schedule.push({
      year: y,
      startBalance: startBal,
      deposits: yearDeposits,
      interestEarned: yearInterest,
      endBalance: currentBal
    });
  }

  const finalBalance = currentBal;
  const totalPrincipal = totalDeposited;
  const totalInterest = Math.max(0, finalBalance - totalPrincipal);
  const interestPercentage = finalBalance > 0 ? (totalInterest / finalBalance) * 100 : 0;
  const principalPercentage = finalBalance > 0 ? (totalPrincipal / finalBalance) * 100 : 0;

  const handleReset = () => {
    setInitialPrincipal('5000');
    setMonthlyContribution('200');
    setAnnualRate('7.5');
    setYears('10');
    setFrequency('12');
  };

  const handleCopy = async () => {
    const text = `--- Compound Interest & Investment Projection ---
Initial Principal: ${currencySymbol}${formatNumber(P, 2)}
Monthly Contribution: ${currencySymbol}${formatNumber(PMT, 2)}
Annual Interest Rate: ${annualRate}% (Compounded ${
      frequency === '12'
        ? 'Monthly'
        : frequency === '365'
        ? 'Daily'
        : frequency === '4'
        ? 'Quarterly'
        : 'Annually'
    })
Investment Horizon: ${t} Years

Results:
Future Value / End Balance: ${currencySymbol}${formatNumber(finalBalance, 2)}
Total Principal Invested: ${currencySymbol}${formatNumber(totalPrincipal, 2)} (${formatNumber(principalPercentage, 1)}%)
Total Interest Earned: ${currencySymbol}${formatNumber(totalInterest, 2)} (${formatNumber(interestPercentage, 1)}%)`;

    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Form & Parameters */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-heading font-semibold text-base text-slate-900 dark:text-white">
              Investment & Savings Parameters
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Calculate the power of compound interest with regular recurring contributions
            </p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Initial Principal ({currencySymbol})
            </label>
            <input
              type="number"
              min="0"
              value={initialPrincipal}
              onChange={(e) => setInitialPrincipal(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              placeholder="5000"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Monthly Contribution ({currencySymbol})
            </label>
            <input
              type="number"
              min="0"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              placeholder="200"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Annual Interest / Return Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={annualRate}
              onChange={(e) => setAnnualRate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              placeholder="7.5"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Investment Horizon (Years: 1 - 50)
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              placeholder="10"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Compounding Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as CompoundingFrequency)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden cursor-pointer"
            >
              <option value="12">Monthly (12/yr)</option>
              <option value="365">Daily (365/yr)</option>
              <option value="4">Quarterly (4/yr)</option>
              <option value="2">Semi-Annually (2/yr)</option>
              <option value="1">Annually (1/yr)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Currency Symbol
            </label>
            <select
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden cursor-pointer"
            >
              <option value="$">$ (USD / Dollar)</option>
              <option value="€">€ (EUR / Euro)</option>
              <option value="£">£ (GBP / Pound)</option>
              <option value="₹">₹ (INR / Rupee)</option>
              <option value="Rs">Rs (PKR / Rupee)</option>
              <option value="¥">¥ (JPY / CNY)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Outcome Showcase Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Future Value */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="text-xs text-slate-500 font-medium">Future Value ({t} Years)</div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-teal-600 dark:text-teal-400 mt-2">
            {currencySymbol}{formatNumber(finalBalance, 2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Total expected balance with compound growth
          </div>
        </div>

        {/* Total Principal Deposited */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="text-xs text-slate-500 font-medium">Total Principal Deposited</div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-800 dark:text-slate-100 mt-2">
            {currencySymbol}{formatNumber(totalPrincipal, 2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {formatNumber(principalPercentage, 1)}% of your total balance
          </div>
        </div>

        {/* Total Interest Earned */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="text-xs text-slate-500 font-medium">Total Interest Earned</div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-2">
            +{currencySymbol}{formatNumber(totalInterest, 2)}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            {formatNumber(interestPercentage, 1)}% pure compound gain
          </div>
        </div>
      </div>

      {/* Visual Proportional Growth Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-400 dark:bg-slate-600"></span>
            <span>Principal ({formatNumber(principalPercentage, 1)}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-teal-500"></span>
            <span className="text-teal-600 dark:text-teal-400 font-semibold">
              Interest Earned ({formatNumber(interestPercentage, 1)}%)
            </span>
          </div>
        </div>

        <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
          <div
            style={{ width: `${principalPercentage}%` }}
            className="h-full bg-slate-400 dark:bg-slate-600 transition-all duration-500"
          />
          <div
            style={{ width: `${interestPercentage}%` }}
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-500"
          />
        </div>
      </div>

      {/* Annual Growth Projection Schedule */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-heading font-semibold text-base text-slate-900 dark:text-white">
              Annual Breakdown Schedule
            </h4>
            <p className="text-xs text-slate-500">Year-by-year deposits, compound interest, and accumulated balances</p>
          </div>

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Schedule'}
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 max-h-96">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
              <tr>
                <th className="py-3 px-4">Year</th>
                <th className="py-3 px-4">Starting Balance</th>
                <th className="py-3 px-4">Annual Deposits</th>
                <th className="py-3 px-4">Interest Earned</th>
                <th className="py-3 px-4 text-right">Ending Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {schedule.map((row) => (
                <tr key={row.year} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">
                    Year {row.year}
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                    {currencySymbol}{formatNumber(row.startBalance, 2)}
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                    +{currencySymbol}{formatNumber(row.deposits, 2)}
                  </td>
                  <td className="py-2.5 px-4 text-emerald-600 dark:text-emerald-400 font-medium">
                    +{currencySymbol}{formatNumber(row.interestEarned, 2)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-semibold text-slate-900 dark:text-white">
                    {currencySymbol}{formatNumber(row.endBalance, 2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
