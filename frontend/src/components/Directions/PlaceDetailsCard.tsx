import React from 'react';
import { MapPin, Navigation, ShieldCheck, CheckCircle2, AlertTriangle, X, Check } from 'lucide-react';
import { Place } from '../../types';

interface PlaceDetailsCardProps {
  place: Place;
  onGetDirections: () => void;
  onClose: () => void;
  highContrast: boolean;
}

export const PlaceDetailsCard: React.FC<PlaceDetailsCardProps> = ({
  place,
  onGetDirections,
  onClose,
  highContrast,
}) => {
  const { accessibility } = place;

  return (
    <div
      className={`rounded-2xl border p-4 flex flex-col gap-3 transition-all duration-200 gmaps-floating-shadow ${
        highContrast
          ? 'bg-black border-yellow-400 text-yellow-300'
          : 'bg-white border-slate-200/90 text-slate-900'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 leading-snug">{place.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{place.address}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          aria-label="Close place details"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Verified Accessibility Badges Grid / Unavailable Notice */}
      {accessibility && !accessibility.details?.toLowerCase().includes('unavailable') ? (
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verified Accessibility Attributes</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-700">
              {accessibility.has_ramp ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              )}
              <span>{accessibility.has_ramp ? 'ADA Ramp Entrance' : 'No Ramp Data'}</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-700">
              {accessibility.elevator_status === 'operational' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
              )}
              <span>
                {accessibility.elevator_status === 'operational'
                  ? 'Elevator Operational'
                  : 'Elevator Offline'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-700">
              {accessibility.has_accessible_entrance ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              )}
              <span>Level Ground Access</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-700">
              {accessibility.has_tactile_paving ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <span className="text-slate-400">○ Tactile Paving N/A</span>
              )}
              <span>Tactile Guiding Path</span>
            </div>
          </div>

          {accessibility.details && (
            <p className="text-[11px] text-slate-600 italic pt-1.5 border-t border-slate-200">
              "{accessibility.details}"
            </p>
          )}
        </div>
      ) : (
        <div className="bg-amber-50/70 rounded-xl p-3 border border-amber-200 flex flex-col gap-1.5 text-xs text-amber-900">
          <div className="flex items-center gap-1.5 font-bold text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Accessibility information unavailable</span>
          </div>
          <p className="text-[11px] text-amber-700 leading-relaxed">
            No verified municipal or community accessibility audit is on record for this specific address yet. Routes will prioritize standard paved sidewalks and safe pedestrian crossings.
          </p>
        </div>
      )}

      {/* Primary Action CTA (Google Maps Blue Button) */}
      <button
        onClick={onGetDirections}
        className="w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition cursor-pointer"
      >
        <Navigation className="w-4 h-4 transform rotate-45" />
        <span>Directions</span>
      </button>
    </div>
  );
};
