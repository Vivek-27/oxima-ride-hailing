import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { searchIndianLocations, reverseGeocodeIndia } from '../services/locationService';

export const LocationSearchInput = ({
  label,
  value,
  onChange,
  onSelectLocation,
  placeholder,
  isPickup = false,
  dark = false
}) => {
  const [query, setQuery] = useState(value?.address || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const wrapperRef = useRef(null);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    setQuery(value?.address || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (val.trim().length >= 1) {
      setIsLoading(true);
      debounceTimerRef.current = setTimeout(async () => {
        const results = await searchIndianLocations(val);
        setSuggestions(results);
        setIsLoading(false);
        setIsOpen(results.length > 0);
      }, 250);
    } else {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
    }
  };

  const handleSelect = (item) => {
    setQuery(item.name);
    setIsOpen(false);
    onSelectLocation({
      address: item.name,
      fullAddress: item.displayName,
      coordinates: item.coordinates
    });
  };

  const handleUseCurrentGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const geoInfo = await reverseGeocodeIndia(lat, lon);
        const name = geoInfo?.name || 'Current GPS Location';
        setQuery(name);
        onSelectLocation({
          address: name,
          fullAddress: geoInfo?.displayName || name,
          coordinates: [lon, lat]
        });
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Sleek Dribbble Style Input Container */}
      <div className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/25 transition">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {label}
          </span>
          {isPickup && (
            <button
              type="button"
              onClick={handleUseCurrentGPS}
              disabled={isLocating}
              className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
            >
              {isLocating ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Navigation className="w-2.5 h-2.5" />}
              <span>Live GPS</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <MapPin className={`w-4 h-4 shrink-0 ${isPickup ? 'text-emerald-400' : 'text-rose-400'}`} />
          <input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
              if (suggestions.length > 0) setIsOpen(true);
            }}
            className="w-full bg-transparent text-sm text-white font-medium outline-none placeholder:text-slate-500"
          />
          {isLoading && <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin shrink-0" />}
        </div>
      </div>

      {/* Real-time Location Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden divide-y divide-slate-800/80 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
          {suggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full px-4 py-3 text-left hover:bg-slate-800/80 transition flex items-start gap-3 group"
            >
              <MapPin className="w-4 h-4 text-slate-400 group-hover:text-blue-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white group-hover:text-blue-400 truncate">
                  {item.name}
                </p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  {item.displayName}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
