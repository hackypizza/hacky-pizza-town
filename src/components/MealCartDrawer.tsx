'use client';

import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Bike } from 'lucide-react';

interface MealCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items?: any[];
  rawItemsTotal?: number;
  discountAmount?: number;
  onCheckout?: () => void;
}

export default function MealCartDrawer({
  isOpen,
  onClose,
  items = [],
  rawItemsTotal = 0,
  discountAmount = 0,
  onCheckout
}: MealCartDrawerProps) {
  const [billingSettings, setBillingSettings] = useState<any>({
    gstPercent: 5,
    deliveryFee: 30,
    freeDeliveryAbove: 499,
    platformFee: 5,
    packagingFee: 15
  });

  const [userDist, setUserDist] = useState<number>(0);
  const [maxRadius, setMaxRadius] = useState<number>(10);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.settings) setBillingSettings(d.settings);
      })
      .catch(() => {});
  }, [isOpen]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dist = Number(localStorage.getItem('hacky_selected_branch_dist') || 0);
      const radius = Number(localStorage.getItem('hacky_selected_branch_radius') || 10);
      setUserDist(dist);
      setMaxRadius(radius);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Dynamic Calculation
  const subtotal = rawItemsTotal;
  const applicableDeliveryFee = subtotal >= Number(billingSettings.freeDeliveryAbove) ? 0 : Number(billingSettings.deliveryFee);
  const calculatedGst = Math.round((subtotal * Number(billingSettings.gstPercent)) / 100);
  const platformCharge = Number(billingSettings.platformFee);
  const packagingCharge = Number(billingSettings.packagingFee);

  const grandFinalTotal = Math.max(0, subtotal - discountAmount + applicableDeliveryFee + calculatedGst + platformCharge + packagingCharge);

  // Check delivery radius breach
  const isOutOfDeliveryRadius = userDist > 0 && maxRadius > 0 && userDist > maxRadius;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        <div className="bg-[#502314] px-4 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bike className="h-5 w-5 text-[#EA580C]" />
            <h3 className="text-sm font-black uppercase tracking-wider">Your Meal Order</h3>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-white cursor-pointer p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-16">
              <ShoppingBag className="h-12 w-12 text-gray-300 mb-2 stroke-[1.5]" />
              <p className="text-sm font-bold text-[#502314]">Your cart is empty.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((it: any, idx: number) => (
                <div key={it.id || idx} className="flex justify-between items-center py-2 border-b text-xs">
                  <div>
                    <span className="font-bold text-[#502314]">{it.name}</span>
                    <span className="text-gray-400 block text-[11px]">Qty: {it.quantity || 1}</span>
                  </div>
                  <span className="font-bold">₹{(it.price || 0) * (it.quantity || 1)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Bill JSX */}
          <div className="bg-white p-3.5 rounded-2xl border border-gray-200 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Item Subtotal</span>
              <span className="font-bold">₹{subtotal}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600 font-bold">
                <span>Promo Discount</span>
                <span>-₹{discountAmount}</span>
              </div>
            )}

            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span>{applicableDeliveryFee === 0 ? <span className="text-green-600 font-bold">FREE</span> : `₹${applicableDeliveryFee}`}</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>Restaurant Packaging Fee</span>
              <span className="font-bold">₹{packagingCharge}</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>Platform Fee</span>
              <span className="font-bold">₹{platformCharge}</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>GST & Taxes ({billingSettings.gstPercent}%)</span>
              <span className="font-bold">₹{calculatedGst}</span>
            </div>

            <div className="border-t pt-2 flex justify-between font-black text-sm text-[#502314]">
              <span>To Pay</span>
              <span className="text-[#EA580C]">₹{grandFinalTotal}</span>
            </div>

            {isOutOfDeliveryRadius && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[11px] font-bold">
                ⚠️ Aapki location is store ke delivery radius ({maxRadius} km) se bahar ({userDist} km) hai. Kripya doosri branch chunein.
              </div>
            )}
          </div>
        </div>

        {onCheckout && items.length > 0 && (
          <div className="p-4 border-t bg-gray-50">
            <button
              onClick={onCheckout}
              className="w-full rounded-full bg-[#D62300] py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg active:scale-95 hover:bg-[#b01e00] transition cursor-pointer"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
