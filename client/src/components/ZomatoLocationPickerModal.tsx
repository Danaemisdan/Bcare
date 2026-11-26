import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Search, 
  X, 
  MapPin, 
  LocateFixed, 
  Crosshair, 
  ChevronRight, 
  Check, 
  Building2, 
  Layers, 
  Compass,
  Sparkles,
  Loader2
} from 'lucide-react';
import { UserLocationData, reverseGeocode, calculateDistanceKm } from '../services/locationService';
import { PhoneModalPortal } from './PhoneModalPortal';

export interface LocationHub {
  name: string;
  area: string;
  city: string;
  state: string;
  landmark: string;
  lat: number;
  lng: number;
}

export const POPULAR_CARE_HUBS: LocationHub[] = [
  // Hyderabad
  { name: 'Kukatpally, Hyderabad', area: 'Kukatpally', city: 'Hyderabad', state: 'Telangana', landmark: 'KPHB Colony & JNTU Road', lat: 17.4947, lng: 78.3996 },
  { name: 'Banjara Hills, Hyderabad', area: 'Banjara Hills', city: 'Hyderabad', state: 'Telangana', landmark: 'Road No. 12, Care Hospitals', lat: 17.4156, lng: 78.4350 },
  { name: 'Hitec City, Hyderabad', area: 'Hitec City', city: 'Hyderabad', state: 'Telangana', landmark: 'Cyber Towers & Inorbit Mall', lat: 17.4435, lng: 78.3772 },
  { name: 'Gachibowli, Hyderabad', area: 'Gachibowli', city: 'Hyderabad', state: 'Telangana', landmark: 'Financial District, AIG Hospitals', lat: 17.4401, lng: 78.3489 },
  { name: 'Jubilee Hills, Hyderabad', area: 'Jubilee Hills', city: 'Hyderabad', state: 'Telangana', landmark: 'Road No. 36, Apollo Health City', lat: 17.4319, lng: 78.4073 },
  { name: 'Secunderabad, Hyderabad', area: 'Secunderabad', city: 'Hyderabad', state: 'Telangana', landmark: 'Clock Tower & KIMS Hospital', lat: 17.4399, lng: 78.4983 },

  // Bengaluru
  { name: 'Indiranagar, Bengaluru', area: 'Indiranagar', city: 'Bengaluru', state: 'Karnataka', landmark: '100 Feet Road, CMH Hospital', lat: 12.9716, lng: 77.6412 },
  { name: 'Koramangala, Bengaluru', area: 'Koramangala', city: 'Bengaluru', state: 'Karnataka', landmark: 'Sony World Signal, St. Johns', lat: 12.9352, lng: 77.6245 },
  { name: 'Whitefield, Bengaluru', area: 'Whitefield', city: 'Bengaluru', state: 'Karnataka', landmark: 'ITPL Main Road, Manipal Hospital', lat: 12.9698, lng: 77.7500 },
  { name: 'HSR Layout, Bengaluru', area: 'HSR Layout', city: 'Bengaluru', state: 'Karnataka', landmark: 'Sector 1, Outer Ring Road', lat: 12.9121, lng: 77.6446 },
  { name: 'Jayanagar, Bengaluru', area: 'Jayanagar', city: 'Bengaluru', state: 'Karnataka', landmark: '4th Block, Sagar Hospitals', lat: 12.9308, lng: 77.5838 },

  // Coimbatore
  { name: 'Peelamedu, Coimbatore', area: 'Peelamedu', city: 'Coimbatore', state: 'Tamil Nadu', landmark: 'Avinashi Road, PSG Hospital', lat: 11.0267, lng: 76.9945 },
  { name: 'RS Puram, Coimbatore', area: 'RS Puram', city: 'Coimbatore', state: 'Tamil Nadu', landmark: 'DB Road, Kovai Medical Centre', lat: 11.0089, lng: 76.9490 },
  { name: 'Gandhipuram, Coimbatore', area: 'Gandhipuram', city: 'Coimbatore', state: 'Tamil Nadu', landmark: 'Cross Cut Road, GKNM Hospital', lat: 11.0168, lng: 76.9678 },

  // Chennai
  { name: 'Adyar, Chennai', area: 'Adyar', city: 'Chennai', state: 'Tamil Nadu', landmark: 'LB Road, Fortis Malar Hospital', lat: 13.0012, lng: 80.2565 },
  { name: 'Anna Nagar, Chennai', area: 'Anna Nagar', city: 'Chennai', state: 'Tamil Nadu', landmark: '2nd Avenue, MGM Healthcare', lat: 13.0850, lng: 80.2101 },
  { name: 'T. Nagar, Chennai', area: 'T. Nagar', city: 'Chennai', state: 'Tamil Nadu', landmark: 'Pondy Bazaar, Apollo Clinic', lat: 13.0418, lng: 80.2341 },
  { name: 'Velachery, Chennai', area: 'Velachery', city: 'Chennai', state: 'Tamil Nadu', landmark: '100 Feet Bypass, Gleneagles Hospital', lat: 12.9756, lng: 80.2207 },

  // Mumbai
  { name: 'Bandra West, Mumbai', area: 'Bandra West', city: 'Mumbai', state: 'Maharashtra', landmark: 'Linking Road, Lilavati Hospital', lat: 19.0596, lng: 72.8295 },
  { name: 'Andheri West, Mumbai', area: 'Andheri West', city: 'Mumbai', state: 'Maharashtra', landmark: 'Lokhandwala, Kokilaben Hospital', lat: 19.1363, lng: 72.8277 },
  { name: 'Powai, Mumbai', area: 'Powai', city: 'Mumbai', state: 'Maharashtra', landmark: 'Hiranandani, Hiranandani Hospital', lat: 19.1176, lng: 72.9060 },

  // Delhi NCR
  { name: 'Connaught Place, New Delhi', area: 'Connaught Place', city: 'New Delhi', state: 'Delhi', landmark: 'Barakhamba Road, Max Healthcare', lat: 28.6315, lng: 77.2167 },
  { name: 'Gurgaon Cyber City, Gurugram', area: 'Cyber City', city: 'Gurugram', state: 'Haryana', landmark: 'DLF Phase 2, Fortis Hospital', lat: 28.4950, lng: 77.0895 },
  { name: 'Noida Sector 18, Noida', area: 'Sector 18', city: 'Noida', state: 'Uttar Pradesh', landmark: 'Atta Market, Jaypee Hospital', lat: 28.5708, lng: 77.3261 }
];

