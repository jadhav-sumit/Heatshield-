import React, { useEffect, useRef, useState } from 'react';
import { 
  MapPin, 
  Flame, 
  Layers, 
  ShieldAlert, 
  Maximize2, 
  Navigation, 
  Info, 
  Sun, 
  Users, 
  Droplets,
  ExternalLink
} from 'lucide-react';
import { Junction, LocationInfo } from '../types';
import { getRiskColorClasses } from '../utils/heatRisk';
import L from 'leaflet';

interface HeatRiskMapProps {
  location: LocationInfo;
  junctions: Junction[];
  selectedJunction: Junction | null;
  onSelectJunction: (junction: Junction) => void;
}

export const HeatRiskMap: React.FC<HeatRiskMapProps> = ({
  location,
  junctions,
  selectedJunction,
  onSelectJunction,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [tileError, setTileError] = useState(false);

  const activeJunction = selectedJunction || junctions[0];

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // If map already exists, remove it cleanly before reinitializing
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        center: [location.lat, location.lon],
        zoom: 13,
        zoomControl: true,
        attributionControl: false,
      });

      // OpenStreetMap Tile Layer
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      });

      tileLayer.on('tileerror', () => {
        setTileError(true);
      });

      tileLayer.addTo(map);
      leafletMapRef.current = map;
      setMapLoaded(true);

      // Add markers for all junctions
      markersRef.current = [];
      junctions.forEach((j) => {
        const pinColor = 
          j.riskCategory === 'High' ? '#DC2626' : 
          j.riskCategory === 'Moderate' ? '#D97706' : 
          '#16A34A';

        const customIcon = L.divIcon({
          className: 'custom-heat-pin',
          html: `
            <div style="
              background-color: ${pinColor};
              width: 32px;
              height: 32px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 4px 10px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 800;
              font-size: 11px;
              cursor: pointer;
              transform: scale(${selectedJunction?.id === j.id ? '1.25' : '1.0'});
              transition: transform 0.2s;
            ">
              ${j.riskScore}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([j.lat, j.lon], { icon: customIcon }).addTo(map);
        
        marker.on('click', () => {
          onSelectJunction(j);
        });

        const popupContent = `
          <div style="font-family: inherit; font-size: 12px; padding: 4px; min-width: 180px;">
            <strong style="color: #111827; font-size: 13px; display: block; margin-bottom: 2px;">${j.name}</strong>
            <div style="margin-bottom: 4px; color: #4B5563;">Score: <b style="color: ${pinColor}">${j.riskScore}/100</b> (${j.riskCategory} Risk)</div>
            <div style="color: #374151;">Temp: <b>${j.temp}°C</b> | RH: <b>${j.humidity}%</b></div>
            <div style="margin-top: 6px; font-size: 11px; color: #1F2937; background: #F3F4F6; padding: 4px 6px; border-radius: 4px;">
              ${j.action}
            </div>
          </div>
        `;
        marker.bindPopup(popupContent);

        markersRef.current.push(marker);
      });

      // If active junction selected, pan to it
      if (activeJunction) {
        map.setView([activeJunction.lat, activeJunction.lon], 14);
      }
    } catch (e) {
      console.warn('Leaflet map initialization warning:', e);
      setTileError(true);
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [location.lat, location.lon, junctions, activeJunction?.id]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-stone-900">
              Interactive Heat-Risk Spatial Map
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
              {location.city || location.name}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Spatial distribution of urban heat stress, colored by Low, Moderate, and High risk classifications.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 bg-stone-50 px-3 py-2 rounded-xl border border-stone-200 text-xs">
          <span className="font-bold text-stone-700 mr-1">Risk Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600" />
            <span className="text-stone-700 font-medium">Low (0–44)</span>
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-stone-700 font-medium">Mod (45–74)</span>
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            <span className="w-3 h-3 rounded-full bg-red-600" />
            <span className="text-stone-700 font-medium">High (75–100)</span>
          </div>
        </div>
      </div>

      {/* Main Map + Selected Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Map Canvas */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden relative flex flex-col min-h-[460px]">
          {/* Map Container */}
          <div 
            ref={mapContainerRef} 
            className="w-full h-[500px] z-10" 
            style={{ background: '#E2E8F0' }}
          />

          {/* Map Attribution and Coordinates overlay */}
          <div className="absolute bottom-3 left-3 z-20 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-stone-300 text-[11px] text-stone-700 shadow-sm flex items-center gap-2">
            <Navigation className="w-3.5 h-3.5 text-emerald-700" />
            <span>
              Center: <strong>{location.lat.toFixed(4)}°N, {location.lon.toFixed(4)}°E</strong>
            </span>
          </div>

          <div className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-stone-300 text-[10px] text-stone-600 shadow-sm">
            {location.isLive ? 'OpenStreetMap Live Tiles' : 'Simulated Spatial Boundary'}
          </div>
        </div>

        {/* Right 4 Cols: Selected Location Details Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <span className="text-xs uppercase font-bold text-stone-500 tracking-wider">
                Selected Location Inspector
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getRiskColorClasses(activeJunction.riskCategory).badge}`}>
                {activeJunction.riskCategory} Risk
              </span>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-stone-900">{activeJunction.name}</h2>
              <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                {activeJunction.neighborhood}
              </p>
            </div>

            {/* Score Callout */}
            <div className={`p-4 rounded-xl border ${getRiskColorClasses(activeJunction.riskCategory).bg} ${getRiskColorClasses(activeJunction.riskCategory).border}`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-600 font-semibold block">Heat-Risk Index</span>
                  <span className={`text-3xl font-black font-mono ${getRiskColorClasses(activeJunction.riskCategory).text}`}>
                    {activeJunction.riskScore}
                    <span className="text-xs font-normal text-stone-500">/100</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-stone-600 font-semibold block">Air Temp</span>
                  <span className="text-2xl font-black text-stone-900">
                    {activeJunction.temp}°C
                  </span>
                </div>
              </div>
            </div>

            {/* Microclimate Indicators */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-500">Relative Humidity:</span>
                <span className="font-bold text-stone-900">{activeJunction.humidity}%</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-500">Traffic Congestion:</span>
                <span className="font-bold text-stone-900">{activeJunction.traffic}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-500">Tree Canopy & Shade:</span>
                <span className="font-bold text-stone-900">{activeJunction.shadePercent}%</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-500">Staff On Duty:</span>
                <span className="font-bold text-stone-900">{activeJunction.vulnerableStaffCount} Personnel</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-500">Drinking Water Nearby:</span>
                <span className={`font-bold ${activeJunction.drinkingWaterNearby ? 'text-emerald-700' : 'text-red-700'}`}>
                  {activeJunction.drinkingWaterNearby ? 'Verified Kiosk' : 'No Direct Source'}
                </span>
              </div>
            </div>

            {/* Protocol */}
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 space-y-1">
              <span className="font-bold text-stone-900 block">Duty Protocol:</span>
              <p className="leading-relaxed">{activeJunction.action}</p>
            </div>
          </div>

          {/* Quick Select Buttons */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2">
            <span className="text-xs font-bold text-stone-700 block">All Pins in Current Area:</span>
            <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
              {junctions.map((j) => (
                <button
                  key={j.id}
                  onClick={() => onSelectJunction(j)}
                  className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition ${
                    activeJunction.id === j.id
                      ? 'bg-emerald-100 text-emerald-950 font-bold'
                      : 'hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <span className="truncate">{j.name}</span>
                  <span className={`font-mono text-[11px] font-bold ${j.riskScore >= 75 ? 'text-red-600' : j.riskScore >= 45 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {j.riskScore}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
