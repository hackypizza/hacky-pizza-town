import React from 'react';
import { ShoppingBag, User, MapPin } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  totalCartCount: number;
  totalCartAmount: number;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  user: UserProfile | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalCartCount,
  totalCartAmount,
  onOpenCart,
  onOpenAuth,
  user,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#502314] text-white shadow-md border-b border-[#3d180c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          {/* Brand & Location Lockup */}
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            <a
              href="#"
              className="flex items-center gap-2 text-lg sm:text-2xl font-black tracking-tight text-white hover:text-orange-200 transition-colors shrink-0"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <span className="text-2xl sm:text-3xl select-none" role="img" aria-label="pizza">
                🍕
              </span>
              <span className="truncate uppercase font-extrabold tracking-wide">
                HACKY PIZZA TOWN
              </span>
            </a>

            {/* Location Tag */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-black/25 rounded-full border border-white/15 text-xs text-orange-200 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-[#ea580c] shrink-0" />
              <span className="font-semibold text-white">Mahmudabad Store</span>
              <span className="text-white/40">·</span>
              <span className="text-xs text-emerald-400 font-medium">Open Now</span>
            </div>
          </div>

          {/* Location for mobile sub-row or inline */}
          <div className="sm:hidden flex items-center text-[11px] text-orange-200/90 font-medium truncate">
            <MapPin className="w-3 h-3 text-[#ea580c] mr-1 shrink-0" />
            <span className="truncate">Mahmudabad Store</span>
          </div>

          {/* Right Side: Cart button + Login/Sign up button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* User Profile / Login Button */}
            {user ? (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white/95 bg-white/10 hover:bg-white/15 rounded-lg border border-white/15 transition-colors cursor-pointer"
                title="Account Settings"
              >
                <div className="w-5 h-5 rounded-full bg-[#ea580c] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:inline font-semibold max-w-[100px] truncate">
                  {user.name.split(' ')[0]}
                </span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-white/10 hover:bg-white/20 active:scale-98 rounded-lg border border-white/20 transition-all cursor-pointer whitespace-nowrap"
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-300" />
                <span className="hidden xs:inline">Login / Sign Up</span>
                <span className="xs:hidden">Login</span>
              </button>
            )}

            {/* Cart Button with dynamic count */}
            <button
              onClick={onOpenCart}
              aria-label={`View Cart with ${totalCartCount} items`}
              className={`relative flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm text-white transition-all shadow-sm active:scale-98 cursor-pointer ${
                totalCartCount > 0
                  ? 'bg-[#ea580c] hover:bg-[#c2410c] ring-2 ring-[#ea580c]/50'
                  : 'bg-white/10 hover:bg-white/20 text-white/90 border border-white/15'
              }`}
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-[#502314] text-[10px] sm:text-xs font-black rounded-full h-4 sm:h-4.5 min-w-4 sm:min-w-4.5 px-1 flex items-center justify-center shadow-xs animate-in zoom-in-50 duration-200">
                    {totalCartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline font-bold">Cart</span>
              {totalCartCount > 0 && (
                <span className="hidden md:inline text-xs font-black bg-black/20 px-1.5 py-0.5 rounded-sm">
                  ₹{totalCartAmount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
