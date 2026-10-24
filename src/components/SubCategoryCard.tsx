import { SubCategoryOption } from '../types';
import { FolderTree, ArrowRight, Wrench } from 'lucide-react';

interface SubCategoryCardProps {
  subCategory: SubCategoryOption;
  toolCount: number;
  categoryName: string;
  onSelect: (subCategoryId: string) => void;
}

export default function SubCategoryCard({
  subCategory,
  toolCount,
  categoryName,
  onSelect
}: SubCategoryCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(subCategory.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(subCategory.id);
        }
      }}
      className="group relative bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 transition-all select-none hover:border-teal-500/60 dark:hover:border-teal-500/40 hover:shadow-md hover:bg-slate-50/50 dark:hover:bg-slate-850/50 active:scale-[0.99] cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-500 flex flex-col justify-between"
    >
      <div>
        {/* Top Header: Folder Icon & Tool Count */}
        <div className="flex items-start justify-between gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-teal-600 group-hover:text-white transition-all">
            <FolderTree className="w-5 h-5 stroke-[2.2]" />
          </div>

          <span className="text-[11px] font-medium font-mono text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800/60 px-2 py-0.5 rounded-md">
            {toolCount} {toolCount === 1 ? 'tool' : 'tools'}
          </span>
        </div>

        {/* Subcategory Name */}
        <h3 className="font-heading font-semibold text-slate-900 dark:text-white text-base group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors leading-snug mt-3.5">
          {subCategory.name}
        </h3>

        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Part of {categoryName}
        </p>
      </div>

      {/* Footer Navigation Cue */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1 text-[11px] text-slate-400">
          <Wrench className="w-3.5 h-3.5" />
          <span>Interactive tools</span>
        </span>

        <span className="inline-flex items-center gap-1 font-medium text-teal-600 dark:text-teal-400 group-hover:text-teal-700 dark:group-hover:text-teal-300">
          <span>View tools</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </div>
  );
}
