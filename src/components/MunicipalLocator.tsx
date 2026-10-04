import React, { useState, useEffect } from 'react';
import { MUNICIPAL_OFFICES } from '../data/mockData';
import { MunicipalOffice } from '../types';
import { MapPin, Phone, Mail, MessageSquare, Clock, Navigation, CheckCircle2, ChevronRight, Building2, Sparkles } from 'lucide-react';
import { LocationPickerMap } from './LocationPickerMap';
import { getStoredLocation, subscribeLocationChange, detectBrowserGpsLocation } from '../lib/locationStore';

const DEFAULT_COMMAND_LAT = 28.4595;
const DEFAULT_COMMAND_LNG = 77.0266;
const DEFAULT_COMMAND_LABEL = 'Gurugram Municipal Command Area (Civil Lines)';

export const MunicipalLocator: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; label: string }>(() => {
    const stored = getStoredLocation();
    if (stored && stored.lat && stored.lng && (stored.lat !== 0 || stored.lng !== 0)) {
      return { lat: stored.lat, lng: stored.lng, label: stored.address };
    }
    return { lat: DEFAULT_COMMAND_LAT, lng: DEFAULT_COMMAND_LNG, label: DEFAULT_COMMAND_LABEL };
  });
  const [selectedOffice, setSelectedOffice] = useState<MunicipalOffice>(MUNICIPAL_OFFICES[0]);
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState('');

  // Subscribe to location store changes
  useEffect(() => {
    const updateFromLocation = (lat: number, lng: number, address: string) => {
      if (!lat && !lng) return;
      if (lat === 0 && lng === 0) return;
      setUserLocation({ lat, lng, label: address });
      const officesWithDistance = MUNICIPAL_OFFICES.map((off) => ({
        ...off,
        distanceKm: calculateDistance(lat, lng, off.lat, off.lng)
      })).sort((a, b) => a.distanceKm - b.distanceKm);
      setSelectedOffice(officesWithDistance[0]);
    };

    const initial = getStoredLocation();
    if (initial && initial.lat && initial.lng && (initial.lat !== 0 || initial.lng !== 0)) {
      updateFromLocation(initial.lat, initial.lng, initial.address);
    }

    const unsubscribe = subscribeLocationChange((newLoc) => {
      updateFromLocation(newLoc.lat, newLoc.lng, newLoc.address);
    });
    return () => unsubscribe();
  }, []);

  // Haversine formula distance calculation in kilometers
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  };

  const handleDetectLocation = async () => {
    setIsLocating(true);
    setLocationSuccessMsg('');

    try {
      const result = await detectBrowserGpsLocation();
      setUserLocation({
        lat: result.lat,
        lng: result.lng,
        label: result.address,
      });

      const officesWithDistance = MUNICIPAL_OFFICES.map((off) => ({
        ...off,
        distanceKm: calculateDistance(result.lat, result.lng, off.lat, off.lng)
      })).sort((a, b) => a.distanceKm - b.distanceKm);

      setSelectedOffice(officesWithDistance[0]);
      setLocationSuccessMsg(`GPS Location set: ${result.address}. Nearest Hub: ${officesWithDistance[0].name}`);
    } catch (err: any) {
      console.warn('Location detection failed:', err);
      if (err.message === 'PERMISSION_DENIED') {
        setLocationSuccessMsg('Browser location permission was denied. Change location using the Weather Bar above.');
      } else {
        setLocationSuccessMsg('Could not detect GPS location. Change location using the Weather Bar above.');
      }
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <section className="py-12 bg-slate-950/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-xs font-mono mb-2">
              <MapPin className="w-3.5 h-3.5" />
              SMART MUNICIPAL LOCATOR
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
              Automatic Nodal Office & Command Center Locator
            </h2>
            <p className="text-sm text-[#94A3B8] mt-1">
              Locate your nearest Municipal Corporation & GMDA Water Division control room for instant escalation.
            </p>
          </div>

          {/* Detect Location Button */}
          <div>
            <button
              onClick={handleDetectLocation}
              disabled={isLocating}
              data-cursor="form"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-[#0B0F19] font-display font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] transition-all active:scale-95 disabled:opacity-50"
            >
              <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Detecting GPS Signal...' : 'Detect My Location'}</span>
            </button>
          </div>
        </div>

        {locationSuccessMsg && (
          <div className="mb-6 p-3 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{locationSuccessMsg}</span>
          </div>
        )}

        {/* Interactive Map Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase text-[#38BDF8] tracking-wider font-bold">
              🗺️ LIVE REGIONAL GEOSPATIAL COMMAND MAP
            </span>
            <span className="text-xs font-mono text-[#94A3B8]">
              Click any office pin to inspect details
            </span>
          </div>

          <LocationPickerMap
            lat={userLocation.lat}
            lng={userLocation.lng}
            address={userLocation.label}
            height="360px"
            additionalMarkers={MUNICIPAL_OFFICES.map((off) => ({
              id: off.id,
              name: off.name,
              lat: off.lat,
              lng: off.lng,
              popupText: `${off.zone} • ${off.address}`,
              isSelected: selectedOffice.id === off.id,
            }))}
            onSelectMarker={(id) => {
              const matched = MUNICIPAL_OFFICES.find((o) => o.id === id);
              if (matched) setSelectedOffice(matched);
            }}
            onLocationChange={({ lat, lng, address }) => {
              setUserLocation({ lat, lng, label: address });
              const officesWithDistance = MUNICIPAL_OFFICES.map((off) => ({
                ...off,
                distanceKm: calculateDistance(lat, lng, off.lat, off.lng)
              })).sort((a, b) => a.distanceKm - b.distanceKm);

              setSelectedOffice(officesWithDistance[0]);
              setLocationSuccessMsg(`Map location set to: ${address}`);
            }}
          />
        </div>

        {/* Layout Grid: Nearest Office Card + Office List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Featured Office Card */}
          <div className="lg:col-span-7 glass-panel rounded-3xl p-6 sm:p-8 border border-[#38BDF8]/30 relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#38BDF8]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between gap-2 mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#10B981] animate-ping" />
                <span className="text-xs font-mono uppercase tracking-widest text-[#10B981] font-bold">
                  NEAREST MATCHED MUNICIPAL OFFICE
                </span>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8] text-xs font-mono font-bold">
                {selectedOffice.distanceKm} km away
              </span>
            </div>

            {/* Office Title */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#38BDF8]/15 border border-[#38BDF8]/40 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6 text-[#38BDF8]" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-display font-extrabold text-white leading-tight">
                  {selectedOffice.name}
                </h3>
                <p className="text-xs font-mono text-[#38BDF8] mt-1">{selectedOffice.zone}</p>
              </div>
            </div>

            {/* Details Box Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              
              {/* Address */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
                <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8] mb-1">
                  <MapPin className="w-4 h-4 text-[#38BDF8]" />
                  <span>OFFICIAL ADDRESS</span>
                </div>
                <p className="text-xs text-white font-medium leading-relaxed">
                  {selectedOffice.address}
                </p>
              </div>

              {/* Status & Hours */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
                <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8] mb-1">
                  <Clock className="w-4 h-4 text-[#10B981]" />
                  <span>OPERATIONAL STATUS</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#10B981]/20 text-[#10B981] text-xs font-bold border border-[#10B981]/40">
                    🟢 OPEN NOW
                  </span>
                  <span className="text-xs text-[#94A3B8] font-mono">{selectedOffice.openHours}</span>
                </div>
              </div>

              {/* Emergency Hotline */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
                <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8] mb-1">
                  <Phone className="w-4 h-4 text-[#EF4444]" />
                  <span>24/7 CONTROL ROOM HELPLINE</span>
                </div>
                <a
                  href={`tel:${selectedOffice.helpline.split('/')[0].trim()}`}
                  className="text-sm font-mono font-bold text-white hover:text-[#38BDF8] transition-colors flex items-center gap-2 mt-1"
                >
                  <span>{selectedOffice.helpline}</span>
                </a>
              </div>

              {/* Nodal Officer Contact */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
                <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8] mb-1">
                  <Mail className="w-4 h-4 text-[#38BDF8]" />
                  <span>ASSIGNED NODAL EXECUTIVE ENGINEER</span>
                </div>
                <p className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#38BDF8]"></span>
                  {selectedOffice.nodalOfficerName}
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <a
                    href={`mailto:${selectedOffice.nodalOfficerEmail}`}
                    className="text-xs font-mono text-[#38BDF8] hover:underline truncate"
                  >
                    {selectedOffice.nodalOfficerEmail}
                  </a>
                  <span className="text-slate-600">•</span>
                  <a
                    href={`tel:${selectedOffice.nodalOfficerPhone}`}
                    className="text-xs font-mono text-emerald-400 hover:underline shrink-0"
                  >
                    {selectedOffice.nodalOfficerPhone}
                  </a>
                </div>
              </div>

            </div>

            {/* Quick Action Contact Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <a
                href={`https://wa.me/${selectedOffice.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello, requesting urgent drainage assistance for ${selectedOffice.sector}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="form"
                className="w-full sm:w-auto flex-1 py-3.5 px-5 min-h-[48px] rounded-xl bg-[#25D366] text-[#0B0F19] font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,211,102,0.4)] hover:bg-[#20bd5a] transition-all active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Direct Control Room</span>
              </a>

              <a
                href={`tel:${selectedOffice.helpline}`}
                className="w-full sm:w-auto py-3.5 px-5 min-h-[48px] rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white/10 transition-all active:scale-95"
              >
                <Phone className="w-4 h-4 text-[#EF4444]" />
                <span>Call Emergency Line</span>
              </a>
            </div>

          </div>

          {/* List of All Regional Municipal Offices */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-sm font-mono text-[#94A3B8] uppercase tracking-widest mb-3">
              SELECT REGIONAL OFFICE ({MUNICIPAL_OFFICES.length})
            </h3>

            {MUNICIPAL_OFFICES.map((office) => {
              const isSelected = selectedOffice.id === office.id;
              return (
                <div
                  key={office.id}
                  onClick={() => setSelectedOffice(office)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 border ${
                    isSelected
                      ? 'bg-slate-800/90 border-[#38BDF8] shadow-[0_0_20px_rgba(56,189,248,0.2)]'
                      : 'bg-slate-900/40 border-white/5 hover:border-white/20 hover:bg-slate-900/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'bg-[#38BDF8] text-[#0B0F19]' : 'bg-slate-800 text-[#94A3B8]'
                      }`}>
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-display font-bold text-white leading-tight">
                          {office.name}
                        </h4>
                        <p className="text-xs font-mono text-[#94A3B8] mt-0.5">{office.zone} • {office.sector}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-[#38BDF8] shrink-0 font-bold">
                      {office.distanceKm} km
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
