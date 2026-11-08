'use client';

import React, { useState, useEffect } from 'react';

// Haversine calculation for exact GPS distance
function getDistKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return Number((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
}

export const DirectBranchBanner = () => {
  const [branches, setBranches] = useState<any[]>([]);
  const [activeBranch, setActiveBranch] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Fallback initial default branches if API takes a second
  const fallbackBranches = [
    { id: 'br_default', name: 'Hacky Pizza Town (Main)', city: 'Mahmudabad', address: 'Ramkund Chauraha, Paitepur Road', phone: '8081402378', latitude: 27.2894, longitude: 81.1278, deliveryRadiusKm: 15 }
  ];

  const loadBranches = async () => {
    try {
      const res = await fetch('/api/branches');
      const data = await res.json();
      if (data.success && Array.isArray(data.branches) && data.branches.length > 0) {
        setBranches(data.branches);
        const savedId = typeof window !== 'undefined' ? localStorage.getItem('hacky_selected_branch_id') : null;
        const found = data.branches.find((b: any) => b.id === savedId) || data.branches[0];
        setActiveBranch(found);
        if (!savedId) setShowModal(true); // First visit popup
      } else {
        setBranches(fallbackBranches);
        setActiveBranch(fallbackBranches[0]);
      }
    } catch {
      setBranches(fallbackBranches);
      setActiveBranch(fallbackBranches[0]);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const triggerGps = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      if (typeof window !== 'undefined') alert('GPS unsupported');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const uLat = pos.coords.latitude;
        const uLng = pos.coords.longitude;
        let best = branches[0];
        let minD = 999999;

        const updated = branches.map((b) => {
          const d = getDistKm(uLat, uLng, Number(b.latitude || 27.2894), Number(b.longitude || 81.1278));
          if (d < minD) { minD = d; best = { ...b, distanceKm: d }; }
          return { ...b, distanceKm: d };
        });

        setBranches(updated);
        setActiveBranch(best);
        try {
          localStorage.setItem('hacky_selected_branch_id', best.id);
          localStorage.setItem('hacky_selected_branch_name', best.name);
          localStorage.setItem('hacky_selected_branch_dist', String(best.distanceKm));
        } catch (_) {}
        setIsLocating(false);
        setShowModal(false);
      },
      () => {
        setIsLocating(false);
        if (typeof window !== 'undefined') {
          alert('GPS Permission Denied. Kripya neeche di gayi list se branch chunein.');
        }
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  const selectStore = (b: any) => {
    setActiveBranch(b);
    try {
      localStorage.setItem('hacky_selected_branch_id', b.id);
      localStorage.setItem('hacky_selected_branch_name', b.name);
    } catch (_) {}
    setShowModal(false);
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <>
      {/* Top Deliver Bar (Replacing old motipur header) */}
      <div className="bg-[#5B0E14] text-white px-4 py-2.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-orange-400 text-sm">📍</span>
          <div>
            <span className="text-[10px] text-orange-200 font-bold block uppercase leading-none">Delivering From Store:</span>
            <span className="text-xs font-black text-white">{activeBranch ? activeBranch.name : 'Loading store...'}</span>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-1 bg-[#F1E194] text-[#5B0E14] font-black text-xs rounded-full shadow hover:bg-white transition-all flex items-center gap-1 cursor-pointer"
        >
          <span>Change Store</span>
          <span>▾</span>
        </button>
      </div>

      {/* Mandatory First-Open Store Selection Popup */}
      {showModal && (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFBF2] border-2 border-[#5B0E14] rounded-3xl p-5 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#5B0E14]/10 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-orange-600 tracking-wider">Hacky Fast Delivery</span>
                <h3 className="text-lg font-black text-[#5B0E14]">Apna Nearest Store Chunein</h3>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-2xl font-black text-gray-500 hover:text-black cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Auto GPS Detection Button */}
            <button
              onClick={triggerGps}
              disabled={isLocating}
              className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>{isLocating ? '📡' : '🎯'}</span>
              <span>{isLocating ? 'Detecting Location...' : 'ALLOW LOCATION (AUTO-DETECT GPS)'}</span>
            </button>

            <div className="text-center text-[10px] font-black text-gray-400 uppercase">-- YA STORE SELECT KAREIN --</div>

            {/* Branch Cards */}
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {(() => {
                const currentSelectedId = activeBranch?.id || (typeof window !== 'undefined' ? localStorage.getItem('hacky_selected_branch_id') : null);
                return branches.map((b: any) => {
                  // STRICT single selection check:
                  const isSelected = String(b.id) === String(currentSelectedId);

                  return (
                    <div
                      key={b.id}
                      onClick={() => selectStore(b)}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-orange-600 bg-orange-50 shadow-md ring-2 ring-orange-200'
                          : 'border-gray-200 bg-white hover:border-orange-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-[#5B0E14]">{b.name}</span>
                          <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full">
                            {b.city}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">{b.address}</p>
                        {b.distanceKm && <span className="text-[10px] text-green-700 font-bold block">{b.distanceKm} km away</span>}
                      </div>

                      {/* Render tick ONLY if actively selected */}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                        isSelected 
                          ? 'bg-orange-600 text-white' 
                          : 'border border-gray-300 text-transparent'
                      }`}>
                        {isSelected ? '✓' : ''}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DirectBranchBanner;
