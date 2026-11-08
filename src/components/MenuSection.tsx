import React, { useState, useEffect } from 'react';
import { fetchLiveStoreData } from '../lib/neonClient';

interface MenuSectionProps {
  onAddToCart?: (item: any) => void;
  onOpenCustomizer?: (item: any) => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({ onAddToCart, onOpenCustomizer }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [vegFilter, setVegFilter] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL');
  const [loading, setLoading] = useState(true);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

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

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await fetchLiveStoreData();
        if (res.success && res.data) {
          const cats = res.data.categories || [];
          const items = res.data.menuItems || [];

          setCategories(cats);
          setMenuItems(items);

          if (cats.length > 0) {
            // Set first category active by default
            setActiveCategory(cats[0].name || cats[0].id);
          }
        }
      } catch (err) {
        console.error('Menu load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter Items strictly by matching Category Name or ID:
  const displayedItems = menuItems.filter((item: any) => {
    // 1. Veg / Non-Veg filter
    if (vegFilter === 'VEG' && !item.isVeg) return false;
    if (vegFilter === 'NON_VEG' && item.isVeg) return false;

    // 2. Category matching (case-insensitive and tolerant of ID vs Name)
    if (!activeCategory || activeCategory === 'ALL' || activeCategory === 'all') return true;

    const activeCatObj = categories.find((c: any) => c.name === activeCategory || c.id === activeCategory);
    const activeName = (activeCatObj?.name || activeCategory || '').toLowerCase();
    const activeId = (activeCatObj?.id || activeCategory || '').toLowerCase();

    const itemCatName = (item.categoryName || (item as any).category || '').toLowerCase();
    const itemCatId = (item.categoryId || '').toLowerCase();

    const catMatch = 
      (itemCatName && itemCatName === activeName) ||
      (itemCatId && (itemCatId === activeId || itemCatId === activeName)) ||
      (itemCatName && (itemCatName === activeId || itemCatName.includes(activeName) || activeName.includes(itemCatName))) ||
      (itemCatId && (itemCatId.includes(activeId) || activeId.includes(itemCatId))) ||
      (item.categoryName && item.categoryName.toLowerCase() === activeCategory.toLowerCase()) ||
      (item.categoryId && item.categoryId === activeCategory);

    return Boolean(catMatch);
  });

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-[#FFFDF9]">
      {/* FILTER HEADER: VEG / NON-VEG TOGGLE */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[#F6EFE5] border-b border-[#5B0E14]/10 shrink-0">
        <button
          onClick={() => setVegFilter(vegFilter === 'VEG' ? 'ALL' : 'VEG')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold transition-all ${
            vegFilter === 'VEG'
              ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-sm'
              : 'bg-white border-[#5B0E14]/15 text-stone-700 hover:bg-stone-50'
          }`}
        >
          <span className="w-3 h-3 rounded-xs border border-emerald-600 flex items-center justify-center p-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          </span>
          <span>Veg Only</span>
        </button>

        <button
          onClick={() => setVegFilter(vegFilter === 'NON_VEG' ? 'ALL' : 'NON_VEG')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold transition-all ${
            vegFilter === 'NON_VEG'
              ? 'bg-red-50 border-red-600 text-red-800 shadow-sm'
              : 'bg-white border-[#5B0E14]/15 text-stone-700 hover:bg-stone-50'
          }`}
        >
          <span className="w-3 h-3 rounded-xs border border-red-600 flex items-center justify-center p-0.5">
            <span className="w-0 h-0 border-l-[2.5px] border-l-transparent border-r-[2.5px] border-r-transparent border-b-[5px] border-b-red-600" />
          </span>
          <span>Non-Veg Only</span>
        </button>

        {vegFilter !== 'ALL' && (
          <button
            onClick={() => setVegFilter('ALL')}
            className="text-[11px] font-bold text-gray-500 hover:text-black ml-auto underline"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* MAIN TWO-COLUMN CONTAINER */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR: CATEGORIES */}
        <div className="w-28 sm:w-32 bg-[#F6EFE5] border-r border-[#5B0E14]/10 overflow-y-auto py-2 flex flex-col items-center gap-2 shrink-0">
          {categories.map((cat: any) => {
            const isActive = (cat.name === activeCategory || cat.id === activeCategory);
            const catImage = cat.image || cat.iconUrl || cat.icon;
            const hasError = imgErrors[cat.id || cat.name];

            return (
              <button
                key={cat.id || cat.name}
                onClick={() => setActiveCategory(cat.name || cat.id)}
                className={`w-24 p-2 rounded-2xl flex flex-col items-center justify-center transition-all ${
                  isActive 
                    ? 'bg-[#5B0E14] text-white shadow-md ring-2 ring-[#5B0E14]/20' 
                    : 'bg-white text-[#5B0E14] hover:bg-orange-50 border border-stone-200'
                }`}
              >
                {/* Category Image with SVG/Emoji Fallback if image fails */}
                <div className="w-10 h-10 rounded-xl overflow-hidden mb-1 flex items-center justify-center bg-black/5 shrink-0">
                  {catImage && catImage.startsWith('http') && !hasError ? (
                    <img
                      src={catImage}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                      onError={() => {
                        setImgErrors(prev => ({ ...prev, [cat.id || cat.name]: true }));
                      }}
                    />
                  ) : (
                    <span className="text-xl select-none">{getCategoryIcon(cat.name)}</span>
                  )}
                </div>
                <span className="text-[11px] font-black leading-tight text-center line-clamp-2">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* RIGHT SIDE: ITEMS LIST */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center py-10 text-xs text-gray-500 font-bold">Items load ho rahe hain...</div>
          ) : displayedItems.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <span className="text-3xl select-none">🍕</span>
              <p className="text-xs font-bold text-gray-500">
                Is category me abhi koi product nahi hai.
              </p>
              <p className="text-[10px] text-gray-400">
                Super Admin se is category ({activeCategory}) ke andar pizza add karein!
              </p>
            </div>
          ) : (
            displayedItems.map((item: any) => {
              const itemPrice = Number(item.price || item.basePrice || 0);
              const hasVariants = Boolean(item.hasVariants && item.sizePrices);

              return (
                <div 
                  key={item.id} 
                  className="bg-white rounded-2xl p-3 border border-[#5B0E14]/10 shadow-sm flex items-center justify-between gap-3 hover:border-orange-200 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase truncate">{item.categoryName || activeCategory}</span>
                    </div>
                    <h4 className="font-black text-sm text-[#5B0E14] truncate">{item.name}</h4>
                    <p className="text-[11px] text-gray-500 line-clamp-1">{item.description || 'Delicious freshly baked Hacky Pizza'}</p>
                    
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs font-black text-orange-600">
                        ₹{itemPrice}
                      </span>
                      {hasVariants && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          Sizes Available
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                    <img 
                      src={item.image || item.imageUrl || 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=300'} 
                      alt={item.name}
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300');
                      }}
                    />

                    {/* Action button: ADD or CUSTOMIZE */}
                    {(onAddToCart || onOpenCustomizer) && (
                      <button
                        onClick={() => {
                          if (onOpenCustomizer) {
                            onOpenCustomizer(item);
                          } else if (onAddToCart) {
                            onAddToCart(item);
                          }
                        }}
                        className="absolute bottom-1 right-1 px-2 py-0.5 rounded-lg bg-[#5B0E14] text-white text-[10px] font-black shadow-md hover:bg-orange-600 active:scale-95 transition"
                      >
                        ADD +
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
