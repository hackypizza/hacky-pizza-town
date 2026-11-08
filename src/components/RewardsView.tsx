import React from 'react';
import { Crown, Sparkles, Gift, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';

interface RewardsViewProps {
  user: UserProfile | null;
  onRedeemCashback: () => void;
  isRedeemed: boolean;
  onGoToMenu: () => void;
}

export const RewardsView: React.FC<RewardsViewProps> = ({
  user,
  onRedeemCashback,
  isRedeemed,
  onGoToMenu,
}) => {
  const points = user?.crownPoints ?? 0;
  const wallet = user?.walletBalance ?? 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Crown Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#502314] via-[#782811] to-[#ea580c] text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 text-amber-300/20 pointer-events-none">
          <Crown className="w-52 h-52 stroke-[1]" />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase text-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Silver Crown Member
          </div>

          <h2 className="text-2xl sm:text-4xl font-black uppercase font-bk">
            Hacky Crown Rewards
          </h2>

          <div className="flex items-baseline gap-2 pt-2">
            <span className="text-4xl sm:text-5xl font-black text-amber-300 tabular-nums">
              ₹{wallet}
            </span>
            <span className="text-sm sm:text-base text-orange-200 font-bold">
              ({points} Crown Points Available)
            </span>
          </div>

          <p className="text-xs sm:text-sm text-orange-100/90 max-w-lg leading-relaxed">
            Every bite earns rewards! Earn 1 point for every ₹10 spent at our Mahmudabad wood-fired pizza kitchen.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={onRedeemCashback}
              className={`px-6 py-3 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg flex items-center gap-2 ${
                isRedeemed
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-[#502314] hover:bg-orange-50 active:scale-95'
              }`}
            >
              {isRedeemed ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>₹50 Applied To Cart</span>
                </>
              ) : (
                <>
                  <span>Redeem ₹50 Now</span>
                  <ArrowRight className="w-4 h-4 text-[#ea580c]" />
                </>
              )}
            </button>

            <button
              onClick={onGoToMenu}
              className="px-5 py-3 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider text-white bg-black/30 hover:bg-black/40 border border-white/20 cursor-pointer"
            >
              Order &amp; Earn More
            </button>
          </div>
        </div>
      </div>

      {/* Rewards Milestones */}
      <div className="bg-white rounded-3xl p-6 border border-[#ede2d5] shadow-sm space-y-4">
        <h3 className="text-base font-black uppercase text-[#502314] font-bk flex items-center gap-2">
          <Gift className="w-4 h-4 text-[#ea580c]" />
          <span>Unlock Crown Perks</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-[#fffaf0] border border-[#f3e3d2] space-y-1">
            <div className="text-xs font-black uppercase text-[#ea580c]">50 Points</div>
            <div className="font-bold text-sm text-[#502314]">₹50 Instant Cashback</div>
            <p className="text-[11px] text-[#8c6759]">Ready to use at checkout on any order.</p>
            <div className="pt-2 text-[10px] font-black text-emerald-700 uppercase">✓ Unlocked</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#ede2d5] space-y-1 opacity-90">
            <div className="text-xs font-black uppercase text-[#8c6759]">100 Points</div>
            <div className="font-bold text-sm text-[#502314]">Free Stuffed Garlic Bread</div>
            <p className="text-[11px] text-[#8c6759]">Earn 50 more points to claim delicious garlic sticks.</p>
            <div className="pt-2 text-[10px] font-bold text-amber-700">50 pts to unlock</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#ede2d5] space-y-1 opacity-90">
            <div className="text-xs font-black uppercase text-[#8c6759]">250 Points</div>
            <div className="font-bold text-sm text-[#502314]">Free Medium Margherita</div>
            <p className="text-[11px] text-[#8c6759]">Gold Crown reward for our loyal pizza lovers.</p>
            <div className="pt-2 text-[10px] font-bold text-amber-700">200 pts to unlock</div>
          </div>
        </div>
      </div>
    </div>
  );
};
