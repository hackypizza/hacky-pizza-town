import React, { useState, useEffect, useRef } from 'react';
import { restaurantBuzzer } from '../lib/buzzer';
import { fetchLiveOrdersDirect } from '../lib/neonClient';

export default function StoreManagerDashboard() {
  const [managerData, setManagerData] = useState<any>(null);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const previousOrderCount = useRef(0);
  const [availableBranches, setAvailableBranches] = useState<any[]>([]);

  useEffect(() => {
    // 1. Get Logged-in Staff details
    const storedUser = localStorage.getItem('hacky_user_data') || localStorage.getItem('hacky_manager_session');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setManagerData(user);
      } catch (e) {}
    }

    // Load available branches for quick selection
    fetch('/api/branches')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.branches)) {
          setAvailableBranches(data.branches);
          if (!storedUser && data.branches.length > 0) {
            const defaultBranch = data.branches[0];
            const fallbackManager = {
              id: 'staff_mgr_auto',
              name: 'Store Manager',
              branchId: defaultBranch.id,
              branchName: defaultBranch.name,
              branchCity: defaultBranch.city
            };
            setManagerData(fallbackManager);
            localStorage.setItem('hacky_user_data', JSON.stringify(fallbackManager));
          }
        }
      })
      .catch(() => {});

    return () => {
      restaurantBuzzer.stopAlert();
    };
  }, []);

  // Unlock Audio on First Screen Touch/Click
  const enableSound = () => {
    restaurantBuzzer.startAlert();
    setTimeout(() => {
      restaurantBuzzer.stopAlert();
    }, 200);
    setAudioEnabled(true);
  };

  // Poll for Orders for THIS EXACT STORE BRANCH ONLY using Direct Neon Poller
  useEffect(() => {
    const syncManager = async () => {
      try {
        setDbError(null);
        const branchId = managerData?.branchId || (typeof window !== 'undefined' ? localStorage.getItem('hacky_manager_branch_id') || 'br_mahmudabad' : 'br_mahmudabad');
        const orders = await fetchLiveOrdersDirect(branchId);
        const pendingOrders = orders.filter((o: any) => o.status === 'PLACED');
        setActiveOrders(pendingOrders);

        // If there are unaccepted orders, ring loud browser buzzer!
        if (pendingOrders.length > 0) {
          restaurantBuzzer.startAlert();

          // Trigger Vibration for Mobile Phone
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate([400, 200, 400]);
          }
        } else {
          // Stop ringing if no pending orders
          restaurantBuzzer.stopAlert();
        }
      } catch (err: any) {
        console.error('Direct manager orders fetch error:', err);
        setDbError(err?.message || 'Database error fetching branch orders');
      }
    };

    syncManager();
    // Fast Polling every 3 seconds
    const interval = setInterval(syncManager, 3000);
    return () => {
      clearInterval(interval);
      restaurantBuzzer.stopAlert();
    };
  }, [managerData]);

  // Accept Order and Forward to KDS
  const handleAcceptOrder = async (orderId: string) => {
    try {
      const res = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_ORDER_STATUS',
          orderId: orderId,
          status: 'ACCEPTED' // Now moves directly to Kitchen KDS!
        })
      });
      const data = await res.json();
      if (data.success) {
        // Stop sound immediately if all accepted
        const remaining = activeOrders.filter(o => o.id !== orderId);
        setActiveOrders(remaining);
        if (remaining.length === 0) {
          restaurantBuzzer.stopAlert();
        }
        alert('✅ Order Accept ho gaya aur Kitchen KDS ko send kar diya gaya!');
      }
    } catch (e: any) {
      alert('Accept error: ' + e.message);
    }
  };

  const handleSwitchBranch = (b: any) => {
    const updated = {
      ...(managerData || {}),
      branchId: b.id,
      branchName: b.name,
      branchCity: b.city
    };
    setManagerData(updated);
    localStorage.setItem('hacky_user_data', JSON.stringify(updated));
    localStorage.setItem('hacky_manager_session', JSON.stringify(updated));
    localStorage.setItem('hacky_manager_branch_id', b.id);
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white p-4 sm:p-6" onClick={enableSound}>
      {/* Floating Alert Banner in UI when new order arrives */}
      {activeOrders.length > 0 && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] bg-red-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce border-2 border-amber-300">
          <span className="text-2xl animate-spin">🔔</span>
          <div>
            <h4 className="text-xs font-black">Naya Order Aaya Hai! ({activeOrders.length} Pending)</h4>
            <p className="text-[10px] text-amber-200">Kripya order accept karke KDS ko forward karein.</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              restaurantBuzzer.stopAlert();
            }}
            className="bg-white text-red-600 px-3 py-1 rounded-xl text-xs font-black cursor-pointer shadow-md"
          >
            MUTE ALARM
          </button>
        </div>
      )}
      {/* TOP STATUS BAR */}
      <div className="bg-[#1F1F1F] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Store Manager Console</span>
          <h1 className="text-lg font-black text-white flex items-center gap-2">
            🏪 {managerData?.branchName || 'Assigned Branch'} 
            <span className="text-xs bg-orange-600/30 text-orange-400 border border-orange-500/40 px-2 py-0.5 rounded-full font-mono">
              ID: {managerData?.branchId || 'Not Logged In'}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {availableBranches.length > 1 && (
            <select
              value={managerData?.branchId || ''}
              onChange={(e) => {
                const target = availableBranches.find(b => b.id === e.target.value);
                if (target) handleSwitchBranch(target);
              }}
              className="bg-black/60 border border-white/20 text-xs text-orange-400 font-bold px-3 py-1.5 rounded-xl cursor-pointer"
            >
              {availableBranches.map((b: any) => (
                <option key={b.id} value={b.id}>
                  Switch Store: {b.name} ({b.city})
                </option>
              ))}
            </select>
          )}

          <button 
            onClick={enableSound}
            className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer shadow-md flex items-center gap-1.5 transition ${
              audioEnabled 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                : 'bg-amber-500 hover:bg-amber-600 text-black animate-pulse'
            }`}
          >
            {audioEnabled ? '🔔 Sound Active (Test Sound)' : '🔔 Enable Sound'}
          </button>

          <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></span>
            <span className="text-xs font-bold text-gray-300">Live Branch Radar</span>
          </div>
        </div>
      </div>

      {dbError && (
        <div className="mt-4 p-4 bg-red-600/30 border-2 border-red-500 rounded-2xl text-red-200 text-xs font-bold animate-pulse space-y-1">
          <span className="font-black text-white text-sm block">⚠️ Database Error:</span>
          <p className="font-mono text-red-100">{dbError}</p>
        </div>
      )}

      {/* PENDING ORDERS LIST */}
      <div className="mt-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-black text-amber-300 uppercase tracking-wide">
            🚨 Incoming Orders Requiring Action ({activeOrders.length})
          </h2>
        </div>

        {activeOrders.length === 0 ? (
          <div className="text-center py-20 bg-[#1A1A1A] rounded-3xl border border-white/5 space-y-2">
            <span className="text-4xl block">🍕</span>
            <h3 className="text-sm font-black text-gray-300">Sabhi Orders Clear Hain!</h3>
            <p className="text-xs text-gray-500">Jab is store ke liye koi naya order aayega, yahan loud ring ke sath alert aayega.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeOrders.map((ord: any) => (
              <div 
                key={ord.id} 
                className="bg-[#242424] border-2 border-orange-500 rounded-3xl p-5 shadow-2xl relative overflow-hidden animate-bounce-short"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="bg-orange-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                      NEW ORDER • #{ord.orderNumber}
                    </span>
                    <h3 className="text-base font-black text-white mt-2">{ord.customerName}</h3>
                    <p className="text-xs text-gray-400 font-mono">📞 {ord.customerPhone || ord.phone}</p>
                    <p className="text-xs text-gray-300 mt-1">📍 {ord.deliveryAddress || ord.customerAddress || ord.address}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-amber-400">₹{ord.totalAmount}</span>
                    <span className="text-[10px] block text-gray-400 uppercase font-bold">{ord.paymentMethod || 'COD'}</span>
                  </div>
                </div>

                {/* Items Box */}
                <div className="bg-black/40 rounded-2xl p-3 border border-white/5 space-y-1.5 my-3">
                  {(typeof ord.items === 'string' ? JSON.parse(ord.items) : (ord.items || [])).map((it: any, i: number) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="font-bold text-gray-200">
                        {it.quantity || 1}x {it.name} {it.selectedSize ? `(${it.selectedSize})` : ''}
                      </span>
                      <span className="text-orange-400 font-bold">₹{it.price || it.totalUnitPrice || ''}</span>
                    </div>
                  ))}
                </div>

                {/* ACTION BUTTON */}
                <button
                  onClick={() => handleAcceptOrder(ord.id)}
                  className="w-full py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-black text-xs rounded-2xl shadow-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  ✓ ACCEPT &amp; SEND TO KITCHEN KDS
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
