'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function KDSPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const knownOrderIds = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(false);

  // Play Kitchen Cooking Chime
  const playKitchenBell = () => {
    try {
      const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
      audio.play().catch(() => {});
    } catch {}
  };

  useEffect(() => {
    fetch('/api/branches')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.branches.length > 0) {
          setBranches(data.branches);
          const saved = localStorage.getItem('kds_selected_branch_id') || data.branches[0].id;
          setSelectedBranchId(saved);
        }
      })
      .catch(() => {});
  }, []);

  const fetchKdsOrders = async () => {
    if (!selectedBranchId) return;
    try {
      const res = await fetch(`/api/orders/list?branchId=${selectedBranchId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        // Filter active kitchen orders only (ACCEPTED, PENDING, PREPARING)
        const kitchenOrders = data.orders.filter(
          (o: any) => o.status === 'ACCEPTED' || o.status === 'PENDING' || o.status === 'PREPARING'
        );

        if (!isFirstLoad.current) {
          kitchenOrders.forEach((o: any) => knownOrderIds.current.add(o.id));
          isFirstLoad.current = true;
        } else {
          const freshOrders = kitchenOrders.filter((o: any) => !knownOrderIds.current.has(o.id));
          if (freshOrders.length > 0) {
            playKitchenBell();
            freshOrders.forEach((o: any) => knownOrderIds.current.add(o.id));
          }
        }

        setOrders(kitchenOrders);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedBranchId) return;
    localStorage.setItem('kds_selected_branch_id', selectedBranchId);
    isFirstLoad.current = false;
    knownOrderIds.current.clear();
    fetchKdsOrders();

    const interval = setInterval(fetchKdsOrders, 3500);
    return () => clearInterval(interval);
  }, [selectedBranchId]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    await fetch('/api/orders/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status })
    });
    fetchKdsOrders();
  };

  const selectedBranchObj = branches.find((b) => b.id === selectedBranchId);

  return (
    <div className="min-h-screen bg-[#111111] text-white p-4 font-sans">
      {/* KDS Header & Branch Switcher */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4 mb-4 gap-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🍳</span>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-orange-500">Live Kitchen Display (KDS)</h1>
            <p className="text-xs text-gray-400 font-bold">
              Real-time Chef Dispatch Ticket Station • {selectedBranchObj?.name || 'All Branches'}
            </p>
          </div>
        </div>

        {/* Branch Filter Selector & Links */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-gray-400">Kitchen Branch:</span>
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="bg-[#242424] border border-white/15 text-orange-400 font-black text-xs rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} - {b.city}
              </option>
            ))}
          </select>

          <button 
            onClick={fetchKdsOrders}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            🔄 Sync
          </button>

          <Link
            href="/manager"
            className="px-3 py-2 bg-orange-600/20 hover:bg-orange-600 text-orange-300 hover:text-white rounded-xl text-xs font-bold transition"
          >
            🏪 Store Manager
          </Link>
          <Link
            href="/admin"
            className="px-3 py-2 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white rounded-xl text-xs font-bold transition"
          >
            ⚙️ Admin
          </Link>
        </div>
      </div>

      {/* Tickets Grid */}
      {loading && orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-pulse">
          <span className="text-4xl mb-2">🍳</span>
          <p className="text-sm font-bold text-gray-400">Loading kitchen orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-5xl mb-3">🍕</span>
          <h3 className="text-lg font-black text-gray-300">Sabhi Kitchen Tickets Clear Hain!</h3>
          <p className="text-xs text-gray-500 mt-1">
            {selectedBranchObj?.name || 'Is branch'} ke liye koi naya cooking order pending nahi hai.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {orders.map((ord) => {
            const isPending = ord.status === 'PENDING';
            let parsedItems = [];
            try {
              parsedItems = typeof ord.items === 'string' ? JSON.parse(ord.items) : (ord.items || []);
            } catch {
              parsedItems = [];
            }

            return (
              <div 
                key={ord.id} 
                className={`rounded-2xl border-2 flex flex-col justify-between overflow-hidden shadow-2xl transition-all ${
                  isPending ? 'border-amber-500 bg-[#1E1E1E]' : 'border-green-500 bg-[#1A1A1A]'
                }`}
              >
                {/* Ticket Top */}
                <div className={`p-3 flex justify-between items-center ${isPending ? 'bg-amber-500 text-black' : 'bg-green-600 text-white'}`}>
                  <div>
                    <span className="font-black text-sm">#{ord.orderNumber}</span>
                    <span className="text-[10px] block font-bold truncate max-w-[150px]">{ord.customerName}</span>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-black/20 uppercase tracking-wider">
                    {ord.status}
                  </span>
                </div>

                {/* Items List */}
                <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-64">
                  {parsedItems.map((item: any, idx: number) => (
                    <div key={idx} className="border-b border-white/5 pb-2">
                      <div className="flex justify-between items-start font-black text-sm">
                        <span className="text-white">
                          <span className="text-orange-400">{item.quantity || 1}x</span> {item.name}
                        </span>
                      </div>

                      {/* Customization Details (Size, Crust, Drink) */}
                      {(item.selectedSize || item.selectedCrust) && (
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Size: <span className="text-amber-300 font-bold">{item.selectedSize || 'Regular'}</span> | 
                          Crust: <span className="text-amber-300 font-bold">{item.selectedCrust || 'Hand Tossed'}</span>
                        </p>
                      )}

                      {/* Attached Side/Drink */}
                      {item.pairedBeverage && (
                        <p className="text-[10px] text-orange-300 font-semibold">
                          + Drink: {item.pairedBeverage.name}
                        </p>
                      )}
                      {item.pairedDessert && (
                        <p className="text-[10px] text-pink-300 font-semibold">
                          + Dessert: {item.pairedDessert.name}
                        </p>
                      )}
                    </div>
                  ))}

                  {/* Cooking Instructions */}
                  {(ord.specialInstructions || ord.address || ord.customerAddress) && (
                    <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded-xl text-[11px] text-amber-300">
                      ⚠️ Note: {ord.specialInstructions || `Delivery to ${ord.address || ord.customerAddress}`}
                    </div>
                  )}
                </div>

                {/* Chef Action Button */}
                <div className="p-3 border-t border-white/10 bg-black/40">
                  <button
                    onClick={() => updateOrderStatus(ord.id, 'PREPARED')}
                    className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>✅</span> MARK FOOD READY (DISPATCH RIDER)
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
