import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, Crosshair, ExternalLink, Navigation, MapPin } from 'lucide-react';
import { Hospital } from '../types';
import { UserLocationData, getGoogleMapsDirectionsUrl, calculateDistanceKm } from '../services/locationService';

interface RealMapViewProps {
  hospitals: Hospital[];
  selectedHospitalIndex: number;
  onSelectHospital: (index: number) => void;
  userLocation: UserLocationData | null;
  onRefreshGps: () => void;
  className?: string;
}

export const RealMapView: React.FC<RealMapViewProps> = ({
  hospitals,
  selectedHospitalIndex,
  onSelectHospital,
  userLocation,
  onRefreshGps,
  className = ''
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [mapViewMode, setMapViewMode] = useState<'leaflet' | 'google_embed'>('leaflet');
  const [googleMode, setGoogleMode] = useState<'roadmap' | 'satellite'>('roadmap');

  const selectedHospital = hospitals[selectedHospitalIndex] || hospitals[0];

  const userLat = userLocation?.lat || 17.4156;
  const userLng = userLocation?.lng || 78.4350;

  // Initialize Leaflet Map
  useEffect(() => {
    if (mapViewMode !== 'leaflet' || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = selectedHospital?.latitude || userLat;
      const initialLng = selectedHospital?.longitude || userLng;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false
      });

      // Standard High-Performance OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
      }).addTo(map);

      // Add compact zoom control to top-right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Invalidate size in case container rendered while hidden
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    // 1. Update or create User Location Marker
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    const userIconHtml = `
      <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: #3b82f6; opacity: 0.35; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 16px; height: 16px; border-radius: 50%; background: #2563eb; border: 2.5px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); z-index: 10;"></div>
      </div>
    `;

    const userDivIcon = L.divIcon({
      html: userIconHtml,
      className: 'user-live-gps-pin',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    userMarkerRef.current = L.marker([userLat, userLng], { icon: userDivIcon })
      .addTo(map)
      .bindPopup(`<b>📍 Your Location</b><br/>${userLocation?.displayName || 'Live GPS'}`);

    // 2. Render Hospital Markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    hospitals.forEach((hosp, idx) => {
      if (!hosp.latitude || !hosp.longitude) return;
      const isSelected = idx === selectedHospitalIndex;

      const hospIconHtml = `
        <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
          <div style="background: ${isSelected ? '#dc2626' : '#2563eb'}; color: white; padding: 3px 8px; border-radius: 9999px; font-size: 10px; font-weight: 800; font-family: sans-serif; box-shadow: 0 4px 10px rgba(0,0,0,0.25); white-space: nowrap; border: 2px solid white; display: flex; items-center; gap: 4px;">
            <span>🏥 ${hosp.name.split(' ')[0]}</span>
            ${isSelected ? '<span style="background: rgba(255,255,255,0.3); padding: 0 4px; border-radius: 4px; font-size: 8.5px;">Active</span>' : ''}
          </div>
          <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid ${isSelected ? '#dc2626' : '#2563eb'}; margin-top: -1px;"></div>
        </div>
      `;

      const hospDivIcon = L.divIcon({
        html: hospIconHtml,
        className: 'hosp-marker-pin',
        iconSize: [0, 0]
      });

      const marker = L.marker([hosp.latitude, hosp.longitude], { icon: hospDivIcon })
        .addTo(map)
        .on('click', () => {
          onSelectHospital(idx);
        });

      const dist = userLocation
        ? calculateDistanceKm(userLat, userLng, hosp.latitude, hosp.longitude)
        : hosp.distance;

      marker.bindPopup(`
        <div style="font-family: sans-serif; min-width: 160px; padding: 4px;">
          <strong style="font-size: 12px; color: #0f172a;">${hosp.name}</strong>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${hosp.address}</div>
          <div style="font-size: 11px; color: #16a34a; font-weight: bold; margin-top: 4px;">~${dist} km • Live OPD Open</div>
          <a href="${getGoogleMapsDirectionsUrl(hosp.latitude, hosp.longitude, userLat, userLng, hosp.name)}" target="_blank" style="display: inline-block; margin-top: 6px; padding: 4px 8px; background: #2563eb; color: white; border-radius: 6px; font-size: 10px; font-weight: bold; text-decoration: none;">Get Directions →</a>
        </div>
      `);

      markersRef.current.push(marker);
    });

    // 3. Draw Polyline from user to selected hospital
    if (polylineRef.current) {
      polylineRef.current.remove();
    }

    if (selectedHospital && selectedHospital.latitude && selectedHospital.longitude) {
      polylineRef.current = L.polyline(
        [
          [userLat, userLng],
          [selectedHospital.latitude, selectedHospital.longitude]
        ],
        {
          color: '#2563eb',
          weight: 4,
          opacity: 0.85,
          dashArray: '6, 8'
        }
      ).addTo(map);

      // Fit bounds to show both user and destination
      const bounds = L.latLngBounds(
        [userLat, userLng],
        [selectedHospital.latitude, selectedHospital.longitude]
      );
      map.fitBounds(bounds, { padding: [35, 35], maxZoom: 15 });
    }

    return () => {
      // Keep instance alive across re-renders
    };
  }, [mapViewMode, selectedHospitalIndex, hospitals, userLat, userLng, userLocation]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const directionsUrl = selectedHospital?.latitude && selectedHospital?.longitude
    ? getGoogleMapsDirectionsUrl(
        selectedHospital.latitude,
        selectedHospital.longitude,
        userLocation?.lat,
        userLocation?.lng,
        selectedHospital.name
      )
    : '#';

  const googleEmbedUrl = selectedHospital?.latitude
    ? `https://maps.google.com/maps?q=${selectedHospital.latitude},${selectedHospital.longitude}&hl=en&z=15&t=${googleMode === 'satellite' ? 'k' : 'm'}&output=embed`
    : `https://maps.google.com/maps?q=${encodeURIComponent(selectedHospital?.name || 'Hospital')}&hl=en&z=15&output=embed`;

  return (
    <div className={`relative w-full h-[210px] sm:h-[230px] rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs select-none bg-slate-100 ${className}`}>
      {/* Top Map Floating Bar */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-[400] pointer-events-auto">
        {/* Google Maps / OpenStreetMap Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-sm border border-slate-200/80">
          <div className="flex items-center -space-x-0.5">
            <span className="w-2 h-2 rounded-full bg-[#4285F4]" />
            <span className="w-2 h-2 rounded-full bg-[#EA4335]" />
            <span className="w-2 h-2 rounded-full bg-[#FBBC05]" />
            <span className="w-2 h-2 rounded-full bg-[#34A853]" />
          </div>
          <span className="text-[10px] font-extrabold text-slate-800 tracking-tight">
            {mapViewMode === 'google_embed' ? 'Google Maps' : 'Live GPS Map'}
          </span>
          <span className="text-[8.5px] text-emerald-600 font-bold">• Real-Time</span>
        </div>

        {/* Mode Toggles & Directions */}
        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-full shadow-sm border border-slate-200/80">
          <button
            type="button"
            onClick={() => {
              if (mapViewMode === 'leaflet') {
                setMapViewMode('google_embed');
              } else {
                setMapViewMode('leaflet');
              }
            }}
            className={`px-2 py-0.5 rounded-full text-[9px] font-bold transition-all cursor-pointer ${
              mapViewMode === 'google_embed' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title="Toggle between Leaflet GPS Map and Google Maps Embed"
          >
            <Layers className="w-2.5 h-2.5 inline mr-1" />
            <span>{mapViewMode === 'google_embed' ? 'Google' : 'Interactive'}</span>
          </button>

          {mapViewMode === 'google_embed' && (
            <button
              type="button"
              onClick={() => setGoogleMode(googleMode === 'roadmap' ? 'satellite' : 'roadmap')}
              className="px-1.5 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[8.5px] font-bold transition-all cursor-pointer"
            >
              {googleMode === 'satellite' ? 'Street' : 'Satellite'}
            </button>
          )}

          <button
            type="button"
            onClick={onRefreshGps}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-700 transition-all cursor-pointer"
            title="Recenter GPS Location"
          >
            <Crosshair className="w-3.5 h-3.5 text-blue-600" />
          </button>

          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-[9px] font-extrabold transition-all cursor-pointer"
            title="Open Turn-by-Turn Navigation in Google Maps"
          >
            <Navigation className="w-2.5 h-2.5 fill-blue-600 text-blue-600" />
            <span>Directions</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>

      {/* Main Map Rendering Area */}
      {mapViewMode === 'leaflet' ? (
        <div ref={mapContainerRef} className="w-full h-full z-[1]" />
      ) : (
        <iframe
          title="Google Maps Location"
          src={googleEmbedUrl}
          className="w-full h-full border-0 pointer-events-auto"
          loading="lazy"
          allowFullScreen
        />
      )}

      {/* Floating Bottom Card: Distance & ETA to Selected Hospital */}
      {selectedHospital && (
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-slate-200/90 z-[400] text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <div className="truncate">
              <span className="font-extrabold text-slate-900 text-[11px] truncate block">
                {selectedHospital.name}
              </span>
              <span className="text-[9.5px] text-slate-500 truncate block">
                {selectedHospital.address}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[10px] border border-emerald-200">
              {userLocation && selectedHospital?.latitude && selectedHospital?.longitude
                ? `${calculateDistanceKm(userLat, userLng, selectedHospital.latitude, selectedHospital.longitude)} km`
                : (selectedHospital?.distance || '1.5 km')}
            </span>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] shadow-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              <span>Go</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
