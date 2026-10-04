import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { 
  Navigation, 
  Search, 
  MapPin, 
  Layers, 
  Maximize2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Crosshair,
  ShieldCheck
} from 'lucide-react';
import { detectBrowserGpsLocation, saveLocation } from '../lib/locationStore';

// Safe default center coordinates (Gurugram Municipal Command Center)
const DEFAULT_CENTER_LAT = 28.4595;
const DEFAULT_CENTER_LNG = 77.0266;

// Fix Leaflet default icon paths in bundler environments
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Tile layer provider options (100% Free, Zero-Watermark, No-API-Key Required)
export type TileLayerStyle = 'esri_dark' | 'osm_dark' | 'street' | 'satellite';

interface TileProviderDef {
  name: string;
  badge: string;
  createLayers: () => L.Layer[];
}

const TILE_PROVIDERS: Record<TileLayerStyle, TileProviderDef> = {
  esri_dark: {
    name: 'Dark Canvas',
    badge: 'Clean / No Watermark',
    createLayers: () => {
      const base = L.tileLayer(
        'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        {
          maxNativeZoom: 16,
          maxZoom: 19,
          attribution: '&copy; Esri, HERE, Garmin, &copy; OpenStreetMap contributors',
          className: 'esri-dark-tiles',
        }
      );
      const labels = L.tileLayer(
        'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        {
          maxNativeZoom: 16,
          maxZoom: 19,
          attribution: '',
          pane: 'overlayPane',
          opacity: 0.9,
        }
      );
      return [base, labels];
    },
  },
  osm_dark: {
    name: 'Night Street',
    badge: 'OSM Cyberpunk',
    createLayers: () => {
      const osmDark = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
        className: 'osm-dark-tiles',
      });
      return [osmDark];
    },
  },
  street: {
    name: 'Street Standard',
    badge: 'OpenStreetMap',
    createLayers: () => {
      const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      });
      return [osm];
    },
  },
  satellite: {
    name: 'Satellite Aerial',
    badge: 'Esri World Imagery',
    createLayers: () => {
      const sat = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxNativeZoom: 18,
          maxZoom: 19,
          attribution: '&copy; Esri, Maxar, Earthstar Geographics',
        }
      );
      return [sat];
    },
  },
};

