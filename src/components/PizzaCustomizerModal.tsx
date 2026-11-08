'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  X, 
  Check, 
  Plus, 
  Minus, 
  ChevronRight,
  Coffee,
  Sparkles
} from 'lucide-react';
import { CartLineItem, CustomizedPizzaOptions } from '../types';

export interface CustomizerModifierOption {
  name: string;
  price: number;
}

export interface PizzaCustomizerTarget {
  id: string;
  name: string;
  desc?: string;
  price: number;
  image: string;
  isVeg: boolean;
  cartItemId?: string; // If editing an existing cart item
  existingCustomization?: CustomizedPizzaOptions;
  existingQuantity?: number;
  sizeOptions?: CustomizerModifierOption[];
  crustOptions?: CustomizerModifierOption[];
  beveragePairings?: CustomizerModifierOption[];
}

interface PizzaCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pizza: PizzaCustomizerTarget | null;
  onAddToCart: (item: CartLineItem) => void;
}

interface BeverageSideItem {
  id: string;
  name: string;
  price: number;
  image: string;
  desc: string;
  badge?: string;
}

const BEVERAGES_AND_SIDES: BeverageSideItem[] = [
  {
    id: 'none',
    name: 'None',
    price: 0,
    image: '',
    desc: 'No side selected',
  },
  {
    id: 'coke',
    name: 'Coca Cola Can',
    price: 45,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=150&auto=format&fit=crop&q=80',
    desc: 'Chilled 300ml can',
    badge: 'Popular'
  },
  {
    id: 'sprite',
    name: 'Sprite Can',
    price: 45,
    image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=150&auto=format&fit=crop&q=80',
    desc: 'Refreshing lime 300ml',
    badge: 'Chilled'
  },
  {
    id: 'cold_coffee',
    name: 'Classic Cold Coffee',
    price: 79,
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=150&auto=format&fit=crop&q=80',
    desc: 'Creamy thick brew',
    badge: 'Bestseller'
  },
  {
    id: 'french_fries',
    name: 'French Fries',
    price: 69,
    image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=150&auto=format&fit=crop&q=80',
    desc: 'Crispy salted golden fries',
  },
  {
    id: 'peri_peri_fries',
    name: 'Peri Peri Fries',
    price: 89,
    image: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=150&auto=format&fit=crop&q=80',
    desc: 'Spicy seasoned fries',
    badge: 'Spicy 🔥'
  },
  {
    id: 'choco_lava',
    name: 'Choco Lava Cake',
    price: 99,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=150&auto=format&fit=crop&q=80',
    desc: 'Molten warm chocolate center',
    badge: 'Sweet Tooth'
  }
];

