'use client';

import React, { useState, useEffect } from 'react';
import { 
  Menu as MenuIcon, 
  MapPin, 
  Home, 
  UtensilsCrossed, 
  Crown, 
  ShoppingBag, 
  ChevronRight, 
  Search, 
  Plus, 
  Minus, 
  Bike, 
  ShieldCheck, 
  Banknote, 
  X, 
  Sparkles, 
  User as UserIcon, 
  LogOut, 
  Lock, 
  Mail, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  ArrowRight,
  Gift,
  SlidersHorizontal,
  Coins
} from 'lucide-react';
import AdminPage from './pages/AdminPage';
import ManagerPage from './pages/ManagerPage';
import RiderPage from './pages/RiderPage';
import SuperAdminPage from './app/admin/page';
import StoreManagerPage from './app/manager/page';
import KitchenDisplayPage from './app/kds/page';
import RiderDeliveryPage from './app/rider/page';
import InfluencerAffiliatePage from './app/affiliate/page';
import OrderStatusPage from './app/order-status/page';
import PizzaCustomizerModal, { PizzaCustomizerTarget } from './components/PizzaCustomizerModal';
import PizzaCustomizer from './components/PizzaCustomizer';
import CustomiseMealModal from './components/CustomiseMealModal';
import MealCustomizerModal from './components/MealCustomizerModal';
import ProductCard from './components/ProductCard';
import OrderSummary from './components/OrderSummary';
import { SideMenuDrawer } from './components/SideMenuDrawer';
import AuthModal from './components/AuthModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import RecentOrdersModal from './components/RecentOrdersModal';
import BannerSlider from './components/BannerSlider';
import { CartLineItem, UserProfile } from './types';
import { fetchLiveStoreData } from './lib/neonClient';

