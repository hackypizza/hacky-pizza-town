import React from 'react';

interface VegIndicatorProps {
  isVeg?: boolean;
  className?: string;
  showLabel?: boolean;
}

export const VegIndicator: React.FC<VegIndicatorProps> = ({ isVeg = true, className = '', showLabel = false }) => {
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`} title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}>
      <span
        className={`w-4 h-4 rounded-xs border-2 flex items-center justify-center shrink-0 ${
          isVeg ? 'border-emerald-600 bg-emerald-50/50' : 'border-red-600 bg-red-50/50'
        }`}
        aria-label={isVeg ? '100% Pure Veg' : 'Non-Veg'}
      >
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${
            isVeg ? 'bg-emerald-600' : 'bg-red-600'
          }`}
        />
      </span>
      {showLabel && (
        <span className={`text-xs font-semibold uppercase tracking-wider ${isVeg ? 'text-emerald-700' : 'text-red-700'}`}>
          {isVeg ? 'Pure Veg' : 'Non-Veg'}
        </span>
      )}
    </div>
  );
};