interface LocationPickerMapProps {
  lat: number;
  lng: number;
  address?: string;
  onLocationChange: (location: { lat: number; lng: number; address: string }) => void;
  additionalMarkers?: { id: string; name: string; lat: number; lng: number; popupText?: string; isSelected?: boolean }[];
  onSelectMarker?: (id: string) => void;
  height?: string;
  interactive?: boolean;
}

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  lat,
  lng,
  address,
  onLocationChange,
  additionalMarkers = [],
  onSelectMarker,
  height = '340px',
  interactive = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const activeTileLayersRef = useRef<L.Layer[]>([]);
  const mainMarkerRef = useRef<L.Marker | null>(null);
  const additionalMarkersGroupRef = useRef<L.LayerGroup | null>(null);

  // Default to Esri Dark Canvas: Zero-watermark, completely free, matching civic dark UI
  const [activeTileStyle, setActiveTileStyle] = useState<TileLayerStyle>('esri_dark');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ displayName: string; lat: number; lng: number }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [accuracyRadius, setAccuracyRadius] = useState<number | null>(null);

  // Compute safe starting coordinates
  const safeLat = typeof lat === 'number' && !isNaN(lat) && lat !== 0 ? lat : DEFAULT_CENTER_LAT;
  const safeLng = typeof lng === 'number' && !isNaN(lng) && lng !== 0 ? lng : DEFAULT_CENTER_LNG;

  // Custom Pin Icon setup
  const createPinIcon = useCallback((color = '#38BDF8', isMain = false) => {
    return L.divIcon({
      className: 'custom-leaflet-pin',
      html: `
        <div style="position: relative; width: ${isMain ? '36px' : '28px'}; height: ${isMain ? '36px' : '28px'}; display: flex; align-items: center; justify-content: center; pointer-events: auto;">
          <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: ${color}; opacity: 0.35; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: ${isMain ? '24px' : '18px'}; height: ${isMain ? '24px' : '18px'}; border-radius: 50%; background-color: ${color}; border: 3px solid #0B0F19; box-shadow: 0 0 16px ${color}; display: flex; align-items: center; justify-content: center;">
            <div style="width: ${isMain ? '6px' : '4px'}; height: ${isMain ? '6px' : '4px'}; border-radius: 50%; background-color: white;"></div>
          </div>
        </div>
      `,
      iconSize: [isMain ? 36 : 28, isMain ? 36 : 28],
      iconAnchor: [isMain ? 18 : 14, isMain ? 18 : 14],
    });
  }, []);

  // Helper to switch or attach tile layer
  const applyTileLayer = useCallback((map: L.Map, style: TileLayerStyle) => {
    // Remove existing tile layers
    activeTileLayersRef.current.forEach((layer) => {
      try {
        map.removeLayer(layer);
      } catch (e) {
        // ignore if already detached
      }
    });
    activeTileLayersRef.current = [];

    const provider = TILE_PROVIDERS[style] || TILE_PROVIDERS.esri_dark;
    const newLayers = provider.createLayers();

    newLayers.forEach((layer) => {
      layer.addTo(map);
      activeTileLayersRef.current.push(layer);
    });
  }, []);

  // Perform reverse geocode API call
  const reverseGeocode = async (targetLat: number, targetLng: number) => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`/api/reverse-geocode?lat=${targetLat}&lng=${targetLng}`, {
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        const formatted = data.formattedAddress || `Coordinates (${targetLat.toFixed(4)}, ${targetLng.toFixed(4)})`;
        onLocationChange({
          lat: targetLat,
          lng: targetLng,
          address: formatted,
        });
        setStatusMessage(`Location acquired: ${formatted}`);
        return formatted;
      }
    } catch (err) {
      console.warn('Reverse geocode error:', err);
    }
    const fallback = `Coordinates (${targetLat.toFixed(4)}, ${targetLng.toFixed(4)})`;
    onLocationChange({ lat: targetLat, lng: targetLng, address: fallback });
    return fallback;
  };

  // Handle GPS button click
  const handleDetectGPS = async () => {
    setIsLocating(true);
    setStatusMessage('Acquiring precise geolocation signal...');

    try {
      const result = await detectBrowserGpsLocation();
      setAccuracyRadius(result.accuracy || 25);

      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([result.lat, result.lng], 16);
        mapInstanceRef.current.invalidateSize();
        if (mainMarkerRef.current) {
          mainMarkerRef.current.setLatLng([result.lat, result.lng]);
        }
      }

      onLocationChange({
        lat: result.lat,
        lng: result.lng,
        address: result.address,
      });

      setStatusMessage(`Location set via GPS: ${result.address}`);
    } catch (err: any) {
      console.warn('Geolocation detection error:', err);
      if (err.message === 'PERMISSION_DENIED') {
        setStatusMessage('Browser blocked GPS. Use search bar or click anywhere on the map to drop a pin.');
      } else {
        setStatusMessage('GPS signal unavailable. Search address or click on the map to position manually.');
      }
    } finally {
      setIsLocating(false);
    }
  };

  // Fit all markers in view
  const handleFitAllMarkers = () => {
    if (!mapInstanceRef.current) return;
    const points: [number, number][] = [];
    if (safeLat && safeLng) points.push([safeLat, safeLng]);
    additionalMarkers.forEach((m) => {
      if (m.lat && m.lng) points.push([m.lat, m.lng]);
    });

    if (points.length > 1) {
      const bounds = L.latLngBounds(points);
      mapInstanceRef.current.fitBounds(bounds, { padding: [45, 45], maxZoom: 16 });
    } else if (points.length === 1) {
      mapInstanceRef.current.setView(points[0], 15);
    }
    mapInstanceRef.current.invalidateSize();
  };

  // Recenter on primary marker
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([safeLat, safeLng], 15);
      mapInstanceRef.current.invalidateSize();
    }
  };

  // Handle Address Search
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/geocode-search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
        if (data.results && data.results.length === 0) {
          setStatusMessage('No locations found for this query.');
        }
      }
    } catch (err) {
      console.warn('Geocode search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = async (result: { displayName: string; lat: number; lng: number }) => {
    setSearchResults([]);
    setSearchQuery('');
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([result.lat, result.lng], 16);
      mapInstanceRef.current.invalidateSize();
      if (mainMarkerRef.current) {
        mainMarkerRef.current.setLatLng([result.lat, result.lng]);
      }
    }
    await reverseGeocode(result.lat, result.lng);
  };

  // Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [safeLat, safeLng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
        maxBoundsViscosity: 0.8,
      });

      // Apply initial watermark-free tile layers
      applyTileLayer(map, activeTileStyle);

      // Add Zoom control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Create primary draggable marker
      const marker = L.marker([safeLat, safeLng], {
        draggable: interactive,
        icon: createPinIcon('#38BDF8', true),
      }).addTo(map);

      if (interactive) {
        marker.on('dragend', async () => {
          const pos = marker.getLatLng();
          await reverseGeocode(pos.lat, pos.lng);
        });

        map.on('click', async (e: L.LeafletMouseEvent) => {
          marker.setLatLng(e.latlng);
          await reverseGeocode(e.latlng.lat, e.latlng.lng);
        });
      }

      mainMarkerRef.current = marker;
      additionalMarkersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Force Leaflet to recalculate container dimensions immediately and after render
      const timer1 = setTimeout(() => map.invalidateSize(), 150);
      const timer2 = setTimeout(() => map.invalidateSize(), 600);

      // ResizeObserver to ensure tiles render seamlessly when layout changes
      let resizeObserver: ResizeObserver | null = null;
      if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
        resizeObserver = new ResizeObserver(() => {
          map.invalidateSize();
        });
        resizeObserver.observe(mapContainerRef.current);
      }

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        if (resizeObserver) resizeObserver.disconnect();
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    }
  }, []);

  // Update Tile Layer when user toggles style
  useEffect(() => {
    if (mapInstanceRef.current) {
      applyTileLayer(mapInstanceRef.current, activeTileStyle);
    }
  }, [activeTileStyle, applyTileLayer]);

  // Sync props change with map center and primary marker
  useEffect(() => {
    if (mapInstanceRef.current && mainMarkerRef.current) {
      if (lat === 0 && lng === 0) return;
      const currentPos = mainMarkerRef.current.getLatLng();
      if (Math.abs(currentPos.lat - safeLat) > 0.0001 || Math.abs(currentPos.lng - safeLng) > 0.0001) {
        mainMarkerRef.current.setLatLng([safeLat, safeLng]);
        mapInstanceRef.current.panTo([safeLat, safeLng]);
        mapInstanceRef.current.invalidateSize();
      }
    }
  }, [safeLat, safeLng]);

  // Update additional markers
  useEffect(() => {
    if (!additionalMarkersGroupRef.current || !mapInstanceRef.current) return;

    additionalMarkersGroupRef.current.clearLayers();

    additionalMarkers.forEach((m) => {
      if (!m.lat || !m.lng) return;
      const color = m.isSelected ? '#10B981' : '#F59E0B';
      const mark = L.marker([m.lat, m.lng], {
        icon: createPinIcon(color, m.isSelected),
      });

      if (m.name || m.popupText) {
        mark.bindPopup(`
          <div style="font-family: inherit; color: #F8FAFC; font-size: 12px; min-width: 170px;">
            <strong style="color: ${color}; font-size: 13px; display: block; margin-bottom: 4px;">${m.name}</strong>
            ${m.popupText ? `<p style="margin: 0; color: #94A3B8; font-size: 11px;">${m.popupText}</p>` : ''}
            <div style="margin-top: 6px; font-size: 10px; color: #38BDF8; font-family: monospace;">Lat ${m.lat.toFixed(4)}, Lng ${m.lng.toFixed(4)}</div>
          </div>
        `);
      }

      if (onSelectMarker) {
        mark.on('click', () => onSelectMarker(m.id));
      }

      mark.addTo(additionalMarkersGroupRef.current!);
    });

    // If marker is selected, pan map to it
    const selected = additionalMarkers.find((m) => m.isSelected);
    if (selected && selected.lat && selected.lng) {
      mapInstanceRef.current.panTo([selected.lat, selected.lng]);
    }
  }, [additionalMarkers, onSelectMarker, createPinIcon]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0B0F19] shadow-2xl">
      {/* Top Floating Overlay: Search Box, GPS & Controls */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-col sm:flex-row items-center gap-2 pointer-events-auto">
        {interactive && (
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#38BDF8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSearchSubmit();
                }
              }}
              placeholder="Search address, sector, or landmark..."
              className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-900/95 backdrop-blur-md border border-white/20 text-white text-base sm:text-xs placeholder-slate-400 focus:outline-none focus:border-[#38BDF8] shadow-xl min-h-[44px]"
            />
            {isSearching && (
              <RefreshCw className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#38BDF8] animate-spin" />
            )}
          </div>
        )}

        <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0 justify-end">
          {interactive && (
            <button
              type="button"
              onClick={handleDetectGPS}
              disabled={isLocating}
              className="flex-1 sm:flex-none px-3.5 py-2.5 min-h-[44px] rounded-xl bg-[#38BDF8] hover:bg-white text-[#0B0F19] font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(56,189,248,0.4)] transition-all active:scale-95 disabled:opacity-50"
              title="Detect precise GPS position"
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Locating...' : 'GPS'}</span>
            </button>
          )}

          {/* Layer switcher menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              className="px-3 py-2.5 min-h-[44px] rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/20 text-slate-200 hover:text-white flex items-center gap-1.5 shadow-lg transition-colors text-xs font-mono"
              title="Change Map Style (Zero Watermark)"
            >
              <Layers className="w-4 h-4 text-[#38BDF8]" />
              <span className="hidden md:inline">{TILE_PROVIDERS[activeTileStyle]?.name}</span>
            </button>

            {showLayerMenu && (
              <div className="absolute right-0 top-12 z-[1010] bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl p-2 shadow-2xl w-48 space-y-1">
                <div className="px-2 py-1 text-[10px] font-mono uppercase text-slate-400 border-b border-white/10 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#10B981]" />
                  <span>Free / No Watermark</span>
                </div>
                {(Object.keys(TILE_PROVIDERS) as TileLayerStyle[]).map((key) => {
                  const p = TILE_PROVIDERS[key];
                  const isSelected = activeTileStyle === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setActiveTileStyle(key);
                        setShowLayerMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between transition-colors ${
                        isSelected ? 'bg-[#38BDF8]/20 text-[#38BDF8] font-bold' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div>{p.name}</div>
                        <div className="text-[9px] text-slate-400 font-normal">{p.badge}</div>
                      </div>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reset / Recenter Map View */}
          <button
            type="button"
            onClick={handleRecenter}
            className="p-2.5 min-h-[44px] rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/20 text-slate-200 hover:text-white flex items-center justify-center shadow-lg transition-colors"
            title="Recenter on target location"
          >
            <Crosshair className="w-4 h-4 text-[#38BDF8]" />
          </button>

          {/* Fit all markers button (if multiple offices/points exist) */}
          {additionalMarkers.length > 0 && (
            <button
              type="button"
              onClick={handleFitAllMarkers}
              className="p-2.5 min-h-[44px] rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/20 text-slate-200 hover:text-white flex items-center justify-center shadow-lg transition-colors"
              title="Fit all command centers in view"
            >
              <Maximize2 className="w-4 h-4 text-[#10B981]" />
            </button>
          )}
        </div>
      </div>

      {/* Search Autocomplete Results Dropdown */}
      {searchResults.length > 0 && (
        <div className="absolute top-16 left-3 right-3 z-[1002] bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl p-2 shadow-2xl max-h-52 overflow-y-auto space-y-1">
          {searchResults.map((res, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectSearchResult(res)}
              className="p-2.5 rounded-lg hover:bg-slate-800 cursor-pointer text-xs text-white flex items-start gap-2 border-b border-white/5 last:border-none transition-colors"
            >
              <MapPin className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
              <span className="line-clamp-2">{res.displayName}</span>
            </div>
          ))}
        </div>
      )}

      {/* Leaflet Map Canvas */}
      <div 
        ref={mapContainerRef} 
        style={{ height, width: '100%', minHeight: height }} 
        className="z-[1] bg-[#0B0F19] outline-none" 
      />

      {/* Map Footer Information Ribbon */}
      <div className="bg-slate-900/95 border-t border-white/10 px-4 py-2.5 flex items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 truncate text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
          <span className="truncate">{address || statusMessage || `Sector Coordinates (${safeLat.toFixed(4)}, ${safeLng.toFixed(4)})`}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Watermark-Free Basemap</span>
          </span>
          {accuracyRadius && (
            <span className="px-2 py-0.5 rounded bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 shrink-0 font-bold text-[10px]">
              ±{accuracyRadius}m GPS
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
