import { useState } from 'react';
import { Copy, RotateCcw, Check, Cake, Sparkles, Heart } from 'lucide-react';
import { copyToClipboard } from '../../utils/formatters';

export default function AgeCalculator() {
  const today = new Date().toISOString().split('T')[0];
  const [birthDate, setBirthDate] = useState<string>('2000-01-15');
  const [targetDate, setTargetDate] = useState<string>(today);
  const [copied, setCopied] = useState<boolean>(false);

  const calculateAge = () => {
    if (!birthDate || !targetDate) return null;

    const birth = new Date(birthDate + 'T00:00:00');
    const target = new Date(targetDate + 'T00:00:00');

    if (isNaN(birth.getTime()) || isNaN(target.getTime())) return null;
    if (birth > target) return null;

    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const birthDayName = weekdays[birth.getDay()];

    // Years, Months, Days
    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonthLastDay = new Date(target.getFullYear(), target.getMonth(), 0).getDate();
      days += prevMonthLastDay;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    // Total days lived
    const msDiff = target.getTime() - birth.getTime();
    const totalDays = Math.floor(msDiff / (24 * 60 * 60 * 1000));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = totalDays * 24;
    const estHeartbeats = totalDays * 24 * 60 * 75; // average 75 bpm

    // Next birthday
    let nextBday = new Date(target.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBday < target) {
      nextBday = new Date(target.getFullYear() + 1, birth.getMonth(), birth.getDate());
    }
    const daysToNextBday = Math.ceil((nextBday.getTime() - target.getTime()) / (24 * 60 * 60 * 1000));
    const nextBdayWeekday = weekdays[nextBday.getDay()];

    return {
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalHours,
      estHeartbeats,
      birthDayName,
      daysToNextBday,
      nextBdayWeekday
    };
  };

  const age = calculateAge();

  const handleCopy = async () => {
    if (age) {
      const text = `${age.years} years, ${age.months} months, ${age.days} days (${age.totalDays.toLocaleString()} total days lived)`;
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
              Date Information
            </h3>
            <button
              onClick={() => {
                setBirthDate('2000-01-15');
                setTargetDate(today);
              }}
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1.5 py-1 px-2.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Date of Birth
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Age as of Target Date
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          {age && (
            <div className="p-3 bg-teal-50/60 dark:bg-teal-950/20 rounded-xl border border-teal-100 dark:border-teal-900/40 text-xs text-teal-800 dark:text-teal-300">
              Born on a <strong className="font-semibold">{age.birthDayName}</strong>.
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="md:col-span-6 bg-gradient-to-br from-slate-50 to-teal-50/30 dark:from-slate-900 dark:to-slate-800/60 p-6 rounded-2xl border border-teal-100/60 dark:border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span>Exact Age Breakdown</span>
              <span>Down to days</span>
            </div>

            {age ? (
              <div className="space-y-4">
                <div className="p-4 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-teal-100 dark:border-teal-900/40">
                  <div className="text-3xl font-bold font-heading text-slate-900 dark:text-white">
                    {age.years} <span className="text-lg font-normal text-slate-500">years</span>, {age.months} <span className="text-lg font-normal text-slate-500">months</span>, {age.days} <span className="text-lg font-normal text-slate-500">days</span>
                  </div>
                  <div className="text-xs text-teal-700 dark:text-teal-400 font-mono mt-1">
                    {age.totalDays.toLocaleString()} total days on Earth
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-slate-700/60">
                    <div className="text-slate-400 text-[10px] uppercase font-medium flex items-center gap-1">
                      <Cake className="w-3 h-3 text-pink-500" />
                      Next Birthday
                    </div>
                    <div className="text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                      {age.daysToNextBday} days
                    </div>
                    <div className="text-[10px] text-slate-500">on a {age.nextBdayWeekday}</div>
                  </div>

                  <div className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-slate-700/60">
                    <div className="text-slate-400 text-[10px] uppercase font-medium">Total Weeks</div>
                    <div className="text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                      {age.totalWeeks.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500">completed weeks</div>
                  </div>

                  <div className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-slate-700/60">
                    <div className="text-slate-400 text-[10px] uppercase font-medium">Total Hours</div>
                    <div className="text-sm font-semibold font-mono text-slate-900 dark:text-white tabular-nums">
                      {age.totalHours.toLocaleString()} hrs
                    </div>
                  </div>

                  <div className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-slate-700/60">
                    <div className="text-slate-400 text-[10px] uppercase font-medium flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-500" />
                      Est. Heartbeats
                    </div>
                    <div className="text-sm font-semibold font-mono text-slate-900 dark:text-white tabular-nums">
                      ~{(age.estHeartbeats / 1e6).toFixed(1)}M beats
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-400">Please choose a valid birthdate before the target date.</div>
            )}
          </div>

          <div className="pt-3">
            <button
              onClick={handleCopy}
              disabled={!age}
              className="w-full py-2 px-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Age Stats'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
