'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Flame, 
  Bike, 
  Clock, 
  MapPin, 
  Phone, 
  ArrowLeft, 
  Sparkles, 
  ShoppingBag, 
  RefreshCw,
  AlertCircle,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';

export default function OrderStatusPage() {
  const [orderId, setOrderId] = useState<string>('');
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Extract ?id=... from search params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('id') || urlParams.get('orderId') || '';
      setOrderId(id);
    }
  }, []);

  const fetchOrderDetails = async (idToFetch: string, showLoader = false) => {
    if (!idToFetch) {
      setIsLoading(false);
      return;
    }

    if (showLoader) setIsRefreshing(true);
    try {
      const res = await fetch(`/api/orders/status?id=${encodeURIComponent(idToFetch)}`);
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
        setError(null);
      } else {
        // Fallback to /api/orders/list
        const listRes = await fetch('/api/orders/list?limit=10');
        const listData = await listRes.json();
        if (listData.success && listData.orders) {
          const matched = listData.orders.find(
            (o: any) => o.id === idToFetch || o.orderNumber === idToFetch
          );
          if (matched) {
            setOrder(matched);
            setError(null);
          } else {
            setError(data.error || 'Order status details nahi mili.');
          }
        } else {
          setError(data.error || 'Order status details nahi mili.');
        }
      }
    } catch (err: any) {
      setError(`Network error: ${err.message}`);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId, false);
      // Auto-poll status every 5 seconds for live kitchen updates
      const interval = setInterval(() => {
        fetchOrderDetails(orderId, false);
      }, 5000);
      return () => clearInterval(interval);
    } else {
      setIsLoading(false);
    }
  }, [orderId]);

  const rawStatus = (order?.status || order?.orderStatus || 'PENDING').toUpperCase();

  // Map backend status to stepper index (0-3)
  const getStepIndex = (st: string) => {
    if (st === 'CANCELLED' || st === 'REJECTED') return -1;
    if (st === 'DELIVERED') return 3;
    if (st === 'OUT_FOR_DELIVERY') return 2;
    if (st === 'PREPARING' || st === 'ACCEPTED' || st === 'READY_FOR_PICKUP') return 1;
    return 0; // PENDING
  };

  const currentStep = getStepIndex(rawStatus);

  const steps = [
    { title: 'Order Confirmed', desc: 'Received at Mahmudabad Kitchen', icon: CheckCircle2 },
    { title: 'Wood-Fired Baking', desc: 'Fresh dough & mozzarella baking hot', icon: Flame },
    { title: 'Out For Delivery', desc: 'Rider is on the way to your doorstep', icon: Bike },
    { title: 'Delivered', desc: 'Fresh & Hot Pizza Delivered!', icon: Sparkles },
  ];

  const parsedItems = Array.isArray(order?.items)
    ? order.items
    : typeof order?.items === 'string'
    ? (() => {
        try {
          return JSON.parse(order.items);
        } catch {
          return [];
        }
      })()
    : [];

  return (
    <div className="min-h-screen bg-[#FFFBF2] text-[#502314] flex flex-col font-sans pb-16">
      {/* Top Navbar */}
      <header className="bg-[#502314] text-white px-4 py-4 sticky top-0 z-30 shadow-md">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button
            onClick={() => {
              window.location.href = '/';
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-orange-200 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Storefront</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-base font-black tracking-wide text-white uppercase">
              🍕 Hacky Pizza Town
            </h1>
            <p className="text-[10px] text-orange-300 font-medium">
              Live Order Tracker • Mahmudabad
            </p>
          </div>

          <button
            onClick={() => orderId && fetchOrderDetails(orderId, true)}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="Refresh Status"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-xl w-full mx-auto p-4 flex-1 space-y-4">
        {isLoading ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-[#EA580C] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-bold text-sm text-[#7A4B3A]">
              Connecting to Kitchen Dispatch...
            </p>
          </div>
        ) : error && !order ? (
          <div className="bg-white rounded-3xl p-6 border-2 border-[#E8D6BF] text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-black text-[#502314]">Order Not Found</h2>
            <p className="text-xs text-[#7A4B3A]">{error}</p>
            <button
              onClick={() => {
                window.location.href = '/';
              }}
              className="px-6 py-3 bg-[#EA580C] text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer hover:bg-[#c2410c] transition"
            >
              Back to Menu
            </button>
          </div>
        ) : (
          <>
            {/* Status Banner Card */}
            <div className="bg-white rounded-3xl border-2 border-[#E8D6BF] overflow-hidden shadow-md">
              {/* Header section with gradient */}
              <div className="bg-gradient-to-r from-[#502314] to-[#7A3620] text-white p-5 text-center relative">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EA580C] rounded-full text-[11px] font-black uppercase tracking-wider mb-2 shadow">
                  <Clock className="w-3.5 h-3.5" />
                  Estimated Time: 25 - 35 Mins
                </div>
                <h2 className="text-2xl font-black tracking-tight">
                  {rawStatus === 'DELIVERED'
                    ? '🎉 Order Delivered!'
                    : rawStatus === 'CANCELLED' || rawStatus === 'REJECTED'
                    ? '⚠️ Order Cancelled'
                    : '🔥 Baking In Wood Oven'}
                </h2>
                <p className="text-xs text-orange-200 mt-1">
                  Order ID: <span className="font-black text-white">{order?.orderNumber || order?.id || orderId}</span>
                </p>
              </div>

              {/* Cancelled Banner if applicable */}
              {(rawStatus === 'CANCELLED' || rawStatus === 'REJECTED') && (
                <div className="p-4 bg-red-50 border-b border-red-200 text-red-800 text-xs font-semibold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <div>
                    <span className="font-bold">Order was declined: </span>
                    {order?.rejectionReason || 'Kitchen is experiencing high volume or store is closed.'}
                  </div>
                </div>
              )}

              {/* Stepper Timeline */}
              {rawStatus !== 'CANCELLED' && rawStatus !== 'REJECTED' && (
                <div className="p-5 space-y-4">
                  <div className="relative pl-6 space-y-5">
                    {/* Vertical Connector Line */}
                    <div className="absolute left-2.5 top-2.5 bottom-2.5 w-0.5 bg-[#E8D6BF]" />

                    {steps.map((st, idx) => {
                      const isCompleted = currentStep > idx;
                      const isCurrent = currentStep === idx;
                      const Icon = st.icon;

                      return (
                        <div key={idx} className="relative flex items-start gap-3">
                          <div
                            className={`absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                              isCompleted
                                ? 'bg-emerald-600 text-white'
                                : isCurrent
                                ? 'bg-[#EA580C] text-white ring-4 ring-[#EA580C]/20'
                                : 'bg-[#E8D6BF] text-[#7A4B3A]'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="pl-3">
                            <h4
                              className={`text-sm font-black ${
                                isCurrent
                                  ? 'text-[#EA580C]'
                                  : isCompleted
                                  ? 'text-emerald-700'
                                  : 'text-stone-400'
                              }`}
                            >
                              {st.title}
                            </h4>
                            <p className="text-[11px] text-[#7A4B3A]">
                              {st.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Rider Information Card (if assigned) */}
            {order?.riderName && (
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow">
                    <Bike className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                      Delivery Executive Assigned
                    </span>
                    <h4 className="text-sm font-black text-emerald-950">
                      {order.riderName}
                    </h4>
                  </div>
                </div>
                {order.riderPhone && (
                  <a
                    href={`tel:${order.riderPhone}`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow hover:bg-emerald-700 transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call Rider
                  </a>
                )}
              </div>
            )}

            {/* Delivery Address Card */}
            <div className="bg-white rounded-2xl p-4 border-2 border-[#E8D6BF] space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#7A4B3A] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#EA580C]" />
                  Delivery Destination
                </span>
                <span className="text-[10px] bg-orange-100 text-[#EA580C] px-2 py-0.5 rounded-full font-bold">
                  Within 8 KM Radius
                </span>
              </div>
              <p className="text-xs font-bold text-[#502314] leading-relaxed">
                {order?.customerAddress || order?.address || 'Near Clock Tower, Ramkund Chauraha, Mahmudabad'}
              </p>
              <div className="text-[11px] text-[#7A4B3A] pt-1 border-t border-[#F2E5D4] flex items-center justify-between">
                <span>Customer: <strong>{order?.customerName || 'Customer'}</strong></span>
                <span>Contact: <strong>{order?.customerPhone || order?.phone || '9305938873'}</strong></span>
              </div>
            </div>

            {/* Order Items Breakdown */}
            <div className="bg-white rounded-2xl p-4 border-2 border-[#E8D6BF] space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#F2E5D4]">
                <span className="text-xs font-black uppercase tracking-wider text-[#502314] flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#EA580C]" />
                  Items Ordered ({parsedItems.length})
                </span>
                <span className="text-[11px] font-bold text-[#EA580C]">
                  Cash On Delivery
                </span>
              </div>

              <div className="divide-y divide-[#F2E5D4] text-xs">
                {parsedItems.map((item: any, idx: number) => (
                  <div key={idx} className="py-2.5 flex items-start justify-between">
                    <div>
                      <div className="font-bold text-[#502314] flex items-center gap-1.5">
                        <span>{item.quantity || 1}x</span>
                        <span>{item.name || 'Hacky Pizza'}</span>
                      </div>
                      {item.customization && (
                        <p className="text-[11px] text-[#7A4B3A] mt-0.5">
                          {item.customization}
                        </p>
                      )}
                    </div>
                    <span className="font-bold text-[#502314]">
                      ₹{item.price ? item.price * (item.quantity || 1) : order?.totalAmount}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div className="pt-2 border-t-2 border-[#E8D6BF] flex justify-between items-baseline">
                <span className="font-black text-xs uppercase tracking-wider text-[#502314]">
                  Total Amount (COD):
                </span>
                <span className="text-lg font-black text-[#EA580C]">
                  ₹{order?.totalAmount || '0'}
                </span>
              </div>
            </div>

            {/* Support & Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  window.location.href = '/';
                }}
                className="w-full py-3.5 bg-gradient-to-r from-[#EA580C] to-[#D64500] hover:from-[#c2410c] hover:to-[#b91c1c] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Explore & Order More Pizzas
              </button>

              <div className="flex gap-2">
                <a
                  href="tel:9305938873"
                  className="flex-1 py-3 bg-white border-2 border-[#E8D6BF] hover:border-[#EA580C] text-[#502314] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition"
                >
                  <Phone className="w-3.5 h-3.5 text-[#EA580C]" />
                  Call Store (9305938873)
                </a>
                <button
                  onClick={() => fetchOrderDetails(orderId, true)}
                  className="flex-1 py-3 bg-white border-2 border-[#E8D6BF] hover:border-[#EA580C] text-[#502314] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#EA580C] ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh Live Status
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
