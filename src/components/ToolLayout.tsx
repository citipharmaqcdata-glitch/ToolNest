import { ReactNode, useState } from 'react';
import { ArrowLeft, Star, Share2, Check, ExternalLink } from 'lucide-react';
import { ToolItem } from '../types';
import { copyToClipboard } from '../utils/formatters';
import ToolEducationalGuide from './ToolEducationalGuide';

interface ToolLayoutProps {
  tool: ToolItem;
  onBack: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  children: ReactNode;
  relatedTools: ToolItem[];
  onOpenRelated: (tool: ToolItem) => void;
}

export default function ToolLayout({
  tool,
  onBack,
  isFavorite,
  onToggleFavorite,
  children,
  relatedTools,
  onOpenRelated
}: ToolLayoutProps) {
  const [copiedShare, setCopiedShare] = useState(false);

  const handleShare = async () => {
    const success = await copyToClipboard(window.location.href);
    if (success) {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 1500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <button
            onClick={onBack}
            className="flex items-center gap-1 hover:text-teal-600 dark:hover:text-teal-400 font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </button>
          <span>/</span>
          <span className="capitalize">{tool.categoryName}</span>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-medium truncate max-w-[180px] sm:max-w-none">
            {tool.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleFavorite(tool.id)}
            className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-colors flex items-center gap-1.5 shadow-xs"
            title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          >
            <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
            <span className="hidden sm:inline">{isFavorite ? 'Favorited' : 'Favorite'}</span>
          </button>

          <button
            onClick={handleShare}
            className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-300 hover:text-teal-600 transition-colors flex items-center gap-1.5 shadow-xs"
            title="Copy share link"
          >
            {copiedShare ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedShare ? 'Copied Link' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Tool Hero Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-1">
          <span>{tool.categoryName}</span>
          <span>·</span>
          <span>In-Browser Client Tool</span>
          <span>·</span>
          <span>Zero Server Uploads</span>
        </div>
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
          {tool.name}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-3xl leading-relaxed">
          {tool.shortDescription}
        </p>
      </div>

      {/* Primary Interactive Tool Box */}
      <div className="min-h-[300px]">
        {children}
      </div>

      {/* Complete Working Principle & Educational Guide (AdSense & SEO Optimized) */}
      <ToolEducationalGuide toolId={tool.id} tool={tool} />

      {/* Related Tools Carousel / Grid */}
      {relatedTools.length > 0 && (
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold text-slate-900 dark:text-white text-base">
              Related {tool.categoryName} Tools
            </h3>
            <button
              onClick={onBack}
              className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
            >
              View all tools
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedTools.slice(0, 3).map((rt) => (
              <div
                key={rt.id}
                onClick={() => onOpenRelated(rt)}
                className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 cursor-pointer transition-all shadow-xs"
              >
                <div className="text-xs text-slate-400">{rt.categoryName}</div>
                <div className="font-heading font-semibold text-sm text-slate-900 dark:text-white mt-0.5">
                  {rt.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                  {rt.shortDescription}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
