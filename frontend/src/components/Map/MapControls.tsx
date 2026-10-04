import React from 'react';
import { Compass, Eye, ShieldAlert, Accessibility, AlertOctagon } from 'lucide-react';
import { MapLayerConfig } from '../../types';

interface MapControlsProps {
  layers: MapLayerConfig;
  onToggleLayer: (layer: keyof MapLayerConfig) => void;
  onRecenter: () => void;
  onOpenScreenReaderTable: () => void;
  highContrast: boolean;
}

export const MapControls: React.FC<MapControlsProps> = ({
  layers,
  onToggleLayer,
  onRecenter,
  onOpenScreenReaderTable,
  highContrast,
}) => {
  return (
    <div className="absolute right-4 bottom-8 flex flex-col gap-2.5 z-30 pointer-events-auto">
      {/* Screen Reader Directions Table View */}
      <button
        onClick={onOpenScreenReaderTable}
        className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition gmaps-card-shadow cursor-pointer ${
          highContrast
            ? 'bg-black border-yellow-400 text-yellow-300'
            : 'bg-white border-slate-200 text-slate-700 hover:text-blue-600 hover:bg-slate-50'
        }`}
        title="Open Accessible Directions Table (Screen Reader view)"
        aria-label="Open Accessible Directions Table"
      >
        <Eye className="w-4 h-4" />
      </button>

      {/* Recenter Current GPS Location (Google Maps Target Button) */}
      <button
        onClick={onRecenter}
        className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition gmaps-card-shadow cursor-pointer ${
          highContrast
            ? 'bg-black border-yellow-400 text-yellow-300'
            : 'bg-white border-slate-200 text-blue-600 hover:bg-slate-50'
        }`}
        title="Recenter to my location"
        aria-label="Recenter to my location"
      >
        <Compass className="w-5 h-5" />
      </button>

      {/* Layer Toggles Pill Stack (Google Maps White Card) */}
      <div
        className={`rounded-2xl border p-1 flex flex-col gap-1 gmaps-card-shadow ${
          highContrast
            ? 'bg-black border-yellow-400 text-yellow-300'
            : 'bg-white border-slate-200 text-slate-700'
        }`}
      >
        <button
          onClick={() => onToggleLayer('showHazards')}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer ${
            layers.showHazards
              ? 'bg-red-500 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-700'
          }`}
          title="Toggle Barriers & Hazards Layer"
        >
          <ShieldAlert className="w-4 h-4" />
        </button>

        <button
          onClick={() => onToggleLayer('showRamps')}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer ${
            layers.showRamps
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-700'
          }`}
          title="Toggle Verified ADA Ramps Layer"
        >
          <Accessibility className="w-4 h-4" />
        </button>

        <button
          onClick={() => onToggleLayer('showEvents')}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer ${
            layers.showEvents
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-700'
          }`}
          title="Toggle Civic Gatherings & Rallies Layer"
        >
          <AlertOctagon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
