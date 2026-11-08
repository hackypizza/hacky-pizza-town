import React from 'react';
import { Search, Sparkles, Pizza, UtensilsCrossed, Coffee, Cake, Flame } from 'lucide-react';
import { CategoryType } from '../types';

interface CategoriesBarProps {
  categories: CategoryType[];
  activeCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isVegOnly: boolean;
  onToggleVegOnly: () => void;
  categoryCounts: Record<CategoryType, number>;
}

export const CategoriesBar: React.FC<CategoriesBarProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  isVegOnly,
  onToggleVegOnly,
  categoryCounts,
}) => {
  const getCategoryIcon = (category: CategoryType) => {
    switch (category) {
      case 'All':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'Pizzas':
        return <Pizza className="w-3.5 h-3.5" />;
      case 'Garlic Breads':
        return <UtensilsCrossed className="w-3.5 h-3.5" />;
      case 'Beverages':
        return <Coffee className="w-3.5 h-3.5" />;
      case 'Desserts':
        return <Cake className="w-3.5 h-3.5" />;
      default:
        return <Flame className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="sticky top-16 sm:top-20 z-30 bg-[#fffaf0]/95 backdrop-blur-md border-b border-[#f0e4d4] py-3.5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        {/* Top line of Categories Bar: Categories + Veg Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Scrollable category tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              const count = categoryCounts[cat] || 0;
              return (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-tight whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#502314] text-white shadow-sm ring-2 ring-[#ea580c]/50'
                      : 'bg-white text-[#502314]/80 hover:bg-[#faebd7] hover:text-[#502314] border border-[#e8dacb]'
                  }`}
                >
                  <span className={isActive ? 'text-[#ea580c]' : 'text-[#ea580c]/80'}>
                    {getCategoryIcon(cat)}
                  </span>
                  <span>{cat}</span>
                  <span
                    className={`ml-0.5 text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-[#ea580c] text-white' : 'bg-[#f4e7d8] text-[#713f12]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Search & Veg Filter */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Search input */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 text-[#8c6759] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search pizzas, sides..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-[#e6d8c8] rounded-xl text-[#3b190f] placeholder-[#a88d7f] focus:outline-hidden focus:ring-2 focus:ring-[#ea580c] focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8c6759] hover:text-black font-bold p-0.5"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Veg Only Toggle */}
            <button
              onClick={onToggleVegOnly}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer select-none ${
                isVegOnly
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-400 ring-2 ring-emerald-500/20'
                  : 'bg-white text-zinc-600 border-[#e6d8c8] hover:bg-zinc-50'
              }`}
            >
              <span className="w-3 h-3 rounded-xs border-2 border-emerald-600 flex items-center justify-center p-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              </span>
              <span>Veg Only</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
