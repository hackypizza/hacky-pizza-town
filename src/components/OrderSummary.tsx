'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  User as UserIcon, 
  Tag, 
  ChevronRight, 
  Plus, 
  Minus, 
  Trash2, 
  Clock, 
  ShieldAlert,
  Coins, 
  ShoppingBag,
  ArrowRight,
  Navigation,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { CartLineItem, UserProfile } from '../types';
import { createOrderDirectly } from '../lib/neonClient';

interface OrderSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartLineItem[];
  onUpdateQuantity: (cartItemId: string, change: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onReCustomiseItem: (item: CartLineItem) => void;
  user: UserProfile | null;
  onClearCart?: () => void;
  onOrderSuccess: (orderData: any) => void;
  onOpenAuth: () => void;
}

// Cafe Center Coordinates (Hacky Pizza Town, Ramkund Chauraha, Mahmudabad)
const CAFE_LAT = 27.2945;
const CAFE_LNG = 81.1215;
const MAX_DELIVERY_KM = 8; // Max 8 KM radius

// Haversine Distance Formula in Kilometers
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of earth in KM
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

export default function OrderSummary({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onReCustomiseItem,
  user,
  onClearCart,
  onOrderSuccess,
  onOpenAuth,
}: OrderSummaryProps) {
  // Destination state
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('Call before arrival, ring doorbell');
  
  // Geolocation & Distance State
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>({
    lat: 27.2952,
    lng: 81.1228,
  });
  const [detectedDistance, setDetectedDistance] = useState<number>(0.3); // default ~0.3 km
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  // Wallet & Coupons
  const userWallet = Number(user?.walletBalance) || 0;
  const [redeemWallet, setRedeemWallet] = useState(userWallet > 0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscountAmount, setCouponDiscountAmount] = useState<number>(0);
  const [affiliateInfo, setAffiliateInfo] = useState<{ userId: string | null; commission: number }>({
    userId: null,
    commission: 0,
  });
  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [showOffers, setShowOffers] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isPlacingOrder = isSubmitting;
  const setIsPlacingOrder = setIsSubmitting;
  const [authWarning, setAuthWarning] = useState<string | null>(null);

  // Calculate distance whenever coords change
  useEffect(() => {
    if (userCoords) {
      const dist = calculateDistance(CAFE_LAT, CAFE_LNG, userCoords.lat, userCoords.lng);
      setDetectedDistance(dist);
    }
  }, [userCoords]);

  // Sync logged-in user profile details
  useEffect(() => {
    if (user) {
      if (user.name) setCustomerName(user.name);
      if (user.phone) setCustomerPhone(user.phone);
      if (user.address) setDeliveryAddress(user.address);
      setAuthWarning(null);
    }
  }, [user, isOpen]);

  // Initial calculation for default coupon if active
  useEffect(() => {
    if (appliedCoupon === 'BURGERKING50') {
      const sub = cartItems.reduce((acc, item) => acc + item.totalUnitPrice * item.quantity, 0);
      setCouponDiscountAmount(Math.min(50, Math.round(sub * 0.15)));
    }
  }, [cartItems, appliedCoupon]);

  if (!isOpen) return null;

  const isOutOfDeliveryRadius = detectedDistance > MAX_DELIVERY_KM;

  // Calculations
  const subTotal = cartItems.reduce((acc, item) => acc + item.totalUnitPrice * item.quantity, 0);
  const deliveryFee = subTotal > 299 ? 0 : 35;
  const couponDiscount = appliedCoupon ? couponDiscountAmount : 0;
  const walletDiscount = redeemWallet && userWallet > 0 ? Math.min(userWallet, Math.max(0, subTotal - couponDiscount)) : 0;
  const taxableAmount = Math.max(0, subTotal - couponDiscount - walletDiscount);
  const taxes = Math.round(taxableAmount * 0.05); // 5% GST
  const grandTotal = Math.max(0, taxableAmount + deliveryFee + taxes);

  // Apply Coupon Handler
  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) {
      setCouponError('Kripya coupon code dalein.');
      return;
    }

    setIsApplyingCoupon(true);
    setCouponError(null);
    setCouponSuccess(null);
    try {
      let res = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'VALIDATE_COUPON',
          code,
          couponCode: code,
          cartTotal: subTotal,
          subTotal,
          items: cartItems,
          cartItems
        })
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch('/api/affiliate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'VALIDATE_COUPON',
            code,
            couponCode: code,
            cartTotal: subTotal,
            subTotal,
            items: cartItems,
            cartItems
          })
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
        setAppliedCoupon(data.couponCode);
        setCouponDiscountAmount(Number(data.discountAmount) || 0);
        setAffiliateInfo({
          userId: data.affiliateUserId || null,
          commission: data.affiliateCommissionEarned || 0,
        });
        setCouponSuccess(data.message || `Coupon ${data.couponCode} applied! ₹${data.discountAmount} off`);
        setCouponInput('');
        setShowOffers(false);
      } else {
        setCouponError(data.message || data.error || 'Coupon apply nahi ho saka.');
      }
    } catch (e: any) {
      setCouponError(e.message || 'Coupon apply nahi ho saka.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscountAmount(0);
    setAffiliateInfo({ userId: null, commission: 0 });
    setCouponSuccess(null);
    setCouponError(null);
  };

  // Auto Detect Current Location using browser navigator.geolocation
  const handleAutoDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('GPS Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationStatus('Pinpointing your exact GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        const dist = calculateDistance(CAFE_LAT, CAFE_LNG, latitude, longitude);
        setDetectedDistance(dist);
        setIsLocating(false);

        if (dist <= MAX_DELIVERY_KM) {
          setLocationStatus(`📍 GPS Locked! You are ${dist} KM from Ramkund Chauraha.`);
          setDeliveryAddress((prev) => 
            prev.includes('Mahmudabad') 
              ? prev 
              : `Current GPS Location (~${dist} KM from Cafe), Mahmudabad`
          );
        } else {
          setLocationStatus(`⚠️ Location is ${dist} KM away. Exceeds 8 KM delivery limit.`);
        }
      },
      (error) => {
        setIsLocating(false);
        console.warn('Geolocation Error:', error);
        let errorMsg = 'Could not fetch GPS location. Please check browser permissions.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission denied. You can select a nearby Mahmudabad landmark below.';
        }
        setLocationStatus(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  // Quick preset locations for Mahmudabad (testing & quick selection)
  const setQuickLocation = (label: string, lat: number, lng: number, addressText: string) => {
    setUserCoords({ lat, lng });
    const dist = calculateDistance(CAFE_LAT, CAFE_LNG, lat, lng);
    setDetectedDistance(dist);
    setDeliveryAddress(addressText);
    setLocationStatus(`Selected: ${label} (${dist} KM)`);
  };

  const handleConfirmOrder = async () => {
    if (isSubmitting) return;

    if (cartItems.length === 0) return;

    if (isOutOfDeliveryRadius) {
      alert('Oops! We do not deliver to this location yet. We only deliver up to 8 KM from Ramkund Chauraha, Mahmudabad.');
      return;
    }

    // 1. User & Contact Info Resolution
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('hacky_user') : null;
    const userFromStorage = storedUser ? JSON.parse(storedUser) : null;
    const activeUser = userFromStorage || user;

    const finalPhone = (activeUser?.phone || customerPhone || '').trim();
    const finalAddress = (deliveryAddress || activeUser?.address || '').trim();
    const finalName = (activeUser?.name || customerName || 'Hacky Customer').trim();
    const finalEmail = (activeUser?.email || (finalPhone ? `${finalPhone}@hackypizza.com` : 'customer@hackypizza.com')).trim().toLowerCase();

    if (!finalPhone && !activeUser) {
      alert('Kripya order place karne ke liye Login karein ya mobile number enter karein!');
      if (typeof onOpenAuth === 'function') onOpenAuth();
      return;
    }

    setIsSubmitting(true);

    try {
      const activeBranchId = (typeof window !== 'undefined' ? localStorage.getItem('hacky_selected_branch_id') : null) || 'br_mahmudabad';
      const newOrder = await createOrderDirectly({
        userId: activeUser?.id || 'guest',
        customerName: finalName || 'Aman Verma',
        customerPhone: finalPhone || '9305938873',
        deliveryAddress: finalAddress || 'Motipur, Mahmudabad',
        items: cartItems.length > 0 ? cartItems : [{ name: 'Test Farmhouse Pizza', price: 121, quantity: 1 }],
        totalAmount: Number(grandTotal) || 121,
        branchId: activeBranchId,
        branchName: 'Mahmudabad Main Branch',
        notes: deliveryNotes || 'Call before arrival'
      });

      if (newOrder && newOrder.id) {
        // Deduct wallet in local state if user redeemed wallet
        if (walletDiscount > 0 && activeUser) {
          try {
            const curBal = Number(activeUser.walletBalance) || 0;
            const newBal = Math.max(0, curBal - walletDiscount);
            const updatedUser = { ...activeUser, walletBalance: newBal };
            localStorage.setItem('hacky_user', JSON.stringify(updatedUser));
          } catch {}
        }

        // Save directly into LocalStorage for instant Past Orders offline backup
        try {
          const existingOrders = JSON.parse(localStorage.getItem('hacky_past_orders') || '[]');
          existingOrders.unshift(newOrder);
          localStorage.setItem('hacky_past_orders', JSON.stringify(existingOrders));
        } catch (storageErr) {
          console.warn('LocalStorage save error:', storageErr);
        }

        alert(`🎉 Order DB me save ho gaya! Order #${newOrder.orderNumber || newOrder.id}`);
        if (typeof onClearCart === 'function') onClearCart();
        if (onOrderSuccess) onOrderSuccess(newOrder);
        if (typeof onClose === 'function') onClose();
        window.location.reload();
      } else {
        alert('Order save nahi hua, connection error!');
      }
    } catch (err: any) {
      console.error('CONFIRM_ORDER_ERROR:', err);
      alert('Error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckout = handleConfirmOrder;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Main Drawer/Modal Panel */}
      <div className="relative w-full max-w-lg bg-[#FFFBF2] text-[#502314] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden border-2 border-[#502314] animate-in slide-in-from-bottom duration-300">
        
        {/* Header Bar */}
        <div className="bg-[#502314] text-white px-5 py-4 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EA580C] flex items-center justify-center text-white font-black text-sm shadow">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wide uppercase text-white font-sans">
                YOUR MEAL CART
              </h2>
              <p className="text-xs text-amber-200">
                {cartItems.reduce((acc, i) => acc + i.quantity, 0)} Pizza items selected
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Cart Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          
          {/* ZOMATO-STYLE GEO-FENCED DELIVERY LOCATION CARD */}
          <div className="p-4 bg-white rounded-2xl border-2 border-[#E8D6BF] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-[#502314]">
                <MapPin className="w-4 h-4 text-[#EA580C]" />
                <span>DELIVERY LOCATION (MAHMUDABAD)</span>
              </div>
              <button
                onClick={() => setIsEditingAddress(!isEditingAddress)}
                className="text-xs font-black text-[#EA580C] hover:underline uppercase cursor-pointer"
              >
                {isEditingAddress ? 'DONE' : 'EDIT DETAILS'}
              </button>
            </div>

            {/* GPS Auto-Detect Button */}
            <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                type="button"
                onClick={handleAutoDetectLocation}
                disabled={isLocating}
                className="flex-1 py-2 px-3 bg-[#FFF2E2] hover:bg-[#FFE5C7] text-[#EA580C] border border-[#EA580C]/40 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer disabled:opacity-60"
              >
                {isLocating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Detecting GPS Location...</span>
                  </>
                ) : (
                  <>
                    <Compass className="w-4 h-4" />
                    <span>Auto Detect Current Location (GPS)</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Mahmudabad Landmark Testing Chips */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#7A4B3A] uppercase tracking-wider block">
                Quick Landmark Selection:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  {
                    name: 'Ramkund Chauraha (0.3 km)',
                    lat: 27.2952,
                    lng: 81.1228,
                    addr: 'Shop 4, Ramkund Chauraha, Mahmudabad',
                    isInZone: true
                  },
                  {
                    name: 'Bus Stand (1.4 km)',
                    lat: 27.2880,
                    lng: 81.1170,
                    addr: 'Near Mahmudabad Roadways Bus Stand',
                    isInZone: true
                  },
                  {
                    name: 'Sitapur Rd (4.5 km)',
                    lat: 27.2650,
                    lng: 81.0950,
                    addr: 'Sitapur Highway, Mahmudabad Outskirts',
                    isInZone: true
                  },
                  {
                    name: 'Out of Zone (18.2 km)',
                    lat: 27.1800,
                    lng: 80.9800,
                    addr: 'Highway Toll Plaza, Lucknow Border (Outside Radius)',
                    isInZone: false
                  }
                ].map((preset) => {
                  const isSelected = deliveryAddress.includes(preset.addr.split(',')[0]);
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setQuickLocation(preset.name, preset.lat, preset.lng, preset.addr)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                        isSelected 
                          ? 'bg-[#EA580C] text-white border-[#EA580C]'
                          : preset.isInZone
                            ? 'bg-[#FDF6EC] text-[#502314] border-[#E8D6BF] hover:border-[#EA580C]'
                            : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                      }`}
                    >
                      <span>{preset.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Radius Verification Status Badge */}
            <div className="pt-2 border-t border-[#F2E5D4]">
              {isOutOfDeliveryRadius ? (
                /* RED ALERT WHEN DISTANCE > 8 KM */
                <div className="p-3 bg-red-50 border-2 border-red-500 rounded-xl space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-red-700 font-black text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 stroke-[2.5]" />
                    <span>DELIVERY OUT OF RADIUS ({detectedDistance} KM)</span>
                  </div>
                  <p className="text-xs text-red-800 font-semibold leading-relaxed">
                    Oops! We do not deliver to this location yet. We only deliver up to 8 KM from Ramkund Chauraha, Mahmudabad.
                  </p>
                  <p className="text-[11px] text-red-600">
                    Kripya Mahmudabad radius ke andar ka address select karein.
                  </p>
                </div>
              ) : (
                /* GREEN IN-ZONE BADGE */
                <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800 text-xs font-black">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>In Delivery Radius: {detectedDistance} KM from Cafe</span>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                    Max 8 KM
                  </span>
                </div>
              )}

              {locationStatus && (
                <div className="text-[11px] text-[#7A4B3A] mt-1.5 font-medium italic">
                  {locationStatus}
                </div>
              )}
            </div>

            {/* Address & Contact Editing Fields */}
            {isEditingAddress ? (
              <div className="space-y-2 pt-1 border-t border-[#F2E5D4]">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full px-3 py-1.5 bg-[#FFFBF2] border border-[#E8D6BF] rounded-xl text-xs font-bold text-[#502314]"
                />
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Mobile Number (e.g. 9876543210)"
                  className="w-full px-3 py-1.5 bg-[#FFFBF2] border border-[#E8D6BF] rounded-xl text-xs font-bold text-[#502314]"
                />
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  rows={2}
                  placeholder="Street, Landmark, Mahmudabad"
                  className="w-full px-3 py-1.5 bg-[#FFFBF2] border border-[#E8D6BF] rounded-xl text-xs text-[#502314]"
                />
              </div>
            ) : (
              <div className="text-xs space-y-1 pt-1 border-t border-[#F2E5D4]">
                <div className="font-black text-[#502314] flex items-center justify-between">
                  <span>{customerName}</span>
                  <span className="text-[#7A4B3A] font-bold">+91 {customerPhone}</span>
                </div>
                <p className="text-[#7A4B3A] font-medium leading-relaxed">{deliveryAddress}</p>
              </div>
            )}

            {/* Optional Delivery Notes */}
            <div className="pt-2 border-t border-[#F2E5D4] flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#502314] shrink-0">Note:</span>
              <input
                type="text"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="e.g. Leave with security / Ring bell"
                className="w-full px-2.5 py-1 text-[11px] bg-[#FFFBF2] border border-[#E8D6BF] rounded-lg text-[#502314] focus:outline-none"
              />
            </div>
          </div>

          {/* REWARD BANNER */}
          <div className="p-3 bg-gradient-to-r from-amber-500/15 to-orange-500/15 rounded-2xl border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black text-[#502314]">
              <Coins className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Earn 150 Pizza Coins on this order!</span>
            </div>
            <div className="text-[11px] font-bold text-[#EA580C] flex items-center gap-1 shrink-0">
              <Clock className="w-3.5 h-3.5" />
              <span>25-35 MINS</span>
            </div>
          </div>

          {/* MULTIPLE CART ITEMS LIST */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#502314]">
              Order Items ({cartItems.length})
            </h3>

            {cartItems.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-[#E8D6BF] space-y-2">
                <span className="text-3xl">🍕</span>
                <div className="font-bold text-sm text-[#502314]">Your cart is empty</div>
                <p className="text-xs text-[#7A4B3A]">Add some mouth-watering pizzas to proceed!</p>
              </div>
            ) : (
              cartItems.map((item: any, idx: number) => (
                <div 
                  key={item.cartItemId || idx}
                  className="p-3.5 bg-white rounded-2xl border-2 border-orange-100 mb-2.5 shadow-sm space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Veg indicator & Name */}
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <span className={`w-3.5 h-3.5 rounded border mt-0.5 shrink-0 flex items-center justify-center p-0.5 ${item.isVeg ? 'border-emerald-600' : 'border-red-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-red-600'}`} />
                      </span>
                      <div className="min-w-0">
                        <p className="font-black text-xs text-[#502314] leading-tight truncate">{item.name}</p>
                        {/* Variations subtitle */}
                        <p className="text-[11px] font-bold text-gray-500 mt-0.5">
                          Size: <span className="text-[#EA580C]">{item.selectedSize || item.customization?.size || 'Regular'}</span> | Crust: <span className="text-[#EA580C]">{item.selectedCrust || item.customization?.crust || 'Classic Hand Tossed'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Stepper Quantity & Item Total */}
                    <div className="text-right shrink-0">
                      <div className="text-sm font-black text-[#502314]">
                        ₹{item.totalUnitPrice * (item.quantity || 1)}
                      </div>
                      <div className="text-[10px] text-[#7A4B3A]">₹{item.totalUnitPrice} each</div>
                    </div>
                  </div>

                  {/* Attached Sides Breakdown */}
                  {Array.isArray(item.attachedSides) && item.attachedSides.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-dashed border-gray-200 space-y-1 bg-[#FFFBF2] p-2 rounded-lg">
                      <span className="text-[10px] font-black uppercase text-gray-400 block">Selected Sides / Pairings:</span>
                      {item.attachedSides.map((sd: any, sIdx: number) => (
                        <div key={sIdx} className="flex justify-between text-[11px] text-gray-700 font-semibold">
                          <span>+ {sd.name}</span>
                          <span>₹{sd.price}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions Bar: Customise & Stepper */}
                  <div className="pt-2 border-t border-[#F2E5D4] flex items-center justify-between">
                    {/* CUSTOMISE Re-edit button */}
                    <button
                      type="button"
                      onClick={() => onReCustomiseItem(item)}
                      className="text-xs font-black text-[#EA580C] hover:text-[#c2410c] uppercase tracking-wider flex items-center gap-1 cursor-pointer bg-[#FFF2E2] px-2.5 py-1 rounded-lg border border-[#EA580C]/20"
                    >
                      <span>CUSTOMISE</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Quantity Stepper */}
                    <div className="flex items-center border border-[#502314] rounded-full overflow-hidden bg-[#FFFBF2]">
                      <button
                        type="button"
                        onClick={() => {
                          if (item.quantity === 1) {
                            onRemoveItem(item.cartItemId);
                          } else {
                            onUpdateQuantity(item.cartItemId, -1);
                          }
                        }}
                        className="px-2.5 py-1 text-[#502314] hover:bg-[#F8EFE0] font-black text-xs cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-red-600" /> : <Minus className="w-3 h-3" />}
                      </button>
                      <span className="px-2.5 py-1 font-black text-xs text-[#502314] tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.cartItemId, 1)}
                        className="px-2.5 py-1 text-[#502314] hover:bg-[#F8EFE0] font-black text-xs cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Special instructions area */}
          <div className="p-3 bg-white rounded-2xl border border-[#E8D6BF] space-y-1">
            <label className="text-[11px] font-bold text-[#502314] uppercase">Special Instructions for your Meal</label>
            <input
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Extra oregano and chili flakes packets please"
              className="w-full px-3 py-1.5 text-xs bg-[#FFFBF2] border border-[#E8D6BF] rounded-xl text-[#502314] focus:outline-none"
            />
          </div>

          {/* MANDATORY LOGIN PROMPT BANNER IF NOT AUTHENTICATED */}
          {!user && (
            <div className="p-3.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl border-2 border-orange-500/40 flex items-center justify-between gap-3 animate-pulse">
              <div className="space-y-0.5">
                <div className="text-xs font-black text-[#502314] flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-orange-600" />
                  <span>LOGIN REQUIRED FOR ORDER</span>
                </div>
                <p className="text-[11px] text-[#7A4B3A]">
                  Kripya order place karne ke liye pehle Login ya Sign Up karein.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 bg-[#EA580C] hover:bg-[#c2410c] text-white text-xs font-black uppercase rounded-xl shadow-md shrink-0 cursor-pointer"
              >
                Login / Sign Up
              </button>
            </div>
          )}

          {/* OFFERS & COUPONS SECTION */}
          <div className="bg-white rounded-2xl border-2 border-[#E8D6BF] overflow-hidden p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#EA580C]" />
                <span className="text-xs font-black text-[#502314] uppercase">COUPONS &amp; PROMO CODES</span>
              </div>
              {appliedCoupon && (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                >
                  ✕ Remove
                </button>
              )}
            </div>

            {/* Input Box for custom coupon */}
            <div className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => {
                  setCouponInput(e.target.value);
                  setCouponError(null);
                }}
                placeholder="Enter Code (e.g. HACKYVIP)"
                className="flex-1 px-3 py-2 text-xs font-bold uppercase tracking-wider bg-[#FFFBF2] border border-[#E8D6BF] rounded-xl text-[#502314] focus:outline-none focus:border-[#EA580C]"
              />
              <button
                type="button"
                disabled={isApplyingCoupon || !couponInput.trim()}
                onClick={() => handleApplyCoupon()}
                className="px-4 py-2 bg-[#EA580C] hover:bg-[#c2410c] text-white font-black text-xs uppercase tracking-wider rounded-xl transition disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isApplyingCoupon ? 'Checking...' : 'APPLY'}
              </button>
            </div>

            {/* Coupon Error / Success Feedback */}
            {couponError && (
              <div className="text-[11px] font-bold text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                ⚠️ {couponError}
              </div>
            )}
            {couponSuccess && (
              <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200 flex items-center justify-between">
                <span>✓ {couponSuccess}</span>
              </div>
            )}

            {/* Applied Tag Banner */}
            {appliedCoupon && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between text-xs font-bold text-emerald-800">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Coupon <strong>{appliedCoupon}</strong> Applied!</span>
                </div>
                <span className="font-black text-emerald-700">Saved ₹{couponDiscount}</span>
              </div>
            )}

            {/* Available Quick Offers */}
            <div className="pt-2 border-t border-[#F2E5D4] space-y-2">
              <span className="text-[10px] font-bold text-[#7A4B3A] uppercase tracking-wider block">
                Available Offers for You:
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#FFF2E2] border border-[#EA580C]/20">
                  <div>
                    <span className="font-black text-[#EA580C]">BURGERKING50</span>
                    <p className="text-[10px] text-[#7A4B3A]">Flat 15% off up to ₹50 on wood-fired orders</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon('BURGERKING50')}
                    className="px-3 py-1 bg-[#EA580C] hover:bg-[#c2410c] text-white font-bold text-[11px] rounded-lg cursor-pointer transition"
                  >
                    {appliedCoupon === 'BURGERKING50' ? 'APPLIED' : 'APPLY'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-[#F0FDF4] border border-emerald-600/20">
                  <div>
                    <span className="font-black text-emerald-700">HACKYVIP</span>
                    <p className="text-[10px] text-[#7A4B3A]">Influencer Special: 20% off (Min order ₹249)</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon('HACKYVIP')}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg cursor-pointer transition"
                  >
                    {appliedCoupon === 'HACKYVIP' ? 'APPLIED' : 'APPLY'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* BILL SUMMARY BOX */}
          <div className="p-4 bg-white rounded-2xl border-2 border-[#E8D6BF] shadow-xs space-y-2 text-xs">
            <div className="font-black uppercase tracking-wider text-xs text-[#502314] pb-2 border-b border-[#F2E5D4]">
              Bill Summary
            </div>

            <div className="flex justify-between text-[#7A4B3A]">
              <span>Order Total (Pizzas):</span>
              <span className="font-bold text-[#502314]">₹{subTotal}</span>
            </div>

            <div className="flex justify-between text-[#7A4B3A]">
              <span>Delivery Fee (Within 8 KM):</span>
              <span className="font-bold text-[#502314]">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
            </div>

            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Coupon ({appliedCoupon}):</span>
                <span>-₹{couponDiscount}</span>
              </div>
            )}

            {/* Wallet Bonus Toggle */}
            {userWallet > 0 ? (
              <div className="flex items-center justify-between py-1.5 bg-amber-500/10 px-2.5 rounded-lg border border-amber-500/20">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-900 text-xs">
                  <input
                    type="checkbox"
                    checked={redeemWallet}
                    onChange={(e) => setRedeemWallet(e.target.checked)}
                    className="rounded text-[#EA580C]"
                  />
                  <span>Redeem Hacky Wallet (Available: ₹{userWallet})</span>
                </label>
                <span className="font-black text-emerald-600">-₹{walletDiscount}</span>
              </div>
            ) : null}

            <div className="flex justify-between text-[#7A4B3A]">
              <span>Taxes and Charges (GST 5%):</span>
              <span className="font-bold text-[#502314]">₹{taxes}</span>
            </div>

            <div className="pt-2 border-t border-[#F2E5D4] flex justify-between items-baseline text-sm font-black text-[#502314]">
              <span>Grand Total:</span>
              <span className="text-xl text-[#EA580C]">₹{grandTotal}</span>
            </div>
          </div>

        </div>

        {/* STICKY BOTTOM BAR */}
        <div className="bg-[#FFFDF9] border-t-2 border-[#E8D6BF] p-4 space-y-2.5 shadow-2xl shrink-0">
          
          {/* Address & Radius Warning Indicator */}
          <div className="flex items-center justify-between text-[11px] text-[#7A4B3A]">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className={`w-3.5 h-3.5 shrink-0 ${isOutOfDeliveryRadius ? 'text-red-600' : 'text-[#EA580C]'}`} />
              <span className="truncate">
                {isOutOfDeliveryRadius 
                  ? `Out of range (${detectedDistance} KM)` 
                  : `Delivery to: ${deliveryAddress}`}
              </span>
            </div>
            <span className="font-black text-[#502314] shrink-0 ml-2">Cash on Delivery</span>
          </div>

          {/* Full-width Action Button (Disabled if out of 8 KM radius) */}
          <button
            type="button"
            disabled={cartItems.length === 0 || isSubmitting || isOutOfDeliveryRadius}
            onClick={handleConfirmOrder}
            className={`w-full py-4 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl transition-all active:scale-98 flex items-center justify-between px-6 ${
              isOutOfDeliveryRadius
                ? 'bg-stone-400 cursor-not-allowed opacity-80'
                : 'bg-gradient-to-r from-[#EA580C] to-[#D64500] hover:from-[#c2410c] hover:to-[#b91c1c] cursor-pointer'
            }`}
          >
            <span>
              {isSubmitting
                ? 'CONFIRMING ORDER...'
                : isOutOfDeliveryRadius
                ? 'DELIVERY NOT AVAILABLE (EXCEEDS 8 KM)'
                : 'CHECKOUT • CASH ON DELIVERY'}
            </span>
            <span className="text-base font-black flex items-center gap-1">
              ₹{grandTotal} <ArrowRight className="w-4 h-4 stroke-[3]" />
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}
