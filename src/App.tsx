import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import SearchBar from './components/SearchBar';
import ToolCard from './components/ToolCard';
import ToolLayout from './components/ToolLayout';
import LegalModals from './components/LegalModals';

import { CategoryId, ModalType, ToolItem } from './types';
import { TOOLS } from './data/tools';
import {
  getFavorites,
  toggleFavorite,
  getSavedTheme,
  saveTheme
} from './utils/storage';

// Tool Components
import PercentageCalculator from './tools/math/PercentageCalculator';
import MolarityCalculator from './tools/chemistry/MolarityCalculator';
import DilutionCalculator from './tools/chemistry/DilutionCalculator';
import MassConcentrationCalculator from './tools/chemistry/MassConcentrationCalculator';
import UnitConverter from './tools/daily/UnitConverter';
import DateDifferenceCalculator from './tools/education/DateDifferenceCalculator';
import StopwatchTool from './tools/education/StopwatchTool';
import WordCounter from './tools/text/WordCounter';
import JsonFormatter from './tools/developer/JsonFormatter';
import DiscountCalculator from './tools/math/DiscountCalculator';
import AgeCalculator from './tools/education/AgeCalculator';
import ImageCompressor from './tools/image/ImageCompressor';

// Bonus Tools
import RSDCalculator from './tools/laboratory/RSDCalculator';
import PHCalculator from './tools/chemistry/PHCalculator';
import Base64Tool from './tools/developer/Base64Tool';
import PasswordGenerator from './tools/developer/PasswordGenerator';
import TextCaseConverter from './tools/text/TextCaseConverter';
import TipCalculator from './tools/daily/TipCalculator';

// Phase 2 Tools
import DissolutionCalculator from './tools/laboratory/DissolutionCalculator';
import CompoundInterestCalculator from './tools/math/CompoundInterestCalculator';
import BMICalculator from './tools/daily/BMICalculator';
import QrCodeGenerator from './tools/developer/QrCodeGenerator';
import AssayCalculator from './tools/laboratory/AssayCalculator';

// Phase 3 Tools
import PdfMergeTool from './tools/text/PdfMergeTool';
import PdfSplitTool from './tools/text/PdfSplitTool';

import { Sparkles, ShieldCheck, Zap, Star, ArrowRight, Layers } from 'lucide-react';

