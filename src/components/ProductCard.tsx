import React from 'react';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description?: string;
    price: number | string;
    originalPrice?: number | string;
    imageUrl: string;
    isVeg?: boolean;
    hasVariants?: boolean;
    sizePrices?: any;
    sizeOptions?: any[];
    crustOptions?: any[];
  };
  onOpenCustomizer: (product: any) => void;
}

export default function ProductCard({ product, onOpenCustomizer }: ProductCardProps) {
  return (
    <div className="relative bg-white rounded-2xl p-3.5 shadow-[0_4px_20px_rgba(80,35,20,0.06)] border border-[#502314]/10 hover:shadow-[0_8px_25px_rgba(80,35,20,0.12)] transition-all duration-300 flex items-center justify-between gap-3 mb-3">
      {/* Left Info */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-2 mb-1">
          <span className={`inline-flex items-center justify-center w-4 h-4 rounded-sm border ${product.isVeg !== false ? 'border-green-600' : 'border-red-600'} p-0.5`}>
            <span className={`w-2 h-2 rounded-full ${product.isVeg !== false ? 'bg-green-600' : 'bg-red-600'}`}></span>
          </span>
          <h3 className="font-black text-[#502314] text-sm sm:text-base tracking-tight truncate">
            {product.name}
          </h3>
        </div>

        <p className="text-[11px] sm:text-xs text-gray-500 line-clamp-2 leading-relaxed mb-2 font-medium">
          {product.description || 'Fresh mozzarella, signature sauce, and classic crust.'}
        </p>

        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-base sm:text-lg font-black text-[#EA580C]">
            ₹{product.price}
          </span>
          {product.hasVariants && (
            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-orange-100 text-orange-700 rounded-md">
              Sizes Available
            </span>
          )}
          {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
            <span className="text-xs text-gray-400 line-through font-bold">
              ₹{product.originalPrice}
            </span>
          )}
        </div>
      </div>

      {/* Right Image & Single ADD+ Action */}
      <div className="relative flex-shrink-0 flex flex-col items-center">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-[#FFFBF2] border border-[#502314]/10 shadow-inner">
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80'}
            alt={product.name}
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        <button
          onClick={() => onOpenCustomizer(product)}
          className="absolute -bottom-2.5 bg-gradient-to-r from-[#EA580C] to-[#C2410C] hover:from-[#C2410C] hover:to-[#9A3412] text-white px-5 py-1.5 rounded-full text-xs font-black tracking-wider uppercase shadow-[0_4px_12px_rgba(234,88,12,0.35)] active:scale-95 transition-all flex items-center gap-1 border border-white cursor-pointer"
        >
          <span>ADD</span>
          <span className="text-sm leading-none">+</span>
        </button>
      </div>
    </div>
  );
}
