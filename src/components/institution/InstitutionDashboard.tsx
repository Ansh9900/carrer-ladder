import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { InstitutionAnalytics } from '../../types';
import {
  GraduationCap,
  Users,
  Target,
  AlertTriangle,
  Lightbulb,
  Building2,
  TrendingUp,
  Boxes,
  ArrowUpRight,
  UserPlus
} from 'lucide-react';

interface InstitutionDashboardProps {
  onOpenNewStudentModal?: (institutionName?: string) => void;
}

export const InstitutionDashboard: React.FC<InstitutionDashboardProps> = ({ onOpenNewStudentModal }) => {
  const [analytics, setAnalytics] = useState<InstitutionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await api.getInstitutionAnalytics();
        setAnalytics(data);
      } catch (e) {
        console.error('Failed to load institution analytics:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !analytics) {
    return (
      <div className="p-8 space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-32 bg-slate-900 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-slate-900 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="text-xs text-indigo-400 font-medium">
            <span>Higher Education Intelligence</span>
            <span className="mx-2">·</span>
            <span>Aggregated Cohort Diagnostics</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-display">
            Academic Dean & Placement Analytics
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            {analytics.institutionName} · Cohort skill telemetry and curriculum alignment index.
          </p>
        </div>

        {onOpenNewStudentModal && (
          <button
            onClick={() => onOpenNewStudentModal(analytics.institutionName)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors flex items-center gap-2 whitespace-nowrap self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Enroll New Student</span>
          </button>
        )}
      </div>

      {/* Top 3 High-Level Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Enrolled Students Evaluated</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-3xl font-bold text-white font-mono tabular-nums">
            {analytics.totalStudents}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Across 3 Engineering Departments</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Campus Career Readiness Index</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-3xl font-bold text-emerald-400 font-mono tabular-nums">
            {analytics.avgReadinessScore}%
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Weighted against active industry hiring specs</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>High-Priority Curriculum Gaps</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-3xl font-bold text-amber-400 font-mono tabular-nums">
            {analytics.curriculumGaps.length}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Actionable recommendations generated</p>
        </div>
      </div>

      {/* Department Breakdown & Common Deficits Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Readiness Coverage */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-semibold text-white">Departmental Readiness Distribution</h3>
            <span className="text-xs font-mono text-slate-400">Class of 2026</span>
          </div>

          <div className="space-y-4">
            {analytics.departmentDistribution.map(dept => (
              <div key={dept.department} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{dept.department}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{dept.count} Students</span>
                    <span className="font-mono font-bold text-indigo-400">{dept.avgReadiness}% Avg</span>
                  </div>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-indigo-500 h-full rounded-full"
                    style={{ width: `${dept.avgReadiness}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Frequent Missing Skills */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-semibold text-white">Top Skill Deficits Across Student Cohort</h3>
            <span className="text-xs font-mono text-rose-400">Recruitment Blockers</span>
          </div>

          <div className="space-y-3">
            {analytics.topMissingSkills.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-200">{item.skill}</span>
                  <div className="text-[11px] text-slate-500">
                    Deficit in students targeting: {item.targetRole}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-rose-400 font-mono font-bold block">
                    {item.deficitCount} students missing
                  </span>
                  <span className="text-[10px] text-slate-500">Immediate gap</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actionable Curriculum Upgrade Insights */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-semibold text-white">
            Curriculum Improvement & Academic Alignment Roadmap
          </h3>
        </div>

        <p className="text-xs text-slate-400">
          Based on aggregate student skill telemetry compared against corporate job postings in Bengaluru and Hyderabad, these high-impact curriculum additions will close campus placement gaps.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          {analytics.curriculumGaps.map((gap, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Area 0{idx + 1}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                    gap.industryDemandImpact === 'Critical'
                      ? 'bg-rose-950/60 border-rose-900/60 text-rose-400'
                      : 'bg-amber-950/60 border-amber-900/60 text-amber-400'
                  }`}>
                    {gap.industryDemandImpact} Impact
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white">{gap.area}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {gap.gapDescription}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80">
                <span className="text-[11px] font-semibold text-indigo-400 block mb-1">
                  Recommended Action:
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {gap.recommendedAddition}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
