import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flag, Copy, Check } from 'lucide-react';
import { copyToClipboard } from '../../utils/formatters';

interface Lap {
  index: number;
  timeMs: number;
  splitMs: number;
}

export default function StopwatchTool() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [laps, setLaps] = useState<Lap[]>([]);
  const [copied, setCopied] = useState(false);

  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastRecordedLapTimeRef = useRef<number>(0);

  const updateTimer = () => {
    setElapsedTime(Date.now() - startTimeRef.current);
    requestRef.current = requestAnimationFrame(updateTimer);
  };

  const handleStart = () => {
    if (!isRunning) {
      setIsRunning(true);
      startTimeRef.current = Date.now() - elapsedTime;
      requestRef.current = requestAnimationFrame(updateTimer);
    }
  };

  const handlePause = () => {
    if (isRunning) {
      setIsRunning(false);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    setElapsedTime(0);
    setLaps([]);
    lastRecordedLapTimeRef.current = 0;
  };

  const handleLap = () => {
    if (!isRunning && elapsedTime === 0) return;
    const current = elapsedTime;
    const split = current - lastRecordedLapTimeRef.current;
    lastRecordedLapTimeRef.current = current;

    const newLap: Lap = {
      index: laps.length + 1,
      timeMs: current,
      splitMs: split
    };
    setLaps(prev => [newLap, ...prev]);
  };

  // Keyboard shortcut support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (isRunning) handlePause();
        else handleStart();
      } else if (e.code === 'KeyL') {
        e.preventDefault();
        handleLap();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        handleReset();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, elapsedTime, laps]);

  // Clean-up animation frame
  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const formatStopwatch = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    const millis = Math.floor((ms % 1000) / 10); // 2-digit centiseconds
    return {
      minutes: String(m).padStart(2, '0'),
      seconds: String(s).padStart(2, '0'),
      centis: String(millis).padStart(2, '0')
    };
  };

  const time = formatStopwatch(elapsedTime);

  // Find fastest and slowest laps
  let fastestSplit = Infinity;
  let slowestSplit = -Infinity;
  if (laps.length > 1) {
    laps.forEach(l => {
      if (l.splitMs < fastestSplit) fastestSplit = l.splitMs;
      if (l.splitMs > slowestSplit) slowestSplit = l.splitMs;
    });
  }

  const handleCopyLaps = async () => {
    if (laps.length === 0) return;
    const text = laps
      .map(l => {
        const s = formatStopwatch(l.splitMs);
        const t = formatStopwatch(l.timeMs);
        return `Lap ${l.index}: ${s.minutes}:${s.seconds}.${s.centis} (Total: ${t.minutes}:${t.seconds}.${t.centis})`;
      })
      .join('\n');
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Display Card */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
        <div className="flex items-center justify-center gap-1 font-mono text-5xl sm:text-7xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums py-4">
          <span>{time.minutes}</span>
          <span className="text-teal-600 dark:text-teal-400">:</span>
          <span>{time.seconds}</span>
          <span className="text-teal-600 dark:text-teal-400">.</span>
          <span className="text-3xl sm:text-5xl text-teal-600 dark:text-teal-400 w-16 sm:w-24 text-left">{time.centis}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mt-6">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="py-3 px-6 sm:px-8 bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm sm:text-base rounded-xl flex items-center gap-2 shadow-xs transition-colors"
            >
              <Play className="w-4 h-4 fill-white" />
              {elapsedTime > 0 ? 'Resume' : 'Start'}
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="py-3 px-6 sm:px-8 bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm sm:text-base rounded-xl flex items-center gap-2 shadow-xs transition-colors"
            >
              <Pause className="w-4 h-4 fill-white" />
              Pause
            </button>
          )}

          <button
            onClick={handleLap}
            disabled={!isRunning && elapsedTime === 0}
            className="py-3 px-5 sm:px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-800 dark:text-slate-200 font-medium text-sm rounded-xl flex items-center gap-2 transition-colors"
          >
            <Flag className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            Lap
          </button>

          <button
            onClick={handleReset}
            disabled={elapsedTime === 0}
            className="py-3 px-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-600 dark:text-slate-400 text-sm rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>

        {/* Keyboard shortcut tips */}
        <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-5 hidden sm:flex items-center justify-center gap-4">
          <span><kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">Space</kbd> Start/Pause</span>
          <span><kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">L</kbd> Lap</span>
          <span><kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">R</kbd> Reset</span>
        </div>
      </div>

      {/* Laps Record Table */}
      {laps.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              Recorded Laps ({laps.length})
            </h4>
            <button
              onClick={handleCopyLaps}
              className="text-xs text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy All Laps'}
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[300px] overflow-y-auto">
            {laps.map(l => {
              const split = formatStopwatch(l.splitMs);
              const total = formatStopwatch(l.timeMs);
              const isFastest = laps.length > 1 && l.splitMs === fastestSplit;
              const isSlowest = laps.length > 1 && l.splitMs === slowestSplit;

              return (
                <div key={l.index} className="py-2.5 px-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400 w-8">#{l.index}</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                      +{split.minutes}:{split.seconds}.{split.centis}
                    </span>
                    {isFastest && (
                      <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                        (Fastest)
                      </span>
                    )}
                    {isSlowest && (
                      <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                        (Slowest)
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                    {total.minutes}:{total.seconds}.{total.centis}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
