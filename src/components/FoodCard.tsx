import React, { useState } from 'react';
import { Plus, Minus, Star, ChevronDown, Check } from 'lucide-react';
import { MenuItem, PizzaSizeOption } from '../types';
import { VegIndicator } from './VegIndicator';
import { FoodVisual } from './FoodVisual';

interface FoodCardProps {
  item: MenuItem;
  cartQuantity: number;
  onAddToCart: (item: MenuItem, selectedSize?: 'Regular' | 'Medium' | 'Large') => void;
  onUpdateQuantity: (menuItemId: string, change: number, selectedSize?: 'Regular' | 'Medium' | 'Large') => void;
  onDirectSetQuantity: (menuItemId: string, qty: number, selectedSize?: 'Regular' | 'Medium' | 'Large') => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  item,
  cartQuantity,
  onAddToCart,
  onUpdateQuantity,
}) => {
  const [selectedSize, setSelectedSize] = useState<'Regular' | 'Medium' | 'Large'>(
    item.sizes ? 'Regular' : 'Regular'
  );
  const [showSizePicker, setShowSizePicker] = useState<boolean>(false);

  // Determine active price based on selected size (if pizza)
  const currentSizeObj: PizzaSizeOption | undefined = item.sizes?.find((s) => s.name === selectedSize);
  const activePrice = currentSizeObj ? currentSizeObj.price : item.price;

  const handleAddClick = () => {
    onAddToCart(item, item.sizes ? selectedSize : undefined);
  };

  const handleDecrement = () => {
    onUpdateQuantity(item.id, -1, item.sizes ? selectedSize : undefined);
  };

  const handleIncrement = () => {
    onUpdateQuantity(item.id, 1, item.sizes ? selectedSize : undefined);
  };

  return (
    <div className="group bg-white rounded-2xl border border-[#ede3d7] shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden">
      <div>
        {/* Visual Top Container */}
        <div className="relative aspect-4/3 w-full bg-[#faebd7]/50 overflow-hidden border-b border-[#f3e7db]">
          <FoodVisual type={item.visualType} />

          {/* Bestseller Badge */}
          {item.isBestseller && (
            <div className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-md bg-[#502314] text-amber-200 text-[10px] font-black uppercase tracking-wider shadow-xs">
              ★ Bestseller
            </div>
          )}

          {/* Category Tag subtle */}
          <div className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[11px] font-semibold text-[#502314] shadow-xs">
            {item.categoryLabel}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5 space-y-3">
          {/* Header Row: Veg Icon + Title + Rating */}
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <VegIndicator isVeg={item.isVeg} />
                <h3
                  className="font-bold text-base sm:text-lg text-[#321207] leading-snug tracking-tight group-hover:text-[#ea580c] transition-colors"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {item.name}
                </h3>
              </div>

              {/* Star Rating */}
              <div className="flex items-center gap-1 text-[11px] font-bold bg-[#fff8eb] px-1.5 py-0.5 rounded-md border border-[#fde68a] text-amber-800 shrink-0">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span className="tabular-nums">{item.rating}</span>
                <span className="text-[#a16207]/70 text-[10px]">({item.ratingCount})</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-[13px] text-[#71594f] leading-relaxed line-clamp-2">
              {item.description}
            </p>
          </div>

          {/* Size Selector for Pizzas */}
          {item.sizes && (
            <div className="pt-1">
              <div className="flex items-center justify-between text-xs text-[#8c6759] mb-1">
                <span className="font-medium text-[11px] uppercase tracking-wider text-[#a88d7f]">Select Size:</span>
                <button
                  type="button"
                  onClick={() => setShowSizePicker(!showSizePicker)}
                  className="sm:hidden text-[11px] font-bold text-[#ea580c] flex items-center gap-0.5"
                >
                  <span>{selectedSize}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>

              {/* Size buttons */}
              <div className="grid grid-cols-3 gap-1.5 bg-[#fbf5ee] p-1 rounded-xl border border-[#efe2d3]">
                {item.sizes.map((s) => {
                  const isSelected = selectedSize === s.name;
                  return (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => setSelectedSize(s.name)}
                      className={`py-1 px-1.5 rounded-lg text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#502314] text-white shadow-xs font-bold'
                          : 'text-[#502314]/80 hover:bg-white/80 font-medium'
                      }`}
                    >
                      <div className="text-[11px] leading-tight flex items-center justify-center gap-0.5">
                        {isSelected && <Check className="w-2.5 h-2.5 text-[#ea580c]" />}
                        <span>{s.name}</span>
                      </div>
                      <div className={`text-[10px] tabular-nums ${isSelected ? 'text-orange-200' : 'text-[#8c6759]'}`}>
                        ₹{s.price}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Action Row */}
      <div className="px-4 sm:px-5 pb-4 pt-1 flex items-center justify-between border-t border-[#f7ede2] mt-2">
        {/* Price */}
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-[#a88d7f] tracking-wider">Price</span>
          <span className="text-lg sm:text-xl font-extrabold text-[#321207] tabular-nums tracking-tight">
            ₹{activePrice}
          </span>
        </div>

        {/* Add Button or Quantity Stepper */}
        <div>
          {cartQuantity === 0 ? (
            <button
              onClick={handleAddClick}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#ea580c] hover:bg-[#c2410c] active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
            >
              <span>ADD</span>
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-[#502314] text-white rounded-xl p-1 shadow-sm">
              <button
                onClick={handleDecrement}
                aria-label="Decrease quantity"
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 active:scale-90 transition-all cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5 text-white" />
              </button>
              <span className="font-bold text-sm tabular-nums min-w-5 text-center text-amber-200">
                {cartQuantity}
              </span>
              <button
                onClick={handleIncrement}
                aria-label="Increase quantity"
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#ea580c] hover:bg-[#c2410c] active:scale-90 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
