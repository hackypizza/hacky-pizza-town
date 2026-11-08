'use client';

import React, { useState, useEffect, useRef } from 'react';
import { orderAlertService } from '../lib/audioAlert';
import { restaurantBuzzer } from '../lib/buzzer';
import { fetchLiveOrdersDirect } from '../lib/neonClient';

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

export default function ManagerPage() {
  const [managerSession, setManagerSession] = useState<StaffSession | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSirenActive, setIsSirenActive] = useState(false);

  // Audio refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const sirenIntervalRef = useRef<any>(null);
  const policeAudioRef = useRef<HTMLAudioElement | null>(null);
  const isAlarmPlayingRef = useRef(false);

  // Track known order IDs for this branch to prevent ringing on initial load
  const knownOrderIds = useRef<Set<string>>(new Set());
  const isFirstFetchDone = useRef<boolean>(false);

  // Load session from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hacky_manager_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.role === 'STORE_MANAGER' && parsed?.branchId) {
          setManagerSession(parsed);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    const audio = new Audio('https://actions.google.com/sounds/v1/emergency/emergency_siren_short_burst.ogg');
    audio.loop = true;
    policeAudioRef.current = audio;
    return () => {
      audio.pause();
    };
  }, []);

  // Unlock Audio on First User Interaction
  useEffect(() => {
    const unlock = () => {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioContextRef.current) audioContextRef.current = new AudioCtx();
      if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume();
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('click', unlock);
    window.addEventListener('touchstart', unlock);
    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
    };
  }, []);

  const startPoliceSiren = () => {
    restaurantBuzzer.startAlert();
    orderAlertService.playAlarm();
    if (isAlarmPlayingRef.current) return;
    isAlarmPlayingRef.current = true;
    setIsSirenActive(true);

    if (policeAudioRef.current) {
      policeAudioRef.current.currentTime = 0;
      policeAudioRef.current.play().catch(() => {});
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioContextRef.current) audioContextRef.current = new AudioCtx();
      if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume();

      const osc = audioContextRef.current.createOscillator();
      const gain = audioContextRef.current.createGain();
      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.35, audioContextRef.current.currentTime);
      osc.connect(gain);
      gain.connect(audioContextRef.current.destination);
      osc.start();
      oscRef.current = osc;

      let up = true;
      sirenIntervalRef.current = setInterval(() => {
        if (!audioContextRef.current || !oscRef.current) return;
        const now = audioContextRef.current.currentTime;
        oscRef.current.frequency.exponentialRampToValueAtTime(up ? 1250 : 650, now + 0.45);
        up = !up;
      }, 500);
    } catch (e) {}

    if ('vibrate' in navigator) navigator.vibrate([600, 200, 600, 200, 900]);
  };

  const stopPoliceSiren = () => {
    restaurantBuzzer.stopAlert();
    orderAlertService.stopAlarm();
    isAlarmPlayingRef.current = false;
    setIsSirenActive(false);

    if (policeAudioRef.current) {
      policeAudioRef.current.pause();
      policeAudioRef.current.currentTime = 0;
    }
    if (sirenIntervalRef.current) {
      clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = null;
    }
    if (oscRef.current) {
      try {
        oscRef.current.stop();
        oscRef.current.disconnect();
      } catch (e) {}
      oscRef.current = null;
    }
    if ('vibrate' in navigator) navigator.vibrate(0);
  };

  // Fetch branch-scoped orders
  const fetchOrders = async () => {
    if (!managerSession?.branchId) return;

    try {
      let ordersList: any[] = [];
      try {
        ordersList = await fetchLiveOrdersDirect(managerSession.branchId);
      } catch {
        const url = `/api?action=GET_BRANCH_ORDERS&branchId=${encodeURIComponent(managerSession.branchId)}&ts=${Date.now()}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) ordersList = data.orders;
      }

      if (Array.isArray(ordersList)) {
        const incomingOrders = ordersList.filter(
          (o: any) => o.status === 'PLACED' || o.status === 'PENDING'
        );

        if (!isFirstFetchDone.current) {
          ordersList.forEach((o: any) => knownOrderIds.current.add(o.id));
          isFirstFetchDone.current = true;
          if (incomingOrders.length > 0) {
            startPoliceSiren();
          }
        } else {
          const brandNewOrders = incomingOrders.filter(
            (o: any) => !knownOrderIds.current.has(o.id)
          );

          if (brandNewOrders.length > 0 || incomingOrders.length > 0) {
            startPoliceSiren();
            incomingOrders.forEach((o: any) => knownOrderIds.current.add(o.id));
          } else {
            stopPoliceSiren();
          }
        }

        if (incomingOrders.length === 0) {
          stopPoliceSiren();
        }

        setOrders(ordersList);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Reset polling when manager changes
  useEffect(() => {
    if (!managerSession?.branchId) return;

    knownOrderIds.current.clear();
    isFirstFetchDone.current = false;
    setLoading(true);
    fetchOrders();

    const interval = setInterval(fetchOrders, 3000);
    return () => {
      clearInterval(interval);
      stopPoliceSiren();
    };
  }, [managerSession?.branchId]);

  // Handle Login
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
          role: 'STORE_MANAGER'
        })
      });
      const data = await res.json();
      if (data.success && data.staff) {
        localStorage.setItem('hacky_manager_session', JSON.stringify(data.staff));
        setManagerSession(data.staff);
        setEmail('');
        setPassword('');
      } else {
        setLoginError(data.error || 'Login fail hua. Kripya credentials check karein.');
      }
    } catch (err: any) {
      setLoginError('Network Error: ' + err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    stopPoliceSiren();
    localStorage.removeItem('hacky_manager_session');
    setManagerSession(null);
    setOrders([]);
    knownOrderIds.current.clear();
    isFirstFetchDone.current = false;
  };

  const updateStatus = async (orderId: string, status: string) => {
    stopPoliceSiren();
    await fetch('/api/orders/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status }),
    });
    fetchOrders();
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#FFFBF2] flex items-center justify-center p-4">
        <p className="font-bold text-[#502314] text-sm animate-pulse">Checking manager credentials...</p>
      </div>
    );
  }

  // ---------------------------------------------------------------------
  // 1. STORE MANAGER LOGIN VIEW
  // ---------------------------------------------------------------------
  if (!managerSession) {
    return (
      <div className="min-h-screen bg-[#FFFBF2] text-[#502314] flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white border-2 border-[#502314] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-inner border border-orange-200">
              🚨
            </div>
            <h1 className="text-2xl font-black text-[#502314]">Store Manager Portal</h1>
            <p className="text-xs text-gray-500 font-medium">
              Login to monitor incoming orders and siren alerts strictly for your assigned branch.
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
                Manager Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manager@hackypizza.com"
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
              {loginLoading ? 'Verifying Branch Access...' : '🔐 Login as Store Manager'}
            </button>
          </form>

          {/* Quick Demo Logins for Testing */}
          <div className="pt-4 border-t border-gray-200 space-y-2">
            <p className="text-[11px] font-black text-gray-400 text-center uppercase tracking-wider">
              ⚡ Quick Fill Branch Credentials
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('manager@hackypizza.com');
                  setPassword('password123');
                }}
                className="p-2.5 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl text-left text-xs transition cursor-pointer"
              >
                <div className="font-bold text-[#EA580C]">🏢 Mahmudabad Main Branch Manager</div>
                <div className="text-[10px] text-gray-500 font-mono">manager@hackypizza.com • password123</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('haridwar.manager@hackypizza.com');
                  setPassword('password123');
                }}
                className="p-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-left text-xs transition cursor-pointer"
              >
                <div className="font-bold text-purple-700">🏢 Shivalik Nagar Haridwar Manager</div>
                <div className="text-[10px] text-gray-500 font-mono">haridwar.manager@hackypizza.com • password123</div>
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
  // 2. ACTIVE STORE MANAGER DASHBOARD
  // ---------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#FFFBF2] text-[#502314] p-4 sm:p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Branch Header */}
        <div className="bg-white border-2 border-[#502314] p-4 sm:p-5 rounded-3xl shadow-md flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Branch Active • {managerSession.branchCity || 'Live'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#502314] mt-1 flex items-center gap-2">
              🚨 {managerSession.branchName}
            </h1>
            <p className="text-xs font-semibold text-gray-600">
              Manager: <strong className="text-[#EA580C]">{managerSession.name}</strong> ({managerSession.email})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchOrders}
              className="px-3.5 py-2 bg-[#502314] hover:bg-[#3b170c] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow"
            >
              🔄 Refresh Orders
            </button>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              🚪 Switch Staff
            </button>
          </div>
        </div>

        {/* Siren Alert Strip if Active */}
        {isSirenActive && (
          <div className="p-4 bg-red-600 text-white rounded-2xl shadow-xl flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-black text-sm uppercase tracking-wider">
                  NAYA ORDER AAYA HAI - {managerSession.branchName.toUpperCase()}
                </p>
                <p className="text-xs text-red-100">
                  Police siren baj rahi hai! Order accept karne par siren turant stop ho jayegi.
                </p>
              </div>
            </div>
            <button
              onClick={stopPoliceSiren}
              className="px-4 py-2 bg-white text-red-600 font-black text-xs uppercase rounded-xl hover:bg-red-50 cursor-pointer shadow"
            >
              MUTE SIREN 🔕
            </button>
          </div>
        )}

        {/* Order Cards */}
        {loading ? (
          <div className="text-center py-16 text-sm font-bold text-[#502314] animate-pulse">
            Orders load ho rahe hain for {managerSession.branchName}...
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-3xl p-12 text-center my-6 space-y-2">
            <span className="text-4xl block mb-1">🍕</span>
            <p className="text-base font-black text-[#502314]">Is branch par abhi koi orders nahi hain.</p>
            <p className="text-xs text-gray-500">
              Jaise hi {managerSession.branchName} ke liye naya customer order aayega, continuous alarm bajega!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((ord: any) => {
              const isPending = ord.status === 'PLACED' || ord.status === 'PENDING';
              let parsedItems = [];
              try {
                parsedItems = typeof ord.items === 'string' ? JSON.parse(ord.items) : (ord.items || []);
              } catch {
                parsedItems = [];
              }

              return (
                <div 
                  key={ord.id} 
                  className={`bg-white border-2 rounded-2xl p-4 shadow-md flex flex-col justify-between ${
                    isPending ? 'border-red-600 ring-4 ring-red-200 animate-pulse' : 'border-[#502314]'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-black text-lg text-[#502314]">#{ord.orderNumber}</span>
                      <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-full uppercase ${
                        isPending ? 'bg-red-600 text-white' : 
                        ord.status === 'ACCEPTED' ? 'bg-amber-100 text-amber-800' :
                        ord.status === 'PREPARED' || ord.status === 'READY_FOR_PICKUP' ? 'bg-purple-100 text-purple-700' :
                        ord.status === 'OUT_FOR_DELIVERY' ? 'bg-blue-100 text-blue-700' :
                        ord.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {ord.status}
                      </span>
                    </div>

                    <p className="text-xs font-black text-gray-800">{ord.customerName} - {ord.phone || ord.customerPhone}</p>
                    <p className="text-[11px] text-gray-500 mb-2">{ord.address || ord.customerAddress}</p>

                    <div className="bg-[#FFFBF2] p-2.5 rounded-xl border border-orange-100 text-xs mb-3 space-y-1">
                      {parsedItems.map((it: any, idx: number) => (
                        <div key={idx} className="flex justify-between font-bold">
                          <span>{it.quantity || 1}x {it.name}</span>
                          <span>₹{it.price || it.totalUnitPrice || ''}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between text-xs font-black mb-3">
                      <span>Total ({ord.paymentMethod || 'COD'}):</span>
                      <span className="text-base text-[#EA580C]">₹{ord.totalAmount}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t flex flex-col gap-2">
                    {isPending && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateStatus(ord.id, 'ACCEPTED')}
                          className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-black shadow cursor-pointer transition text-center"
                        >
                          ✅ ACCEPT &amp; SEND TO KITCHEN
                        </button>
                        <button
                          onClick={() => updateStatus(ord.id, 'CANCELLED')}
                          className="px-3 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-xs font-bold cursor-pointer transition"
                        >
                          REJECT
                        </button>
                      </div>
                    )}
                    {ord.status === 'ACCEPTED' && (
                      <div className="w-full text-center py-2 bg-amber-50 text-amber-800 font-bold text-xs rounded-xl border border-amber-200">
                        🍳 Sent to Kitchen KDS (Cooking)
                      </div>
                    )}
                    {(ord.status === 'PREPARING') && (
                      <button
                        onClick={() => updateStatus(ord.id, 'PREPARED')}
                        className="w-full py-2.5 bg-[#EA580C] hover:bg-orange-700 text-white rounded-xl text-xs font-black shadow cursor-pointer transition"
                      >
                        🚀 SEND TO RIDER
                      </button>
                    )}
                    {(ord.status === 'PREPARED' || ord.status === 'READY_FOR_PICKUP') && (
                      <div className="w-full text-center py-2 bg-purple-50 text-purple-700 font-bold text-xs rounded-xl border border-purple-200">
                        ⚡ Food Ready · Waiting for Rider Pickup
                      </div>
                    )}
                    {ord.status === 'OUT_FOR_DELIVERY' && (
                      <div className="w-full text-center py-2 bg-blue-50 text-blue-700 font-bold text-xs rounded-xl border border-blue-200">
                        🛵 Out for Delivery
                      </div>
                    )}
                    {ord.status === 'DELIVERED' && (
                      <div className="w-full text-center py-2 bg-green-50 text-green-700 font-bold text-xs rounded-xl border border-green-200">
                        ✅ Order Delivered
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
