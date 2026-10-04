import React, { useState, useEffect } from 'react';
import { Droplet, AlertTriangle, MapPin, Wrench, Users, Shield, ArrowUpRight } from 'lucide-react';
import { SquadLogo } from './SquadLogo';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenReportModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenReportModal }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'hub', label: 'Action Hub', icon: Droplet },
    { id: 'reporting', label: 'Smart Incident Engine', icon: AlertTriangle },
    { id: 'guides', label: 'DIY Toolkits', icon: Wrench },
    { id: 'roster', label: 'Squad Roster', icon: Users },
  ];

  return (
    <>
      {/* Top Fixed Gradient Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-slate-900 z-[100]">
        <div
          className="h-full bg-gradient-to-r from-[#38BDF8] via-[#10B981] to-[#38BDF8] transition-all duration-150 ease-out shadow-[0_0_10px_#38BDF8]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Sticky Glassmorphic Header */}
      <header
        className={`fixed top-[3px] left-0 right-0 z-[90] transition-all duration-300 ${
          scrolled ? 'bg-[#0B0F19]/90 backdrop-blur-xl border-b border-white/10 py-2.5 sm:py-3 shadow-2xl' : 'bg-transparent py-3 sm:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Squad Emblem / Brand */}
            <button
              onClick={() => setActiveTab('hub')}
              className="flex items-center gap-2 sm:gap-3 group text-left focus:outline-none"
            >
              <div className="relative flex items-center justify-center w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#38BDF8]/20 to-[#0F172A] border border-[#38BDF8]/40 group-hover:border-[#38BDF8] transition-all duration-300 group-hover:scale-105 shadow-[0_0_15px_rgba(56,189,248,0.2)] shrink-0">
                <SquadLogo className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 group-hover:scale-110 transition-transform" />
                <span className="absolute -bottom-1 -right-1 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-[#10B981]"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-display font-extrabold text-xs xs:text-sm sm:text-xl tracking-tight text-white group-hover:text-[#38BDF8] transition-colors whitespace-nowrap">
                    The Streamline Squad
                  </span>
                  <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-md bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20">
                    CIVIC PORTAL
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#94A3B8] hidden sm:block">Hydrological & Sewerage Task Force</p>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 p-1.5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                      isActive
                        ? 'bg-[#38BDF8] text-[#0B0F19] shadow-[0_0_15px_rgba(56,189,248,0.4)] font-bold'
                        : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#0B0F19]' : 'text-[#38BDF8]'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Quick Trigger Button */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={onOpenReportModal}
                data-emergency="true"
                className="relative group overflow-hidden rounded-xl px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white font-display font-bold text-[11px] sm:text-sm tracking-wider uppercase flex items-center gap-1.5 sm:gap-2 shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.7)] transition-all duration-300 active:scale-95 min-h-[40px] sm:min-h-[44px]"
              >
                <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-bounce" />
                <span>Report Issue</span>
                <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform hidden xs:inline-block" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-[#0B0F19]/95 backdrop-blur-xl border-t border-white/10 px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-5px_25px_rgba(0,0,0,0.8)] flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl min-h-[48px] min-w-[64px] transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'bg-[#38BDF8]/15 text-[#38BDF8] font-bold border border-[#38BDF8]/30 shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#38BDF8] scale-110' : 'text-[#94A3B8]'}`} />
              <span className="text-[10px] font-mono tracking-tight mt-0.5">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
