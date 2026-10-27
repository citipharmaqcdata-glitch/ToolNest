import { Category, CategoryId } from '../types';
import {
  FileText,
  FolderArchive,
  ArrowRightLeft,
  FlaskConical,
  Microscope,
  Calculator,
  Image,
  Code2,
  GraduationCap,
  Compass,
  ArrowRight,
  Folder,
  Layers,
  TrendingUp
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  FileText,
  FolderArchive,
  ArrowRightLeft,
  FlaskConical,
  Microscope,
  Calculator,
  Image,
  Code2,
  GraduationCap,
  Compass,
  TrendingUp
};

const CATEGORY_THEMES: Record<string, { bg: string; text: string; border: string; hoverBg: string }> = {
  documents: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-100 dark:border-indigo-900/40',
    hoverBg: 'group-hover:bg-indigo-600 group-hover:text-white'
  },
  archive: {
    bg: 'bg-teal-50 dark:bg-teal-950/40',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-100 dark:border-teal-900/40',
    hoverBg: 'group-hover:bg-teal-600 group-hover:text-white'
  },
  conversions: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-100 dark:border-emerald-900/40',
    hoverBg: 'group-hover:bg-emerald-600 group-hover:text-white'
  },
  chemistry: {
    bg: 'bg-teal-50 dark:bg-teal-950/40',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-100 dark:border-teal-900/40',
    hoverBg: 'group-hover:bg-teal-600 group-hover:text-white'
  },
  laboratory: {
    bg: 'bg-cyan-50 dark:bg-cyan-950/40',
    text: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-100 dark:border-cyan-900/40',
    hoverBg: 'group-hover:bg-cyan-600 group-hover:text-white'
  },
  math: {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-100 dark:border-blue-900/40',
    hoverBg: 'group-hover:bg-blue-600 group-hover:text-white'
  },
  finance: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-100 dark:border-emerald-900/40',
    hoverBg: 'group-hover:bg-emerald-600 group-hover:text-white'
  },
  image: {
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-100 dark:border-purple-900/40',
    hoverBg: 'group-hover:bg-purple-600 group-hover:text-white'
  },
  developer: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-100 dark:border-amber-900/40',
    hoverBg: 'group-hover:bg-amber-600 group-hover:text-white'
  },
  text: {
    bg: 'bg-sky-50 dark:bg-sky-950/40',
    text: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-100 dark:border-sky-900/40',
    hoverBg: 'group-hover:bg-sky-600 group-hover:text-white'
  },
  education: {
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-100 dark:border-orange-900/40',
    hoverBg: 'group-hover:bg-orange-600 group-hover:text-white'
  },
  daily: {
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-100 dark:border-rose-900/40',
    hoverBg: 'group-hover:bg-rose-600 group-hover:text-white'
  }
};

interface CategoryCardProps {
  category: Category;
  toolCount: number;
  subCategoryCount: number;
  onSelect: (categoryId: CategoryId) => void;
}

export default function CategoryCard({
  category,
  toolCount,
  subCategoryCount,
  onSelect
}: CategoryCardProps) {
  const IconComponent = ICON_MAP[category.icon] || Folder;
  const theme = CATEGORY_THEMES[category.id] || {
    bg: 'bg-teal-50 dark:bg-teal-950/40',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-100 dark:border-teal-900/40',
    hoverBg: 'group-hover:bg-teal-600 group-hover:text-white'
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(category.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(category.id);
        }
      }}
      className="group relative bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 transition-all select-none hover:border-teal-500/60 dark:hover:border-teal-500/40 hover:shadow-md hover:bg-slate-50/50 dark:hover:bg-slate-850/50 active:scale-[0.99] cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-500 flex flex-col justify-between"
    >
      <div>
        {/* Top Header: Category Icon & Badges */}
        <div className="flex items-start justify-between gap-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs transition-all ${theme.bg} ${theme.text} ${theme.border} ${theme.hoverBg}`}
          >
            <IconComponent className="w-5 h-5 stroke-[2.2]" />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-medium font-mono text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800/60 px-2 py-0.5 rounded-md">
              {toolCount} {toolCount === 1 ? 'tool' : 'tools'}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="font-heading font-semibold text-slate-900 dark:text-white text-base group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors leading-snug mt-3.5">
          {category.name}
        </h3>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
          {category.description}
        </p>
      </div>

      {/* Footer Navigation Cue */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1 text-[11px]">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span>{subCategoryCount} {subCategoryCount === 1 ? 'subcategory' : 'subcategories'}</span>
        </span>

        <span className="inline-flex items-center gap-1 font-medium text-teal-600 dark:text-teal-400 group-hover:text-teal-700 dark:group-hover:text-teal-300">
          <span>Explore</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </div>
  );
}
