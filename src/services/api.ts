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

export interface DashboardSummaryResponse {
  student: StudentProfile;
  allStudents: StudentProfile[];
  gapData: SkillGapAnalysis;
  jobs: JobListing[];
  applications: StudentApplication[];
  roadmap: RoadmapData;
}

// In-memory client cache with TTL to eliminate repeat loading states across navigation
const clientCache = new Map<string, { timestamp: number; data: any }>();
const DEFAULT_CACHE_TTL = 45 * 1000; // 45 seconds

export function clearClientCache(keySubstr?: string) {
  if (!keySubstr) {
    clientCache.clear();
  } else {
    for (const key of Array.from(clientCache.keys())) {
      if (key.includes(keySubstr)) {
        clientCache.delete(key);
      }
    }
  }
}

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

async function fetchCached<T>(url: string, ttl = DEFAULT_CACHE_TTL): Promise<T> {
  const cached = clientCache.get(url);
  if (cached && (Date.now() - cached.timestamp < ttl)) {
    return cached.data;
  }
  const data = await fetchJSON<T>(url);
  clientCache.set(url, { timestamp: Date.now(), data });
  return data;
}

export const api = {
  // Auth & Persona
  getCurrentUser: () => fetchCached<{ user: User }>('/api/auth/me', 60000),
  switchDemoRole: async (role: string) => {
    clearClientCache();
    return fetchJSON<{ success: boolean; user: User }>('/api/auth/switch-demo', {
      method: 'POST',
      body: JSON.stringify({ role })
    });
  },

  // Skills Taxonomy
  getSkills: (category?: string, query?: string) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (query) params.append('query', query);
    const url = `/api/skills?${params.toString()}`;
    return fetchCached<{ skills: Skill[] }>(url, 120000);
  },

  // Occupations
  getOccupations: () => fetchCached<{ occupations: Occupation[] }>('/api/occupations', 300000),
  getOccupation: (id: string) => fetchCached<{ occupation: Occupation }>(`/api/occupations/${id}`, 300000),

  // Unified Dashboard Summary (Single-flight query replacing 6 separate requests)
  getDashboardSummary: () => fetchCached<DashboardSummaryResponse>('/api/student/dashboard-summary', 30000),

  // Students Management
  getStudents: () => fetchCached<{ students: StudentProfile[] }>('/api/students', 30000),
  createStudent: async (studentData: any) => {
    clearClientCache();
    return fetchJSON<{ success: boolean; student: StudentProfile; user: User; message?: string }>('/api/students', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
  },
  switchActiveStudent: async (studentId: string) => {
    clearClientCache();
    return fetchJSON<{ success: boolean; student: StudentProfile; user: User }>('/api/students/switch-active', {
      method: 'POST',
      body: JSON.stringify({ studentId })
    });
  },

  // Student Profile
  getStudentProfile: () => fetchCached<{ student: StudentProfile }>('/api/student/profile', 30000),
  updateStudentProfile: async (updates: Partial<StudentProfile>) => {
    clearClientCache('student');
    return fetchJSON<{ success: boolean; student: StudentProfile }>('/api/student/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  // Student Skills Inventory
  getStudentSkills: () => fetchCached<{ skills: StudentSkill[] }>('/api/student/skills', 30000),
  addStudentSkill: async (skillId: string, proficiency?: string, source?: string) => {
    clearClientCache('student');
    return fetchJSON<{ success: boolean; skills: StudentSkill[] }>('/api/student/skills', {
      method: 'POST',
      body: JSON.stringify({ skillId, proficiency, source })
    });
  },
  updateStudentSkill: async (skillId: string, data: { proficiency?: string; verified?: boolean }) => {
    clearClientCache('student');
    return fetchJSON<{ success: boolean; skills: StudentSkill[] }>(`/api/student/skills/${skillId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  removeStudentSkill: async (skillId: string) => {
    clearClientCache('student');
    return fetchJSON<{ success: boolean; skills: StudentSkill[] }>(`/api/student/skills/${skillId}`, {
      method: 'DELETE'
    });
  },
  batchSaveSkills: async (skills: any[]) => {
    clearClientCache('student');
    return fetchJSON<{ success: boolean; skills: StudentSkill[] }>('/api/student/skills/batch', {
      method: 'POST',
      body: JSON.stringify({ skills })
    });
  },

  // Resume Parsing
  parseResume: (resumeText: string) => fetchJSON<{ result: ParsedResumeResponse }>('/api/resume/parse', {
    method: 'POST',
    body: JSON.stringify({ resumeText })
  }),

  // Skill Gap Analysis
  getSkillGap: (occupationId?: string) => {
    const url = occupationId ? `/api/student/skill-gap?occupationId=${occupationId}` : '/api/student/skill-gap';
    return fetchCached<SkillGapAnalysis>(url, 45000);
  },

  // Roadmap
  getRoadmap: () => fetchCached<RoadmapData>('/api/student/roadmap', 45000),
  toggleRoadmapStep: async (stepId: string) => {
    clearClientCache('roadmap');
    clearClientCache('dashboard-summary');
    return fetchJSON<{ success: boolean; completedIds: string[] }>('/api/student/roadmap/toggle', {
      method: 'POST',
      body: JSON.stringify({ stepId })
    });
  },

  // Assessments
  getAssessments: () => fetchCached<{ assessments: AssessmentInfo[] }>('/api/assessments', 120000),
  getAssessmentDetails: (id: string) => fetchCached<{ assessment: any }>(`/api/assessments/${id}`, 120000),
  submitAssessment: async (id: string, answers: Record<string, number>) => {
    clearClientCache();
    return fetchJSON<AssessmentSubmissionResult>(`/api/assessments/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers })
    });
  },

  // Jobs
  getJobs: (params?: { query?: string; type?: string; location?: string }) => {
    const q = new URLSearchParams();
    if (params?.query) q.append('query', params.query);
    if (params?.type) q.append('type', params.type);
    if (params?.location) q.append('location', params.location);
    const url = `/api/jobs?${q.toString()}`;
    return fetchCached<{ jobs: JobListing[] }>(url, 30000);
  },
  createJob: async (jobData: any) => {
    clearClientCache('jobs');
    return fetchJSON<{ success: boolean; job: JobListing }>('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData)
    });
  },

  // Applications
  applyForJob: async (jobId: string, notes?: string) => {
    clearClientCache('applications');
    clearClientCache('dashboard-summary');
    clearClientCache('jobs');
    return fetchJSON<{ success: boolean; application: any }>('/api/applications', {
      method: 'POST',
      body: JSON.stringify({ jobId, notes })
    });
  },
  getStudentApplications: () => fetchCached<{ applications: StudentApplication[] }>('/api/applications/student', 30000),
  getCompanyApplications: () => fetchCached<{ applications: CompanyApplication[]; companyJobs: any[] }>('/api/applications/company', 30000),
  updateApplicationStatus: async (id: string, status: string, notes?: string) => {
    clearClientCache('applications');
    return fetchJSON<{ success: boolean }>(`/api/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes })
    });
  },

  // Institution Analytics
  getInstitutionAnalytics: () => fetchCached<InstitutionAnalytics>('/api/institution/analytics', 60000),

  // Admin
  getAdminOverview: () => fetchCached<any>('/api/admin/overview', 30000),
  resetDemoData: async () => {
    clearClientCache();
    return fetchJSON<{ success: boolean; message: string }>('/api/demo/reset', {
      method: 'POST'
    });
  }
};
