import React, { useState } from 'react';

interface CustomiseMealProps {
  item: any;
  onClose: () => void;
  onAddToCart: (customizedItem: any) => void;
}

export default function CustomiseMealModal({ item, onClose, onAddToCart }: CustomiseMealProps) {
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [excludedIngredients, setExcludedIngredients] = useState<string[]>([]);
  const [selectedSide, setSelectedSide] = useState<string>('none');
  const [quantity, setQuantity] = useState<number>(1);

  // Customization add-ons matching exact image specs
  const addons = [
    { id: 'extra_cheese', name: 'Extra Cheese', desc: 'Slice & Drizzle', price: 22, icon: '🧀' },
    { id: 'garlic_dip', name: 'Garlic Herb Dip', desc: 'Creamy Dip', price: 25, icon: '🧄' },
    { id: 'peri_dip', name: 'Peri Peri Dip', desc: 'Fiery Mayo', price: 25, icon: '🌶️' }
  ];

  const defaultIngredients = ['With Onion', 'With Capsicum', 'With Tomato', 'With Mushroom'];

  const sidesList = [
    { id: 'none', name: 'None', icon: '🚫', price: 0 },
    { id: 'coke', name: 'Coca Cola...', icon: '🥤', price: 40 }
  ];

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleIngredient = (name: string) => {
    setExcludedIngredients(prev =>
      prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]
    );
  };

  // Base price calculation
  const basePrice = Number(item?.price || 349);
  const addonsTotal = selectedAddons.reduce((acc, id) => {
    const found = addons.find(a => a.id === id);
    return acc + (found ? found.price : 0);
  }, 0);
  const sideTotal = sidesList.find(s => s.id === selectedSide)?.price || 0;
  const singleItemTotal = basePrice + addonsTotal + sideTotal;
  const grandTotal = singleItemTotal * quantity;
  const originalStrikedTotal = Math.round(grandTotal * 1.35);

  const handleAddToCart = () => {
    onAddToCart({
      ...item,
      cartItemId: `${item?.id || 'pizza'}_custom_${Date.now()}`,
      customized: true,
      selectedAddons,
      excludedIngredients,
      selectedSide,
      singlePrice: singleItemTotal,
      price: grandTotal,
      quantity: quantity
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-end justify-center p-0 animate-fade-in">
      <div className="bg-[#FFFDF9] w-full max-w-md rounded-t-[32px] border-t-2 border-[#5B0E14] overflow-hidden flex flex-col max-h-[92vh] shadow-2xl relative">
        
        {/* HEADER BAR (Matching Reference) */}
        <div className="bg-[#502314] text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-amber-400 text-lg font-black leading-none">←</button>
            <span className="text-xl">🍕</span>
            <div>
              <p className="text-[10px] uppercase font-black tracking-wider text-[#EA580C]">HAVE IT YOUR WAY</p>
              <h2 className="text-sm font-black tracking-wide text-white">CUSTOMISE YOUR MEAL</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-[11px] font-black text-amber-200 hover:text-white uppercase tracking-wider">
            CLOSE &times;
          </button>
        </div>

        {/* SCROLLABLE CUSTOMISATION BODY */}
        <div className="p-4 overflow-y-auto space-y-6 text-[#502314] pb-28">

          {/* 3. EXTRA ADD-ONS (OPTIONAL) */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-black text-[#EA580C] flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#EA580C] text-white text-[10px] flex items-center justify-center font-bold">3</span>
              EXTRA ADD-ONS (OPTIONAL)
            </h3>
            <div className="space-y-2">
              {addons.map(addon => {
                const isChecked = selectedAddons.includes(addon.id);
                return (
                  <div
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      isChecked
                        ? 'border-orange-500 bg-orange-50/60 shadow-xs'
                        : 'border-[#502314]/15 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{addon.icon}</span>
                      <div>
                        <h4 className="text-xs font-black text-[#502314]">{addon.name}</h4>
                        <p className="text-[10px] text-gray-500 font-medium">{addon.desc}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-[#EA580C]">+{'\u20B9'}{addon.price}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. CUSTOMISE INGREDIENTS */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black text-[#EA580C] flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-[#EA580C] text-white text-[10px] flex items-center justify-center font-bold">4</span>
                CUSTOMISE INGREDIENTS
              </h3>
              <span className="text-[11px] text-gray-500 font-bold">Tap to Exclude</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {defaultIngredients.map(ing => {
                const isExcluded = excludedIngredients.includes(ing);
                return (
                  <button
                    key={ing}
                    type="button"
                    onClick={() => toggleIngredient(ing)}
                    className={`py-2 px-3 rounded-full border text-[11px] font-bold text-center transition-all ${
                      isExcluded
                        ? 'border-red-400 bg-red-50 text-red-500 line-through opacity-70'
                        : 'border-[#502314]/20 bg-white text-[#502314]'
                    }`}
                  >
                    {isExcluded ? '✕ ' : '✓ '} {ing}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. PAIR WITH BEVERAGES & SIDES */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-black text-[#EA580C] flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#EA580C] text-white text-[10px] flex items-center justify-center font-bold">5</span>
              PAIR WITH BEVERAGES & SIDES
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {sidesList.map(side => {
                const isSelected = selectedSide === side.id;
                return (
                  <div
                    key={side.id}
                    onClick={() => setSelectedSide(side.id)}
                    className={`p-3 rounded-2xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/70 ring-1 ring-orange-400'
                        : 'border-[#502314]/15 bg-white'
                    }`}
                  >
                    <span className="text-2xl">{side.icon}</span>
                    <div>
                      <span className="text-xs font-black text-[#502314] block">{side.name}</span>
                      {side.price > 0 && (
                        <span className="text-[10px] font-black text-[#EA580C]">+{'\u20B9'}{side.price}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* BOTTOM FIXED BAR (Exact matching UI) */}
        <div className="sticky bottom-0 left-0 right-0 w-full bg-white border-t border-gray-200 px-5 py-3.5 flex items-center justify-between gap-4 shadow-2xl z-50">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-[#EA580C]">{'\u20B9'}{grandTotal}</span>
              <span className="text-xs text-gray-400 line-through">{'\u20B9'}{originalStrikedTotal}</span>
            </div>
            <span className="text-[9px] font-black tracking-wider text-gray-500 uppercase block">PRICE BEFORE TAX</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quantity Stepper */}
            <div className="flex items-center border border-gray-300 rounded-full px-3 py-1 gap-3.5 bg-gray-50">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="text-base font-black text-gray-600 hover:text-orange-600"
              >-</button>
              <span className="text-xs font-black text-[#502314]">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="text-base font-black text-gray-600 hover:text-orange-600"
              >+</button>
            </div>

            {/* Solid Rounded CTA */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="bg-[#EA580C] hover:bg-[#C2410C] text-white px-5 py-3 rounded-2xl font-black text-xs shadow-md uppercase tracking-wider flex items-center gap-1 active:scale-95 transition-all"
            >
              ADD TO CART &gt;
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
