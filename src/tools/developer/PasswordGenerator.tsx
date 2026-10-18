import { useState, useEffect } from 'react';
import { Copy, RefreshCw, Check, ShieldCheck, KeyRound, Sparkles } from 'lucide-react';
import { copyToClipboard } from '../../utils/formatters';

export default function PasswordGenerator() {
  const [length, setLength] = useState<number>(16);
  const [includeUpper, setIncludeUpper] = useState<boolean>(true);
  const [includeLower, setIncludeLower] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [generatedUuid, setGeneratedUuid] = useState<string>('');
  const [copiedPass, setCopiedPass] = useState<boolean>(false);
  const [copiedUuid, setCopiedUuid] = useState<boolean>(false);

  const generatePassword = () => {
    let charset = '';
    if (includeUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLower) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!charset) charset = 'abcdefghijklmnopqrstuvwxyz';

    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);

    let res = '';
    for (let i = 0; i < length; i++) {
      res += charset[array[i] % charset.length];
    }
    setGeneratedPassword(res);
  };

  const generateUuid = () => {
    if (typeof crypto.randomUUID === 'function') {
      setGeneratedUuid(crypto.randomUUID());
    } else {
      // Fallback RFC4122 v4 UUID
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
      setGeneratedUuid(`${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`);
    }
  };

  useEffect(() => {
    generatePassword();
    generateUuid();
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols]);

  // Calculate entropy
  let poolSize = 0;
  if (includeUpper) poolSize += 26;
  if (includeLower) poolSize += 26;
  if (includeNumbers) poolSize += 10;
  if (includeSymbols) poolSize += 28;
  const entropyBits = poolSize > 0 ? Math.round(length * Math.log2(poolSize)) : 0;

  const strengthLabel =
    entropyBits > 80
      ? { text: 'Very Strong', color: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-500 w-full' }
      : entropyBits > 60
      ? { text: 'Strong', color: 'text-teal-600 dark:text-teal-400', bar: 'bg-teal-500 w-3/4' }
      : entropyBits > 40
      ? { text: 'Moderate', color: 'text-amber-600 dark:text-amber-400', bar: 'bg-amber-500 w-1/2' }
      : { text: 'Weak', color: 'text-rose-600 dark:text-rose-400', bar: 'bg-rose-500 w-1/4' };

  const handleCopyPassword = async () => {
    const success = await copyToClipboard(generatedPassword);
    if (success) {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 1500);
    }
  };

  const handleCopyUuid = async () => {
    const success = await copyToClipboard(generatedUuid);
    if (success) {
      setCopiedUuid(true);
      setTimeout(() => setCopiedUuid(false), 1500);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Password Generator Card */}
        <div className="md:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-heading font-semibold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-teal-600" />
              Cryptographic Password Generator
            </h3>
            <button
              onClick={generatePassword}
              className="text-xs text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerate
            </button>
          </div>

          {/* Generated Result Box */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
            <div className="font-mono text-sm sm:text-base font-semibold text-slate-900 dark:text-white break-all tracking-wide select-all">
              {generatedPassword}
            </div>
            <button
              onClick={handleCopyPassword}
              className="py-1.5 px-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
            >
              {copiedPass ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedPass ? 'Copied' : 'Copy'}
            </button>
          </div>

          {/* Strength Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Security Strength: <strong className={strengthLabel.color}>{strengthLabel.text}</strong></span>
              <span className="font-mono text-slate-400 text-[11px]">{entropyBits} bits entropy</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className={`h-full transition-all ${strengthLabel.bar}`} />
            </div>
          </div>

          {/* Length Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Password Length</span>
              <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">{length} characters</span>
            </div>
            <input
              type="range"
              min="8"
              max="48"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value, 10))}
              className="w-full accent-teal-600"
            />
          </div>

          {/* Character Options */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={includeUpper}
                onChange={(e) => setIncludeUpper(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded-sm"
              />
              <span>Uppercase (A-Z)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={includeLower}
                onChange={(e) => setIncludeLower(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded-sm"
              />
              <span>Lowercase (a-z)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={includeNumbers}
                onChange={(e) => setIncludeNumbers(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded-sm"
              />
              <span>Numbers (0-9)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={includeSymbols}
                onChange={(e) => setIncludeSymbols(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded-sm"
              />
              <span>Symbols (!@#$%)</span>
            </label>
          </div>
        </div>

        {/* UUID v4 Section */}
        <div className="md:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-heading font-semibold text-slate-900 dark:text-white text-base">
                UUID v4 Generator
              </h3>
              <button
                onClick={generateUuid}
                className="text-xs text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                New UUID
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
              Standard RFC 4122 Version 4 random universally unique identifier.
            </p>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs sm:text-sm text-slate-900 dark:text-white break-all mt-4 select-all">
              {generatedUuid}
            </div>
          </div>

          <div className="space-y-3 pt-3">
            <button
              onClick={handleCopyUuid}
              className="w-full py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              {copiedUuid ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedUuid ? 'Copied UUID' : 'Copy UUID'}
            </button>

            <div className="p-2.5 bg-slate-100 dark:bg-slate-800/70 rounded-lg text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
              <span>
                Generated with browser-native <code className="font-mono">crypto.getRandomValues()</code>. Not transmitted across any network.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
