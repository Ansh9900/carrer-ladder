import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Shield, RefreshCw, CheckCircle2, Users, Boxes, Briefcase, Database, UserPlus } from 'lucide-react';

interface AdminDashboardProps {
  onOpenNewStudentModal?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onOpenNewStudentModal }) => {
  const [overview, setOverview] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetSuccess, setResetSuccess] = useState(false);

  const loadOverview = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminOverview();
      setOverview(res);
    } catch (e) {
      console.error('Failed to load admin overview:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const handleResetData = async () => {
    if (confirm('Reset Career Ladder database back to clean canonical seed state?')) {
      try {
        await api.resetDemoData();
        setResetSuccess(true);
        await loadOverview();
        setTimeout(() => setResetSuccess(false), 4000);
      } catch (e) {
        console.error('Failed to reset data:', e);
      }
    }
  };

  if (loading || !overview) {
    return (
      <div className="p-8 space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-28 bg-slate-900 rounded-2xl"></div>
        <div className="h-80 bg-slate-900 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="text-xs text-indigo-400 font-medium">
            <span>System Operations Console</span>
            <span className="mx-2">·</span>
            <span>Platform Governance</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-display">
            Platform Administration
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Maintain user roles, canonical ESCO/O*NET skill taxonomies, verified listings, and demo lifecycle.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {onOpenNewStudentModal && (
            <button
              onClick={onOpenNewStudentModal}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Enter New Student</span>
            </button>
          )}

          <button
            onClick={handleResetData}
            className="px-4 py-2.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold shadow-md transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset All Demo Data</span>
          </button>
        </div>
      </div>

      {resetSuccess && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-900/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Database state restored to original canonical seed!</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400 mb-1">System Users</div>
          <div className="text-2xl font-bold text-white font-mono">{overview.usersCount}</div>
        </div>
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400 mb-1">Taxonomy Skills</div>
          <div className="text-2xl font-bold text-white font-mono">{overview.skillsCount}</div>
        </div>
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400 mb-1">Active Job Listings</div>
          <div className="text-2xl font-bold text-white font-mono">{overview.jobsCount}</div>
        </div>
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400 mb-1">Applications In Flight</div>
          <div className="text-2xl font-bold text-white font-mono">{overview.applicationsCount}</div>
        </div>
      </div>

      {/* User Directory */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="text-base font-semibold text-white">Registered Persona Directory</h3>

        <div className="divide-y divide-slate-800/80 text-xs">
          {overview.users?.map((u: any) => (
            <div key={u.id} className="py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200">{u.name}</span>
                <span className="text-slate-400 ml-2">· {u.email}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full uppercase font-mono text-[10px] font-semibold bg-slate-950 border border-slate-800 text-indigo-300">
                {u.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
