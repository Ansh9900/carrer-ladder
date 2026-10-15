import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { JobListing } from '../../types';
import {
  Briefcase,
  Search,
  Filter,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Send,
  Building2,
  Check
} from 'lucide-react';

interface JobDiscoveryProps {
  onApplied?: () => void;
  onNavigateToRoadmap?: () => void;
}

export const JobDiscovery: React.FC<JobDiscoveryProps> = ({ onApplied, onNavigateToRoadmap }) => {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Application Modal state
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [applicationNotes, setApplicationNotes] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState('');

  const loadJobs = async () => {
    try {
      setLoading(true);
      const res = await api.getJobs({
        query: searchQuery,
        type: typeFilter,
        location: locationFilter
      });
      setJobs(res.jobs);
    } catch (e) {
      console.error('Failed to load jobs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [typeFilter, locationFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadJobs();
  };

  const handleOpenApplyModal = (job: JobListing) => {
    setSelectedJob(job);
    setApplicationNotes('');
    setApplySuccess(false);
    setApplyError('');
  };

  const handleSubmitApplication = async () => {
    if (!selectedJob) return;
    setIsApplying(true);
    setApplyError('');

    try {
      await api.applyForJob(selectedJob.id, applicationNotes);
      setApplySuccess(true);
      await loadJobs(); // Refresh application status
      if (onApplied) onApplied();
    } catch (err: any) {
      setApplyError(err.message || 'Failed to submit application.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <div className="text-xs text-indigo-400 font-medium">
          <span>Opportunity Intelligence Marketplace</span>
          <span className="mx-2">·</span>
          <span>Dynamic Skill Compatibility</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-display">
          Jobs & Internships
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Explore vetted openings with real-time match rankings computed directly against your skill inventory.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, skill (Python, Docker), or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </form>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="All">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Location:</span>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="All">All Locations</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Listing */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-36 bg-slate-900 rounded-xl"></div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl p-8 space-y-3">
          <Briefcase className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No openings matched your filters</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search criteria or resetting filters to browse all opportunities.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => (
            <div
              key={job.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 hover:border-slate-700 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-3 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-indigo-400">
                    {job.companyName}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs text-slate-400">{job.type}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs text-slate-400">{job.experienceLevel}</span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">{job.title}</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {job.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{job.location} ({job.remoteType})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300 font-medium font-mono">
                    <span>{job.stipendOrSalary}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Deadline: {job.deadline}</span>
                  </div>
                </div>

                {/* Skills Compatibility Tag Strip */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="text-slate-500 text-[11px]">Matched:</span>
                  {job.matchedSkills.length > 0 ? (
                    job.matchedSkills.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-900/60 text-emerald-300 text-[11px] font-medium">
                        ✓ {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 text-[11px]">None yet</span>
                  )}

                  {job.missingRequired.length > 0 && (
                    <>
                      <span className="text-slate-600 mx-1">|</span>
                      <span className="text-slate-500 text-[11px]">Missing:</span>
                      {job.missingRequired.map(s => (
                        <span key={s} className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-900/60 text-rose-300 text-[11px] font-medium">
                          ✕ {s}
                        </span>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Right side: Match score & Apply action */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-4 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-800">
                <div className="text-left sm:text-right">
                  <div className="flex items-baseline sm:justify-end gap-1">
                    <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
                      {job.matchScore}%
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block">Candidate Compatibility</span>
                </div>

                {job.applied ? (
                  <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-emerald-400 text-xs font-semibold">
                    <Check className="w-3.5 h-3.5" />
                    <span>Applied ({job.applicationStatus || 'Reviewing'})</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleOpenApplyModal(job)}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <span>Apply Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Application Submission Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs text-indigo-400 font-semibold">{selectedJob.companyName}</span>
                <h3 className="text-base font-bold text-white">{selectedJob.title}</h3>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-slate-800"
              >
                Close
              </button>
            </div>

            {applySuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">Application Submitted!</h4>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  Your verified profile and skill score of {selectedJob.matchScore}% have been transmitted to the {selectedJob.companyName} hiring dashboard.
                </p>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg border border-slate-700"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Skill Compatibility Summary */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Match Compatibility:</span>
                    <span className="font-bold text-indigo-400 font-mono text-sm">{selectedJob.matchScore}%</span>
                  </div>

                  {selectedJob.missingRequired.length > 0 && (
                    <div className="p-2.5 bg-rose-950/30 border border-rose-900/40 rounded-lg text-xs text-rose-300 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>Notice:</strong> You are currently missing: {selectedJob.missingRequired.join(', ')}. Recruiters may evaluate your application based on foundational bridge skills.
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    Candidate Note / Cover Statement (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={applicationNotes}
                    onChange={(e) => setApplicationNotes(e.target.value)}
                    placeholder="Briefly state why you're interested or highlight relevant portfolio projects..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-sans"
                  />
                </div>

                {applyError && (
                  <div className="p-3 bg-rose-950/40 border border-rose-900/60 rounded-lg text-xs text-rose-300">
                    {applyError}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitApplication}
                    disabled={isApplying}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-md transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isApplying ? 'Submitting...' : 'Submit Verified Application'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
