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
  Banknote, 
  X, 
  Sparkles,
  CheckCircle2,
  Clock,
  Phone,
  ShieldCheck
} from 'lucide-react';
import { FoodVisual } from '../components/FoodVisual';
import { SideMenuDrawer } from '../components/SideMenuDrawer';
import { OutletSwitcherModal } from '../components/OutletSwitcherModal';
import BannerSlider from '../components/BannerSlider';
import BranchLocationPicker from '../components/BranchLocationPicker';
import DirectBranchBanner from '../components/DirectBranchBanner';
import { createOrderDirectly } from '../lib/neonClient';

// --- PREMIUM MENU DATA ---
const CATEGORIES_DATA = [
  { 
    id: 'combos', 
    name: 'Take Off Combos', 
    icon: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=160&auto=format&fit=crop&q=80',
    visualType: 'combo_deal' as const,
  },
  { 
    id: 'value', 
    name: 'Value Meals (Save Upto 40%)', 
    icon: 'https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?w=160&auto=format&fit=crop&q=80',
    visualType: 'peppy_paneer' as const,
  },
  { 
    id: 'feast', 
    name: 'Feast & Fly', 
    icon: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=160&auto=format&fit=crop&q=80',
    visualType: 'margherita' as const,
  },
  { 
    id: 'periperi', 
    name: 'Peri Peri Fest', 
    icon: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=160&auto=format&fit=crop&q=80',
    visualType: 'peri_peri' as const,
  },
  { 
    id: 'solo', 
    name: 'Celebrations Meal for 1', 
    icon: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=160&auto=format&fit=crop&q=80',
    visualType: 'farmhouse' as const,
  },
  { 
    id: 'family', 
    name: 'Celebrations Meal for 2', 
    icon: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=160&auto=format&fit=crop&q=80',
    visualType: 'combo_deal' as const,
  },
  { 
    id: 'sides', 
    name: 'Garlic Bread & Dips', 
    icon: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=160&auto=format&fit=crop&q=80',
    visualType: 'garlic_bread' as const,
  },
  { 
    id: 'drinks', 
    name: 'Cold Coffee & Shakes', 
    icon: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=160&auto=format&fit=crop&q=80',
    visualType: 'cold_coffee' as const,
  },
];

const PRODUCTS_DATA = [
  {
    id: 'p1',
    categoryId: 'combos',
    name: 'Hacky Veggie Pizza Meal.',
    desc: 'Medium Margherita Pizza + Cheesy Garlic Bread + 1 Chilled Coke / Cold Coffee.',
    price: 349,
    isVeg: true,
    visualType: 'combo_deal' as const,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'p2',
    categoryId: 'combos',
    name: 'Hacky Peppy Paneer Meal.',
    desc: 'Spicy Paneer Pizza + Peri-Peri Stuffed Garlic Bread + 2 Dips + 1 Soft Drink.',
    price: 449,
    isVeg: true,
    visualType: 'peppy_paneer' as const,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'p3',
    categoryId: 'combos',
    name: 'Hacky Loaded Chicken Feast.',
    desc: 'Double Cheese Chicken Burst Pizza + Chicken Wings (4 pcs) + Choco Lava Cake.',
    price: 549,
    isVeg: false,
    visualType: 'peri_peri' as const,
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'p4',
    categoryId: 'combos',
    name: 'Mahmudabad Special Meal for 2.',
    desc: '2 Regular Farmfresh Pizzas + 1 Stuffed Garlic Bread + 2 Urban Cold Coffees.',
    price: 699,
    isVeg: true,
    visualType: 'farmhouse' as const,
    image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'p5',
    categoryId: 'periperi',
    name: 'Peri Peri Burst Pizza Meal.',
    desc: 'Loaded with peri peri seasoning, spiced mozzarella, jalapenos & golden corn.',
    price: 379,
    isVeg: true,
    visualType: 'peri_peri' as const,
    image: 'https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'p6',
    categoryId: 'sides',
    name: 'Cheesy Stuffed Garlic Bread.',
    desc: 'Freshly baked garlic bread overflowing with gooey melted mozzarella cheese.',
    price: 149,
    isVeg: true,
    visualType: 'garlic_bread' as const,
    image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'p7',
    categoryId: 'drinks',
    name: 'Urban Cold Coffee Blend.',
    desc: 'Creamy, thick, cafe-style cold coffee made with fresh milk and roasted espresso.',
    price: 99,
    isVeg: true,
    visualType: 'cold_coffee' as const,
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&auto=format&fit=crop&q=80'
  }
];

