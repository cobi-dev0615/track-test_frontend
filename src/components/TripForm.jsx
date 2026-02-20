import { useState, useRef, useEffect, useCallback } from 'react';
import { autocompleteLocation } from '../api/tripApi';

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

function LocationInput({ label, icon, value, onChange, onSelect, placeholder }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const wrapperRef = useRef(null);

  const fetchSuggestions = useCallback(
    debounce(async (query) => {
      if (query.length < 3) {
        setSuggestions([]);
        return;
      }
      try {
        const results = await autocompleteLocation(query);
        setSuggestions(results);
        setShowDropdown(results.length > 0);
      } catch {
        setSuggestions([]);
      }
    }, 400),
    []
  );

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    onChange(val);
    setSelectedCoords(null);
    if (onSelect) onSelect(null);
    fetchSuggestions(val);
  };

  const handleSelect = (suggestion) => {
    const shortName = suggestion.name.split(',').slice(0, 3).join(',');
    onChange(shortName);
    setSelectedCoords({ lat: suggestion.lat, lng: suggestion.lng, name: suggestion.name });
    if (onSelect) onSelect({ lat: suggestion.lat, lng: suggestion.lng, name: suggestion.name });
    setShowDropdown(false);
    setSuggestions([]);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          {icon}
        </div>
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
        />
        {selectedCoords && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
      {showDropdown && suggestions.length > 0 && (
        <div className="autocomplete-dropdown">
          {suggestions.map((s, i) => (
            <div key={i} className="autocomplete-item" onClick={() => handleSelect(s)}>
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-slate-700 leading-tight">{s.name}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TripForm({ onSubmit, loading }) {
  const [currentLocation, setCurrentLocation] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [cycleUsed, setCycleUsed] = useState('');
  const [coords, setCoords] = useState({ current: null, pickup: null, dropoff: null });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentLocation || !pickupLocation || !dropoffLocation) return;

    const data = {
      current_location: currentLocation,
      pickup_location: pickupLocation,
      dropoff_location: dropoffLocation,
      current_cycle_used: parseFloat(cycleUsed) || 0,
    };

    if (coords.current) data.current_location_coords = coords.current;
    if (coords.pickup) data.pickup_location_coords = coords.pickup;
    if (coords.dropoff) data.dropoff_location_coords = coords.dropoff;

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h2 className="text-lg font-semibold text-slate-900">Trip Details</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <LocationInput
          label="Current Location"
          placeholder="e.g., Chicago, IL"
          value={currentLocation}
          onChange={setCurrentLocation}
          onSelect={(c) => setCoords(prev => ({ ...prev, current: c }))}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <circle cx="12" cy="11" r="3" strokeWidth={2} />
            </svg>
          }
        />

        <LocationInput
          label="Pickup Location"
          placeholder="e.g., Indianapolis, IN"
          value={pickupLocation}
          onChange={setPickupLocation}
          onSelect={(c) => setCoords(prev => ({ ...prev, pickup: c }))}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />

        <LocationInput
          label="Dropoff Location"
          placeholder="e.g., Nashville, TN"
          value={dropoffLocation}
          onChange={setDropoffLocation}
          onSelect={(c) => setCoords(prev => ({ ...prev, dropoff: c }))}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          }
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Current Cycle Used (Hours)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <input
              type="number"
              min="0"
              max="70"
              step="0.5"
              value={cycleUsed}
              onChange={(e) => setCycleUsed(e.target.value)}
              placeholder="0 - 70 hrs"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
            />
          </div>
          <p className="mt-1 text-xs text-slate-400">70-hour / 8-day cycle limit</p>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={loading || !currentLocation || !pickupLocation || !dropoffLocation}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium text-sm rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Planning...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Plan Trip
            </>
          )}
        </button>
      </div>
    </form>
  );
}
