import React, { useState, useEffect, useRef } from 'react';
import { CloudRain, CloudLightning, Sun, Droplets, Wind, AlertTriangle, Navigation, RefreshCw, Thermometer, MapPin, Search, Check, AlertCircle, Edit3, X } from 'lucide-react';
import { getStoredLocation, saveLocation, subscribeLocationChange, detectBrowserGpsLocation, detectLocation, LocationState } from '../lib/locationStore';

interface WeatherData {
  status: string;
  current: {
    temp: number;
    humidity: number;
    windSpeed: number;
    currentPrecip: number;
    weatherCode: number;
  };
  forecast: {
    maxPrecipProbability: number;
    totalPrecipMm: number;
  };
  alert: {
    level: 'SEVERE_FLOOD' | 'HEAVY_RAIN' | 'MODERATE_RAIN' | 'CLEAR';
    color: string;
    title: string;
    advisory: string;
  };
}

interface GeocodeResult {
  displayName: string;
  lat: number;
  lng: number;
}

const QUICK_LOCATIONS = [
  { name: 'Marine Drive, Nariman Point, Mumbai', lat: 18.9438, lng: 72.8232 },
  { name: 'Andheri West, Mumbai, Maharashtra', lat: 19.1136, lng: 72.8697 },
  { name: 'Connaught Place, New Delhi', lat: 28.6315, lng: 77.2167 },
  { name: 'Sector 34, Subhash Chowk, Gurugram', lat: 28.4595, lng: 77.0266 },
  { name: 'DLF Cyber City, Phase 2, Gurugram', lat: 28.4950, lng: 77.0890 },
  { name: 'Sector 62, Noida, Uttar Pradesh', lat: 28.6280, lng: 77.3649 },
  { name: 'Indiranagar 100ft Rd, Bengaluru', lat: 12.9784, lng: 77.6408 },
  { name: 'Hitec City, Madhapur, Hyderabad', lat: 17.4435, lng: 78.3772 },
  { name: 'Shivajinagar, FC Road, Pune', lat: 18.5308, lng: 73.8474 },
  { name: 'T. Nagar, Usman Road, Chennai', lat: 13.0418, lng: 80.2341 },
  { name: 'Park Street, Chowringhee, Kolkata', lat: 22.5532, lng: 88.3524 },
  { name: 'Navrangpura, Ashram Road, Ahmedabad', lat: 23.0373, lng: 72.5604 },
];

