import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StudentProfile, SkillGapAnalysis, JobListing, StudentApplication, RoadmapData } from '../../types';
import {
  Sparkles,
  ArrowRight,
  Target,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  GraduationCap,
  Layers,
  ChevronRight,
  TrendingUp,
  Award,
  BookOpen,
  UserPlus,
  Users
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigate: (view: string) => void;
  onOpenNewStudentModal?: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate, onOpenNewStudentModal }) => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [allStudents, setAllStudents] = useState<StudentProfile[]>([]);
  const [gapData, setGapData] = useState<SkillGapAnalysis | null>(null);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profRes, gapRes, jobsRes, appsRes, roadRes, studentsRes] = await Promise.all([
        api.getStudentProfile(),
        api.getSkillGap(),
        api.getJobs(),
        api.getStudentApplications(),
        api.getRoadmap(),
        api.getStudents()
      ]);
      setProfile(profRes.student);
      setGapData(gapRes);
      setJobs(jobsRes.jobs.slice(0, 3));
      setApplications(appsRes.applications);
      setRoadmap(roadRes);
      setAllStudents(studentsRes.students || []);
    } catch (e) {
      console.error('Error loading student dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchStudent = async (studentId: string) => {
    try {
      setLoading(true);
      await api.switchActiveStudent(studentId);
      await loadData();
    } catch (e) {
      console.error('Failed to switch student:', e);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-40 bg-slate-900 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-slate-900 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const verifiedSkillsCount = profile?.skills.filter(s => s.verified).length || 0;
  const totalSkillsCount = profile?.skills.length || 0;
  const readiness = gapData?.overallReadinessScore || 0;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Student Profile Switcher & New Student Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <Users className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">Active Candidate Profile:</span>
          <select
            value={profile?.id}
            onChange={(e) => handleSwitchStudent(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-white font-semibold text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {allStudents.map(st => (
              <option key={st.id} value={st.id} className="bg-slate-900 text-white">
                {st.name} — {st.department || 'Engineering'} ({st.institution})
              </option>
            ))}
          </select>
        </div>

        {onOpenNewStudentModal && (
          <button
            onClick={onOpenNewStudentModal}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Enter New Student Data</span>
          </button>
        )}
      </div>

      {/* Top Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 md:p-8">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="text-xs text-indigo-400 font-medium">
              <span>{profile?.institution}</span>
              <span className="mx-2">·</span>
              <span>Class of {profile?.graduationYear}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-display">
              Welcome back, {profile?.name}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Target Career: <strong className="text-white">{gapData?.targetOccupation.title}</strong>. Your verified skill readiness is calculated at <strong className="text-indigo-400 font-mono">{readiness}%</strong> based on industry benchmark weights.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('skill-gap')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              <span>Analyze Skill Gap</span>
            </button>
            <button
              onClick={() => onNavigate('resume')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors whitespace-nowrap"
            >
              Upload New Resume
            </button>
            {onOpenNewStudentModal && (
              <button
                onClick={onOpenNewStudentModal}
                className="px-4 py-2.5 bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-200 border border-indigo-800/80 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <UserPlus className="w-4 h-4" />
                <span>Enter New Student</span>
              </button>
            )}
          </div>
        </div>

        {/* Decorative background grid */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Career Readiness */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
            <span className="font-medium">Career Readiness</span>
            <Target className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono tabular-nums">{readiness}%</span>
            <span className="text-xs text-slate-400">weighted coverage</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${readiness}%` }}
            />
          </div>
        </div>

        {/* Total Extracted Skills */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
            <span className="font-medium">Identified Skills</span>
            <Layers className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono tabular-nums">{totalSkillsCount}</span>
            <span className="text-xs text-slate-400">total in inventory</span>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            Across {new Set(profile?.skills.map(s => s.category)).size} technical categories
          </div>
        </div>

        {/* Verified Skills */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
            <span className="font-medium">Verified by Assessment</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-400 font-mono tabular-nums">{verifiedSkillsCount}</span>
            <span className="text-xs text-slate-400">verified badges</span>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            {totalSkillsCount - verifiedSkillsCount} self-reported or from resume
          </div>
        </div>

        {/* Active Applications */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
            <span className="font-medium">Active Applications</span>
            <Briefcase className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono tabular-nums">{applications.length}</span>
            <span className="text-xs text-slate-400">in hiring pipeline</span>
          </div>
          <div className="mt-3 text-xs text-emerald-400 flex items-center gap-1">
            <span>{applications.filter(a => a.status === 'Shortlisted').length} shortlisted</span>
          </div>
        </div>
      </div>

      {/* Main Split Grid: Skill Gap Quick Summary & Roadmap Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Skill-Gap Snapshot & Bridge Path */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-white">Target Skill Coverage Breakdown</h3>
                <p className="text-xs text-slate-400">
                  Target Role: {gapData?.targetOccupation.title} · Benchmark Weights Applied
                </p>
              </div>
              <button
                onClick={() => onNavigate('skill-gap')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
              >
                <span>View Full Interactive Graph</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Matched vs Missing list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Matched */}
              <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-900/40">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Acquired Required Skills</span>
                  </div>
                  <span className="font-mono">{gapData?.matchedRequired.length} matched</span>
                </div>
                <div className="space-y-1.5">
                  {gapData?.matchedRequired.map(s => (
                    <div key={s.skillId} className="flex items-center justify-between text-xs py-1 border-b border-emerald-900/20 last:border-none">
                      <span className="text-slate-200">{s.skillName}</span>
                      <span className="text-emerald-400/80 font-mono text-[11px]">
                        {s.verified ? 'Verified' : s.proficiency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing */}
              <div className="p-4 rounded-lg bg-rose-950/20 border border-rose-900/40">
                <div className="flex items-center justify-between text-xs font-semibold text-rose-400 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Missing Required Skills</span>
                  </div>
                  <span className="font-mono">{gapData?.missingRequired.length} deficit</span>
                </div>
                <div className="space-y-1.5">
                  {gapData?.missingRequired.map(s => (
                    <div key={s.skillId} className="flex items-center justify-between text-xs py-1 border-b border-rose-900/20 last:border-none">
                      <span className="text-slate-200">{s.skillName}</span>
                      <span className="text-rose-400 font-mono text-[11px] font-medium">
                        {s.priority} Priority
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Strategic Advice Preview */}
            {gapData?.aiGuidance && (
              <div className="mt-5 p-4 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Career Intelligence Summary</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {gapData.aiGuidance.executiveSummary}
                </p>
              </div>
            )}
          </div>

          {/* Top Opportunities Matching Current Profile */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-white">Recommended Opportunities</h3>
                <p className="text-xs text-slate-400">Calculated in real-time against your actual skill inventory</p>
              </div>
              <button
                onClick={() => onNavigate('jobs')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
              >
                <span>View All Listings</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {jobs.map(job => (
                <div
                  key={job.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-white">{job.title}</h4>
                      <span className="text-xs text-slate-400 font-medium">· {job.companyName}</span>
                    </div>
                    <div className="text-xs text-slate-400">
                      <span>{job.location} ({job.remoteType})</span>
                      <span className="mx-2">·</span>
                      <span className="text-slate-300">{job.stipendOrSalary}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs pt-1">
                      <span className="text-slate-500">Matches:</span>
                      <span className="text-emerald-400 font-medium">{job.matchedSkills.join(', ')}</span>
                      {job.missingRequired.length > 0 && (
                        <>
                          <span className="text-slate-600">|</span>
                          <span className="text-slate-500">Missing:</span>
                          <span className="text-rose-400">{job.missingRequired.join(', ')}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-lg font-bold text-indigo-400 font-mono tabular-nums">
                        {job.matchScore}%
                      </div>
                      <div className="text-[10px] text-slate-400">Match Score</div>
                    </div>
                    <button
                      onClick={() => onNavigate('jobs')}
                      className="px-3 py-1.5 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-md text-xs font-medium transition-colors"
                    >
                      {job.applied ? 'Applied' : 'Details'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Personalized Roadmap Progress */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">Roadmap Progress</h3>
              <span className="text-xs font-mono text-indigo-400">
                {roadmap?.overallRoadmapProgress || 0}% Complete
              </span>
            </div>

            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-5">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${roadmap?.overallRoadmapProgress || 0}%` }}
              />
            </div>

            {roadmap?.modules && roadmap.modules.length > 0 ? (
              <div className="space-y-4">
                {roadmap.modules.slice(0, 3).map((mod, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold text-slate-200">{mod.skillName}</span>
                      <span className="text-rose-400 font-medium text-[11px]">{mod.priority} Priority</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">
                      {mod.steps[0]?.title}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>{mod.resources[0]?.provider || 'Documentation'}</span>
                      <button
                        onClick={() => onNavigate('roadmap')}
                        className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                      >
                        <span>Start</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => onNavigate('roadmap')}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Open Full Personalized Roadmap</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">
                No active skill deficits for current role!
              </div>
            )}
          </div>

          {/* Quick Skill Verification CTA */}
          <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-900/40 rounded-xl p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-2">
              <Award className="w-4 h-4" />
              <span>Verify Your Skills</span>
            </div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Employers prioritize candidates with verified assessment badges. Take a 10-minute assessment in Python, SQL, or Docker to earn a verified status.
            </p>
            <button
              onClick={() => onNavigate('assessments')}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Take Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
