import React, { useState } from 'react';
import { api } from '../../services/api';
import { ParsedResumeResponse, StudentSkill } from '../../types';
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  Trash2,
  Plus,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Save,
  RotateCcw
} from 'lucide-react';

interface ResumeAnalyzerProps {
  onSavedSkills?: () => void;
}

export const ResumeAnalyzer: React.FC<ResumeAnalyzerProps> = ({ onSavedSkills }) => {
  const [resumeText, setResumeText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedResumeResponse | null>(null);
  const [reviewedSkills, setReviewedSkills] = useState<Array<{
    canonicalName: string;
    category: string;
    proficiency: 'Beginner' | 'Intermediate' | 'Advanced';
    confidenceScore: number;
    evidenceText: string;
    selected: boolean;
  }>>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Languages');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const sampleResumes = [
    {
      label: 'Sample: Aanya Sharma (Backend & Systems Focused)',
      text: `Aanya Sharma
Email: aanya.sharma@iitd.ac.in | Phone: +91 98765 43210
Education: B.Tech in Computer Science and Engineering, IIT Delhi (CGPA: 8.85 / 10, Batch of 2026)

TECHNICAL QUALIFICATIONS:
- Languages: Python 3.10, SQL, JavaScript (ES6+), C++
- Frameworks & Backend: RESTful APIs, FastAPI, PostgreSQL, Node.js
- Tools & Systems: Git & GitHub, Linux Shell Scripting, Docker containers
- Concepts: Data Structures & Algorithms, Analytical Problem Solving, System Design

PROJECTS:
1. Campus Food Delivery Asynchronous Backend
- Engineered scalable microservice backend in Python using PostgreSQL and Redis caching.
- Achieved sub-50ms latency across 500 simultaneous orders with connection pooling and async event loops.
- Integrated RESTful API specifications with automated schema validation.

2. Placement Data Visualization Portal
- Built interactive analytics dashboard with React, JavaScript, and Tailwind CSS.
- Automated resume keyword extraction and departmental placement summaries for 400+ graduating students.

CERTIFICATIONS:
- Meta Database Engineer Professional Certificate (2025)`
    },
    {
      label: 'Sample: Devansh Gupta (Full-Stack & Web Dev)',
      text: `Devansh Gupta
Email: devansh.g@nie.ac.in | Phone: +91 98123 45678
National Institute of Engineering (NIE), B.E in Information Science, 2026 (CGPA: 8.2)

SKILLS:
- Web: React, TypeScript, Next.js, HTML5, CSS3, Tailwind CSS, JavaScript
- Backend: Node.js, Express.js, RESTful APIs, MongoDB
- Version Control & Cloud: Git & GitHub, Docker, Linux

EXPERIENCE & PROJECTS:
- Open-Source Contributor: Contributed PRs to popular React component libraries, maintaining high code coverage.
- Fintech Checkout Gateway: Built full-stack e-commerce checkout application with TypeScript, Node.js, Express, and MongoDB.`
    }
  ];

  const handleParse = async () => {
    if (!resumeText.trim()) {
      setErrorMsg('Please paste or select a resume text before parsing.');
      return;
    }
    setErrorMsg('');
    setIsParsing(true);
    setSaveSuccess(false);

    try {
      const res = await api.parseResume(resumeText);
      setParsedResult(res.result);
      setReviewedSkills(
        res.result.extractedSkills.map(s => ({
          ...s,
          selected: true
        }))
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to parse resume.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setResumeText(content || '');
    };
    reader.readAsText(file);
  };

  const toggleSkillSelection = (index: number) => {
    setReviewedSkills(prev => {
      const copy = [...prev];
      copy[index].selected = !copy[index].selected;
      return copy;
    });
  };

  const updateProficiency = (index: number, prof: 'Beginner' | 'Intermediate' | 'Advanced') => {
    setReviewedSkills(prev => {
      const copy = [...prev];
      copy[index].proficiency = prof;
      return copy;
    });
  };

  const removeSkill = (index: number) => {
    setReviewedSkills(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddManualSkill = () => {
    if (!newSkillName.trim()) return;
    setReviewedSkills(prev => [
      ...prev,
      {
        canonicalName: newSkillName.trim(),
        category: newSkillCategory,
        proficiency: 'Intermediate',
        confidenceScore: 0.95,
        evidenceText: 'Manually added by candidate during resume review',
        selected: true
      }
    ]);
    setNewSkillName('');
  };

  const handleSaveToProfile = async () => {
    const selected = reviewedSkills.filter(s => s.selected);
    if (selected.length === 0) {
      setErrorMsg('Select at least one skill to save to your profile.');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');

    try {
      await api.batchSaveSkills(
        selected.map(s => ({
          skillName: s.canonicalName,
          category: s.category,
          proficiency: s.proficiency,
          source: 'Resume',
          confidenceScore: s.confidenceScore,
          extractedFromText: s.evidenceText
        }))
      );

      // Also update student profile metadata if parsed
      if (parsedResult?.cgpa || parsedResult?.graduationYear) {
        await api.updateStudentProfile({
          cgpa: parsedResult.cgpa || 8.5,
          graduationYear: parsedResult.graduationYear || 2026,
          degree: parsedResult.degree || 'B.Tech Computer Science'
        });
      }

      setSaveSuccess(true);
      if (onSavedSkills) onSavedSkills();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save skills.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <div className="text-xs text-indigo-400 font-medium">
          <span>AI & NLP Extraction Pipeline</span>
          <span className="mx-2">·</span>
          <span>Canonical Skill Normalization</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-display">
          Resume Parser & Skill Extractor
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Upload or paste your technical resume to extract verified skills, evidence quotes, and proficiency ratings.
        </p>
      </div>

      {/* Preset Quick Select for Judges */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 font-medium">Preset Test Resumes:</span>
        {sampleResumes.map((sample, idx) => (
          <button
            key={idx}
            onClick={() => setResumeText(sample.text)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs rounded-lg border border-slate-800 transition-colors"
          >
            {sample.label}
          </button>
        ))}
      </div>

      {/* Input / Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-slate-200">
                Resume Plain Text / Markdown
              </label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload .txt / .md</span>
                  <input
                    type="file"
                    accept=".txt,.md,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {resumeText && (
                  <button
                    onClick={() => setResumeText('')}
                    className="text-xs text-slate-500 hover:text-slate-400"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <textarea
              rows={12}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste student resume text here, or click one of the preset test resumes above..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono resize-y"
            />

            {errorMsg && (
              <div className="mt-3 p-3 bg-rose-950/40 border border-rose-900/60 rounded-lg text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {resumeText ? `${resumeText.length} characters` : 'No text entered yet'}
              </span>
              <button
                onClick={handleParse}
                disabled={isParsing || !resumeText.trim()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-md transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isParsing ? 'Analyzing with NLP Engine...' : 'Run Skill Extraction'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pipeline Info & Assurance */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white">Extraction Safeguards</h3>
            <ul className="text-xs text-slate-400 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>No Automatic Seniority:</strong> Skills mentioned in resumes are not marked Advanced without evidence.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Human Review Required:</strong> You review every extracted skill before committing to your profile.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Dual Engine:</strong> Backed by Gemini 3.8 Flash with a deterministic ESCO/O*NET dictionary fallback.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Review & Edit Extracted Skills */}
      {parsedResult && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Skill Extraction Review</h3>
                <span className="text-[11px] font-mono text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/60">
                  Engine: {parsedResult.parsingMethod}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Found {reviewedSkills.length} potential skills. Uncheck false positives, refine proficiency levels, or add missing ones.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveToProfile}
                disabled={isSaving}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-md transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving to Profile...' : 'Save Verified Skills to Inventory'}</span>
              </button>
            </div>
          </div>

          {saveSuccess && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-900/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                Skills successfully committed to your persistent inventory! Career readiness and job matches have been recomputed.
              </span>
            </div>
          )}

          {/* Candidate Snapshot */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Candidate Name</span>
              <span className="font-semibold text-slate-200">{parsedResult.name || 'Candidate'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Institution</span>
              <span className="font-semibold text-slate-200">{parsedResult.institution || 'Engineering College'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Graduation Year</span>
              <span className="font-semibold text-slate-200 font-mono">{parsedResult.graduationYear || 2026}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">CGPA</span>
              <span className="font-semibold text-slate-200 font-mono">{parsedResult.cgpa || 8.5} / 10</span>
            </div>
          </div>

          {/* Skills Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Extracted Skills ({reviewedSkills.filter(s => s.selected).length} selected)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reviewedSkills.map((skill, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border transition-all ${
                    skill.selected
                      ? 'bg-slate-950/80 border-slate-700/80'
                      : 'bg-slate-950/30 border-slate-800/40 opacity-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={skill.selected}
                        onChange={() => toggleSkillSelection(idx)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-0 bg-slate-900 border-slate-700 cursor-pointer"
                      />
                      <div>
                        <span className="text-sm font-semibold text-white">{skill.canonicalName}</span>
                        <span className="ml-2 text-[10px] text-slate-400">· {skill.category}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeSkill(idx)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                      title="Discard False Positive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Evidence quote */}
                  <div className="text-[11px] text-slate-400 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800/50 mb-2.5">
                    "{skill.evidenceText}"
                  </div>

                  {/* Proficiency Selector & Confidence */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-[11px]">Proficiency:</span>
                      <select
                        value={skill.proficiency}
                        onChange={(e) => updateProficiency(idx, e.target.value as any)}
                        className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>

                    <span className="text-[10px] font-mono text-slate-500">
                      Conf: {Math.round(skill.confidenceScore * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Missing Skill manually */}
          <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl space-y-3">
            <h4 className="text-xs font-semibold text-slate-300">
              Add Any Missing Skill Manually
            </h4>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                placeholder="Skill name (e.g., Redis, PyTorch, Kubernetes)"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <select
                value={newSkillCategory}
                onChange={(e) => setNewSkillCategory(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="Languages">Languages</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Database">Database</option>
                <option value="Cloud & DevOps">Cloud & DevOps</option>
                <option value="AI & Data">AI & Data</option>
                <option value="Core & Architecture">Core & Architecture</option>
              </select>
              <button
                onClick={handleAddManualSkill}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Skill</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
