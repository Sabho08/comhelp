import React from 'react';
import { ThumbsUp, CheckCircle2, Clock, ShieldAlert, X } from 'lucide-react';
import { CommunityReport } from '../../types';

interface VerificationDrawerProps {
  report: CommunityReport;
  onVote: (reportId: string, voteType: 'upvote' | 'downvote' | 'resolve') => void;
  onClose: () => void;
  highContrast: boolean;
}

export const VerificationDrawer: React.FC<VerificationDrawerProps> = ({
  report,
  onVote,
  onClose,
  highContrast,
}) => {
  const getFreshnessLabel = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const mins = Math.max(1, Math.floor(diffMs / 60000));
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      return `${hours}h ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <div
      className={`rounded-2xl border p-4 flex flex-col gap-3 transition-all duration-200 gmaps-floating-shadow ${
        highContrast
          ? 'bg-black border-yellow-400 text-yellow-300'
          : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  report.confidence_level === 'HIGH'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {report.confidence_level} CONFIDENCE
              </span>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Confirmed {getFreshnessLabel(report.last_verified_at)}
              </span>
            </div>
            <h3 className="font-bold text-sm text-slate-900 mt-1">{report.title}</h3>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {report.description && (
        <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          {report.description}
        </p>
      )}

      {/* Social Verification Voting Buttons */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
        <div className="text-xs text-slate-500">
          <span className="font-bold text-slate-800 font-mono-nums">{report.upvotes}</span> community confirmations
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onVote(report.id, 'upvote')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-semibold transition cursor-pointer"
            title="Confirm obstacle is still active"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>Confirm Active</span>
          </button>

          <button
            onClick={() => onVote(report.id, 'resolve')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold transition cursor-pointer"
            title="Mark obstacle as cleared/repaired"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Cleared</span>
          </button>
        </div>
      </div>
    </div>
  );
};
