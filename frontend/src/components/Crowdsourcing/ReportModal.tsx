import React, { useState } from 'react';
import { 
  ShieldAlert, X, Check, Accessibility, 
  Construction, Ban, Droplets, AlertTriangle 
} from 'lucide-react';
import { ReportCategory } from '../../types';

interface ReportModalProps {
  onClose: () => void;
  onSubmit: (report: {
    category: ReportCategory;
    title: string;
    description: string;
    severity: 'low' | 'moderate' | 'severe' | 'critical';
    lat: number;
    lng: number;
  }) => void;
  defaultLocation: [number, number];
  highContrast: boolean;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  onClose,
  onSubmit,
  defaultLocation,
  highContrast,
}) => {
  const [category, setCategory] = useState<ReportCategory>('broken_ramp');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'low' | 'moderate' | 'severe' | 'critical'>('severe');

  const categories: { code: ReportCategory; label: string; icon: React.ReactNode }[] = [
    { code: 'broken_ramp', label: 'Broken Ramp', icon: <Accessibility className="w-4 h-4" /> },
    { code: 'broken_elevator', label: 'Broken Lift', icon: <AlertTriangle className="w-4 h-4" /> },
    { code: 'stairs', label: 'Unmapped Stairs', icon: <Ban className="w-4 h-4" /> },
    { code: 'pothole', label: 'Pothole / Pit', icon: <AlertTriangle className="w-4 h-4" /> },
    { code: 'barricade', label: 'Barricade', icon: <Ban className="w-4 h-4" /> },
    { code: 'waterlogging', label: 'Waterlogging', icon: <Droplets className="w-4 h-4" /> },
    { code: 'construction', label: 'Construction', icon: <Construction className="w-4 h-4" /> },
    { code: 'blocked_footpath', label: 'Blocked Path', icon: <Ban className="w-4 h-4" /> },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      category,
      title: title.trim(),
      description: description.trim(),
      severity,
      lat: defaultLocation[0] + (Math.random() - 0.5) * 0.002,
      lng: defaultLocation[1] + (Math.random() - 0.5) * 0.002,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs pointer-events-auto">
      <div
        className={`w-full max-w-lg rounded-2xl border p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 gmaps-floating-shadow ${
          highContrast
            ? 'bg-black border-yellow-400 text-yellow-300'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Report Accessibility Barrier
              </h3>
              <p className="text-[11px] text-slate-500">
                Help other commuters by reporting real-world obstacles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Category Selector */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
              Obstacle Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {categories.map((c) => {
                const isSelected = category === c.code;
                return (
                  <button
                    type="button"
                    key={c.code}
                    onClick={() => setCategory(c.code)}
                    className={`p-2.5 rounded-xl border text-xs flex flex-col items-center gap-1.5 transition cursor-pointer ${
                      isSelected
                        ? 'bg-red-50 border-red-500 text-red-700 font-bold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className={isSelected ? 'text-red-600' : 'text-slate-500'}>
                      {c.icon}
                    </div>
                    <span className="truncate w-full text-center">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Hazard Title & Location
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Broken ramp curb at Janpath crossing"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Description & Details
            </label>
            <textarea
              rows={2}
              placeholder="Describe the physical barrier, depth of pothole, or detour advice..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 resize-none"
            />
          </div>

          {/* Severity */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Severity Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['low', 'moderate', 'severe', 'critical'] as const).map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSeverity(s)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold uppercase tracking-wider border transition capitalize cursor-pointer ${
                    severity === s
                      ? s === 'critical' || s === 'severe'
                        ? 'bg-red-600 text-white border-red-500'
                        : 'bg-amber-600 text-white border-amber-500'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 transition cursor-pointer mt-1"
          >
            <Check className="w-4 h-4" />
            <span>Submit Hazard Report</span>
          </button>
        </form>
      </div>
    </div>
  );
};
