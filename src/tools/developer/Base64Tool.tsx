import { useState } from 'react';
import { Copy, Check, RotateCcw, ArrowRightLeft } from 'lucide-react';
import { copyToClipboard } from '../../utils/formatters';

export default function Base64Tool() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [inputText, setInputText] = useState<string>('Hello, ToolNest!');
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const processBase64 = () => {
    if (!inputText) return '';
    try {
      if (mode === 'encode') {
        setError(null);
        // UTF-8 safe encode
        return btoa(unescape(encodeURIComponent(inputText)));
      } else {
        setError(null);
        // UTF-8 safe decode
        return decodeURIComponent(escape(atob(inputText)));
      }
    } catch (err: any) {
      setError(mode === 'decode' ? 'Invalid Base64 sequence for decoding' : 'Encoding error');
      return '';
    }
  };

  const output = processBase64();

  const handleCopy = async () => {
    if (output) {
      const success = await copyToClipboard(output);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    }
  };

  const handleSwap = () => {
    if (output && !error) {
      setInputText(output);
      setMode(mode === 'encode' ? 'decode' : 'encode');
    } else {
      setMode(mode === 'encode' ? 'decode' : 'encode');
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          <button
            onClick={() => setMode('encode')}
            className={`py-2 px-4 text-xs font-medium rounded-lg transition-all ${
              mode === 'encode'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Encode Plain Text to Base64
          </button>
          <button
            onClick={() => setMode('decode')}
            className={`py-2 px-4 text-xs font-medium rounded-lg transition-all ${
              mode === 'decode'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Decode Base64 to Text
          </button>
        </div>

        <button
          onClick={handleSwap}
          className="text-xs text-slate-600 dark:text-slate-400 hover:text-teal-600 flex items-center gap-1.5 py-1.5 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xs"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          Swap Input / Output
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {mode === 'encode' ? 'Plain Text Input (UTF-8)' : 'Base64 Encoded Input'}
            </span>
            <button
              onClick={() => setInputText('')}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          </div>
          <textarea
            rows={8}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={mode === 'encode' ? 'Type or paste plain text here...' : 'Paste Base64 string here...'}
            className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden resize-y"
          />
        </div>

        {/* Output */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {mode === 'encode' ? 'Base64 Result' : 'Decoded Plain Text'}
              </span>
              <button
                onClick={handleCopy}
                disabled={!output}
                className="py-1 px-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-medium rounded-md flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            {error ? (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 text-xs rounded-xl mt-3">
                {error}
              </div>
            ) : (
              <textarea
                readOnly
                rows={8}
                value={output}
                placeholder="Conversion will appear here automatically..."
                className="w-full p-3.5 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden resize-y mt-3"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
