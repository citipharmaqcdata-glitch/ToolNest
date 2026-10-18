import { useState } from 'react';
import { Copy, Check, RotateCcw, Type } from 'lucide-react';
import { copyToClipboard } from '../../utils/formatters';

export default function TextCaseConverter() {
  const [inputText, setInputText] = useState<string>('ToolNest Online Suite for Developers and Scientists');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toTitleCase = (str: string) => {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
  };

  const toSentenceCase = (str: string) => {
    return str.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
  };

  const toCamelCase = (str: string) => {
    return str
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
      .replace(/^[A-Z]/, (c) => c.toLowerCase());
  };

  const toPascalCase = (str: string) => {
    return str
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
      .replace(/^[a-z]/, (c) => c.toUpperCase());
  };

  const toSnakeCase = (str: string) => {
    return str
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .toLowerCase();
  };

  const toKebabCase = (str: string) => {
    return str
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .toLowerCase();
  };

  const toConstantCase = (str: string) => {
    return str
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .toUpperCase();
  };

  const toAlternatingCase = (str: string) => {
    return str
      .split('')
      .map((char, index) => (index % 2 === 0 ? char.toLowerCase() : char.toUpperCase()))
      .join('');
  };

  const cases = [
    { key: 'upper', name: 'UPPERCASE', val: inputText.toUpperCase() },
    { key: 'lower', name: 'lowercase', val: inputText.toLowerCase() },
    { key: 'title', name: 'Title Case', val: toTitleCase(inputText) },
    { key: 'sentence', name: 'Sentence case', val: toSentenceCase(inputText) },
    { key: 'camel', name: 'camelCase', val: toCamelCase(inputText) },
    { key: 'pascal', name: 'PascalCase', val: toPascalCase(inputText) },
    { key: 'snake', name: 'snake_case', val: toSnakeCase(inputText) },
    { key: 'kebab', name: 'kebab-case', val: toKebabCase(inputText) },
    { key: 'constant', name: 'CONSTANT_CASE', val: toConstantCase(inputText) },
    { key: 'alt', name: 'aLtErNaTiNg cAsE', val: toAlternatingCase(inputText) }
  ];

  const handleCopy = async (text: string, key: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Text Area */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Original Input Text
          </label>
          <button
            onClick={() => setInputText('')}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            Clear
          </button>
        </div>
        <textarea
          rows={4}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type or paste text to convert..."
          className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden resize-y"
        />
      </div>

      {/* Grid of Converted Cases */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cases.map((c) => (
          <div
            key={c.key}
            className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3 hover:border-teal-500/40 transition-colors"
          >
            <div className="overflow-hidden">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{c.name}</div>
              <div className="text-xs font-medium text-slate-900 dark:text-white truncate font-mono mt-0.5" title={c.val}>
                {c.val || <span className="text-slate-400 italic">empty</span>}
              </div>
            </div>
            <button
              onClick={() => handleCopy(c.val, c.key)}
              disabled={!c.val}
              className="py-1 px-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-md flex items-center gap-1 transition-colors shrink-0"
            >
              {copiedKey === c.key ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === c.key ? 'Copied' : 'Copy'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
