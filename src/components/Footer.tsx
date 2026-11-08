import React from 'react';
import { MapPin, Phone, Clock, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#502314] text-white/90 border-t border-[#3b170c] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 text-xl font-black text-white">
              <span className="text-2xl">🍕</span>
              <span className="tracking-wide">HACKY PIZZA TOWN</span>
            </div>
            <p className="text-xs text-orange-200/80 leading-relaxed">
              Mahmudabad’s favorite wood-fired artisanal pizza destination. Handcrafted dough, fresh veggies, and 100% pure cheese baked to perfection.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-sm bg-emerald-800 text-emerald-200 border border-emerald-600">
                100% PURE VEG OPTIONS
              </span>
            </div>
          </div>

          {/* Mahmudabad Store Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400">
              Mahmudabad Store
            </h4>
            <div className="space-y-2 text-xs text-orange-100/80">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#ea580c] shrink-0 mt-0.5" />
                <span>Near Town Hall, Station Road, Mahmudabad, Uttar Pradesh - 261203</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#ea580c] shrink-0" />
                <span>Open Everyday: 11:00 AM – 11:30 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#ea580c] shrink-0" />
                <a href="tel:+919876543210" className="hover:text-white transition-colors">
                  +91 98765 43210
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400">
              Quick Menu
            </h4>
            <ul className="space-y-1.5 text-xs text-orange-100/80">
              <li>
                <a href="#menu" className="hover:text-white transition-colors">
                  Wood-Fired Pizzas
                </a>
              </li>
              <li>
                <a href="#menu" className="hover:text-white transition-colors">
                  Stuffed Garlic Breads
                </a>
              </li>
              <li>
                <a href="#menu" className="hover:text-white transition-colors">
                  Urban Cold Brews & Beverages
                </a>
              </li>
              <li>
                <a href="#menu" className="hover:text-white transition-colors">
                  Molten Choco Lava Cakes
                </a>
              </li>
            </ul>
          </div>

          {/* Hygiene & Delivery Promise */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400">
              Our Safety Promise
            </h4>
            <div className="space-y-2 text-xs text-orange-100/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>FSSAI Certified Kitchen (Lic. 12723054000182)</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Contactless insulated hot bag delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Daily sanitized wood-fired oven counters</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-orange-200/60">
          <div>
            © {new Date().getFullYear()} Hacky Pizza Town · Mahmudabad Store. All rights reserved.
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
            <span>for pizza lovers in Mahmudabad</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
