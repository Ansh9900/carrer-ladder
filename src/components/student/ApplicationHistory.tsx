import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StudentApplication } from '../../types';
import { History, Briefcase, Clock, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';

interface ApplicationHistoryProps {
  onExploreJobs?: () => void;
}

export const ApplicationHistory: React.FC<ApplicationHistoryProps> = ({ onExploreJobs }) => {
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await api.getStudentApplications();
        setApplications(res.applications);
      } catch (e) {
        console.error('Failed to load applications:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Shortlisted':
        return 'bg-emerald-950/60 border-emerald-900/60 text-emerald-400';
      case 'Reviewing':
        return 'bg-sky-950/60 border-sky-900/60 text-sky-400';
      case 'Offered':
        return 'bg-indigo-950/60 border-indigo-900/60 text-indigo-400';
      case 'Rejected':
        return 'bg-rose-950/60 border-rose-900/60 text-rose-400';
      default:
        return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <div className="text-xs text-indigo-400 font-medium">
          <span>Candidate Pipeline Tracking</span>
          <span className="mx-2">·</span>
          <span>Verified Skill Snapshot</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-display">
          Application Tracking & History
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Monitor your submitted job and internship applications and track recruiter evaluations.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map(i => (
            <div key={i} className="h-28 bg-slate-900 rounded-xl"></div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl p-8 space-y-3">
          <History className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No active applications submitted yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Browse matching opportunities on the marketplace to submit your verified profile.
          </p>
          {onExploreJobs && (
            <button
              onClick={onExploreJobs}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              Explore Job Marketplace
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map(app => (
            <div
              key={app.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 space-y-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-indigo-400">{app.companyName}</span>
                  <h3 className="text-base font-bold text-white">{app.jobTitle}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    <span>{app.location}</span>
                    <span className="mx-2">·</span>
                    <span className="text-slate-300 font-mono">{app.stipendOrSalary}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-2xl font-bold text-white font-mono tabular-nums">
                      {app.matchScore}%
                    </span>
                    <span className="text-[10px] text-slate-400 block">Match Score</span>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(app.status)}`}>
                    {app.status}
                  </span>
                </div>
              </div>

              {/* Matched skills strip */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Skills Submitted:</span>
                  <span className="text-slate-300 font-medium">{app.matchedSkills.join(', ')}</span>
                </div>
                <div className="text-slate-500 text-[11px] font-mono">
                  Applied on {new Date(app.appliedAt).toLocaleDateString()}
                </div>
              </div>

              {app.notes && (
                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/60 text-xs text-slate-300">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono mb-0.5">Application Notes:</span>
                  {app.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
