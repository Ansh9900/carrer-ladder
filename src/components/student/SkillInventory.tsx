import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StudentSkill, Skill } from '../../types';
import {
  Boxes,
  Search,
  Filter,
  Plus,
  Trash2,
  Award,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Check
} from 'lucide-react';

interface SkillInventoryProps {
  onTakeAssessment?: (skillId: string) => void;
}

export const SkillInventory: React.FC<SkillInventoryProps> = ({ onTakeAssessment }) => {
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [taxonomy, setTaxonomy] = useState<Skill[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Add skill state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTaxonomySkillId, setSelectedTaxonomySkillId] = useState('');
  const [newProficiency, setNewProficiency] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');

  const categories = [
    'All',
    'Languages',
    'Frontend',
    'Backend',
    'Database',
    'Cloud & DevOps',
    'AI & Data',
    'Core & Architecture',
    'Soft Skills'
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const [skRes, taxRes] = await Promise.all([
        api.getStudentSkills(),
        api.getSkills()
      ]);
      setSkills(skRes.skills);
      setTaxonomy(taxRes.skills);
      if (taxRes.skills.length > 0) {
        setSelectedTaxonomySkillId(taxRes.skills[0].id);
      }
    } catch (e) {
      console.error('Failed to load inventory:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateProficiency = async (skillId: string, prof: string) => {
    try {
      const res = await api.updateStudentSkill(skillId, { proficiency: prof });
      setSkills(res.skills);
    } catch (e) {
      console.error('Failed to update proficiency:', e);
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    if (confirm('Remove this skill from your active inventory?')) {
      try {
        const res = await api.removeStudentSkill(skillId);
        setSkills(res.skills);
      } catch (e) {
        console.error('Failed to remove skill:', e);
      }
    }
  };

  const handleAddSkill = async () => {
    if (!selectedTaxonomySkillId) return;
    try {
      const res = await api.addStudentSkill(selectedTaxonomySkillId, newProficiency, 'Self');
      setSkills(res.skills);
      setShowAddModal(false);
    } catch (e) {
      console.error('Failed to add skill:', e);
    }
  };

  const filteredSkills = skills.filter(s => {
    const matchesCategory = selectedCategory === 'All' || s.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = !searchQuery || s.skillName.toLowerCase().includes(searchQuery.toLowerCase()) || s.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="text-xs text-indigo-400 font-medium">
            <span>Portfolio Competencies</span>
            <span className="mx-2">·</span>
            <span>Verified Knowledge Base</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-display">
            Active Skill Inventory
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Manage your acquired competencies, update proficiencies, and verify capabilities.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors flex items-center gap-2 whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Skill</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Categories Tab strip */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Inventory Grid */}
      {filteredSkills.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl p-8 space-y-3">
          <Boxes className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No skills match the selected filter</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try choosing a different category or add new skills from the taxonomy.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map(skill => (
            <div
              key={skill.skillId}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      {skill.category}
                    </span>
                    <h3 className="text-base font-semibold text-white">{skill.skillName}</h3>
                  </div>

                  {skill.verified ? (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-900/60 px-2 py-0.5 rounded-full">
                      <Award className="w-3 h-3" />
                      <span>Score: {skill.verifiedScore}%</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium">
                      Source: {skill.source}
                    </span>
                  )}
                </div>

                {skill.extractedFromText && (
                  <p className="text-xs text-slate-400 italic bg-slate-950/60 p-2 rounded-lg border border-slate-800/60 mb-3">
                    "{skill.extractedFromText}"
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">Level:</span>
                  <select
                    value={skill.proficiency}
                    onChange={(e) => handleUpdateProficiency(skill.skillId, e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  {!skill.verified && onTakeAssessment && (
                    <button
                      onClick={() => onTakeAssessment(skill.skillId)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      Verify
                    </button>
                  )}
                  <button
                    onClick={() => handleRemoveSkill(skill.skillId)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                    title="Remove Skill"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Skill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Add Skill to Inventory</h3>
            <p className="text-xs text-slate-400">
              Select an industry-standard skill from the canonical taxonomy and set your initial proficiency.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Select Skill</label>
                <select
                  value={selectedTaxonomySkillId}
                  onChange={(e) => setSelectedTaxonomySkillId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                >
                  {taxonomy.map(t => (
                    <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                      {t.name} ({t.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Estimated Proficiency</label>
                <select
                  value={newProficiency}
                  onChange={(e) => setNewProficiency(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Beginner">Beginner (Basic understanding)</option>
                  <option value="Intermediate">Intermediate (Used in projects)</option>
                  <option value="Advanced">Advanced (Production mastery)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSkill}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                Add Skill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
