'use client';

import React, { useState, useEffect, useRef } from 'react';

interface StaffSession {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  branchId: string;
  branchName: string;
  branchCity?: string;
}

export default function RiderPage() {
  const [riderSession, setRiderSession] = useState<StaffSession | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Orders & Sound
  const [orders, setOrders] = useState<any[]>([]);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check saved rider session
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hacky_rider_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.role === 'RIDER' && parsed?.branchId) {
          setRiderSession(parsed);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.loop = true;
    audioRef.current = audio;
    return () => {
      audio.pause();
    };
  }, []);

  const enableSound = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        audioRef.current?.pause();
        if (audioRef.current) audioRef.current.currentTime = 0;
        setAudioUnlocked(true);
        alert('🛵 Rider alert bell active!');
      });
    }
  };

  const fetchRiderOrders = async () => {
    if (!riderSession?.branchId) return;

    try {
      const url = `/api/orders/list?branchId=${encodeURIComponent(riderSession.branchId)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        // Filter orders that need delivery for THIS branch
        const deliveryOrders = data.orders.filter(
          (o: any) => (o.status === 'PREPARED' || o.orderStatus === 'PREPARED' ||
                       o.status === 'READY_FOR_PICKUP' || o.orderStatus === 'READY_FOR_PICKUP' || 
                       o.status === 'OUT_FOR_DELIVERY' || o.orderStatus === 'OUT_FOR_DELIVERY')
        );
        
        const hasUnacceptedPickup = deliveryOrders.some(
          (o: any) => (o.status === 'PREPARED' || o.orderStatus === 'PREPARED' ||
                       o.status === 'READY_FOR_PICKUP' || o.orderStatus === 'READY_FOR_PICKUP')
        );

        if (hasUnacceptedPickup && audioUnlocked) {
          audioRef.current?.play().catch(() => {});
        } else {
          audioRef.current?.pause();
        }

        setOrders(deliveryOrders);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!riderSession?.branchId) return;

    fetchRiderOrders();
    const timer = setInterval(fetchRiderOrders, 3000);
    return () => {
      clearInterval(timer);
      if (audioRef.current) audioRef.current.pause();
    };
  }, [riderSession?.branchId, audioUnlocked]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'STAFF_LOGIN',
          email,
          password,
          role: 'RIDER'
        })
      });
      const data = await res.json();
      if (data.success && data.staff) {
        localStorage.setItem('hacky_rider_session', JSON.stringify(data.staff));
        setRiderSession(data.staff);
        setEmail('');
        setPassword('');
      } else {
        setLoginError(data.error || 'Login fail hua. Kripya rider credentials check karein.');
      }
    } catch (err: any) {
      setLoginError('Network Error: ' + err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    if (audioRef.current) audioRef.current.pause();
    localStorage.removeItem('hacky_rider_session');
    setRiderSession(null);
    setOrders([]);
  };

  const handleRiderAction = async (orderId: string, nextStatus: string) => {
    if (audioRef.current) audioRef.current.pause();
    await fetch('/api/orders/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        status: nextStatus,
        riderId: riderSession?.id,
        riderName: riderSession?.name,
        riderPhone: riderSession?.phone
      })
    });
    fetchRiderOrders();
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#FFFBF2] flex items-center justify-center p-4">
        <p className="font-bold text-[#502314] text-sm animate-pulse">Checking rider credentials...</p>
      </div>
    );
  }

  // ---------------------------------------------------------------------
  // 1. RIDER LOGIN VIEW
  // ---------------------------------------------------------------------
  if (!riderSession) {
    return (
      <div className="min-h-screen bg-[#FFFBF2] text-[#502314] flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white border-2 border-[#502314] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-inner border border-orange-200">
              🛵
            </div>
            <h1 className="text-2xl font-black text-[#502314]">Hacky Rider Fleet</h1>
            <p className="text-xs text-gray-500 font-medium">
              Login to accept and deliver orders for your assigned branch kitchen.
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-[#502314] mb-1 uppercase tracking-wider">
                Rider Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rider@hackypizza.com"
                className="w-full p-3 text-xs bg-[#FFFBF2] border-2 border-[#502314]/20 rounded-xl focus:border-[#EA580C] focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-[#502314] mb-1 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 text-xs bg-[#FFFBF2] border-2 border-[#502314]/20 rounded-xl focus:border-[#EA580C] focus:outline-none font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-[#EA580C] hover:bg-orange-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition cursor-pointer disabled:opacity-50"
            >
              {loginLoading ? 'Authenticating Rider...' : '🛵 Login to Fleet'}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-gray-200 space-y-2">
            <p className="text-[11px] font-black text-gray-400 text-center uppercase tracking-wider">
              ⚡ Quick Fill Rider Credentials
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('rider@hackypizza.com');
                  setPassword('password123');
                }}
                className="p-2.5 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl text-left text-xs transition cursor-pointer"
              >
                <div className="font-bold text-[#EA580C]">🛵 Mahmudabad Main Branch Rider</div>
                <div className="text-[10px] text-gray-500 font-mono">rider@hackypizza.com • password123</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('haridwar.rider@hackypizza.com');
                  setPassword('password123');
                }}
                className="p-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-left text-xs transition cursor-pointer"
              >
                <div className="font-bold text-purple-700">🛵 Shivalik Nagar Haridwar Rider</div>
                <div className="text-[10px] text-gray-500 font-mono">haridwar.rider@hackypizza.com • password123</div>
              </button>
            </div>
          </div>

          <div className="text-center">
            <a href="/" className="text-xs text-gray-400 hover:text-[#502314] font-bold">
              ← Return to Storefront
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------
  // 2. ACTIVE RIDER DASHBOARD
  // ---------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#FFFBF2] text-[#502314] p-4">
      <div className="max-w-md mx-auto space-y-4">
        
        {/* Top Rider Bar */}
        <div className="bg-white border-2 border-[#502314] p-4 rounded-2xl shadow-md space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl">🛵</span>
                <h1 className="text-lg font-black text-[#502314]">{riderSession.name}</h1>
              </div>
              <p className="text-xs font-bold text-[#EA580C]">
                🏢 {riderSession.branchName}
              </p>
            </div>
            
            <button
              onClick={handleLogout}
              className="px-2.5 py-1 bg-red-100 text-red-700 hover:bg-red-200 text-[11px] font-bold rounded-lg cursor-pointer transition"
            >
              Exit
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <button
              onClick={enableSound}
              className={`px-3 py-1.5 rounded-xl text-xs font-black shadow cursor-pointer transition ${
                audioUnlocked ? 'bg-green-600 text-white' : 'bg-[#EA580C] text-white animate-pulse'
              }`}
            >
              {audioUnlocked ? '🔊 Sound Active' : '🔔 Tap to Enable Bell'}
            </button>

            <button
              onClick={fetchRiderOrders}
              className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-[#502314] text-xs font-bold rounded-xl cursor-pointer"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Orders list */}
        {orders.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center border-2 border-dashed border-gray-300 my-4 space-y-1">
            <span className="text-3xl block mb-1">📦</span>
            <p className="font-black text-gray-700 text-sm">{riderSession.branchName}</p>
            <p className="font-bold text-gray-500 text-xs">Abhi koi delivery available nahi hai.</p>
            <p className="text-[11px] text-gray-400 mt-1">Kitchen se food ready hote hi continuous alarm bajega!</p>
          </div>
        ) : (
          orders.map((ord) => {
            const currentStatus = ord.status || ord.orderStatus;
            return (
              <div key={ord.id} className="bg-white border-2 border-[#502314] rounded-2xl p-4 shadow-lg mb-3">
                <div className="flex justify-between items-center font-black text-sm mb-1">
                  <span>#{ord.orderNumber || ord.id?.slice(0, 6)}</span>
                  <span className="text-[#EA580C] text-base">₹{ord.totalAmount}</span>
                </div>
                <div className="mb-2">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    (currentStatus === 'PREPARED' || currentStatus === 'READY_FOR_PICKUP') 
                      ? 'bg-purple-100 text-purple-700 animate-pulse' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {(currentStatus === 'PREPARED' || currentStatus === 'READY_FOR_PICKUP') 
                      ? '⚡ Food Ready - Pick Up' 
                      : '🛵 Out for Delivery'}
                  </span>
                </div>
                <p className="font-black text-xs text-gray-800">{ord.customerName}</p>
                <p className="text-xs text-gray-500 mb-3">{ord.address || ord.customerAddress || 'Mahmudabad'}</p>

                <div className="flex gap-2">
                  <a
                    href={`tel:${ord.phone || ord.customerPhone || '9305938873'}`}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-xl text-xs font-black shadow transition flex items-center justify-center gap-1"
                  >
                    📞 CALL
                  </a>
                  {(currentStatus === 'PREPARED' || currentStatus === 'READY_FOR_PICKUP') && (
                    <button
                      onClick={() => handleRiderAction(ord.id, 'OUT_FOR_DELIVERY')}
                      className="flex-1 py-2.5 bg-[#EA580C] hover:bg-orange-700 text-white rounded-xl text-xs font-black shadow cursor-pointer transition text-center"
                    >
                      OUT FOR DELIVERY
                    </button>
                  )}
                  {currentStatus === 'OUT_FOR_DELIVERY' && (
                    <button
                      onClick={() => handleRiderAction(ord.id, 'DELIVERED')}
                      className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-black shadow cursor-pointer transition text-center"
                    >
                      ORDER DELIVERED
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