const GOOGLE_ROADMAP_URL = 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
const GOOGLE_SATELLITE_URL = 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';

interface ZomatoLocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation?: UserLocationData | null;
  onSelectLocation: (loc: UserLocationData) => void;
  onRefreshGps?: () => Promise<void> | void;
}

export const ZomatoLocationPickerModal: React.FC<ZomatoLocationPickerModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
  onRefreshGps
}) => {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [isMapDragging, setIsMapDragging] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Active Pinned Location State
  const [pinnedLocation, setPinnedLocation] = useState<{
    area: string;
    city: string;
    state: string;
    displayName: string;
    landmark?: string;
    lat: number;
    lng: number;
  }>({
    area: currentLocation?.area || 'Kukatpally',
    city: currentLocation?.city || 'Hyderabad',
    state: currentLocation?.state || 'Telangana',
    displayName: currentLocation?.displayName || 'Kukatpally, Hyderabad',
    landmark: 'Road No. 1, KPHB Colony',
    lat: currentLocation?.lat || 17.4947,
    lng: currentLocation?.lng || 78.3996
  });

  const [mapContainerNode, setMapContainerNode] = useState<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const isInternalMoveRef = useRef(false);

  // Sync initial location when modal opens
  useEffect(() => {
    if (isOpen && currentLocation) {
      setPinnedLocation({
        area: currentLocation.area || 'Kukatpally',
        city: currentLocation.city || 'Hyderabad',
        state: currentLocation.state || 'Telangana',
        displayName: currentLocation.displayName || 'Kukatpally, Hyderabad',
        landmark: 'Auto-detected GPS location',
        lat: currentLocation.lat || 17.4947,
        lng: currentLocation.lng || 78.3996
      });
    }
  }, [isOpen, currentLocation]);

  // Leaflet Map Initialization with Genuine Google Maps Tiles & Center Floating Pin
  useEffect(() => {
    if (!isOpen || !mapContainerNode) return;

    const tileUrl = mapType === 'satellite' ? GOOGLE_SATELLITE_URL : GOOGLE_ROADMAP_URL;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerNode, {
        center: [pinnedLocation.lat, pinnedLocation.lng],
        zoom: 16,
        zoomControl: false,
        attributionControl: false
      });

      // Genuine Google Maps Tile Layer
      const tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 20,
        subdomains: ['0', '1', '2', '3'],
        attribution: '© Google Maps'
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      // Handle map dragging states for realistic pin bounce
      map.on('movestart', () => {
        setIsMapDragging(true);
      });

      // Update location when user finishes panning/dragging map
      map.on('moveend', async () => {
        setIsMapDragging(false);
        if (isInternalMoveRef.current) {
          isInternalMoveRef.current = false;
          return;
        }

        const center = map.getCenter();
        const newLat = center.lat;
        const newLng = center.lng;

        // Check against nearest known hubs first for instant precision
        let closestHub: LocationHub | null = null;
        let minDistance = Infinity;

        for (const hub of POPULAR_CARE_HUBS) {
          const dist = calculateDistanceKm(newLat, newLng, hub.lat, hub.lng);
          if (dist < minDistance) {
            minDistance = dist;
            closestHub = hub;
          }
        }

        if (closestHub && minDistance <= 1.5) {
          setPinnedLocation({
            area: closestHub.area,
            city: closestHub.city,
            state: closestHub.state,
            displayName: closestHub.name,
            landmark: closestHub.landmark,
            lat: newLat,
            lng: newLng
          });
        } else {
          setIsGeocoding(true);
          try {
            const geo = await reverseGeocode(newLat, newLng);
            setPinnedLocation({
              area: geo.area || 'Selected Area',
              city: geo.city || 'City',
              state: geo.state || 'State',
              displayName: `${geo.area || 'Selected Area'}, ${geo.city || 'City'}`,
              landmark: 'Google Maps Pinpoint',
              lat: newLat,
              lng: newLng
            });
          } catch (e) {
            setPinnedLocation(prev => ({ ...prev, lat: newLat, lng: newLng }));
          } finally {
            setIsGeocoding(false);
          }
        }
      });

      mapInstanceRef.current = map;
    } else {
      // If map already exists, update tile layer url if type changed
      if (tileLayerRef.current) {
        tileLayerRef.current.setUrl(tileUrl);
      }
    }

    // Invalidate size reliably so Google Maps tiles render seamlessly
    const timer1 = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 100);
    const timer2 = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isOpen, mapContainerNode, mapType]);

  // Clean up map instance when modal closes or unmounts
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Fly map to a selected hub
  const handleSelectHub = (hub: LocationHub) => {
    setPinnedLocation({
      area: hub.area,
      city: hub.city,
      state: hub.state,
      displayName: hub.name,
      landmark: hub.landmark,
      lat: hub.lat,
      lng: hub.lng
    });

    setIsSearchActive(false);
    setSearchQuery('');

    if (mapInstanceRef.current) {
      isInternalMoveRef.current = true;
      mapInstanceRef.current.flyTo([hub.lat, hub.lng], 16, { duration: 0.8 });
    }
  };

  // Recenter to user's live GPS coordinates
  const handleDetectCurrentGps = async () => {
    setIsGpsLoading(true);
    try {
      if (onRefreshGps) {
        await onRefreshGps();
      }
      if (currentLocation) {
        setPinnedLocation({
          area: currentLocation.area || 'Kukatpally',
          city: currentLocation.city || 'Hyderabad',
          state: currentLocation.state || 'Telangana',
          displayName: currentLocation.displayName || 'Kukatpally, Hyderabad',
          landmark: 'Live GPS Pinpoint',
          lat: currentLocation.lat || 17.4947,
          lng: currentLocation.lng || 78.3996
        });
        if (mapInstanceRef.current) {
          isInternalMoveRef.current = true;
          mapInstanceRef.current.flyTo([currentLocation.lat, currentLocation.lng], 16, { duration: 0.8 });
        }
      }
    } catch (e) {
      console.warn('GPS detection failed:', e);
    } finally {
      setIsGpsLoading(false);
    }
  };

  // Confirm selection and close
  const handleConfirmLocation = () => {
    onSelectLocation({
      area: pinnedLocation.area,
      city: pinnedLocation.city,
      state: pinnedLocation.state,
      country: 'India',
      displayName: pinnedLocation.displayName,
      lat: pinnedLocation.lat,
      lng: pinnedLocation.lng,
      isLiveGps: true,
      timestamp: Date.now()
    });
    onClose();
  };

  // Filtered hubs for search
  const filteredHubs = useMemo(() => {
    if (!searchQuery.trim()) return POPULAR_CARE_HUBS.slice(0, 8);
    const q = searchQuery.toLowerCase();
    return POPULAR_CARE_HUBS.filter(hub => 
      hub.name.toLowerCase().includes(q) ||
      hub.area.toLowerCase().includes(q) ||
      hub.city.toLowerCase().includes(q) ||
      hub.landmark.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <PhoneModalPortal>
      {/* 
        STRICT MOBILE CONTAINER ENFORCEMENT:
        'absolute inset-0' keeps the modal 100% inside the phone screen (#phone-screen-modal-root).
        'pointer-events-auto' guarantees every click on buttons/map works seamlessly.
      */}
      <div 
        className="absolute inset-0 z-50 flex flex-col bg-slate-900 pointer-events-auto overflow-hidden select-none animate-in fade-in duration-200"
        style={{ overscrollBehavior: 'none', touchAction: 'none' }}
      >
        {/* Fullscreen Map Canvas */}
        <div className="relative w-full h-full overflow-hidden">
          {/* Leaflet Map Canvas with real Google Maps Tiles */}
          <div 
            ref={node => {
              if (node && node !== mapContainerNode) {
                setMapContainerNode(node);
              }
            }}
            className="absolute inset-0 w-full h-full z-[1]" 
          />

          {/* 
            ZOMATO-STYLE FLOATING CENTER PIN:
            Fixed dead-center of the screen.
            Reacts dynamically to user panning.
          */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-[400] pointer-events-none flex flex-col items-center">
            {/* Floating Speech Tooltip */}
            <div className={`px-3 py-1 rounded-full bg-slate-900/95 text-white font-black text-[10.5px] shadow-2xl border border-white/20 whitespace-nowrap mb-1.5 flex items-center gap-1.5 transition-all duration-200 ${
              isMapDragging ? '-translate-y-2 opacity-90 scale-95' : 'translate-y-0 opacity-100 scale-100'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isMapDragging ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
              <span>{isMapDragging ? 'Pinpointing address...' : (isGeocoding ? 'Detecting address...' : 'Care will be provided here')}</span>
            </div>

            {/* Google / Zomato Signature Red Pin Head */}
            <div className={`relative flex items-center justify-center transition-transform duration-200 ${
              isMapDragging ? '-translate-y-2 scale-110' : 'translate-y-0 scale-100'
            }`}>
              <div className="w-10 h-10 rounded-full bg-red-600 border-3 border-white shadow-2xl flex items-center justify-center text-white">
                <MapPin className="w-5 h-5 fill-white text-red-600" />
              </div>
            </div>

            {/* Sharp Pin Point Arrow */}
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[9px] border-t-red-600 -mt-0.5" />
            
            {/* Ground Contact Shadow */}
            <div className={`rounded-full bg-black/40 blur-[1.5px] transition-all duration-200 ${
              isMapDragging ? 'w-2 h-1 mt-3 opacity-25' : 'w-4 h-1.5 mt-0.5 opacity-60'
            }`} />
          </div>

          {/* TOP BAR: Floating Google Search Bar & Guaranteed Working Close Button */}
          <div className="absolute top-10 left-3 right-3 z-[500] space-y-2">
            <div className="flex items-center gap-2">
              {/* Back / Close (X) Button */}
              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/90 text-slate-800 hover:bg-slate-100 active:bg-slate-200 flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0"
                aria-label="Close location picker"
                title="Close"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>

              {/* Floating Google Maps Style Search Input */}
              <div className="flex-1 relative flex items-center bg-white/95 backdrop-blur-md rounded-2xl px-3 py-2.5 shadow-lg border border-slate-200/90 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                <Search className="w-4 h-4 text-blue-600 shrink-0 mr-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setIsSearchActive(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchActive(true);
                  }}
                  placeholder="Search area, landmark or street..."
                  className="w-full text-xs bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400 font-bold"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setIsSearchActive(false);
                    }}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Instant Search Autocomplete Dropdown */}
            {isSearchActive && (
              <div className="bg-white/98 backdrop-blur-md rounded-2xl p-2 shadow-2xl border border-slate-200/90 max-h-60 overflow-y-auto space-y-1 animate-in fade-in duration-150 scrollbar-none">
                <div className="flex items-center justify-between px-2 py-1 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                  <span>Google Maps Suggestions</span>
                  <button 
                    type="button"
                    onClick={() => setIsSearchActive(false)}
                    className="text-blue-600 lowercase font-bold cursor-pointer"
                  >
                    hide
                  </button>
                </div>
                {/* Instant GPS Option in Dropdown */}
                <div
                  onClick={() => {
                    setIsSearchActive(false);
                    handleDetectCurrentGps();
                  }}
                  className="p-2 rounded-xl bg-blue-50/80 hover:bg-blue-100/80 text-blue-900 flex items-center gap-2.5 cursor-pointer transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <LocateFixed className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-black truncate">Use Current Location</h5>
                    <p className="text-[10px] text-blue-600 font-medium truncate">GPS High Accuracy</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                </div>

                {filteredHubs.map(hub => (
                  <div
                    key={hub.name}
                    onClick={() => handleSelectHub(hub)}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-800 flex items-center gap-2.5 cursor-pointer transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-black text-slate-900 truncate">{hub.area}, {hub.city}</h5>
                      <p className="text-[10px] text-slate-500 font-medium truncate">{hub.landmark}</p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FLOATING MAP CONTROLS: Map/Satellite Switch & GPS Recenter */}
          <div className="absolute top-24 right-3 z-[450] flex flex-col gap-2 items-end">
            {/* Google Map / Satellite Layer Toggle */}
            <button
              type="button"
              onClick={() => setMapType(prev => prev === 'roadmap' ? 'satellite' : 'roadmap')}
              className="px-2.5 py-1.5 rounded-xl bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/90 text-slate-800 text-[10px] font-extrabold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              title="Toggle Google Maps Roadmap / Satellite"
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>{mapType === 'roadmap' ? 'Satellite' : 'Roadmap'}</span>
            </button>

            {/* Recenter on Live GPS Coordinates */}
            <button
              type="button"
              onClick={handleDetectCurrentGps}
              disabled={isGpsLoading}
              className="w-10 h-10 rounded-2xl bg-white/95 backdrop-blur-md text-blue-600 hover:text-blue-700 shadow-lg border border-slate-200/90 flex items-center justify-center cursor-pointer active:scale-95 transition-all"
              title="Center on My GPS Location"
            >
              <Crosshair className={`w-5 h-5 ${isGpsLoading ? 'animate-spin text-blue-600' : 'text-blue-600'}`} />
            </button>
          </div>

          {/* FLOATING MAP INSTRUCTION PILL */}
          <div className="absolute top-24 left-3 z-[450]">
            <div className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-bold text-slate-700 shadow-md border border-slate-200/90 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span>Drag to place pin</span>
            </div>
          </div>

          {/* BOTTOM DRAWER: ZOMATO CONFIRMATION CARD */}
          <div className="absolute bottom-0 left-0 right-0 z-[480] bg-white rounded-t-[28px] shadow-2xl border-t border-slate-200/90 p-4 space-y-3">
            {/* Quick Location Hubs Pill Carousel */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none no-scrollbar">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                Nearby:
              </span>
              {POPULAR_CARE_HUBS.slice(0, 6).map(hub => (
                <button
                  key={hub.name}
                  type="button"
                  onClick={() => handleSelectHub(hub)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 transition-all cursor-pointer whitespace-nowrap ${
                    pinnedLocation.area === hub.area
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {hub.area}
                </button>
              ))}
            </div>

            {/* Selected Location Details */}
            <div className="flex items-start gap-3 pt-0.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200/80 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Selected Care Area
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[9px] border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Google Maps
                  </span>
                </div>
                <h4 className="font-black text-base text-slate-900 leading-snug truncate">
                  {pinnedLocation.displayName}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                  {pinnedLocation.landmark || `${pinnedLocation.city}, ${pinnedLocation.state}`}
                </p>
              </div>
            </div>

            {/* Primary Confirm Button */}
            <button
              type="button"
              onClick={handleConfirmLocation}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
            >
              <span>Confirm Location & Show Hospitals</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      </div>
    </PhoneModalPortal>
  );
};