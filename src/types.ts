export type UserRole = 'student' | 'industry' | 'institution' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl: string;
  institutionId?: string;
  companyId?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: 'Languages' | 'Frontend' | 'Backend' | 'Database' | 'Cloud & DevOps' | 'AI & Data' | 'Core & Architecture' | 'Soft Skills';
  description: string;
  aliases: string[];
  demandLevel: 'Very High' | 'High' | 'Medium';
}

export interface StudentSkill {
  skillId: string;
  skillName: string;
  category: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Not Assessed';
  verified: boolean;
  source: 'Resume' | 'Assessment' | 'Project' | 'Self';
  confidenceScore?: number;
  extractedFromText?: string;
  verifiedScore?: number;
}

export interface StudentProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  institution: string;
  degree: string;
  department: string;
  graduationYear: number;
  cgpa: number;
  location: string;
  targetOccupationId: string;
  skills: StudentSkill[];
  projects: Array<{
    id: string;
    title: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    year: number;
  }>;
  completedRoadmapStepIds: string[];
}

export interface Occupation {
  id: string;
  title: string;
  category: string;
  overview: string;
  medianSalaryINR: string;
  growthRate: string;
  openingsCount: number;
  requiredSkills: Array<{ skillId: string; skillName: string; weight: number }>;
  preferredSkills: Array<{ skillId: string; skillName: string; weight: number }>;
  bridgeSkills: Record<string, string[]>;
}

export interface SkillGapAnalysis {
  targetOccupation: Occupation;
  requiredCoveragePct: number;
  preferredCoveragePct: number;
  overallReadinessScore: number;
  matchedRequired: Array<{ skillId: string; skillName: string; weight: number; proficiency: string; verified: boolean }>;
  missingRequired: Array<{ skillId: string; skillName: string; weight: number; priority: 'High' | 'Critical' }>;
  matchedPreferred: Array<{ skillId: string; skillName: string; weight: number }>;
  missingPreferred: Array<{ skillId: string; skillName: string; weight: number; priority: 'Medium' }>;
  bridgeConnections: Array<{
    currentSkill: string;
    bridgesTo: string;
    reason: string;
  }>;
  aiGuidance: {
    executiveSummary: string;
    strategicSteps: string[];
    portfolioProjects: string[];
    estimatedWeeksToReadiness: number;
  };
  calculationFormula: {
    formulaText: string;
    requiredCoverageFormula: string;
    preferredCoverageFormula: string;
  };
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface RoadmapModule {
  skillName: string;
  type: 'Required' | 'Preferred';
  priority: 'High' | 'Critical' | 'Medium';
  steps: RoadmapStep[];
  progressPct: number;
  resources: Array<{
    id: string;
    skillId: string;
    skillName: string;
    title: string;
    provider: string;
    type: string;
    url: string;
    durationHours: number;
    isFree: boolean;
    difficulty: string;
    projectIdea: string;
  }>;
}

export interface RoadmapData {
  targetOccupation: string;
  overallRoadmapProgress: number;
  totalSteps: number;
  totalCompleted: number;
  modules: RoadmapModule[];
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface AssessmentInfo {
  id: string;
  skillId: string;
  skillName: string;
  category: string;
  durationMinutes: number;
  passingScore: number;
  questionCount: number;
}

export interface AssessmentSubmissionResult {
  score: number;
  passed: boolean;
  correctCount: number;
  totalQuestions: number;
  passingScore: number;
  feedback: Array<{
    id: string;
    question: string;
    chosenIndex?: number;
    correctIndex: number;
    isCorrect: boolean;
    explanation: string;
  }>;
}

export interface JobListing {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  title: string;
  type: 'Full-time' | 'Internship';
  location: string;
  remoteType: 'On-site' | 'Hybrid' | 'Remote';
  stipendOrSalary: string;
  experienceLevel: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  deadline: string;
  postedAt: string;
  matchScore: number;
  matchedSkills: string[];
  missingRequired: string[];
  applied?: boolean;
  applicationStatus?: string;
}

export interface StudentApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  location: string;
  stipendOrSalary: string;
  appliedAt: string;
  status: 'Applied' | 'Reviewing' | 'Shortlisted' | 'Rejected' | 'Offered';
  matchScore: number;
  matchedSkills: string[];
  missingRequired: string[];
  notes?: string;
}

export interface CompanyApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  jobRequiredSkills: string[];
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentDegree: string;
  studentInstitution: string;
  studentCgpa: number;
  studentSkills: StudentSkill[];
  appliedAt: string;
  status: 'Applied' | 'Reviewing' | 'Shortlisted' | 'Rejected' | 'Offered';
  matchScore: number;
  matchedSkills: string[];
  missingRequired: string[];
  notes?: string;
}

export interface InstitutionAnalytics {
  institutionName: string;
  totalStudents: number;
  avgReadinessScore: number;
  departmentDistribution: Array<{ department: string; count: number; avgReadiness: number }>;
  topIdentifiedSkills: Array<{ skill: string; count: number; percentage: number }>;
  topMissingSkills: Array<{ skill: string; deficitCount: number; targetRole: string }>;
  curriculumGaps: Array<{
    area: string;
    gapDescription: string;
    recommendedAddition: string;
    industryDemandImpact: 'High' | 'Critical';
  }>;
}

export interface ParsedResumeResponse {
  name?: string;
  email?: string;
  phone?: string;
  institution?: string;
  degree?: string;
  department?: string;
  graduationYear?: number;
  cgpa?: number;
  summary: string;
  extractedSkills: Array<{
    canonicalName: string;
    originalPhrase: string;
    category: string;
    proficiency: 'Beginner' | 'Intermediate' | 'Advanced';
    confidenceScore: number;
    evidenceText: string;
  }>;
  projects: Array<{
    title: string;
    description: string;
    technologies: string[];
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    year: number;
  }>;
  parsingMethod: string;
}
