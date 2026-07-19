import React from 'react';
import { 
  Sparkle, ArrowUpRight, Coins, Wallet, Globe, 
  Activity, TrendingUp, RefreshCw, Box, Layers 
} from 'lucide-react';



interface FeaturesGridProps {
  onNavigate?: () => void;
}

const FeaturesGrid: React.FC<FeaturesGridProps> = ({ onNavigate }) => {
  const row1Icons = [Coins, Wallet, Globe, Activity, TrendingUp, RefreshCw, Box, Layers];
  const row2Icons = [Activity, Box, TrendingUp, Layers, Coins, Wallet, Globe, RefreshCw];

  return (
    <section id="corridors" className="w-full bg-transparent text-white font-inter antialiased px-4 sm:px-6 md:px-10 lg:px-14 py-20 lg:py-24 lg:min-h-screen flex flex-col relative z-20">
      
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 max-w-7xl mx-auto w-full">
        <div className="max-w-3xl">
          <h2 className="text-[28px] sm:text-3xl md:text-4xl lg:text-[44px] leading-[1.15] font-normal tracking-tight mb-4">
            AnchorVault Liquidity Features
          </h2>
          <p className="text-sm md:text-[15px] leading-[1.6] text-white/60">
            A trustless EVM routing engine bridging idle stablecoins with Robinhood Chain anchor corridors. With robust smart contracts behind us, we help liquidity move with focus and intention.
          </p>
        </div>
        <button className="liquid-glass rounded-full px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-medium hover:brightness-110 transition-all shrink-0">
          Launch DeFi Portal
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 flex-1 max-w-7xl mx-auto w-full">
        
        {/* Column 1 - Background card */}
        <div className="rounded-2xl bg-[#1e103c]/60 border border-[#00C805]/30 relative overflow-hidden flex flex-col justify-between p-6 min-h-[320px] md:min-h-[400px] shadow-lg shadow-[#00C805]/10">
          <video 
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260507_150203_44a5bd32-516a-47ce-a077-8acbf9aa8991.mp4" 
            className="absolute inset-0 w-full h-full object-cover opacity-80"
            autoPlay loop muted playsInline 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />
          
          <div className="relative z-10 flex items-center justify-center gap-3">
            <Sparkle className="h-3 w-3 stroke-[1.5px] text-white/70" />
            <span className="uppercase tracking-[0.22em] text-[11px] text-white/70 font-semibold">ON-CHAIN</span>
            <Sparkle className="h-3 w-3 stroke-[1.5px] text-white/70" />
          </div>

          <div className="relative z-10 mt-auto grid grid-cols-[auto_auto_1fr] gap-x-4 gap-y-5 items-center text-[13px] sm:text-sm font-medium">
            <span className="text-white">2026 - Upcoming</span>
            <Sparkle className="h-3.5 w-3.5 text-white/60" />
            <span className="text-white/80">Live on EVM Mainnet</span>
          </div>
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-4 md:gap-5 md:grid md:grid-rows-[auto_1fr]">
          
          {/* Top - Client Voice */}
          <div className="rounded-2xl bg-[#002b36]/60 border border-[#00e5ff]/20 p-5 md:p-6 noise-overlay relative overflow-hidden flex flex-col gap-4 shadow-lg shadow-[#00e5ff]/10">
            <div className="relative z-10 flex items-center justify-start gap-3">
              <Sparkle className="h-3 w-3 stroke-[1.5px] text-white/70" />
              <span className="uppercase tracking-[0.22em] text-[11px] text-white/70 font-semibold">ANCHOR TESTIMONIAL</span>
              <Sparkle className="h-3 w-3 stroke-[1.5px] text-white/70" />
            </div>
            <p className="relative z-10 text-[13px] sm:text-[13.5px] leading-[1.6] text-white/85 font-medium italic">
              "AnchorVault reshaped our liquidity management with a degree of finesse and vision that surpassed what we'd hoped for. The on-chain settlements feel graceful, and the yields speak for themselves."
            </p>
            <div className="relative z-10 text-xs text-white/70 mt-2">
              <strong className="text-white">Elena Brooks</strong>, Operations Lead — Anchora
            </div>
          </div>

          {/* Bottom - 10M+ card */}
          <div className="rounded-2xl bg-black/60 border border-white/10 relative overflow-hidden flex flex-col items-center justify-center p-8 min-h-[240px]">
            <video 
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260507_154543_d5b83fc1-9cea-44f3-b5e8-8f325935211a.mp4" 
              className="absolute inset-0 w-full h-full object-cover opacity-70"
              autoPlay loop muted playsInline 
            />
            <div className="relative z-10 text-5xl sm:text-6xl md:text-7xl lg:text-[88px] font-light tracking-tight drop-shadow-xl mb-2">
              42M+
            </div>
            <div className="relative z-10 text-white/85 text-sm font-medium">
              USDC Settled On-Chain
            </div>
          </div>

        </div>

        {/* Column 3 */}
        <div className="flex flex-col gap-4 md:gap-5 md:grid md:grid-rows-[1fr_auto]">
          
          {/* Top - Daily Software */}
          <div className="rounded-2xl bg-black/60 border border-white/10 relative overflow-hidden p-6 flex flex-col min-h-[280px]">
            <video 
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260507_153148_d7a3e1dd-e5d0-4ce6-8306-00d7522ecc44.mp4" 
              className="absolute inset-0 w-full h-full object-cover opacity-60"
              autoPlay loop muted playsInline 
            />
            <div className="relative z-10 flex items-center justify-center gap-3 mb-8">
              <Sparkle className="h-3 w-3 stroke-[1.5px] text-white/70" />
              <span className="uppercase tracking-[0.22em] text-[11px] text-white/70 font-semibold">SUPPORTED ASSETS</span>
              <Sparkle className="h-3 w-3 stroke-[1.5px] text-white/70" />
            </div>

            <div className="relative z-10 flex-1 flex flex-col gap-4 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
              {/* Row 1 */}
              <div className="flex w-max animate-marquee-left gap-4">
                {[...row1Icons, ...row1Icons].map((Icon, idx) => (
                  <div key={`r1-${idx}`} className="liquid-glass h-14 w-14 md:h-16 md:w-16 rounded-xl flex items-center justify-center shrink-0">
                    <Icon className="h-6 w-6 stroke-[1.5px] text-white/90" />
                  </div>
                ))}
              </div>
              {/* Row 2 */}
              <div className="flex w-max animate-marquee-right gap-4">
                {[...row2Icons, ...row2Icons].map((Icon, idx) => (
                  <div key={`r2-${idx}`} className="liquid-glass h-14 w-14 md:h-16 md:w-16 rounded-xl flex items-center justify-center shrink-0">
                    <Icon className="h-6 w-6 stroke-[1.5px] text-white/90" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom - Reach Me */}
          <div 
            onClick={() => onNavigate ? onNavigate() : undefined}
            className="rounded-2xl bg-[#1e3a8a]/40 border border-blue-500/20 hover:border-blue-500/40 p-5 md:p-6 noise-overlay relative overflow-hidden flex flex-col shadow-lg shadow-blue-500/10 cursor-pointer transition-all group"
          >
            <div className="relative z-10 flex items-center justify-start gap-3 mb-6">
              <Sparkle className="h-3 w-3 stroke-[1.5px] text-white/70" />
              <span className="uppercase tracking-[0.22em] text-[11px] text-white/70 font-semibold">SMART CONTRACTS</span>
              <Sparkle className="h-3 w-3 stroke-[1.5px] text-white/70" />
            </div>
            <div className="relative z-10 flex justify-between items-end">
              <div className="flex flex-col gap-1 font-medium">
                <span className="text-sm text-white group-hover:text-blue-300 transition-colors">core_vault.wasm</span>
                <span className="text-sm text-white/60 group-hover:text-blue-200 transition-colors">anchor_registry.wasm</span>
              </div>
              <button className="h-9 w-9 rounded-full bg-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shrink-0 cursor-pointer">
                <ArrowUpRight className="h-5 w-5 text-black stroke-[2px]" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
