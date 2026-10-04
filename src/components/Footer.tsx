import React, { useState } from 'react';
import { Droplet, Linkedin, Instagram, Github, Youtube, ArrowUpRight, ShieldCheck, Heart } from 'lucide-react';
import { SquadLogo } from './SquadLogo';

const XIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenReport: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenReport }) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [ripplePos, setRipplePos] = useState<{ id: string; x: number; y: number } | null>(null);

  const socialHandles = [
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      url: 'https://linkedin.com',
      brandBg: 'hover:bg-[#0A66C2] hover:border-[#0A66C2]',
      brandGlow: 'hover:shadow-[0_0_25px_rgba(10,102,194,0.7)]',
      tooltip: 'Connect on LinkedIn',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      url: 'https://www.instagram.com/the_streamline_squad?igsh=MTVvbGJobXMwZmhkag%3D%3D&utm_source=qr',
      brandBg: 'hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:border-transparent',
      brandGlow: 'hover:shadow-[0_0_25px_rgba(220,39,67,0.7)]',
      tooltip: 'Follow @the_streamline_squad on Instagram',
    },
    {
      id: 'x',
      name: 'X',
      icon: XIcon,
      url: 'https://x.com',
      brandBg: 'hover:bg-white hover:text-black hover:border-white',
      brandGlow: 'hover:shadow-[0_0_25px_rgba(255,255,255,0.7)]',
      tooltip: 'Follow on X',
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: Github,
      url: 'https://github.com',
      brandBg: 'hover:bg-[#24292E] hover:border-[#24292E]',
      brandGlow: 'hover:shadow-[0_0_25px_rgba(255,255,255,0.3)]',
      tooltip: 'Hydrological Source Code',
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: Youtube,
      url: 'https://youtube.com',
      brandBg: 'hover:bg-[#FF0000] hover:border-[#FF0000]',
      brandGlow: 'hover:shadow-[0_0_25px_rgba(255,0,0,0.7)]',
      tooltip: 'DIY Video Tutorials',
    },
  ];

  const handleSocialClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipplePos({
      id,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setTimeout(() => setRipplePos(null), 600);
  };

  return (
    <footer className="bg-[#0B0F19] border-t border-white/10 pt-16 pb-12 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-[#38BDF8]/5 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Multi-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          
          {/* Left Column: Brand & Status */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/20 border border-[#38BDF8]/40 flex items-center justify-center">
                <SquadLogo className="w-6 h-6" />
              </div>
              <span className="font-display font-extrabold text-xl text-white">
                The Streamline Squad
              </span>
            </div>

            <p className="text-xs text-[#94A3B8] leading-relaxed max-w-sm">
              An elite civil taskforce deploying kinetic hydrological analysis, automatic municipal office locating, and rapid Nodal Officer escalations across Gurugram & Delhi-NCR.
            </p>

            {/* Server Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
              <span className="text-[#10B981] font-bold">🟢 All Systems Operational</span>
              <span className="text-[#94A3B8] text-[10px]">| Node v22.14</span>
            </div>
          </div>

          {/* Center Column: Quick Navigation */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-mono uppercase text-[#38BDF8] tracking-widest font-bold">
              PORTAL NAVIGATION
            </h4>
            <ul className="space-y-2 text-xs font-medium text-[#94A3B8]">
              <li>
                <button onClick={() => onNavigate('hub')} className="hover:text-white transition-colors">
                  Action Hub
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('reporting')} className="hover:text-white transition-colors">
                  Smart Incident Reporting Engine
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('guides')} className="hover:text-white transition-colors">
                  DIY Community Action Toolkits
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('roster')} className="hover:text-white transition-colors">
                  Crew Operations Roster
                </button>
              </li>
              <li>
                <button onClick={onOpenReport} className="text-[#EF4444] font-bold hover:underline">
                  Emergency Hazard Report →
                </button>
              </li>
            </ul>
          </div>

          {/* Right Column: Interactive Magnetic Social Hub */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-mono uppercase text-[#38BDF8] tracking-widest font-bold">
              CONNECTED SQUAD NETWORK
            </h4>
            <p className="text-xs text-[#94A3B8]">
              Follow our on-ground community audits, open-source codebases, and direct broadcast bots.
            </p>

            {/* Social Handles Row */}
            <div className="flex items-center gap-3 flex-wrap">
              {socialHandles.map((handle) => {
                const Icon = handle.icon;
                return (
                  <div key={handle.id} className="relative">
                    <a
                      href={handle.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-social="true"
                      data-cursor="social"
                      onMouseEnter={() => setActiveTooltip(handle.id)}
                      onMouseLeave={() => setActiveTooltip(null)}
                      onClick={(e) => handleSocialClick(e, handle.id)}
                      className={`relative overflow-hidden w-11 h-11 rounded-2xl bg-slate-900 border border-white/10 text-white flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${handle.brandBg} ${handle.brandGlow}`}
                    >
                      <Icon className="w-5 h-5 relative z-10" />

                      {/* Ripple click animation */}
                      {ripplePos && ripplePos.id === handle.id && (
                        <span
                          className="absolute bg-white/40 rounded-full animate-ping pointer-events-none"
                          style={{
                            left: ripplePos.x - 10,
                            top: ripplePos.y - 10,
                            width: 20,
                            height: 20,
                          }}
                        />
                      )}
                    </a>

                    {/* Tooltip Popup */}
                    {activeTooltip === handle.id && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md bg-slate-900 text-white text-[10px] font-mono whitespace-nowrap border border-white/20 shadow-lg pointer-events-none z-30 animate-fadeIn">
                        {handle.tooltip}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#94A3B8] gap-4">
          <p>© 2026 The Streamline Squad. Built for Civic Hydrological & Sewerage Action.</p>
        </div>

      </div>
    </footer>
  );
};
