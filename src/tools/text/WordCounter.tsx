import { useState } from 'react';
import { Copy, Trash2, Check, BookOpen, Mic, FileText, Sparkles } from 'lucide-react';
import { copyToClipboard } from '../../utils/formatters';

const SAMPLE_TEXT = `ToolNest brings useful everyday, scientific, laboratory, pharmaceutical, educational, document, image, calculator, and developer tools together in one fast, accessible web portal. Everything processes locally in your browser for absolute data confidentiality and speed.`;

export default function WordCounter() {
  const [text, setText] = useState<string>(SAMPLE_TEXT);
  const [copied, setCopied] = useState(false);

  // Stats calculation
  const charactersWithSpaces = text.length;
  const charactersWithoutSpaces = text.replace(/\s/g, '').length;
  
  // Word count: split on whitespace and filter empty
  const wordsArray = text.trim().length > 0 ? text.trim().split(/\s+/).filter(Boolean) : [];
  const wordsCount = wordsArray.length;

  // Sentences count: split on period, exclamation, question mark
  const sentencesCount = text.trim().length > 0 ? (text.match(/[^.!?]+[.!?]+(\s|$)/g) || []).length || (wordsCount > 0 ? 1 : 0) : 0;

  // Paragraphs
  const paragraphsCount = text.trim().length > 0 ? text.split(/\n+/).filter(p => p.trim().length > 0).length : 0;

  // Lines
  const linesCount = text.length > 0 ? text.split('\n').length : 0;

  // Reading time (225 words per min)
  const readingTimeMin = Math.ceil(wordsCount / 225);

  // Speaking time (130 words per min)
  const speakingTimeMin = Math.ceil(wordsCount / 130);

  // Longest word
  const longestWord = wordsArray.reduce((longest, current) => {
    const cleanCurrent = current.replace(/[^a-zA-Z0-9]/g, '');
    const cleanLongest = longest.replace(/[^a-zA-Z0-9]/g, '');
    return cleanCurrent.length > cleanLongest.length ? cleanCurrent : longest;
  }, '');

  const avgWordLength = wordsCount > 0 ? (charactersWithoutSpaces / wordsCount).toFixed(1) : '0';

  const handleCopy = async () => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleClear = () => {
    setText('');
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Words</div>
          <div className="text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums mt-1">
            {wordsCount.toLocaleString()}
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Characters</div>
          <div className="text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums mt-1">
            {charactersWithSpaces.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            ({charactersWithoutSpaces.toLocaleString()} no spaces)
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Sentences</div>
          <div className="text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums mt-1">
            {sentencesCount.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {paragraphsCount} paragraphs
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Reading Time</div>
          <div className="text-3xl font-bold font-mono tracking-tight text-teal-600 dark:text-teal-400 tabular-nums mt-1">
            ~{readingTimeMin} <span className="text-sm font-normal">min</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            ~{speakingTimeMin} min speaking
          </div>
        </div>
      </div>

      {/* Editor & Controls */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Live Text Area</span>
            <span className="text-xs text-slate-400">· {linesCount} lines</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setText(SAMPLE_TEXT)}
              className="text-xs text-teal-600 dark:text-teal-400 hover:underline py-1 px-2"
            >
              Load Sample
            </button>
            <button
              onClick={handleCopy}
              className="py-1 px-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-md flex items-center gap-1 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={handleClear}
              className="py-1 px-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium rounded-md flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
        </div>

        <textarea
          rows={8}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type your content here to view live word, character, and sentence analytics..."
          className="w-full p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden leading-relaxed resize-y font-sans"
        />

        {/* Text Analytics Footer */}
        <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-3">
          <div className="flex items-center gap-4">
            <span>Avg word length: <strong className="font-mono text-slate-700 dark:text-slate-300">{avgWordLength}</strong> chars</span>
            {longestWord && (
              <span>Longest word: <strong className="font-mono text-slate-700 dark:text-slate-300">{longestWord}</strong> ({longestWord.length} chars)</span>
            )}
          </div>
          <div>All counting runs 100% locally in your device memory.</div>
        </div>
      </div>
    </div>
  );
}
