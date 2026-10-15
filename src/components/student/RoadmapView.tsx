import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { RoadmapData, RoadmapStep } from '../../types';
import {
  MapPin,
  CheckCircle2,
  Circle,
  ExternalLink,
  BookOpen,
  Code2,
  Clock,
  Sparkles,
  ArrowRight,
  Award
} from 'lucide-react';

export const RoadmapView: React.FC = () => {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRoadmap = async () => {
    try {
      setLoading(true);
      const res = await api.getRoadmap();
      setRoadmap(res);
    } catch (e) {
      console.error('Failed to load roadmap:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoadmap();
  }, []);

  const handleToggleStep = async (stepId: string) => {
    try {
      await api.toggleRoadmapStep(stepId);
      // Reload roadmap progress
      const updated = await api.getRoadmap();
      setRoadmap(updated);
    } catch (e) {
      console.error('Failed to toggle step:', e);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-32 bg-slate-900 rounded-2xl"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-44 bg-slate-900 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const modules = roadmap?.modules || [];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <div className="text-xs text-indigo-400 font-medium">
            <span>Career Transition Curriculum</span>
            <span className="mx-2">·</span>
            <span>Grounded In Missing Skill Gaps</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-display">
            Personalized Learning Roadmap
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Targeting: <strong className="text-white">{roadmap?.targetOccupation}</strong>. Follow step-by-step milestones to eliminate technical deficits.
          </p>
        </div>

        {/* Overall Completion Progress */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 min-w-[220px]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-medium">Milestones Completed</span>
            <span className="text-white font-bold font-mono">
              {roadmap?.totalCompleted} / {roadmap?.totalSteps}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${roadmap?.overallRoadmapProgress || 0}%` }}
            />
          </div>
          <div className="text-right text-[11px] font-mono text-indigo-400 mt-1">
            {roadmap?.overallRoadmapProgress}% Mastered
          </div>
        </div>
      </div>

      {/* Modules List */}
      {modules.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl p-8 space-y-3">
          <Award className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Full Skill Coverage Achieved!</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            You have acquired all required and preferred skills for {roadmap?.targetOccupation}. Head over to Job Marketplace to apply for matching openings!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {modules.map((mod, modIdx) => (
            <div
              key={modIdx}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700/80 transition-colors"
            >
              {/* Module Header Bar */}
              <div className="p-6 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/40">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-500">
                      Module 0{modIdx + 1}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className={`text-[11px] font-semibold font-mono ${
                      mod.priority === 'Critical' ? 'text-rose-400' : 'text-amber-400'
                    }`}>
                      {mod.priority} Priority
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-[11px] text-slate-400">{mod.type} Requirement</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{mod.skillName} Mastery Path</h3>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-400">
                    {mod.steps.filter(s => s.completed).length} of {mod.steps.length} Steps
                  </span>
                  <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${mod.progressPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Module Content */}
              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 3 Step Sequence Checklist (2 cols) */}
                <div className="lg:col-span-2 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Step-by-Step Learning Sequence
                  </h4>

                  {mod.steps.map((step, sIdx) => (
                    <div
                      key={step.id}
                      onClick={() => handleToggleStep(step.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                        step.completed
                          ? 'bg-emerald-950/20 border-emerald-900/40 text-slate-300'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-100'
                      }`}
                    >
                      <button className="shrink-0 mt-0.5 focus:outline-none">
                        {step.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                        )}
                      </button>

                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${step.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                            {step.title}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            Milestone {sIdx + 1}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Vetted Learning Resources & Project Idea (1 col) */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Vetted Curated Resources
                  </h4>

                  {mod.resources.length > 0 ? (
                    mod.resources.map(res => (
                      <div
                        key={res.id}
                        className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5"
                      >
                        <div className="flex items-center justify-between text-[11px] text-indigo-400">
                          <span className="font-semibold">{res.provider}</span>
                          <span className="text-slate-400">{res.durationHours} hrs</span>
                        </div>
                        <h5 className="text-xs font-bold text-white leading-snug">
                          {res.title}
                        </h5>
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium pt-1"
                        >
                          <span>Open Resource</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400">
                      Standard official documentation recommended.
                    </div>
                  )}

                  {/* Hands-on Project Idea Box */}
                  {mod.resources[0]?.projectIdea && (
                    <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-900/40 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
                        <Code2 className="w-3.5 h-3.5" />
                        <span>Recommended Verification Project</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {mod.resources[0].projectIdea}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
