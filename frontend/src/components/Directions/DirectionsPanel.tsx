import React, { useState } from 'react';
import { 
  Navigation, ArrowUpDown, X, Footprints, Accessibility, 
  Eye, Bike, Gauge, Baby, Sliders, ShieldCheck, Check, Sparkles
} from 'lucide-react';
import { Place, MobilityProfileCode } from '../../types';

interface DirectionsPanelProps {
  originName: string;
  destination: Place | null;
  selectedProfile: MobilityProfileCode;
  onSelectProfile: (profile: MobilityProfileCode) => void;
  onCalculateRoutes: (originName: string, dest: Place, profile: MobilityProfileCode, options: { avoidStairs: boolean; maxSlope: number }) => void;
  onClose: () => void;
  isCalculating: boolean;
  highContrast: boolean;
}

export const DirectionsPanel: React.FC<DirectionsPanelProps> = ({
  originName,
  destination,
  selectedProfile,
  onSelectProfile,
  onCalculateRoutes,
  onClose,
  isCalculating,
  highContrast,
}) => {
  const [avoidStairs, setAvoidStairs] = useState(true);
  const [maxSlope, setMaxSlope] = useState(5.0);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const profileTabs: { code: MobilityProfileCode; label: string; icon: React.ReactNode }[] = [
    { code: 'wheelchair', label: 'Wheelchair', icon: <Accessibility className="w-4 h-4" /> },
    { code: 'vision', label: 'Vision Aid', icon: <Eye className="w-4 h-4" /> },
    { code: 'pram_elderly', label: 'Stroller/Walker', icon: <Baby className="w-4 h-4" /> },
    { code: 'walking', label: 'Walking', icon: <Footprints className="w-4 h-4" /> },
    { code: 'bicycle', label: 'Cycling', icon: <Bike className="w-4 h-4" /> },
    { code: 'scooter', label: 'Scooter', icon: <Gauge className="w-4 h-4" /> },
  ];

  const handleStartCalculation = () => {
    if (destination) {
      onCalculateRoutes(originName, destination, selectedProfile, { avoidStairs, maxSlope });
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden gmaps-floating-shadow ${
        highContrast
          ? 'bg-black border-yellow-400 text-yellow-300'
          : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      {/* Top 6-Modes Switcher Bar (Google Maps Style Icon Strip) */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2 border-b border-slate-100 bg-slate-50/60 overflow-x-auto">
        <div className="flex items-center gap-1">
          {profileTabs.map((tab) => {
            const isSelected = selectedProfile === tab.code;
            return (
              <button
                key={tab.code}
                onClick={() => onSelectProfile(tab.code)}
                className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  isSelected
                    ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
                title={tab.label}
              >
                <div className={`p-1 rounded-lg ${isSelected ? 'text-blue-600' : 'text-slate-500'}`}>
                  {tab.icon}
                </div>
                <span className="text-[10px] tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition ml-2"
          aria-label="Close directions"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Origin & Destination Inputs (Google Maps Route Inputs) */}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          {/* Origin / Dest Icons */}
          <div className="flex flex-col items-center gap-1.5 py-1">
            <div className="w-3 h-3 rounded-full border-2 border-blue-600 bg-white" />
            <div className="w-0.5 h-6 bg-slate-300 border-dashed" />
            <div className="w-3.5 h-3.5 rounded-full bg-red-500 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
          </div>

          {/* Input Fields */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="bg-slate-100/90 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 flex items-center justify-between border border-slate-200/80">
              <span className="truncate">{originName || 'Your Location'}</span>
              <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded">GPS</span>
            </div>

            <div className="bg-slate-100/90 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 flex items-center justify-between border border-slate-200/80">
              <span className="truncate">{destination?.name || 'Choose destination...'}</span>
              {destination?.accessibility.has_ramp && (
                <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Check className="w-3 h-3" /> Ramp
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => {}}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title="Reverse origin and destination"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        {/* Mobility Profile Specific Summary & Filters */}
        <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 flex flex-col gap-2 text-xs text-blue-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-blue-800">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>
                {selectedProfile === 'wheelchair'
                  ? 'Wheelchair Step-Free Engine'
                  : selectedProfile === 'vision'
                  ? 'Vision Aid Tactile Engine'
                  : selectedProfile === 'pram_elderly'
                  ? 'Stroller & Walker Low-Gradient Engine'
                  : `${selectedProfile.toUpperCase()} Route Engine`}
              </span>
            </div>

            <button
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="text-[11px] font-semibold text-blue-700 hover:underline flex items-center gap-1"
            >
              <Sliders className="w-3 h-3" />
              <span>{showAdvancedOptions ? 'Hide Options' : 'Route Options'}</span>
            </button>
          </div>

          {showAdvancedOptions && (
            <div className="pt-2 border-t border-blue-200/60 flex flex-col gap-2.5">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-700 font-medium">Strict Step-Free (0 Stairs)</span>
                <input
                  type="checkbox"
                  checked={avoidStairs}
                  onChange={(e) => setAvoidStairs(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-slate-700">
                  <span>Max Incline Threshold:</span>
                  <span className="font-bold font-mono-nums text-blue-700">{maxSlope}%</span>
                </div>
                <input
                  type="range"
                  min="2.0"
                  max="12.0"
                  step="0.5"
                  value={maxSlope}
                  onChange={(e) => setMaxSlope(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">
                  ADA standard recommends &le; 5.0% for manual & electric wheelchairs.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Calculate Routes Primary CTA */}
        <button
          onClick={handleStartCalculation}
          disabled={isCalculating || !destination}
          className="w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition disabled:opacity-50 cursor-pointer"
        >
          <Navigation className="w-4 h-4 transform rotate-45" />
          <span>{isCalculating ? 'Computing Accessible Alternatives...' : 'Find Step-Free Routes'}</span>
        </button>
      </div>
    </div>
  );
};
