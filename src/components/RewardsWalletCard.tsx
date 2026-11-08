import React, { useState } from 'react';
import { Crown, Sparkles, ArrowRight, CheckCircle2, X } from 'lucide-react';

interface RewardsWalletCardProps {
  walletBalance: number;
  crownPoints: number;
  onRedeem: () => void;
  isRedeemed?: boolean;
}

export const RewardsWalletCard: React.FC<RewardsWalletCardProps> = ({
  walletBalance,
  crownPoints,
  onRedeem,
  isRedeemed = false,
}) => {
  const [showKnowMoreModal, setShowKnowMoreModal] = useState(false);

  return (
    <>
      <section className="w-full px-3 sm:px-6 py-3 max-w-6xl mx-auto">
        <div className="relative bg-white rounded-3xl p-5 sm:p-6 border border-[#ece0d2] shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 overflow-hidden">
          {/* Subtle gold crown watermark background */}
          <div className="absolute -right-4 -bottom-4 text-amber-100 opacity-60 pointer-events-none select-none">
            <Crown className="w-28 h-28 stroke-[1.2]" />
          </div>

          {/* Left info */}
          <div className="flex items-start gap-3.5 z-10 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ea580c] to-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <Crown className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3
                  className="font-black text-base sm:text-lg text-[#502314] uppercase tracking-tight font-bk truncate"
                >
                  Hacky Wallet Balance: ₹{walletBalance}
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-300">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  {crownPoints} Crown Pts
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#71594f] font-medium leading-relaxed">
                Redeem your Hacky Wallet cashback on any wood-fired pizza order.
              </p>
            </div>
          </div>

          {/* Right Action Button & Link */}
          <div className="flex flex-wrap items-center gap-3 z-10 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={onRedeem}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md flex items-center gap-1.5 ${
                isRedeemed
                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                  : 'bg-[#ea580c] hover:bg-[#c2410c] active:scale-95 text-white'
              }`}
            >
              {isRedeemed ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>₹50 Applied In Cart</span>
                </>
              ) : (
                <>
                  <span>Redeem Points Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowKnowMoreModal(true)}
              className="text-xs font-bold text-[#8c6759] hover:text-[#502314] underline underline-offset-2 cursor-pointer transition-colors"
            >
              Know More
            </button>
          </div>
        </div>
      </section>

      {/* Know More Modal */}
      {showKnowMoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setShowKnowMoreModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />
          <div className="relative w-full max-w-md bg-[#fffaf0] rounded-3xl shadow-2xl border border-[#ecdccb] p-6 z-10 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#f0e2d4] pb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <h4 className="font-black text-lg text-[#502314] uppercase font-bk">
                  Hacky Crown Rewards
                </h4>
              </div>
              <button
                onClick={() => setShowKnowMoreModal(false)}
                className="p-1 hover:bg-black/5 rounded-lg text-zinc-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#71594f] leading-relaxed">
              <div className="p-3 bg-white rounded-2xl border border-[#ede3d7] space-y-1">
                <div className="font-bold text-[#502314] text-sm">How it works:</div>
                <p>• Earn 1 Crown Point for every ₹10 spent at Hacky Pizza Town.</p>
                <p>• 1 Crown Point = ₹1 flat discount at checkout.</p>
                <p>• New users get instant ₹50 welcome cashback in Mahmudabad!</p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900">
                <strong>Pro Tip:</strong> Crown points can be clubbed with coupons like <strong>HACKY50</strong> for massive double savings!
              </div>
            </div>

            <button
              onClick={() => {
                setShowKnowMoreModal(false);
                onRedeem();
              }}
              className="w-full py-3 bg-[#ea580c] hover:bg-[#c2410c] text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer"
            >
              Got it, Redeem ₹50
            </button>
          </div>
        </div>
      )}
    </>
  );
};
