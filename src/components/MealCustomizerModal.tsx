import React, { useState, useEffect } from 'react';

const DEFAULT_SIDES = [
  { id: 'side_reg', type: 'SIDE', name: 'Regular Fry', price: 0, image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=200' },
  { id: 'side_peri', type: 'SIDE', name: 'Med Peri Peri Fries', price: 30, image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=200' },
  { id: 'side_saucy', type: 'SIDE', name: 'Saucy Fries', price: 40, image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=200' }
];

const DEFAULT_BEVERAGES = [
  { id: 'bev_coke', type: 'BEVERAGE', name: 'Coca Cola Small', price: 0, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200' },
  { id: 'bev_coffee', type: 'BEVERAGE', name: 'Classic Cold Coffee', price: 79, image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=200' },
  { id: 'bev_shake', type: 'BEVERAGE', name: 'Chocolate Thick Shake', price: 79, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=200' }
];

export default function MealCustomizerModal({ item, onClose, onCompleteToCart }: any) {
  const [step, setStep] = useState<1 | 2>(1); // 1 = Customise Meal, 2 = Choose Side & Beverage
  const [allAddons, setAllAddons] = useState<any[]>([...DEFAULT_SIDES, ...DEFAULT_BEVERAGES]);
  
  // Step 1 States
  const [addCheese, setAddCheese] = useState(false);
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([]);
  
  // Step 2 States (Sides & Beverages matching images)
  const [selectedSide, setSelectedSide] = useState<any>(DEFAULT_SIDES[0]);
  const [selectedBeverage, setSelectedBeverage] = useState<any>(DEFAULT_BEVERAGES[0]);

  const ingredients = ['No Lettuce', 'No Tomato', 'No Onion', 'No Pickle'];

  useEffect(() => {
    const loadSidesData = async () => {
      try {
        const res = await fetch('/api?action=GET_MEAL_ADDONS&ts=' + Date.now());
        const data = await res.json();
        if (data.success && Array.isArray(data.addons) && data.addons.length > 0) {
          setAllAddons(data.addons);
          const defaultSide = data.addons.find((a: any) => a.type === 'SIDE' && a.isDefault) || data.addons.find((a: any) => a.type === 'SIDE');
          const defaultBev = data.addons.find((a: any) => a.type === 'BEVERAGE' && a.isDefault) || data.addons.find((a: any) => a.type === 'BEVERAGE');
          if (defaultSide) setSelectedSide(defaultSide);
          if (defaultBev) setSelectedBeverage(defaultBev);
        } else {
          setAllAddons([...DEFAULT_SIDES, ...DEFAULT_BEVERAGES]);
        }
      } catch {
        setAllAddons([...DEFAULT_SIDES, ...DEFAULT_BEVERAGES]);
      }
    };
    loadSidesData();
  }, []);

  // Ensure the rendered list always has items:
  const activeSides = allAddons.filter(a => a.type === 'SIDE').length > 0 
    ? allAddons.filter(a => a.type === 'SIDE') 
    : DEFAULT_SIDES;

  const activeBeverages = allAddons.filter(a => a.type === 'BEVERAGE').length > 0 
    ? allAddons.filter(a => a.type === 'BEVERAGE') 
    : DEFAULT_BEVERAGES;

  const basePrice = Number(item?.price || 179);
  const cheesePrice = addCheese ? 22 : 0;
  const sideExtra = Number(selectedSide?.price || 0);
  const bevExtra = Number(selectedBeverage?.price || 0);
  const currentTotal = basePrice + cheesePrice + (step === 2 ? (sideExtra + bevExtra) : 0);
  const originalStrikedTotal = Math.round(currentTotal * 1.38);

  const toggleIngredient = (ing: string) => {
    setRemovedIngredients(prev =>
      prev.includes(ing) ? prev.filter(x => x !== ing) : [...prev, ing]
    );
  };

  const handleFinishAndCheckout = () => {
    onCompleteToCart({
      ...item,
      cartItemId: `${item?.id || 'meal'}_${Date.now()}`,
      customized: true,
      addCheese,
      removedIngredients,
      selectedSide: step === 2 ? selectedSide : null,
      selectedBeverage: step === 2 ? selectedBeverage : null,
      singlePrice: currentTotal,
      price: currentTotal
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-end justify-center p-0 animate-fade-in">
      <div className="bg-[#FBF6EE] w-full max-w-md rounded-t-[32px] overflow-hidden flex flex-col max-h-[92vh] shadow-2xl relative">
        
        {/* HEADER */}
        <div className="bg-[#5B0E14] text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => step === 2 ? setStep(1) : onClose()} 
              className="text-amber-400 text-lg font-black"
            >
              ←
            </button>
            <span className="text-xl">🍕</span>
            <h2 className="text-xs font-black tracking-wider uppercase text-white">
              {step === 1 ? 'CUSTOMISE YOUR MEAL' : 'CHOOSE YOUR SIDES'}
            </h2>
          </div>
          {step === 2 ? (
            <button 
              type="button"
              onClick={handleFinishAndCheckout}
              className="text-xs font-black text-amber-300 hover:text-white uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full cursor-pointer"
            >
              SKIP &gt;
            </button>
          ) : (
            <button 
              type="button" 
              onClick={onClose} 
              className="text-xs font-black text-amber-200 uppercase cursor-pointer hover:text-white"
            >
              CANCEL
            </button>
          )}
        </div>

        {/* BODY */}
        <div className="p-4 overflow-y-auto space-y-6 pb-28 flex-1">
          {step === 1 ? (
            /* STEP 1: ADDONS & INGREDIENTS */
            <div className="space-y-5">
              <div>
                <p className="text-[11px] font-black uppercase text-gray-500 mb-2">EXTRA ADD-ONS</p>
                <div className="bg-white p-3.5 rounded-2xl border border-gray-200 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🧀</span>
                    <div>
                      <h4 className="text-xs font-black text-[#5B0E14]">Add Cheese</h4>
                      <span className="text-xs font-black text-orange-600">₹ 22/-</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAddCheese(!addCheese)}
                    className={`px-4 py-1.5 rounded-full text-xs font-black uppercase transition-all cursor-pointer ${
                      addCheese ? 'bg-orange-600 text-white' : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                  >
                    {addCheese ? 'ADDED ✓' : '+ ADD'}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-black text-[#5B0E14] mb-1">
                  Customise Your Burger / Pizza <span className="text-gray-400 font-medium">(Tap to remove ingredients)</span>
                </p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {ingredients.map(ing => {
                    const isRemoved = removedIngredients.includes(ing);
                    return (
                      <button
                        key={ing}
                        type="button"
                        onClick={() => toggleIngredient(ing)}
                        className={`py-2 px-3 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                          isRemoved 
                            ? 'border-red-400 bg-red-50 text-red-500 line-through' 
                            : 'border-gray-200 bg-white text-[#5B0E14]'
                        }`}
                      >
                        {ing}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* STEP 2: SIDES & BEVERAGES (3-Column Layout from Image) */
            <div className="space-y-6">
              {/* CHOOSE YOUR SIDE */}
              <div>
                <h3 className="text-xs font-black text-[#5B0E14] mb-2.5">Choose Your Side</h3>
                <div className="grid grid-cols-3 gap-2.5">
                  {activeSides.map(s => {
                    const isSelected = selectedSide?.id === s.id;
                    return (
                      <div
                        key={s.id}
                        onClick={() => setSelectedSide(s)}
                        className={`p-2 rounded-2xl border-2 flex flex-col items-center text-center cursor-pointer transition-all ${
                          isSelected ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-400' : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="w-14 h-14 rounded-xl overflow-hidden mb-1.5 bg-gray-100 flex items-center justify-center">
                          <img 
                            src={s.image} 
                            alt={s.name} 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=200');
                            }}
                          />
                        </div>
                        <h4 className="text-[11px] font-black text-[#5B0E14] leading-tight line-clamp-2">{s.name}</h4>
                        {s.price > 0 && <span className="text-[10px] font-black text-orange-600 mt-0.5">+ ₹{s.price}/-</span>}
                        <div className={`w-4 h-4 rounded-full border-2 mt-2 flex items-center justify-center ${isSelected ? 'border-orange-600' : 'border-gray-300'}`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-orange-600" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CHOOSE YOUR BEVERAGE */}
              <div>
                <h3 className="text-xs font-black text-[#5B0E14] mb-2.5">Choose Your Beverage</h3>
                <div className="grid grid-cols-3 gap-2.5">
                  {activeBeverages.map(b => {
                    const isSelected = selectedBeverage?.id === b.id;
                    return (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBeverage(b)}
                        className={`p-2 rounded-2xl border-2 flex flex-col items-center text-center cursor-pointer transition-all ${
                          isSelected ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-400' : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="w-14 h-14 rounded-xl overflow-hidden mb-1.5 bg-gray-100 flex items-center justify-center">
                          <img 
                            src={b.image} 
                            alt={b.name} 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200');
                            }}
                          />
                        </div>
                        <h4 className="text-[11px] font-black text-[#5B0E14] leading-tight line-clamp-2">{b.name}</h4>
                        {b.price > 0 && <span className="text-[10px] font-black text-orange-600 mt-0.5">+ ₹{b.price}/-</span>}
                        <div className={`w-4 h-4 rounded-full border-2 mt-2 flex items-center justify-center ${isSelected ? 'border-orange-600' : 'border-gray-300'}`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-orange-600" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM FIXED BAR */}
        <div className="sticky bottom-0 left-0 right-0 w-full bg-[#FBF6EE] border-t border-gray-200 px-5 py-3 flex items-center justify-between shadow-2xl z-50">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-[#5B0E14]">₹ {currentTotal} /-</span>
              <span className="text-xs text-red-500 line-through">₹ {originalStrikedTotal}</span>
            </div>
            <span className="text-[9px] text-gray-500 uppercase font-bold block">Price Before Tax</span>
          </div>

          {step === 1 ? (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="bg-[#EA580C] hover:bg-[#C2410C] text-white px-6 py-2.5 rounded-full font-black text-xs shadow-md uppercase tracking-wide flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
            >
              Choose Sides &gt;
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishAndCheckout}
              className="bg-[#EA580C] hover:bg-[#C2410C] text-white px-6 py-2.5 rounded-full font-black text-xs shadow-md uppercase tracking-wide cursor-pointer active:scale-95 transition-all"
            >
              Add To Cart
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
