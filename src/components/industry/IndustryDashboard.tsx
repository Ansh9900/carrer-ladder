import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CompanyApplication, JobListing } from '../../types';
import {
  Building2,
  Briefcase,
  Users,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  Sparkles,
  Send,
  Filter
} from 'lucide-react';

export const IndustryDashboard: React.FC = () => {
  const [applications, setApplications] = useState<CompanyApplication[]>([]);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  // Job creation modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'Full-time' | 'Internship'>('Full-time');
  const [newLocation, setNewLocation] = useState('Bengaluru (Koramangala)');
  const [newRemoteType, setNewRemoteType] = useState<'On-site' | 'Hybrid' | 'Remote'>('Hybrid');
  const [newSalary, setNewSalary] = useState('₹10L - ₹16L / year');
  const [newExperience, setNewExperience] = useState('Entry Level (0-1 yrs)');
  const [newDesc, setNewDesc] = useState('');
  const [newReqSkills, setNewReqSkills] = useState('Python, RESTful APIs, SQL, Docker');
  const [newPrefSkills, setNewPrefSkills] = useState('Redis, AWS');
  const [isCreating, setIsCreating] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getCompanyApplications();
      setApplications(res.applications);
      setJobs(res.companyJobs || []);
    } catch (e) {
      console.error('Failed to load company applications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      await api.updateApplicationStatus(appId, newStatus);
      await loadData();
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    setIsCreating(true);
    try {
      await api.createJob({
        title: newTitle.trim(),
        type: newType,
        location: newLocation,
        remoteType: newRemoteType,
        stipendOrSalary: newSalary,
        experienceLevel: newExperience,
        description: newDesc.trim(),
        requiredSkills: newReqSkills.split(',').map(s => s.trim()).filter(Boolean),
        preferredSkills: newPrefSkills.split(',').map(s => s.trim()).filter(Boolean),
        deadline: '2026-12-31'
      });
      setShowCreateModal(false);
      setNewTitle('');
      setNewDesc('');
      await loadData();
    } catch (e) {
      console.error('Failed to create job:', e);
    } finally {
      setIsCreating(false);
    }
  };

  const filteredApplications = applications.filter(a => {
    if (statusFilter === 'All') return true;
    return a.status.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="text-xs text-indigo-400 font-medium">
            <span>Corporate Talent Gateway</span>
            <span className="mx-2">·</span>
            <span>Skill-Verified Candidate Matching</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-display">
            InnovateTech India — Recruitment Console
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Review incoming applicants with automated skill-compatibility indexes, verified test scores, and missing capability breakdowns.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors flex items-center gap-2 whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Opportunity</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Active Job Listings</span>
            <Briefcase className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-3xl font-bold text-white font-mono tabular-nums">
            {jobs.length}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Across Backend, Cloud & Analytics</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total Applicant Pool</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-3xl font-bold text-white font-mono tabular-nums">
            {applications.length}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">
            {applications.filter(a => a.status === 'Shortlisted').length} currently shortlisted
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Average Skill Compatibility</span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <span className="text-3xl font-bold text-white font-mono tabular-nums">
            {applications.length > 0 ? Math.round(applications.reduce((a, c) => a + c.matchScore, 0) / applications.length) : 0}%
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Grounded in candidate verified assessments</p>
        </div>
      </div>

      {/* Active Listings Preview Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">Your Published Opportunities</h3>
          <span className="text-xs text-slate-400">{jobs.length} Live Openings</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map(job => (
            <div key={job.id} className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{job.title}</h4>
                  <div className="text-xs text-slate-400">
                    <span>{job.location} ({job.remoteType})</span>
                    <span className="mx-2">·</span>
                    <span className="text-slate-300 font-mono">{job.stipendOrSalary}</span>
                  </div>
                </div>
                <span className="text-xs text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/60">
                  Active
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
                <span className="text-slate-500">Required:</span>
                {job.requiredSkills.map(s => (
                  <span key={s} className="px-2 py-0.5 bg-slate-900 rounded border border-slate-800 text-slate-300">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Candidate Pipeline */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-white">Applicant Compatibility Pipeline</h3>
            <p className="text-xs text-slate-400">
              Each score explains why the candidate is shortlisted or what specific skill is missing.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Applied">Applied</option>
              <option value="Reviewing">Reviewing</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Offered">Offered</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/40 border border-slate-800 rounded-xl text-xs text-slate-400">
            No applicants match the current filter.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map(app => (
              <div
                key={app.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 space-y-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white">{app.studentName}</h4>
                      <span className="text-xs text-slate-400">· {app.studentDegree}</span>
                    </div>
                    <div className="text-xs text-slate-400">
                      <span>{app.studentInstitution}</span>
                      <span className="mx-2">·</span>
                      <span>CGPA: <strong className="text-slate-200 font-mono">{app.studentCgpa}</strong> / 10</span>
                      <span className="mx-2">·</span>
                      <span className="text-indigo-400">Applied for: {app.jobTitle}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-2xl font-bold text-white font-mono tabular-nums">
                        {app.matchScore}%
                      </span>
                      <span className="text-[10px] text-slate-400 block">Candidate Fit</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none"
                      >
                        <option value="Applied">Applied</option>
                        <option value="Reviewing">Reviewing</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Offered">Offered</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Transparent Match Reason per prompt rules */}
                <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-medium text-slate-200">
                    <span className="text-slate-400">Match Explanation:</span>
                    <span>
                      Candidate matches {app.matchedSkills.length} of {app.jobRequiredSkills.length} required skills.
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500">Matched Skills:</span>
                      <span className="text-emerald-400 font-medium">{app.matchedSkills.join(', ') || 'None'}</span>
                    </div>
                    {app.missingRequired.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500">Missing Deficit:</span>
                        <span className="text-rose-400 font-medium">{app.missingRequired.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {app.notes && (
                  <div className="text-xs text-slate-400 italic">
                    Candidate Statement: "{app.notes}"
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Job Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Publish New Job / Internship</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-slate-800"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Backend Systems Engineer"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Opportunity Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Work Mode</label>
                  <select
                    value={newRemoteType}
                    onChange={(e) => setNewRemoteType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Location</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Stipend or Salary</label>
                  <input
                    type="text"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Required Skills (Comma separated)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Python, RESTful APIs, SQL, Docker"
                  value={newReqSkills}
                  onChange={(e) => setNewReqSkills(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Preferred Skills (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g., Redis, AWS, Kubernetes"
                  value={newPrefSkills}
                  onChange={(e) => setNewPrefSkills(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Role Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Responsibilities, squad missions, tech stack..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-md"
                >
                  {isCreating ? 'Publishing...' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
