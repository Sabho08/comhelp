import React from 'react';
import { 
  Navigation, ShieldCheck, CheckCircle2, AlertTriangle, 
  Sparkles, X, Check
} from 'lucide-react';
import { RouteResult, MobilityProfileCode } from '../../types';

interface RouteResultsSheetProps {
  routes: RouteResult[];
  selectedRouteId: string | null;
  onSelectRoute: (id: string) => void;
  onStartNavigation: () => void;
  onClose: () => void;
  profile: MobilityProfileCode;
  destinationName: string;
  highContrast: boolean;
}

export const RouteResultsSheet: React.FC<RouteResultsSheetProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
  onStartNavigation,
  onClose,
  profile,
  destinationName,
  highContrast,
}) => {
  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  if (!activeRoute) return null;

  return (
    <div
      className={`rounded-2xl border p-4 flex flex-col gap-3.5 transition-all duration-200 max-h-[82vh] overflow-y-auto gmaps-floating-shadow ${
        highContrast
          ? 'bg-black border-yellow-400 text-yellow-300'
          : 'bg-white border-slate-200/90 text-slate-900'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Route Alternatives ({routes.length} options)
          </span>
          <h3 className="font-bold text-sm text-slate-900 truncate mt-0.5">
            To: {destinationName}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          aria-label="Close route options"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Multi-Route Selection Cards (Google Maps Clean Style) */}
      <div className="flex flex-col gap-2">
        {routes.map((rt) => {
          const isSelected = rt.id === (selectedRouteId || routes[0].id);
          return (
            <button
              key={rt.id}
              onClick={() => onSelectRoute(rt.id)}
              className={`text-left p-3.5 rounded-xl border transition-all duration-150 flex flex-col gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-blue-50/70 border-blue-500 text-slate-900 shadow-sm ring-1 ring-blue-500'
                  : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: rt.color || '#1A73E8' }}
                  />
                  <span className="font-bold text-xs text-slate-900">{rt.title}</span>
                </div>
                {rt.is_recommended && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" /> Recommended
                  </span>
                )}
              </div>

              {/* Big Bold ETA & Distance (Google Maps signature design) */}
              <div className="flex items-baseline justify-between pt-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-extrabold text-xl font-mono-nums text-emerald-700">
                    {rt.duration_minutes} min
                  </span>
                  <span className="text-xs text-slate-500 font-mono-nums font-semibold">
                    ({rt.distance_km} km)
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {rt.is_step_free ? (
                    <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 100% Step-Free
                    </span>
                  ) : (
                    <span className="text-[11px] text-red-700 font-semibold bg-red-50 border border-red-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Stairs Present
                    </span>
                  )}
                </div>
              </div>

              {rt.tradeoff_warning && (
                <p className="text-[11px] text-amber-800 font-medium bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 mt-1">
                  {rt.tradeoff_warning}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Route Accessibility Deep-Dive HUD */}
      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Accessibility Telemetry Breakdown</span>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              activeRoute.accessibility_breakdown.confidence_level === 'HIGH'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}
          >
            {activeRoute.accessibility_breakdown.confidence_level} CONFIDENCE
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between">
            <span className="text-slate-600">Verified Ramps:</span>
            <span className="font-bold text-emerald-700 font-mono-nums">
              {activeRoute.accessibility_breakdown.ramps_count}
            </span>
          </div>

          <div className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between">
            <span className="text-slate-600">Stairs / Steps:</span>
            <span
              className={`font-bold font-mono-nums ${
                activeRoute.accessibility_breakdown.stairs_count === 0
                  ? 'text-emerald-700'
                  : 'text-red-600'
              }`}
            >
              {activeRoute.accessibility_breakdown.stairs_count}
            </span>
          </div>

          <div className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between">
            <span className="text-slate-600">Max Incline:</span>
            <span className="font-bold text-slate-800 font-mono-nums">
              {activeRoute.accessibility_breakdown.max_slope_percent}%
            </span>
          </div>

          <div className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between">
            <span className="text-slate-600">Tactile Paved:</span>
            <span className="font-bold text-blue-700 font-mono-nums">
              {activeRoute.accessibility_breakdown.tactile_paved_pct}%
            </span>
          </div>
        </div>

        {/* Confidence Reasons */}
        <div className="flex flex-col gap-1 text-[11px] text-slate-700 pt-1 border-t border-slate-200">
          {activeRoute.accessibility_breakdown.confidence_reasons.map((r, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{r}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Start Trip CTA (Google Maps Primary Green/Blue Action) */}
      <button
        onClick={onStartNavigation}
        className="w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition cursor-pointer"
      >
        <Navigation className="w-4 h-4 transform rotate-45" />
        <span>START NAVIGATION</span>
      </button>
    </div>
  );
};
