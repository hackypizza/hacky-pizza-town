'use client';

import React from 'react';
import { 
  X, 
  Crown, 
  Coins, 
  Wallet, 
  Clock, 
  MapPin, 
  Tag, 
  HelpCircle, 
  PhoneCall, 
  MessageSquare, 
  ShieldCheck, 
  LogOut, 
  ChevronRight, 
  User as UserIcon,
  Sparkles,
  Store,
  ChefHat,
  Bike
} from 'lucide-react';
import { UserProfile, BottomNavTab } from '../types';

interface SideMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onNavigateTab: (tab: BottomNavTab) => void;
  onOpenStores: () => void;
  onOpenRecentOrders?: () => void;
  onLogout?: () => void;
}

export const SideMenuDrawer: React.FC<SideMenuDrawerProps> = ({
  isOpen,
  onClose,
  user,
  onOpenAuth,
  onNavigateTab,
  onOpenStores,
  onOpenRecentOrders,
  onLogout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Drawer Panel */}
      <aside className="absolute inset-y-0 left-0 max-w-full flex pr-10">
        <div className="w-screen max-w-xs sm:max-w-sm bg-[#FFFBF2] shadow-2xl flex flex-col justify-between border-r-2 border-[#502314] animate-in slide-in-from-left duration-200 text-[#502314]">
          
          {/* Top User Lockup (Burger King Deep Chocolate Brown) */}
          <div className="p-5 bg-[#502314] text-white space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🍕</span>
                <span className="font-black text-lg tracking-tight uppercase">
                  HACKY PIZZA TOWN
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Banner */}
            {user ? (
              <div className="p-3.5 bg-white/10 rounded-2xl border border-white/15 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#EA580C] to-[#D64500] flex items-center justify-center font-black text-lg text-white shadow-md">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-black text-sm text-white">{user.name}</h4>
                      <span className="p-0.5 rounded-full bg-amber-400 text-[#502314]">
                        <Crown className="w-3 h-3 fill-current" />
                      </span>
                    </div>
                    <p className="text-xs text-amber-200">+91 {user.phone}</p>
                    <span className="text-[10px] font-bold text-orange-300 uppercase tracking-wider block mt-0.5">
                      {user.role || 'Crown Member'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#EA580C] to-[#D64500] hover:from-[#c2410c] hover:to-[#b91c1c] text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserIcon className="w-4 h-4" />
                <span>Log In / Sign Up (+₹50 Bonus)</span>
              </button>
            )}

            {/* TWO PRIMARY PILL CARDS (EXACT MATCH TO BURGER KING) */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              
              {/* Card 1: Show Crowns / Pizza Coins with RED/ORANGE REDEEM button */}
              <div className="bg-[#3D1A0E] p-3 rounded-2xl border border-[#6B301C] flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <Coins className="w-4 h-4 fill-current" />
                    <span className="text-[11px] font-black uppercase">Pizza Coins</span>
                  </div>
                  <div className="text-base font-black text-white mt-0.5">
                    {user?.crownPoints || 150} 👑
                  </div>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateTab('rewards');
                  }}
                  className="w-full py-1.5 bg-[#EA580C] hover:bg-[#c2410c] text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition text-center shadow-xs"
                >
                  Redeem
                </button>
              </div>

              {/* Card 2: Show Wallet Balance (₹50) with right chevron */}
              <div 
                onClick={() => {
                  onClose();
                  onNavigateTab('rewards');
                }}
                className="bg-[#3D1A0E] p-3 rounded-2xl border border-[#6B301C] flex flex-col justify-between space-y-2 cursor-pointer hover:bg-[#482012] transition"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Wallet className="w-4 h-4" />
                    <span className="text-[11px] font-black uppercase">Hacky Wallet</span>
                  </div>
                  <div className="text-base font-black text-white mt-0.5">
                    ₹{user?.walletBalance ?? 0}
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold text-amber-200">
                  <span>Cashback</span>
                  <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
                </div>
              </div>

            </div>
          </div>

          {/* MENU ITEMS LIST (EXACT BURGER KING MATCH) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1 font-bold text-xs uppercase tracking-wide">
            
            {/* 1. Recent Orders */}
            <button
              onClick={() => {
                onClose();
                if (onOpenRecentOrders) {
                  onOpenRecentOrders();
                } else {
                  onNavigateTab('menu');
                }
              }}
              className="w-full p-3 rounded-2xl hover:bg-[#F3E5D6] text-[#502314] flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-orange-100 flex items-center justify-center text-[#EA580C]">
                  <Clock className="w-4 h-4" />
                </div>
                <span>Recent Orders</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#7A4B3A]" />
            </button>

            {/* 2. Saved Delivery Addresses */}
            <button
              onClick={() => {
                onClose();
                onOpenStores();
              }}
              className="w-full p-3 rounded-2xl hover:bg-[#F3E5D6] text-[#502314] flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-orange-100 flex items-center justify-center text-[#EA580C]">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>Saved Delivery Addresses</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#7A4B3A]" />
            </button>

            {/* 3. Saved Hacky Deals & Coupons */}
            <button
              onClick={() => {
                onClose();
                onNavigateTab('rewards');
              }}
              className="w-full p-3 rounded-2xl hover:bg-[#F3E5D6] text-[#502314] flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-orange-100 flex items-center justify-center text-[#EA580C]">
                  <Tag className="w-4 h-4" />
                </div>
                <span>Saved Hacky Deals &amp; Coupons</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#7A4B3A]" />
            </button>

            {/* 4. FAQs & Store Support */}
            <button
              onClick={() => {
                alert('Hacky Pizza Town Mahmudabad\n100% Wood-Fired Oven Pizza\nDelivery Time: 25-35 Minutes\nCustomer Helpdesk: 9876543210');
              }}
              className="w-full p-3 rounded-2xl hover:bg-[#F3E5D6] text-[#502314] flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-orange-100 flex items-center justify-center text-[#EA580C]">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <span>FAQs &amp; Store Support</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#7A4B3A]" />
            </button>

            {/* 5. Customer Care (Call & WhatsApp) */}
            <div className="pt-1">
              <a
                href="tel:9876543210"
                className="w-full p-3 rounded-2xl bg-[#FFF2E2] hover:bg-[#FFE6D0] text-[#EA580C] flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl bg-[#EA580C] text-white flex items-center justify-center">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <span>Call Customer Care</span>
                </div>
                <span className="text-[11px] font-black">9876543210</span>
              </a>
            </div>

            <div className="pt-1">
              <a
                href="https://wa.me/919876543210?text=Hi%20Hacky%20Pizza%20Town%20I%20need%20help%20with%20my%20order"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span>WhatsApp Support</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            <div className="border-t border-[#E8D6BF] my-2" />

            {/* 6. Terms, Nutrition & FSSAI Info */}
            <div className="p-3 bg-white rounded-2xl border border-[#E8D6BF] space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-[#502314] font-black">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>FSSAI Lic. #22724921000142</span>
              </div>
              <p className="text-[10px] text-[#7A4B3A] leading-relaxed normal-case font-medium">
                100% Dairy Mozzarella · Wood-Fired at 400°C · Clean Cooking &amp; Sealed Delivery.
              </p>
            </div>

            {/* Staff ERP Direct Links */}
            <div className="pt-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-[#7A4B3A] mb-1 px-1">
                Restaurant ERP Panels
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <a href="/manager" className="p-2 rounded-xl bg-[#F8EFE0] hover:bg-[#EA580C] hover:text-white flex items-center gap-1.5 transition">
                  <Store className="w-3.5 h-3.5" /> Store Manager
                </a>
                <a href="/kds" className="p-2 rounded-xl bg-[#F8EFE0] hover:bg-amber-600 hover:text-white flex items-center gap-1.5 transition">
                  <ChefHat className="w-3.5 h-3.5" /> Kitchen KDS
                </a>
                <a href="/rider" className="p-2 rounded-xl bg-[#F8EFE0] hover:bg-emerald-600 hover:text-white flex items-center gap-1.5 transition">
                  <Bike className="w-3.5 h-3.5" /> Rider Panel
                </a>
                <a href="/admin" className="p-2 rounded-xl bg-[#F8EFE0] hover:bg-purple-600 hover:text-white flex items-center gap-1.5 transition">
                  <Crown className="w-3.5 h-3.5" /> Super Admin
                </a>
              </div>
            </div>

            {/* 7. Logout */}
            {user && (
              <div className="pt-3">
                <button
                  onClick={() => {
                    if (onLogout) onLogout();
                    onClose();
                  }}
                  className="w-full p-3 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-between transition cursor-pointer"
                >
                  <div className="flex items-center gap-2 font-black">
                    <LogOut className="w-4 h-4" />
                    <span>Log Out Account</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

          {/* Footer note */}
          <div className="p-4 bg-[#F8EFE0] border-t border-[#E8D6BF] text-center text-[10px] font-bold text-[#7A4B3A]">
            Hacky Pizza Town Mahmudabad · Have It Your Way
          </div>

        </div>
      </aside>
    </div>
  );
};
