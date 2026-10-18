import { ToolItem } from '../types';
import {
  Percent,
  FlaskConical,
  Pipette,
  Scale,
  ArrowRightLeft,
  CalendarRange,
  Timer,
  AlignLeft,
  Braces,
  Tag,
  Cake,
  ImageDown,
  Sigma,
  Droplets,
  Binary,
  KeyRound,
  Type,
  Receipt,
  FileStack,
  Split,
  TestTubes,
  TrendingUp,
  HeartPulse,
  QrCode,
  Microscope,
  Star,
  HelpCircle
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  Percent,
  FlaskConical,
  Pipette,
  Scale,
  ArrowRightLeft,
  CalendarRange,
  Timer,
  AlignLeft,
  Braces,
  Tag,
  Cake,
  ImageDown,
  Sigma,
  Droplets,
  Binary,
  KeyRound,
  Type,
  Receipt,
  FileStack,
  Split,
  TestTubes,
  TrendingUp,
  HeartPulse,
  QrCode,
  Microscope
};

// Subtle domain-specific icon color themes for visual scannability
const CATEGORY_STYLES: Record<string, string> = {
  chemistry: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-900/40',
  laboratory: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900/40',
  math: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40',
  image: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40',
  developer: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40',
  text: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40',
  education: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40',
  daily: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40'
};

interface ToolCardProps {
  tool: ToolItem;
  onOpen: (tool: ToolItem) => void;
  isFavorite: boolean;
  onToggleFavorite: (toolId: string) => void;
}

export default function ToolCard({
  tool,
  onOpen,
  isFavorite,
  onToggleFavorite
}: ToolCardProps) {
  const IconComponent = ICON_MAP[tool.iconName] || HelpCircle;
  const isAvailable = tool.status === 'available';
  const iconTheme = CATEGORY_STYLES[tool.category] || 'bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-400 border border-slate-200 dark:border-slate-700';

  return (
    <div
      role={isAvailable ? 'button' : undefined}
      tabIndex={isAvailable ? 0 : undefined}
      onClick={() => isAvailable && onOpen(tool)}
      onKeyDown={(e) => {
        if (isAvailable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onOpen(tool);
        }
      }}
      className={`group relative bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 transition-all select-none ${
        isAvailable
          ? 'hover:border-teal-500/60 dark:hover:border-teal-500/40 hover:shadow-md hover:bg-slate-50/50 dark:hover:bg-slate-850/50 active:scale-[0.99] cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-500'
          : 'opacity-70 cursor-not-allowed bg-slate-50/60 dark:bg-slate-900/40'
      }`}
    >
      {/* Top Header: Tool Icon (Left), Title & Category (Center), Favorite Star (Right) */}
      <div className="flex items-start gap-3 sm:gap-3.5">
        {/* Tool Icon at top-left, vertically aligned with title */}
        <div
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105 ${iconTheme}`}
        >
          <IconComponent className="w-5 h-5 stroke-[2.2]" />
        </div>

        {/* Title and Category Area */}
        <div className="flex-1 min-w-0 pt-0.5">
          <h3 className="font-heading font-semibold text-slate-900 dark:text-white text-base group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors leading-snug line-clamp-2">
            {tool.name}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
            <span className="truncate">{tool.categoryName}</span>
            {!isAvailable && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                  {tool.badgeNote || 'Roadmap'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Favorite Star at top-right, aligned horizontally with icon and title */}
        <div className="shrink-0 -mt-0.5 -mr-1">
          {isAvailable ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(tool.id);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                }
              }}
              aria-label={isFavorite ? `Remove ${tool.name} from favorites` : `Add ${tool.name} to favorites`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              className="p-2 text-slate-400 hover:text-amber-500 active:scale-90 transition-all rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/50"
            >
              <Star
                className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-colors ${
                  isFavorite ? 'fill-amber-400 text-amber-500' : 'text-slate-300 dark:text-slate-600 hover:text-amber-400'
                }`}
              />
            </button>
          ) : (
            <span className="text-[10px] font-medium text-slate-400 font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
              Roadmap
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed line-clamp-2">
        {tool.shortDescription}
      </p>
    </div>
  );
}
