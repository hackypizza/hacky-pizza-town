'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Menu as MenuIcon } from 'lucide-react';
import BranchLocationPicker from './BranchLocationPicker';

interface HeaderProps {
  onOpenSideMenu?: () => void;
  onOpenCart?: () => void;
  cartCount?: number;
  onBranchChange?: (branch: any) => void;
}

export function BrandLogo() {
  return (
    <Link 
      href="/" 
      className="flex items-center gap-2 text-base sm:text-xl font-black tracking-tight text-white hover:text-orange-200 transition-colors shrink-0"
    >
      <span className="text-2xl select-none" role="img" aria-label="pizza">
        🍕
      </span>
      <span className="uppercase font-extrabold tracking-wide hidden xs:inline">
        HACKY PIZZA
      </span>
    </Link>
  );
}

export default function Header({
  onOpenSideMenu,
  onOpenCart,
  cartCount = 0,
  onBranchChange,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full shadow-md">
      <div className="bg-[#502314] text-white px-3 sm:px-6 py-2.5 sm:py-3 border-b border-[#3b170c]">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            {onOpenSideMenu && (
              <button
                onClick={onOpenSideMenu}
                aria-label="Open navigation menu"
                className="p-1.5 -ml-1 text-white hover:bg-white/10 rounded-xl transition cursor-pointer shrink-0"
              >
                <MenuIcon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
              </button>
            )}

            <div className="flex items-center gap-2 sm:gap-3">
              <BrandLogo />
            </div>
          </div>

          {/* Right: Quick Portals and Cart Trigger */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/manager"
              className="hidden md:inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-orange-200 transition"
            >
              🏪 Manager
            </Link>
            <Link
              href="/kds"
              className="hidden md:inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-amber-200 transition"
            >
              🍳 KDS
            </Link>

            {onOpenCart && (
              <button
                onClick={onOpenCart}
                aria-label="View Cart"
                className="relative p-2 text-white hover:bg-white/10 active:scale-95 rounded-xl transition cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#ea580c] text-white text-[10px] sm:text-xs font-black rounded-full h-4 sm:h-5 min-w-4 sm:min-w-5 px-1 flex items-center justify-center border-2 border-[#502314] shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Deliver From Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#5B0E14]/10 bg-[#FFFBF2]">
        <span className="text-xs font-black text-[#5B0E14] uppercase tracking-wider">DELIVER FROM:</span>
        <BranchLocationPicker onBranchChange={onBranchChange} />
      </div>
    </header>
  );
}
