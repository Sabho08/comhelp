import React, { useEffect, useState } from 'react';
import { 
  Volume2, VolumeX, ArrowUp, ArrowLeft, ArrowRight, 
  CheckCircle2, X, ShieldAlert, Sparkles
} from 'lucide-react';
import { RouteResult } from '../../types';
import { speechService } from '../../services/speech';

interface NavigationHUDProps {
  route: RouteResult;
  currentStepIndex: number;
  remainingDistance: number;
  remainingSeconds: number;
  onExitNavigation: () => void;
  onTriggerObstacleAlert: () => void;
  highContrast: boolean;
}

export const NavigationHUD: React.FC<NavigationHUDProps> = ({
  route,
  currentStepIndex,
  remainingDistance,
  remainingSeconds,
  onExitNavigation,
  onTriggerObstacleAlert,
  highContrast,
}) => {
  const [isMuted, setIsMuted] = useState(speechService.getMuted());
  const currentStep = route.steps[currentStepIndex] || route.steps[0];

  // Announce step instruction on step change
  useEffect(() => {
    if (currentStep) {
      const prompt = `${currentStep.instruction}. ${currentStep.accessibility_note || ''}`;
      speechService.speak(prompt);
    }
  }, [currentStepIndex]);

  const handleToggleMute = () => {
    const muted = speechService.toggleMute();
    setIsMuted(muted);
  };

  const getManeuverIcon = (maneuver: string) => {
    switch (maneuver) {
      case 'turn-left':
        return <ArrowLeft className="w-9 h-9 text-white" />;
      case 'turn-right':
        return <ArrowRight className="w-9 h-9 text-white" />;
      case 'arrive':
        return <CheckCircle2 className="w-9 h-9 text-white" />;
      default:
        return <ArrowUp className="w-9 h-9 text-white" />;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-40 flex flex-col justify-between p-4">
      {/* Top Maneuver Banner (Google Maps Emerald Green Navigation Header) */}
      <div
        className={`pointer-events-auto rounded-2xl shadow-xl p-4 border flex items-center justify-between gap-4 transition-all max-w-xl mx-auto w-full ${
          highContrast
            ? 'bg-black border-yellow-400 text-yellow-300'
            : 'bg-emerald-700 border-emerald-600 text-white'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-black/20 flex items-center justify-center shrink-0 border border-white/20">
            {getManeuverIcon(currentStep.maneuver)}
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono-nums">
                {currentStep.distance_meters} m
              </span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-semibold">
                {currentStep.street_name}
              </span>
            </div>
            <h2 className="text-sm font-bold mt-0.5 leading-snug">
              {currentStep.instruction}
            </h2>
            {currentStep.accessibility_note && (
              <p className="text-xs text-emerald-100 font-medium mt-1 flex items-center gap-1">
                {currentStep.accessibility_note}
              </p>
            )}
          </div>
        </div>

        {/* Audio Mute & Close Controls */}
        <div className="flex flex-col gap-2 shrink-0">
          <button
            onClick={handleToggleMute}
            className="p-2.5 rounded-xl bg-black/20 hover:bg-black/30 border border-white/20 transition cursor-pointer"
            title={isMuted ? 'Unmute voice guidance' : 'Mute voice guidance'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button
            onClick={onExitNavigation}
            className="p-2.5 rounded-xl bg-red-600/90 hover:bg-red-600 border border-white/20 transition cursor-pointer"
            title="End navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Middle Interactive Button: Trigger Realtime Detour Demo */}
      <div className="pointer-events-auto flex justify-center">
        <button
          onClick={onTriggerObstacleAlert}
          className="bg-white/95 hover:bg-white text-slate-800 text-xs font-bold px-4 py-2.5 rounded-full shadow-lg border border-slate-200 flex items-center gap-2 transition cursor-pointer hover:scale-105"
          title="Simulate real-time hazard detection on active path"
        >
          <ShieldAlert className="w-4 h-4 text-red-500" />
          <span>Simulate Dynamic Barrier Reroute</span>
        </button>
      </div>

      {/* Bottom Telemetry HUD (Google Maps White Matte Control Panel) */}
      <div
        className={`pointer-events-auto rounded-2xl p-4 border flex items-center justify-between max-w-xl mx-auto w-full transition-all gmaps-floating-shadow ${
          highContrast
            ? 'bg-black border-yellow-400 text-yellow-300'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              ETA Remaining
            </span>
            <div className="text-2xl font-black font-mono-nums text-emerald-700">
              {Math.max(1, Math.ceil(remainingSeconds / 60))} min
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Distance
            </span>
            <div className="text-lg font-bold font-mono-nums text-slate-800">
              {(remainingDistance / 1000).toFixed(2)} km
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-right">
          <div>
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 justify-end">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Step-Free
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">Verified ADA Path</p>
          </div>
        </div>
      </div>
    </div>
  );
};
