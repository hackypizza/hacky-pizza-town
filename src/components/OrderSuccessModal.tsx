import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, MapPin, Phone, Flame, Bike, Check, X, Sparkles } from 'lucide-react';
import { OrderDetails } from '../types';
import { VegIndicator } from './VegIndicator';

interface OrderSuccessModalProps {
  order: OrderDetails | null;
  onClose: () => void;
  onOrderAgain: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onOrderAgain,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  useEffect(() => {
    if (!order) return;
    // Simulate order progress
    const timer1 = setTimeout(() => setCurrentStep(2), 5000);
    const timer2 = setTimeout(() => setCurrentStep(3), 12000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [order]);

  if (!order) return null;

  const steps = [
    { title: 'Order Confirmed', time: order.orderTime, icon: CheckCircle2 },
    { title: 'Baking in Wood Oven', time: 'In progress', icon: Flame },
    { title: 'Out for Delivery', time: 'Next', icon: Bike },
    { title: 'Delivered', time: order.estimatedDeliveryTime, icon: Check },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="relative w-full max-w-lg bg-[#fffaf0] rounded-3xl shadow-2xl border border-[#ecdccb] overflow-hidden z-10 my-8 animate-in zoom-in-95 duration-200">
        
        {/* Celebration Header */}
        <div className="bg-[#502314] text-white p-6 text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#ea580c]/20 blur-xl pointer-events-none" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
          </div>

          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#ea580c] text-white text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" />
            Order #{order.id} Placed!
          </span>

          <h3
            className="text-2xl font-black tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Hacky Pizza Town is Baking!
          </h3>
          <p className="text-xs text-orange-200 mt-1">
            Mahmudabad Kitchen has received your order. Freshly fired & hot!
          </p>
        </div>

        {/* Live Delivery Tracker */}
        <div className="p-6 space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-[#ede3d7] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#ea580c]" />
                <span className="text-xs font-bold text-[#502314]">Estimated Delivery:</span>
              </div>
              <span className="text-xs font-extrabold text-[#ea580c] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                {order.estimatedDeliveryTime}
              </span>
            </div>

            {/* Stepper Tracker */}
            <div className="relative pl-6 space-y-4">
              {/* Vertical line */}
              <div className="absolute left-2.5 top-2.5 bottom-2.5 w-0.5 bg-[#f0e4d6]" />

              {steps.map((step, idx) => {
                const isPassed = currentStep > idx;
                const isCurrent = currentStep === idx;
                const IconComponent = step.icon;

                return (
                  <div key={step.title} className="relative flex items-start gap-3">
                    <div
                      className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${
                        isPassed
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-[#ea580c] border-[#ea580c] text-white animate-pulse'
                          : 'bg-white border-zinc-300 text-zinc-400'
                      }`}
                    >
                      <IconComponent className="w-2.5 h-2.5" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold ${
                            isCurrent
                              ? 'text-[#ea580c]'
                              : isPassed
                              ? 'text-emerald-800'
                              : 'text-zinc-500'
                          }`}
                        >
                          {step.title}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-medium">
                          {step.time}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Details */}
          <div className="bg-white p-4 rounded-2xl border border-[#ede3d7] space-y-2 text-xs">
            <div className="flex items-start gap-2 text-[#71594f]">
              <MapPin className="w-4 h-4 text-[#ea580c] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#502314]">Delivering to: </span>
                <span>{order.customerName} ({order.phone})</span>
                <p className="text-[11px] text-[#8c6759] mt-0.5">{order.address}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#f4e7da] text-[#71594f]">
              <span>Payment Mode:</span>
              <span className="font-bold text-[#502314] uppercase">
                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Itemized summary */}
          <div className="bg-white p-4 rounded-2xl border border-[#ede3d7] space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8c6759]">
              Ordered Items
            </h4>
            <div className="divide-y divide-[#f7eee5] text-xs">
              {order.items.map((item) => (
                <div key={item.id} className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <VegIndicator isVeg={item.isVeg} />
                    <span className="font-medium text-[#321207]">
                      {item.quantity} × {item.name}
                    </span>
                    {item.selectedSize && (
                      <span className="text-[10px] text-[#8c6759] bg-[#fbf5ee] px-1 rounded-xs">
                        ({item.selectedSize})
                      </span>
                    )}
                  </div>
                  <span className="font-bold tabular-nums text-[#502314]">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#f0e4d6] flex items-center justify-between text-xs font-black text-[#502314]">
              <span>Grand Total</span>
              <span className="text-sm tabular-nums text-[#ea580c]">₹{order.grandTotal}</span>
            </div>
          </div>

          {/* Need help footer */}
          <div className="flex items-center justify-between p-3 bg-[#fdf5ec] rounded-xl border border-[#eddcd0] text-xs">
            <div className="flex items-center gap-2 text-[#71594f]">
              <Phone className="w-4 h-4 text-[#ea580c]" />
              <span>Questions? Call Mahmudabad Store:</span>
            </div>
            <a
              href="tel:+919876543210"
              className="font-bold text-[#ea580c] hover:underline"
            >
              +91 98765 43210
            </a>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onOrderAgain}
              className="flex-1 py-3 bg-[#502314] hover:bg-[#3d180c] text-white text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer"
            >
              Order More Food
            </button>
            <button
              onClick={onClose}
              className="px-5 py-3 bg-white hover:bg-[#fbf4ea] text-[#502314] border border-[#e2d2c1] text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
