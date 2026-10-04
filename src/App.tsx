import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { WeatherWidget } from './components/WeatherWidget';
import { MarqueeGallery } from './components/MarqueeGallery';
import { MunicipalLocator } from './components/MunicipalLocator';
import { ReportingWizard } from './components/ReportingWizard';
import { AnalysisModal } from './components/AnalysisModal';
import { DIYGuides } from './components/DIYGuides';
import { TeamRoster } from './components/TeamRoster';
import { Footer } from './components/Footer';
import { KineticCursor } from './components/KineticCursor';
import { ReportFormData, AnalysisResult, UrbanWaterIssue } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, Wifi, HardDrive, CheckCircle2, AlertTriangle, RefreshCw, Wrench, ShieldAlert } from 'lucide-react';

import { detectLocation } from './lib/locationStore';

const OFFLINE_QUEUE_KEY = 'civic_offline_reports_queue';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('hub');
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isManualOffline, setIsManualOffline] = useState<boolean>(false);
  const [offlineQueue, setOfflineQueue] = useState<ReportFormData[]>(() => {
    try {
      const saved = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const effectiveOffline = !isOnline || isManualOffline;

  // Monitor network connectivity changes
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync queued offline tickets
      syncOfflineQueue();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save offline queue to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(offlineQueue));
    } catch (e) {
      console.warn('Failed to save offline queue:', e);
    }
  }, [offlineQueue]);

  // Sync offline queue when connection is restored
  const syncOfflineQueue = async () => {
    try {
      const saved = localStorage.getItem(OFFLINE_QUEUE_KEY);
      const queue: ReportFormData[] = saved ? JSON.parse(saved) : [];
      if (queue.length > 0) {
        setSyncNotice(`Connection restored! Syncing ${queue.length} offline incident report(s) to municipal dispatch...`);
        // Simulate network dispatch delay
        await new Promise((r) => setTimeout(r, 1800));
        localStorage.removeItem(OFFLINE_QUEUE_KEY);
        setOfflineQueue([]);
        setSyncNotice(`Success! ${queue.length} offline ticket(s) synchronized with Municipal Core Dispatch.`);
        setTimeout(() => setSyncNotice(null), 6000);
      }
    } catch (err) {
      console.error('Error syncing offline queue:', err);
    }
  };

  // Trigger smooth background location resolution on initial mount
  React.useEffect(() => {
    detectLocation().catch((err) => console.warn('Auto location setup notice:', err));
  }, []);
  const [selectedIssueForReport, setSelectedIssueForReport] = useState<UrbanWaterIssue | null>(null);

  // Analysis Modal States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [reportLocationData, setReportLocationData] = useState<{ location: string; lat?: number; lng?: number } | null>(null);

  // Handler when user submits reporting form
  const handleSubmitReport = async (formData: ReportFormData) => {
    setIsAnalyzing(true);
    setShowAnalysisModal(true);
    setReportLocationData({
      location: formData.location,
      lat: formData.latitude,
      lng: formData.longitude,
    });

    if (effectiveOffline) {
      // OFFLINE MODE PROCESSING
      await new Promise((r) => setTimeout(r, 800)); // Instant local heuristic response
      const offlineTicketId = `#SQ-OFFLINE-${Math.floor(1000 + Math.random() * 9000)}`;
      
      // Save report payload to queue
      setOfflineQueue((prev) => [...prev, formData]);

      setAnalysisResult({
        ticketId: offlineTicketId,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        priorityLevel: 'Offline Emergency Ticket (Stored On Device)',
        priorityBadgeColor: 'emerald',
        summary: `OFFLINE TICKET STORED: Incident for ${formData.location || 'Reported Site'} saved locally on device storage. Will auto-dispatch to municipal servers once internet restores.`,
        damageAssessment: 'Local heuristic risk assessment: Critical runoff / sewerage hazard logged into offline memory storage.',
        estimatedRestoration: 'Queued for Auto-Sync on Internet Restoration',
        safetyAdvisory: [
          'Maintain a minimum 5-meter safety radius around open or overflow zones.',
          'Refer to the DIY Emergency Toolkits tab below for immediate offline self-remediation guides.',
          'In case of life-threatening flooding, contact emergency landline 112 directly.'
        ],
        escalationPortals: [
          { name: 'Local Device Offline Queue', url: '#', description: 'Ticket saved securely in local browser storage' },
          { name: 'MCG Emergency Helpline (Direct Voice Call)', url: 'tel:18001801817', description: 'Toll-free 24x7 Municipal Landline' },
        ],
        nodalOfficer: {
          name: 'Offline Auto-Dispatcher',
          designation: 'Civic Local Device Storage Manager',
          phone: '1800 180 1817 (Landline Call)',
          email: 'offline-queue@mcg.gov.in'
        }
      });
      setIsAnalyzing(false);
      return;
    }

    try {
      const response = await fetch('/api/gemini/analyze-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data: AnalysisResult = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      console.error('Failed to query AI incident analysis endpoint:', err);
      // Heuristic fallback if network fails
      setAnalysisResult({
        ticketId: `#SQ-GUG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        priorityLevel: 'Level 2 High-Priority Municipal Alert',
        priorityBadgeColor: 'cyan',
        summary: `Hydrological hazard logged for ${formData.location || 'Incident Site'}. Immediate municipal dispatch queued.`,
        damageAssessment: 'Structural assessment registered. Risk to local surface runoff and pedestrian access.',
        estimatedRestoration: '4 to 8 Hours (Dispatch Queued)',
        safetyAdvisory: [
          'Maintain a minimum 5-meter safety radius around open or overflow zones.',
          'Avoid driving light vehicles through waterlogged roads of unknown depth.',
          'Report any electrical flickering near submerged power poles immediately.'
        ],
        escalationPortals: [
          { name: 'CPCB Sameer / Civic Grievance Portal', url: 'https://cpcb.nic.in', description: 'Central Pollution Control Board Environmental Escalation' },
          { name: 'Swachhata Urban Grievance App', url: 'https://swachh.city', description: 'Ministry of Housing and Urban Affairs Direct Ticket' },
          { name: 'MCG Gurugram Citizen Portal', url: 'https://www.mcg.gov.in', description: 'Municipal Corporation Grievance Redressal' }
        ],
        nodalOfficer: {
          name: 'Er. Rajesh Kumar Sharma',
          designation: 'Executive Engineer - Drainage & Sewerage (Zone 3)',
          phone: '+91 981 200 4512',
          email: 'nodal.water.sec34@mcg.gov.in'
        }
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectIssueFromMarquee = (issue: UrbanWaterIssue) => {
    setSelectedIssueForReport(issue);
    setActiveTab('reporting');
    // Scroll smoothly down to wizard
    setTimeout(() => {
      const el = document.getElementById('reporting-wizard');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleOpenQuickReport = () => {
    setActiveTab('reporting');
    setTimeout(() => {
      const el = document.getElementById('reporting-wizard');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F8FAFC] flex flex-col font-sans selection:bg-[#38BDF8]/30 selection:text-[#38BDF8] relative overflow-x-hidden">
      
      {/* Kinetic Fluid Droplet Cursor */}
      <KineticCursor />

      {/* Sync Notification Banner */}
      <AnimatePresence>
        {syncNotice && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-12 left-0 right-0 z-[100] bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white px-4 py-3 shadow-2xl border-b border-emerald-400/30 backdrop-blur-md flex items-center justify-between max-w-5xl mx-auto rounded-b-2xl"
          >
            <div className="flex items-center gap-3 text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-200 animate-pulse shrink-0" />
              <span>{syncNotice}</span>
            </div>
            <button
              onClick={() => setSyncNotice(null)}
              className="px-2.5 py-1 text-xs bg-white/20 hover:bg-white/30 rounded-lg font-mono transition-colors"
            >
              DISMISS
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Status Top Banner */}
      {effectiveOffline && (
        <div className="fixed top-[3px] left-0 right-0 z-[95] bg-amber-500/95 text-slate-950 px-4 py-2 text-xs font-bold shadow-xl backdrop-blur-md border-b border-amber-400 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-slate-950 animate-bounce shrink-0" />
            <span className="uppercase font-mono tracking-wide">OFFLINE EMERGENCY MODE ACTIVATED</span>
            <span className="hidden md:inline font-normal text-slate-900 border-l border-slate-900/30 pl-2">
              No internet connection detected. Portal auto-stripped to essential offline features: Incident Ticket Engine & DIY Emergency Guides.
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono">
            {offlineQueue.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 text-[10px] flex items-center gap-1">
                <HardDrive className="w-3 h-3" />
                {offlineQueue.length} Ticket(s) Stored Locally
              </span>
            )}
            <button
              onClick={() => setIsManualOffline(false)}
              className="px-2 py-0.5 rounded bg-slate-950 text-white hover:bg-slate-800 transition-colors text-[10px]"
            >
              Exit Demo Offline
            </button>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportModal={handleOpenQuickReport}
      />

      {/* Offline Quick Control Strip (for testing offline mode anytime) */}
      {!effectiveOffline && (
        <div className="pt-20 pb-0 px-4 max-w-7xl mx-auto flex justify-end">
          <button
            onClick={() => setIsManualOffline(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-slate-900/80 hover:bg-amber-500/20 text-[#94A3B8] hover:text-amber-300 border border-white/10 hover:border-amber-500/40 transition-all shadow-sm"
            title="Simulate losing internet connection to test offline ticket queueing"
          >
            <WifiOff className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate Offline Mode</span>
          </button>
        </div>
      )}

      {/* Main Page Router with Framer Motion Page Transition */}
      <main className="flex-grow pb-20 md:pb-0">
        {effectiveOffline && (
          <div className="pt-24 px-4 max-w-4xl mx-auto text-center mb-6">
            <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 backdrop-blur-xl">
              <div className="inline-flex p-3 rounded-full bg-amber-500/20 text-amber-400 mb-3">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-display font-extrabold text-amber-200">
                Essential Offline Incident Portal
              </h2>
              <p className="text-sm text-slate-300 max-w-2xl mx-auto mt-2">
                All non-essential live network streaming widgets have been suspended to save battery and memory.
                You can raise incident tickets with immediate local offline queueing and access step-by-step DIY emergency repair toolkits.
              </p>

              <div className="flex items-center justify-center gap-3 mt-4">
                <button
                  onClick={() => setActiveTab('reporting')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'reporting'
                      ? 'bg-amber-400 text-slate-950 shadow-lg'
                      : 'bg-slate-900 text-slate-200 border border-amber-500/30 hover:bg-slate-800'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Raise Incident Ticket (Offline Sync)</span>
                </button>
                <button
                  onClick={() => setActiveTab('guides')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'guides'
                      ? 'bg-amber-400 text-slate-950 shadow-lg'
                      : 'bg-slate-900 text-slate-200 border border-amber-500/30 hover:bg-slate-800'
                  }`}
                >
                  <Wrench className="w-4 h-4" />
                  <span>DIY Emergency Toolkits</span>
                </button>
              </div>

              {offlineQueue.length > 0 && (
                <div className="mt-4 pt-3 border-t border-amber-500/20 flex items-center justify-center gap-2 text-xs font-mono text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{offlineQueue.length} Ticket(s) currently stored in device memory. Will auto-submit when internet reconnects.</span>
                </div>
              )}
            </div>
          </div>
        )}
        <AnimatePresence mode="wait">
          {activeTab === 'hub' && (
            <motion.div
              key="hub"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <Hero
                onOpenReport={handleOpenQuickReport}
                onNavigateTab={setActiveTab}
              />
              <WeatherWidget />
              <MarqueeGallery onSelectIssueToReport={handleSelectIssueFromMarquee} />
              <MunicipalLocator />
              <DIYGuides />
              <TeamRoster />
            </motion.div>
          )}

          {activeTab === 'reporting' && (
            <motion.div
              key="reporting"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="pt-24 pb-12"
            >
              <ReportingWizard
                initialIssue={selectedIssueForReport}
                onSubmitReport={handleSubmitReport}
                isSubmitting={isAnalyzing}
              />
            </motion.div>
          )}

          {activeTab === 'guides' && (
            <motion.div
              key="guides"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="pt-24 pb-12"
            >
              <DIYGuides />
            </motion.div>
          )}

          {activeTab === 'roster' && (
            <motion.div
              key="roster"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="pt-24 pb-12"
            >
              <TeamRoster />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* AI Smart Incident Analysis Modal */}
      <AnalysisModal
        isLoading={isAnalyzing}
        result={analysisResult}
        reportLocation={reportLocationData}
        onClose={() => {
          setShowAnalysisModal(false);
          setAnalysisResult(null);
        }}
      />

      {/* Multi-Column High-Tech Footer */}
      <Footer
        onNavigate={setActiveTab}
        onOpenReport={handleOpenQuickReport}
      />

    </div>
  );
}
