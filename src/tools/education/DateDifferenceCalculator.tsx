import { useState } from 'react';
import { Copy, RotateCcw, Check, Calendar, ArrowRight } from 'lucide-react';
import { copyToClipboard } from '../../utils/formatters';

export default function DateDifferenceCalculator() {
  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(nextMonth);
  const [includeEndDate, setIncludeEndDate] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const calculateDifference = () => {
    if (!startDate || !endDate) return null;

    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

    let d1 = start < end ? start : end;
    let d2 = start < end ? end : start;
    const isReversed = start > end;

    // Days difference
    const msPerDay = 24 * 60 * 60 * 1000;
    let totalDays = Math.round((d2.getTime() - d1.getTime()) / msPerDay);
    if (includeEndDate) {
      totalDays += 1;
    }

    // Exact years, months, days calculation
    let y1 = d1.getFullYear();
    let m1 = d1.getMonth();
    let day1 = d1.getDate();

    let y2 = d2.getFullYear();
    let m2 = d2.getMonth();
    let day2 = d2.getDate();

    if (includeEndDate) {
      // simulate 1 extra day for inclusive count
      const d2PlusOne = new Date(d2.getTime() + msPerDay);
      y2 = d2PlusOne.getFullYear();
      m2 = d2PlusOne.getMonth();
      day2 = d2PlusOne.getDate();
    }

    let years = y2 - y1;
    let months = m2 - m1;
    let days = day2 - day1;

    if (days < 0) {
      months -= 1;
      const prevMonthLastDay = new Date(y2, m2, 0).getDate();
      days += prevMonthLastDay;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    // Business days (Mon-Fri)
    let businessDays = 0;
    const cur = new Date(d1);
    const stopTime = includeEndDate ? d2.getTime() : d2.getTime() - msPerDay;

    while (cur.getTime() <= stopTime) {
      const dayOfWeek = cur.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        businessDays++;
      }
      cur.setDate(cur.getDate() + 1);
    }

    const totalWeeks = Math.floor(totalDays / 7);
    const remDaysInWeek = totalDays % 7;
    const totalHours = totalDays * 24;

    return {
      years,
      months,
      days,
      totalDays,
      businessDays,
      weekendDays: totalDays - businessDays,
      totalWeeks,
      remDaysInWeek,
      totalHours,
      isReversed
    };
  };

  const diff = calculateDifference();

  const handleCopy = async () => {
    if (diff) {
      const text = `${diff.years} years, ${diff.months} months, ${diff.days} days (${diff.totalDays} total days, ${diff.businessDays} business days)`;
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
        {/* Date Inputs */}
        <div className="md:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-heading font-semibold text-slate-900 dark:text-white text-base">
              Select Date Range
            </h3>
            <button
              onClick={() => {
                setStartDate(today);
                setEndDate(nextMonth);
              }}
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1.5 py-1 px-2.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <div className="pt-2">
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={includeEndDate}
                onChange={(e) => setIncludeEndDate(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded-sm border-slate-300 focus:ring-teal-500"
              />
              <span>Include End Date in calculation (+1 day)</span>
            </label>
          </div>

          {/* Quick Shortcuts */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
              Quick Shortcuts:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => {
                  setStartDate(today);
                  const d = new Date();
                  d.setDate(d.getDate() + 7);
                  setEndDate(d.toISOString().split('T')[0]);
                }}
                className="text-xs py-1 px-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md transition-colors"
              >
                Next 7 Days
              </button>
              <button
                onClick={() => {
                  setStartDate(today);
                  const d = new Date();
                  d.setDate(d.getDate() + 30);
                  setEndDate(d.toISOString().split('T')[0]);
                }}
                className="text-xs py-1 px-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md transition-colors"
              >
                Next 30 Days
              </button>
              <button
                onClick={() => {
                  setStartDate(today);
                  const d = new Date();
                  d.setMonth(11);
                  d.setDate(31);
                  setEndDate(d.toISOString().split('T')[0]);
                }}
                className="text-xs py-1 px-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md transition-colors"
              >
                End of Current Year
              </button>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="md:col-span-6 bg-gradient-to-br from-slate-50 to-teal-50/30 dark:from-slate-900 dark:to-slate-800/60 p-6 rounded-2xl border border-teal-100/60 dark:border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span>Duration Difference</span>
              <span>{includeEndDate ? 'Inclusive' : 'Exclusive of end day'}</span>
            </div>

            {diff ? (
              <div className="space-y-4">
                {/* Primary Headline */}
                <div className="p-4 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-teal-100 dark:border-teal-900/40">
                  <div className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                    {diff.years > 0 && <span>{diff.years} {diff.years === 1 ? 'year' : 'years'}, </span>}
                    {diff.months > 0 && <span>{diff.months} {diff.months === 1 ? 'month' : 'months'}, </span>}
                    <span>{diff.days} {diff.days === 1 ? 'day' : 'days'}</span>
                  </div>
                  <div className="text-xs text-teal-700 dark:text-teal-400 font-mono mt-1">
                    Total: {diff.totalDays.toLocaleString()} calendar days
                  </div>
                </div>

                {/* Submetrics Breakdown Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-slate-700/60">
                    <div className="text-slate-400 text-[10px] uppercase font-medium">Business / Work Days</div>
                    <div className="text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                      {diff.businessDays.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500">Mon – Fri excluding weekends</div>
                  </div>

                  <div className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-slate-700/60">
                    <div className="text-slate-400 text-[10px] uppercase font-medium">Weekend Days</div>
                    <div className="text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                      {diff.weekendDays.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500">Saturdays & Sundays</div>
                  </div>

                  <div className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-slate-700/60">
                    <div className="text-slate-400 text-[10px] uppercase font-medium">Weeks & Remainder</div>
                    <div className="text-sm font-semibold font-mono text-slate-900 dark:text-white">
                      {diff.totalWeeks} wks, {diff.remDaysInWeek} d
                    </div>
                  </div>

                  <div className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-slate-700/60">
                    <div className="text-slate-400 text-[10px] uppercase font-medium">Total Hours</div>
                    <div className="text-sm font-semibold font-mono text-slate-900 dark:text-white tabular-nums">
                      {diff.totalHours.toLocaleString()} hrs
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-400">Please choose valid dates to view difference.</div>
            )}
          </div>

          <div className="pt-3">
            <button
              onClick={handleCopy}
              disabled={!diff}
              className="w-full py-2 px-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied to Clipboard!' : 'Copy Breakdown'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
