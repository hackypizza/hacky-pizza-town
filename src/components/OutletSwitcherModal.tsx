'use client';

import React, { useState, useEffect } from 'react';
import { X, MapPin, Check, Clock, Phone } from 'lucide-react';

interface BranchItem {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
}

const DEFAULT_BRANCHES: BranchItem[] = [
  {
    id: 'branch_mahmudabad',
    name: 'Mahmudabad Main Branch',
    city: 'Mahmudabad',
    address: 'Near Clock Tower, Ramkund Chauraha, Mahmudabad (UP)',
    phone: '9305938873'
  },
  {
    id: 'branch_haridwar',
    name: 'Shivalik Nagar Haridwar Branch',
    city: 'Haridwar',
    address: 'Cluster 3, Shivalik Nagar, BHEL Ranipur, Haridwar (UK)',
    phone: '9876543210'
  }
];

interface OutletSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOutlet: string;
  onSelectOutlet: (outletName: string, branchId?: string) => void;
  branchesList?: BranchItem[];
}

export const OutletSwitcherModal: React.FC<OutletSwitcherModalProps> = ({
  isOpen,
  onClose,
  selectedOutlet,
  onSelectOutlet,
  branchesList,
}) => {
  const [branches, setBranches] = useState<BranchItem[]>(branchesList && branchesList.length > 0 ? branchesList : DEFAULT_BRANCHES);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/branches')
        .then((r) => r.json())
        .then((data) => {
          if (data.success && Array.isArray(data.branches) && data.branches.length > 0) {
            setBranches(data.branches);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div className="relative w-full max-w-md bg-[#fffaf0] rounded-3xl shadow-2xl border border-[#ecdccb] overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-[#502314] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#ea580c] flex items-center justify-center text-white">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase">Select Store Branch</h3>
              <p className="text-[11px] text-orange-200">Multi-City Enterprise Kitchens</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Outlet list */}
        <div className="p-5 space-y-3">
          <p className="text-xs text-[#8c6759] font-medium">
            Select your nearest Hacky Pizza branch for fresh local kitchen preparation &amp; express delivery:
          </p>

          <div className="space-y-2.5 max-h-80 overflow-y-auto">
            {branches.map((branch) => {
              const isSelected = selectedOutlet === branch.name || selectedOutlet === branch.id;

              return (
                <button
                  key={branch.id}
                  onClick={() => {
                    onSelectOutlet(branch.name, branch.id);
                    onClose();
                  }}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all duration-150 flex items-start justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'border-[#ea580c] bg-orange-50/80 ring-2 ring-[#ea580c]/30 shadow-xs'
                      : 'border-[#ede2d5] bg-white hover:border-[#ea580c]/50'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs sm:text-sm text-[#502314] truncate uppercase">
                        {branch.name}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.2 bg-[#ea580c] text-white rounded-full">
                          Current
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#71594f] line-clamp-1">{branch.address}</p>

                    <div className="flex items-center gap-3 pt-1 text-[11px] text-[#8c6759]">
                      <span className="flex items-center gap-1 text-emerald-700 font-bold">
                        <Clock className="w-3 h-3" /> 10:30 AM - 11:30 PM
                      </span>
                      <span>·</span>
                      <span className="font-bold text-[#ea580c]">{branch.city}</span>
                      <span>·</span>
                      <span className="text-gray-500 font-mono">📞 {branch.phone}</span>
                    </div>
                  </div>

                  <div className="shrink-0 mt-1">
                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-[#ea580c] text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-zinc-300" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
