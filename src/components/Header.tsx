import { useState } from 'react';
import { Wrench, Sun, Moon, Menu, X, BookOpen, Star } from 'lucide-react';
import { CategoryId, ModalType } from '../types';

interface HeaderProps {
  currentCategory: CategoryId;
  onSelectCategory: (cat: CategoryId) => void;
  activeToolId: string | null;
  onBackToHome: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenModal: (type: ModalType) => void;
  onShowFavorites: () => void;
  favoritesCount: number;
}

export default function Header({
  currentCategory,
  onSelectCategory,
  activeToolId,
  onBackToHome,
  theme,
  onToggleTheme,
  onOpenModal,
  onShowFavorites,
  favoritesCount
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (cat: CategoryId) => {
    onBackToHome();
    onSelectCategory(cat);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2.5 text-left group focus:outline-hidden"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-600 dark:bg-teal-500 flex items-center justify-center text-white shadow-xs group-hover:bg-teal-700 transition-colors">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0">
                ToolNest
              </span>
            </div>
          </button>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => handleNavClick('all')}
              className={`hover:text-teal-600 dark:hover:text-teal-400 transition-colors whitespace-nowrap shrink-0 ${
                currentCategory === 'all' && !activeToolId ? 'text-teal-600 dark:text-teal-400 font-semibold' : ''
              }`}
            >
              All Tools
            </button>
            <button
              onClick={() => handleNavClick('archive')}
              className={`hover:text-teal-600 dark:hover:text-teal-400 transition-colors whitespace-nowrap shrink-0 ${
                currentCategory === 'archive' && !activeToolId ? 'text-teal-600 dark:text-teal-400 font-semibold' : ''
              }`}
            >
              Archive Converters
            </button>
            <button
              onClick={() => handleNavClick('documents')}
              className={`hover:text-teal-600 dark:hover:text-teal-400 transition-colors whitespace-nowrap shrink-0 ${
                currentCategory === 'documents' && !activeToolId ? 'text-teal-600 dark:text-teal-400 font-semibold' : ''
              }`}
            >
              Document Converters
            </button>
            <button
              onClick={() => handleNavClick('conversions')}
              className={`hover:text-teal-600 dark:hover:text-teal-400 transition-colors whitespace-nowrap shrink-0 ${
                currentCategory === 'conversions' && !activeToolId ? 'text-teal-600 dark:text-teal-400 font-semibold' : ''
              }`}
            >
              Unit Conversions
            </button>
            <button
              onClick={() => handleNavClick('chemistry')}
              className={`hover:text-teal-600 dark:hover:text-teal-400 transition-colors whitespace-nowrap shrink-0 ${
                currentCategory === 'chemistry' && !activeToolId ? 'text-teal-600 dark:text-teal-400 font-semibold' : ''
              }`}
            >
              Chemistry
            </button>
            <button
              onClick={() => handleNavClick('laboratory')}
              className={`hover:text-teal-600 dark:hover:text-teal-400 transition-colors whitespace-nowrap shrink-0 ${
                currentCategory === 'laboratory' && !activeToolId ? 'text-teal-600 dark:text-teal-400 font-semibold' : ''
              }`}
            >
              Laboratory & QC
            </button>
            <button
              onClick={() => handleNavClick('math')}
              className={`hover:text-teal-600 dark:hover:text-teal-400 transition-colors whitespace-nowrap shrink-0 ${
                currentCategory === 'math' && !activeToolId ? 'text-teal-600 dark:text-teal-400 font-semibold' : ''
              }`}
            >
              Math
            </button>
            <button
              onClick={() => handleNavClick('developer')}
              className={`hover:text-teal-600 dark:hover:text-teal-400 transition-colors whitespace-nowrap shrink-0 ${
                currentCategory === 'developer' && !activeToolId ? 'text-teal-600 dark:text-teal-400 font-semibold' : ''
              }`}
            >
              Developer
            </button>
            <button
              onClick={() => onOpenModal('about')}
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors whitespace-nowrap shrink-0"
            >
              About
            </button>
            <button
              onClick={() => onOpenModal('contact')}
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors whitespace-nowrap shrink-0"
            >
              Contact
            </button>
          </nav>

          {/* Zone 3: 1 primary action group */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Favorites quick button */}
            <button
              onClick={onShowFavorites}
              title="Saved Favorites"
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            >
              <Star className="w-4 h-4" />
              {favoritesCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleTheme}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <button
              onClick={() => handleNavClick('all')}
              className="py-2 px-3 text-left rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              All Tools
            </button>
            <button
              onClick={() => handleNavClick('archive')}
              className="py-2 px-3 text-left rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-teal-600 dark:text-teal-400"
            >
              Archive Converters (ZIP, 7Z, TAR...)
            </button>
            <button
              onClick={() => handleNavClick('documents')}
              className="py-2 px-3 text-left rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-teal-600 dark:text-teal-400"
            >
              Document Converters (Word, Excel, EPUB...)
            </button>
            <button
              onClick={() => handleNavClick('chemistry')}
              className="py-2 px-3 text-left rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Chemistry
            </button>
            <button
              onClick={() => handleNavClick('laboratory')}
              className="py-2 px-3 text-left rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Laboratory & QC
            </button>
            <button
              onClick={() => handleNavClick('math')}
              className="py-2 px-3 text-left rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Math Calculators
            </button>
            <button
              onClick={() => handleNavClick('image')}
              className="py-2 px-3 text-left rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Image Tools
            </button>
            <button
              onClick={() => handleNavClick('developer')}
              className="py-2 px-3 text-left rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Developer Tools
            </button>
            <button
              onClick={() => handleNavClick('text')}
              className="py-2 px-3 text-left rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Text & Docs
            </button>
            <button
              onClick={() => handleNavClick('conversions')}
              className="py-2 px-3 text-left rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-teal-600 dark:text-teal-400"
            >
              Unit Conversions
            </button>
            <button
              onClick={() => handleNavClick('education')}
              className="py-2 px-3 text-left rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Education & Time
            </button>
            <button
              onClick={() => handleNavClick('daily')}
              className="py-2 px-3 text-left rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Daily Living
            </button>
            <button
              onClick={() => {
                onOpenModal('about');
                setMobileMenuOpen(false);
              }}
              className="py-2 px-3 text-left rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              About ToolNest
            </button>
            <button
              onClick={() => {
                onOpenModal('contact');
                setMobileMenuOpen(false);
              }}
              className="py-2 px-3 text-left rounded-lg font-medium text-teal-600 dark:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Contact Us
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
            <button
              onClick={() => {
                onToggleTheme();
              }}
              className="text-xs text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-800"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-600" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
