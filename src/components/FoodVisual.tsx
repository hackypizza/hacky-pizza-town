import React from 'react';
import { MenuItem } from '../types';

interface FoodVisualProps {
  type: MenuItem['visualType'];
  className?: string;
}

export const FoodVisual: React.FC<FoodVisualProps> = ({ type, className = 'w-full h-full' }) => {
  switch (type) {
    case 'margherita':
      return (
        <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#fef3c7] via-[#fed7aa] to-[#fdba74] ${className}`}>
          <svg viewBox="0 0 200 200" className="w-[85%] h-[85%] drop-shadow-lg transition-transform duration-300 group-hover:scale-105">
            {/* Pizza Crust */}
            <circle cx="100" cy="100" r="92" fill="#d97706" stroke="#b45309" strokeWidth="4" />
            <circle cx="100" cy="100" r="84" fill="#fbbf24" opacity="0.9" />
            <circle cx="100" cy="100" r="82" fill="#dc2626" />
            
            {/* Cheese Layer */}
            <circle cx="100" cy="100" r="74" fill="#fef08a" />
            
            {/* Mozzarella Pools */}
            <ellipse cx="85" cy="80" rx="16" ry="12" fill="#fffbeb" opacity="0.9" />
            <ellipse cx="120" cy="90" rx="18" ry="14" fill="#fffbeb" opacity="0.9" />
            <ellipse cx="95" cy="125" rx="15" ry="12" fill="#fffbeb" opacity="0.9" />
            <ellipse cx="65" cy="115" rx="14" ry="11" fill="#fffbeb" opacity="0.9" />
            <ellipse cx="125" cy="130" rx="12" ry="10" fill="#fffbeb" opacity="0.9" />
            
            {/* Charred wood-fired blisters */}
            <circle cx="155" cy="55" r="4" fill="#78350f" opacity="0.7" />
            <circle cx="45" cy="135" r="5" fill="#78350f" opacity="0.7" />
            <circle cx="170" cy="110" r="3.5" fill="#78350f" opacity="0.8" />
            <circle cx="95" cy="20" r="4" fill="#78350f" opacity="0.7" />

            {/* Fresh Green Basil Leaves */}
            <g transform="translate(70, 70) rotate(-25)">
              <path d="M 0 0 C 15 -10 25 5 15 15 C 5 25 -10 15 0 0 Z" fill="#15803d" />
              <path d="M 2 2 Q 10 10 12 12" stroke="#166534" strokeWidth="1.5" fill="none" />
            </g>
            <g transform="translate(110, 75) rotate(45)">
              <path d="M 0 0 C 14 -8 22 6 14 14 C 6 22 -8 14 0 0 Z" fill="#16a34a" />
            </g>
            <g transform="translate(90, 115) rotate(15)">
              <path d="M 0 0 C 16 -10 26 6 16 16 C 6 26 -10 16 0 0 Z" fill="#15803d" />
              <path d="M 2 2 Q 10 10 13 13" stroke="#14532d" strokeWidth="1.5" fill="none" />
            </g>
            <g transform="translate(130, 120) rotate(-40)">
              <path d="M 0 0 C 12 -6 18 4 12 12 C 4 18 -6 12 0 0 Z" fill="#16a34a" />
            </g>
            <g transform="translate(60, 110) rotate(70)">
              <path d="M 0 0 C 13 -7 20 5 13 13 C 5 20 -7 13 0 0 Z" fill="#15803d" />
            </g>

            {/* Herb flakes */}
            <circle cx="105" cy="98" r="1.5" fill="#14532d" />
            <circle cx="80" cy="100" r="1.5" fill="#14532d" />
            <circle cx="115" cy="110" r="1.5" fill="#14532d" />
            <circle cx="100" cy="80" r="1.2" fill="#14532d" />
            <circle cx="75" cy="80" r="1.2" fill="#14532d" />
          </svg>
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-black/40 text-white backdrop-blur-xs">
            Wood Fired
          </div>
        </div>
      );

    case 'peppy_paneer':
      return (
        <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#fef3c7] via-[#fed7aa] to-[#ea580c]/30 ${className}`}>
          <svg viewBox="0 0 200 200" className="w-[85%] h-[85%] drop-shadow-lg transition-transform duration-300 group-hover:scale-105">
            {/* Pizza Crust */}
            <circle cx="100" cy="100" r="92" fill="#d97706" stroke="#9a3412" strokeWidth="4" />
            <circle cx="100" cy="100" r="84" fill="#fbbf24" opacity="0.9" />
            <circle cx="100" cy="100" r="82" fill="#b91c1c" />
            
            {/* Cheese Layer */}
            <circle cx="100" cy="100" r="74" fill="#fef08a" />

            {/* Paneer Cubes (Golden Masala Seared) */}
            <g transform="translate(75, 65) rotate(10)">
              <rect width="18" height="18" rx="3" fill="#fef9c3" stroke="#d97706" strokeWidth="2" />
              <rect x="2" y="2" width="14" height="6" fill="#ea580c" opacity="0.7" rx="1" />
            </g>
            <g transform="translate(115, 75) rotate(-15)">
              <rect width="17" height="17" rx="3" fill="#fef9c3" stroke="#d97706" strokeWidth="2" />
              <rect x="2" y="2" width="13" height="6" fill="#ea580c" opacity="0.7" rx="1" />
            </g>
            <g transform="translate(90, 110) rotate(20)">
              <rect width="19" height="19" rx="3" fill="#fef9c3" stroke="#d97706" strokeWidth="2" />
              <rect x="2" y="2" width="15" height="7" fill="#ea580c" opacity="0.7" rx="1" />
            </g>
            <g transform="translate(55, 105) rotate(-10)">
              <rect width="16" height="16" rx="3" fill="#fef9c3" stroke="#d97706" strokeWidth="2" />
              <rect x="2" y="2" width="12" height="5" fill="#ea580c" opacity="0.7" rx="1" />
            </g>
            <g transform="translate(120, 120) rotate(5)">
              <rect width="17" height="17" rx="3" fill="#fef9c3" stroke="#d97706" strokeWidth="2" />
              <rect x="2" y="2" width="13" height="6" fill="#ea580c" opacity="0.7" rx="1" />
            </g>

            {/* Crisp Green Capsicum Rings */}
            <path d="M 65 80 Q 75 70 85 82" stroke="#15803d" strokeWidth="5" strokeLinecap="round" fill="none" />
            <path d="M 125 60 Q 135 70 128 85" stroke="#15803d" strokeWidth="5" strokeLinecap="round" fill="none" />
            <path d="M 80 135 Q 95 140 105 130" stroke="#15803d" strokeWidth="5" strokeLinecap="round" fill="none" />
            <path d="M 115 105 Q 125 100 135 110" stroke="#15803d" strokeWidth="5" strokeLinecap="round" fill="none" />

            {/* Red Paprika Slices */}
            <circle cx="102" cy="70" r="5" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
            <circle cx="102" cy="70" r="2" fill="#fef08a" />
            <circle cx="70" cy="125" r="5" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
            <circle cx="70" cy="125" r="2" fill="#fef08a" />
            <circle cx="138" cy="100" r="5" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
            <circle cx="138" cy="100" r="2" fill="#fef08a" />
          </svg>
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-[#ea580c] text-white">
            Spicy & Cheesy
          </div>
        </div>
      );

    case 'farmhouse':
      return (
        <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#fef3c7] via-[#dcfce7] to-[#bbf7d0] ${className}`}>
          <svg viewBox="0 0 200 200" className="w-[85%] h-[85%] drop-shadow-lg transition-transform duration-300 group-hover:scale-105">
            {/* Crust */}
            <circle cx="100" cy="100" r="92" fill="#d97706" stroke="#78350f" strokeWidth="4" />
            <circle cx="100" cy="100" r="84" fill="#fde68a" />
            <circle cx="100" cy="100" r="82" fill="#dc2626" />
            <circle cx="100" cy="100" r="74" fill="#fef08a" />

            {/* Fresh Mushrooms */}
            <g transform="translate(65, 65)">
              <path d="M 0 10 A 10 10 0 0 1 20 10 Z" fill="#a8a29e" stroke="#57534e" strokeWidth="1.5" />
              <rect x="7" y="10" width="6" height="7" fill="#d6d3d1" rx="1" />
            </g>
            <g transform="translate(115, 65)">
              <path d="M 0 10 A 10 10 0 0 1 20 10 Z" fill="#a8a29e" stroke="#57534e" strokeWidth="1.5" />
              <rect x="7" y="10" width="6" height="7" fill="#d6d3d1" rx="1" />
            </g>
            <g transform="translate(90, 115)">
              <path d="M 0 10 A 11 11 0 0 1 22 10 Z" fill="#a8a29e" stroke="#57534e" strokeWidth="1.5" />
              <rect x="8" y="10" width="6" height="7" fill="#d6d3d1" rx="1" />
            </g>

            {/* Sweet Corn Kernels */}
            <circle cx="95" cy="75" r="4.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
            <circle cx="105" cy="70" r="4.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
            <circle cx="65" cy="100" r="4.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
            <circle cx="75" cy="110" r="4.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
            <circle cx="125" cy="100" r="4.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
            <circle cx="135" cy="115" r="4.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
            <circle cx="95" cy="98" r="4.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />

            {/* Crisp Capsicum & Diced Tomatoes */}
            <rect x="80" y="85" width="8" height="8" rx="2" fill="#16a34a" />
            <rect x="110" y="90" width="8" height="8" rx="2" fill="#16a34a" />
            <rect x="60" y="80" width="7" height="7" rx="2" fill="#ef4444" />
            <rect x="120" y="125" width="7" height="7" rx="2" fill="#ef4444" />
            <rect x="80" y="130" width="7" height="7" rx="2" fill="#ef4444" />
          </svg>
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-emerald-700 text-white">
            Garden Fresh
          </div>
        </div>
      );

    case 'garlic_bread':
      return (
        <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#fef3c7] via-[#fed7aa] to-[#fde047]/40 ${className}`}>
          <svg viewBox="0 0 200 200" className="w-[85%] h-[85%] drop-shadow-md transition-transform duration-300 group-hover:scale-105">
            {/* Wooden Cutting Board Platter */}
            <rect x="25" y="45" width="150" height="110" rx="14" fill="#b45309" stroke="#78350f" strokeWidth="3" />
            <rect x="30" y="50" width="140" height="100" rx="10" fill="#d97706" opacity="0.25" />

            {/* Garlic Breadsticks / Loaf */}
            <g transform="rotate(-5 100 100)">
              {/* Main Golden Loaf */}
              <rect x="40" y="70" width="120" height="60" rx="18" fill="#d97706" stroke="#92400e" strokeWidth="3" />
              <rect x="45" y="75" width="110" height="50" rx="14" fill="#f59e0b" />

              {/* Slits with Stuffed Molten Cheese Pull */}
              <path d="M 68 73 Q 73 95 68 127" stroke="#fef08a" strokeWidth="8" strokeLinecap="round" />
              <path d="M 98 73 Q 103 95 98 127" stroke="#fef08a" strokeWidth="8" strokeLinecap="round" />
              <path d="M 128 73 Q 133 95 128 127" stroke="#fef08a" strokeWidth="8" strokeLinecap="round" />

              {/* Liquid cheese oozing center */}
              <ellipse cx="98" cy="100" rx="16" ry="10" fill="#fef9c3" />
              
              {/* Jalapeno slices */}
              <circle cx="70" cy="90" r="4" fill="#15803d" stroke="#166534" strokeWidth="1" />
              <circle cx="98" cy="100" r="4.5" fill="#15803d" stroke="#166534" strokeWidth="1" />
              <circle cx="127" cy="110" r="4" fill="#15803d" stroke="#166534" strokeWidth="1" />

              {/* Herb Butter glaze flakes */}
              <circle cx="58" cy="88" r="1.5" fill="#14532d" />
              <circle cx="85" cy="80" r="1.5" fill="#14532d" />
              <circle cx="112" cy="85" r="1.5" fill="#14532d" />
              <circle cx="140" cy="95" r="1.5" fill="#14532d" />
              <circle cx="90" cy="115" r="1.5" fill="#14532d" />
            </g>
          </svg>
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-amber-700 text-white">
            Cheesy Stuffed
          </div>
        </div>
      );

    case 'cold_coffee':
      return (
        <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#fef3c7] via-[#fed7aa] to-[#edd9c0] ${className}`}>
          <svg viewBox="0 0 200 200" className="w-[85%] h-[85%] drop-shadow-md transition-transform duration-300 group-hover:scale-105">
            {/* Chilled Glass Silhouette */}
            <path d="M 68 40 L 75 160 Q 76 168 85 168 L 115 168 Q 124 168 125 160 L 132 40 Z" fill="#ffffff" fillOpacity="0.4" stroke="#d4d4d8" strokeWidth="2" />
            
            {/* Coffee Drink Gradient */}
            <path d="M 70 55 L 75 158 Q 76 166 84 166 L 116 166 Q 124 166 125 158 L 130 55 Z" fill="#78350f" />
            
            {/* Cream / Milk Swirl */}
            <path d="M 72 80 Q 90 95 110 85 Q 120 80 128 85 L 127 100 Q 110 90 90 105 L 73 95 Z" fill="#d97706" opacity="0.6" />
            <path d="M 73 110 Q 100 120 126 112 L 125 130 Q 95 140 74 125 Z" fill="#d97706" opacity="0.5" />

            {/* Ice Cubes */}
            <rect x="80" y="65" width="20" height="20" rx="3" fill="#ffffff" fillOpacity="0.55" stroke="#e4e4e7" strokeWidth="1" transform="rotate(15 90 75)" />
            <rect x="100" y="85" width="18" height="18" rx="3" fill="#ffffff" fillOpacity="0.55" stroke="#e4e4e7" strokeWidth="1" transform="rotate(-12 110 95)" />

            {/* Thick Cream Foam Cap */}
            <path d="M 66 40 Q 100 32 134 40 Q 130 55 100 52 Q 70 55 66 40 Z" fill="#fef9c3" stroke="#fde047" strokeWidth="1" />
            <ellipse cx="100" cy="38" rx="32" ry="7" fill="#fffbeb" />

            {/* Cocoa Powder sprinkles */}
            <circle cx="95" cy="37" r="1.5" fill="#451a03" />
            <circle cx="105" cy="39" r="1.5" fill="#451a03" />
            <circle cx="88" cy="38" r="1.2" fill="#451a03" />
            <circle cx="112" cy="37" r="1.2" fill="#451a03" />

            {/* Red & White Straw */}
            <line x1="112" y1="20" x2="88" y2="130" stroke="#ea580c" strokeWidth="6" strokeLinecap="round" />
            <line x1="112" y1="20" x2="88" y2="130" stroke="#ffffff" strokeWidth="6" strokeDasharray="6 6" strokeLinecap="round" />
          </svg>
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-[#502314] text-white">
            Slow Brewed
          </div>
        </div>
      );

    case 'choco_lava':
      return (
        <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#fef3c7] via-[#ffedd5] to-[#fbcfe8]/30 ${className}`}>
          <svg viewBox="0 0 200 200" className="w-[85%] h-[85%] drop-shadow-md transition-transform duration-300 group-hover:scale-105">
            {/* Ceramic Dessert Plate */}
            <ellipse cx="100" cy="140" rx="80" ry="35" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
            <ellipse cx="100" cy="138" rx="65" ry="25" fill="#f8fafc" />

            {/* Chocolate Cake Mound */}
            <path d="M 60 135 C 60 85 75 70 100 70 C 125 70 140 85 140 135 Z" fill="#3e1a0d" stroke="#260f07" strokeWidth="2" />
            
            {/* Cake Top Crater */}
            <ellipse cx="100" cy="80" rx="22" ry="10" fill="#271109" />

            {/* Warm Molten Fudge River Oozing Forward */}
            <path d="M 90 85 C 85 105 80 120 75 145 C 90 155 115 155 125 145 C 118 120 115 105 110 85 Z" fill="#1c0a04" />
            <path d="M 75 145 Q 100 158 125 145 Q 115 152 75 145 Z" fill="#451a03" />

            {/* Glossy Chocolate Highlights */}
            <path d="M 88 95 Q 92 120 90 135" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />
            <path d="M 108 95 Q 106 120 107 135" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />

            {/* White Powdered Sugar Dusting */}
            <circle cx="78" cy="95" r="1.5" fill="#ffffff" />
            <circle cx="82" cy="85" r="1.2" fill="#ffffff" />
            <circle cx="120" cy="90" r="1.5" fill="#ffffff" />
            <circle cx="125" cy="100" r="1.2" fill="#ffffff" />
            <circle cx="68" cy="120" r="1.2" fill="#ffffff" />
            <circle cx="132" cy="120" r="1.2" fill="#ffffff" />

            {/* Rising Steam Wafts */}
            <path d="M 94 60 Q 98 45 92 35" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
            <path d="M 106 58 Q 102 42 108 30" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
          </svg>
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-[#502314] text-white">
            Molten Center
          </div>
        </div>
      );

    case 'garlic_classic':
      return (
        <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#fef3c7] via-[#fed7aa] to-[#fde047]/30 ${className}`}>
          <svg viewBox="0 0 200 200" className="w-[85%] h-[85%] drop-shadow-md transition-transform duration-300 group-hover:scale-105">
            <rect x="35" y="60" width="130" height="80" rx="12" fill="#d97706" stroke="#92400e" strokeWidth="3" />
            <rect x="42" y="66" width="116" height="68" rx="8" fill="#f59e0b" />
            <line x1="75" y1="66" x2="75" y2="134" stroke="#d97706" strokeWidth="4" />
            <line x1="105" y1="66" x2="105" y2="134" stroke="#d97706" strokeWidth="4" />
            <line x1="135" y1="66" x2="135" y2="134" stroke="#d97706" strokeWidth="4" />
            {/* Herbs */}
            <circle cx="60" cy="90" r="2" fill="#15803d" />
            <circle cx="90" cy="100" r="2" fill="#15803d" />
            <circle cx="120" cy="85" r="2" fill="#15803d" />
          </svg>
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-amber-700 text-white">
            Herb Butter
          </div>
        </div>
      );

    case 'peri_peri':
      return (
        <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#fee2e2] via-[#ffedd5] to-[#f87171]/40 ${className}`}>
          <svg viewBox="0 0 200 200" className="w-[85%] h-[85%] drop-shadow-lg transition-transform duration-300 group-hover:scale-105">
            <circle cx="100" cy="100" r="92" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="4" />
            <circle cx="100" cy="100" r="84" fill="#f97316" opacity="0.9" />
            <circle cx="100" cy="100" r="80" fill="#dc2626" />
            <circle cx="100" cy="100" r="72" fill="#fef08a" />
            {/* Peri Peri Fiery swirl */}
            <path d="M 60 90 Q 100 60 140 90 Q 100 130 60 90 Z" fill="#ea580c" opacity="0.75" />
            {/* Red Chilies */}
            <path d="M 70 65 Q 85 60 85 75 Q 80 85 70 75 Z" fill="#dc2626" />
            <path d="M 125 75 Q 140 70 140 85 Q 135 95 125 85 Z" fill="#dc2626" />
            <path d="M 95 125 Q 110 120 110 135 Q 105 145 95 135 Z" fill="#dc2626" />
            {/* Spice Flecks */}
            <circle cx="95" cy="85" r="2" fill="#7f1d1d" />
            <circle cx="115" cy="95" r="2" fill="#7f1d1d" />
            <circle cx="85" cy="115" r="2" fill="#7f1d1d" />
            <circle cx="105" cy="115" r="2" fill="#7f1d1d" />
          </svg>
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-[#d62300] text-white">
            Fiery Peri-Peri
          </div>
        </div>
      );

    case 'combo_deal':
      return (
        <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#fef3c7] via-[#fed7aa] to-[#ea580c]/30 ${className}`}>
          <svg viewBox="0 0 200 200" className="w-[85%] h-[85%] drop-shadow-md transition-transform duration-300 group-hover:scale-105">
            {/* Feast Tray */}
            <rect x="20" y="45" width="160" height="110" rx="16" fill="#502314" stroke="#3b170c" strokeWidth="3" />
            <rect x="25" y="50" width="150" height="100" rx="12" fill="#fed7aa" opacity="0.3" />
            {/* Pizza Slice */}
            <path d="M 40 130 L 95 65 L 115 130 Z" fill="#ea580c" stroke="#c2410c" strokeWidth="2" />
            <path d="M 48 126 L 95 72 L 108 126 Z" fill="#fef08a" />
            <circle cx="75" cy="110" r="4" fill="#dc2626" />
            <circle cx="90" cy="100" r="4" fill="#16a34a" />
            <circle cx="85" cy="120" r="3" fill="#dc2626" />
            {/* Drink Cup */}
            <rect x="120" y="70" width="35" height="55" rx="5" fill="#f97316" stroke="#ea580c" strokeWidth="2" />
            <path d="M 118 68 L 157 68" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
            <line x1="145" y1="50" x2="135" y2="70" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
            <text x="126" y="103" fill="#ffffff" fontSize="11" fontWeight="bold">HPT</text>
          </svg>
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-[#ea580c] text-white">
            Super Combo
          </div>
        </div>
      );

    case 'cooler':
      return (
        <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#fef08a] via-[#fde047] to-[#f97316]/30 ${className}`}>
          <svg viewBox="0 0 200 200" className="w-[85%] h-[85%] drop-shadow-md transition-transform duration-300 group-hover:scale-105">
            <path d="M 70 45 L 78 160 Q 79 168 88 168 L 112 168 Q 121 168 122 160 L 130 45 Z" fill="#ffffff" fillOpacity="0.4" stroke="#d4d4d8" strokeWidth="2" />
            <path d="M 72 60 L 78 158 Q 79 166 88 166 L 112 166 Q 121 166 122 158 L 128 60 Z" fill="#f59e0b" />
            {/* Mint leaves */}
            <circle cx="95" cy="55" r="8" fill="#16a34a" />
            <circle cx="105" cy="50" r="6" fill="#15803d" />
            {/* Straw */}
            <line x1="110" y1="20" x2="90" y2="130" stroke="#16a34a" strokeWidth="5" strokeLinecap="round" />
          </svg>
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-orange-600 text-white">
            Refreshing
          </div>
        </div>
      );

    default:
      return (
        <div className={`flex items-center justify-center bg-orange-100 ${className}`}>
          <span className="text-3xl">🍕</span>
        </div>
      );
  }
};
