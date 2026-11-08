import React, { useState, useEffect } from 'react';

export default function PromoSlider() {
  const [banners, setBanners] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch('/api?action=GET_BANNERS')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.banners) && data.banners.length > 0) {
          setBanners(data.banners);
        } else {
          setBanners([
            { id: 'ban_1', title: 'CRAZY APP DEALS - FLAT 50% OFF', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1600&auto=format&fit=crop' },
            { id: 'ban_2', title: 'WOOD-FIRED ARTISAN PIZZAS @ 400°C', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1600&auto=format&fit=crop' }
          ]);
        }
      })
      .catch(() => {
        setBanners([
          { id: 'ban_1', title: 'CRAZY APP DEALS - FLAT 50% OFF', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1600&auto=format&fit=crop' },
          { id: 'ban_2', title: 'WOOD-FIRED ARTISAN PIZZAS @ 400°C', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1600&auto=format&fit=crop' }
        ]);
      });
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [banners]);

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full max-w-7xl mx-auto px-3 sm:px-6 py-3">
      {/* Increased height for laptops and big screens */}
      <div className="relative h-56 sm:h-72 md:h-96 lg:h-[420px] w-full rounded-3xl overflow-hidden shadow-2xl border-2 border-[#5B0E14]/15 bg-black">
        {banners.map((b, idx) => (
          <div
            key={b.id || idx}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={b.image}
              alt={b.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1600&auto=format&fit=crop');
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-end p-5 md:p-8">
              <span className="bg-[#EA580C] text-white text-[11px] md:text-xs font-black uppercase px-3 py-1 rounded-full w-max tracking-wider mb-1.5 shadow-md">
                SUPER VALUE
              </span>
              <h3 className="text-white text-base md:text-2xl lg:text-3xl font-black drop-shadow-md">
                {b.title}
              </h3>
            </div>
          </div>
        ))}

        {/* Dots Pagination */}
        <div className="absolute bottom-3 right-6 z-20 flex gap-2">
          {banners.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === currentIndex ? 'w-6 bg-[#EA580C]' : 'w-2 bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
