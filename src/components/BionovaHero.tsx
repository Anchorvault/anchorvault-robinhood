import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { Play, ArrowUpRight, ArrowRight } from 'lucide-react';

const BionovaHero: React.FC = () => {
  const videoRefs = [useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null)];
  const streams = [
    'https://stream.mux.com/1RdbcBtpEUK6501pc6yaIvwo9UfSnOg02k1uHxat00xR3w.m3u8',
    'https://stream.mux.com/t1TbTB8M1VYHkhxBuap4A8Vm1x015HTHyuQxqchDBago.m3u8',
    'https://stream.mux.com/6yvj9SR5bjmXq9N3ak7gy427RwUs8R2ZoH4ndA7Q1018.m3u8'
  ];

  useEffect(() => {
    videoRefs.forEach((ref, index) => {
      const video = ref.current;
      if (!video) return;

      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: false });
        hls.loadSource(streams[index]);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(e => console.error("Autoplay prevented:", e));
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streams[index];
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(e => console.error("Autoplay prevented:", e));
        });
      }
    });
  }, []);

  return (
    <section className="relative w-full min-h-screen lg:h-screen flex flex-col bg-transparent text-white font-poppins lg:overflow-hidden z-20">
      {/* Content Area */}
      <div className="flex-1 px-5 lg:px-16 pb-8 lg:pb-[82px] w-full mx-auto flex flex-col relative z-20">
        <div className="grid lg:grid-cols-2 gap-8 items-stretch flex-1">
          
          {/* Left Column */}
          <div className="flex flex-col justify-between animate-fade-up">
            
            {/* Top group */}
            <div className="pt-4 lg:pt-10 flex flex-col items-start">
              <h1 className="text-[2rem] sm:text-5xl lg:text-[3.5rem] xl:text-7xl leading-[1.08] tracking-tight font-normal">
                <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
                  <div 
                    className="w-20 h-10 sm:w-24 sm:h-12 rounded-full bg-cover bg-center inline-block shrink-0 shadow-sm border border-white/20" 
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=300&q=80')" }}
                  />
                  <span>World-class</span>
                </div>
                <div className="mt-1">liquidity that</div>
                <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-1">
                  <span>empowers</span>
                  <button className="border-2 border-white/20 rounded-full flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 hover:bg-white/10 transition-colors">
                    <span className="bg-white text-black p-1 sm:p-1.5 rounded-full flex items-center justify-center">
                      <Play className="w-2 h-2 sm:w-3 sm:h-3 fill-current" />
                    </span>
                    <span className="text-xs sm:text-sm font-medium tracking-normal text-white">How it works</span>
                  </button>
                </div>
                <div className="mt-1">global corridors</div>
              </h1>

              {/* CTAs */}
              <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <button className="bg-[#00C805] text-white px-6 sm:px-7 py-3 rounded-full font-semibold flex items-center gap-2 hover:brightness-110 transition-all shadow-md shadow-[#00C805]/20 text-sm sm:text-base">
                  Provide Liquidity
                  <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <a href="#" className="underline font-semibold text-sm sm:text-base underline-offset-4 decoration-2 hover:opacity-70 transition-opacity text-white/90">
                  View Registry
                </a>
              </div>
            </div>

            {/* Bottom group */}
            <div className="hidden lg:block mt-12 pb-2">
              <p className="text-sm max-w-md opacity-80 leading-relaxed mb-6 font-medium text-white/80">
                We bridge the gap between decentralized finance and global remittance, enabling seamless on-chain settlement across major active corridors.
              </p>
              <div className="flex items-center flex-wrap gap-8 text-white/50">
                {['Robinhood Chain', 'Robinhood Chain', 'EVM', 'Anchora', 'DeltaPay'].map(logo => (
                  <span key={logo} className="font-bold text-2xl tracking-tighter opacity-70 hover:opacity-100 hover:text-white transition-colors cursor-pointer">
                    {logo}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-3 lg:gap-4 h-[600px] lg:h-auto animate-fade-up" style={{ animationDelay: '150ms' }}>
            
            {/* Card 1 */}
            <div className="rounded-[1.5rem] lg:rounded-[2.5rem] bg-black flex-1 min-h-[200px] lg:min-h-0 relative overflow-hidden group p-5 lg:p-8 flex flex-col justify-between">
              <video 
                ref={videoRefs[0]}
                autoPlay muted loop playsInline preload="auto"
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
              
              <h3 className="relative z-10 text-2xl lg:text-3xl text-white font-medium max-w-[80%] leading-tight">
                If you're ready to earn organic yield, start depositing.
              </h3>
              
              <div className="relative z-10 flex items-end justify-between w-full mt-auto">
                <p className="text-white/85 text-xs lg:text-sm font-medium max-w-[60%]">
                  Provide liquidity to high-performance Robinhood Chain & Robinhood corridors.
                </p>
                <button className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-transform">
                  <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 text-black" />
                </button>
              </div>
            </div>

            {/* Cards 2 & 3 row */}
            <div className="grid grid-cols-2 gap-3 lg:gap-4 flex-1 min-h-[180px] lg:min-h-0">
              
              {/* Card 2 */}
              <div className="rounded-[1.5rem] lg:rounded-[2.5rem] bg-black p-5 lg:p-8 relative overflow-hidden flex flex-col justify-between group">
                <video 
                  ref={videoRefs[1]}
                  autoPlay muted loop playsInline preload="auto"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full w-auto h-auto scale-150 opacity-70 group-hover:opacity-90 transition-opacity duration-700 pointer-events-none"
                />
                <div className="absolute inset-0 bg-black/30 pointer-events-none" />
                
                <div className="relative z-10 flex items-start justify-between w-full">
                  <span className="bg-white text-black px-3 py-1 rounded-full text-xs font-semibold">corridors</span>
                  <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 hover:scale-105 transition-transform">
                    <ArrowRight className="w-3.5 h-3.5 text-black -rotate-45" />
                  </button>
                </div>
                
                <div className="relative z-10 mt-auto">
                  <h4 className="text-lg lg:text-2xl text-white font-medium mb-1">Global Settlement</h4>
                  <p className="text-xs lg:text-sm text-white/80 font-medium">Real-time settlement across major anchor hubs.</p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="rounded-[1.5rem] lg:rounded-[2.5rem] bg-black p-5 lg:p-8 relative overflow-hidden flex flex-col justify-between group">
                <video 
                  ref={videoRefs[2]}
                  autoPlay muted loop playsInline preload="auto"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full w-auto h-auto scale-[2.8] opacity-70 group-hover:opacity-90 transition-opacity duration-700 pointer-events-none"
                />
                <div className="absolute inset-0 bg-black/30 pointer-events-none" />
                
                <div className="relative z-10">
                  <span className="bg-white text-black px-3 py-1 rounded-full text-xs font-semibold inline-block">anchors</span>
                </div>
                
                <div className="relative z-10 mt-auto">
                  <div className="text-4xl lg:text-7xl text-white font-normal leading-none tracking-tight mb-2">4</div>
                  <p className="text-xs lg:text-sm text-white/80 font-medium leading-tight">Trusted anchors securing our network.</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default BionovaHero;
