import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Occupation, SkillGapAnalysis, StudentProfile } from '../../types';
import { SkillGraph } from '../common/SkillGraph';
import {
  Sparkles,
  Target,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Brain,
  HelpCircle,
  Briefcase,
  Layers,
  Zap,
  Info
} from 'lucide-react';

interface SkillGapAnalyzerProps {
  onNavigateToRoadmap?: () => void;
}

export const SkillGapAnalyzer: React.FC<SkillGapAnalyzerProps> = ({ onNavigateToRoadmap }) => {
  const [occupations, setOccupations] = useState<Occupation[]>([]);
  const [selectedOccupationId, setSelectedOccupationId] = useState<string>('');
  const [gapData, setGapData] = useState<SkillGapAnalysis | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const [occRes, profRes] = await Promise.all([
          api.getOccupations(),
          api.getStudentProfile()
        ]);
        setOccupations(occRes.occupations);
        setStudentProfile(profRes.student);

        const defaultId = profRes.student.targetOccupationId || occRes.occupations[0]?.id;
        setSelectedOccupationId(defaultId);

        const gapRes = await api.getSkillGap(defaultId);
        setGapData(gapRes);
      } catch (err) {
        console.error('Failed to load skill gap data:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleOccupationChange = async (occId: string) => {
    setSelectedOccupationId(occId);
    try {
      setLoading(true);
      const res = await api.getSkillGap(occId);
      setGapData(res);
      // update student's target role in profile
      await api.updateStudentProfile({ targetOccupationId: occId });
    } catch (e) {
      console.error('Failed to recompute gap for occupation:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !gapData) {
    return (
      <div className="p-8 space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-28 bg-slate-900 rounded-2xl"></div>
        <div className="h-96 bg-slate-900 rounded-2xl"></div>
      </div>
    );
  }

  const selectedOccupation = occupations.find(o => o.id === selectedOccupationId) || gapData?.targetOccupation;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header & Occupation Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <div className="text-xs text-indigo-400 font-medium">
            <span>Skill Intelligence Engine</span>
            <span className="mx-2">·</span>
            <span>Deterministic Coverage Scoring</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-display">
            Career Skill-Gap Analysis
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Compare your active verified capabilities against target industry role specifications.
          </p>
        </div>

        {/* Occupation Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs">
            <span className="text-slate-400">Target Role:</span>
            <select
              value={selectedOccupationId}
              onChange={(e) => handleOccupationChange(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              {occupations.map(occ => (
                <option key={occ.id} value={occ.id} className="bg-slate-900 text-white">
                  {occ.title} ({occ.medianSalaryINR})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowFormulaModal(true)}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-colors"
            title="Inspect Mathematical Scoring Formula"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Target Role Overview Banner */}
      {selectedOccupation && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <div className="md:col-span-2 space-y-1.5">
              <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider">
                {selectedOccupation.category}
              </span>
              <h2 className="text-xl font-bold text-white">{selectedOccupation.title}</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedOccupation.overview}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-slate-400">Industry Compensation</span>
              <div className="text-base font-bold text-white font-mono">
                {selectedOccupation.medianSalaryINR}
              </div>
              <div className="text-xs text-emerald-400 font-medium">
                {selectedOccupation.growthRate} hiring expansion
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-slate-400">Active Openings</span>
              <div className="text-base font-bold text-white font-mono tabular-nums">
                {selectedOccupation.openingsCount.toLocaleString()} openings
              </div>
              <div className="text-xs text-slate-400">
                Bengaluru · Hyderabad · Pune · Remote
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Primary Mathematical Scores Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Overall Readiness Score */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold text-slate-300">Overall Career Readiness</span>
            <Target className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white font-mono tabular-nums">
              {gapData?.overallReadinessScore}%
            </span>
            <span className="text-xs text-slate-400">weighted index</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${gapData?.overallReadinessScore || 0}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Composite: 75% Required Coverage + 25% Preferred Coverage
          </p>
        </div>

        {/* Required Skills Coverage */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold text-slate-300">Required Skills Coverage</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-emerald-400 font-mono tabular-nums">
              {gapData?.requiredCoveragePct}%
            </span>
            <span className="text-xs text-slate-400">
              ({gapData?.matchedRequired.length} of {selectedOccupation?.requiredSkills.length} acquired)
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${gapData?.requiredCoveragePct || 0}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Non-negotiable screening requirements for {selectedOccupation?.title}
          </p>
        </div>

        {/* Preferred Skills Coverage */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold text-slate-300">Preferred Skills Coverage</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-amber-400 font-mono tabular-nums">
              {gapData?.preferredCoveragePct}%
            </span>
            <span className="text-xs text-slate-400">
              ({gapData?.matchedPreferred.length} of {selectedOccupation?.preferredSkills.length} acquired)
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${gapData?.preferredCoveragePct || 0}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Competitive differentiators that elevate candidate ranking
          </p>
        </div>
      </div>

      {/* Interactive Skill Network Graph */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Interactive Skill Graph</h3>
            <p className="text-xs text-slate-400">
              Graph visualization of candidate competencies, target occupational nodes, and bridge pathways.
            </p>
          </div>
        </div>

        {selectedOccupation && (
          <SkillGraph
            studentName={studentProfile?.name || 'Aanya Sharma'}
            studentSkills={studentProfile?.skills || []}
            targetOccupation={selectedOccupation}
            bridgeConnections={gapData?.bridgeConnections || []}
          />
        )}
      </div>

      {/* Detailed Skill Breakdown: Matched vs Missing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Acquired Skills Column */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-semibold text-white">Acquired Competencies</h3>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/60">
              {gapData?.matchedRequired.length} Matched Required
            </span>
          </div>

          <div className="space-y-3">
            {gapData?.matchedRequired.map(skill => (
              <div
                key={skill.skillId}
                className="flex items-center justify-between p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-200">{skill.skillName}</div>
                  <div className="text-xs text-slate-400">
                    Proficiency: <span className="text-emerald-400">{skill.proficiency}</span>
                    {skill.verified && <span className="ml-2 text-indigo-400 font-medium">· Assessment Verified</span>}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-slate-300">
                    Weight: {Math.round(skill.weight * 100)}%
                  </span>
                </div>
              </div>
            ))}

            {/* Matched Preferred */}
            {gapData?.matchedPreferred && gapData.matchedPreferred.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Acquired Preferred Skills
                </span>
                {gapData.matchedPreferred.map(skill => (
                  <div
                    key={skill.skillId}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-950/40 border border-slate-800/60 mb-2"
                  >
                    <span className="text-sm text-slate-300">{skill.skillName}</span>
                    <span className="text-xs font-mono text-amber-400">Preferred (+{Math.round(skill.weight * 100)}%)</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Missing Skills & Deficit Gaps Column */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <h3 className="text-base font-semibold text-white">Identified Skill Deficits</h3>
            </div>
            <span className="text-xs font-mono text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/60">
              {gapData?.missingRequired.length} Missing Required
            </span>
          </div>

          <div className="space-y-3">
            {gapData?.missingRequired.map(skill => (
              <div
                key={skill.skillId}
                className="flex items-center justify-between p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-200">{skill.skillName}</div>
                  <div className="text-xs text-rose-400 font-medium">
                    Priority: {skill.priority} Deficit
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-slate-400">
                    Required Weight: {Math.round(skill.weight * 100)}%
                  </span>
                </div>
              </div>
            ))}

            {/* Missing Preferred */}
            {gapData?.missingPreferred && gapData.missingPreferred.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Missing Preferred Skills (Secondary)
                </span>
                {gapData.missingPreferred.map(skill => (
                  <div
                    key={skill.skillId}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-950/40 border border-slate-800/60 mb-2"
                  >
                    <span className="text-sm text-slate-300">{skill.skillName}</span>
                    <span className="text-xs font-mono text-slate-400">Secondary Weight: {Math.round(skill.weight * 100)}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Direct CTA to Roadmap */}
          <div className="pt-2">
            <button
              onClick={onNavigateToRoadmap}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <span>Convert Skill Gaps to Personalized Roadmap</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bridge Skills Analysis */}
      {gapData?.bridgeConnections && gapData.bridgeConnections.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-semibold text-white">Skill Bridge Acceleration</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            The platform identified that your existing foundations directly accelerate acquisition of missing requirements.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gapData.bridgeConnections.map((bridge, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-amber-950/20 border border-amber-900/40">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mb-1.5">
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-amber-800/60 text-slate-100">
                    {bridge.currentSkill}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  <span className="bg-amber-900/50 px-2 py-0.5 rounded border border-amber-700/60 text-amber-200">
                    {bridge.bridgesTo}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {bridge.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Strategic Intelligence Card */}
      {gapData?.aiGuidance && (
        <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-900/50 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-semibold text-white">AI Career Intelligence Guidance</h3>
            </div>
            <span className="text-xs font-mono text-indigo-300 bg-indigo-900/40 px-2 py-0.5 rounded border border-indigo-700/50">
              Est. {gapData.aiGuidance.estimatedWeeksToReadiness} weeks to full readiness
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {gapData.aiGuidance.executiveSummary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Strategic Steps */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">
                Recommended Execution Steps
              </span>
              {gapData.aiGuidance.strategicSteps.map((step, idx) => (
                <div key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-indigo-400 font-mono font-bold shrink-0">{idx + 1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>

            {/* High-Impact Project Prompts */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">
                Recommended Verification Projects
              </span>
              {gapData.aiGuidance.portfolioProjects.map((proj, idx) => (
                <div key={idx} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-300">
                  {proj}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Formula Modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-400" />
                <span>Deterministic Scoring Engine</span>
              </h3>
              <button
                onClick={() => setShowFormulaModal(false)}
                className="text-slate-400 hover:text-white text-xs font-medium px-2 py-1 rounded-md hover:bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-mono">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[11px] mb-1">Overall Career Readiness Formula:</div>
                <div className="text-indigo-400 font-bold">
                  Score = (0.75 × Required_Coverage) + (0.25 × Preferred_Coverage)
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[11px] mb-1">Required Skills Coverage:</div>
                <div className="text-emerald-400">
                  Required_Coverage = (Σ matched_required_weights / Σ all_required_weights) × 100
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[11px] mb-1">Preferred Skills Coverage:</div>
                <div className="text-amber-400">
                  Preferred_Coverage = (Σ matched_preferred_weights / Σ all_preferred_weights) × 100
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Unlike arbitrary AI-hallucinated scoreboards, this formula is mathematically transparent, reproducible, and updates dynamically whenever your profile or target role changes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