export const WeatherWidget: React.FC = () => {
  const [currentLoc, setCurrentLoc] = useState<LocationState | null>(() => getStoredLocation());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Search state
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [isSearchingLoading, setIsSearchingLoading] = useState<boolean>(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchWeather = async (targetLat: number, targetLng: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/weather?lat=${targetLat}&lng=${targetLng}`);
      if (res.ok) {
        const data = await res.json();
        setWeather(data);
      }
    } catch (err) {
      console.warn('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentLoc && currentLoc.lat && currentLoc.lng) {
      fetchWeather(currentLoc.lat, currentLoc.lng);
    }
  }, [currentLoc?.lat, currentLoc?.lng]);

  useEffect(() => {
    const unsubscribe = subscribeLocationChange((newLoc) => {
      setCurrentLoc(newLoc);
    });
    return () => unsubscribe();
  }, []);

  // Auto-run real-time location detection on startup if no saved location
  useEffect(() => {
    if (!currentLoc) {
      setIsLocating(true);
      detectLocation()
        .then((loc) => {
          setCurrentLoc(loc);
          setGpsError(null);
        })
        .catch((err) => {
          console.warn('Startup location detection error:', err);
          setGpsError('Could not auto-detect location. Please allow browser location or choose your city below.');
          setIsSearching(true);
        })
        .finally(() => {
          setIsLocating(false);
        });
    }
  }, []);

  const handleDetectGps = async () => {
    setIsLocating(true);
    setGpsError(null);
    try {
      const result = await detectBrowserGpsLocation();
      setCurrentLoc(result);
      setIsSearching(false);
    } catch (err: any) {
      console.warn('Browser GPS detection failed:', err);
      if (err.message === 'PERMISSION_DENIED') {
        setGpsError('Browser blocked location permission. Click your city below or search any address.');
      } else if (err.message === 'TIMEOUT') {
        setGpsError('GPS signal request timed out. Select your city or sector below.');
      } else {
        setGpsError('GPS unavailable on this browser/device. Choose your city or search your address below.');
      }
      setIsSearching(true);
    } finally {
      setIsLocating(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (val.trim().length < 2) {
      setSearchResults([]);
      setIsSearchingLoading(false);
      return;
    }

    setIsSearchingLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode-search?q=${encodeURIComponent(val)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
        }
      } catch (err) {
        console.warn('Geocode search error:', err);
      } finally {
        setIsSearchingLoading(false);
      }
    }, 300);
  };

  const handleSelectLocation = (lat: number, lng: number, address: string) => {
    const newLoc: LocationState = {
      lat,
      lng,
      address,
      isGpsVerified: false,
      method: 'USER_PICK',
    };
    saveLocation(newLoc);
    setCurrentLoc(newLoc);
    setIsSearching(false);
    setSearchQuery('');
    setSearchResults([]);
    setGpsError(null);
  };

  const getWeatherIcon = (code: number) => {
    if (code >= 80 || code >= 95) return <CloudLightning className="w-6 h-6 text-[#EF4444] animate-pulse" />;
    if (code >= 51) return <CloudRain className="w-6 h-6 text-[#38BDF8]" />;
    return <Sun className="w-6 h-6 text-[#F59E0B]" />;
  };

  const getBadgeStyle = (level?: string) => {
    switch (level) {
      case 'SEVERE_FLOOD':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'HEAVY_RAIN':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'MODERATE_RAIN':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 mb-8">
      <div className="relative rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl p-5 md:p-6 shadow-2xl overflow-hidden">
        
        {/* Glow ambient accent behind */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#38BDF8]/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-4 border-b border-white/10">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-800 border border-white/10 shadow-inner shrink-0 mt-1 sm:mt-0">
              {weather ? getWeatherIcon(weather.current.weatherCode) : <CloudRain className="w-6 h-6 text-[#38BDF8]" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono uppercase text-[#38BDF8] tracking-wider font-bold">
                  ⛈️ LIVE HYDRO-METEOROLOGICAL MONITORING
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30">
                  REAL-TIME
                </span>
                {currentLoc?.isGpsVerified && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 flex items-center gap-1">
                    <Check className="w-3 h-3" /> GPS ACCURATE
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <h3 className="text-sm md:text-base font-display font-bold text-white flex items-center gap-1.5">
                  <MapPin className={`w-4 h-4 text-[#38BDF8] shrink-0 ${isLocating ? 'animate-bounce' : ''}`} />
                  <span>{currentLoc ? currentLoc.address : 'Detecting live exact position...'}</span>
                </h3>
                <button
                  onClick={() => setIsSearching(!isSearching)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs text-[#38BDF8] font-mono flex items-center gap-1 transition-all"
                  title="Search or pick exact city/sector"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{isSearching ? 'Close Search' : 'Change Location'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Location Actions */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={handleDetectGps}
              disabled={isLocating}
              className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-white text-xs font-mono flex items-center justify-center gap-2 transition-all shrink-0 shadow-sm active:scale-95"
            >
              <Navigation className={`w-3.5 h-3.5 text-[#38BDF8] ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Scanning GPS Hardware...' : 'Detect Exact Location'}</span>
            </button>
          </div>
        </div>

        {/* GPS Permission Warning Banner */}
        {gpsError && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <div className="flex-1">
              <p className="font-bold">{gpsError}</p>
              <p className="mt-1 text-[11px] text-amber-200/80">
                You can search any address or select a sector below to set your exact location instantly.
              </p>
            </div>
            <button onClick={() => setGpsError(null)} className="text-amber-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Interactive Location Search Bar */}
        {isSearching && (
          <div className="mb-6 p-4 rounded-2xl bg-slate-950/80 border border-[#38BDF8]/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-[#38BDF8]" /> Search Any Address, City or Sector
              </span>
              <button onClick={() => setIsSearching(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                placeholder="Type your street, sector, city or landmark (e.g. Sector 34 Gurugram, Connaught Place, Mumbai)..."
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-[#38BDF8] font-sans placeholder:text-slate-500"
                autoFocus
              />
              {isSearchingLoading && (
                <div className="absolute right-3 top-3.5">
                  <RefreshCw className="w-4 h-4 text-[#38BDF8] animate-spin" />
                </div>
              )}
            </div>

            {/* Search Autocomplete Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 rounded-xl bg-slate-900 border border-white/10 divide-y divide-white/5 max-h-56 overflow-y-auto">
                {searchResults.map((res, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectLocation(res.lat, res.lng, res.displayName)}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-800 text-xs text-slate-200 flex items-start gap-2 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#38BDF8] shrink-0 mt-0.5" />
                    <span>{res.displayName}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Quick Sector Picks */}
            <div className="mt-3 pt-3 border-t border-white/5">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                Quick Select Common Sectors / Cities:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_LOCATIONS.map((loc, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectLocation(loc.lat, loc.lng, loc.name)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-[#38BDF8]/20 hover:border-[#38BDF8]/40 border border-white/10 text-[11px] font-mono text-slate-300 hover:text-white transition-all"
                  >
                    📍 {loc.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8 gap-3 text-slate-400 font-mono text-xs">
            <RefreshCw className="w-4 h-4 animate-spin text-[#38BDF8]" />
            <span>Connecting to Open-Meteo satellite weather radar...</span>
          </div>
        ) : weather ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left: Weather Metrics Cards */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              {/* Temperature */}
              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-white/5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#94A3B8] mb-1">
                  <span className="text-[10px] font-mono uppercase">Temp</span>
                  <Thermometer className="w-3.5 h-3.5 text-[#F59E0B]" />
                </div>
                <span className="text-xl md:text-2xl font-display font-extrabold text-white">
                  {weather.current.temp}°C
                </span>
                <span className="text-[10px] font-mono text-slate-400 mt-1">Ambient Air</span>
              </div>

              {/* Rain Risk % */}
              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-white/5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#94A3B8] mb-1">
                  <span className="text-[10px] font-mono uppercase">Rain Prob</span>
                  <CloudRain className="w-3.5 h-3.5 text-[#38BDF8]" />
                </div>
                <span className="text-xl md:text-2xl font-display font-extrabold text-[#38BDF8]">
                  {weather.forecast.maxPrecipProbability}%
                </span>
                <span className="text-[10px] font-mono text-slate-400 mt-1">24h Peak Risk</span>
              </div>

              {/* Total Rain mm */}
              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-white/5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#94A3B8] mb-1">
                  <span className="text-[10px] font-mono uppercase">Expected Rain</span>
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <span className="text-xl md:text-2xl font-display font-extrabold text-cyan-300">
                  {weather.forecast.totalPrecipMm} <span className="text-xs font-normal">mm</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400 mt-1">24h Rainfall</span>
              </div>

              {/* Wind Speed */}
              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-white/5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#94A3B8] mb-1">
                  <span className="text-[10px] font-mono uppercase">Wind</span>
                  <Wind className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-xl md:text-2xl font-display font-extrabold text-white">
                  {weather.current.windSpeed} <span className="text-xs font-normal">km/h</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400 mt-1">Surface Gust</span>
              </div>

            </div>

            {/* Right: Flood Advisory Banner */}
            <div className="lg:col-span-5">
              <div className={`p-4 rounded-2xl border ${getBadgeStyle(weather.alert.level)} transition-all shadow-lg`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 animate-pulse" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider">
                    {weather.alert.title}
                  </span>
                </div>
                <p className="text-xs font-sans text-slate-200 leading-relaxed">
                  {weather.alert.advisory}
                </p>
                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-300">
                  <span>CIVIC ACTION ADVISORY</span>
                  <span className="font-bold text-[#38BDF8]">MCG DRAINAGE RADAR ACTIVE</span>
                </div>
              </div>
            </div>

          </div>
        ) : null}

      </div>
    </div>
  );
};

