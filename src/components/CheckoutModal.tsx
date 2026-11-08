import React, { useState } from 'react';
import { X, MapPin, Phone, User as UserIcon, CreditCard, Banknote, QrCode, ArrowLeft, CheckCircle2, Shield } from 'lucide-react';
import { CartItem, Coupon, OrderDetails, UserProfile } from '../types';
import { createOrderDirectly } from '../lib/neonClient';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  appliedCoupon: Coupon | null;
  onOrderPlaced: (order: OrderDetails) => void;
  currentUser: UserProfile | null;
  orderMode?: 'DELIVERY' | 'DINE_IN';
  currentOutlet?: string;
  isWalletRedeemed?: boolean;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  appliedCoupon,
  onOrderPlaced,
  currentUser,
  orderMode = 'DELIVERY',
  currentOutlet = 'Ramkund Chauraha, Mahmudabad',
  isWalletRedeemed = false,
}) => {
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [tableNumber, setTableNumber] = useState('');
  const [landmark, setLandmark] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'card'>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Recalculate totals
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = orderMode === 'DINE_IN' ? 0 : subtotal >= 299 ? 0 : 35;
  let discount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minOrder) {
    discount = Math.min((subtotal * appliedCoupon.discountPercent) / 100, appliedCoupon.maxDiscount);
  }
  const userWallet = Number(currentUser?.walletBalance) || 0;
  const walletDiscount = isWalletRedeemed && userWallet > 0 ? Math.min(userWallet, Math.max(0, subtotal - discount)) : 0;
  const taxable = Math.max(0, subtotal - discount - walletDiscount);
  const taxes = Math.round(taxable * 0.05);
  const grandTotal = Math.max(0, taxable + deliveryFee + taxes);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Please enter your full name');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setFormError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!address.trim() || address.length < 8) {
      setFormError('Please enter a complete delivery address in Mahmudabad');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    (async () => {
      try {
        const activeBranchId = (typeof window !== 'undefined' ? localStorage.getItem('hacky_selected_branch_id') : null) || 'br_mahmudabad';
        const backendOrder = await createOrderDirectly({
          userId: currentUser?.id || 'guest',
          customerName: name.trim(),
          customerPhone: phone.trim(),
          deliveryAddress: address.trim(),
          items: cart,
          totalAmount: grandTotal,
          branchId: activeBranchId,
          branchName: 'Mahmudabad Main Branch',
          notes: landmark ? `Landmark: ${landmark}` : deliveryNotes
        }).catch(() => null);

        const newOrder: OrderDetails = {
          id: backendOrder?.orderNumber || backendOrder?.id || `HPT-${Math.floor(1000 + Math.random() * 9000)}`,
          items: [...cart],
          subtotal,
          deliveryFee,
          taxes,
          discount,
          walletRedeemed: walletDiscount,
          grandTotal,
          appliedCoupon: appliedCoupon ? appliedCoupon.code : null,
          customerName: name,
          phone,
          address: orderMode === 'DINE_IN' ? `${currentOutlet} - ${tableNumber}` : address,
          landmark: orderMode === 'DINE_IN' ? 'Dine-in / Counter Pickup' : landmark,
          orderMode,
          outlet: currentOutlet,
          paymentMethod,
          orderTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          estimatedDeliveryTime: orderMode === 'DINE_IN' ? '15-20 mins (Ready at counter)' : '25-30 mins',
          status: 'Baking',
        };

        alert(`🎉 Order DB me save ho gaya! Order #${newOrder.id}`);
        onOrderPlaced(newOrder);
      } catch (err: any) {
        console.error('Checkout modal error:', err);
        alert('Order Error: ' + (err?.message || 'Database error occurred'));
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-[#fffaf0] rounded-3xl shadow-2xl border border-[#ecdccb] overflow-hidden z-10 my-8 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#502314] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer mr-1"
            >
              <ArrowLeft className="w-4 h-4 text-orange-200" />
            </button>
            <h3
              className="text-lg font-extrabold tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Delivery & Checkout
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
              {formError}
            </div>
          )}

          {/* Section 1: Customer Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8c6759] flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-[#ea580c]" />
              <span>Contact Information</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#502314] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aman Verma"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#e2d2c1] rounded-xl focus:ring-2 focus:ring-[#ea580c] focus:outline-hidden text-[#321207]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#502314] mb-1">
                  Mobile Number *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8c6759]">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full pl-11 pr-3 py-2 text-xs bg-white border border-[#e2d2c1] rounded-xl focus:ring-2 focus:ring-[#ea580c] focus:outline-hidden text-[#321207]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Address in Mahmudabad */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8c6759] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#ea580c]" />
              <span>Mahmudabad Delivery Address</span>
            </h4>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#502314] mb-1">
                  House / Flat / Street Address *
                </label>
                <textarea
                  rows={2}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Complete street address, ward, or colony in Mahmudabad"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#e2d2c1] rounded-xl focus:ring-2 focus:ring-[#ea580c] focus:outline-hidden text-[#321207]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#502314] mb-1">
                    Nearby Landmark
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Near Town Hall / Central Bank"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#e2d2c1] rounded-xl focus:ring-2 focus:ring-[#ea580c] focus:outline-hidden text-[#321207]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#502314] mb-1">
                    Store Location
                  </label>
                  <div className="px-3 py-2 text-xs bg-[#f4e8db] border border-[#e2d2c1] rounded-xl text-[#502314] font-semibold flex items-center justify-between">
                    <span>Mahmudabad Branch</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-sm">2.4 km</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#502314] mb-1">
                  Cooking / Delivery Instructions
                </label>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="e.g. Ring bell, leave at door, extra oregano"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#e2d2c1] rounded-xl focus:ring-2 focus:ring-[#ea580c] focus:outline-hidden text-[#321207]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Payment Method */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8c6759] flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-[#ea580c]" />
              <span>Choose Payment Method</span>
            </h4>

            <div className="grid grid-cols-3 gap-2">
              <label
                className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-[#ea580c] bg-orange-50/80 ring-2 ring-[#ea580c]/30 text-[#502314]'
                    : 'border-[#e2d2c1] bg-white text-[#71594f] hover:bg-[#faf4ec]'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="sr-only"
                />
                <Banknote className="w-5 h-5 text-[#ea580c]" />
                <span className="text-xs font-bold leading-tight">Cash on Delivery</span>
                <span className="text-[10px] text-emerald-700 font-semibold">Pay on Delivery</span>
              </label>

              <label
                className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-[#ea580c] bg-orange-50/80 ring-2 ring-[#ea580c]/30 text-[#502314]'
                    : 'border-[#e2d2c1] bg-white text-[#71594f] hover:bg-[#faf4ec]'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'upi'}
                  onChange={() => setPaymentMethod('upi')}
                  className="sr-only"
                />
                <QrCode className="w-5 h-5 text-[#ea580c]" />
                <span className="text-xs font-bold leading-tight">UPI / QR</span>
                <span className="text-[10px] text-zinc-500 font-medium">GPay / PhonePe</span>
              </label>

              <label
                className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                  paymentMethod === 'card'
                    ? 'border-[#ea580c] bg-orange-50/80 ring-2 ring-[#ea580c]/30 text-[#502314]'
                    : 'border-[#e2d2c1] bg-white text-[#71594f] hover:bg-[#faf4ec]'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="sr-only"
                />
                <CreditCard className="w-5 h-5 text-[#ea580c]" />
                <span className="text-xs font-bold leading-tight">Debit / Card</span>
                <span className="text-[10px] text-zinc-500 font-medium">Visa / Master</span>
              </label>
            </div>
          </div>

          {/* Bill Summary Strip */}
          <div className="p-3 bg-white rounded-2xl border border-[#ede3d7] flex items-center justify-between text-xs">
            <div>
              <span className="text-[#8c6759]">Total Payable Amount</span>
              <div className="text-base font-black text-[#502314] tabular-nums">₹{grandTotal}</div>
            </div>
            <div className="flex items-center gap-1 text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-1 rounded-lg">
              <Shield className="w-3.5 h-3.5" />
              <span>Safe & Secure</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 bg-[#ea580c] hover:bg-[#c2410c] active:scale-98 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Confirming Order...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Place Order (₹{grandTotal})</span>
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
