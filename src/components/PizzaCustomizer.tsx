import React, { useState, useEffect } from 'react';

export default function PizzaCustomizer({ product, isOpen, onClose, onAddToCart }: any) {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [selectedSize, setSelectedSize] = useState('Regular');
  const [selectedCrust, setSelectedCrust] = useState('Classic Hand Tossed');
  const [globalBeverages, setGlobalBeverages] = useState<any[]>([]);
  const [selectedBeverage, setSelectedBeverage] = useState<any | null>(null);
  const [dessertItems, setDessertItems] = useState<any[]>([]);
  const [selectedDessert, setSelectedDessert] = useState<any | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setSelectedBeverage(null);
      setSelectedDessert(null);
      return;
    }

    // Load Beverage Pairings
    fetch('/api/beverages')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.beverages)) {
          setGlobalBeverages(data.beverages);
        }
      })
      .catch(() => {});

    // Load Desserts with smart fallback
    fetch('/api/menu')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.items)) {
          const desserts = data.items.filter(
            (it: any) => it.isDessert || it.categoryName?.toLowerCase().includes('dessert') || it.categoryName?.toLowerCase().includes('cake')
          );
          if (desserts.length > 0) {
            setDessertItems(desserts);
          } else {
            setDessertItems([
              {
                id: 'des_1',
                name: 'Choco Lava Cake',
                price: 99,
                basePrice: 99,
                imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&auto=format&fit=crop&q=80'
              },
              {
                id: 'des_2',
                name: 'Red Velvet Lava Cake',
                price: 119,
                basePrice: 119,
                imageUrl: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=300&auto=format&fit=crop&q=80'
              }
            ]);
          }
        } else {
          setDessertItems([
            {
              id: 'des_1',
              name: 'Choco Lava Cake',
              price: 99,
              basePrice: 99,
              imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&auto=format&fit=crop&q=80'
            },
            {
              id: 'des_2',
              name: 'Red Velvet Lava Cake',
              price: 119,
              basePrice: 119,
              imageUrl: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=300&auto=format&fit=crop&q=80'
            }
          ]);
        }
      })
      .catch(() => {
        setDessertItems([
          {
            id: 'des_1',
            name: 'Choco Lava Cake',
            price: 99,
            basePrice: 99,
            imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&auto=format&fit=crop&q=80'
          },
          {
            id: 'des_2',
            name: 'Red Velvet Lava Cake',
            price: 119,
            basePrice: 119,
            imageUrl: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=300&auto=format&fit=crop&q=80'
          }
        ]);
      });
  }, [isOpen]);

  if (!isOpen || !product) return null;

  // Filter out self-beverage
  const eligibleBeverages = globalBeverages.filter(
    bev => (bev.name || '').toLowerCase().trim() !== (product.name || '').toLowerCase().trim()
  );

  const sizeExtra = selectedSize === 'Medium' ? 150 : selectedSize === 'Large' ? 280 : 0;
  const crustExtra = selectedCrust === 'Cheese Burst' ? 99 : 0;
  const beverageExtra = selectedBeverage ? Number(selectedBeverage.price || 0) : 0;
  const dessertExtra = selectedDessert ? Number(selectedDessert.price || selectedDessert.basePrice || 0) : 0;

  const totalBill = Number(product.price || product.basePrice || 0) + sizeExtra + crustExtra + beverageExtra + dessertExtra;

  // Final submission handler
  const handleFinalSubmit = (skipDessert: boolean = false) => {
    const finalDessert = skipDessert ? null : selectedDessert;
    const finalPrice = Number(product.price || product.basePrice || 0) + sizeExtra + crustExtra + beverageExtra + (finalDessert ? dessertExtra : 0);

    const sides: Array<{ id: string; name: string; price: number }> = [];
    if (selectedBeverage) {
      sides.push({
        id: selectedBeverage.id,
        name: selectedBeverage.name,
        price: beverageExtra
      });
    }
    if (finalDessert) {
      sides.push({
        id: finalDessert.id,
        name: finalDessert.name,
        price: dessertExtra
      });
    }

    const finalItem = {
      ...product,
      cartItemId: 'item_' + Date.now(),
      selectedSize,
      sizePrice: sizeExtra,
      selectedCrust,
      crustPrice: crustExtra,
      pairedBeverage: selectedBeverage ? {
        id: selectedBeverage.id,
        name: selectedBeverage.name,
        price: beverageExtra
      } : null,
      pairedDessert: finalDessert ? {
        id: finalDessert.id,
        name: finalDessert.name,
        price: dessertExtra
      } : null,
      attachedSides: sides,
      totalUnitPrice: finalPrice,
      quantity: 1
    };

    onAddToCart(finalItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="relative w-full max-w-lg bg-[#FFFBF2] rounded-t-3xl sm:rounded-3xl shadow-2xl border-t-2 sm:border-2 border-[#502314] max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-[#502314] text-white flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-black text-base">{product.name}</h3>
            <p className="text-[11px] text-orange-200">
              {currentStep === 1 ? 'Step 1: Size, Crust & Drink' : 'Step 2: Add Desserts (Optional)'}
            </p>
          </div>
          <button onClick={onClose} className="text-2xl font-bold leading-none cursor-pointer">&times;</button>
        </div>

        {/* STEP 1: SIZE + CRUST + DRINKS */}
        {currentStep === 1 && (
          <div className="p-4 overflow-y-auto space-y-4 flex-1">
            <div>
              <h4 className="text-xs font-black text-[#502314] uppercase mb-2">1. SELECT SIZE</h4>
              <div className="grid grid-cols-3 gap-2">
                {['Regular', 'Medium', 'Large'].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`py-2 px-3 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      selectedSize === sz ? 'bg-[#502314] text-white border-[#502314] shadow' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {sz} {sz === 'Medium' ? '(+₹150)' : sz === 'Large' ? '(+₹280)' : ''}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black text-[#502314] uppercase mb-2">2. SELECT CRUST</h4>
              <div className="grid grid-cols-2 gap-2">
                {['Classic Hand Tossed', 'Cheese Burst'].map((cr) => (
                  <button
                    key={cr}
                    type="button"
                    onClick={() => setSelectedCrust(cr)}
                    className={`py-2 px-3 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      selectedCrust === cr ? 'bg-[#EA580C] text-white border-[#EA580C] shadow' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {cr} {cr === 'Cheese Burst' ? '(+₹99)' : ''}
                  </button>
                ))}
              </div>
            </div>

            {eligibleBeverages.length > 0 && (
              <div>
                <h4 className="text-xs font-black text-[#502314] uppercase mb-2">3. PAIR WITH BEVERAGES & SIDES</h4>
                <div className="grid grid-cols-2 gap-2">
                  {eligibleBeverages.map((bev) => {
                    const isSelected = selectedBeverage?.id === bev.id;
                    return (
                      <div
                        key={bev.id}
                        onClick={() => setSelectedBeverage(isSelected ? null : bev)}
                        className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                          isSelected ? 'border-[#EA580C] bg-orange-50 ring-2 ring-orange-200' : 'border-gray-200 bg-white hover:border-orange-200'
                        }`}
                      >
                        <img src={bev.imageUrl} alt={bev.name} className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate text-gray-800">{bev.name}</p>
                          <p className="text-[11px] font-black text-[#EA580C]">+₹{bev.price}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: DESSERTS UPSELL (WITH PROMINENT SKIP) */}
        {currentStep === 2 && (
          <div className="p-4 overflow-y-auto space-y-4 flex-1">
            <div className="flex justify-between items-center pb-2 border-b border-orange-200">
              <div>
                <span className="text-xs font-black text-[#502314] block">Want something sweet? (Optional)</span>
                <span className="text-[11px] text-gray-500">Aap isko skip karke direct add kar sakte hain</span>
              </div>
              <button 
                type="button"
                onClick={() => handleFinalSubmit(true)}
                className="text-xs font-black text-[#EA580C] bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200 hover:bg-orange-100 cursor-pointer"
              >
                SKIP DESSERT ✕
              </button>
            </div>

            {dessertItems.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-gray-500 font-bold mb-3">Koi dessert available nahi hai.</p>
                <button 
                  type="button"
                  onClick={() => handleFinalSubmit(true)}
                  className="px-4 py-2 bg-[#EA580C] text-white text-xs font-black rounded-xl cursor-pointer"
                >
                  Skip & Add to Cart
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {dessertItems.map((des) => {
                  const isSelected = selectedDessert?.id === des.id;
                  return (
                    <div
                      key={des.id}
                      onClick={() => setSelectedDessert(isSelected ? null : des)}
                      className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                        isSelected 
                          ? 'border-[#EA580C] bg-orange-50 ring-2 ring-orange-200 shadow-sm' 
                          : 'border-gray-200 bg-white hover:border-orange-300'
                      }`}
                    >
                      <img 
                        src={des.imageUrl || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200'} 
                        alt={des.name} 
                        className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0" 
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">{des.name}</p>
                        <p className="text-xs font-black text-[#EA580C]">+₹{des.price || des.basePrice}</p>
                      </div>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                        isSelected ? 'bg-[#EA580C] text-white' : 'border border-gray-300 text-transparent'
                      }`}>
                        ✓
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* BOTTOM ACTION BAR */}
        <div className="p-4 bg-white border-t border-gray-200 flex justify-between items-center shrink-0">
          <div>
            <span className="text-[11px] font-bold text-gray-400 block">Total</span>
            <span className="text-lg font-black text-[#EA580C]">₹{totalBill}</span>
          </div>

          {currentStep === 1 ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleFinalSubmit(true)}
                className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Direct Add (Skip Dessert)
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-black rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Next: Desserts →
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleFinalSubmit(true)}
                className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Skip Dessert
              </button>
              <button
                type="button"
                onClick={() => handleFinalSubmit(false)}
                className="px-5 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-black rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Confirm & Add to Cart
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
