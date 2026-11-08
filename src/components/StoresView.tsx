import React from 'react';
import { MapPin, Phone, Clock, Navigation, Check } from 'lucide-react';
import { OUTLETS } from '../data/menu';

interface StoresViewProps {
  currentOutlet: string;
  onSelectOutlet: (name: string) => void;
  onGoToMenu: () => void;
}

export const StoresView: React.FC<StoresViewProps> = ({
  currentOutlet,
  onSelectOutlet,
  onGoToMenu,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-black uppercase text-[#502314] font-bk">
          Hacky Pizza Town Outlets
        </h2>
        <p className="text-xs sm:text-sm text-[#8c6759]">
          Wood-fired kitchens serving hot handcrafted pizzas across Mahmudabad.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {OUTLETS.map((outlet) => {
          const isSelected = currentOutlet === outlet.name;

          return (
            <div
              key={outlet.id}
              className={`p-5 rounded-3xl bg-white border transition-all flex flex-col justify-between space-y-4 shadow-sm ${
                isSelected ? 'border-[#ea580c] ring-2 ring-[#ea580c]/30' : 'border-[#ede2d5]'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-[#ea580c] shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  {isSelected && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#ea580c] text-white text-[10px] font-black uppercase">
                      Selected Store
                    </span>
                  )}
                </div>

                <h3 className="font-black text-sm sm:text-base text-[#502314] uppercase font-bk">
                  {outlet.name}
                </h3>
                <p className="text-xs text-[#71594f] leading-relaxed">{outlet.address}</p>
              </div>

              <div className="space-y-2 text-xs border-t border-[#f4e7da] pt-3 text-[#71594f]">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#ea580c]" />
                  <span>{outlet.timing}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#ea580c]" />
                  <a href={`tel:${outlet.phone}`} className="hover:underline font-semibold text-[#502314]">
                    {outlet.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{outlet.distance} from your location</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onSelectOutlet(outlet.name);
                  onGoToMenu();
                }}
                className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#502314] text-white'
                    : 'bg-[#ea580c] hover:bg-[#c2410c] text-white'
                }`}
              >
                {isSelected ? 'Order from this Store' : 'Select & Order'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
