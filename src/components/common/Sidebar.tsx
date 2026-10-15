import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Sparkles,
  FileText,
  Boxes,
  MapPin,
  CheckCircle,
  Briefcase,
  History,
  UserCircle,
  Building2,
  GraduationCap,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  onResetData?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  collapsed,
  setCollapsed,
  onResetData
}) => {
  const { user } = useAuth();
  const role = user?.role || 'student';

  const studentNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'skill-gap', label: 'Skill-Gap Engine', icon: Sparkles },
    { id: 'resume', label: 'Resume Parser', icon: FileText },
    { id: 'inventory', label: 'Skill Inventory', icon: Boxes },
    { id: 'roadmap', label: 'Learning Roadmap', icon: MapPin },
    { id: 'assessments', label: 'Skill Assessments', icon: CheckCircle },
    { id: 'jobs', label: 'Jobs & Internships', icon: Briefcase },
    { id: 'applications', label: 'My Applications', icon: History },
    { id: 'profile', label: 'Student Profile', icon: UserCircle }
  ];

  const industryNavItems = [
    { id: 'industry', label: 'Company Overview', icon: Building2 },
    { id: 'industry-jobs', label: 'Manage Listings', icon: Briefcase },
    { id: 'industry-applicants', label: 'Candidate Pipeline', icon: UserCircle }
  ];

  const institutionNavItems = [
    { id: 'institution', label: 'Institutional Analytics', icon: GraduationCap },
    { id: 'institution-curriculum', label: 'Curriculum Gaps', icon: Boxes },
    { id: 'institution-departments', label: 'Department Coverage', icon: LayoutDashboard }
  ];

  const adminNavItems = [
    { id: 'admin', label: 'System Overview', icon: Shield },
    { id: 'admin-users', label: 'User Directory', icon: UserCircle },
    { id: 'admin-skills', label: 'Skill Taxonomy', icon: Boxes }
  ];

  let currentItems = studentNavItems;
  if (role === 'industry') currentItems = industryNavItems;
  if (role === 'institution') currentItems = institutionNavItems;
  if (role === 'admin') currentItems = adminNavItems;

  const handleReset = async () => {
    if (confirm('Reset Career Ladder seed data to original state?')) {
      await api.resetDemoData();
      if (onResetData) onResetData();
      window.location.reload();
    }
  };

  return (
    <aside
      className={`relative bg-slate-950 border-r border-slate-800 transition-all duration-200 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Role Indicator Banner */}
      <div className="px-4 py-3.5 border-b border-slate-800/80 flex items-center justify-between">
        {!collapsed && (
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Workspace
            </span>
            <div className="text-xs font-semibold text-white capitalize flex items-center gap-1.5">
              <span>{role} Portal</span>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {currentItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User Info & Demo Utilities */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
            <img
              src={user?.avatarUrl}
              alt={user?.name || 'User'}
              className="w-7 h-7 rounded-full object-cover shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-200 truncate">{user?.name}</div>
              <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
            </div>
          </div>
        )}

        {/* Demo reset button */}
        <button
          onClick={handleReset}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 text-xs font-medium border border-transparent hover:border-rose-900/40 transition-colors"
          title="Reset Demo Database"
        >
          <RefreshCw className="w-3.5 h-3.5 shrink-0" />
          {!collapsed && <span>Reset Demo Data</span>}
        </button>
      </div>
    </aside>
  );
};
