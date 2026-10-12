import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Search, 
  Navigation, 
  Globe2, 
  Check, 
  AlertCircle, 
  Loader2, 
  Compass,
  Building,
  MapPinned
} from 'lucide-react';
import { LocationInfo } from '../types';
import { GLOBAL_PRESET_CITIES } from '../data/mockData';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: LocationInfo;
  onSelectLocation: (newLocation: LocationInfo) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [address, setAddress] = useState(currentLocation.address || '');
  const [city, setCity] = useState(currentLocation.city || '');
  const [stateProv, setStateProv] = useState(currentLocation.state || '');
  const [country, setCountry] = useState(currentLocation.country || '');
  const [lat, setLat] = useState(currentLocation.lat.toString());
  const [lon, setLon] = useState(currentLocation.lon.toString());

  const [isSearching, setIsSearching] = useState(false);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [statusMsg, setStatusMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  if (!isOpen) return null;

  // Handle global search via geocoding lookup
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setStatusMsg(null);

    try {
      // Call public Open-Meteo geocoding API directly or via server
      const encoded = encodeURIComponent(searchQuery.trim());
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encoded}&count=5&language=en&format=json`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          setSearchResults(data.results);
          setStatusMsg({ type: 'success', text: `Found ${data.results.length} locations matching "${searchQuery}".` });
        } else {
          setSearchResults([]);
          setStatusMsg({ type: 'error', text: `No matching locations found for "${searchQuery}". Try city or country name.` });
        }
      } else {
        throw new Error('Geocoding service unavailable');
      }
    } catch (err) {
      // Fallback matching against presets
      const matched = GLOBAL_PRESET_CITIES.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.country.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (matched.length > 0) {
        setSearchResults(matched.map(m => ({
          name: m.city,
          admin1: m.state,
          country: m.country,
          latitude: m.lat,
          longitude: m.lon,
        })));
      } else {
        setStatusMsg({ type: 'error', text: 'Network geocoding failed. You can manually enter City, State, and Country below.' });
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (res: any) => {
    const cityName = res.name;
    const stateName = res.admin1 || '';
    const countryName = res.country || '';
    const latitude = res.latitude;
    const longitude = res.longitude;

    setCity(cityName);
    setStateProv(stateName);
    setCountry(countryName);
    setLat(latitude.toString());
    setLon(longitude.toString());
    setSearchResults([]);
    setStatusMsg({ type: 'success', text: `Selected: ${cityName}, ${countryName}. Click "Use This Location" to confirm.` });
  };

  const handleApplyPreset = (preset: typeof GLOBAL_PRESET_CITIES[0]) => {
    setCity(preset.city);
    setStateProv(preset.state);
    setCountry(preset.country);
    setLat(preset.lat.toString());
    setLon(preset.lon.toString());
    setAddress(`${preset.city} Metropolitan Area`);
    setStatusMsg({ type: 'success', text: `Loaded preset for ${preset.name}.` });
  };

  // Browser Geolocation (only after user explicitly clicks)
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setStatusMsg({ type: 'error', text: 'Geolocation is not supported by your browser.' });
      return;
    }

    setIsLocatingUser(true);
    setStatusMsg(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsLocatingUser(false);
        const userLat = pos.coords.latitude;
        const userLon = pos.coords.longitude;
        setLat(userLat.toFixed(4));
        setLon(userLon.toFixed(4));

        // Attempt reverse geocoding via Open-Meteo / BigDataCloud
        try {
          const revRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${userLat}&longitude=${userLon}&localityLanguage=en`);
          if (revRes.ok) {
            const revData = await revRes.json();
            setCity(revData.city || revData.locality || 'Current Location');
            setStateProv(revData.principalSubdivision || '');
            setCountry(revData.countryName || 'Global');
            setAddress(`${revData.locality || ''}, ${revData.principalSubdivision || ''}`);
          }
        } catch {
          setCity('Local GPS Coordinates');
          setCountry('Detected Location');
        }

        setStatusMsg({ type: 'success', text: `Detected GPS coordinates: ${userLat.toFixed(3)}, ${userLon.toFixed(3)}.` });
      },
      (err) => {
        setIsLocatingUser(false);
        setStatusMsg({ type: 'error', text: `GPS permission denied or unavailable: ${err.message}.` });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleConfirmLocation = () => {
    const finalCity = city.trim() || 'Pune';
    const finalCountry = country.trim() || 'India';
    const fullName = `${finalCity}${stateProv ? ', ' + stateProv : ''}, ${finalCountry}`;

    const newLoc: LocationInfo = {
      name: fullName,
      city: finalCity,
      state: stateProv.trim(),
      country: finalCountry,
      address: address.trim() || undefined,
      lat: parseFloat(lat) || 18.5204,
      lon: parseFloat(lon) || 73.8567,
      isLive: true,
      source: 'Open-Meteo Live API & Global Geocoder',
      lastRefreshed: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onSelectLocation(newLoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-[#FAF8F5] border border-stone-300 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#123624] text-white p-5 flex items-center justify-between border-b border-[#214E37]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Global Location Selection</h3>
              <p className="text-xs text-emerald-200">
                Select any city, state/province, or country worldwide
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-[#1D4E36] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar flex-1">
          {/* Active Location Card */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-600 text-white">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Currently Monitored
                </span>
                <span className="font-bold text-stone-900 text-sm">
                  {currentLocation.name}
                </span>
                <span className="text-xs text-stone-500 block">
                  Coordinates: {currentLocation.lat.toFixed(4)}°N, {currentLocation.lon.toFixed(4)}°E
                </span>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-200/70 text-emerald-900 font-semibold">
              Active
            </span>
          </div>

          {/* Search bar & Autocomplete */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Search by City, Landmark, Address, or Country
            </label>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Pune, Phoenix, Mumbai, Dubai, London, Cairo..."
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-stone-900"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-4 py-2 rounded-lg bg-[#123624] hover:bg-[#1B4D35] text-white text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
              </button>
            </form>

            {/* Search Results Dropdown List */}
            {searchResults.length > 0 && (
              <div className="mt-2 p-2 bg-white rounded-xl border border-emerald-300 shadow-md divide-y divide-stone-100 max-h-48 overflow-y-auto">
                {searchResults.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectSearchResult(res)}
                    className="w-full text-left p-2 rounded-lg hover:bg-emerald-50 transition flex items-center justify-between text-xs text-stone-800"
                  >
                    <div className="flex items-center gap-2">
                      <MapPinned className="w-4 h-4 text-emerald-600" />
                      <span className="font-semibold text-stone-900">
                        {res.name}
                        {res.admin1 ? `, ${res.admin1}` : ''}, {res.country}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-stone-500">
                      {res.latitude?.toFixed(2)}°, {res.longitude?.toFixed(2)}°
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-stone-700">Quick Global Presets:</span>
              <span className="text-[11px] text-stone-500">Hackathon demo hubs</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {GLOBAL_PRESET_CITIES.slice(0, 7).map((preset) => (
                <button
                  key={preset.city}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                    city === preset.city
                      ? 'bg-emerald-700 text-white border-emerald-800 font-semibold'
                      : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                  }`}
                >
                  {preset.city}
                </button>
              ))}
            </div>
          </div>

          {/* Browser Geolocation Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isLocatingUser}
              className="w-full py-2 px-3 rounded-lg border border-dashed border-emerald-700/60 bg-emerald-50/50 hover:bg-emerald-100/60 text-emerald-900 text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              <Navigation className={`w-3.5 h-3.5 text-emerald-700 ${isLocatingUser ? 'animate-spin' : ''}`} />
              <span>
                {isLocatingUser ? 'Requesting GPS coordinates...' : 'Use My Current Location (Request Permission)'}
              </span>
            </button>
          </div>

          {/* Status Message */}
          {statusMsg && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                statusMsg.type === 'error'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Manual Location Fields */}
          <div className="pt-2 border-t border-stone-200 space-y-3">
            <span className="text-xs font-bold text-stone-800 block">
              Location Details & Geographic Coordinates:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  City / Municipality
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Pune"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-600 text-stone-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  State / Province / Region
                </label>
                <input
                  type="text"
                  value={stateProv}
                  onChange={(e) => setStateProv(e.target.value)}
                  placeholder="e.g. Maharashtra"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-600 text-stone-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. India"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-600 text-stone-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Address / Specific Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Shivaji Nagar Signal Junction"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-600 text-stone-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Latitude
                </label>
                <input
                  type="text"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="18.5204"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white font-mono focus:outline-hidden focus:ring-1 focus:ring-emerald-600 text-stone-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Longitude
                </label>
                <input
                  type="text"
                  value={lon}
                  onChange={(e) => setLon(e.target.value)}
                  placeholder="73.8567"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white font-mono focus:outline-hidden focus:ring-1 focus:ring-emerald-600 text-stone-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-100 p-4 border-t border-stone-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-stone-600 hover:text-stone-900 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmLocation}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#123624] hover:bg-[#1B4D35] text-white shadow-md flex items-center gap-2 transition"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Use This Location</span>
          </button>
        </div>
      </div>
    </div>
  );
};
