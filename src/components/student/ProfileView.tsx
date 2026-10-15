import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StudentProfile, Occupation } from '../../types';
import { UserCircle, Save, CheckCircle2, Plus, Trash2, Award, Briefcase, GraduationCap, UserPlus } from 'lucide-react';

interface ProfileViewProps {
  onOpenNewStudentModal?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onOpenNewStudentModal }) => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [occupations, setOccupations] = useState<Occupation[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(true);

  // New project state
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectTech, setNewProjectTech] = useState('');

  // New certification state
  const [newCertName, setNewCertName] = useState('');
  const [newCertIssuer, setNewCertIssuer] = useState('');
  const [newCertYear, setNewCertYear] = useState(2025);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [profRes, occRes] = await Promise.all([
          api.getStudentProfile(),
          api.getOccupations()
        ]);
        setProfile(profRes.student);
        setOccupations(occRes.occupations);
      } catch (e) {
        console.error('Failed to load profile:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSaving(true);
    setSuccessMsg('');

    try {
      await api.updateStudentProfile(profile);
      setSuccessMsg('Profile successfully updated and persisted!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e) {
      console.error('Failed to save profile:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddProject = () => {
    if (!newProjectTitle.trim() || !profile) return;
    const newProj = {
      id: `proj-${Date.now()}`,
      title: newProjectTitle.trim(),
      description: newProjectDesc.trim(),
      technologies: newProjectTech.split(',').map(t => t.trim()).filter(Boolean)
    };
    setProfile({
      ...profile,
      projects: [...(profile.projects || []), newProj]
    });
    setNewProjectTitle('');
    setNewProjectDesc('');
    setNewProjectTech('');
  };

  const handleRemoveProject = (id: string) => {
    if (!profile) return;
    setProfile({
      ...profile,
      projects: profile.projects.filter(p => p.id !== id)
    });
  };

  const handleAddCertification = () => {
    if (!newCertName.trim() || !profile) return;
    const newCert = {
      id: `cert-${Date.now()}`,
      name: newCertName.trim(),
      issuer: newCertIssuer.trim() || 'Coursera / Industry',
      year: Number(newCertYear) || 2025
    };
    setProfile({
      ...profile,
      certifications: [...(profile.certifications || []), newCert]
    });
    setNewCertName('');
    setNewCertIssuer('');
  };

  const handleRemoveCertification = (id: string) => {
    if (!profile) return;
    setProfile({
      ...profile,
      certifications: profile.certifications.filter(c => c.id !== id)
    });
  };

  if (loading || !profile) {
    return (
      <div className="p-8 space-y-4 animate-pulse max-w-4xl mx-auto">
        <div className="h-28 bg-slate-900 rounded-2xl"></div>
        <div className="h-96 bg-slate-900 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800 flex items-center justify-between">
        <div>
          <div className="text-xs text-indigo-400 font-medium">
            <span>Academic & Career Identity</span>
            <span className="mx-2">·</span>
            <span>Persistent Data Profile</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-display">
            Student Profile
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Update personal information, degree details, target occupation, projects, and certifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onOpenNewStudentModal && (
            <button
              type="button"
              onClick={onOpenNewStudentModal}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4 text-indigo-400" />
              <span>+ Register New Student</span>
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-900/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Credentials */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white">Basic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Phone Number</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Preferred Location</label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Academic Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white">Academic Qualifications</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Institution / University</label>
              <input
                type="text"
                value={profile.institution}
                onChange={(e) => setProfile({ ...profile, institution: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Degree Program</label>
              <input
                type="text"
                value={profile.degree}
                onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Graduation Year</label>
              <input
                type="number"
                value={profile.graduationYear}
                onChange={(e) => setProfile({ ...profile, graduationYear: parseInt(e.target.value) || 2026 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Cumulative CGPA (out of 10)</label>
              <input
                type="number"
                step="0.01"
                value={profile.cgpa}
                onChange={(e) => setProfile({ ...profile, cgpa: parseFloat(e.target.value) || 8.0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Target Career Selection */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
          <h3 className="text-sm font-semibold text-white">Primary Career Objective</h3>
          <p className="text-xs text-slate-400">
            Selecting your target career automatically recomputes missing skill gaps and customizes your personalized learning roadmap.
          </p>

          <select
            value={profile.targetOccupationId}
            onChange={(e) => setProfile({ ...profile, targetOccupationId: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            {occupations.map(occ => (
              <option key={occ.id} value={occ.id} className="bg-slate-900 text-white">
                {occ.title} ({occ.medianSalaryINR})
              </option>
            ))}
          </select>
        </div>

        {/* Technical Projects */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white">Featured Portfolio Projects</h3>

          <div className="space-y-3">
            {profile.projects?.map(proj => (
              <div key={proj.id} className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg flex items-start justify-between gap-3">
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold text-white">{proj.title}</h4>
                  <p className="text-slate-300 leading-relaxed">{proj.description}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.technologies?.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[11px] text-indigo-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveProject(proj.id)}
                  className="text-slate-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add project form */}
          <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-lg space-y-3 text-xs">
            <span className="font-semibold text-slate-300 block">Add New Project</span>
            <input
              type="text"
              placeholder="Project Title"
              value={newProjectTitle}
              onChange={(e) => setNewProjectTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
            />
            <textarea
              rows={2}
              placeholder="Brief project description and technical achievements"
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
            />
            <input
              type="text"
              placeholder="Technologies used (comma separated, e.g. Python, SQL, Docker)"
              value={newProjectTech}
              onChange={(e) => setNewProjectTech(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
            />
            <button
              type="button"
              onClick={handleAddProject}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium border border-slate-700 transition-colors"
            >
              Add Project to Portfolio
            </button>
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white">External Certifications</h3>

          <div className="space-y-2">
            {profile.certifications?.map(cert => (
              <div key={cert.id} className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white">{cert.name}</span>
                  <span className="text-slate-400 ml-2">· {cert.issuer} ({cert.year})</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveCertification(cert.id)}
                  className="text-slate-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <input
              type="text"
              placeholder="Certificate Name"
              value={newCertName}
              onChange={(e) => setNewCertName(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-white flex-1 min-w-[200px]"
            />
            <input
              type="text"
              placeholder="Issuer (e.g. Meta, AWS, Coursera)"
              value={newCertIssuer}
              onChange={(e) => setNewCertIssuer(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
            />
            <button
              type="button"
              onClick={handleAddCertification}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium border border-slate-700"
            >
              Add Certification
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
