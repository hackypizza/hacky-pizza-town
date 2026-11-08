'use client';

import React, { useState, useEffect } from 'react';

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

export default function BranchLocationPicker({ onBranchChange }: { onBranchChange?: (branch: any) => void } = {}) {
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<any | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const fetchBranches = async () => {
    try {
      const res = await fetch('/api/branches');
      const data = await res.json();
      if (data.success && Array.isArray(data.branches) && data.branches.length > 0) {
        setBranches(data.branches);
        const savedId = typeof window !== 'undefined' ? localStorage.getItem('hacky_selected_branch_id') : null;
        const matched = data.branches.find((b: any) => b.id === savedId);

        if (matched) {
          setSelectedBranch(matched);
          if (onBranchChange) onBranchChange(matched);
        } else {
          // If first time visit, open modal automatically!
          setSelectedBranch(data.branches[0]);
          setIsOpen(true);
          if (onBranchChange) onBranchChange(data.branches[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleDetectGPS = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGeoError('Aapke browser me GPS support nahi hai');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const uLat = pos.coords.latitude;
        const uLng = pos.coords.longitude;
        try {
          localStorage.setItem('hacky_user_gps', JSON.stringify({ lat: uLat, lng: uLng }));
        } catch (_) {}

        let closest = branches[0];
        let minDist = 999999;

        const updated = branches.map((b) => {
          const dist = calculateDistanceKm(uLat, uLng, Number(b.latitude || 27.2894), Number(b.longitude || 81.1278));
          if (dist < minDist) {
            minDist = dist;
            closest = { ...b, distanceKm: dist };
          }
          return { ...b, distanceKm: dist };
        });

        updated.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));

        setBranches(updated);
        setSelectedBranch(closest);
        try {
          localStorage.setItem('hacky_selected_branch_id', closest.id);
          localStorage.setItem('hacky_selected_branch_name', closest.name);
          localStorage.setItem('hacky_selected_branch_dist', String(closest.distanceKm));
        } catch (_) {}
        setIsLocating(false);
        setIsOpen(false);
        if (onBranchChange) onBranchChange(closest);
      },
      () => {
        setIsLocating(false);
        setGeoError('Location permission block hai. Kripya niche se branch manually chunein.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSelect = (b: any) => {
    setSelectedBranch(b);
    try {
      localStorage.setItem('hacky_selected_branch_id', b.id);
      localStorage.setItem('hacky_selected_branch_name', b.name);
    } catch (_) {}
    setIsOpen(false);
    if (onBranchChange) onBranchChange(b);
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <>
      {/* DELIVERY LOCATION HEADER PILL (Replaces static motipur) */}
      <div
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 bg-[#5B0E14]/10 hover:bg-[#5B0E14]/20 border border-[#5B0E14]/20 px-3 py-1 rounded-full cursor-pointer transition-all"
      >
        <span className="text-orange-600 text-xs font-black">📍</span>
        <div className="text-left">
          <span className="text-[10px] font-black uppercase text-[#5B0E14] block leading-none">
            {selectedBranch ? `${selectedBranch.name} (${selectedBranch.city})` : 'SELECT STORE'}
          </span>
          {selectedBranch?.distanceKm !== undefined && (
            <span className="text-[9px] text-green-700 font-bold leading-none">
              {selectedBranch.distanceKm} km away
            </span>
          )}
        </div>
        <span className="text-xs text-[#5B0E14] font-bold">▾</span>
      </div>

      {/* POPUP MODAL (Auto opens on first load or on click) */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#FFFBF2] w-full max-w-md rounded-3xl border-2 border-[#5B0E14] p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-[#5B0E14]/10 pb-3">
              <div>
                <span className="text-xs font-black text-orange-600 uppercase tracking-widest">Store Selector</span>
                <h3 className="font-black text-[#5B0E14] text-lg">Apna Delivering Store Chunein</h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsOpen(false)} 
                className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-lg font-black text-gray-600 cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Auto GPS Trigger Button */}
            <button
              type="button"
              onClick={handleDetectGPS}
              disabled={isLocating}
              className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-black text-xs rounded-2xl shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 hover:opacity-95 transition-all cursor-pointer"
            >
              <span>{isLocating ? '📡' : '🎯'}</span>
              <span>{isLocating ? 'Detecting Your Nearest Store...' : 'ALLOW LOCATION / AUTO-DETECT GPS'}</span>
            </button>

            {geoError && (
              <p className="text-[11px] text-red-600 bg-red-100/70 p-2 rounded-xl text-center font-bold">
                {geoError}
              </p>
            )}

            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-[#5B0E14]/15"></div>
              <span className="flex-shrink mx-2 text-[10px] font-black text-gray-400 uppercase">YA STORE SELECT KAREIN</span>
              <div className="flex-grow border-t border-[#5B0E14]/15"></div>
            </div>

            {/* Branch List */}
            <div className="space-y-2.5 max-h-[45vh] overflow-y-auto pr-1">
              {branches.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">Branches load ho rahi hain...</p>
              ) : (
                (() => {
                  const currentSelectedId = selectedBranch?.id || (typeof window !== 'undefined' ? localStorage.getItem('hacky_selected_branch_id') : null);
                  return branches.map((b: any) => {
                    // STRICT single selection check:
                    const isSelected = String(b.id) === String(currentSelectedId);

                    return (
                      <div
                        key={b.id}
                        onClick={() => handleSelect(b)}
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
                            {b.distanceKm !== undefined && (
                              <span className="text-[10px] bg-green-100 text-green-700 font-black px-2 py-0.5 rounded-full">
                                {b.distanceKm} km
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5">{b.address}</p>
                          <p className="text-[10px] text-gray-400 font-bold">📞 {b.phone}</p>
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
                })()
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