export default function PizzaCustomizerModal({
  isOpen,
  onClose,
  pizza,
  onAddToCart,
}: PizzaCustomizerModalProps) {
  // Fallback defaults
  const availableSizes = (pizza?.sizeOptions && pizza.sizeOptions.length > 0)
    ? pizza.sizeOptions
    : [
        { name: 'Regular', price: 0 },
        { name: 'Medium', price: 150 },
        { name: 'Large', price: 300 }
      ];

  const availableCrusts = (pizza?.crustOptions && pizza.crustOptions.length > 0)
    ? pizza.crustOptions
    : [
        { name: 'Classic Hand Tossed', price: 0 },
        { name: 'Cheese Burst', price: 75 },
        { name: 'Fresh Pan', price: 40 }
      ];

  const availableBeverages = (pizza?.beveragePairings && pizza.beveragePairings.length > 0)
    ? [
        { id: 'none', name: 'None', price: 0, image: '', desc: 'No side selected' },
        ...pizza.beveragePairings.map((b, i) => ({
          id: `bev_${i}`,
          name: b.name,
          price: b.price,
          image: BEVERAGES_AND_SIDES.find(item => item.name.toLowerCase().includes(b.name.toLowerCase()))?.image || 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=150&auto=format&fit=crop&q=80',
          desc: 'Refreshing add-on pairing',
          badge: b.price < 50 ? 'Popular' : undefined
        }))
      ]
    : BEVERAGES_AND_SIDES;

  // Step 1: Size
  const [size, setSize] = useState<string>('Regular');
  // Step 2: Crust
  const [crust, setCrust] = useState<string>('Classic Hand Tossed');
  // Step 3: Beverages & Sides
  const [beverage, setBeverage] = useState<string>('None');
  // Special instructions
  const [specialInstructions, setSpecialInstructions] = useState('');
  // Quantity
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (pizza) {
      if (pizza.existingCustomization) {
        setSize(pizza.existingCustomization.size);
        setCrust(pizza.existingCustomization.crust);
        setBeverage(pizza.existingCustomization.beverage || 'None');
        setSpecialInstructions(pizza.existingCustomization.specialInstructions || '');
        setQuantity(pizza.existingQuantity || 1);
      } else {
        setSize(availableSizes[0]?.name || 'Regular');
        setCrust(availableCrusts[0]?.name || 'Classic Hand Tossed');
        setBeverage('None');
        setSpecialInstructions('');
        setQuantity(1);
      }
    }
  }, [pizza, isOpen]);

  if (!isOpen || !pizza) return null;

  // Price calculations
  const basePrice = pizza.price;
  const selectedSizeObj = availableSizes.find(s => s.name === size);
  const sizePrice = selectedSizeObj ? Number(selectedSizeObj.price) : 0;

  const selectedCrustObj = availableCrusts.find(c => c.name === crust);
  const crustPrice = selectedCrustObj ? Number(selectedCrustObj.price) : 0;
  
  // Find beverage price
  const selectedSideObj = availableBeverages.find(b => b.name === beverage);
  const beveragePrice = selectedSideObj ? Number(selectedSideObj.price) : 0;

  const unitTotal = basePrice + sizePrice + crustPrice + beveragePrice;
  const grandTotal = unitTotal * quantity;
  const originalMRP = Math.round((unitTotal * 1.35) * quantity);

  const handleConfirmAddToCart = () => {
    const customizedOptions: CustomizedPizzaOptions = {
      size,
      sizePrice,
      crust,
      crustPrice,
      extraCheese: false,
      garlicHerbDip: false,
      spicyPeriPeriDip: false,
      excludedIngredients: [],
      beverage,
      beveragePrice,
      specialInstructions: specialInstructions.trim(),
    };

    const cartItem: CartLineItem = {
      cartItemId: pizza.cartItemId || `cart_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      pizzaId: pizza.id,
      name: pizza.name,
      image: pizza.image,
      isVeg: pizza.isVeg,
      basePrice,
      totalUnitPrice: unitTotal,
      quantity,
      customization: customizedOptions,
    };

    onAddToCart(cartItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Modal Dialog (Burger King Style Soft Cream & Deep Brown) */}
      <div className="relative w-full max-w-lg bg-[#FFFBF2] text-[#502314] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden border-2 border-[#502314] animate-in slide-in-from-bottom duration-300">
        
        {/* Top Header Bar */}
        <div className="bg-[#502314] text-white px-5 py-3.5 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-2.5">
            <button 
              onClick={onClose} 
              className="p-1 rounded-full text-amber-200 hover:text-white hover:bg-white/10 transition"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <span className="text-xl">🍕</span>
            <div>
              <span className="text-[10px] font-black tracking-widest text-[#EA580C] uppercase block">
                HAVE IT YOUR WAY
              </span>
              <h2 className="text-sm font-black tracking-wide text-white uppercase font-sans">
                CUSTOMISE YOUR MEAL
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-bold uppercase rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition flex items-center gap-1"
          >
            <span>CLOSE</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Customization Steps */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          
          {/* Pizza Preview Banner */}
          <div className="p-3 bg-[#F8EFE0] rounded-2xl border border-[#E8D6BF] flex items-center gap-3 shadow-xs">
            <img 
              src={pizza.image} 
              alt={pizza.name} 
              className="w-16 h-16 rounded-xl object-cover shrink-0 shadow-sm border border-[#502314]/20" 
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center p-0.5 shrink-0 ${pizza.isVeg ? 'border-emerald-600' : 'border-red-600'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${pizza.isVeg ? 'bg-emerald-600' : 'bg-red-600'}`} />
                </span>
                <h3 className="font-black text-base leading-tight text-[#502314] truncate">{pizza.name}</h3>
              </div>
              <p className="text-xs text-[#7A4B3A] line-clamp-1 mt-0.5">{pizza.desc || 'Handcrafted wood-fired pizza'}</p>
              <span className="text-xs font-black text-[#EA580C] mt-1 inline-block">Starting at ₹{basePrice}</span>
            </div>
          </div>

          {/* STEP 1: PICK PIZZA SIZE */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#502314] flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#EA580C] text-white text-[10px] font-black flex items-center justify-center">1</span>
                PICK PIZZA SIZE *
              </h4>
              <span className="text-[10px] font-black text-[#EA580C] tracking-wide">REQUIRED</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {availableSizes.map((s) => {
                const isSelected = size === s.name;
                const addPrice = Number(s.price) || 0;
                return (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => setSize(s.name)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                      isSelected 
                        ? 'border-[#EA580C] bg-[#FFF2E2] shadow-md ring-2 ring-[#EA580C]/20' 
                        : 'border-[#E8D6BF] bg-white hover:border-[#EA580C]/50'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#EA580C] text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                    <div>
                      <div className="font-black text-sm text-[#502314]">{s.name}</div>
                      <div className="text-[11px] text-[#7A4B3A] font-semibold mt-0.5">Custom Option</div>
                    </div>
                    <div className="text-xs font-black text-[#EA580C] mt-2">
                      {addPrice === 0 ? `₹${basePrice}` : `+₹${addPrice}`}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* STEP 2: SELECT CRUST */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#502314] flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#EA580C] text-white text-[10px] font-black flex items-center justify-center">2</span>
                SELECT CRUST *
              </h4>
              <span className="text-[10px] font-black text-[#EA580C] tracking-wide">REQUIRED</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {availableCrusts.map((c) => {
                const isSelected = crust === c.name;
                const addPrice = Number(c.price) || 0;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setCrust(c.name)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected 
                        ? 'border-[#EA580C] bg-[#FFF2E2] shadow-md ring-2 ring-[#EA580C]/20' 
                        : 'border-[#E8D6BF] bg-white hover:border-[#EA580C]/50'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-[#502314]">{c.name}</div>
                      <div className="text-[11px] text-[#7A4B3A]">Fresh Crust</div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-[#EA580C] block">
                        {addPrice === 0 ? '+₹0' : `+₹${addPrice}`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* STEP 3: PAIR WITH BEVERAGES & SIDES (With real images and clean cards) */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#502314] flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#EA580C] text-white text-[10px] font-black flex items-center justify-center">3</span>
                PAIR WITH BEVERAGES &amp; SIDES
              </h4>
              <span className="text-[10px] font-bold text-[#7A4B3A] uppercase">OPTIONAL</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {availableBeverages.map((item) => {
                const isSelected = beverage === item.name;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setBeverage(item.name)}
                    className={`relative p-2.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between cursor-pointer overflow-hidden ${
                      isSelected 
                        ? 'border-[#EA580C] bg-[#FFF2E2] shadow-md ring-2 ring-[#EA580C]/20' 
                        : 'border-[#E8D6BF] bg-white hover:border-[#EA580C]/40'
                    }`}
                  >
                    {/* Badge */}
                    {item.badge && (
                      <span className="absolute top-2 left-2 z-10 text-[9px] font-black bg-[#EA580C] text-white px-1.5 py-0.5 rounded-md shadow-xs">
                        {item.badge}
                      </span>
                    )}

                    {/* Selected Check Indicator */}
                    {isSelected && (
                      <span className="absolute top-2 right-2 z-10 w-4 h-4 rounded-full bg-[#EA580C] text-white flex items-center justify-center shadow">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}

                    {/* Image Area */}
                    <div className="w-full h-20 rounded-xl overflow-hidden bg-amber-50 mb-2 flex items-center justify-center border border-[#E8D6BF]/40">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-[#7A4B3A] text-xs font-bold gap-1">
                          <span className="text-xl">🚫</span>
                          <span className="text-[10px]">No Side Item</span>
                        </div>
                      )}
                    </div>

                    {/* Text Details */}
                    <div>
                      <div className="font-bold text-xs text-[#502314] line-clamp-1">{item.name}</div>
                      <div className="text-[10px] text-[#7A4B3A] line-clamp-1 mt-0.5">{item.desc}</div>
                    </div>

                    {/* Price Tag */}
                    <div className="mt-2 pt-1 border-t border-[#E8D6BF]/50 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#7A4B3A]">Price</span>
                      <span className="text-xs font-black text-[#EA580C]">
                        {item.price === 0 ? '+₹0' : `+₹${item.price}`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Special Instructions for Kitchen Chef */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-[#502314] uppercase">Special Instructions for Kitchen Chef (Optional)</label>
            <input
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Please make extra crispy / cut into 6 slices"
              className="w-full px-3 py-2 bg-white border border-[#E8D6BF] rounded-xl text-xs text-[#502314] focus:outline-none focus:border-[#EA580C]"
            />
          </div>

        </div>

        {/* Sticky Bottom Bar */}
        <div className="bg-[#FFFDF9] border-t-2 border-[#E8D6BF] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl shrink-0">
          
          {/* Price & Quantity Summary */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#EA580C] leading-none">
                  ₹{grandTotal}
                </span>
                <span className="text-xs font-bold text-stone-400 line-through">
                  ₹{originalMRP}
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#7A4B3A] uppercase tracking-wider block mt-0.5">
                Item Total (Excl. Tax)
              </span>
            </div>

            {/* Stepper Quantity */}
            <div className="flex items-center border-2 border-[#502314] rounded-full overflow-hidden bg-white shadow-xs">
              <button
                type="button"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="px-2.5 py-1 text-[#502314] hover:bg-[#F8EFE0] font-black text-sm"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-3 py-1 font-black text-sm text-[#502314] tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(q => q + 1)}
                className="px-2.5 py-1 text-[#502314] hover:bg-[#F8EFE0] font-black text-sm"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Add to Cart CTA Button */}
          <button
            type="button"
            onClick={handleConfirmAddToCart}
            className="w-full sm:w-auto flex-1 sm:max-w-xs py-3.5 px-6 bg-gradient-to-r from-[#EA580C] to-[#D64500] hover:from-[#c2410c] hover:to-[#b91c1c] text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{pizza.cartItemId ? 'UPDATE PIZZA IN CART' : 'ADD TO CART'}</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

      </div>
    </div>
  );
}
