import React, { useState, useEffect } from 'react';
import { IssueCategory, HazardSeverity, ReportFormData } from '../types';
import { AlertCircle, Upload, MapPin, Camera, ShieldAlert, Sparkles, Check, ArrowRight, X, Phone, User, Navigation, Save, RotateCcw, RefreshCw } from 'lucide-react';
import { LocationPickerMap } from './LocationPickerMap';
import { getStoredLocation, subscribeLocationChange, detectBrowserGpsLocation } from '../lib/locationStore';

const LOCAL_STORAGE_KEY = 'streamline_squad_last_report_cache';

const getCachedReportData = (): { formData?: ReportFormData; photoPreview?: string | null } | null => {
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (item) {
      return JSON.parse(item);
    }
  } catch (err) {
    console.warn('Unable to read report draft from localStorage:', err);
  }
  return null;
};

interface ReportingWizardProps {
  initialIssue?: any;
  onSubmitReport: (formData: ReportFormData) => void;
  isSubmitting: boolean;
}

export const ReportingWizard: React.FC<ReportingWizardProps> = ({
  initialIssue,
  onSubmitReport,
  isSubmitting,
}) => {
  const cachedData = getCachedReportData();
  const storedLoc = getStoredLocation();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<ReportFormData>(() => {
    if (cachedData?.formData) {
      return {
        ...cachedData.formData,
        category: initialIssue ? initialIssue.category : (cachedData.formData.category || 'BROKEN_SEWER'),
        location: initialIssue ? initialIssue.location : (cachedData.formData.location || storedLoc?.address || 'Detecting exact location...'),
        latitude: initialIssue?.lat || cachedData.formData.latitude || storedLoc?.lat || 0,
        longitude: initialIssue?.lng || cachedData.formData.longitude || storedLoc?.lng || 0,
      };
    }
    return {
      category: initialIssue ? initialIssue.category : 'BROKEN_SEWER',
      location: initialIssue ? initialIssue.location : (storedLoc?.address || 'Detecting exact location...'),
      latitude: initialIssue?.lat || storedLoc?.lat || 0,
      longitude: initialIssue?.lng || storedLoc?.lng || 0,
      severity: initialIssue ? initialIssue.severity : 'CRITICAL_EMERGENCY',
      description: initialIssue ? initialIssue.description : '',
      contactName: '',
      contactPhone: '',
    };
  });

  useEffect(() => {
    const unsubscribe = subscribeLocationChange((newLoc) => {
      setFormData((prev) => ({
        ...prev,
        location: newLoc.address,
        latitude: newLoc.lat,
        longitude: newLoc.lng,
      }));
    });
    return () => unsubscribe();
  }, []);

  const [photoPreview, setPhotoPreview] = useState<string | null>(
    () => cachedData?.photoPreview || initialIssue?.imageUrl || null
  );
  const [hasRestoredFromCache, setHasRestoredFromCache] = useState<boolean>(() => !!cachedData?.formData);
  const [dragActive, setDragActive] = useState(false);
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);

  const handleDetectGPSLocation = async () => {
    setIsLocatingGPS(true);
    try {
      const loc = await detectBrowserGpsLocation();
      setFormData((prev) => ({
        ...prev,
        location: loc.address,
        latitude: loc.lat,
        longitude: loc.lng,
      }));
    } catch (err) {
      console.warn('GPS location detection failed:', err);
    } finally {
      setIsLocatingGPS(false);
    }
  };

  // Auto-detect user GPS location on mount if no initial issue or default location
  useEffect(() => {
    if (!initialIssue) {
      handleDetectGPSLocation();
    }
  }, []);

  // Auto-save form fields to localStorage whenever formData or photoPreview changes
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          formData,
          photoPreview,
          savedAt: new Date().toISOString(),
        })
      );
    } catch (err) {
      console.warn('Unable to save report draft to localStorage:', err);
    }
  }, [formData, photoPreview]);

  const handleClearCache = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (err) {}
    const curLoc = getStoredLocation();
    setFormData({
      category: initialIssue ? initialIssue.category : 'BROKEN_SEWER',
      location: initialIssue ? initialIssue.location : (curLoc?.address || 'Detecting exact location...'),
      latitude: initialIssue?.lat || curLoc?.lat || 0,
      longitude: initialIssue?.lng || curLoc?.lng || 0,
      severity: initialIssue ? initialIssue.severity : 'CRITICAL_EMERGENCY',
      description: '',
      contactName: '',
      contactPhone: '',
    });
    setPhotoPreview(null);
    setHasRestoredFromCache(false);
  };

  const categories: { id: IssueCategory; label: string; icon: string; desc: string }[] = [
    { id: 'BROKEN_SEWER', label: 'Broken Sewer', icon: '☣️', desc: 'Effluent leak, pipe burst, biohazard overflow' },
    { id: 'WATER_POOLING', label: 'Water Pooling', icon: '🌊', desc: 'Severe street waterlogging & road submersion' },
    { id: 'CLOGGED_DRAIN', label: 'Clogged Drain', icon: '🧹', desc: 'Silted catch pits & gutter entry blockages' },
    { id: 'OPEN_MANHOLE', label: 'Open Manhole', icon: '⚠️', desc: 'Missing or broken heavy shaft cover' },
    { id: 'PIPE_BURST', label: 'Pipe Burst', icon: '💧', desc: 'Subterranean water main rupture' },
    { id: 'FLUSHING_BACKFLOW', label: 'Flushing Backflow', icon: '🔄', desc: 'Residential drain surcharge & backflow' },
  ];

  const severities: { id: HazardSeverity; label: string; badgeColor: string; desc: string }[] = [
    { id: 'LOW', label: 'LOW SEVERITY', badgeColor: 'text-[#10B981] border-[#10B981]', desc: 'Minor localized ponding, non-urgent maintenance' },
    { id: 'MODERATE', label: 'MODERATE HAZARD', badgeColor: 'text-[#38BDF8] border-[#38BDF8]', desc: 'Gutter silted, slow drainage, potential roadway risk' },
    { id: 'CRITICAL_EMERGENCY', label: 'CRITICAL / EMERGENCY', badgeColor: 'text-[#EF4444] border-[#EF4444]', desc: 'Immediate biohazard, missing manhole cover, severe road flood' },
  ];

  const handleFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      setFormData((prev) => ({ ...prev, photoBase64: result, photoPreviewUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let currentFormData = { ...formData };

    if (
      !currentFormData.location ||
      currentFormData.location === 'Detecting current address...' ||
      currentFormData.location.startsWith('Detecting')
    ) {
      try {
        const loc = await detectBrowserGpsLocation();
        currentFormData = {
          ...currentFormData,
          location: loc.address || `Coordinates (${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)})`,
          latitude: loc.lat,
          longitude: loc.lng,
        };
      } catch (err) {
        console.warn('GPS location acquisition on submit fallback:', err);
        currentFormData = {
          ...currentFormData,
          location: currentFormData.location || `Coordinates (${currentFormData.latitude.toFixed(4)}, ${currentFormData.longitude.toFixed(4)})`,
        };
      }
      setFormData(currentFormData);
    }

    onSubmitReport(currentFormData);
  };

  return (
    <section id="reporting-wizard" className="py-12 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Wizard Header */}
        <div className="text-center mb-10">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-xs font-mono">
              <AlertCircle className="w-3.5 h-3.5" />
              SMART INCIDENT REPORTING ENGINE
            </div>
            {hasRestoredFromCache && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                <Save className="w-3.5 h-3.5" />
                Draft Restored from Cache
              </span>
            )}
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            Log an Infrastructure Crisis
          </h2>
          <p className="text-sm text-[#94A3B8] mt-2 max-w-xl mx-auto">
            Our AI engine evaluates photo diagnostics, assigns priority dispatches, and routes ticket receipts directly to zonal Nodal Officers.
          </p>

          {hasRestoredFromCache && (
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="text-xs text-slate-400">Pre-filled with your saved data.</span>
              <button
                type="button"
                onClick={handleClearCache}
                className="inline-flex items-center gap-1 text-xs text-[#38BDF8] hover:text-white underline font-mono transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Clear & Start Blank Report
              </button>
            </div>
          )}
        </div>

        {/* Step Indicator Bar */}
        <div className="flex items-center justify-between mb-8 px-4 sm:px-8">
          {[1, 2, 3].map((step) => {
            const isDone = currentStep > step;
            const isCurrent = currentStep === step;
            return (
              <React.Fragment key={step}>
                <div
                  onClick={() => setCurrentStep(step)}
                  className={`flex items-center gap-2 cursor-pointer transition-all ${
                    isCurrent ? 'text-[#38BDF8] font-bold' : isDone ? 'text-[#10B981]' : 'text-[#94A3B8]'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-[#38BDF8] text-[#0B0F19] shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                        : isDone
                        ? 'bg-[#10B981] text-[#0B0F19]'
                        : 'bg-slate-800 border border-white/10 text-[#94A3B8]'
                    }`}
                  >
                    {isDone ? <Check className="w-5 h-5" /> : step}
                  </div>
                  <span className="hidden sm:inline text-xs font-display tracking-wider uppercase">
                    {step === 1 ? 'Select Category' : step === 2 ? 'Location & Media' : 'Severity & Submit'}
                  </span>
                </div>
                {step < 3 && <div className="flex-1 h-[2px] bg-slate-800 mx-2 sm:mx-4" />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Wizard Form Container */}
        <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-10 border border-white/10 shadow-2xl relative">
          <form onSubmit={handleSubmit}>
            
            {/* STEP 1: CATEGORY SELECTION */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/10 pb-4">
                  <h3 className="text-lg sm:text-xl font-display font-bold text-white">
                    Step 1: Choose Infrastructure Issue Category
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    Select the primary hydrological or sewerage hazard observed on site.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {categories.map((cat) => {
                    const isSelected = formData.category === cat.id;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setFormData((prev) => ({ ...prev, category: cat.id }))}
                        data-cursor="form"
                        className={`p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all duration-200 border flex flex-col justify-between active:scale-[0.98] ${
                          isSelected
                            ? 'bg-slate-800/90 border-[#38BDF8] shadow-[0_0_20px_rgba(56,189,248,0.3)]'
                            : 'bg-slate-900/40 border-white/5 hover:border-white/20 hover:bg-slate-900/70'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                          <span className="text-2xl">{cat.icon}</span>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-[#38BDF8] text-[#0B0F19] flex items-center justify-center text-xs font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-sm text-white mb-1">{cat.label}</h4>
                          <p className="text-[11px] text-[#94A3B8] leading-tight">{cat.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    data-cursor="form"
                    className="w-full sm:w-auto px-6 py-3.5 min-h-[48px] rounded-xl bg-[#38BDF8] text-[#0B0F19] font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white transition-all shadow-[0_0_15px_rgba(56,189,248,0.4)] active:scale-95"
                  >
                    <span>Proceed to Location & Media</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: LOCATION & PHOTO UPLOAD */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/10 pb-4">
                  <h3 className="text-lg sm:text-xl font-display font-bold text-white">
                    Step 2: Incident Location & Field Photo Upload
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    Provide exact address or sector, and optionally attach a photo for Gemini AI inspection.
                  </p>
                </div>

                {/* Location Input & Interactive Map */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono uppercase text-[#94A3B8]">
                      INCIDENT LOCATION / SECTOR ADDRESS
                    </label>
                    <button
                      type="button"
                      onClick={handleDetectGPSLocation}
                      disabled={isLocatingGPS}
                      className="text-[11px] font-mono text-[#38BDF8] hover:text-white flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-[#38BDF8]/30 hover:border-[#38BDF8] transition-all"
                    >
                      {isLocatingGPS ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin text-[#38BDF8]" />
                          <span>Acquiring GPS...</span>
                        </>
                      ) : (
                        <>
                          <Navigation className="w-3 h-3 text-[#38BDF8]" />
                          <span>Auto-Detect GPS</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#38BDF8]" />
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Street address or sector..."
                      className="w-full pl-12 pr-28 py-3.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-base sm:text-sm focus:border-[#38BDF8] focus:outline-none focus:ring-1 focus:ring-[#38BDF8] min-h-[48px]"
                    />
                    <button
                      type="button"
                      onClick={handleDetectGPSLocation}
                      disabled={isLocatingGPS}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-[#38BDF8]/15 border border-[#38BDF8]/40 text-[#38BDF8] hover:bg-[#38BDF8] hover:text-[#0B0F19] font-mono text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      {isLocatingGPS ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <Navigation className="w-3.5 h-3.5" />
                          <span>GPS</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Interactive Map Picker */}
                  <LocationPickerMap
                    lat={formData.latitude || 28.4595}
                    lng={formData.longitude || 77.0266}
                    address={formData.location}
                    height="280px"
                    onLocationChange={({ lat, lng, address }) => {
                      setFormData((prev) => ({
                        ...prev,
                        location: address,
                        latitude: lat,
                        longitude: lng,
                      }));
                    }}
                  />
                </div>

                {/* Photo Upload Area */}
                <div>
                  <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                    FIELD PHOTO / PROOF ATTACHMENT
                  </label>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-2xl p-4 sm:p-6 text-center transition-all ${
                      dragActive ? 'border-[#38BDF8] bg-[#38BDF8]/10' : 'border-white/15 bg-slate-900/40 hover:border-white/30'
                    }`}
                  >
                    {photoPreview ? (
                      <div className="relative max-h-48 rounded-xl overflow-hidden group mx-auto max-w-md">
                        <img src={photoPreview} alt="Field preview" className="w-full h-48 object-cover rounded-xl" />
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoPreview(null);
                            setFormData((prev) => ({ ...prev, photoBase64: undefined, photoPreviewUrl: undefined }));
                          }}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-2 sm:py-4">
                        <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-[#38BDF8] mb-2 animate-pulse" />
                        <p className="text-xs sm:text-sm font-display text-white font-semibold">
                          Drag & drop photo or tap below to upload
                        </p>
                        <p className="text-[11px] text-[#94A3B8] mt-1">
                          Supports PNG, JPG, WEBP (Gemini AI will inspect damage severity)
                        </p>
                        <label className="mt-3 px-4 py-2.5 rounded-lg bg-slate-800 text-xs font-bold text-[#38BDF8] border border-[#38BDF8]/30 cursor-pointer hover:bg-[#38BDF8] hover:text-[#0B0F19] transition-all inline-flex items-center gap-2 active:scale-95 min-h-[44px]">
                          Select Image File
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleFileUpload(e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description Textarea */}
                <div>
                  <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-2">
                    ADDITIONAL INCIDENT DETAILS
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe water depth, traffic disruption, sewage odor, or visible pipeline damage..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-white/10 text-white text-base sm:text-sm focus:border-[#38BDF8] focus:outline-none focus:ring-1 focus:ring-[#38BDF8]"
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="w-full sm:w-auto px-5 py-3 min-h-[44px] rounded-xl bg-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-all text-center"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    data-cursor="form"
                    className="w-full sm:w-auto px-6 py-3.5 min-h-[48px] rounded-xl bg-[#38BDF8] text-[#0B0F19] font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white transition-all shadow-[0_0_15px_rgba(56,189,248,0.4)] active:scale-95"
                  >
                    <span>Proceed to Severity & Submit</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SEVERITY TOGGLE & CONTACT SUBMIT */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/10 pb-4">
                  <h3 className="text-lg sm:text-xl font-display font-bold text-white">
                    Step 3: Hazard Severity & Citizen Contact
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    Select emergency level to trigger automated CPCB & Nodal Officer escalations.
                  </p>
                </div>

                {/* Hazard Severity Toggle */}
                <div>
                  <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-3">
                    HAZARD SEVERITY LEVEL
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {severities.map((sev) => {
                      const isSelected = formData.severity === sev.id;
                      return (
                        <div
                          key={sev.id}
                          onClick={() => setFormData({ ...formData, severity: sev.id })}
                          data-emergency={sev.id === 'CRITICAL_EMERGENCY' ? 'true' : undefined}
                          data-cursor="form"
                          className={`p-3.5 sm:p-4 rounded-2xl cursor-pointer border transition-all active:scale-[0.98] ${
                            isSelected
                              ? sev.id === 'CRITICAL_EMERGENCY'
                                ? 'bg-[#EF4444]/20 border-[#EF4444] shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                                : 'bg-slate-800 border-[#38BDF8] shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                              : 'bg-slate-900/40 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${sev.badgeColor}`}>
                              {sev.label}
                            </span>
                            {isSelected && <span className="text-xs font-bold text-[#38BDF8]">✓</span>}
                          </div>
                          <p className="text-[11px] text-[#94A3B8]">{sev.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Contact Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1">
                      CITIZEN NAME (OPTIONAL)
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={formData.contactName}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                        placeholder="e.g. Ramesh Verma"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-white/10 text-white text-base sm:text-sm focus:border-[#38BDF8] focus:outline-none min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-[#94A3B8] mb-1">
                      WHATSAPP / CONTACT PHONE
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                        placeholder="+91 98123 45678"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-white/10 text-white text-base sm:text-sm focus:border-[#38BDF8] focus:outline-none min-h-[44px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Action Button */}
                <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="w-full sm:w-auto px-5 py-3 min-h-[44px] rounded-xl bg-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-all text-center"
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    data-emergency={formData.severity === 'CRITICAL_EMERGENCY' ? 'true' : undefined}
                    data-cursor="form"
                    className={`w-full sm:w-auto px-8 py-4 min-h-[50px] rounded-xl font-display font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition-all active:scale-95 ${
                      formData.severity === 'CRITICAL_EMERGENCY'
                        ? 'bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white shadow-[0_0_25px_rgba(239,68,68,0.6)] hover:shadow-[0_0_35px_rgba(239,68,68,0.9)]'
                        : 'bg-[#38BDF8] text-[#0B0F19] shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:bg-white'
                    }`}
                  >
                    <Sparkles className="w-5 h-5 animate-spin shrink-0" />
                    <span>{isSubmitting ? 'Analyzing Incident...' : 'Trigger AI Analysis & Dispatch'}</span>
                  </button>
                </div>
              </div>
            )}

          </form>
        </div>

      </div>
    </section>
  );
};
