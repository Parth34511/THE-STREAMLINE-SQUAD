import React, { useState } from 'react';
import { DIY_GUIDES } from '../data/mockData';
import { DIYGuide } from '../types';
import { Wrench, Search, Clock, ShieldAlert, CheckSquare, ChevronDown, ChevronUp, Sparkles, BookOpen } from 'lucide-react';

export const DIYGuides: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [openGuideId, setOpenGuideId] = useState<string | null>(DIY_GUIDES[0].id);

  const filteredGuides = DIY_GUIDES.filter((guide) => {
    const matchesSearch =
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiff = selectedDifficulty === 'ALL' || guide.difficulty === selectedDifficulty;
    return matchesSearch && matchesDiff;
  });

  return (
    <section className="py-12 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-xs font-mono mb-3">
            <Wrench className="w-3.5 h-3.5" />
            DIY COMMUNITY ACTION TOOLKITS
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            Practical Guides for Neighborhood Hydrological Fixes
          </h2>
          <p className="text-sm text-[#94A3B8] mt-2 max-w-xl mx-auto">
            Empowering residents and RWAs with certified protocols to mitigate localized waterlogging, unblock entry grates, and install silt traps.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#38BDF8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides (e.g. Catch Pits, Sand-Trap)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-base sm:text-xs focus:border-[#38BDF8] focus:outline-none min-h-[44px]"
            />
          </div>

          {/* Difficulty Chips */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['ALL', 'Easy', 'Intermediate', 'Advanced'].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3.5 py-2 min-h-[40px] rounded-lg text-xs font-mono font-bold transition-all shrink-0 ${
                  selectedDifficulty === diff
                    ? 'bg-[#38BDF8] text-[#0B0F19]'
                    : 'bg-slate-900/60 text-[#94A3B8] hover:text-white border border-white/5'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {filteredGuides.map((guide) => {
            const isOpen = openGuideId === guide.id;
            return (
              <div
                key={guide.id}
                className={`glass-panel rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen ? 'border-[#38BDF8]/40 shadow-[0_0_25px_rgba(56,189,248,0.15)] bg-slate-900/80' : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* Accordion Header Bar */}
                <div
                  onClick={() => setOpenGuideId(isOpen ? null : guide.id)}
                  data-cursor="form"
                  className="p-5 sm:p-6 cursor-pointer flex items-center justify-between gap-4 select-none"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8] flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-[#38BDF8] uppercase border border-white/10">
                          {guide.category}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#10B981]/15 text-[10px] font-mono text-[#10B981] uppercase font-bold border border-[#10B981]/30">
                          {guide.difficulty}
                        </span>
                        <span className="text-xs font-mono text-[#94A3B8] hidden sm:flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {guide.duration}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-display font-bold text-white group-hover:text-[#38BDF8] transition-colors">
                        {guide.title}
                      </h3>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center shrink-0">
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

                {/* Expanded Accordion Content */}
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-white/10 space-y-6 animate-fadeIn">
                    
                    {/* Summary */}
                    <p className="text-sm text-[#94A3B8] leading-relaxed">
                      {guide.summary}
                    </p>

                    {/* Tools Needed */}
                    <div>
                      <h4 className="text-xs font-mono text-[#38BDF8] uppercase font-bold tracking-wider mb-2">
                        REQUIRED EQUIPMENT & TOOLS
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {guide.toolsNeeded.map((tool, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-lg bg-slate-800 text-xs font-mono text-slate-200 border border-white/10"
                          >
                            🛠️ {tool}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Safety Warning */}
                    <div className="p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-xs flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-mono uppercase block mb-0.5">CRITICAL SAFETY PROTOCOL</strong>
                        <span>{guide.safetyWarning}</span>
                      </div>
                    </div>

                    {/* Step-by-Step Instructions */}
                    <div>
                      <h4 className="text-xs font-mono text-[#10B981] uppercase font-bold tracking-wider mb-3">
                        STEP-BY-STEP ACTION PROTOCOL
                      </h4>
                      <div className="space-y-3">
                        {guide.steps.map((stepText, stepIdx) => (
                          <div
                            key={stepIdx}
                            className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-start gap-3"
                          >
                            <span className="w-6 h-6 rounded-full bg-[#10B981] text-[#0B0F19] font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {stepIdx + 1}
                            </span>
                            <p className="text-xs text-slate-200 leading-relaxed">
                              {stepText}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
