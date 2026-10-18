import { useState } from 'react';
import { Copy, Check, Trash2, CheckCircle2, AlertCircle, Sparkles, Minimize2, FileCode } from 'lucide-react';
import { copyToClipboard } from '../../utils/formatters';

const SAMPLE_JSON = `{
  "app": "ToolNest",
  "version": "1.0.0",
  "features": [
    "100% In-Browser Execution",
    "Zero Server Uploads",
    "Offline Capable PWA Ready"
  ],
  "stats": {
    "speedMs": 1.2,
    "cost": 0,
    "privacyGuaranteed": true
  }
}`;

export default function JsonFormatter() {
  const [inputJson, setInputJson] = useState<string>(SAMPLE_JSON);
  const [copied, setCopied] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const formatJson = (spaces: number) => {
    try {
      if (!inputJson.trim()) return;
      const parsed = JSON.parse(inputJson);
      setInputJson(JSON.stringify(parsed, null, spaces));
      setValidationError(null);
    } catch (err: any) {
      setValidationError(err.message || 'Invalid JSON syntax');
    }
  };

  const minifyJson = () => {
    try {
      if (!inputJson.trim()) return;
      const parsed = JSON.parse(inputJson);
      setInputJson(JSON.stringify(parsed));
      setValidationError(null);
    } catch (err: any) {
      setValidationError(err.message || 'Invalid JSON syntax');
    }
  };

  const validateJson = () => {
    try {
      if (!inputJson.trim()) {
        setValidationError('Input is empty');
        return;
      }
      JSON.parse(inputJson);
      setValidationError(null);
    } catch (err: any) {
      setValidationError(err.message || 'Invalid JSON syntax');
    }
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(inputJson);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleClear = () => {
    setInputJson('');
    setValidationError(null);
  };

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => formatJson(2)}
            className="py-1.5 px-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Format (2 Spaces)
          </button>
          <button
            onClick={() => formatJson(4)}
            className="py-1.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg transition-colors"
          >
            Format (4 Spaces)
          </button>
          <button
            onClick={minifyJson}
            className="py-1.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            Minify / Compact
          </button>
          <button
            onClick={validateJson}
            className="py-1.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg transition-colors"
          >
            Validate Syntax
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setInputJson(SAMPLE_JSON);
              setValidationError(null);
            }}
            className="text-xs text-teal-600 dark:text-teal-400 hover:underline px-2 py-1"
          >
            Load Sample
          </button>
          <button
            onClick={handleCopy}
            className="py-1.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleClear}
            className="py-1.5 px-2.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs rounded-lg transition-colors"
            title="Clear editor"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Bar */}
      {validationError ? (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-400 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <div>
            <strong>Syntax Error:</strong> {validationError}
          </div>
        </div>
      ) : inputJson.trim() ? (
        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Valid JSON syntax verified. Length: {inputJson.length} characters ({new Blob([inputJson]).size} bytes).</span>
        </div>
      ) : null}

      {/* Editor Box */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <textarea
          rows={16}
          value={inputJson}
          onChange={(e) => {
            setInputJson(e.target.value);
            setValidationError(null);
          }}
          placeholder="Paste unformatted or raw JSON here..."
          className="w-full p-4 bg-slate-50/50 dark:bg-slate-900/50 font-mono text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden resize-y leading-relaxed"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
