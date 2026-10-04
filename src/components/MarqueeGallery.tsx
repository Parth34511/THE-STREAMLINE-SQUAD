import React, { useState, useEffect } from 'react';
import { UrbanWaterIssue } from '../types';
import { AlertCircle, MapPin, ExternalLink, ShieldAlert, Users, ArrowRight, RefreshCw, Radio, X } from 'lucide-react';

interface MarqueeGalleryProps {
  onSelectIssueToReport: (issue: UrbanWaterIssue) => void;
}

export const MarqueeGallery: React.FC<MarqueeGalleryProps> = ({ onSelectIssueToReport }) => {
  const [selectedIssueModal, setSelectedIssueModal] = useState<UrbanWaterIssue | null>(null);
  const [marqueeIssues, setMarqueeIssues] = useState<UrbanWaterIssue[]>([]);
  const [isLiveFeed, setIsLiveFeed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedIssueModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedIssueModal]);

  // Fetch real-time news data on mount
  useEffect(() => {
    const fetchLiveNewsMarquee = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/live-marquee-news');
        if (res.ok) {
          const data = await res.json();
          if (data.items && data.items.length > 0) {
            // Use real-time live items directly for the rolling marquee
            setMarqueeIssues(data.items);
            setIsLiveFeed(true);
          }
        }
      } catch (err) {
        console.warn('Could not load live news feed, using base dataset:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveNewsMarquee();
  }, []);

  // Duplicate list to achieve continuous seamless marquee loop
  const doubleIssues = [...marqueeIssues, ...marqueeIssues];

  return (
    <section className="py-12 relative overflow-hidden">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-xs font-mono font-bold mb-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Radio className="w-4 h-4 text-[#10B981] animate-pulse" />
            <span>{isLiveFeed ? 'REAL-TIME NEWS & INCIDENT FEED ACTIVE' : 'LIVE CIVIC HAZARD MONITOR'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Real-World Urban Water & Drainage Incidents
          </h2>
          <p className="text-sm text-[#94A3B8] mt-1">
            Continuous real-time stream of media news reports, municipal drainage alerts, and submergence hotspots.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {loading && (
            <span className="text-xs font-mono text-[#38BDF8] flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Syncing Live News...
            </span>
          )}
          <div className="text-xs text-[#94A3B8] font-mono flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-white/10">
            <span>HOVER CARDS TO PAUSE / EXPLORE</span>
          </div>
        </div>
      </div>

      {/* Marquee Track Container */}
      <div className="relative w-full overflow-hidden py-4" data-marquee="true">
        {/* Gradient edge fades */}
        <div className="absolute top-0 bottom-0 left-0 w-24 z-10 bg-gradient-to-r from-[#0B0F19] to-transparent pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-24 z-10 bg-gradient-to-l from-[#0B0F19] to-transparent pointer-events-none" />

        <div className="flex gap-6 w-max animate-[marquee_35s_linear_infinite] hover:[animation-play-state:paused] cursor-grab active:cursor-grabbing">
          {doubleIssues.map((issue, idx) => {
            const isCritical = issue.severity === 'CRITICAL_EMERGENCY';
            return (
              <div
                key={`${issue.id}-${idx}`}
                data-cursor="drag"
                onClick={() => setSelectedIssueModal(issue)}
                className="w-[280px] xs:w-[320px] sm:w-[380px] shrink-0 rounded-2xl glass-panel p-4 sm:p-5 group hover:border-[#38BDF8]/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Card Image Banner */}
                  <div className="relative h-44 rounded-xl overflow-hidden mb-4 bg-slate-800">
                    <img
                      src={issue.imageUrl}
                      alt={issue.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-90 group-hover:brightness-100"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider ${
                        isCritical ? 'bg-[#EF4444] text-white shadow-[0_0_10px_rgba(239,68,68,0.6)]' : 'bg-[#38BDF8] text-[#0B0F19]'
                      }`}>
                        {issue.badge}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-mono bg-slate-900/80 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 text-[#F8FAFC]">
                      <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                        <MapPin className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                        {issue.location}
                      </span>
                      <span className="flex items-center gap-1 text-[#10B981] font-bold">
                        <Users className="w-3.5 h-3.5" />
                        {issue.reportedCount} Reports
                      </span>
                    </div>
                  </div>

                  {/* Card Info */}
                  <h3 className="font-display font-bold text-base text-white group-hover:text-[#38BDF8] transition-colors line-clamp-1 mb-2">
                    {issue.title}
                  </h3>
                  <p className="text-xs text-[#94A3B8] line-clamp-2 mb-4 leading-relaxed">
                    {issue.description}
                  </p>
                </div>

                {/* Footer Action inside card */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-[#38BDF8] flex items-center gap-1 truncate">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{issue.category.replace('_', ' ')}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    {(issue as any).newsUrl && (
                      <a
                        href={(issue as any).newsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono font-bold transition-all flex items-center gap-1"
                        title="Read news article"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Article</span>
                      </a>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectIssueToReport(issue);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#38BDF8]/10 hover:bg-[#38BDF8] text-[#38BDF8] hover:text-[#0B0F19] text-xs font-bold transition-all flex items-center gap-1 shrink-0"
                    >
                      <span>Log Similar</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inspection Modal */}
      {selectedIssueModal && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fadeIn overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedIssueModal(null);
          }}
        >
          <div className="max-w-xl w-full glass-panel rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-white/20 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedIssueModal(null)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-10 h-10 rounded-full bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all z-20 border border-white/10 shadow-lg active:scale-95"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative h-44 sm:h-56 rounded-2xl overflow-hidden mb-4 sm:mb-5 bg-slate-800">
              <img src={selectedIssueModal.imageUrl} alt={selectedIssueModal.title} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 rounded-md bg-[#EF4444] text-white text-xs font-mono font-bold uppercase shadow-md">
                  {selectedIssueModal.badge}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#38BDF8] mb-1.5">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="truncate">{selectedIssueModal.location}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-display font-bold text-white mb-2">{selectedIssueModal.title}</h3>
            <p className="text-xs sm:text-sm text-[#94A3B8] mb-6 leading-relaxed">{selectedIssueModal.description}</p>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => {
                  const issueToReport = selectedIssueModal;
                  setSelectedIssueModal(null);
                  onSelectIssueToReport(issueToReport);
                }}
                className="w-full sm:flex-1 py-3 rounded-xl bg-[#38BDF8] text-[#0B0F19] font-display font-bold text-sm hover:bg-white transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(56,189,248,0.4)] active:scale-95"
              >
                <AlertCircle className="w-4 h-4" />
                <span>File Smart Report for this Location</span>
              </button>
              <button
                onClick={() => setSelectedIssueModal(null)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-display font-bold text-sm transition-all border border-white/10 active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Marquee CSS Keyframes */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
};
