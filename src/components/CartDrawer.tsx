import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, Tag, ArrowRight, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react';
import { CartItem, Coupon } from '../types';
import { VegIndicator } from './VegIndicator';
import { FoodVisual } from './FoodVisual';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (cartItemId: string, change: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  appliedCoupon: Coupon | null;
  onApplyCoupon: (coupon: Coupon) => void;
  onRemoveCoupon: () => void;
  availableCoupons: Coupon[];
  isWalletRedeemed?: boolean;
  onToggleWalletRedeem?: () => void;
  walletBalance?: number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  availableCoupons,
  isWalletRedeemed = false,
  onToggleWalletRedeem,
  walletBalance = 0,
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [billingSettings, setBillingSettings] = useState({
    gstPercent: 5,
    deliveryFee: 30,
    freeDeliveryAbove: 499,
    platformFee: 5,
    packagingFee: 15
  });
  const [branchDist, setBranchDist] = useState<number>(0);
  const [branchMaxRadius, setBranchMaxRadius] = useState<number>(10);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const d = Number(localStorage.getItem('hacky_selected_branch_dist') || 0);
      const r = Number(localStorage.getItem('hacky_selected_branch_radius') || 10);
      setBranchDist(d);
      setBranchMaxRadius(r);
    }
    fetch('/api/settings')
      .then((res) => res.json())
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
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate bill totals
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const FREE_DELIVERY_THRESHOLD = billingSettings.freeDeliveryAbove || 499;
  const isFreeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD;
  const deliveryFee = subtotal === 0 ? 0 : isFreeDelivery ? 0 : (billingSettings.deliveryFee || 30);
  const packagingFee = subtotal === 0 ? 0 : (billingSettings.packagingFee || 15);
  const platformFee = subtotal === 0 ? 0 : (billingSettings.platformFee || 5);

  // Calculate discount
  let discount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minOrder) {
    const calculated = (subtotal * appliedCoupon.discountPercent) / 100;
    discount = Math.min(calculated, appliedCoupon.maxDiscount);
  }

  // Wallet deduction
  const walletDiscount = isWalletRedeemed ? Math.min(walletBalance, Math.max(0, subtotal - discount)) : 0;

  // Taxes
  const taxableAmount = Math.max(0, subtotal - discount - walletDiscount + packagingFee);
  const taxes = Math.round(taxableAmount * ((billingSettings.gstPercent || 5) / 100));

  // Grand Total
  const grandTotal = Math.max(0, subtotal - discount - walletDiscount + deliveryFee + packagingFee + platformFee + taxes);
  const isOutOfDeliveryRadius = branchDist > 0 && branchMaxRadius > 0 && branchDist > branchMaxRadius;

  const handleApplyCouponCode = async (codeToApply: string) => {
    const code = (codeToApply || couponInput || '').trim().toUpperCase();
    if (!code) return;

    setIsApplyingCoupon(true);
    setCouponError(null);

    try {
      let res = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'VALIDATE_COUPON',
          code: code,
          cartTotal: subtotal,
          items: cart,
        }),
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch('/api/affiliate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'VALIDATE_COUPON',
            code: code,
            cartTotal: subtotal,
            items: cart,
          }),
        });
      }

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Server response unreadable. Please try again.');
      }

      if (data.success) {
        onApplyCoupon({
          code: data.couponCode,
          discountPercent: 100,
          maxDiscount: Number(data.discountAmount) || 0,
          minOrder: 0,
          description: data.message || `₹${data.discountAmount} off`,
        });
        setCouponInput('');
      } else {
        const found = availableCoupons.find(
          (c) => c.code.toLowerCase() === code.toLowerCase()
        );
        if (found) {
          if (subtotal < found.minOrder) {
            setCouponError(`Minimum order of ₹${found.minOrder} required for ${found.code}`);
          } else {
            onApplyCoupon(found);
            setCouponInput('');
          }
        } else {
          setCouponError(data.message || 'Coupon apply nahi ho saka.');
        }
      }
    } catch (err: any) {
      const found = availableCoupons.find(
        (c) => c.code.toLowerCase() === code.toLowerCase()
      );
      if (found) {
        if (subtotal < found.minOrder) {
          setCouponError(`Minimum order of ₹${found.minOrder} required for ${found.code}`);
        } else {
          onApplyCoupon(found);
          setCouponInput('');
        }
      } else {
        setCouponError(err.message || 'Coupon apply nahi ho saka.');
      }
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Drawer Panel */}
      <aside className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-[#fffaf0] shadow-2xl flex flex-col justify-between border-l border-[#ecdccb] animate-in slide-in-from-right duration-200">
          
          {/* Drawer Header */}
          <div className="px-5 py-4 bg-[#502314] text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#ea580c] flex items-center justify-center text-white">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2
                  className="font-extrabold text-lg tracking-tight"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Your Food Cart
                </h2>
                <p className="text-xs text-orange-200">
                  {cart.length === 0 ? 'Empty' : `${cart.reduce((s, i) => s + i.quantity, 0)} item(s) from Mahmudabad`}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-orange-100 flex items-center justify-center text-4xl shadow-inner">
                  🍕
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-[#502314]">Your Cart is Empty</h3>
                  <p className="text-xs text-[#8c6759] max-w-xs mx-auto">
                    Good food is always just a few taps away! Add your favorite wood-fired pizzas to get started.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  Explore Menu
                </button>
              </div>
            ) : (
              <>
                {/* Out of Delivery Radius Alert */}
                {isOutOfDeliveryRadius && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-start gap-2 shadow-xs">
                    <span className="text-base shrink-0">⚠️</span>
                    <div>
                      <span className="font-black uppercase tracking-wider text-[11px] block text-red-900">
                        Delivery Radius Notice ({branchDist.toFixed(1)} km)
                      </span>
                      <span className="leading-relaxed">
                        Aap selected outlet se <strong>{branchDist.toFixed(1)} km</strong> door hain (Standard limit: <strong>{branchMaxRadius} km</strong>). Delivery time zyada lag sakta hai.
                      </span>
                    </div>
                  </div>
                )}

                {/* Free Delivery Progress Bar */}
                <div className="p-3 bg-white rounded-xl border border-[#ede3d7] shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#502314]">
                      {isFreeDelivery ? '🎉 You unlocked FREE Delivery!' : `Add ₹${Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal)} more for FREE Delivery`}
                    </span>
                    <span className="text-[11px] font-bold text-[#ea580c]">
                      {isFreeDelivery ? 'FREE' : `₹${billingSettings.deliveryFee || 30}`}
                    </span>
                  </div>
                  <div className="w-full bg-[#f3e7da] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#ea580c] h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Cart Items List */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#8c6759]">
                    Ordered Items ({cart.length})
                  </h3>

                  <div className="divide-y divide-[#f2e6d9] bg-white rounded-2xl border border-[#ede3d7] p-2 shadow-xs">
                    {cart.map((item) => (
                      <div key={item.id} className="py-3 px-2 flex items-center justify-between gap-3">
                        {/* Mini visual thumbnail */}
                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-[#f0e4d5]">
                          <FoodVisual type={item.visualType} />
                        </div>

                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <VegIndicator isVeg={item.isVeg} />
                            <h4 className="font-bold text-xs sm:text-sm text-[#321207] truncate">
                              {item.name}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-[#8c6759] mt-0.5">
                            {item.selectedSize && (
                              <span className="font-semibold text-[#ea580c] bg-orange-50 px-1.5 py-0.2 rounded-xs">
                                {item.selectedSize}
                              </span>
                            )}
                            <span className="tabular-nums">₹{item.price} each</span>
                          </div>
                        </div>

                        {/* Quantity Controls & Line Total */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1 bg-[#f7efe6] rounded-lg p-0.5 border border-[#e8d8c7]">
                            <button
                              onClick={() => {
                                if (item.quantity === 1) {
                                  onRemoveItem(item.id);
                                } else {
                                  onUpdateQuantity(item.id, -1);
                                }
                              }}
                              className="w-6 h-6 flex items-center justify-center rounded-md bg-white hover:bg-red-50 text-[#502314] hover:text-red-600 transition-colors cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              {item.quantity === 1 ? (
                                <Trash2 className="w-3 h-3 text-red-500" />
                              ) : (
                                <Minus className="w-3 h-3" />
                              )}
                            </button>
                            <span className="w-5 text-center font-bold text-xs tabular-nums text-[#502314]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, 1)}
                              className="w-6 h-6 flex items-center justify-center rounded-md bg-[#ea580c] hover:bg-[#c2410c] text-white transition-colors cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="text-xs sm:text-sm font-extrabold text-[#321207] tabular-nums min-w-[50px] text-right">
                            ₹{item.price * item.quantity}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hacky Wallet Balance Box */}
                {walletBalance > 0 && onToggleWalletRedeem && (
                  <div className="bg-white p-3.5 rounded-2xl border border-[#ede3d7] flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                        👑
                      </div>
                      <div>
                        <div className="text-xs font-black text-[#502314] uppercase">
                          Hacky Wallet (₹{walletBalance})
                        </div>
                        <div className="text-[11px] text-[#8c6759]">
                          {isWalletRedeemed ? '₹50 applied to this order' : 'Use welcome cashback'}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={onToggleWalletRedeem}
                      className={`px-3 py-1.5 rounded-full text-xs font-black uppercase transition-all cursor-pointer ${
                        isWalletRedeemed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#ea580c] text-white hover:bg-[#c2410c]'
                      }`}
                    >
                      {isWalletRedeemed ? 'Applied ✓' : 'Use ₹50'}
                    </button>
                  </div>
                )}

                {/* Coupon Code Section */}
                <div className="bg-white p-3.5 rounded-2xl border border-[#ede3d7] space-y-2.5 shadow-xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#502314]">
                    <Tag className="w-3.5 h-3.5 text-[#ea580c]" />
                    <span>Apply Coupon & Save</span>
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <div>
                          <p className="text-xs font-bold text-emerald-800">
                            '{appliedCoupon.code}' Applied!
                          </p>
                          <p className="text-[11px] text-emerald-600">
                            You saved ₹{discount} on this order
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={onRemoveCoupon}
                        className="text-xs font-bold text-red-600 hover:text-red-700 underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter coupon (e.g. HACKY50)"
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value.toUpperCase());
                            setCouponError(null);
                          }}
                          className="flex-1 px-3 py-1.5 text-xs uppercase bg-[#faf4ec] border border-[#e2d2c1] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#ea580c]"
                        />
                        <button
                          type="button"
                          onClick={() => handleApplyCouponCode(couponInput)}
                          className="px-3.5 py-1.5 bg-[#502314] hover:bg-[#3b170c] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>

                      {couponError && (
                        <p className="text-[11px] text-red-600 font-semibold">{couponError}</p>
                      )}

                      {/* Quick Available Coupons Chips */}
                      <div className="flex items-center gap-2 pt-1 overflow-x-auto no-scrollbar">
                        {availableCoupons.map((coupon) => (
                          <button
                            key={coupon.code}
                            type="button"
                            onClick={() => handleApplyCouponCode(coupon.code)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#fff8eb] border border-[#fde68a] text-[11px] font-bold text-[#b45309] hover:bg-[#fef3c7] transition-colors cursor-pointer shrink-0"
                          >
                            <span>{coupon.code}</span>
                            <span className="text-[10px] text-[#92400e]/80">({coupon.discountPercent}% off)</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bill Breakdown */}
                <div className="bg-white p-4 rounded-2xl border border-[#ede3d7] space-y-2.5 shadow-xs text-xs text-[#502314]">
                  <h4 className="font-bold uppercase tracking-wider text-[11px] text-[#8c6759] border-b border-[#f4e7da] pb-1.5">
                    Bill Details
                  </h4>

                  <div className="flex justify-between items-center text-[#71594f]">
                    <span>Item Total</span>
                    <span className="tabular-nums font-semibold text-[#321207]">₹{subtotal}</span>
                  </div>

                  <div className="flex justify-between items-center text-[#71594f]">
                    <span>Delivery Partner Fee</span>
                    <span className="tabular-nums font-semibold">
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-600 font-bold">FREE</span>
                      ) : (
                        `₹${deliveryFee}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[#71594f]">
                    <span>Restaurant Packaging Fee</span>
                    <span className="tabular-nums font-semibold text-[#321207]">₹{packagingFee}</span>
                  </div>

                  <div className="flex justify-between items-center text-[#71594f]">
                    <span>Platform Convenience Fee</span>
                    <span className="tabular-nums font-semibold text-[#321207]">₹{platformFee}</span>
                  </div>

                  <div className="flex justify-between items-center text-[#71594f]">
                    <span>Govt. Taxes & GST ({billingSettings.gstPercent}%)</span>
                    <span className="tabular-nums font-semibold text-[#321207]">₹{taxes}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between items-center text-emerald-600 font-semibold">
                      <span>Coupon Discount</span>
                      <span className="tabular-nums font-bold">-₹{discount}</span>
                    </div>
                  )}

                  {walletDiscount > 0 && (
                    <div className="flex justify-between items-center text-amber-700 font-semibold">
                      <span>Hacky Wallet Cashback</span>
                      <span className="tabular-nums font-bold">-₹{walletDiscount}</span>
                    </div>
                  )}

                  <div className="border-t border-[#f4e7da] pt-2.5 flex justify-between items-center font-extrabold text-sm sm:text-base text-[#321207]">
                    <div>
                      <span>To Pay</span>
                      <div className="text-[10px] font-medium text-[#8c6759]">Inclusive of all charges</div>
                    </div>
                    <span className="tabular-nums text-lg font-black text-[#502314]">
                      ₹{grandTotal}
                    </span>
                  </div>
                </div>

                {/* Trust marker */}
                <div className="flex items-center gap-2 p-2.5 bg-[#fbf5ed] rounded-xl border border-[#eddcd0] text-[11px] text-[#71594f]">
                  <ShieldCheck className="w-4 h-4 text-[#ea580c] shrink-0" />
                  <span>100% Contactless Safe Delivery from Mahmudabad Kitchen</span>
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer CTA */}
          {cart.length > 0 && (
            <div className="p-4 bg-white border-t border-[#ede3d7] shadow-lg space-y-2">
              <button
                onClick={onProceedToCheckout}
                className="w-full flex items-center justify-between px-5 py-3.5 bg-[#ea580c] hover:bg-[#c2410c] active:scale-98 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-md transition-all cursor-pointer group"
              >
                <div className="text-left">
                  <div className="text-xs uppercase font-medium text-white/80">Total Amount</div>
                  <div className="text-lg font-black tabular-nums">₹{grandTotal}</div>
                </div>
                <div className="flex items-center gap-2 text-white font-black uppercase tracking-wide">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
