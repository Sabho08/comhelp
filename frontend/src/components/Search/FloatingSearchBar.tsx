import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Search, MapPin, Navigation, X, ShieldAlert, 
  Mic, MicOff, Loader2, Sparkles, Compass 
} from 'lucide-react';
import { Place, SearchResult } from '../../types';
import { searchLocationsApi } from '../../services/api';
import { calculateDistanceKm, formatDistance } from '../../utils/geo';

interface FloatingSearchBarProps {
  places: Place[];
  onSelectPlace: (place: Place) => void;
  onSelectSearchResult: (result: SearchResult) => void;
  selectedCity: string;
  onCityChange: (city: string) => void;
  onOpenReportModal: () => void;
  onOpenDirections: () => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  userLocation?: [number, number];
  searchBias?: [number, number];
  showSearchThisArea?: boolean;
  onSearchThisArea?: () => void;
}

export const FloatingSearchBar: React.FC<FloatingSearchBarProps> = ({
  places,
  onSelectPlace,
  onSelectSearchResult,
  selectedCity,
  onCityChange,
  onOpenReportModal,
  onOpenDirections,
  highContrast,
  onToggleHighContrast,
  userLocation,
  searchBias,
  showSearchThisArea,
  onSearchThisArea,
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [isListening, setIsListening] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<any>(null);
  const lastRequestIdRef = useRef<number>(0);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions with debouncing & cancellation
  const fetchSuggestions = useCallback(
    async (searchTerm: string) => {
      const cleanTerm = searchTerm.trim();

      // Rule: Do not request autocomplete for 0 or 1 character
      if (cleanTerm.length < 2) {
        setSuggestions([]);
        setIsLoading(false);
        setErrorMessage(null);
        setActiveIndex(-1);
        return;
      }

      // Cancel any ongoing in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;
      const currentReqId = ++lastRequestIdRef.current;

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const biasLat = searchBias ? searchBias[0] : userLocation ? userLocation[0] : undefined;
        const biasLon = searchBias ? searchBias[1] : userLocation ? userLocation[1] : undefined;

        const results = await searchLocationsApi(
          cleanTerm,
          biasLat,
          biasLon,
          8,
          controller.signal
        );

        // Ignore stale responses if a newer request was dispatched
        if (currentReqId === lastRequestIdRef.current) {
          setSuggestions(results);
          setIsLoading(false);
          setActiveIndex(-1);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        if (currentReqId === lastRequestIdRef.current) {
          console.warn('Autocomplete fetch error:', err);
          setErrorMessage('Search is temporarily unavailable.');
          setSuggestions([]);
          setIsLoading(false);
        }
      }
    },
    [searchBias, userLocation]
  );

  // Handle Input Changes with ~300ms Debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsFocused(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (value.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      setErrorMessage(null);
      return;
    }

    setIsLoading(true);
    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const totalItems = query.trim().length >= 2 ? suggestions.length : places.slice(0, 4).length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isFocused) {
        setIsFocused(true);
        return;
      }
      setActiveIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isFocused) {
        setIsFocused(true);
        return;
      }
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (query.trim().length >= 2) {
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          handleSelectSearchResult(suggestions[activeIndex]);
        } else if (suggestions.length > 0) {
          handleSelectSearchResult(suggestions[0]);
        }
      } else {
        const topPlaces = places.slice(0, 4);
        if (activeIndex >= 0 && activeIndex < topPlaces.length) {
          handleSelectPlace(topPlaces[activeIndex]);
        }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsFocused(false);
      setActiveIndex(-1);
    }
  };

  const handleSelectSearchResult = (result: SearchResult) => {
    setQuery(result.name);
    setIsFocused(false);
    setActiveIndex(-1);
    onSelectSearchResult(result);
  };

  const handleSelectPlace = (place: Place) => {
    setQuery(place.name);
    setIsFocused(false);
    setActiveIndex(-1);
    onSelectPlace(place);
  };

  // Voice Search (HTML5 Web Speech API)
  const handleToggleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsFocused(true);
        fetchSuggestions(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.warn('Speech recognition error:', e);
      setIsListening(false);
    }
  };

  const isShowingAutocomplete = isFocused && query.trim().length >= 2;
  const isShowingDefaultPlaces = isFocused && query.trim().length < 2;

  return (
    <div
      ref={containerRef}
      className="absolute top-4 left-4 right-4 md:left-6 md:w-[420px] z-30 pointer-events-auto flex flex-col gap-2"
    >
      {/* Google Maps White Matte Floating Search Pill */}
      <div
        className={`rounded-2xl transition-all duration-200 border gmaps-card-shadow ${
          highContrast
            ? 'bg-black border-yellow-400 text-yellow-300'
            : 'bg-white border-slate-200/90 text-slate-800'
        }`}
      >
        <div className="flex items-center px-4 py-2.5 gap-2.5">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
          ) : (
            <Search className="w-5 h-5 text-slate-500 shrink-0" />
          )}

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded={isFocused && (suggestions.length > 0 || isShowingDefaultPlaces || isLoading)}
              aria-controls="search-autocomplete-list"
              aria-autocomplete="list"
              aria-activedescendant={
                activeIndex >= 0 ? `search-item-${activeIndex}` : undefined
              }
              aria-label="Search destination, address or accessible landmark"
              placeholder="Search AccessRoute Live..."
              value={query}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onKeyDown={handleKeyDown}
              className={`w-full bg-transparent text-sm font-medium placeholder-slate-400 focus:outline-none ${
                highContrast ? 'text-yellow-300 placeholder-yellow-600' : 'text-slate-800'
              }`}
            />
          </div>

          {query ? (
            <button
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                setActiveIndex(-1);
                inputRef.current?.focus();
              }}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition cursor-pointer"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleToggleVoice}
              className={`p-1.5 rounded-full transition cursor-pointer ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
              title="Voice search (Accessible audio input)"
              aria-label="Voice search"
            >
              {isListening ? (
                <MicOff className="w-4 h-4 text-white" />
              ) : (
                <Mic className="w-4 h-4 text-blue-600" />
              )}
            </button>
          )}

          <div className="h-5 w-px bg-slate-200" />

          {/* Google Maps Blue Directions Button */}
          <button
            onClick={onOpenDirections}
            className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white shrink-0 shadow-sm transition cursor-pointer"
            title="Directions & Accessibility Routing"
            aria-label="Directions"
          >
            <Navigation className="w-4 h-4 transform rotate-45" />
          </button>
        </div>

        {/* Quick Filters / City Switcher Bar */}
        <div className="flex items-center justify-between px-4 pb-2.5 pt-1 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['New Delhi', 'San Francisco', 'London'].map((city) => (
              <button
                key={city}
                onClick={() => onCityChange(city)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition cursor-pointer ${
                  selectedCity === city
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-2">
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition cursor-pointer"
              title="Report road obstacle or broken elevator"
            >
              <ShieldAlert className="w-3 h-3" />
              <span>Report</span>
            </button>

            <button
              onClick={onToggleHighContrast}
              className={`text-[11px] font-bold px-2 py-1 rounded-full transition cursor-pointer ${
                highContrast
                  ? 'bg-yellow-400 text-black'
                  : 'bg-slate-100 text-slate-700 hover:bg-amber-100 hover:text-amber-800'
              }`}
              title="WCAG AAA High Contrast Theme"
            >
              {highContrast ? '⚡ AAA' : '♿ AAA'}
            </button>
          </div>
        </div>
      </div>

      {/* Floating 'Search this area' Pill after map panning */}
      {showSearchThisArea && onSearchThisArea && (
        <div className="flex justify-center -mt-0.5">
          <button
            onClick={onSearchThisArea}
            className="flex items-center gap-1.5 bg-white/95 hover:bg-white text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md border border-blue-200 hover:shadow-lg transition cursor-pointer animate-fadeIn"
          >
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            <span>Search this area</span>
          </button>
        </div>
      )}

      {/* Autocomplete Results Dropdown (Clean White Card) */}
      {isShowingAutocomplete && (
        <div
          id="search-autocomplete-list"
          role="listbox"
          aria-label="Location suggestions"
          className={`rounded-2xl border p-2 flex flex-col gap-1 max-h-[360px] overflow-y-auto gmaps-floating-shadow ${
            highContrast
              ? 'bg-black border-yellow-400 text-yellow-300'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
            <span>Location Results</span>
            <button
              onClick={() => setIsFocused(false)}
              className="text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
            >
              Close
            </button>
          </div>

          {isLoading && suggestions.length === 0 && (
            <div className="p-4 flex items-center justify-center gap-2 text-xs text-slate-500">
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              <span>Finding accessible locations...</span>
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="p-3 text-center text-xs text-red-500 font-medium">
              {errorMessage}
            </div>
          )}

          {!isLoading && !errorMessage && suggestions.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-500">
              No locations found for "{query}".
            </div>
          )}

          {suggestions.map((result, index) => {
            const isSelected = index === activeIndex;
            let distanceStr = '';
            if (userLocation) {
              const dKm = calculateDistanceKm(
                userLocation[0],
                userLocation[1],
                result.latitude,
                result.longitude
              );
              distanceStr = formatDistance(dKm);
            }

            return (
              <button
                key={result.id || `${result.latitude}-${result.longitude}-${index}`}
                id={`search-item-${index}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelectSearchResult(result)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`w-full text-left p-2.5 rounded-xl flex items-start gap-3 transition cursor-pointer ${
                  isSelected
                    ? highContrast
                      ? 'bg-yellow-900/50 border border-yellow-400 ring-2 ring-yellow-400'
                      : 'bg-blue-50/90 border border-blue-200'
                    : highContrast
                    ? 'hover:bg-yellow-950/40'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 mt-0.5 border border-blue-100">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-xs text-slate-900 truncate">
                      {result.name}
                    </span>
                    {distanceStr && (
                      <span className="text-[10px] font-medium text-slate-400 shrink-0 whitespace-nowrap">
                        {distanceStr}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {result.address}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Default Verified Places Fallback when input is focused with 0-1 chars */}
      {isShowingDefaultPlaces && (
        <div
          id="search-autocomplete-list"
          role="listbox"
          aria-label="Verified accessible places"
          className={`rounded-2xl border p-2 flex flex-col gap-1 max-h-[340px] overflow-y-auto gmaps-floating-shadow ${
            highContrast
              ? 'bg-black border-yellow-400 text-yellow-300'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Verified Accessible Places</span>
            </span>
            <button
              onClick={() => setIsFocused(false)}
              className="text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
            >
              Close
            </button>
          </div>

          {places.slice(0, 4).map((p, index) => {
            const isSelected = index === activeIndex;
            let distanceStr = '';
            if (userLocation) {
              const dKm = calculateDistanceKm(
                userLocation[0],
                userLocation[1],
                p.latitude,
                p.longitude
              );
              distanceStr = formatDistance(dKm);
            }

            return (
              <button
                key={p.id}
                id={`search-item-${index}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelectPlace(p)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`w-full text-left p-2.5 rounded-xl flex items-start gap-3 transition cursor-pointer ${
                  isSelected
                    ? highContrast
                      ? 'bg-yellow-900/50 border border-yellow-400'
                      : 'bg-blue-50/90 border border-blue-200'
                    : highContrast
                    ? 'hover:bg-yellow-950/40'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 mt-0.5 border border-blue-100">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-900 truncate">
                      <span>{p.name}</span>
                      {p.accessibility.has_ramp && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded-md font-medium">
                          ✓ Ramp
                        </span>
                      )}
                    </div>
                    {distanceStr && (
                      <span className="text-[10px] font-medium text-slate-400 shrink-0">
                        {distanceStr}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{p.address}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
