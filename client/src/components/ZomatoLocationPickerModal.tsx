import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Search, 
  X, 
  MapPin, 
  LocateFixed, 
  Navigation, 
  Crosshair, 
  ChevronRight, 
  Check, 
  Building2, 
  Layers, 
  Compass,
  ArrowLeft
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
  const [activeTab, setActiveTab] = useState<'MAP' | 'LIST'>('MAP');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('All');
  const [isGpsLoading, setIsGpsLoading] = useState(false);

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

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
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

  // Leaflet Map Initialization with Zomato-style Floating Center Pin
  useEffect(() => {
    if (!isOpen || activeTab !== 'MAP' || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [pinnedLocation.lat, pinnedLocation.lng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false
      });

      // Premium High-Performance Clean OpenStreetMap Tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
      }).addTo(map);

      // Listen to map drag / move events to update center pin location
      map.on('moveend', async () => {
        if (isInternalMoveRef.current) {
          isInternalMoveRef.current = false;
          return;
        }
        const center = map.getCenter();
        const newLat = center.lat;
        const newLng = center.lng;

        // Find nearest known hub or reverse geocode
        let closestHub: LocationHub | null = null;
        let minDistance = Infinity;

        for (const hub of POPULAR_CARE_HUBS) {
          const dist = calculateDistanceKm(newLat, newLng, hub.lat, hub.lng);
          if (dist < minDistance) {
            minDistance = dist;
            closestHub = hub;
          }
        }

        if (closestHub && minDistance <= 3.0) {
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
          try {
            const geo = await reverseGeocode(newLat, newLng);
            setPinnedLocation({
              area: geo.area || 'Local Area',
              city: geo.city || 'City Region',
              state: geo.state || 'State',
              displayName: `${geo.area || 'Local Area'}, ${geo.city || 'City'}`,
              landmark: 'Custom Pinpoint Location',
              lat: newLat,
              lng: newLng
            });
          } catch (e) {
            setPinnedLocation(prev => ({ ...prev, lat: newLat, lng: newLng }));
          }
        }
      });

      mapInstanceRef.current = map;
    } else {
      const map = mapInstanceRef.current;
      isInternalMoveRef.current = true;
      map.setView([pinnedLocation.lat, pinnedLocation.lng], 15);
    }

    // Invalidate map size so it renders perfectly inside the container
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [isOpen, activeTab]);

  // Function to move map to a specific location
  const handleMoveMapTo = (hub: LocationHub) => {
    setPinnedLocation({
      area: hub.area,
      city: hub.city,
      state: hub.state,
      displayName: hub.name,
      landmark: hub.landmark,
      lat: hub.lat,
      lng: hub.lng
    });

    if (mapInstanceRef.current) {
      isInternalMoveRef.current = true;
      mapInstanceRef.current.flyTo([hub.lat, hub.lng], 15, { duration: 0.8 });
    }
    setActiveTab('MAP');
  };

  // Live GPS Trigger
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

  // Final Confirmation: updates global location and closes modal
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

  // Filtered hubs for search query
  const filteredHubs = useMemo(() => {
    return POPULAR_CARE_HUBS.filter(hub => {
      if (selectedCityFilter !== 'All' && hub.city.toLowerCase() !== selectedCityFilter.toLowerCase()) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        hub.name.toLowerCase().includes(q) ||
        hub.area.toLowerCase().includes(q) ||
        hub.city.toLowerCase().includes(q) ||
        hub.landmark.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedCityFilter]);

  if (!isOpen) return null;

  return (
    <PhoneModalPortal>
      {/* 
        CRITICAL CONSTRAINT: 
        1. 'absolute inset-0' keeps the modal STRICTLY 100% inside the phone container screen!
        2. 'pointer-events-auto' guarantees the backdrop, cross (X) button, and inputs ALL receive clicks!
      */}
      <div 
        className="absolute inset-0 z-50 flex flex-col bg-slate-950/70 backdrop-blur-sm pointer-events-auto overflow-hidden select-none animate-in fade-in duration-200"
        onClick={onClose}
      >
        {/* Main Location Sheet Container */}
        <div 
          onClick={(e) => e.stopPropagation()}
          className="relative w-full h-full flex flex-col bg-white overflow-hidden text-slate-900 shadow-2xl"
        >
          {/* Top Bar: Zomato-style Header with Search & Robust Cross Button */}
          <div className="bg-white px-3.5 pt-3 pb-2.5 border-b border-slate-100 shrink-0 z-20 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-[14px] text-slate-900 leading-tight">
                    Select Your Care Location
                  </h3>
                  <p className="text-[10.5px] text-slate-500 font-medium truncate">
                    Pinpoint your address on Google Maps or choose an area
                  </p>
                </div>
              </div>

              {/* Robust, Guaranteed-Working Cross (X) Button */}
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95"
                aria-label="Close location picker"
                title="Close"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Zomato-Style Location Search Bar */}
            <div className="relative flex items-center bg-slate-100 rounded-xl px-3 py-2 border border-slate-200/80 focus-within:border-blue-500 focus-within:bg-white transition-all shadow-inner">
              <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'LIST') setActiveTab('LIST');
                }}
                placeholder="Search area, landmark or street (e.g. Kukatpally)..."
                className="w-full text-xs bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* View Mode Switcher: Interactive Map Pin vs Search Hubs */}
            <div className="flex items-center justify-between gap-1 pt-0.5">
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-bold w-full">
                <button
                  type="button"
                  onClick={() => setActiveTab('MAP')}
                  className={`flex-1 py-1.5 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'MAP'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 shrink-0" />
                  <span>Choose on Map</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('LIST')}
                  className={`flex-1 py-1.5 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'LIST'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Popular Hubs ({filteredHubs.length})</span>
                </button>
              </div>
            </div>
          </div>

          {/* VIEW 1: ZOMATO-STYLE INTERACTIVE GOOGLE/LEAFLET MAP WITH CENTER PIN */}
          {activeTab === 'MAP' && (
            <div className="relative flex-1 w-full overflow-hidden flex flex-col">
              {/* Map Canvas */}
              <div ref={mapContainerRef} className="w-full h-full z-[1]" />

              {/* 
                THE FLOATING PIN (DEAD CENTER OF MAP):
                Just like Zomato / Swiggy / Uber!
                Users pan the map, and the pin always points to the exact center.
              */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-[400] pointer-events-none flex flex-col items-center">
                {/* Floating Micro-Badge */}
                <div className="px-2.5 py-1 rounded-full bg-slate-950/90 text-white font-extrabold text-[10px] shadow-lg border border-white/20 whitespace-nowrap mb-1 flex items-center gap-1 animate-bounce">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>Care will be shown here</span>
                </div>

                {/* Pin Head */}
                <div className="relative flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-red-600 border-3 border-white shadow-xl flex items-center justify-center text-white">
                    <MapPin className="w-5 h-5 fill-white text-red-600" />
                  </div>
                </div>

                {/* Pin Tip Indicator */}
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-red-600 -mt-0.5" />
                {/* Shadow dot on ground */}
                <div className="w-3 h-1.5 rounded-full bg-black/40 blur-[1px] mt-0.5" />
              </div>

              {/* Floating Top Controls on Map: GPS Target Button */}
              <div className="absolute top-3 right-3 z-[400] flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleDetectCurrentGps}
                  disabled={isGpsLoading}
                  className="w-10 h-10 rounded-full bg-white text-blue-600 hover:text-blue-700 shadow-lg border border-slate-200/90 flex items-center justify-center transition-all cursor-pointer active:scale-90"
                  title="Recenter on My Live GPS"
                >
                  <Crosshair className={`w-5 h-5 ${isGpsLoading ? 'animate-spin text-blue-600' : ''}`} />
                </button>
              </div>

              {/* Floating Instructions Pill */}
              <div className="absolute top-3 left-3 z-[400]">
                <div className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-bold text-slate-700 shadow-md border border-slate-200/80 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-blue-600" />
                  <span>Drag map to place pin</span>
                </div>
              </div>

              {/* Floating Bottom Drawer: Selected Location Details & Zomato Confirm Button */}
              <div className="bg-white p-3.5 border-t border-slate-200/90 shadow-2xl z-[450] space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      Selected Care Area
                    </span>
                    <h4 className="font-black text-sm text-slate-900 leading-snug">
                      {pinnedLocation.displayName}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                      {pinnedLocation.landmark || `${pinnedLocation.city}, ${pinnedLocation.state}`}
                    </p>
                  </div>
                </div>

                {/* Big Zomato-Style Primary Confirm Button */}
                <button
                  type="button"
                  onClick={handleConfirmLocation}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                >
                  <span>Confirm Location & Show Hospitals</span>
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          )}

          {/* VIEW 2: SEARCH & POPULAR INDIAN HUBS LIST */}
          {activeTab === 'LIST' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-3.5 scrollbar-none">
              {/* GPS Instant Trigger Card */}
              <button
                type="button"
                onClick={handleDetectCurrentGps}
                disabled={isGpsLoading}
                className="w-full p-3 rounded-2xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <LocateFixed className={`w-5 h-5 ${isGpsLoading ? 'animate-spin' : ''}`} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs text-blue-950 flex items-center gap-1.5">
                      <span>Use Current Location</span>
                      <span className="px-1.5 py-0.2 bg-blue-200/80 text-blue-800 text-[9px] rounded font-bold">GPS</span>
                    </h4>
                    <p className="text-[11px] text-blue-700 font-medium truncate mt-0.5">
                      {isGpsLoading ? 'Locating device satellite coordinates...' : (currentLocation?.displayName || 'Auto-detect exact GPS location')}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-blue-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>

              {/* City Filter Pills */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-0.5">
                  Filter by City:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
                  {['All', 'Hyderabad', 'Bengaluru', 'Coimbatore', 'Chennai', 'Mumbai', 'New Delhi'].map(city => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setSelectedCityFilter(city)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer whitespace-nowrap ${
                        selectedCityFilter === city
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hubs Results List */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-0.5">
                  {searchQuery ? `Matching Results (${filteredHubs.length}):` : 'Popular Healthcare Neighborhoods:'}
                </span>

                {filteredHubs.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                    <MapPin className="w-6 h-6 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">No areas found for "{searchQuery}"</p>
                    <p className="text-[11px] text-slate-400">Try searching for Kukatpally, Indiranagar, Peelamedu, or Adyar</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {filteredHubs.map(hub => {
                      const isSelected = pinnedLocation.displayName === hub.name;

                      return (
                        <div
                          key={hub.name}
                          onClick={() => handleMoveMapTo(hub)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-blue-50/80 border-blue-400 text-blue-950 shadow-xs'
                              : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                            }`}>
                              <MapPin className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-extrabold text-xs leading-tight truncate">
                                {hub.area}, <span className="font-semibold text-slate-500">{hub.city}</span>
                              </h4>
                              <p className="text-[10.5px] text-slate-500 font-medium truncate mt-0.5">
                                {hub.landmark}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isSelected ? (
                              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveMapTo(hub);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold transition-colors cursor-pointer"
                              >
                                View Map
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </PhoneModalPortal>
  );
};
