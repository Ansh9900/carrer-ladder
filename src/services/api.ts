import {
  User,
  Skill,
  Occupation,
  StudentProfile,
  StudentSkill,
  SkillGapAnalysis,
  RoadmapData,
  AssessmentInfo,
  AssessmentSubmissionResult,
  JobListing,
  StudentApplication,
  CompanyApplication,
  InstitutionAnalytics,
  ParsedResumeResponse
} from '../types';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    }
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth & Persona
  getCurrentUser: () => fetchJSON<{ user: User }>('/api/auth/me'),
  switchDemoRole: (role: string) => fetchJSON<{ success: boolean; user: User }>('/api/auth/switch-demo', {
    method: 'POST',
    body: JSON.stringify({ role })
  }),

  // Skills Taxonomy
  getSkills: (category?: string, query?: string) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (query) params.append('query', query);
    return fetchJSON<{ skills: Skill[] }>(`/api/skills?${params.toString()}`);
  },

  // Occupations
  getOccupations: () => fetchJSON<{ occupations: Occupation[] }>('/api/occupations'),
  getOccupation: (id: string) => fetchJSON<{ occupation: Occupation }>(`/api/occupations/${id}`),

  // Students Management
  getStudents: () => fetchJSON<{ students: StudentProfile[] }>('/api/students'),
  createStudent: (studentData: any) => fetchJSON<{ success: boolean; student: StudentProfile; user: User; message?: string }>('/api/students', {
    method: 'POST',
    body: JSON.stringify(studentData)
  }),
  switchActiveStudent: (studentId: string) => fetchJSON<{ success: boolean; student: StudentProfile; user: User }>('/api/students/switch-active', {
    method: 'POST',
    body: JSON.stringify({ studentId })
  }),

  // Student Profile
  getStudentProfile: () => fetchJSON<{ student: StudentProfile }>('/api/student/profile'),
  updateStudentProfile: (updates: Partial<StudentProfile>) => fetchJSON<{ success: boolean; student: StudentProfile }>('/api/student/profile', {
    method: 'PUT',
    body: JSON.stringify(updates)
  }),

  // Student Skills Inventory
  getStudentSkills: () => fetchJSON<{ skills: StudentSkill[] }>('/api/student/skills'),
  addStudentSkill: (skillId: string, proficiency?: string, source?: string) => fetchJSON<{ success: boolean; skills: StudentSkill[] }>('/api/student/skills', {
    method: 'POST',
    body: JSON.stringify({ skillId, proficiency, source })
  }),
  updateStudentSkill: (skillId: string, data: { proficiency?: string; verified?: boolean }) => fetchJSON<{ success: boolean; skills: StudentSkill[] }>(`/api/student/skills/${skillId}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  removeStudentSkill: (skillId: string) => fetchJSON<{ success: boolean; skills: StudentSkill[] }>(`/api/student/skills/${skillId}`, {
    method: 'DELETE'
  }),
  batchSaveSkills: (skills: any[]) => fetchJSON<{ success: boolean; skills: StudentSkill[] }>('/api/student/skills/batch', {
    method: 'POST',
    body: JSON.stringify({ skills })
  }),

  // Resume Parsing
  parseResume: (resumeText: string) => fetchJSON<{ result: ParsedResumeResponse }>('/api/resume/parse', {
    method: 'POST',
    body: JSON.stringify({ resumeText })
  }),

  // Skill Gap Analysis
  getSkillGap: (occupationId?: string) => {
    const url = occupationId ? `/api/student/skill-gap?occupationId=${occupationId}` : '/api/student/skill-gap';
    return fetchJSON<SkillGapAnalysis>(url);
  },

  // Roadmap
  getRoadmap: () => fetchJSON<RoadmapData>('/api/student/roadmap'),
  toggleRoadmapStep: (stepId: string) => fetchJSON<{ success: boolean; completedIds: string[] }>('/api/student/roadmap/toggle', {
    method: 'POST',
    body: JSON.stringify({ stepId })
  }),

  // Assessments
  getAssessments: () => fetchJSON<{ assessments: AssessmentInfo[] }>('/api/assessments'),
  getAssessmentDetails: (id: string) => fetchJSON<{ assessment: any }>(`/api/assessments/${id}`),
  submitAssessment: (id: string, answers: Record<string, number>) => fetchJSON<AssessmentSubmissionResult>(`/api/assessments/${id}/submit`, {
    method: 'POST',
    body: JSON.stringify({ answers })
  }),

  // Jobs
  getJobs: (params?: { query?: string; type?: string; location?: string }) => {
    const q = new URLSearchParams();
    if (params?.query) q.append('query', params.query);
    if (params?.type) q.append('type', params.type);
    if (params?.location) q.append('location', params.location);
    return fetchJSON<{ jobs: JobListing[] }>(`/api/jobs?${q.toString()}`);
  },
  createJob: (jobData: any) => fetchJSON<{ success: boolean; job: JobListing }>('/api/jobs', {
    method: 'POST',
    body: JSON.stringify(jobData)
  }),

  // Applications
  applyForJob: (jobId: string, notes?: string) => fetchJSON<{ success: boolean; application: any }>('/api/applications', {
    method: 'POST',
    body: JSON.stringify({ jobId, notes })
  }),
  getStudentApplications: () => fetchJSON<{ applications: StudentApplication[] }>('/api/applications/student'),
  getCompanyApplications: () => fetchJSON<{ applications: CompanyApplication[]; companyJobs: any[] }>('/api/applications/company'),
  updateApplicationStatus: (id: string, status: string, notes?: string) => fetchJSON<{ success: boolean }>(`/api/applications/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, notes })
  }),

  // Institution Analytics
  getInstitutionAnalytics: () => fetchJSON<InstitutionAnalytics>('/api/institution/analytics'),

  // Admin
  getAdminOverview: () => fetchJSON<any>('/api/admin/overview'),
  resetDemoData: () => fetchJSON<{ success: boolean; message: string }>('/api/demo/reset', {
    method: 'POST'
  })
};
