import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Compass, GraduationCap, Building2, School, ShieldCheck, UserPlus } from 'lucide-react';

interface HeaderProps {
  activeView: string;
  setActiveView: (view: string) => void;
  isLanding?: boolean;
  onOpenNewStudentModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeView, setActiveView, isLanding, onOpenNewStudentModal }) => {
  const { user, switchRole } = useAuth();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    switchRole(e.target.value as UserRole);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-3.5">
        {/* Zone 1: Brand Wordmark (Single line, display face) */}
        <button
          onClick={() => setActiveView(isLanding ? 'landing' : 'dashboard')}
          className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 group focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20 group-hover:bg-indigo-500 transition-colors">
            CL
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white font-display">
              Career Ladder
            </span>
          </div>
        </button>

        {/* Zone 2: 4-5 Concise Navigation Links (whitespace-nowrap shrink-0) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          {isLanding ? (
            <>
              <button
                onClick={() => setActiveView('landing')}
                className="hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                Overview
              </button>
              <a
                href="#features"
                className="hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                Capabilities
              </a>
              <a
                href="#workflow"
                className="hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                Workflow
              </a>
              <a
                href="#ecosystem"
                className="hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                Ecosystem
              </a>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveView('dashboard')}
                className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                  activeView === 'dashboard' ? 'text-indigo-400 font-semibold' : ''
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveView('skill-gap')}
                className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                  activeView === 'skill-gap' ? 'text-indigo-400 font-semibold' : ''
                }`}
              >
                Skill Gap
              </button>
              <button
                onClick={() => setActiveView('roadmap')}
                className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                  activeView === 'roadmap' ? 'text-indigo-400 font-semibold' : ''
                }`}
              >
                Roadmap
              </button>
              <button
                onClick={() => setActiveView('jobs')}
                className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                  activeView === 'jobs' ? 'text-indigo-400 font-semibold' : ''
                }`}
              >
                Marketplace
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Primary Action + Demo Persona Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Quick Demo Persona Switcher for Judges */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs">
            <span className="text-slate-400 hidden sm:inline">Role:</span>
            <select
              value={user?.role || 'student'}
              onChange={handleRoleChange}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="student" className="bg-slate-900 text-slate-100">Student (Aanya)</option>
              <option value="industry" className="bg-slate-900 text-slate-100">Industry (InnovateTech)</option>
              <option value="institution" className="bg-slate-900 text-slate-100">Institution (NIE Dean)</option>
              <option value="admin" className="bg-slate-900 text-slate-100">System Admin</option>
            </select>
          </div>

          {!isLanding && onOpenNewStudentModal && (
            <button
              onClick={onOpenNewStudentModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700/80 hover:bg-slate-800 hover:border-slate-600 rounded-lg transition-colors whitespace-nowrap shrink-0"
              title="Enter New Student Data"
            >
              <UserPlus className="w-3.5 h-3.5 text-indigo-400" />
              <span>+ New Student</span>
            </button>
          )}

          {isLanding ? (
            <button
              onClick={() => setActiveView('dashboard')}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-sm whitespace-nowrap shrink-0"
            >
              Launch Platform
            </button>
          ) : (
            <button
              onClick={() => setActiveView('resume')}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-sm whitespace-nowrap shrink-0"
            >
              Analyze Resume
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