export default function App() {
  const [activeScreen, setActiveScreen] = useState<'home' | 'menu' | 'rewards'>('home');
  const [selectedCategory, setSelectedCategory] = useState('combos');
  const [filterVegOnly, setFilterVegOnly] = useState(false);
  const [filterNonVegOnly, setFilterNonVegOnly] = useState(false);
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('Ramkund Chauraha, Mahmudabad');
  const [customerPhone, setCustomerPhone] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<{ id: string; address: string; phone: string; total: number; branch?: string } | null>(null);

  useEffect(() => {
    try {
      const u = localStorage.getItem('hacky_user');
      if (u) {
        const parsed = JSON.parse(u);
        setCurrentUser(parsed);
        if (parsed.address) setDeliveryAddress(parsed.address);
        if (parsed.phone) setCustomerPhone(parsed.phone);
      }
    } catch {}
  }, []);

  // Branch Selection State
  const [selectedBranchId, setSelectedBranchId] = useState<string>('branch_mahmudabad');
  const [currentOutlet, setCurrentOutlet] = useState('Mahmudabad Main Branch');

  // Dynamic Menu Items from API
  const [dynamicProducts, setDynamicProducts] = useState<any[]>(PRODUCTS_DATA);
  const [dynamicCategories, setDynamicCategories] = useState<any[]>(CATEGORIES_DATA);

  // Dynamic Billing & Taxes Settings
  const [billingSettings, setBillingSettings] = useState<{
    gstPercent: number;
    deliveryFee: number;
    freeDeliveryAbove: number;
    platformFee: number;
    packagingFee: number;
  }>({
    gstPercent: 5,
    deliveryFee: 30,
    freeDeliveryAbove: 499,
    platformFee: 5,
    packagingFee: 15
  });

  const [userDist, setUserDist] = useState<number>(0);
  const [maxRadius, setMaxRadius] = useState<number>(10);

  // Modals & Drawers
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isOutletPickerOpen, setIsOutletPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load saved branch & radius from localStorage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('hacky_selected_branch');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.id && parsed.name) {
          setSelectedBranchId(parsed.id);
          setCurrentOutlet(parsed.name);
        }
      }
      const dist = Number(localStorage.getItem('hacky_selected_branch_dist') || 0);
      const rad = Number(localStorage.getItem('hacky_selected_branch_radius') || 10);
      setUserDist(dist);
      setMaxRadius(rad);
    } catch {}
  }, [isCartOpen]);

  // Fetch live billing settings
  React.useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.settings) {
          setBillingSettings({
            gstPercent: Number(data.settings.gstPercent ?? 5),
            deliveryFee: Number(data.settings.deliveryFee ?? 30),
            freeDeliveryAbove: Number(data.settings.freeDeliveryAbove ?? 499),
            platformFee: Number(data.settings.platformFee ?? 5),
            packagingFee: Number(data.settings.packagingFee ?? 15)
          });
        }
      })
      .catch(() => {});
  }, []);

  // Fetch live menu items and categories from API
  React.useEffect(() => {
    fetch('/api/menu')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          if (Array.isArray(data.items) && data.items.length > 0) {
            // Map db items into standard product shape
            const mapped = data.items.map((it: any) => ({
              id: it.id,
              categoryId: it.categoryId || it.categoryName?.toLowerCase().replace(/\s+/g, '_') || 'combos',
              name: it.name,
              desc: it.description || '',
              price: Number(it.price || it.basePrice || 0),
              isVeg: it.isVeg ?? true,
              visualType: 'margherita' as const,
              image: it.imageUrl || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80',
              branchIds: it.branchIds
            }));
            // Merge with local products
            setDynamicProducts([...mapped, ...PRODUCTS_DATA]);
          }
          if (Array.isArray(data.categories) && data.categories.length > 0) {
            const mappedCats = data.categories.map((c: any) => ({
              id: c.name?.toLowerCase().replace(/\s+/g, '_'),
              name: c.name,
              icon: c.iconUrl || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=160&auto=format&fit=crop&q=80',
              visualType: 'margherita' as const,
              branchIds: c.branchIds
            }));
            setDynamicCategories([...mappedCats, ...CATEGORIES_DATA]);
          }
        }
      })
      .catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 2400);
  };

  const addToCart = (id: string) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    const product = dynamicProducts.find((p) => p.id === id);
    if (product) showToast(`Added ${product.name} to cart!`);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[id] > 1) {
        updated[id] -= 1;
      } else {
        delete updated[id];
      }
      return updated;
    });
  };

  const totalCartItems = Object.values(cart).reduce((a, b) => a + b, 0);

  const cartItemsList = Object.entries(cart)
    .map(([id, quantity]) => {
      const item = dynamicProducts.find((p) => p.id === id);
      return item ? { ...item, quantity } : null;
    })
    .filter((item): item is typeof PRODUCTS_DATA[0] & { quantity: number } => item !== null);

  const subTotal = cartItemsList.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const isFreeDelivery = subTotal >= (billingSettings.freeDeliveryAbove || 499);
  const effectiveDeliveryFee = subTotal === 0 ? 0 : (isFreeDelivery ? 0 : Number(billingSettings.deliveryFee || 30));
  const effectivePackagingFee = subTotal === 0 ? 0 : Number(billingSettings.packagingFee || 15);
  const effectivePlatformFee = subTotal === 0 ? 0 : Number(billingSettings.platformFee || 5);
  const taxableBase = subTotal + effectivePackagingFee;
  const gstAmount = Math.round(taxableBase * (Number(billingSettings.gstPercent || 5) / 100));
  const finalTotal = subTotal === 0 ? 0 : (subTotal + effectiveDeliveryFee + effectivePackagingFee + effectivePlatformFee + gstAmount);
  const isOutOfDeliveryRadius = userDist > 0 && maxRadius > 0 && userDist > maxRadius;

  // Filter products by selected Category, Veg/Non-Veg, and Branch Availability
  const displayedProducts = dynamicProducts.filter((item) => {
    // 1. Check branch availability
    if (item.branchIds) {
      let bIds: string[] = [];
      try {
        bIds = typeof item.branchIds === 'string' ? JSON.parse(item.branchIds) : item.branchIds;
      } catch {
        bIds = ['ALL'];
      }
      if (Array.isArray(bIds) && bIds.length > 0 && !bIds.includes('ALL') && !bIds.includes(selectedBranchId)) {
        return false;
      }
    }

    const matchCategory = item.categoryId === selectedCategory || selectedCategory === 'combos';
    if (!matchCategory && !searchQuery.trim()) return false;
    if (filterVegOnly && !item.isVeg) return false;
    if (filterNonVegOnly && item.isVeg) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        item.name.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q);
      if (!matchSearch) return false;
    }
    return true;
  });

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim() || !customerPhone.trim()) {
      showToast('Kripya Delivery Address aur Phone Number enter karein!');
      return;
    }
    setIsSubmitting(true);
    try {
      const itemsPayload = cartItemsList.map((it) => ({
        id: it.id,
        name: it.name,
        price: it.price,
        quantity: it.quantity
      }));

      const newOrder = await createOrderDirectly({
        customerName: currentUser?.name || 'Hacky Customer',
        customerPhone: customerPhone || currentUser?.phone || '9305938873',
        deliveryAddress: deliveryAddress || currentUser?.address || 'Ramkund Chauraha, Mahmudabad',
        userEmail: currentUser?.email || 'customer@hackypizza.com',
        userId: currentUser?.id || 'guest',
        items: itemsPayload,
        totalAmount: finalTotal,
        branchId: selectedBranchId || 'br_mahmudabad',
        branchName: currentOutlet || 'Mahmudabad Main Branch',
        notes: ''
      });

      const orderNumber = newOrder.orderNumber || newOrder.id;

      setPlacedOrder({
        id: orderNumber,
        address: deliveryAddress,
        phone: customerPhone,
        total: finalTotal,
        branch: currentOutlet
      });
      setCart({});
      setIsCartOpen(false);
      showToast(`🎉 Order #${orderNumber} placed for ${currentOutlet}!`);
    } catch (err: any) {
      console.error(err);
      alert('Order Error: ' + err.message);
      showToast('Order Error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F2] pb-24 font-sans text-[#502314] antialiased selection:bg-orange-200">
      
      {/* =========================================
          SCREEN 1: HOME PAGE (ONLY SUGGESTIONS & PROMOS)
         ========================================= */}
      {activeScreen === 'home' && (
        <div>
          {/* Top Header & Deliver From Bar */}
          <header className="sticky top-0 z-40 shadow-md">
            <div className="bg-[#502314] px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#3d1a0f]">
              <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <button 
                    onClick={() => setIsSideMenuOpen(true)}
                    aria-label="Open side menu"
                    className="text-white hover:opacity-80 transition cursor-pointer p-1 shrink-0"
                  >
                    <MenuIcon className="h-6 w-6 stroke-[2.5]" />
                  </button>

                  <a href="#" className="flex items-center gap-1.5 text-white font-black text-lg tracking-tight shrink-0">
                    <span role="img" aria-label="pizza">🍕</span>
                    <span className="uppercase font-extrabold tracking-wide">Hacky Pizza</span>
                  </a>
                </div>

                {/* Right: Quick Links and Cart Drawer Trigger */}
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href="/kds"
                    className="hidden md:inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-amber-200 transition"
                  >
                    🍳 KDS
                  </a>
                  <a
                    href="/manager"
                    className="hidden md:inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-orange-200 transition"
                  >
                    🏪 Manager
                  </a>

                  <button 
                    onClick={() => setIsCartOpen(true)}
                    aria-label="View Cart"
                    className="relative text-white active:scale-95 transition cursor-pointer p-1.5 rounded-xl hover:bg-white/10"
                  >
                    <ShoppingBag className="h-6 w-6 stroke-[2.5]" />
                    {totalCartItems > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#EA580C] text-[10px] font-black text-white shadow-md animate-in zoom-in-50">
                        {totalCartItems}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Sub-header: DELIVER FROM BAR */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#5B0E14]/10 bg-[#FFFBF2]">
              <span className="text-xs font-black text-[#5B0E14] uppercase tracking-wider">DELIVER FROM:</span>
              <BranchLocationPicker
                onBranchChange={(branch) => {
                  if (branch) {
                    setSelectedBranchId(branch.id);
                    setCurrentOutlet(branch.name);
                  }
                }}
              />
            </div>
          </header>

          {/* Hard Injected Direct Branch Banner & Location Popup */}
          <DirectBranchBanner />

          <div className="max-w-6xl mx-auto">
            {/* Burger King Style Banner Slider */}
            <BannerSlider />

            {/* Home Suggestions: 4-Column Grid */}
            <section className="px-3 sm:px-4 py-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-black text-[#502314] tracking-tight">Our Menu Suggestions</h3>
                <button 
                  onClick={() => setActiveScreen('menu')}
                  className="text-xs font-bold text-[#EA580C] hover:underline cursor-pointer"
                >
                  View Full Menu &gt;
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2.5">
                {CATEGORIES_DATA.map((cat) => (
                  <div 
                    key={cat.id} 
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setActiveScreen('menu');
                    }}
                    className="flex flex-col items-center text-center cursor-pointer active:scale-95 transition group"
                  >
                    <div className="h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-2xl bg-white p-1 shadow-sm border border-orange-100/80 group-hover:border-[#EA580C] relative">
                      <img 
                        src={cat.icon} 
                        alt={cat.name} 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                        className="h-full w-full rounded-xl object-cover" 
                      />
                      <div className="absolute inset-1 -z-10 rounded-xl overflow-hidden">
                        <FoodVisual type={cat.visualType} />
                      </div>
                    </div>
                    <span className="mt-1.5 text-[11px] font-bold leading-tight text-[#502314] line-clamp-2">
                      {cat.name}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Rewards Cashback Card */}
            <section className="px-3 sm:px-4 py-3">
              <div className="rounded-2xl bg-white p-4 shadow-sm border border-orange-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <Crown className="h-4 w-4 text-[#EA580C]" />
                      Hacky Rewards Balance
                    </div>
                    <div className="mt-1 text-2xl font-black text-[#502314]">
                      ₹50 <span className="text-xs font-bold text-green-600">(Welcome Bonus Active)</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setActiveScreen('menu');
                      showToast('₹50 Welcome Cashback active on your order!');
                    }}
                    className="rounded-full bg-[#EA580C] px-3.5 py-2 text-xs font-black uppercase tracking-wider text-white shadow active:scale-95 hover:bg-[#c2410c] transition cursor-pointer"
                  >
                    Redeem Now
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* =========================================
          SCREEN 2: EXACT TWO-COLUMN MENU LAYOUT
         ========================================= */}
      {activeScreen === 'menu' && (
        <div className="flex flex-col h-[calc(100vh-65px)]">
          
          {/* Menu Top Bar */}
          <div className="bg-[#502314] px-4 py-3 text-white flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveScreen('home')}
                aria-label="Back to home"
                className="cursor-pointer hover:opacity-80 p-1"
              >
                <MenuIcon className="h-6 w-6 stroke-[2.5]" />
              </button>
              <h2 className="text-xl font-black tracking-wide uppercase">Our Menu</h2>
            </div>
            
            <div className="flex items-center gap-3">
              <Search 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="h-5 w-5 text-orange-200 hover:text-white cursor-pointer" 
              />
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative text-white active:scale-95 transition cursor-pointer p-1"
              >
                <ShoppingBag className="h-5 w-5 stroke-[2.5]" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#EA580C] text-[9px] font-black text-white shadow-xs">
                    {totalCartItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Quick Search Strip */}
          {isSearchOpen && (
            <div className="bg-[#3d1a0f] p-2 px-4 border-t border-[#652d1b] flex items-center gap-2 shrink-0">
              <Search className="h-4 w-4 text-orange-300 shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Search pizzas, combos, sides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white text-xs px-3 py-1.5 rounded-lg text-[#502314] focus:outline-hidden"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-white/70 hover:text-white px-1 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Veg / Non-Veg Toggle Strip */}
          <div className="bg-[#F5ECE3] px-4 py-2 flex items-center gap-3 border-b border-[#ebdccd] shrink-0">
            {/* Veg Switch */}
            <div 
              onClick={() => {
                setFilterVegOnly(!filterVegOnly);
                if (!filterVegOnly) setFilterNonVegOnly(false);
              }}
              className={`flex items-center gap-2 cursor-pointer rounded-full border px-2.5 py-1 transition-all select-none ${
                filterVegOnly ? 'bg-green-50 border-green-600 shadow-sm' : 'bg-white border-gray-300'
              }`}
            >
              <div className="h-4 w-4 rounded-sm border-2 border-green-600 flex items-center justify-center p-0.5">
                <div className="h-2 w-2 rounded-full bg-green-600" />
              </div>
              <div className={`h-4 w-8 rounded-full p-0.5 flex items-center transition ${filterVegOnly ? 'bg-green-600 justify-end' : 'bg-gray-300 justify-start'}`}>
                <div className="h-3 w-3 rounded-full bg-white shadow-sm" />
              </div>
            </div>

            {/* Non-Veg Switch */}
            <div 
              onClick={() => {
                setFilterNonVegOnly(!filterNonVegOnly);
                if (!filterNonVegOnly) setFilterVegOnly(false);
              }}
              className={`flex items-center gap-2 cursor-pointer rounded-full border px-2.5 py-1 transition-all select-none ${
                filterNonVegOnly ? 'bg-red-50 border-red-700 shadow-sm' : 'bg-white border-gray-300'
              }`}
            >
              <div className="h-4 w-4 rounded-sm border-2 border-red-700 flex items-center justify-center p-0.5">
                <div className="h-0 w-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[6px] border-b-red-700" />
              </div>
              <div className={`h-4 w-8 rounded-full p-0.5 flex items-center transition ${filterNonVegOnly ? 'bg-red-700 justify-end' : 'bg-gray-300 justify-start'}`}>
                <div className="h-3 w-3 rounded-full bg-white shadow-sm" />
              </div>
            </div>

            {(filterVegOnly || filterNonVegOnly) && (
              <button
                onClick={() => {
                  setFilterVegOnly(false);
                  setFilterNonVegOnly(false);
                }}
                className="text-[11px] font-bold text-[#EA580C] hover:underline ml-auto cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* TWO-COLUMN LAYOUT: SIDEBAR + PRODUCT CARDS */}
          <div className="flex flex-1 overflow-hidden">
            
            {/* LEFT VERTICAL CATEGORY BAR */}
            <div className="w-[100px] sm:w-[125px] overflow-y-auto bg-[#F0E6DC] border-r border-[#e3d4c5] p-1.5 space-y-2 shrink-0">
              {CATEGORIES_DATA.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSearchQuery('');
                    }}
                    className={`w-full rounded-xl p-2 flex flex-col items-center text-center transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-[#502314] text-white shadow-md ring-2 ring-[#EA580C]/40' 
                        : 'bg-white text-[#502314] hover:bg-orange-50 shadow-sm'
                    }`}
                  >
                    <div className="relative h-9 w-9 rounded-lg overflow-hidden mb-1 border border-black/5 bg-orange-100">
                      <img 
                        src={cat.icon} 
                        alt={cat.name} 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 -z-10 flex items-center justify-center">
                        <FoodVisual type={cat.visualType} />
                      </div>
                    </div>
                    <span className="text-[10px] font-black leading-tight line-clamp-2">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* RIGHT PRODUCT FEED */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#FDF8F2]">
              {displayedProducts.length === 0 ? (
                <div className="p-8 text-center space-y-3 bg-white rounded-2xl border border-orange-100">
                  <div className="text-4xl">🍕</div>
                  <h4 className="font-bold text-sm text-[#502314]">No dishes found</h4>
                  <p className="text-xs text-gray-500">
                    Try switching filters or selecting a different category.
                  </p>
                  <button
                    onClick={() => {
                      setFilterVegOnly(false);
                      setFilterNonVegOnly(false);
                      setSearchQuery('');
                    }}
                    className="px-4 py-1.5 bg-[#EA580C] text-white text-xs font-bold rounded-full cursor-pointer"
                  >
                    Reset Filter
                  </button>
                </div>
              ) : (
                displayedProducts.map((prod) => {
                  const qty = cart[prod.id] || 0;
                  return (
                    <div 
                      key={prod.id}
                      className="relative flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm border border-orange-100 hover:shadow-md transition"
                    >
                      {/* Left Food Image with vector fallback */}
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-orange-100">
                        <img 
                          src={prod.image} 
                          alt={prod.name} 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 -z-10">
                          <FoodVisual type={prod.visualType} />
                        </div>
                      </div>

                      {/* Middle Details */}
                      <div className="flex-1 px-3 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs sm:text-sm font-black text-[#502314] leading-tight truncate">
                            {prod.name}
                          </h4>
                          <div className={`shrink-0 h-3.5 w-3.5 rounded-sm border p-0.5 flex items-center justify-center ${prod.isVeg ? 'border-green-600 bg-green-50' : 'border-red-700 bg-red-50'}`}>
                            {prod.isVeg ? (
                              <div className="h-1.5 w-1.5 rounded-full bg-green-600" />
                            ) : (
                              <div className="h-0 w-0 border-l-[2.5px] border-l-transparent border-r-[2.5px] border-r-transparent border-b-[5px] border-b-red-700" />
                            )}
                          </div>
                        </div>

                        <p className="mt-1 text-[10px] text-gray-500 line-clamp-2 leading-relaxed">
                          {prod.desc}
                        </p>

                        <div className="mt-2.5 flex items-center justify-between">
                          <span className="text-sm font-black text-[#502314] tabular-nums">
                            ₹{prod.price}/-
                          </span>

                          {qty === 0 ? (
                            <button
                              onClick={() => addToCart(prod.id)}
                              className="rounded-full bg-[#D62300] px-4 py-1 text-xs font-black uppercase tracking-wider text-white shadow active:scale-95 hover:bg-[#b01e00] transition cursor-pointer"
                            >
                              Add +
                            </button>
                          ) : (
                            <div className="flex items-center rounded-full bg-[#D62300] px-2 py-0.5 text-white shadow">
                              <button 
                                onClick={() => removeFromCart(prod.id)} 
                                className="p-0.5 active:scale-90 cursor-pointer"
                              >
                                <Minus className="h-3 w-3 stroke-[3]" />
                              </button>
                              <span className="px-2 text-xs font-black tabular-nums">{qty}</span>
                              <button 
                                onClick={() => addToCart(prod.id)} 
                                className="p-0.5 active:scale-90 cursor-pointer"
                              >
                                <Plus className="h-3 w-3 stroke-[3]" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>
      )}

      {/* =========================================
          SCREEN 3: REWARDS VIEW
         ========================================= */}
      {activeScreen === 'rewards' && (
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          <div className="rounded-3xl bg-gradient-to-br from-[#502314] via-[#782811] to-[#EA580C] text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="relative z-10 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-black uppercase text-amber-200">
                <Crown className="w-4 h-4 text-amber-400" />
                Silver Crown Member
              </span>
              <h2 className="text-2xl sm:text-4xl font-black uppercase">
                Hacky Crown Rewards
              </h2>
              <div className="flex items-baseline gap-2 pt-2">
                <span className="text-4xl sm:text-5xl font-black text-amber-300 tabular-nums">
                  ₹50
                </span>
                <span className="text-sm sm:text-base text-orange-200 font-bold">
                  (Welcome Bonus Active)
                </span>
              </div>
              <p className="text-xs sm:text-sm text-orange-100/90 leading-relaxed max-w-lg">
                Your ₹50 welcome cashback is ready! Pay via Cash on Delivery and enjoy doorstep hot pizza delivery in Mahmudabad.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setActiveScreen('menu')}
                  className="px-6 py-3 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider bg-white text-[#502314] hover:bg-orange-50 active:scale-95 transition cursor-pointer shadow-md"
                >
                  Order Now &gt;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          SLIDE-OVER CART DRAWER (COD ONLY)
         ========================================= */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            
            {/* Cart Header */}
            <div className="bg-[#502314] px-4 py-3.5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bike className="h-5 w-5 text-[#EA580C]" />
                <h3 className="text-sm font-black uppercase tracking-wider">Your Delivery Order</h3>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="text-gray-300 hover:text-white cursor-pointer p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Out of Delivery Radius Alert */}
              {isOutOfDeliveryRadius && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-start gap-2 shadow-xs">
                  <span className="text-base shrink-0">⚠️</span>
                  <div>
                    <span className="font-black uppercase tracking-wider text-[11px] block text-red-900">
                      Delivery Radius Notice ({userDist.toFixed(1)} km)
                    </span>
                    <span className="leading-relaxed">
                      Aap <strong>{currentOutlet}</strong> se <strong>{userDist.toFixed(1)} km</strong> door hain (Standard limit: <strong>{maxRadius} km</strong>). Delivery time zyada lag sakta hai.
                    </span>
                  </div>
                </div>
              )}

              {cartItemsList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-16">
                  <ShoppingBag className="h-12 w-12 text-gray-300 mb-2 stroke-[1.5]" />
                  <p className="text-sm font-bold text-[#502314]">Your cart is empty.</p>
                  <p className="text-xs text-gray-500">Add delicious hot pizzas from our menu!</p>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setActiveScreen('menu');
                    }}
                    className="mt-4 px-4 py-2 bg-[#EA580C] text-white text-xs font-bold rounded-full cursor-pointer"
                  >
                    Explore Menu
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {cartItemsList.map((item) => (
                      <div key={item.id} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <p className="text-xs font-bold text-[#502314]">{item.name}</p>
                          <p className="text-xs text-gray-500">₹{item.price} x {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-2 font-black text-xs text-[#502314] tabular-nums">
                          ₹{item.price * item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Details Inputs */}
                  <div className="mt-4 pt-3 border-t space-y-3">
                    <h4 className="text-xs font-black uppercase text-[#502314] tracking-wider">Delivery Details</h4>
                    <div>
                      <label className="text-[10px] font-bold text-gray-600 uppercase">Complete Address *</label>
                      <input 
                        type="text" 
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="e.g. Near Clock Tower, Ramkund Chauraha"
                        className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs focus:border-[#EA580C] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-600 uppercase">Phone Number *</label>
                      <input 
                        type="tel" 
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="10-digit mobile number"
                        className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs focus:border-[#EA580C] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Payment Mode Selection (ONLY CASH ON DELIVERY) */}
                  <div className="mt-3 p-3 rounded-xl bg-orange-50 border border-orange-200">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-[#EA580C]" />
                      <span className="text-xs font-black uppercase text-[#502314] tracking-wider">
                        Payment Method
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between bg-white p-2.5 rounded-lg border border-orange-200 shadow-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-[#EA580C]" />
                        <span className="text-xs font-bold text-[#502314]">Cash On Delivery (COD)</span>
                      </div>
                      <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                        Pay on Delivery
                      </span>
                    </div>
                    <p className="mt-1.5 text-[10px] text-gray-500 leading-relaxed">
                      * UPI / Card payment online band hai. Delivery boy aane par cash ya scanner par pay kar sakte hain.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Cart Footer Itemized Bill Details */}
            {cartItemsList.length > 0 && (
              <div className="p-4 border-t bg-gray-50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Item Total (Subtotal):</span>
                  <span className="font-bold text-[#502314] tabular-nums">₹{subTotal}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">
                    Delivery Partner Fee {isFreeDelivery ? `(Free > ₹${billingSettings.freeDeliveryAbove})` : ''}:
                  </span>
                  <span className="font-bold tabular-nums">
                    {effectiveDeliveryFee === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      `₹${effectiveDeliveryFee}`
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Restaurant Packaging Fee:</span>
                  <span className="font-bold text-[#502314] tabular-nums">₹{effectivePackagingFee}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Platform Convenience Fee:</span>
                  <span className="font-bold text-[#502314] tabular-nums">₹{effectivePlatformFee}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Govt. Taxes & GST ({billingSettings.gstPercent}%):</span>
                  <span className="font-bold text-[#502314] tabular-nums">₹{gstAmount}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-black text-[#502314] border-t pt-2">
                  <div>
                    <span>To Pay (Grand Total):</span>
                    <span className="text-[10px] font-normal text-gray-500 block">Inclusive of all taxes & charges</span>
                  </div>
                  <span className="tabular-nums text-lg font-black text-[#D62300]">₹{finalTotal}</span>
                </div>
                <button
                  disabled={isSubmitting}
                  onClick={handlePlaceOrder}
                  className="w-full rounded-full bg-[#D62300] py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg active:scale-95 hover:bg-[#b01e00] disabled:opacity-50 transition cursor-pointer"
                >
                  {isSubmitting ? 'Placing Order...' : 'Confirm Delivery Order (COD)'}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* =========================================
          ORDER PLACED SUCCESS MODAL
         ========================================= */}
      {placedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-orange-100">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-[#EA580C] text-[10px] font-black uppercase">
                Order #{placedOrder.id} Confirmed
              </span>
              <h3 className="text-lg font-black text-[#502314] uppercase">
                Order Placed Successfully!
              </h3>
              <p className="text-xs text-gray-500">
                Aapka pizza wood-fired oven me bake ho raha hai. Delivery boy 30 minutes me deliver karega.
              </p>
            </div>

            <div className="p-3 bg-[#FDF8F2] rounded-xl text-left text-xs space-y-1 border border-orange-100">
              <div className="flex items-center justify-between font-bold text-[#502314]">
                <span>Payment Mode:</span>
                <span className="text-emerald-700">Cash on Delivery (COD)</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>Total Amount:</span>
                <span className="font-bold text-[#502314]">₹{placedOrder.total}</span>
              </div>
              <div className="text-[11px] text-gray-500 pt-1 border-t border-orange-200/60 truncate">
                Deliver to: {placedOrder.address}
              </div>
            </div>

            <button
              onClick={() => {
                setPlacedOrder(null);
                setActiveScreen('menu');
              }}
              className="w-full py-2.5 bg-[#EA580C] hover:bg-[#c2410c] text-white text-xs font-black uppercase rounded-full cursor-pointer shadow-md"
            >
              Order More Items
            </button>
          </div>
        </div>
      )}

      {/* =========================================
          FIXED BOTTOM NAVIGATION BAR
         ========================================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around bg-[#502314] py-2 px-2 shadow-2xl border-t border-[#6b301c]">
        {/* Home Tab */}
        <button 
          onClick={() => setActiveScreen('home')}
          className="flex flex-col items-center gap-1 relative px-3 py-1 cursor-pointer select-none"
        >
          {activeScreen === 'home' && (
            <span className="absolute -top-2 h-1 w-8 rounded-full bg-[#EA580C]" />
          )}
          <Home className={`h-5 w-5 ${activeScreen === 'home' ? 'text-[#EA580C]' : 'text-gray-300'}`} />
          <span className={`text-[10px] font-black uppercase tracking-wider ${activeScreen === 'home' ? 'text-[#EA580C]' : 'text-gray-300'}`}>
            Home
          </span>
        </button>

        {/* Menu Tab */}
        <button 
          onClick={() => setActiveScreen('menu')}
          className="flex flex-col items-center gap-1 relative px-3 py-1 cursor-pointer select-none"
        >
          {activeScreen === 'menu' && (
            <span className="absolute -top-2 h-1 w-8 rounded-full bg-[#EA580C]" />
          )}
          <UtensilsCrossed className={`h-5 w-5 ${activeScreen === 'menu' ? 'text-[#EA580C]' : 'text-gray-300'}`} />
          <span className={`text-[10px] font-black uppercase tracking-wider ${activeScreen === 'menu' ? 'text-[#EA580C]' : 'text-gray-300'}`}>
            Menu
          </span>
        </button>

        {/* Rewards Tab */}
        <button 
          onClick={() => setActiveScreen('rewards')}
          className="flex flex-col items-center gap-1 relative px-3 py-1 cursor-pointer select-none"
        >
          {activeScreen === 'rewards' && (
            <span className="absolute -top-2 h-1 w-8 rounded-full bg-[#EA580C]" />
          )}
          <Crown className={`h-5 w-5 ${activeScreen === 'rewards' ? 'text-[#EA580C]' : 'text-gray-300'}`} />
          <span className={`text-[10px] font-black uppercase tracking-wider ${activeScreen === 'rewards' ? 'text-[#EA580C]' : 'text-gray-300'}`}>
            Rewards
          </span>
        </button>
      </nav>

      {/* Floating Bottom Quick Cart Bar when items in cart */}
      {totalCartItems > 0 && !isCartOpen && !placedOrder && (
        <div className="fixed bottom-16 sm:bottom-18 inset-x-3 sm:max-w-md sm:mx-auto z-40 animate-in slide-in-from-bottom duration-200">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full p-3 bg-[#EA580C] hover:bg-[#c2410c] text-white rounded-2xl shadow-2xl border border-white/20 flex items-center justify-between cursor-pointer transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-black/20 flex items-center justify-center font-black text-xs text-white">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-black uppercase tracking-wider leading-tight">
                  {totalCartItems} {totalCartItems === 1 ? 'Item' : 'Items'} In Cart
                </div>
                <div className="text-[11px] text-orange-200 font-semibold tabular-nums">
                  ₹{finalTotal} · Express Free Delivery
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-white text-[#502314] px-3.5 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-xs">
              <span>View Cart</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Side Menu Drawer */}
      <SideMenuDrawer
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        user={currentUser}
        onOpenAuth={() => {
          setIsSideMenuOpen(false);
          setActiveScreen('rewards');
        }}
        onNavigateTab={(tab) => {
          if (tab === 'stores') {
            setIsOutletPickerOpen(true);
          } else {
            setActiveScreen(tab === 'menu' ? 'menu' : tab === 'rewards' ? 'rewards' : 'home');
          }
        }}
        onOpenStores={() => {
          setIsOutletPickerOpen(true);
        }}
      />

      {/* Outlet Switcher Modal */}
      <OutletSwitcherModal
        isOpen={isOutletPickerOpen}
        onClose={() => setIsOutletPickerOpen(false)}
        selectedOutlet={currentOutlet}
        onSelectOutlet={(name, branchId) => {
          setCurrentOutlet(name);
          if (branchId) {
            setSelectedBranchId(branchId);
            try {
              localStorage.setItem('hacky_selected_branch', JSON.stringify({ id: branchId, name }));
            } catch {}
          }
          showToast(`Now ordering from ${name}`);
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#502314] text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-full shadow-2xl border border-[#EA580C]/50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom duration-200 pointer-events-none">
          <span className="text-base">🍕</span>
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
