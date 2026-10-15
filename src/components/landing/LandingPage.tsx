import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Target,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Building2,
  Layers,
  Award,
  Zap,
  BarChart3,
  Compass,
  Briefcase
} from 'lucide-react';

interface LandingPageProps {
  onLaunchApp: () => void;
  onExploreRole: (role: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchApp, onExploreRole }) => {
  // Interactive mini skill-gap demo right on the landing page!
  const [demoRole, setDemoRole] = useState<'backend' | 'fullstack' | 'ml'>('backend');

  const demoRoles = {
    backend: {
      title: 'Backend Developer',
      salary: '₹8.5L - ₹18L / yr',
      matched: ['Python', 'SQL', 'Git & GitHub'],
      missing: ['RESTful APIs', 'Docker', 'PostgreSQL'],
      readiness: 68
    },
    fullstack: {
      title: 'Full-Stack Engineer',
      salary: '₹9L - ₹20L / yr',
      matched: ['JavaScript', 'React', 'HTML5 & CSS3'],
      missing: ['TypeScript', 'Node.js', 'PostgreSQL'],
      readiness: 62
    },
    ml: {
      title: 'Machine Learning Engineer',
      salary: '₹11L - ₹25L / yr',
      matched: ['Python', 'Pandas', 'NumPy'],
      missing: ['PyTorch', 'Scikit-Learn', 'LLMs & GenAI'],
      readiness: 55
    }
  };

  const activeDemo = demoRoles[demoRole];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Hero Section with 2-Column Split */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-24 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Headline and Call-to-actions */}
            <div className="space-y-6">
              <div className="text-xs text-indigo-400 font-medium">
                <span>Smart India Hackathon 2026</span>
                <span className="mx-2">·</span>
                <span>Team Stack_Spartans</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-display leading-[1.1] text-balance">
                Your Degree Is the Start. Your Skills Define the Journey.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                Discover your strengths, identify the technical skills you're missing, and build a personalized mathematical roadmap toward the tech career you want.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onLaunchApp}
                  className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2"
                >
                  <span>Explore Your Career Ladder</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#interactive-demo"
                  className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl text-sm font-medium border border-slate-800 transition-colors"
                >
                  Try Interactive Demo
                </a>
              </div>

              <div className="pt-6 border-t border-slate-800/80 flex items-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>ESCO / O*NET Aligned</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Gemini 3.8 Flash AI</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Real Placement Intelligence</span>
                </div>
              </div>
            </div>

            {/* Right Column: High-Fidelity Hero Image Asset */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900">
                <img
                  src="/src/assets/images/career_ladder_hero_1792012205941.jpg"
                  alt="Career Ladder University Innovation Lab"
                  className="w-full h-[400px] md:h-[480px] object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                {/* Floating telemetry badge */}
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-slate-950/90 border border-slate-800 backdrop-blur-md">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-white">Campus-to-Corporate Alignment</span>
                    <span className="text-emerald-400 font-mono font-bold">+24% YoY Placement Rate</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Connecting Indian engineering students with high-growth tech enterprises through verifiable skills intelligence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demonstration Section */}
      <section id="interactive-demo" className="py-20 border-b border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
              Experience The Engine
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white font-display">
              Interactive Skill-Gap Demonstration
            </h2>
            <p className="text-sm text-slate-400">
              Select a target engineering career to see how Career Ladder calculates exact required vs preferred coverage using transparent mathematical weights.
            </p>

            {/* Role switch tabs */}
            <div className="flex justify-center gap-2 pt-4">
              <button
                onClick={() => setDemoRole('backend')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  demoRole === 'backend' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Backend Developer
              </button>
              <button
                onClick={() => setDemoRole('fullstack')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  demoRole === 'fullstack' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Full-Stack Engineer
              </button>
              <button
                onClick={() => setDemoRole('ml')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  demoRole === 'ml' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                ML Engineer
              </button>
            </div>
          </div>

          {/* Interactive Calculator Display */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 max-w-4xl mx-auto shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center pb-6 border-b border-slate-800">
              <div className="md:col-span-2 space-y-1">
                <span className="text-xs text-indigo-400 font-mono">Sample Candidate vs {activeDemo.title}</span>
                <h3 className="text-xl font-bold text-white">{activeDemo.title}</h3>
                <p className="text-xs text-slate-400">Industry Compensation: <strong className="text-slate-200">{activeDemo.salary}</strong></p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block mb-1">Career Readiness Index</span>
                <span className="text-4xl font-extrabold text-indigo-400 font-mono tabular-nums">
                  {activeDemo.readiness}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
              {/* Matched */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Candidate Matched Skills</span>
                  </div>
                  <span className="font-mono">{activeDemo.matched.length} Matched</span>
                </div>
                <div className="space-y-1.5 pt-1">
                  {activeDemo.matched.map(s => (
                    <div key={s} className="text-xs text-slate-200 py-1 border-b border-emerald-900/20 last:border-none flex items-center justify-between">
                      <span>{s}</span>
                      <span className="text-emerald-400 font-mono text-[11px]">Acquired</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing */}
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-rose-400">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Missing Industry Requirements</span>
                  </div>
                  <span className="font-mono">{activeDemo.missing.length} Gaps</span>
                </div>
                <div className="space-y-1.5 pt-1">
                  {activeDemo.missing.map(s => (
                    <div key={s} className="text-xs text-slate-200 py-1 border-b border-rose-900/20 last:border-none flex items-center justify-between">
                      <span>{s}</span>
                      <span className="text-rose-400 font-mono text-[11px] font-medium">Critical Deficit</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 text-center">
              <button
                onClick={onLaunchApp}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-md transition-colors inline-flex items-center gap-2"
              >
                <span>Launch Full Platform With Your Resume</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Pipeline */}
      <section id="workflow" className="py-20 border-b border-slate-800 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
              Standardized Workflow
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white font-display">
              The 8-Stage Career Intelligence Engine
            </h2>
            <p className="text-sm text-slate-400">
              From raw resume text to verified placement, every transition is governed by reproducible logic.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: '01', title: 'Resume Analysis', desc: 'Accepts PDF, DOCX, or text. Parses education, projects, and original skill quotes.' },
              { num: '02', title: 'Skill Normalization', desc: 'Standardizes extracted keywords against our canonical ESCO/O*NET 50+ taxonomy.' },
              { num: '03', title: 'Interactive Graph', desc: 'Builds a dynamic network graph connecting student nodes to occupational roles.' },
              { num: '04', title: 'Skill-Gap Engine', desc: 'Calculates transparent weighted coverage dividing matched weight by required weight.' },
              { num: '05', title: 'Actionable Roadmap', desc: 'Transforms technical deficits into milestone steps with real documentation links.' },
              { num: '06', title: 'Skill Assessments', desc: 'Timed multiple-choice tests with objective explanations to earn verified badges.' },
              { num: '07', title: 'Job Matching', desc: 'Discovers verified Indian tech opportunities sorted dynamically by candidate fit.' },
              { num: '08', title: 'Cohort Analytics', desc: 'Gives colleges institutional diagnostics to close recurring curriculum gaps.' }
            ].map(item => (
              <div key={item.num} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
                <span className="text-xs font-mono text-indigo-400 font-bold">{item.num}.</span>
                <h3 className="text-sm font-bold text-white">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stakeholder Ecosystem Section with Generated Assets */}
      <section id="ecosystem" className="py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
              Multi-Stakeholder Architecture
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white font-display">
              Built for Students, Institutions, and Industry
            </h2>
          </div>

          {/* 3 Pillars with High-Fidelity Assets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Student */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between">
              <div className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">For Engineering Students</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Understand your exact market readiness score. Identify which skills to learn next instead of applying blindly to hundreds of vacancies.
                </p>
                <ul className="text-xs text-slate-400 space-y-1.5 pt-2">
                  <li>✓ Instant resume parsing & normalization</li>
                  <li>✓ Personalized learning roadmap with vetted links</li>
                  <li>✓ Objective skill verification tests</li>
                </ul>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={onLaunchApp}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Enter Student Portal
                </button>
              </div>
            </div>

            {/* Institution */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between">
              <div className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-sky-600/20 text-sky-400 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">For Academic Institutions</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Colleges and Deans inspect cohort-level skill telemetry, discover missing competencies by department, and adapt curriculum before placement drives.
                </p>
                <ul className="text-xs text-slate-400 space-y-1.5 pt-2">
                  <li>✓ Aggregated cohort readiness diagnostics</li>
                  <li>✓ Recurring curriculum gap alerts</li>
                  <li>✓ Real corporate hiring alignment index</li>
                </ul>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={onLaunchApp}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
                >
                  View Dean's Analytics
                </button>
              </div>
            </div>

            {/* Industry */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between">
              <div className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">For Tech Companies</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Publish openings, define precise weighted requirements, and receive candidates pre-evaluated with transparent skill matches and verified test badges.
                </p>
                <ul className="text-xs text-slate-400 space-y-1.5 pt-2">
                  <li>✓ Transparent candidate compatibility %</li>
                  <li>✓ Explanation of matched vs missing skills</li>
                  <li>✓ Pipeline management & status tracking</li>
                </ul>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={onLaunchApp}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
                >
                  Open Recruiter Console
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-950 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
              CL
            </div>
            <span className="font-semibold text-slate-200">Career Ladder</span>
            <span className="text-slate-600">·</span>
            <span>From Classroom to Career</span>
          </div>

          <div className="flex items-center gap-6">
            <span>Smart India Hackathon 2026</span>
            <span>Team Stack_Spartans</span>
            <span>Powered by Gemini 3.8 Flash</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
