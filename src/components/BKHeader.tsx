import React from 'react';
import { Menu, MapPin, ChevronDown, ShoppingBag } from 'lucide-react';
import { OrderMode } from '../types';
import BranchLocationPicker from './BranchLocationPicker';

interface BKHeaderProps {
  orderMode: OrderMode;
  onToggleOrderMode: (mode: OrderMode) => void;
  currentOutlet: string;
  onOpenOutletPicker: () => void;
  onOpenSideMenu: () => void;
  cartCount: number;
  onOpenCart: () => void;
}

export const BKHeader: React.FC<BKHeaderProps> = ({
  orderMode,
  onToggleOrderMode,
  currentOutlet,
  onOpenOutletPicker,
  onOpenSideMenu,
  cartCount,
  onOpenCart,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full shadow-md">
      {/* 1. Main Top Bar: Deep Burgundy Brown #502314 */}
      <div className="bg-[#502314] text-white px-3 sm:px-6 py-2.5 sm:py-3 border-b border-[#3b170c]">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Hamburger menu icon */}
          <button
            onClick={onOpenSideMenu}
            aria-label="Open navigation menu"
            className="p-2 -ml-1 text-white hover:bg-white/10 active:scale-95 rounded-xl transition-all cursor-pointer shrink-0"
          >
            <Menu className="w-6 h-6 stroke-[2.2]" />
          </button>

          {/* Center: Burger King Style Pill Toggle: DELIVERY vs DINE-IN / TAKEAWAY */}
          <div className="flex-1 max-w-xs sm:max-w-sm flex items-center justify-center">
            <div className="w-full bg-[#3d180c] p-1 rounded-full border border-white/15 flex items-center shadow-inner">
              <button
                type="button"
                onClick={() => onToggleOrderMode('DELIVERY')}
                className={`flex-1 py-1.5 px-2.5 sm:px-4 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer text-center ${
                  orderMode === 'DELIVERY'
                    ? 'bg-[#ea580c] text-white shadow-md'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Delivery
              </button>

              <button
                type="button"
                onClick={() => onToggleOrderMode('DINE_IN')}
                className={`flex-1 py-1.5 px-2 sm:px-3 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer text-center truncate ${
                  orderMode === 'DINE_IN'
                    ? 'bg-[#ea580c] text-white shadow-md'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Dine-in / Takeaway
              </button>
            </div>
          </div>

          {/* Right: Quick Cart Shortcut (with count badge) */}
          <button
            onClick={onOpenCart}
            aria-label="View Cart"
            className="relative p-2 text-white hover:bg-white/10 active:scale-95 rounded-xl transition-all cursor-pointer shrink-0"
          >
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#ea580c] text-white text-[10px] sm:text-xs font-black rounded-full h-4 sm:h-5 min-w-4 sm:min-w-5 px-1 flex items-center justify-center border-2 border-[#502314] shadow-xs">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2. Sub-bar: Store Selector DELIVER FROM */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#5B0E14]/10 bg-[#FFFBF2]">
        <span className="text-xs font-black text-[#5B0E14] uppercase tracking-wider">DELIVER FROM:</span>
        <BranchLocationPicker />
      </div>
    </header>
  );
};
