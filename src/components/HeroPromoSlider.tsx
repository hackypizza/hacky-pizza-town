import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Clock, Flame, ChevronLeft, ChevronRight } from 'lucide-react';

interface PromoSlide {
  id: string;
  badge: string;
  title: string;
  highlight: string;
  subtitle: string;
  ctaText: string;
  priceTag: string;
  oldPriceTag?: string;
  bgGradient: string;
  targetCategory: string;
  pizzaEmoji: string;
}

const PROMO_SLIDES: PromoSlide[] = [
  {
    id: 'cheesy-fiesta',
    badge: 'LIMITED TIME ONLY',
    title: 'CHEESY FIESTA COMBO',
    highlight: 'FLAT 40% OFF',
    subtitle: '1 Medium Wood-Fired Margherita + Stuffed Garlic Bread + 2 Chilled Brews',
    ctaText: 'ORDER NOW',
    priceTag: '₹399',
    oldPriceTag: '₹549',
    bgGradient: 'from-[#502314] via-[#702914] to-[#ea580c]',
    targetCategory: 'combos',
    pizzaEmoji: '🍕',
  },
  {
    id: 'two-for-deal',
    badge: 'DOUBLE VALUE PACK',
    title: 'KING FEAST TWIN PIZZAS',
    highlight: '2 FOR ₹349',
    subtitle: 'Choose any 2 Handcrafted Regular Crusts with 100% Real Mozzarella',
    ctaText: 'GRAB COMBO',
    priceTag: '₹349',
    oldPriceTag: '₹498',
    bgGradient: 'from-[#3b1207] via-[#502314] to-[#c2410c]',
    targetCategory: 'two_for',
    pizzaEmoji: '🔥',
  },
  {
    id: 'peri-peri-blast',
    badge: 'CHEF SPECIAL SPICY',
    title: 'PERI PERI CRUST BLITZ',
    highlight: 'EXTRA CHEESY',
    subtitle: 'Spiced Paneer cubes, fiery paprika & secret herb butter drizzle',
    ctaText: 'TRY NOW',
    priceTag: '₹329',
    oldPriceTag: '₹399',
    bgGradient: 'from-[#7f1d1d] via-[#991b1b] to-[#ea580c]',
    targetCategory: 'peri_peri',
    pizzaEmoji: '🌶️',
  },
];

interface HeroPromoSliderProps {
  onSelectCategory: (categoryId: string) => void;
  onQuickAddCombo?: () => void;
}

export const HeroPromoSlider: React.FC<HeroPromoSliderProps> = ({
  onSelectCategory,
  onQuickAddCombo,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto advance every 6s
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % PROMO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = PROMO_SLIDES[currentSlide];

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % PROMO_SLIDES.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + PROMO_SLIDES.length) % PROMO_SLIDES.length);
  };

  return (
    <section className="w-full px-3 sm:px-6 pt-3 pb-2 max-w-6xl mx-auto">
      {/* Promo Card Container */}
      <div
        className={`relative w-full rounded-3xl bg-gradient-to-r ${slide.bgGradient} text-white p-5 sm:p-8 shadow-xl overflow-hidden border border-white/20 transition-all duration-500`}
      >
        {/* Subtle decorative pizza steam rings / ambient glow */}
        <div className="absolute -top-12 -right-12 w-48 sm:w-64 h-48 sm:h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-black/20 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          {/* Left Text Block */}
          <div className="space-y-3 max-w-xl">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#ea580c] text-white text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-sm">
                <Flame className="w-3 h-3 fill-white" />
                {slide.badge}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-200">
                <Clock className="w-3 h-3" />
                Valid Today in Mahmudabad
              </span>
            </div>

            {/* Headline */}
            <div>
              <h2
                className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight uppercase font-bk drop-shadow-md"
              >
                {slide.title}
              </h2>
              <div className="text-xl sm:text-3xl font-black text-amber-300 tracking-tight mt-0.5">
                {slide.highlight}
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed max-w-md">
              {slide.subtitle}
            </p>

            {/* CTA + Price Lockup */}
            <div className="pt-2 flex items-center gap-4">
              <button
                onClick={() => {
                  if (onQuickAddCombo) {
                    onQuickAddCombo();
                  } else {
                    onSelectCategory(slide.targetCategory);
                  }
                }}
                className="px-6 py-3 bg-[#ea580c] hover:bg-[#c2410c] active:scale-95 text-white font-black text-xs sm:text-sm rounded-full shadow-lg transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider group"
              >
                <span>{slide.ctaText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="flex items-baseline gap-1.5 bg-black/30 backdrop-blur-xs px-3.5 py-2 rounded-2xl border border-white/20">
                <span className="text-xs text-white/70">From</span>
                <span className="text-xl sm:text-2xl font-black text-amber-300 tabular-nums">
                  {slide.priceTag}
                </span>
                {slide.oldPriceTag && (
                  <span className="text-xs line-through text-white/50 tabular-nums">
                    {slide.oldPriceTag}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Visual Badge / Mascot Graphic */}
          <div className="hidden sm:flex flex-col items-center justify-center shrink-0 pr-4">
            <div className="relative w-32 h-32 sm:w-44 sm:h-44 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
              <span className="text-6xl sm:text-8xl select-none filter drop-shadow-xl animate-bounce duration-1000">
                {slide.pizzaEmoji}
              </span>
              <div className="absolute -bottom-3 px-3 py-1 bg-amber-400 text-[#502314] rounded-full text-[11px] font-black uppercase tracking-wider shadow-md whitespace-nowrap">
                Mahmudabad Special
              </div>
            </div>
          </div>
        </div>

        {/* Slider Controls & Dots */}
        <div className="relative z-10 mt-5 pt-3 border-t border-white/15 flex items-center justify-between">
          {/* Dots */}
          <div className="flex items-center gap-2">
            {PROMO_SLIDES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentSlide === idx ? 'w-8 bg-[#ea580c]' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>

          {/* Left/Right buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              aria-label="Previous promo"
              className="w-7 h-7 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next promo"
              className="w-7 h-7 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
