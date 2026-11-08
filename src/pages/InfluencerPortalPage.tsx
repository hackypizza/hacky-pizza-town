'use client';

import React, { useState, useEffect } from 'react';

export default function InfluencerPortalPage() {
  const [partner, setPartner] = useState<any | null>(null);
  const [stats, setStats] = useState<any | null>(null);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [upiInput, setUpiInput] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Check saved session
  useEffect(() => {
    const saved = localStorage.getItem('hacky_affiliate_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPartner(parsed);
        fetchStats(parsed.email);
      } catch {}
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/affiliate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'LOGIN', email, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('hacky_affiliate_user', JSON.stringify(data.user));
        setPartner(data.user);
        fetchStats(data.user.email);
      } else {
        alert(data.message || 'Login fail hua!');
      }
    } catch {
      alert('Network error: Server tak request nahi pahunchi');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (userEmail: string) => {
    try {
      const res = await fetch(`/api/affiliate?email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setCoupons(data.coupons || []);
        setOrders(data.orders || []);
        setUpiInput(data.user.payoutUpi || '');
      }
    } catch (e) {}
  };

  const handleUpdateUpi = async () => {
    if (!upiInput) return alert('UPI ID bharein');
    await fetch('/api/affiliate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'UPDATE_UPI', email: partner.email, upi: upiInput })
    });
    alert('UPI ID update ho gayi!');
  };

  const handleLogout = () => {
    localStorage.removeItem('hacky_affiliate_user');
    setPartner(null);
    setStats(null);
    setCoupons([]);
    setOrders([]);
  };

  const copyCode = (code: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const downloadReportCSV = () => {
    if (orders.length === 0) return alert('Koi orders available nahi hain!');
    const headers = ['Order Number', 'Date', 'Coupon Used', 'Bill Amount', 'Status', 'Commission Earned (INR)'];
    const rows = orders.map(o => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleDateString(),
      o.couponCode || 'N/A',
      o.totalAmount,
      o.status,
      o.status === 'DELIVERED' ? o.calculatedCommission : '0 (Pending Delivery)'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hacky_Partner_Report_${partner.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // LOGIN SCREEN
  if (!partner) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#1A1A1A] p-7 rounded-3xl border border-white/10 shadow-2xl space-y-6">
          <div className="text-center space-y-1">
            <div className="w-14 h-14 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg text-2xl">
              💸
            </div>
            <h2 className="text-2xl font-black text-white pt-2">Hacky Partner Portal</h2>
            <p className="text-xs text-gray-400 font-medium">Influencer & Multi-Coupon Affiliate Dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-gray-400 block mb-1">REGISTERED EMAIL</label>
              <input
                type="email"
                placeholder="influencer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#262626] border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 block mb-1">PASSWORD</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#262626] border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl text-xs font-black shadow-lg shadow-orange-600/30 transition-all disabled:opacity-50"
            >
              {loading ? 'AUTHENTICATING...' : 'ACCESS PARTNER DASHBOARD →'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Active coupon codes list (from coupons array, falling back to partner.couponCode if array empty)
  const displayCoupons = coupons.length > 0 ? coupons : (partner.couponCode ? [{ code: partner.couponCode, discountValue: 10, commissionPercent: partner.commissionPercent || 10, applicableType: 'ALL' }] : []);

  // LOGGED IN DASHBOARD
  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white p-4 sm:p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Header Card */}
        <div className="bg-[#181818] p-5 sm:p-6 rounded-3xl border border-white/10 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Active Partner</span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">{partner.name}</h1>
            <p className="text-xs text-gray-400">
              Default Commission Slab: <span className="text-orange-400 font-black">{partner.commissionPercent}%</span> • {displayCoupons.length} Active Coupon(s)
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-xl text-xs font-bold transition-all"
          >
            Logout
          </button>
        </div>

        {/* 1-to-Many Coupons List with 1-Click Copy */}
        <div className="bg-[#181818] p-4 sm:p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-orange-400 uppercase tracking-wider">
              🎟️ Your Active Coupon Codes ({displayCoupons.length})
            </span>
            <span className="text-[11px] text-gray-400">Click to copy code for your audience</span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {displayCoupons.map((cpn: any) => {
              const code = cpn.code;
              const isCopied = copiedCode === code;
              return (
                <div
                  key={cpn.id || code}
                  onClick={() => copyCode(code)}
                  className="px-3.5 py-2.5 bg-[#252525] hover:bg-[#2c2c2c] border border-white/10 hover:border-orange-500 rounded-xl cursor-pointer transition-all flex items-center gap-3 group"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-orange-400">{code}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-300 font-bold">
                        {cpn.discountValue}% OFF
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      Earn: {cpn.commissionPercent || partner.commissionPercent || 10}% Commission • {cpn.applicableType || 'ALL'}
                    </span>
                  </div>

                  <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${
                    isCopied ? 'bg-green-500 text-black' : 'bg-white/10 text-gray-300 group-hover:bg-orange-500 group-hover:text-black'
                  } transition-all`}>
                    {isCopied ? 'COPIED!' : 'COPY'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4 Cumulative Performance Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#181818] p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-gray-400 block uppercase">Settled Earnings</span>
            <span className="text-2xl font-black text-green-400">₹{stats?.settledEarning ?? 0}</span>
            <p className="text-[10px] text-gray-500 mt-1">Delivered orders only</p>
          </div>

          <div className="bg-[#181818] p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-gray-400 block uppercase">Pending Payout</span>
            <span className="text-2xl font-black text-amber-400">₹{stats?.pendingEarning ?? 0}</span>
            <p className="text-[10px] text-gray-500 mt-1">Order cooking/delivery me hai</p>
          </div>

          <div className="bg-[#181818] p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-gray-400 block uppercase">Delivered Orders</span>
            <span className="text-2xl font-black text-white">{stats?.deliveredOrdersCount ?? 0}</span>
            <p className="text-[10px] text-gray-500 mt-1">Total {stats?.totalOrdersCount ?? 0} checkouts</p>
          </div>

          <div className="bg-[#181818] p-4 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-gray-400 block uppercase">Total Sales Generated</span>
            <span className="text-2xl font-black text-orange-400">₹{stats?.totalSalesDelivered ?? 0}</span>
            <p className="text-[10px] text-gray-500 mt-1">Across all active coupons</p>
          </div>
        </div>

        {/* Payout Bank / UPI Setting */}
        <div className="bg-[#181818] p-4 sm:p-5 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-black text-white">💰 Payout Settlement UPI ID</h4>
            <p className="text-[11px] text-gray-400">Store admin is UPI par aapki earnings bhejega.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="e.g. mobile@upi"
              value={upiInput}
              onChange={(e) => setUpiInput(e.target.value)}
              className="bg-[#242424] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500 flex-1 sm:w-60"
            />
            <button
              onClick={handleUpdateUpi}
              className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-black"
            >
              SAVE UPI
            </button>
          </div>
        </div>

        {/* Orders History & Report Download */}
        <div className="bg-[#181818] p-5 sm:p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-orange-400">
                Detailed Order Breakdown
              </h3>
              <p className="text-[11px] text-gray-400">Har order ka live status, used coupon, aur commission breakdown</p>
            </div>

            <button
              onClick={downloadReportCSV}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all"
            >
              📥 Download CSV Report
            </button>
          </div>

          {orders.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-8">Abhi tak kisi customer ne aapke coupons use nahi kiye hain.</p>
          ) : (
            <div className="space-y-2">
              {orders.map((ord: any) => {
                const isDelivered = ord.status === 'DELIVERED';
                return (
                  <div
                    key={ord.id}
                    className="flex flex-wrap items-center justify-between p-3.5 bg-[#222222] rounded-2xl border border-white/5 gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs text-white">#{ord.orderNumber}</span>
                        {ord.couponCode && (
                          <span className="px-2 py-0.5 text-[9px] font-black rounded-md bg-purple-500/20 text-purple-300">
                            🎟️ {ord.couponCode}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 text-[9px] font-black rounded-full uppercase ${
                          isDelivered ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {ord.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {new Date(ord.createdAt).toLocaleDateString()} • Bill: ₹{ord.totalAmount}
                      </p>
                    </div>

                    <div className="text-right">
                      {isDelivered ? (
                        <div>
                          <span className="text-xs font-black text-green-400">+₹{ord.calculatedCommission}</span>
                          <span className="text-[9px] text-gray-500 block">Settled to Wallet</span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-xs font-black text-amber-400">₹{ord.calculatedCommission}</span>
                          <span className="text-[9px] text-gray-500 block">Pending Delivery</span>
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
    </div>
  );
}
