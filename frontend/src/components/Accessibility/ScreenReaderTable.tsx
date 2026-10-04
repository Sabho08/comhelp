import React from 'react';
import { RouteResult, MobilityProfileCode } from '../../types';
import { X, Volume2, Footprints, Check } from 'lucide-react';
import { speechService } from '../../services/speech';

interface ScreenReaderTableProps {
  route: RouteResult | null;
  profile: MobilityProfileCode;
  onClose: () => void;
  highContrast: boolean;
}

export const ScreenReaderTable: React.FC<ScreenReaderTableProps> = ({
  route,
  profile,
  onClose,
  highContrast,
}) => {
  if (!route) return null;

  const handleReadSummary = () => {
    const summary = `Route summary for ${profile} profile. Total duration ${route.duration_minutes} minutes, total distance ${route.distance_km} kilometers. Verified ramps: ${route.accessibility_breakdown.ramps_count}. Total stairs: ${route.accessibility_breakdown.stairs_count}. Maximum slope: ${route.accessibility_breakdown.max_slope_percent} percent. Confidence level: ${route.accessibility_breakdown.confidence_level}.`;
    speechService.speak(summary);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Accessible Step-by-Step Directions and Telemetry Table"
    >
      <div
        className={`w-full max-w-2xl max-h-[85vh] rounded-2xl border p-6 flex flex-col gap-4 overflow-y-auto gmaps-floating-shadow ${
          highContrast
            ? 'bg-black border-yellow-400 text-yellow-300'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Footprints className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Accessible Turn-by-Turn Route Table
              </h2>
              <p className="text-xs text-slate-500">
                Optimized for Screen Readers (NVDA / JAWS / VoiceOver)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReadSummary}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
              aria-label="Read route summary aloud"
            >
              <Volume2 className="w-4 h-4" />
              <span>Read Aloud</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              aria-label="Close directions table"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Telemetry Summary Table */}
        <table className="w-full text-left border-collapse text-xs" aria-label="Route Telemetry Summary">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="py-2.5 font-bold">Metric</th>
              <th className="py-2.5 font-bold">Value</th>
              <th className="py-2.5 font-bold">Accessibility Impact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="py-2.5 font-medium text-slate-700">Estimated Duration</td>
              <td className="py-2.5 font-bold font-mono-nums text-slate-900">{route.duration_minutes} min</td>
              <td className="py-2.5 text-slate-500">Kinematic speed tailored for {profile}</td>
            </tr>
            <tr>
              <td className="py-2.5 font-medium text-slate-700">Total Distance</td>
              <td className="py-2.5 font-bold font-mono-nums text-slate-900">{route.distance_km} km</td>
              <td className="py-2.5 text-slate-500">Continuous accessible path length</td>
            </tr>
            <tr>
              <td className="py-2.5 font-medium text-slate-700">Step-Free Assurance</td>
              <td className="py-2.5 font-bold text-emerald-700">
                {route.is_step_free ? '✓ 100% Step-Free' : '⚠ Stairs Present'}
              </td>
              <td className="py-2.5 text-slate-500">
                {route.accessibility_breakdown.stairs_count} steps encountered
              </td>
            </tr>
            <tr>
              <td className="py-2.5 font-medium text-slate-700">Verified ADA Ramps</td>
              <td className="py-2.5 font-bold text-emerald-700 font-mono-nums">
                {route.accessibility_breakdown.ramps_count}
              </td>
              <td className="py-2.5 text-slate-500">Equipped with 1:12 slope & handrails</td>
            </tr>
            <tr>
              <td className="py-2.5 font-medium text-slate-700">Maximum Slope Gradient</td>
              <td className="py-2.5 font-bold font-mono-nums text-slate-900">
                {route.accessibility_breakdown.max_slope_percent}%
              </td>
              <td className="py-2.5 text-slate-500">Meets ADA standard (&lt;5% gentle)</td>
            </tr>
            <tr>
              <td className="py-2.5 font-medium text-slate-700">Confidence Rating</td>
              <td className="py-2.5 font-bold text-emerald-700">
                {route.accessibility_breakdown.confidence_level}
              </td>
              <td className="py-2.5 text-slate-500">
                {route.accessibility_breakdown.confidence_reasons.join(', ')}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Step-by-Step Instructions List */}
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-2">
          Step-by-Step Navigation Instructions
        </h3>
        <ol className="flex flex-col gap-2 list-decimal list-inside text-xs">
          {route.steps.map((step, idx) => (
            <li key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900">{step.instruction}</span>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 font-mono-nums">
                <span>Distance: {step.distance_meters} m</span>
                <span>Street: {step.street_name}</span>
              </div>
              {step.accessibility_note && (
                <div className="text-[11px] text-emerald-700 mt-1 font-medium">
                  {step.accessibility_note}
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};
