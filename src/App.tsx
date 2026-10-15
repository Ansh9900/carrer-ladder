import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { LandingPage } from './components/landing/LandingPage';
import { StudentDashboard } from './components/student/StudentDashboard';
import { SkillGapAnalyzer } from './components/student/SkillGapAnalyzer';
import { ResumeAnalyzer } from './components/student/ResumeAnalyzer';
import { SkillInventory } from './components/student/SkillInventory';
import { RoadmapView } from './components/student/RoadmapView';
import { AssessmentModule } from './components/student/AssessmentModule';
import { JobDiscovery } from './components/student/JobDiscovery';
import { ApplicationHistory } from './components/student/ApplicationHistory';
import { ProfileView } from './components/student/ProfileView';
import { IndustryDashboard } from './components/industry/IndustryDashboard';
import { InstitutionDashboard } from './components/institution/InstitutionDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { NewStudentModal } from './components/common/NewStudentModal';

function MainApp() {
  const { user, loading, refreshUser } = useAuth();
  const [activeView, setActiveView] = useState('landing');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [assessmentSkillId, setAssessmentSkillId] = useState<string | undefined>(undefined);
  const [isNewStudentModalOpen, setIsNewStudentModalOpen] = useState(false);
  const [modalInstitution, setModalInstitution] = useState<string | undefined>(undefined);

  const handleOpenNewStudentModal = (institutionName?: string) => {
    setModalInstitution(institutionName);
    setIsNewStudentModalOpen(true);
  };

  const handleCloseNewStudentModal = () => {
    setIsNewStudentModalOpen(false);
  };

  const handleStudentCreated = async () => {
    await refreshUser();
    setActiveView('dashboard');
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-indigo-400 font-mono text-sm">
        Initializing Career Ladder Platform...
      </div>
    );
  }

  // Public Landing Page view
  if (activeView === 'landing') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Header activeView="landing" setActiveView={setActiveView} isLanding={true} />
        <LandingPage
          onLaunchApp={() => setActiveView('dashboard')}
          onExploreRole={(role) => setActiveView('skill-gap')}
        />
      </div>
    );
  }

  // Determine which component to render based on active view and user role
  const renderContent = () => {
    // If user is industry role and clicks general views, route to industry console
    if (user?.role === 'industry') {
      return <IndustryDashboard />;
    }

    // If user is institution role
    if (user?.role === 'institution') {
      return <InstitutionDashboard onOpenNewStudentModal={handleOpenNewStudentModal} />;
    }

    // If user is admin role
    if (user?.role === 'admin') {
      return <AdminDashboard onOpenNewStudentModal={() => handleOpenNewStudentModal()} />;
    }

    // Default: Student role views
    switch (activeView) {
      case 'dashboard':
        return <StudentDashboard onNavigate={setActiveView} onOpenNewStudentModal={() => handleOpenNewStudentModal()} />;
      case 'skill-gap':
        return <SkillGapAnalyzer onNavigateToRoadmap={() => setActiveView('roadmap')} />;
      case 'resume':
        return <ResumeAnalyzer onSavedSkills={() => setActiveView('inventory')} />;
      case 'inventory':
        return (
          <SkillInventory
            onTakeAssessment={(skillId) => {
              setAssessmentSkillId(skillId);
              setActiveView('assessments');
            }}
          />
        );
      case 'roadmap':
        return <RoadmapView />;
      case 'assessments':
        return (
          <AssessmentModule
            initialSkillId={assessmentSkillId}
            onCompleted={() => setAssessmentSkillId(undefined)}
          />
        );
      case 'jobs':
        return (
          <JobDiscovery
            onApplied={() => setActiveView('applications')}
            onNavigateToRoadmap={() => setActiveView('roadmap')}
          />
        );
      case 'applications':
        return <ApplicationHistory onExploreJobs={() => setActiveView('jobs')} />;
      case 'profile':
        return <ProfileView onOpenNewStudentModal={() => handleOpenNewStudentModal()} />;
      case 'industry':
      case 'industry-jobs':
      case 'industry-applicants':
        return <IndustryDashboard />;
      case 'institution':
      case 'institution-curriculum':
      case 'institution-departments':
        return <InstitutionDashboard onOpenNewStudentModal={handleOpenNewStudentModal} />;
      case 'admin':
      case 'admin-users':
      case 'admin-skills':
        return <AdminDashboard onOpenNewStudentModal={() => handleOpenNewStudentModal()} />;
      default:
        return <StudentDashboard onNavigate={setActiveView} onOpenNewStudentModal={() => handleOpenNewStudentModal()} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        isLanding={false}
        onOpenNewStudentModal={() => handleOpenNewStudentModal()}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        <main className="flex-1 overflow-y-auto bg-slate-950/50">
          {renderContent()}
        </main>
      </div>

      {/* Enter New Student Data Modal */}
      <NewStudentModal
        isOpen={isNewStudentModalOpen}
        onClose={handleCloseNewStudentModal}
        onStudentCreated={handleStudentCreated}
        initialInstitution={modalInstitution}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