// --- PREMIUM FOOD MENU DATA ---
const CATEGORIES_DATA = [
  { id: 'combos', name: 'Take Off Combos', icon: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=160&auto=format&fit=crop&q=80' },
  { id: 'value', name: 'Value Meals (Save Upto 40%)', icon: 'https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?w=160&auto=format&fit=crop&q=80' },
  { id: 'feast', name: 'Feast & Fly', icon: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=160&auto=format&fit=crop&q=80' },
  { id: 'periperi', name: 'Peri Peri Fest', icon: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=160&auto=format&fit=crop&q=80' },
  { id: 'solo', name: 'Celebrations Meal for 1', icon: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=160&auto=format&fit=crop&q=80' },
  { id: 'family', name: 'Celebrations Meal for 2', icon: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=160&auto=format&fit=crop&q=80' },
  { id: 'sides', name: 'Garlic Bread & Dips', icon: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=160&auto=format&fit=crop&q=80' },
  { id: 'drinks', name: 'Cold Coffee & Shakes', icon: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=160&auto=format&fit=crop&q=80' },
];

const PRODUCTS_DATA = [
  {
    id: 'p1',
    categoryId: 'combos',
    name: 'Hacky Veggie Pizza Meal.',
    desc: 'Medium Margherita Pizza + Cheesy Garlic Bread + 1 Chilled Coke / Cold Coffee.',
    price: 349,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'p2',
    categoryId: 'combos',
    name: 'Hacky Peppy Paneer Meal.',
    desc: 'Spicy Paneer Pizza + Peri-Peri Stuffed Garlic Bread + 2 Dips + 1 Soft Drink.',
    price: 449,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'p3',
    categoryId: 'combos',
    name: 'Hacky Loaded Chicken Feast.',
    desc: 'Double Cheese Chicken Burst Pizza + Chicken Wings (4 pcs) + Choco Lava Cake.',
    price: 549,
    isVeg: false,
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'p4',
    categoryId: 'combos',
    name: 'Mahmudabad Special Meal for 2.',
    desc: '2 Regular Farmfresh Pizzas + 1 Stuffed Garlic Bread + 2 Urban Cold Coffees.',
    price: 699,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'p5',
    categoryId: 'periperi',
    name: 'Peri Peri Burst Pizza Meal.',
    desc: 'Loaded with peri peri seasoning, spiced mozzarella, jalapenos & golden corn.',
    price: 379,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'p6',
    categoryId: 'sides',
    name: 'Cheesy Stuffed Garlic Bread.',
    desc: 'Freshly baked garlic bread overflowing with gooey melted mozzarella cheese.',
    price: 149,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'p7',
    categoryId: 'drinks',
    name: 'Urban Cold Coffee Blend.',
    desc: 'Creamy, thick, cafe-style cold coffee made with fresh milk and roasted espresso.',
    price: 99,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'p8',
    categoryId: 'feast',
    name: 'Monster Cheesy Farmhouse.',
    desc: 'Loaded with black olives, crisp bell peppers, grilled mushrooms, sweet corn, and double mozzarella.',
    price: 499,
    isVeg: true,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&auto=format&fit=crop&q=80'
  }
];

// Haversine calculation for exact GPS distance
function getDistKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return Number((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
}

export const DirectBranchBanner = () => {
  const [branches, setBranches] = useState<any[]>([]);
  const [activeBranch, setActiveBranch] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Fallback initial default branches if API takes a second
  const fallbackBranches = [
    { id: 'br_default', name: 'Hacky Pizza Town (Main)', city: 'Mahmudabad', address: 'Ramkund Chauraha, Paitepur Road', phone: '8081402378', latitude: 27.2894, longitude: 81.1278, deliveryRadiusKm: 15 }
  ];

  const loadBranches = async () => {
    try {
      const res = await fetch('/api/branches');
      const data = await res.json();
      if (data.success && Array.isArray(data.branches) && data.branches.length > 0) {
        setBranches(data.branches);
        const savedId = typeof window !== 'undefined' ? localStorage.getItem('hacky_selected_branch_id') : null;
        const found = data.branches.find((b: any) => b.id === savedId) || data.branches[0];
        setActiveBranch(found);
        if (!savedId) setShowModal(true); // First visit popup
      } else {
        setBranches(fallbackBranches);
        setActiveBranch(fallbackBranches[0]);
      }
    } catch {
      setBranches(fallbackBranches);
      setActiveBranch(fallbackBranches[0]);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const triggerGps = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) return alert('GPS unsupported');
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const uLat = pos.coords.latitude;
        const uLng = pos.coords.longitude;
        let best = branches[0];
        let minD = 999999;

        const updated = branches.map((b) => {
          const d = getDistKm(uLat, uLng, Number(b.latitude || 27.2894), Number(b.longitude || 81.1278));
          if (d < minD) { minD = d; best = { ...b, distanceKm: d }; }
          return { ...b, distanceKm: d };
        });

        setBranches(updated);
        setActiveBranch(best);
        try {
          localStorage.setItem('hacky_selected_branch_id', best.id);
          localStorage.setItem('hacky_selected_branch_name', best.name);
          localStorage.setItem('hacky_selected_branch_dist', String(best.distanceKm));
        } catch (_) {}
        setIsLocating(false);
        setShowModal(false);
      },
      () => {
        setIsLocating(false);
        alert('GPS Permission Denied. Kripya neeche di gayi list se branch chunein.');
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  const selectStore = (b: any) => {
    setActiveBranch(b);
    try {
      localStorage.setItem('hacky_selected_branch_id', b.id);
      localStorage.setItem('hacky_selected_branch_name', b.name);
    } catch (_) {}
    setShowModal(false);
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <>
      {/* Top Deliver Bar (Replacing old motipur header) */}
      <div className="bg-[#5B0E14] text-white px-4 py-2.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-orange-400 text-sm">📍</span>
          <div>
            <span className="text-[10px] text-orange-200 font-bold block uppercase leading-none">Delivering From Store:</span>
            <span className="text-xs font-black text-white">{activeBranch ? activeBranch.name : 'Loading store...'}</span>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-1 bg-[#F1E194] text-[#5B0E14] font-black text-xs rounded-full shadow hover:bg-white transition-all flex items-center gap-1 cursor-pointer"
        >
          <span>Change Store</span>
          <span>▾</span>
        </button>
      </div>

      {/* Mandatory First-Open Store Selection Popup */}
      {showModal && (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFBF2] border-2 border-[#5B0E14] rounded-3xl p-5 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#5B0E14]/10 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-orange-600 tracking-wider">Hacky Fast Delivery</span>
                <h3 className="text-lg font-black text-[#5B0E14]">Apna Nearest Store Chunein</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-2xl font-black text-gray-500 hover:text-black cursor-pointer">&times;</button>
            </div>

            {/* Auto GPS Detection Button */}
            <button
              onClick={triggerGps}
              disabled={isLocating}
              className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>{isLocating ? '📡' : '🎯'}</span>
              <span>{isLocating ? 'Detecting Location...' : 'ALLOW LOCATION (AUTO-DETECT GPS)'}</span>
            </button>

            <div className="text-center text-[10px] font-black text-gray-400 uppercase">-- YA STORE SELECT KAREIN --</div>

            {/* Branch Cards */}
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {branches.map((b) => (
                <div
                  key={b.id}
                  onClick={() => selectStore(b)}
                  className={`p-3 rounded-2xl border-2 cursor-pointer flex justify-between items-center transition-all ${
                    activeBranch?.id === b.id ? 'border-orange-600 bg-orange-50' : 'border-gray-200 bg-white hover:border-orange-300'
                  }`}
                >
                  <div>
                    <span className="font-black text-sm text-[#5B0E14] block">{b.name}</span>
                    <span className="text-[11px] text-gray-500">{b.city} • {b.address}</span>
                    {b.distanceKm && <span className="text-[10px] text-green-700 font-bold block">{b.distanceKm} km away</span>}
                  </div>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                    activeBranch?.id === b.id ? 'bg-orange-600 text-white' : 'border border-gray-300'
                  }`}>✓</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default function App() {
  const [currentPath, setCurrentPath] = useState(
    typeof window !== 'undefined' ? window.location.pathname.replace(/\/+$/, '') || '/' : '/'
  );

  useEffect(() => {
    const handlePopState = () => {
      const clean = window.location.pathname.replace(/\/+$/, '') || '/';
      setCurrentPath(clean);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const normalized = currentPath.toLowerCase();
  if (normalized === '/admin' || normalized.startsWith('/admin/')) return <AdminPage />;
  if (normalized === '/manager' || normalized.startsWith('/manager/')) return <StoreManagerPage />;
  if (normalized === '/kds' || normalized.startsWith('/kds/')) return <KitchenDisplayPage />;
  if (normalized === '/rider' || normalized.startsWith('/rider/')) return <RiderPage />;
  if (normalized === '/affiliate' || normalized.startsWith('/affiliate/')) return <InfluencerAffiliatePage />;
  if (normalized === '/influencer' || normalized.startsWith('/influencer/')) return <InfluencerAffiliatePage />;
  if (normalized === '/order-status' || normalized.startsWith('/order-status')) return <OrderStatusPage />;

  // --- STOREFRONT APP STATE - PURE LIVE NEON DATABASE CONSUMPTION ---
  const [activeScreen, setActiveScreen] = useState<'home' | 'menu' | 'rewards'>('home');

  const [branches, setBranches] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [allMenuItems, setAllMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [filterVegOnly, setFilterVegOnly] = useState(false);
  const [filterNonVegOnly, setFilterNonVegOnly] = useState(false);

  // Default fallback icons for categories if URL is broken
  const categoryIconFallbacks: Record<string, string> = {
    'combos': '🍱',
    'value': '🍕',
    'feast': '🎉',
    'peri': '🌶️',
    'garlic': '🥖',
    'coffee': '🥤',
    'drinks': '🥤',
    'sides': '🍟',
    'pizza': '🍕',
    'dessert': '🍰'
  };

  const getCategoryIcon = (name: string) => {
    const lower = (name || '').toLowerCase();
    for (const key of Object.keys(categoryIconFallbacks)) {
      if (lower.includes(key)) return categoryIconFallbacks[key];
    }
    return '🍕';
  };

  const activeBranchId = typeof window !== 'undefined' ? localStorage.getItem('hacky_selected_branch_id') : null;

  // Filter items & categories based on active branch
  useEffect(() => {
    // Precise Branch Filter for Menu Items:
    const branchSpecificItems = allMenuItems.filter((item: any) => {
      // Parse branchIds safely from any format (string, array, or JSON)
      let itemBranches: string[] = [];
      if (Array.isArray(item.branchIds)) {
        itemBranches = item.branchIds;
      } else if (typeof item.branchIds === 'string') {
        try {
          itemBranches = JSON.parse(item.branchIds);
        } catch {
          itemBranches = [item.branchIds];
        }
      }

      // 1. If item is marked ALL -> show in every branch
      if (itemBranches.includes('ALL') || itemBranches.length === 0) return true;

      // 2. If customer has a branch selected -> show only if item belongs to this branch
      if (activeBranchId && itemBranches.includes(activeBranchId)) return true;

      // 3. Otherwise hide from this branch
      return false;
    });

    // Automatically filter categories so empty categories don't show:
    const activeCategoryNames = new Set(branchSpecificItems.map((item: any) => item.categoryName || item.categoryId));
    const visibleCategories = allCategories.filter((cat: any) => 
      activeCategoryNames.has(cat.name) || 
      activeCategoryNames.has(cat.id) || 
      cat.isUniversal ||
      branchSpecificItems.some((i: any) => (i.categoryName || '').toLowerCase() === (cat.name || '').toLowerCase())
    );

    setMenuItems(branchSpecificItems);
    setCategories(visibleCategories.length > 0 ? visibleCategories : allCategories);

    const mappedProducts = branchSpecificItems.map((i: any) => ({
      id: i.id,
      categoryId: i.categoryId || '',
      categoryName: i.categoryName || i.categoryId || 'Take Off Combos',
      name: i.name,
      desc: i.description || '',
      price: Number(i.price ?? i.basePrice),
      isVeg: Boolean(i.isVeg !== false),
      image: i.image || i.imageUrl || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80',
      hasVariants: Boolean(i.hasVariants),
      sizePrices: i.sizePrices || null,
    }));
    setProducts(mappedProducts);
  }, [allMenuItems, allCategories, activeBranchId]);

  useEffect(() => {
    let isMounted = true;

    const syncStorefront = async () => {
      try {
        const res = await fetchLiveStoreData();
        if (isMounted && res.success && res.data) {
          if (Array.isArray(res.data.branches)) {
            setBranches(res.data.branches);
          }
          if (Array.isArray(res.data.categories)) {
            setAllCategories(res.data.categories);
            setCategories(res.data.categories);
            if (res.data.categories.length > 0 && !selectedCategory) {
              setSelectedCategory(res.data.categories[0].name || res.data.categories[0].id);
            }
          }
          if (Array.isArray(res.data.menuItems)) {
            setAllMenuItems(res.data.menuItems);
            setMenuItems(res.data.menuItems);
          }
          if (Array.isArray(res.data.coupons)) {
            setCoupons(res.data.coupons);
          }
          if (res.data.settings) {
            setStoreSettings(res.data.settings);
          }
        }
      } catch (err: any) {
        console.warn('Storefront sync notice:', err?.message || err);
      }
    };

    syncStorefront();
    const timer = setInterval(syncStorefront, 4000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  // AUTH STATE
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // DRAWER & MODAL STATES
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [selectedCustomizerPizza, setSelectedCustomizerPizza] = useState<PizzaCustomizerTarget | null>(null);
  const [customizingItem, setCustomizingItem] = useState<any>(null);
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<any | null>(null);
  const [isRecentOrdersOpen, setIsRecentOrdersOpen] = useState(false);

  // MULTIPLE PIZZA CART SUPPORT - EMPTY INITIAL STATE
  const [cartLines, setCartLines] = useState<CartLineItem[]>([]);

  // Multi-size Pizza Selection States
  const [selectedItemForSize, setSelectedItemForSize] = useState<any | null>(null);
  const [chosenSize, setChosenSize] = useState<'regular' | 'medium' | 'large'>('regular');

  const [storeSettings, setStoreSettings] = useState<any>(null);

  // Initialize user from local storage & check order_success in URL & fetch settings
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setStoreSettings(data.settings);
        }
      })
      .catch(() => {});

    try {
      const saved = localStorage.getItem('hacky_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        setUser(parsed);
      }

      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const successOrderId = params.get('order_success');
        if (successOrderId) {
          const past = JSON.parse(localStorage.getItem('hacky_past_orders') || '[]');
          const matched = past.find((p: any) => p.id === successOrderId || p.orderNumber === successOrderId) || past[0];
          if (matched) {
            setOrderConfirmed(matched);
          }
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // CART OPERATIONS
  const handleOpenCustomizer = (prod: any, existingCartItem?: CartLineItem) => {
    if (existingCartItem) {
      setCustomizingItem({
        id: existingCartItem.pizzaId,
        name: existingCartItem.name,
        price: existingCartItem.basePrice || existingCartItem.totalUnitPrice,
        image: existingCartItem.image,
        isVeg: existingCartItem.isVeg,
        cartItemId: existingCartItem.cartItemId,
        quantity: existingCartItem.quantity,
      });
      return;
    }
    const rawItem = allMenuItems.find(i => i.id === prod?.id) || prod;
    setCustomizingItem(rawItem || prod);
  };

  const handleAddToCartLine = (item: any) => {
    const sizePrice = item.selectedSize === 'Medium' ? 150 : item.selectedSize === 'Large' ? 280 : (item.customization?.sizePrice || 0);
    const crustPrice = item.selectedCrust === 'Cheese Burst' ? 99 : (item.customization?.crustPrice || 0);
    const beverageName = item.pairedBeverage?.name || (item.selectedSide === 'coke' ? 'Coca Cola...' : (item.customization?.beverage || 'None'));
    const beveragePrice = Number(item.pairedBeverage?.price || (item.selectedSide === 'coke' ? 40 : (item.customization?.beveragePrice || 0)));
    const sidesTotal = Array.isArray(item.attachedSides) 
      ? item.attachedSides.reduce((sum: number, s: any) => sum + Number(s.price || 0), 0) 
      : 0;
    const basePrice = Number(item.basePrice || item.price || item.singlePrice || 0);
    const unitPrice = Number(item.singlePrice || item.totalUnitPrice || item.finalPrice || (basePrice + sizePrice + crustPrice + beveragePrice + sidesTotal));

    const normalizedCartItem: CartLineItem = {
      cartItemId: item.cartItemId || (`cart_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`),
      pizzaId: item.pizzaId || item.id || 'p_custom',
      name: item.name,
      image: item.image || item.imageUrl || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80',
      isVeg: item.isVeg !== false,
      basePrice,
      totalUnitPrice: unitPrice,
      quantity: Number(item.quantity) || 1,
      selectedSize: item.selectedSize || 'Regular',
      selectedCrust: item.selectedCrust || 'Classic Hand Tossed',
      sizePrice,
      crustPrice,
      attachedSides: item.attachedSides || [],
      customization: item.customization || {
        size: item.selectedSize || 'Regular',
        sizePrice,
        crust: item.selectedCrust || 'Classic Hand Tossed',
        crustPrice,
        extraCheese: Boolean(item.selectedAddons?.includes('extra_cheese')),
        garlicHerbDip: Boolean(item.selectedAddons?.includes('garlic_dip')),
        spicyPeriPeriDip: Boolean(item.selectedAddons?.includes('peri_dip')),
        excludedIngredients: item.excludedIngredients || [],
        beverage: beverageName,
        beveragePrice,
      }
    };

    setCartLines(prev => {
      const existingIdx = prev.findIndex(p => p.cartItemId === normalizedCartItem.cartItemId);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = normalizedCartItem;
        return copy;
      }
      return [...prev, normalizedCartItem];
    });
  };

  const handleUpdateQuantity = (cartItemId: string, change: number) => {
    setCartLines(prev => {
      return prev.map(item => {
        if (item.cartItemId === cartItemId) {
          const newQty = item.quantity + change;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartLineItem[];
    });
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCartLines(prev => prev.filter(i => i.cartItemId !== cartItemId));
  };

  const totalCartCount = cartLines.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartLines.reduce((acc, item) => acc + item.totalUnitPrice * item.quantity, 0);

  // Filter products by selected Category and Veg/Non-Veg toggles
  const displayedProducts = products.filter((item: any) => {
    // 1. Veg / Non-Veg filter
    if (filterVegOnly && !item.isVeg) return false;
    if (filterNonVegOnly && item.isVeg) return false;

    // 2. Category matching (case-insensitive and tolerant of ID vs Name)
    if (!selectedCategory || selectedCategory === 'ALL' || selectedCategory === 'all') return true;

    const activeCatObj = categories.find((c: any) => c.name === selectedCategory || c.id === selectedCategory);
    const activeName = (activeCatObj?.name || selectedCategory || '').toLowerCase();
    const activeId = (activeCatObj?.id || selectedCategory || '').toLowerCase();

    const itemCatName = (item.categoryName || (item as any).category || '').toLowerCase();
    const itemCatId = (item.categoryId || '').toLowerCase();

    const catMatch = 
      (itemCatName && itemCatName === activeName) ||
      (itemCatId && (itemCatId === activeId || itemCatId === activeName)) ||
      (itemCatName && (itemCatName === activeId || itemCatName.includes(activeName) || activeName.includes(itemCatName))) ||
      (itemCatId && (itemCatId.includes(activeId) || activeId.includes(itemCatId))) ||
      (item.categoryName && item.categoryName.toLowerCase() === selectedCategory.toLowerCase()) ||
      (item.categoryId && item.categoryId === selectedCategory);

    return Boolean(catMatch);
  });

  return (
    <div className="min-h-screen bg-[#FFFBF2] pb-28 font-sans text-[#502314] antialiased selection:bg-orange-200">
      
      {/* RESTAURANT ERP QUICK SWITCHER BAR */}
      <div className="bg-[#18181b] text-white px-4 py-2 text-[11px] font-bold flex items-center justify-between overflow-x-auto gap-2 border-b border-stone-800 sticky top-0 z-50">
        <div className="flex items-center gap-1.5 shrink-0 text-amber-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="tracking-wide">HACKY RESTAURANT ERP:</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <a href="/admin" className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white transition font-black">👑 Super Admin</a>
          <a href="/manager" className="px-2.5 py-1 rounded-lg bg-orange-600/30 hover:bg-orange-600 text-orange-200 hover:text-white transition font-black">🏪 Store Manager</a>
          <a href="/kds" className="px-2.5 py-1 rounded-lg bg-amber-600/30 hover:bg-amber-600 text-amber-200 hover:text-white transition font-black">👨‍🍳 Kitchen KDS</a>
          <a href="/rider" className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 hover:text-white transition font-black">🛵 Delivery Rider</a>
          <a href="/affiliate" className="px-2.5 py-1 rounded-lg bg-indigo-600/40 hover:bg-indigo-600 text-indigo-200 hover:text-white transition font-black">💎 Creator Portal</a>
        </div>
      </div>
      
      {/* =========================================
          SCREEN 1: HOME PAGE (SUGGESTIONS & PROMOS)
         ========================================= */}
      {activeScreen === 'home' && (
        <div>
          {/* Top Header (Burger King Deep Chocolate Brown #502314) */}
          <header className="sticky top-0 z-40 bg-[#502314] px-4 py-3 shadow-md border-b border-[#3d1a0f]">
            <div className="flex items-center justify-between">
              
              {/* Left Hamburger Brand & Drawer Trigger */}
              <div className="flex items-center gap-2.5">
                <button 
                  onClick={() => setIsSideMenuOpen(true)}
                  className="p-1 rounded-lg text-white hover:bg-white/10 transition cursor-pointer"
                  aria-label="Open menu drawer"
                >
                  <MenuIcon className="h-6 w-6 stroke-[2.5]" />
                </button>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl">🍕</span>
                  <div className="flex flex-col">
                    <span className="font-black text-sm text-white tracking-wider leading-none">
                      HACKY PIZZA TOWN
                    </span>
                    <span className="text-[9px] font-black tracking-widest text-[#EA580C] uppercase mt-0.5">
                      HAVE IT YOUR WAY
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Profile & Cart Drawer Buttons */}
              <div className="flex items-center gap-2">
                {user ? (
                  <button 
                    onClick={() => setIsSideMenuOpen(true)}
                    className="flex items-center gap-1.5 rounded-full bg-white/15 hover:bg-white/20 px-2.5 py-1 text-xs font-bold text-white transition border border-white/20"
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-400 fill-current" />
                    <span>{user.name.split(' ')[0]}</span>
                    <span className="text-emerald-400 font-black">₹{user.walletBalance ?? 0}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="flex items-center gap-1 rounded-full bg-gradient-to-r from-[#EA580C] to-[#D64500] hover:from-[#c2410c] hover:to-[#b91c1c] px-3.5 py-1 text-xs font-black uppercase text-white shadow active:scale-95 transition"
                  >
                    <Gift className="h-3.5 w-3.5" />
                    <span>Get ₹{storeSettings?.welcomeCashbackAmount ?? 50}</span>
                  </button>
                )}

                {/* Cart Drawer Trigger */}
                <button 
                  onClick={() => setIsOrderSummaryOpen(true)}
                  className="relative p-2 rounded-full text-white hover:bg-white/10 active:scale-95 transition"
                >
                  <ShoppingBag className="h-5 w-5 stroke-[2.5]" />
                  {totalCartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#EA580C] text-[9px] font-black text-white shadow-md">
                      {totalCartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </header>

          {/* DIRECT BRANCH BANNER & AUTO-POPUP (Replacing old motipur header) */}
          <DirectBranchBanner />

          {/* TOP BURGER KING STYLE AUTO-ROTATE BANNER SLIDER */}
          <BannerSlider />

          {/* Welcome Bonus Callout */}
          {!user && (
            <section className="px-3 pb-2">
              <div 
                onClick={() => setIsAuthModalOpen(true)}
                className="cursor-pointer flex items-center justify-between rounded-2xl bg-[#FFF2E2] p-3.5 border-2 border-[#EA580C]/30 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EA580C] text-white font-black text-lg shadow-md">
                    ₹{storeSettings?.welcomeCashbackAmount ?? 50}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#502314]">Free ₹{storeSettings?.welcomeCashbackAmount ?? 50} Welcome Cashback!</h4>
                    <p className="text-[11px] text-[#7A4B3A] font-medium">Claim instant cashback and earn {storeSettings?.orderCashbackPercent ?? 5}% post-delivery loyalty on orders.</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#502314] px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-white shadow">
                  Claim
                </span>
              </div>
            </section>
          )}

          {/* Home Suggestions: 4-Column Grid */}
          <section className="px-4 py-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-black text-[#502314] tracking-tight uppercase">Our Menu Categories</h3>
              <button 
                onClick={() => setActiveScreen('menu')}
                className="text-xs font-bold text-[#EA580C] hover:underline"
              >
                View Full Menu &gt;
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {categories.map((cat: any) => {
                const catImg = cat.image || cat.iconUrl || cat.icon;
                const hasImg = catImg && typeof catImg === 'string' && catImg.startsWith('http');

                return (
                  <div 
                    key={cat.id || cat.name} 
                    onClick={() => {
                      setSelectedCategory(cat.name || cat.id);
                      setActiveScreen('menu');
                    }}
                    className="flex flex-col items-center text-center cursor-pointer active:scale-95 transition group"
                  >
                    <div className="h-16 w-16 overflow-hidden rounded-2xl bg-white p-1 shadow-sm border border-[#E8D6BF] group-hover:border-[#EA580C] flex items-center justify-center">
                      {hasImg ? (
                        <img 
                          src={catImg} 
                          alt={cat.name} 
                          className="h-full w-full rounded-xl object-cover" 
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                            const sibling = (e.target as HTMLElement).nextElementSibling;
                            if (sibling) (sibling as HTMLElement).style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <span 
                        className="text-2xl select-none" 
                        style={{ display: hasImg ? 'none' : 'flex' }}
                      >
                        {getCategoryIcon(cat.name)}
                      </span>
                    </div>
                    <span className="mt-1.5 text-[10px] font-bold leading-tight text-[#502314] line-clamp-2">
                      {cat.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Bestseller Pizzas with Burger King styling */}
          <section className="px-4 py-3 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-[#502314] tracking-tight uppercase">Top Pizzas In Town</h3>
              <span className="text-xs font-bold text-[#EA580C]">WOOD FIRED 400°C</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {products.slice(0, 4).map((prod: any) => (
                <ProductCard
                  key={prod.id}
                  product={{
                    id: prod.id,
                    name: prod.name,
                    description: prod.desc || prod.description,
                    price: prod.price,
                    originalPrice: prod.originalPrice,
                    imageUrl: prod.image || prod.imageUrl,
                    isVeg: prod.isVeg,
                    hasVariants: prod.hasVariants,
                    sizePrices: prod.sizePrices,
                    sizeOptions: prod.sizeOptions,
                    crustOptions: prod.crustOptions,
                  }}
                  onOpenCustomizer={handleOpenCustomizer}
                />
              ))}
            </div>
          </section>
        </div>
      )}

      {/* =========================================
          SCREEN 2: TWO-COLUMN MENU LAYOUT
         ========================================= */}
      {activeScreen === 'menu' && (
        <div className="flex flex-col h-[calc(100vh-65px)]">
          
          {/* Menu Top Bar */}
          <div className="bg-[#502314] px-4 py-3 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSideMenuOpen(true)}>
                <MenuIcon className="h-6 w-6 stroke-[2.5]" />
              </button>
              <div>
                <h2 className="text-lg font-black tracking-wide uppercase">Our Food Menu</h2>
                <p className="text-[10px] text-amber-200">Have it your way with custom sizes &amp; crusts</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsOrderSummaryOpen(true)}
                className="relative p-2 rounded-full text-white hover:bg-white/10 active:scale-95 transition"
              >
                <ShoppingBag className="h-5 w-5 stroke-[2.5]" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#EA580C] text-[9px] font-black text-white">
                    {totalCartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Veg / Non-Veg Toggles */}
          <div className="flex items-center gap-2 px-4 py-2 bg-[#F8EFE0] border-b border-[#E8D6BF]">
            <div 
              onClick={() => {
                setFilterVegOnly(!filterVegOnly);
                if (!filterVegOnly) setFilterNonVegOnly(false);
              }}
              className={`flex items-center gap-1.5 cursor-pointer rounded-full border px-3 py-1 transition-all ${
                filterVegOnly ? 'bg-emerald-50 border-emerald-600 shadow-sm' : 'bg-white border-[#E8D6BF]'
              }`}
            >
              <div className="h-3.5 w-3.5 rounded-sm border border-emerald-600 flex items-center justify-center p-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              </div>
              <span className="text-[10px] font-black uppercase text-emerald-800">Veg Only</span>
            </div>

            <div 
              onClick={() => {
                setFilterNonVegOnly(!filterNonVegOnly);
                if (!filterNonVegOnly) setFilterVegOnly(false);
              }}
              className={`flex items-center gap-1.5 cursor-pointer rounded-full border px-3 py-1 transition-all ${
                filterNonVegOnly ? 'bg-red-50 border-red-700 shadow-sm' : 'bg-white border-[#E8D6BF]'
              }`}
            >
              <div className="h-3.5 w-3.5 rounded-sm border border-red-700 flex items-center justify-center p-0.5">
                <div className="h-0 w-0 border-l-[2px] border-l-transparent border-r-[2px] border-r-transparent border-b-[4px] border-b-red-700" />
              </div>
              <span className="text-[10px] font-black uppercase text-red-800">Non-Veg Only</span>
            </div>
          </div>

          {/* TWO-COLUMN LAYOUT: SIDEBAR + PRODUCT CARDS */}
          <div className="flex flex-1 overflow-hidden">
            
            {/* LEFT VERTICAL CATEGORY BAR */}
            <div className="w-[100px] sm:w-[125px] overflow-y-auto bg-[#F0E6DC] border-r border-[#e3d4c5] p-1.5 space-y-2 shrink-0">
              {categories.map((cat: any) => {
                const isActive = (cat.name === selectedCategory || cat.id === selectedCategory);
                const catImg = cat.image || cat.iconUrl || cat.icon;
                const hasImg = catImg && typeof catImg === 'string' && catImg.startsWith('http');

                return (
                  <button
                    key={cat.id || cat.name}
                    onClick={() => setSelectedCategory(cat.name || cat.id)}
                    className={`w-full rounded-2xl p-2 flex flex-col items-center text-center transition-all ${
                      isActive 
                        ? 'bg-[#502314] text-white shadow-md ring-2 ring-[#ea580c]/50' 
                        : 'bg-white text-[#502314] hover:bg-orange-50 shadow-xs'
                    }`}
                  >
                    <div className="h-10 w-10 rounded-xl overflow-hidden mb-1 flex items-center justify-center bg-black/5 shrink-0">
                      {hasImg ? (
                        <img 
                          src={catImg} 
                          alt={cat.name} 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                            const sibling = (e.target as HTMLElement).nextElementSibling;
                            if (sibling) (sibling as HTMLElement).style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <span 
                        className="text-xl select-none" 
                        style={{ display: hasImg ? 'none' : 'flex' }}
                      >
                        {getCategoryIcon(cat.name)}
                      </span>
                    </div>
                    <span className="text-[10px] font-black leading-tight line-clamp-2">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* RIGHT PRODUCT FEED WITH ELEVATED PRODUCTCARD & SINGLE ADD+ ACTION */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#FFFBF2]">
              {displayedProducts.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <span className="text-3xl select-none">🍕</span>
                  <p className="text-xs font-bold text-gray-500">
                    Is category me abhi koi product nahi hai.
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Super Admin se is category ({selectedCategory || 'Chuni gayi category'}) ke andar pizza add karein!
                  </p>
                </div>
              ) : (
                displayedProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={{
                      id: prod.id,
                      name: prod.name,
                      description: prod.desc || (prod as any).description,
                      price: prod.price,
                      originalPrice: (prod as any).originalPrice,
                      imageUrl: prod.image || (prod as any).imageUrl,
                      isVeg: prod.isVeg,
                      hasVariants: (prod as any).hasVariants,
                      sizePrices: (prod as any).sizePrices,
                      sizeOptions: (prod as any).sizeOptions,
                      crustOptions: (prod as any).crustOptions,
                    }}
                    onOpenCustomizer={handleOpenCustomizer}
                  />
                ))
              )}
            </div>

          </div>
        </div>
      )}

      {/* =========================================
          SCREEN 3: REWARDS PAGE
         ========================================= */}
      {activeScreen === 'rewards' && (
        <div className="p-4 max-w-md mx-auto space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => setActiveScreen('home')} className="text-[#502314]">
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-black text-[#502314] uppercase">Hacky Crown Rewards</h2>
          </div>

          <div className="rounded-3xl bg-gradient-to-r from-[#502314] to-[#7c3720] p-6 text-white shadow-xl border-2 border-[#502314] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-orange-200 tracking-wider">
                Current Wallet Cashback
              </span>
              <Crown className="w-5 h-5 text-amber-400 fill-current" />
            </div>

            <div className="text-3xl font-black text-amber-300">
              ₹{user && user.walletBalance != null ? user.walletBalance.toFixed(0) : '0'}
            </div>

            <p className="text-xs text-orange-100 leading-relaxed font-medium">
              Aapke account me ₹{user?.walletBalance ?? 0} wallet balance active hai. Delivery complete hone par {storeSettings?.orderCashbackPercent ?? 5}% loyalty cashback credit hota hai (Min Order ₹{storeSettings?.minOrderForCashback ?? 199}).
            </p>

            <button
              onClick={() => {
                if (!user) setIsAuthModalOpen(true);
                else setActiveScreen('menu');
              }}
              className="w-full py-3 bg-[#EA580C] hover:bg-[#c2410c] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition"
            >
              {user ? 'Redeem on Pizza Menu' : `Log In to Claim ₹${storeSettings?.welcomeCashbackAmount ?? 50}`}
            </button>
          </div>
        </div>
      )}

      {/* =======================================================
          FLOATING BURGER KING STYLE CART PILL (WHEN ITEMS IN CART)
         ======================================================= */}
      {cartLines.length > 0 && !isOrderSummaryOpen && (
        <div className="fixed bottom-16 left-4 right-4 z-40 max-w-md mx-auto">
          <button
            onClick={() => setIsOrderSummaryOpen(true)}
            className="w-full py-3.5 px-5 bg-gradient-to-r from-[#EA580C] to-[#D64500] hover:from-[#c2410c] hover:to-[#b91c1c] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-2xl flex items-center justify-between border-2 border-white/20 active:scale-98 transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-black/25 flex items-center justify-center font-bold text-xs text-white">
                {totalCartCount}
              </div>
              <span className="text-sm tracking-wide font-black">
                {totalCartCount} {totalCartCount === 1 ? 'PIZZA' : 'PIZZAS'} • ₹{cartSubtotal}
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm font-black text-amber-200">
              <span>VIEW CART</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </div>
          </button>
        </div>
      )}

      {/* =========================================
          FIXED BOTTOM NAVIGATION BAR
         ========================================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around bg-[#502314] py-2.5 px-2 shadow-2xl border-t border-[#6b301c]">
        {/* Home Tab */}
        <button 
          onClick={() => setActiveScreen('home')}
          className="flex flex-col items-center gap-1 relative px-3 py-1 cursor-pointer"
        >
          {activeScreen === 'home' && (
            <span className="absolute -top-2.5 h-1 w-8 rounded-full bg-[#EA580C]" />
          )}
          <Home className={`h-5 w-5 ${activeScreen === 'home' ? 'text-[#EA580C]' : 'text-gray-300'}`} />
          <span className={`text-[10px] font-black uppercase tracking-wider ${activeScreen === 'home' ? 'text-[#EA580C]' : 'text-gray-300'}`}>
            Home
          </span>
        </button>

        {/* Menu Tab */}
        <button 
          onClick={() => setActiveScreen('menu')}
          className="flex flex-col items-center gap-1 relative px-3 py-1 cursor-pointer"
        >
          {activeScreen === 'menu' && (
            <span className="absolute -top-2.5 h-1 w-8 rounded-full bg-[#EA580C]" />
          )}
          <UtensilsCrossed className={`h-5 w-5 ${activeScreen === 'menu' ? 'text-[#EA580C]' : 'text-gray-300'}`} />
          <span className={`text-[10px] font-black uppercase tracking-wider ${activeScreen === 'menu' ? 'text-[#EA580C]' : 'text-gray-300'}`}>
            Menu
          </span>
        </button>

        {/* Rewards Tab */}
        <button 
          onClick={() => setActiveScreen('rewards')}
          className="flex flex-col items-center gap-1 relative px-3 py-1 cursor-pointer"
        >
          {activeScreen === 'rewards' && (
            <span className="absolute -top-2.5 h-1 w-8 rounded-full bg-[#EA580C]" />
          )}
          <Crown className={`h-5 w-5 ${activeScreen === 'rewards' ? 'text-[#EA580C]' : 'text-gray-300'}`} />
          <span className={`text-[10px] font-black uppercase tracking-wider ${activeScreen === 'rewards' ? 'text-[#EA580C]' : 'text-gray-300'}`}>
            Rewards
          </span>
        </button>
      </nav>

      {/* =========================================
          BURGER KING MODALS & DRAWERS
         ========================================= */}
      {/* 1. Burger King Side Menu Drawer */}
      <SideMenuDrawer
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onNavigateTab={(tab) => {
          if (tab === 'home' || tab === 'menu' || tab === 'rewards') {
            setActiveScreen(tab);
          }
        }}
        onOpenStores={() => alert('Hacky Pizza Town Mahmudabad\n100% Wood-Fired Oven Outlet\nClock Tower, Ramkund Chauraha')}
        onOpenRecentOrders={() => setIsRecentOrdersOpen(true)}
        onLogout={() => {
          localStorage.removeItem('hacky_user');
          setUser(null);
        }}
      />

      {/* 2. 2-Step Meal Customizer Screen with Skip Option & Sides/Beverages Grid */}
      {customizingItem && (
        <MealCustomizerModal
          item={customizingItem}
          onClose={() => setCustomizingItem(null)}
          onCompleteToCart={(customized: any) => {
            handleAddToCartLine(customized);
            setCustomizingItem(null);
          }}
        />
      )}

      {/* Pizza Customization Drawer with Smart Self-Exclusion & Global Beverage Pairings */}
      <PizzaCustomizer
        isOpen={isCustomizerOpen}
        onClose={() => {
          setIsCustomizerOpen(false);
          setSelectedCustomizerPizza(null);
        }}
        product={selectedCustomizerPizza}
        onAddToCart={handleAddToCartLine}
      />

      {/* 3. Multiple Pizza Cart & Checkout Screen */}
      <OrderSummary
        isOpen={isOrderSummaryOpen}
        onClose={() => setIsOrderSummaryOpen(false)}
        cartItems={cartLines}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onReCustomiseItem={(item) => {
          setIsOrderSummaryOpen(false);
          handleOpenCustomizer(null, item);
        }}
        user={user}
        onClearCart={() => setCartLines([])}
        onOrderSuccess={(orderData) => {
          setCartLines([]);
          setOrderConfirmed(orderData);
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* 4. Auth Modal with Role Redirection */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(loggedUser) => {
          setUser(loggedUser);
          localStorage.setItem('hacky_user', JSON.stringify(loggedUser));
        }}
      />

      {/* 5. Order Success Confirmation Modal */}
      {orderConfirmed && (
        <OrderSuccessModal
          order={orderConfirmed}
          onClose={() => setOrderConfirmed(null)}
          onOrderAgain={() => {
            setOrderConfirmed(null);
            setIsRecentOrdersOpen(true);
          }}
        />
      )}

      {/* 6. Recent Orders & Live Order Tracking Modal */}
      <RecentOrdersModal
        isOpen={isRecentOrdersOpen}
        onClose={() => setIsRecentOrdersOpen(false)}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onExploreMenu={() => {
          setIsRecentOrdersOpen(false);
          setActiveScreen('menu');
        }}
      />

      {/* 7. Pizza Card Size Selector Modal */}
      {selectedItemForSize && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#FFFBF2] w-full max-w-sm rounded-t-3xl sm:rounded-3xl border-2 border-[#5B0E14] p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-black text-base text-[#5B0E14]">{selectedItemForSize.name}</h3>
                <p className="text-[11px] text-gray-500">Chunein apna favorite size</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItemForSize(null)}
                className="text-2xl font-bold text-gray-500 hover:text-black leading-none"
              >
                &times;
              </button>
            </div>

            {/* Size Pills */}
            <div className="space-y-2">
              {(['regular', 'medium', 'large'] as const).map((sz) => {
                const prices = typeof selectedItemForSize.sizePrices === 'string' 
                  ? JSON.parse(selectedItemForSize.sizePrices) 
                  : (selectedItemForSize.sizePrices || {});
                const cost = prices[sz] || (sz === 'regular' ? Number(selectedItemForSize.price) : 0);
                if (!cost) return null;

                const isChosen = chosenSize === sz;
                return (
                  <div
                    key={sz}
                    onClick={() => setChosenSize(sz)}
                    className={`p-3 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                      isChosen ? 'border-orange-600 bg-orange-50 font-black' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{sz === 'regular' ? '🍕' : sz === 'medium' ? '🍕🍕' : '🍕🍕🍕'}</span>
                      <span className="capitalize text-xs font-bold text-[#5B0E14]">{sz} Size</span>
                    </div>
                    <span className="text-xs font-black text-orange-600">₹{cost}</span>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                const prices = typeof selectedItemForSize.sizePrices === 'string' 
                  ? JSON.parse(selectedItemForSize.sizePrices) 
                  : (selectedItemForSize.sizePrices || {});
                const finalCost = Number(prices[chosenSize] || selectedItemForSize.price);
                const sizeLabel = chosenSize === 'regular' ? 'Regular' : chosenSize === 'medium' ? 'Medium' : 'Large';

                handleAddToCartLine({
                  ...selectedItemForSize,
                  selectedSize: sizeLabel,
                  basePrice: finalCost,
                  totalUnitPrice: finalCost,
                  price: finalCost,
                  cartItemId: `${selectedItemForSize.id}_${chosenSize}`
                });
                setSelectedItemForSize(null);
              }}
              className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xs font-black rounded-2xl shadow-lg cursor-pointer hover:opacity-90 active:scale-95 transition-all"
            >
              ADD TO CART (₹{
                (typeof selectedItemForSize.sizePrices === 'string'
                  ? JSON.parse(selectedItemForSize.sizePrices)
                  : selectedItemForSize.sizePrices)?.[chosenSize] || selectedItemForSize.price
              })
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
