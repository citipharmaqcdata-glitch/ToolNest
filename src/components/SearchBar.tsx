import { Search, X, Star, Filter, FolderTree, ChevronDown } from 'lucide-react';
import { CategoryId } from '../types';
import { CATEGORIES, SUBCATEGORIES } from '../data/categories';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: CategoryId;
  onSelectCategory: (cat: CategoryId) => void;
  selectedSubCategory: string;
  onSelectSubCategory: (subCat: string) => void;
  showOnlyFavorites: boolean;
  onToggleOnlyFavorites: () => void;
  totalAvailableCount: number;
  favoritesCount: number;
}

export default function SearchBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  selectedSubCategory,
  onSelectSubCategory,
  showOnlyFavorites,
  onToggleOnlyFavorites,
  totalAvailableCount,
  favoritesCount
}: SearchBarProps) {
  // Current available subcategories based on chosen category
  const currentSubCategories = SUBCATEGORIES[selectedCategory] || SUBCATEGORIES.all;

  const currentCategoryName = CATEGORIES.find(c => c.id === selectedCategory)?.name || 'All Categories';
  const currentSubCategoryName = currentSubCategories.find(s => s.id === selectedSubCategory)?.name;

  return (
    <div className="space-y-2.5 max-w-3xl mx-auto">
      {/* Search Input Row with Favorites Button */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tools by name, keyword, formula..."
            className="w-full pl-10 pr-9 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm shadow-xs focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-hidden transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Favorites Filter Button */}
        <button
          onClick={onToggleOnlyFavorites}
          title={showOnlyFavorites ? 'Show all tools' : 'Show saved favorites'}
          className={`py-3 px-3.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 shadow-xs ${
            showOnlyFavorites
              ? 'bg-amber-500 border-amber-600 text-white font-semibold'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${showOnlyFavorites ? 'fill-white' : 'text-amber-500'}`} />
          <span className="hidden sm:inline">Favorites</span>
          <span>({favoritesCount})</span>
        </button>
      </div>

      {/* Dual Dropdown Row: Categories Dropdown & Subcategories Dropdown right below it */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* 1. Main Category Dropdown */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-teal-600 dark:text-teal-400">
            <Filter className="w-4 h-4" />
          </div>
          <select
            value={showOnlyFavorites ? '' : selectedCategory}
            onChange={(e) => {
              if (showOnlyFavorites) onToggleOnlyFavorites();
              onSelectCategory(e.target.value as CategoryId);
              onSelectSubCategory('all');
            }}
            className="w-full appearance-none pl-9 pr-9 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium shadow-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {/* 2. Subcategory Dropdown (Directly below on mobile, paired on desktop) */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-teal-600 dark:text-teal-400">
            <FolderTree className="w-4 h-4" />
          </div>
          <select
            value={selectedSubCategory}
            onChange={(e) => {
              onSelectSubCategory(e.target.value);
            }}
            className="w-full appearance-none pl-9 pr-9 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium shadow-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden cursor-pointer"
          >
            {currentSubCategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Active Filter Helper Bar (if filtered) */}
      {(selectedCategory !== 'all' || selectedSubCategory !== 'all' || showOnlyFavorites || searchQuery) && (
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 pt-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span>Filtering by:</span>
            {selectedCategory !== 'all' && !showOnlyFavorites && (
              <span className="font-semibold text-teal-600 dark:text-teal-400">
                {currentCategoryName}
              </span>
            )}
            {selectedSubCategory !== 'all' && currentSubCategoryName && (
              <span className="font-semibold text-teal-700 dark:text-teal-300">
                › {currentSubCategoryName}
              </span>
            )}
            {showOnlyFavorites && (
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                Favorites ({favoritesCount})
              </span>
            )}
            {searchQuery && (
              <span>
                "{searchQuery}"
              </span>
            )}
          </div>
          <button
            onClick={() => {
              onSearchChange('');
              onSelectCategory('all');
              onSelectSubCategory('all');
              if (showOnlyFavorites) onToggleOnlyFavorites();
            }}
            className="text-xs text-teal-600 dark:text-teal-400 hover:underline shrink-0 ml-2"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
