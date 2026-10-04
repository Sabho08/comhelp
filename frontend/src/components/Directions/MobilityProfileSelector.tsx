import React from 'react';
import { Footprints, Accessibility, Eye, Bike, Gauge, Baby } from 'lucide-react';
import { MobilityProfileCode } from '../../types';

interface MobilityProfileSelectorProps {
  selectedProfile: MobilityProfileCode;
  onSelectProfile: (profile: MobilityProfileCode) => void;
  highContrast: boolean;
}

interface ProfileOption {
  code: MobilityProfileCode;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  stepFreePriority: string;
}

export const MobilityProfileSelector: React.FC<MobilityProfileSelectorProps> = ({
  selectedProfile,
  onSelectProfile,
  highContrast,
}) => {
  const profiles: ProfileOption[] = [
    {
      code: 'wheelchair',
      label: 'Wheelchair',
      sublabel: 'Step-free & ramp priority',
      icon: <Accessibility className="w-4 h-4" />,
      stepFreePriority: 'Strict 0-Stairs & <5% Slope',
    },
    {
      code: 'vision',
      label: 'Vision Aid',
      sublabel: 'Tactile paving & voice alerts',
      icon: <Eye className="w-4 h-4" />,
      stepFreePriority: 'Tactile Guides & Audio Cues',
    },
    {
      code: 'pram_elderly',
      label: 'Pram / Walker',
      sublabel: 'Low gradient, no curbs',
      icon: <Baby className="w-4 h-4" />,
      stepFreePriority: 'Wide Sidewalks & Ramps',
    },
    {
      code: 'walking',
      label: 'Walking',
      sublabel: 'Standard pedestrian',
      icon: <Footprints className="w-4 h-4" />,
      stepFreePriority: 'Direct Pedestrian Pathways',
    },
    {
      code: 'bicycle',
      label: 'Bicycle',
      sublabel: 'Bike lanes & smooth surface',
      icon: <Bike className="w-4 h-4" />,
      stepFreePriority: 'Dedicated Cycle Paths',
    },
    {
      code: 'scooter',
      label: 'Scooter / 2W',
      sublabel: 'Smooth vehicular corridors',
      icon: <Gauge className="w-4 h-4" />,
      stepFreePriority: 'Low Congestion Arterials',
    },
  ];

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
        Select Mobility Profile (PS10 Personalized Constraints)
      </label>
      <div className="grid grid-cols-3 gap-2">
        {profiles.map((p) => {
          const isSelected = selectedProfile === p.code;
          return (
            <button
              key={p.code}
              onClick={() => onSelectProfile(p.code)}
              className={`p-2.5 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all duration-200 ${
                isSelected
                  ? highContrast
                    ? 'bg-yellow-400 text-black border-yellow-300 font-bold shadow-lg ring-2 ring-yellow-400'
                    : 'bg-blue-600 text-white border-blue-500 font-semibold shadow-lg shadow-blue-500/30'
                  : highContrast
                  ? 'bg-slate-900 border-yellow-800/60 text-yellow-300/80 hover:bg-slate-800'
                  : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-slate-700/50'}`}>
                {p.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs leading-tight">{p.label}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
