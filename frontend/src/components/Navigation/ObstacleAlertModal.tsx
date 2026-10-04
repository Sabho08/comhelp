import React from 'react';
import { ShieldAlert, AlertTriangle, Check } from 'lucide-react';

interface ObstacleAlertModalProps {
  obstacleTitle: string;
  detourTimeEstimate: string;
  onAcceptDetour: () => void;
  onDismiss: () => void;
  highContrast: boolean;
}

export const ObstacleAlertModal: React.FC<ObstacleAlertModalProps> = ({
  obstacleTitle,
  detourTimeEstimate,
  onAcceptDetour,
  onDismiss,
  highContrast,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs pointer-events-auto">
      <div
        className={`w-full max-w-md rounded-2xl border p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 gmaps-floating-shadow ${
          highContrast
            ? 'bg-black border-yellow-400 text-yellow-300'
            : 'bg-white border-red-200 text-slate-900'
        }`}
      >
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-600">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Real-Time Accessibility Alert</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Obstacle Detected 250m Ahead
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              {obstacleTitle || 'Broken wheelchair ramp & sidewalk construction detected on your active corridor.'}
            </p>
          </div>
        </div>

        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
          <span className="text-emerald-900 font-medium">Verified Step-Free Detour:</span>
          <span className="font-bold text-emerald-700 font-mono-nums">
            {detourTimeEstimate || '+3 min (0 stairs)'}
          </span>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={onDismiss}
            className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
          >
            Ignore & Continue
          </button>
          <button
            onClick={onAcceptDetour}
            className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Take Detour</span>
          </button>
        </div>
      </div>
    </div>
  );
};
