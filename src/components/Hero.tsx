import React, { useState, useEffect } from 'react';
import { ShieldAlert, MapPin, ArrowRight, Sparkles, Droplet, Radio, Building2, Navigation, Clock } from 'lucide-react';
import { SquadLogo } from './SquadLogo';

interface HeroProps {
  onOpenReport: () => void;
  onNavigateTab: (tab: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenReport, onNavigateTab }) => {
  const [liveCount, setLiveCount] = useState<number>(10);

  useEffect(() => {
    fetch('/api/live-marquee')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.items && data.items.length > 0) {
          setLiveCount(data.items.length);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="relative pt-20 pb-12 sm:pt-28 sm:pb-16 md:pt-36 md:pb-24 overflow-hidden bg-grid-pattern">
      {/* Background glowing light gradient orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[#38BDF8]/10 rounded-full blur-[90px] sm:blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-[#10B981]/10 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* Top Eyebrow Tag */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-slate-900/80 border border-[#38BDF8]/40 text-[#38BDF8] text-[11px] sm:text-xs font-mono font-bold mb-4 sm:mb-6 backdrop-blur-md shadow-[0_0_15px_rgba(56,189,248,0.2)]">
          <SquadLogo className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span>THE STREAMLINE SQUAD • CIVIC TASK FORCE</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-7xl font-display font-extrabold text-white tracking-tight max-w-5xl mx-auto leading-[1.15] mb-4 sm:mb-6">
          Instant Citizen Action for Local <span className="bg-gradient-to-r from-[#38BDF8] via-[#10B981] to-[#38BDF8] bg-clip-text text-transparent">Drainage & Sewerage</span> Crises.
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-lg text-[#94A3B8] max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10 px-2 sm:px-0">
          Report urban waterlogging, broken sewers, and open manholes in seconds. Our AI engine generates instant CPCB escalation receipts and routes tickets directly to regional Nodal Officers.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-xl mx-auto mb-10 sm:mb-16 w-full">
          
          <button
            onClick={onOpenReport}
            data-emergency="true"
            data-cursor="form"
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 min-h-[48px] rounded-2xl bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white font-display font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 sm:gap-3 shadow-[0_0_25px_rgba(239,68,68,0.5)] hover:shadow-[0_0_35px_rgba(239,68,68,0.8)] transition-all active:scale-95"
          >
            <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse shrink-0" />
            <span>Report Civic Crisis Now</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>

          <button
            onClick={() => onNavigateTab('reporting')}
            data-cursor="form"
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 min-h-[48px] rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-white font-display font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 border border-white/10 transition-all hover:border-[#38BDF8]/40"
          >
            <Sparkles className="w-4 h-4 text-[#38BDF8] shrink-0" />
            <span>Smart AI Analysis Engine</span>
          </button>

        </div>

        {/* Quick Official Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 max-w-5xl mx-auto text-left">
          
          {/* Real-time Live Incidents Stream */}
          <div className="p-3.5 sm:p-5 rounded-2xl glass-panel border border-white/10 relative overflow-hidden group hover:border-[#EF4444]/50 transition-all">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xl sm:text-3xl font-display font-extrabold text-[#EF4444] flex items-center gap-1.5 sm:gap-2">
                <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-[#EF4444]"></span>
                </span>
                {liveCount} LIVE
              </span>
              <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#EF4444]" />
            </div>
            <p className="text-[10px] sm:text-xs font-mono font-bold text-white uppercase tracking-wider">REAL-TIME MEDIA</p>
            <p className="text-[10px] sm:text-[11px] font-mono text-[#94A3B8] mt-0.5 line-clamp-1">Google News Feed</p>
          </div>

          {/* Official Municipal Portal Direct Integration */}
          <div className="p-3.5 sm:p-5 rounded-2xl glass-panel border border-white/10 group hover:border-[#38BDF8]/50 transition-all">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xl sm:text-3xl font-display font-extrabold text-[#38BDF8]">
                CPCB & MCG
              </span>
              <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#38BDF8]" />
            </div>
            <p className="text-[10px] sm:text-xs font-mono font-bold text-white uppercase tracking-wider">DIRECT ESCALATION</p>
            <p className="text-[10px] sm:text-[11px] font-mono text-[#94A3B8] mt-0.5 line-clamp-1">Swachhata Urban</p>
          </div>

          {/* Precision Real-time GPS Location */}
          <div className="p-3.5 sm:p-5 rounded-2xl glass-panel border border-white/10 group hover:border-[#10B981]/50 transition-all">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xl sm:text-3xl font-display font-extrabold text-[#10B981]">
                ±5m GPS
              </span>
              <Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#10B981]" />
            </div>
            <p className="text-[10px] sm:text-xs font-mono font-bold text-white uppercase tracking-wider">GEO-PINPOINT</p>
            <p className="text-[10px] sm:text-[11px] font-mono text-[#94A3B8] mt-0.5 line-clamp-1">OpenStreetMap</p>
          </div>

          {/* Regional Municipal Command Hubs */}
          <div className="p-3.5 sm:p-5 rounded-2xl glass-panel border border-white/10 group hover:border-[#F59E0B]/50 transition-all">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xl sm:text-3xl font-display font-extrabold text-[#F59E0B]">
                5 ZONES
              </span>
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F59E0B]" />
            </div>
            <p className="text-[10px] sm:text-xs font-mono font-bold text-white uppercase tracking-wider">MCG & GMDA</p>
            <p className="text-[10px] sm:text-[11px] font-mono text-[#94A3B8] mt-0.5 line-clamp-1">Gurugram Water Command</p>
          </div>

        </div>

      </div>
    </section>
  );
};