export default function App() {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Initialize theme, favorites, and ensure Preview always opens on Homepage
  useEffect(() => {
    const saved = getSavedTheme();
    setTheme(saved);
    const isDark = saved === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.body.classList.toggle('dark', isDark);

    setFavorites(getFavorites());

    // Always clear leftover URL hash so preview opens directly on Home page
    if (window.location.hash) {
      try {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      } catch {
        window.location.hash = '';
      }
    }
    setActiveToolId(null);

    // Support browser / mobile back button navigation
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.toolId) {
        setActiveToolId(event.state.toolId);
      } else {
        setActiveToolId(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    saveTheme(nextTheme);
    const isDark = nextTheme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.body.classList.toggle('dark', isDark);
  };

  const handleToggleFavorite = (toolId: string) => {
    const updated = toggleFavorite(toolId);
    setFavorites(updated);
  };

  const handleOpenTool = (tool: ToolItem) => {
    setActiveToolId(tool.id);
    try {
      window.history.pushState({ toolId: tool.id }, '', window.location.pathname + window.location.search);
    } catch {
      // ignore
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setActiveToolId(null);
    try {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    } catch {
      window.location.hash = '';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter tools
  const filteredTools = TOOLS.filter((tool) => {
    // Favorites filter
    if (showOnlyFavorites && !favorites.includes(tool.id)) {
      return false;
    }
    // Category filter
    if (selectedCategory !== 'all' && tool.category !== selectedCategory) {
      return false;
    }
    // Subcategory filter
    if (selectedSubCategory !== 'all' && tool.subCategory !== selectedSubCategory) {
      return false;
    }
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = tool.name.toLowerCase().includes(q);
      const matchDesc = tool.shortDescription.toLowerCase().includes(q);
      const matchTags = tool.tags.some(t => t.toLowerCase().includes(q));
      const matchCat = tool.categoryName.toLowerCase().includes(q);
      return matchName || matchDesc || matchTags || matchCat;
    }
    return true;
  });

  const popularTools = TOOLS.filter(t => t.isPopular && t.status === 'available');

  // Active tool lookup
  const currentTool = TOOLS.find(t => t.id === activeToolId);
  const relatedTools = currentTool
    ? TOOLS.filter(t => t.category === currentTool.category && t.id !== currentTool.id && t.status === 'available')
    : [];

  const renderActiveToolComponent = (id: string) => {
    switch (id) {
      case 'percentage-calculator':
        return <PercentageCalculator />;
      case 'molarity-calculator':
        return <MolarityCalculator />;
      case 'dilution-calculator':
        return <DilutionCalculator />;
      case 'mass-concentration-calculator':
        return <MassConcentrationCalculator />;
      case 'unit-converter':
        return <UnitConverter />;
      case 'date-difference-calculator':
        return <DateDifferenceCalculator />;
      case 'stopwatch':
        return <StopwatchTool />;
      case 'word-character-counter':
        return <WordCounter />;
      case 'json-formatter':
        return <JsonFormatter />;
      case 'discount-calculator':
        return <DiscountCalculator />;
      case 'age-calculator':
        return <AgeCalculator />;
      case 'image-compressor':
        return <ImageCompressor />;
      case 'rsd-calculator':
        return <RSDCalculator />;
      case 'ph-calculator':
        return <PHCalculator />;
      case 'base64-tool':
        return <Base64Tool />;
      case 'password-generator':
        return <PasswordGenerator />;
      case 'text-case-converter':
        return <TextCaseConverter />;
      case 'tip-calculator':
        return <TipCalculator />;
      case 'dissolution-calculator':
        return <DissolutionCalculator />;
      case 'compound-interest':
        return <CompoundInterestCalculator />;
      case 'bmi-calculator':
        return <BMICalculator />;
      case 'qr-code-generator':
        return <QrCodeGenerator />;
      case 'assay-calculator':
        return <AssayCalculator />;
      case 'pdf-merge':
        return <PdfMergeTool />;
      case 'pdf-split':
        return <PdfSplitTool />;
      default:
        return (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-heading font-semibold text-slate-800 dark:text-white text-lg">
              Tool in Development
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              This tool is part of the upcoming phase roadmap and will run locally in browser memory.
            </p>
            <button
              onClick={handleBackToHome}
              className="mt-4 px-4 py-2 bg-teal-600 text-white text-xs font-medium rounded-lg"
            >
              Return to Catalog
            </button>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'dark' : ''} bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors`}>
      {/* Header */}
      <Header
        currentCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSelectedSubCategory('all');
          setShowOnlyFavorites(false);
        }}
        activeToolId={activeToolId}
        onBackToHome={handleBackToHome}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenModal={(modal) => setActiveModal(modal)}
        onShowFavorites={() => {
          setShowOnlyFavorites(true);
          setActiveToolId(null);
        }}
        favoritesCount={favorites.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ACTIVE TOOL VIEW */}
        {activeToolId && currentTool ? (
          <ToolLayout
            tool={currentTool}
            onBack={handleBackToHome}
            isFavorite={favorites.includes(currentTool.id)}
            onToggleFavorite={handleToggleFavorite}
            relatedTools={relatedTools}
            onOpenRelated={handleOpenTool}
          >
            {renderActiveToolComponent(activeToolId)}
          </ToolLayout>
        ) : (
          /* HOMEPAGE VIEW */
          <div className="space-y-10 sm:space-y-12">
            {/* Hero Section */}
            <section className="text-center max-w-3xl mx-auto pt-4 sm:pt-8 space-y-4">
              <h1 className="font-heading font-extrabold text-3xl sm:text-5xl tracking-tight text-slate-900 dark:text-white text-balance leading-tight">
                Every tool. <span className="text-teal-600 dark:text-teal-400">One place.</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                A clean, mobile-first suite of chemistry, analytical laboratory, everyday math, text, media, and developer utilities. Fast, zero-tracking, and completely free.
              </p>

              {/* Prominent Search & Filters */}
              <div className="pt-2">
                <SearchBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedCategory={selectedCategory}
                  onSelectCategory={(cat) => {
                    setSelectedCategory(cat);
                    setSelectedSubCategory('all');
                  }}
                  selectedSubCategory={selectedSubCategory}
                  onSelectSubCategory={setSelectedSubCategory}
                  showOnlyFavorites={showOnlyFavorites}
                  onToggleOnlyFavorites={() => setShowOnlyFavorites(!showOnlyFavorites)}
                  totalAvailableCount={TOOLS.filter(t => t.status === 'available').length}
                  favoritesCount={favorites.length}
                />
              </div>
            </section>

            {/* Popular & Essential Tools Showcase (if not searching) */}
            {!searchQuery && !showOnlyFavorites && selectedCategory === 'all' && selectedSubCategory === 'all' && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-heading font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
                      Popular & Essential Tools
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Most frequently used laboratory, math, and developer calculators
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {popularTools.slice(0, 6).map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      onOpen={handleOpenTool}
                      isFavorite={favorites.includes(tool.id)}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Main Catalog Grid */}
            <section className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <h2 className="font-heading font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
                    {showOnlyFavorites
                      ? `Saved Favorite Tools (${filteredTools.length})`
                      : searchQuery
                      ? `Search Results for "${searchQuery}" (${filteredTools.length})`
                      : selectedCategory === 'all'
                      ? 'Browse Full Tools Catalog'
                      : `${selectedCategory.toUpperCase()} Tools (${filteredTools.length})`}
                  </h2>
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  {filteredTools.length} tools
                </div>
              </div>

              {filteredTools.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTools.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      onOpen={handleOpenTool}
                      isFavorite={favorites.includes(tool.id)}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <h3 className="font-heading font-semibold text-slate-800 dark:text-white text-base">
                    No tools match your criteria
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try searching for another keyword or clear your category and favorite filters.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedSubCategory('all');
                      setShowOnlyFavorites(false);
                    }}
                    className="py-1.5 px-3.5 bg-teal-600 text-white text-xs font-medium rounded-lg shadow-xs hover:bg-teal-700 transition-colors"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
            </section>

            {/* Trust & Transparency Feature Strip */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="font-heading font-semibold text-sm text-slate-900 dark:text-white">
                    100% In-Browser Processing
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Zero server uploads. Your chemical formulas, image files, and text inputs never leave your device.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h4 className="font-heading font-semibold text-sm text-slate-900 dark:text-white">
                    Mobile-First Responsive Design
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Optimized for instant calculations and accessible reading across smartphones, tablets, and laptops.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer onOpenModal={(modal) => setActiveModal(modal)} />

      {/* Legal & Deployment Modals */}
      <LegalModals modalType={activeModal} onClose={() => setActiveModal(null)} />
    </div>
  );
}
