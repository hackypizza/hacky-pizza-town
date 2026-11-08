'use client';

import React, { useState } from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<'signup' | 'login'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    setMessage('');
    setIsError(false);

    if (!email || !email.includes('@')) {
      setIsError(true);
      setMessage('Kripya valid email daalein.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), identifier: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setIsError(true);
        setMessage(data.error || 'OTP bhejte waqt dikkat aayi.');
      } else {
        setIsError(false);
        setMessage('OTP aapki email par bhej diya gaya hai!');
        setOtpSent(true);
      }
    } catch (err: any) {
      setIsError(true);
      setMessage(`Network Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setIsError(true);
      setMessage('Email address enter karein.');
      return;
    }

    if (tab === 'signup' && (!otp || otp.length < 6)) {
      setIsError(true);
      setMessage('6-digit OTP code daalein.');
      return;
    }

    setLoading(true);
    try {
      if (tab === 'signup') {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name || 'Pizza Lover',
            email: cleanEmail,
            phone,
            address,
            otp: otp.trim(),
            password: password || 'Hacky@123',
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setIsError(true);
          setMessage(data.error || 'Verification fail hua.');
        } else {
          setMessage('Welcome to Hacky Pizza! ₹50 Bonus Credited.');
          if (onSuccess) onSuccess(data.user);
          setTimeout(() => onClose(), 1500);
        }
      } else {
        // Login flow via Unified API Gateway
        const loginPayload = {
          action: 'LOGIN',
          identifier: cleanEmail,
          email: cleanEmail,
          password: password.trim(),
          otp: otp ? otp.trim() : undefined,
        };

        let data = null;
        try {
          const res = await fetch('/api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginPayload),
          });
          data = await res.json().catch(() => null);
        } catch {}

        // Fallback to /api/auth/login if /api didn't respond
        if (!data) {
          try {
            const fallbackRes = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(loginPayload),
            });
            data = await fallbackRes.json().catch(() => null);
          } catch {}
        }

        if (!data) {
          setIsError(true);
          setMessage('Server connection error. Kripya dobara koshish karein.');
          return;
        }

        if (!data.success) {
          setIsError(true);
          setMessage(data.message || data.error || 'Login credentials galat hain!');
        } else {
          const userRole = data.user?.role || data.userType || 'CUSTOMER';
          try {
            localStorage.setItem('hacky_user_token', data.user.id);
            localStorage.setItem('hacky_user_role', userRole);
            localStorage.setItem('hacky_user_data', JSON.stringify(data.user));
          } catch (_) {}

          setMessage(`Login safalta-poorvak ho gaya! (${data.user.name || 'User'})`);
          if (onSuccess) onSuccess(data.user);
          setTimeout(() => {
            onClose();
            if (userRole === 'SUPER_ADMIN') {
              window.location.href = '/admin';
            } else if (userRole === 'STORE_MANAGER' || userRole === 'MANAGER') {
              window.location.href = '/manager';
            } else if (userRole === 'KITCHEN_STAFF' || userRole === 'KITCHEN') {
              window.location.href = '/kds';
            } else if (userRole === 'RIDER') {
              window.location.href = '/rider';
            } else {
              window.location.reload();
            }
          }, 1000);
        }
      }
    } catch (err: any) {
      setIsError(true);
      setMessage(`Login network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-[#FFFBF2] rounded-2xl shadow-2xl border-2 border-[#502314] overflow-hidden p-6 text-gray-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl font-bold text-gray-500 hover:text-red-600"
        >
          &times;
        </button>

        <div className="text-center mb-4">
          <h2 className="text-2xl font-black text-[#502314]">🍕 Hacky Pizza Town</h2>
          <div className="mt-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white py-2 px-3 rounded-xl text-xs font-bold shadow">
            🎁 Sign Up karke ₹50 Cashback payein aur turant redeem karein!
          </div>
        </div>

        <div className="flex border-b border-gray-300 mb-4">
          <button
            onClick={() => { setTab('signup'); setMessage(''); setIsError(false); }}
            className={`flex-1 py-2 font-bold text-sm text-center ${
              tab === 'signup' ? 'text-[#502314] border-b-2 border-[#502314]' : 'text-gray-400'
            }`}
          >
            SIGN UP (+₹50 BONUS)
          </button>
          <button
            onClick={() => { setTab('login'); setMessage(''); setIsError(false); }}
            className={`flex-1 py-2 font-bold text-sm text-center ${
              tab === 'login' ? 'text-[#502314] border-b-2 border-[#502314]' : 'text-gray-400'
            }`}
          >
            LOG IN
          </button>
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg text-xs mb-3 font-medium ${
              isError ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-green-100 text-green-700 border border-green-300'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={otpSent || (tab === 'login' && (password || otp)) ? handleAuthSubmit : (e) => { e.preventDefault(); handleSendOtp(); }} className="space-y-3">
          {tab === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-[#502314] uppercase">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aapka Naam"
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#502314] uppercase">
              {tab === 'signup' ? 'Email Address (Permanent Gmail) *' : 'Email ya Registered Phone *'}
            </label>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="amanvermaa50@gmail.com"
                disabled={otpSent && tab === 'signup'}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white disabled:bg-gray-100"
              />
              {!otpSent && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="px-4 py-2 bg-[#502314] hover:bg-[#3d1a0e] text-white rounded-lg font-bold text-xs whitespace-nowrap"
                >
                  {loading ? 'Sending...' : 'SEND OTP'}
                </button>
              )}
            </div>
          </div>

          {tab === 'login' && !otpSent && (
            <div>
              <label className="block text-xs font-bold text-[#502314] uppercase">Password (Optional if logging in via OTP)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password or use OTP"
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              />
            </div>
          )}

          {otpSent && (
            <div>
              <label className="block text-xs font-bold text-[#502314] uppercase">Enter 6-Digit Email OTP *</label>
              <input
                type="text"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="w-full mt-1 px-3 py-2 text-center text-xl tracking-widest font-bold border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              />
            </div>
          )}

          {tab === 'signup' && otpSent && (
            <>
              <div>
                <label className="block text-xs font-bold text-[#502314] uppercase">Mobile Number (Optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#502314] uppercase">Mahmudabad Delivery Address *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Near Clock Tower, Ramkund Chauraha"
                  className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3 bg-[#EA580C] hover:bg-[#c2410c] text-white font-bold rounded-xl shadow-lg transition-all"
          >
            {loading
              ? 'Verifying...'
              : tab === 'signup'
              ? 'CREATE ACCOUNT & CLAIM ₹50 BONUS'
              : 'LOG IN NOW'}
          </button>
        </form>
      </div>
    </div>
  );
}
