import React from 'react';
import { Home, Utensils, Crown, Store, ShoppingBag, ArrowRight } from 'lucide-react';
import { BottomNavTab } from '../types';

interface BottomNavProps {
  activeTab: BottomNavTab;
  onTabChange: (tab: BottomNavTab) => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  cartCount,
  cartTotal,
  onOpenCart,
}) => {
  const navItems: { id: BottomNavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'menu', label: 'Menu', icon: Utensils },
    { id: 'rewards', label: 'Rewards', icon: Crown },
    { id: 'stores', label: 'Stores', icon: Store },
  ];

  return (
    <>
      {/* Floating Cart Quick Bar when cart has items */}
      {cartCount > 0 && (
        <div className="fixed bottom-16 sm:bottom-18 inset-x-3 sm:max-w-md sm:mx-auto z-40 animate-in slide-in-from-bottom duration-200">
          <button
            onClick={onOpenCart}
            className="w-full p-3 sm:p-3.5 bg-[#ea580c] hover:bg-[#c2410c] active:scale-98 text-white rounded-2xl shadow-2xl border border-white/20 flex items-center justify-between cursor-pointer transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-black/25 flex items-center justify-center font-black text-xs text-white">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-black uppercase tracking-wider leading-tight">
                  {cartCount} {cartCount === 1 ? 'Item' : 'Items'} Added
                </div>
                <div className="text-[11px] text-orange-200 font-semibold tabular-nums">
                  ₹{cartTotal} (Tap to Checkout)
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-white text-[#502314] px-3.5 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-xs">
              <span>View Cart</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      )}

      {/* Floating Fixed Bottom Navigation Bar (Deep Burgundy Brown #502314) */}
      <nav
        aria-label="Bottom Navigation"
        className="fixed bottom-0 inset-x-0 z-40 bg-[#502314] text-white border-t border-[#3b170c] shadow-[0_-4px_16px_rgba(0,0,0,0.2)]"
      >
        <div className="max-w-lg mx-auto px-2 flex items-center justify-around h-14 sm:h-16">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative flex-1 flex flex-col items-center justify-center h-full py-1 transition-all cursor-pointer select-none ${
                  isActive ? 'text-[#ea580c]' : 'text-white/70 hover:text-white'
                }`}
              >
                {/* Active Top Orange Indicator Bar */}
                {isActive && (
                  <span className="absolute top-0 inset-x-4 h-1 bg-[#ea580c] rounded-b-full shadow-xs" />
                )}

                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[2]'}`} />
                  
                  {/* Rewards Badge dot */}
                  {item.id === 'rewards' && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#502314]" />
                  )}
                </div>

                <span
                  className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider mt-0.5 ${
                    isActive ? 'text-[#ea580c] font-black' : 'text-white/75 font-medium'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
