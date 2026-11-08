import React from 'react';
import { CATEGORY_GRID } from '../data/menu';
import { MenuCategoryId } from '../types';

interface CategoryVisualGridProps {
  selectedCategoryId: MenuCategoryId;
  onSelectCategory: (categoryId: MenuCategoryId) => void;
}

export const CategoryVisualGrid: React.FC<CategoryVisualGridProps> = ({
  selectedCategoryId,
  onSelectCategory,
}) => {
  const renderCategoryGraphic = (iconType: string) => {
    switch (iconType) {
      case 'combo':
        return (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#fff0e6] flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-200">
            <span className="text-3xl sm:text-4xl select-none">🍕🥤</span>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#ea580c] rounded-full flex items-center justify-center text-white text-[10px] font-black">
              ★
            </div>
          </div>
        );
      case 'flame':
        return (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#fee2e2] flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-200">
            <span className="text-3xl sm:text-4xl select-none">🌶️🔥</span>
          </div>
        );
      case 'pizza':
        return (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#fef3c7] flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-200">
            <span className="text-3xl sm:text-4xl select-none">🍕</span>
          </div>
        );
      case 'bread':
        return (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#fef9c3] flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-200">
            <span className="text-3xl sm:text-4xl select-none">🥖🧀</span>
          </div>
        );
      case 'cake':
        return (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#fae8ff] flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-200">
            <span className="text-3xl sm:text-4xl select-none">🧁🍫</span>
          </div>
        );
      case 'coffee':
        return (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#ecfdf5] flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-200">
            <span className="text-3xl sm:text-4xl select-none">🧋🧊</span>
          </div>
        );
      case 'discount':
        return (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#ffedd5] flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-200">
            <span className="text-3xl sm:text-4xl select-none">⚡🏷️</span>
          </div>
        );
      case 'twin':
        return (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#e0f2fe] flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-200">
            <span className="text-3xl sm:text-4xl select-none">🍕🍕</span>
          </div>
        );
      default:
        return (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#f3f4f6] flex items-center justify-center">
            <span className="text-3xl">🍽️</span>
          </div>
        );
    }
  };

  return (
    <section className="w-full px-3 sm:px-6 py-6 max-w-6xl mx-auto">
      {/* Section Heading: "Our Menu" in bold rounded typography (#502314) */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2
            className="text-2xl sm:text-3xl font-black tracking-tight text-[#502314] font-bk uppercase"
          >
            Our Menu
          </h2>
          <p className="text-xs sm:text-sm text-[#8c6759] font-medium">
            Explore handcrafted pizzas, loaded sides &amp; special combos
          </p>
        </div>

        {/* View All button */}
        <button
          onClick={() => onSelectCategory('all')}
          className={`text-xs font-black uppercase px-3 py-1.5 rounded-full transition-all cursor-pointer ${
            selectedCategoryId === 'all'
              ? 'bg-[#502314] text-white shadow-xs'
              : 'text-[#ea580c] hover:bg-[#ea580c]/10'
          }`}
        >
          View All Items
        </button>
      </div>

      {/* 4-column responsive grid matching Burger King reference layout (2 cols on mobile, 4 cols on desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {CATEGORY_GRID.map((item) => {
          const isSelected = selectedCategoryId === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectCategory(item.id)}
              className={`group relative p-3 sm:p-4 rounded-3xl bg-white border transition-all duration-200 text-left flex flex-col items-center justify-between cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5 ${
                isSelected
                  ? 'border-[#ea580c] ring-2 ring-[#ea580c]/40 bg-[#fff9f5]'
                  : 'border-[#ede2d5] hover:border-[#ea580c]/50'
              }`}
            >
              {/* Optional top badge */}
              {item.badge && (
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-[#ea580c] text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-xs">
                  {item.badge}
                </span>
              )}

              {/* Graphic Icon */}
              <div className="my-2 flex items-center justify-center">
                {renderCategoryGraphic(item.iconType)}
              </div>

              {/* Label Below */}
              <div className="text-center w-full mt-1">
                <h3
                  className={`font-black text-xs sm:text-sm leading-tight uppercase font-bk transition-colors ${
                    isSelected ? 'text-[#ea580c]' : 'text-[#502314] group-hover:text-[#ea580c]'
                  }`}
                >
                  {item.title}
                </h3>
                {item.subtitle && (
                  <p className="text-[10px] text-[#8c6759] font-medium mt-0.5 truncate">
                    {item.subtitle}
                  </p>
                )}
              </div>

              {/* Active selection dot */}
              {isSelected && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#ea580c] mt-2" />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};
