import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Occupation, Skill, StudentProfile } from '../../types';
import {
  UserPlus,
  X,
  Sparkles,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  Layers,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';

interface NewStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentCreated?: (student: StudentProfile) => void;
  initialInstitution?: string;
}

export const NewStudentModal: React.FC<NewStudentModalProps> = ({
  isOpen,
  onClose,
  onStudentCreated,
  initialInstitution
}) => {
  const [occupations, setOccupations] = useState<Occupation[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 98765 00000');
  const [location, setLocation] = useState('Bengaluru / Hybrid');
  const [institution, setInstitution] = useState(initialInstitution || 'National Institute of Engineering');
  const [degree, setDegree] = useState('B.Tech in Computer Science & Engineering');
  const [department, setDepartment] = useState('Computer Science');
  const [graduationYear, setGraduationYear] = useState(2026);
  const [cgpa, setCgpa] = useState(8.6);
  const [targetOccupationId, setTargetOccupationId] = useState('occ-backend-dev');

  // Selected Skills
  const [selectedSkills, setSelectedSkills] = useState<Array<{
    skillName: string;
    category: string;
    proficiency: 'Beginner' | 'Intermediate' | 'Advanced';
  }>>([
    { skillName: 'Python', category: 'Languages', proficiency: 'Intermediate' },
    { skillName: 'SQL', category: 'Languages', proficiency: 'Intermediate' },
    { skillName: 'Git & GitHub', category: 'Core & Architecture', proficiency: 'Intermediate' }
  ]);

  const [customSkillInput, setCustomSkillInput] = useState('');
  const [customSkillProficiency, setCustomSkillProficiency] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');

  // Project details
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDesc, setProjectDesc] = useState('');

  useEffect(() => {
    async function loadTaxonomy() {
      try {
        const [occRes, skRes] = await Promise.all([
          api.getOccupations(),
          api.getSkills()
        ]);
        setOccupations(occRes.occupations);
        if (occRes.occupations.length > 0) {
          setTargetOccupationId(occRes.occupations[0].id);
        }
        setAvailableSkills(skRes.skills);
      } catch (e) {
        console.error('Failed to load taxonomy:', e);
      }
    }
    if (isOpen) {
      loadTaxonomy();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Preset quick fill templates for rapid judge evaluation
  const handleApplyPreset = (presetType: 'backend' | 'fullstack' | 'ml') => {
    if (presetType === 'backend') {
      setName('Deepak Joshi');
      setEmail(`deepak.joshi.${Date.now().toString().slice(-4)}@nie.ac.in`);
      setPhone('+91 98111 55667');
      setInstitution('National Institute of Engineering');
      setDegree('B.E in Computer Science & Engineering');
      setDepartment('Computer Science');
      setGraduationYear(2026);
      setCgpa(8.9);
      setLocation('Bengaluru');
      setTargetOccupationId('occ-backend-dev');
      setSelectedSkills([
        { skillName: 'Python', category: 'Languages', proficiency: 'Advanced' },
        { skillName: 'SQL', category: 'Languages', proficiency: 'Advanced' },
        { skillName: 'PostgreSQL', category: 'Database', proficiency: 'Intermediate' },
        { skillName: 'FastAPI', category: 'Backend', proficiency: 'Intermediate' },
        { skillName: 'Git & GitHub', category: 'Core & Architecture', proficiency: 'Intermediate' }
      ]);
      setProjectTitle('High-Throughput UPI Settlement Service');
      setProjectDesc('Engineered an asynchronous microservice with FastAPI and PostgreSQL handling 300+ transactions per second.');
    } else if (presetType === 'fullstack') {
      setName('Meera Krishnan');
      setEmail(`meera.krishnan.${Date.now().toString().slice(-4)}@iitd.ac.in`);
      setPhone('+91 97222 66778');
      setInstitution('Indian Institute of Technology Delhi');
      setDegree('B.Tech in Computer Science');
      setDepartment('Computer Science');
      setGraduationYear(2026);
      setCgpa(9.1);
      setLocation('Bengaluru / Remote');
      setTargetOccupationId('occ-fullstack');
      setSelectedSkills([
        { skillName: 'JavaScript', category: 'Languages', proficiency: 'Advanced' },
        { skillName: 'TypeScript', category: 'Languages', proficiency: 'Intermediate' },
        { skillName: 'React', category: 'Frontend', proficiency: 'Advanced' },
        { skillName: 'Node.js', category: 'Backend', proficiency: 'Intermediate' },
        { skillName: 'Tailwind CSS', category: 'Frontend', proficiency: 'Advanced' },
        { skillName: 'Git & GitHub', category: 'Core & Architecture', proficiency: 'Advanced' }
      ]);
      setProjectTitle('Collaborative Real-Time Workspace');
      setProjectDesc('Built an interactive canvas application using React, TypeScript, and WebSockets.');
    } else {
      setName('Siddharth Sen');
      setEmail(`siddharth.sen.${Date.now().toString().slice(-4)}@nie.ac.in`);
      setPhone('+91 96333 77889');
      setInstitution('National Institute of Engineering');
      setDegree('B.Tech in Artificial Intelligence & Data');
      setDepartment('Data Science');
      setGraduationYear(2026);
      setCgpa(8.4);
      setLocation('Hyderabad');
      setTargetOccupationId('occ-ml-engineer');
      setSelectedSkills([
        { skillName: 'Python', category: 'Languages', proficiency: 'Advanced' },
        { skillName: 'Pandas', category: 'AI & Data', proficiency: 'Advanced' },
        { skillName: 'NumPy', category: 'AI & Data', proficiency: 'Advanced' },
        { skillName: 'Scikit-Learn', category: 'AI & Data', proficiency: 'Intermediate' },
        { skillName: 'PyTorch', category: 'AI & Data', proficiency: 'Intermediate' },
        { skillName: 'SQL', category: 'Languages', proficiency: 'Intermediate' }
      ]);
      setProjectTitle('Predictive Attrition Pipeline');
      setProjectDesc('Trained and evaluated classification models on tabular corporate telemetry data using PyTorch and Scikit-Learn.');
    }
  };

  const handleAddSkillFromDropdown = (skillId: string) => {
    const found = availableSkills.find(s => s.id === skillId);
    if (!found) return;
    if (selectedSkills.some(s => s.skillName.toLowerCase() === found.name.toLowerCase())) return;

    setSelectedSkills(prev => [
      ...prev,
      {
        skillName: found.name,
        category: found.category,
        proficiency: customSkillProficiency
      }
    ]);
  };

  const handleAddCustomSkill = () => {
    if (!customSkillInput.trim()) return;
    if (selectedSkills.some(s => s.skillName.toLowerCase() === customSkillInput.trim().toLowerCase())) return;

    setSelectedSkills(prev => [
      ...prev,
      {
        skillName: customSkillInput.trim(),
        category: 'Core & Architecture',
        proficiency: customSkillProficiency
      }
    ]);
    setCustomSkillInput('');
  };

  const handleRemoveSkill = (index: number) => {
    setSelectedSkills(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMsg('Please provide candidate name and email address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const projects = projectTitle.trim() ? [
        {
          id: `proj-${Date.now()}`,
          title: projectTitle.trim(),
          description: projectDesc.trim() || 'Core software engineering project.',
          technologies: selectedSkills.slice(0, 3).map(s => s.skillName)
        }
      ] : [];

      const res = await api.createStudent({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        institution: institution.trim(),
        degree: degree.trim(),
        department: department.trim(),
        graduationYear: Number(graduationYear),
        cgpa: Number(cgpa),
        location: location.trim(),
        targetOccupationId,
        initialSkills: selectedSkills,
        projects,
        setActive: true
      });

      setSuccessMsg(`Student "${res.student.name}" successfully registered and set as active candidate!`);
      setTimeout(() => {
        if (onStudentCreated) {
          onStudentCreated(res.student);
        }
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to register student.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="text-xs text-indigo-400 font-medium">
              <span>Student Registry Engine</span>
              <span className="mx-2">·</span>
              <span>Classroom to Career</span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
              <UserPlus className="w-5 h-5 text-indigo-400" />
              <span>Enter New Student Data</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Add a new engineering student profile into Career Ladder to evaluate skill-gap analysis, personal roadmaps, and career matching.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick 1-Click Preset Buttons */}
        <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Quick-Fill Sample Profiles (Optional 1-Click):</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleApplyPreset('backend')}
              className="px-3 py-1.5 bg-slate-900 hover:bg-indigo-950/60 text-slate-300 hover:text-indigo-200 rounded-lg border border-slate-800 hover:border-indigo-800 transition-colors"
            >
              Deepak Joshi (Backend Dev)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('fullstack')}
              className="px-3 py-1.5 bg-slate-900 hover:bg-indigo-950/60 text-slate-300 hover:text-indigo-200 rounded-lg border border-slate-800 hover:border-indigo-800 transition-colors"
            >
              Meera Krishnan (Full-Stack)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('ml')}
              className="px-3 py-1.5 bg-slate-900 hover:bg-indigo-950/60 text-slate-300 hover:text-indigo-200 rounded-lg border border-slate-800 hover:border-indigo-800 transition-colors"
            >
              Siddharth Sen (ML Engineer)
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-rose-950/40 border border-rose-900/60 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-900/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Section 1: Candidate Identity */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
              1. Candidate Credentials
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Rohit Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g., rohit.s@campus.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Preferred Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Academic Record */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <h3 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
              2. Academic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1">College / Institution *</label>
                <input
                  type="text"
                  required
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Degree Program</label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Computer Science">Computer Science & Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics">Electronics & Communication</option>
                  <option value="Data Science">Data Science & AI</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Graduation Year</label>
                <input
                  type="number"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Cumulative CGPA (out of 10)</label>
                <input
                  type="number"
                  step="0.05"
                  value={cgpa}
                  onChange={(e) => setCgpa(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Target Career Objective */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <h3 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
              3. Career Target Objective
            </h3>
            <div>
              <label className="block text-slate-400 mb-1">Target Technical Occupation</label>
              <select
                value={targetOccupationId}
                onChange={(e) => setTargetOccupationId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500 font-medium"
              >
                {occupations.map(occ => (
                  <option key={occ.id} value={occ.id} className="bg-slate-900 text-white">
                    {occ.title} ({occ.medianSalaryINR})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                The skill-gap engine will calculate match scores and missing deficits against this benchmark.
              </p>
            </div>
          </div>

          {/* Section 4: Initial Technical Skills */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
                4. Initial Skills Acquired ({selectedSkills.length})
              </h3>
              <span className="text-[11px] text-slate-500">Self-reported / prior coursework</span>
            </div>

            {/* Selected Skills Pills */}
            <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
              {selectedSkills.length === 0 ? (
                <span className="text-slate-500 text-xs italic">No skills added yet. Select from below.</span>
              ) : (
                selectedSkills.map((sk, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-slate-200"
                  >
                    <span className="font-medium">{sk.skillName}</span>
                    <span className="text-[10px] text-indigo-400 font-mono">({sk.proficiency})</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(idx)}
                      className="text-slate-500 hover:text-rose-400 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Quick Add from Taxonomy Dropdown */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddSkillFromDropdown(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none"
                defaultValue=""
              >
                <option value="" disabled>+ Add from standard taxonomy...</option>
                {availableSkills.map(sk => (
                  <option key={sk.id} value={sk.id}>
                    {sk.name} ({sk.category})
                  </option>
                ))}
              </select>

              <select
                value={customSkillProficiency}
                onChange={(e) => setCustomSkillProficiency(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>

              <div className="flex items-center gap-1 flex-1 min-w-[150px]">
                <input
                  type="text"
                  placeholder="Or type custom skill..."
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomSkill();
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSkill}
                  className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Section 5: Optional Featured Project */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <h3 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
              5. Featured Project (Optional)
            </h3>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Project Title (e.g. Campus Delivery Backend)"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white placeholder-slate-600"
              />
              <textarea
                rows={2}
                placeholder="Short technical description of the project"
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white placeholder-slate-600 resize-none"
              />
            </div>
          </div>

          {/* Footer Submit Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <div className="text-[11px] text-slate-400">
              New student will be saved and selected as active.
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg shadow-md transition-colors flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isSubmitting ? 'Registering Student...' : 'Save & Enter Student'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
