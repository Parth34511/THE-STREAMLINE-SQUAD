import React, { useState, useEffect } from 'react';
import { SQUAD_MEMBERS } from '../data/mockData';
import { DepartmentType, TeamMember } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Mail, MapPin, Sparkles, Activity, CheckCircle, ShieldCheck, X } from 'lucide-react';

export const TeamRoster: React.FC = () => {
  const [selectedDept, setSelectedDept] = useState<DepartmentType>('ALL MEMBERS');
  const [activeMemberModal, setActiveMemberModal] = useState<TeamMember | null>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (activeMemberModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeMemberModal]);

  const departments: DepartmentType[] = [
    'ALL MEMBERS',
    'ADMINISTRATION',
    'COMMUNITY AUDITS',
    'TECHNICAL GUIDANCE',
    'SCRIPT & WORKSHOPS',
  ];

  const filteredMembers = SQUAD_MEMBERS.filter((m) => {
    if (selectedDept === 'ALL MEMBERS') return true;
    return m.department === selectedDept;
  });

  return (
    <section className="py-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8] text-xs font-mono mb-3">
            <Users className="w-3.5 h-3.5" />
            CREW OPERATIONS & SUPPORT ROSTER
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            Meet "The Streamline Squad" Command
          </h2>
          <p className="text-sm text-[#94A3B8] mt-2 max-w-xl mx-auto">
            11 dedicated civil specialists, hydraulic engineers, community auditors, and script facilitators coordinating rapid monsoonal response.
          </p>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
          {departments.map((dept) => {
            const isActive = selectedDept === dept;
            return (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                data-cursor="form"
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all duration-300 ${
                  isActive
                    ? 'bg-[#38BDF8] text-[#0B0F19] shadow-[0_0_20px_rgba(56,189,248,0.4)] scale-105'
                    : 'bg-slate-900/60 text-[#94A3B8] hover:text-white border border-white/10 hover:border-white/20'
                }`}
              >
                {dept}
              </button>
            );
          })}
        </div>

        {/* Framer Motion Layout Reordering Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {filteredMembers.map((member) => (
              <motion.div
                key={member.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                onClick={() => setActiveMemberModal(member)}
                data-cursor="form"
                className="glass-panel rounded-3xl p-5 border border-white/10 hover:border-[#38BDF8]/50 transition-all duration-300 group cursor-pointer flex flex-col justify-between hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
              >
                <div>
                  {/* Avatar */}
                  <div className="relative h-44 rounded-2xl overflow-hidden mb-4 bg-slate-800">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 brightness-90 group-hover:brightness-100"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md text-[#38BDF8] text-[10px] font-mono font-bold uppercase border border-white/10">
                        {member.department}
                      </span>
                    </div>
                  </div>

                  {/* Name & Role */}
                  <h3 className="font-display font-extrabold text-lg text-white group-hover:text-[#38BDF8] transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-xs font-mono text-[#38BDF8] mb-2 font-medium">
                    {member.role}
                  </p>
                  <p className="text-xs text-[#94A3B8] line-clamp-2 leading-relaxed mb-4">
                    {member.bio}
                  </p>
                </div>

                {/* Footer Active Task Indicator */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-300">
                  <span className="flex items-center gap-1 text-[#10B981]">
                    <Activity className="w-3.5 h-3.5 animate-pulse" />
                    Active Duty
                  </span>
                  <span className="text-[#38BDF8] font-bold group-hover:underline">View Profile →</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Member Profile Modal */}
        {activeMemberModal && (
          <div
            className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fadeIn overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) setActiveMemberModal(null);
            }}
          >
            <div className="max-w-md w-full glass-panel rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-white/20 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setActiveMemberModal(null)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 w-10 h-10 rounded-full bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all z-20 border border-white/10 shadow-lg active:scale-95"
                aria-label="Close profile modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <img
                  src={activeMemberModal.avatar}
                  alt={activeMemberModal.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#38BDF8] shrink-0"
                />
                <div>
                  <span className="px-2.5 py-0.5 rounded bg-[#38BDF8]/15 text-[#38BDF8] text-[10px] font-mono font-bold uppercase border border-[#38BDF8]/30">
                    {activeMemberModal.department}
                  </span>
                  <h3 className="text-xl font-display font-bold text-white mt-1">{activeMemberModal.name}</h3>
                  <p className="text-xs font-mono text-[#38BDF8]">{activeMemberModal.role}</p>
                </div>
              </div>

              <div className="space-y-4 text-xs text-slate-300 mb-6">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                  <strong className="font-mono text-[#94A3B8] uppercase block mb-1">BIOGRAPHY</strong>
                  <p className="leading-relaxed">{activeMemberModal.bio}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                  <strong className="font-mono text-[#10B981] uppercase block mb-1 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" /> CURRENT ACTIVE ASSIGNMENT
                  </strong>
                  <p className="text-white font-medium">{activeMemberModal.activeTask}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                  <strong className="font-mono text-[#38BDF8] uppercase block mb-1">CORE SKILLS</strong>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {activeMemberModal.skills.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px] font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={`mailto:${activeMemberModal.email}`}
                  className="flex-1 py-3 rounded-xl bg-[#38BDF8] text-[#0B0F19] font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white transition-all shadow-[0_0_15px_rgba(56,189,248,0.4)] active:scale-95"
                >
                  <Mail className="w-4 h-4" />
                  <span>Contact {activeMemberModal.name.split(' ')[0]}</span>
                </a>
                <button
                  onClick={() => setActiveMemberModal(null)}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-display font-bold text-xs uppercase tracking-wider transition-all border border-white/10 active:scale-95"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
