import express from 'express';
import { db, StudentProfile, JobApplication, User, StudentSkill } from './db';
import { parseResumeWithAI, generateSkillGapGuidance } from './ai';

export const apiRouter = express.Router();

// Active session state (in memory for current user session, defaults to Aanya Sharma student)
let currentUserId = 'usr-student-1';

// --- HEALTH CHECK ---
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// --- AUTH & DEMO SWITCH ---
apiRouter.get('/auth/me', (req, res) => {
  const store = db.get();
  let user = store.users.find(u => u.id === currentUserId);
  if (!user) {
    // currentUserId may point to a student that no longer has a User record — heal it
    const student = store.students.find(s => s.userId === currentUserId) || store.students[0];
    if (student) {
      user = ensureUserForStudent(student);
      currentUserId = user.id;
    } else {
      user = store.users[0];
    }
  }
  res.json({ user });
});

apiRouter.post('/auth/switch-demo', (req, res) => {
  const { role } = req.body;
  const store = db.get();
  const targetUser = store.users.find(u => u.role === role);
  if (!targetUser) {
    return res.status(400).json({ error: `No demo user found for role: ${role}` });
  }
  currentUserId = targetUser.id;
  res.json({ success: true, user: targetUser });
});

apiRouter.post('/auth/login', (req, res) => {
  const { email } = req.body;
  const store = db.get();
  const user = store.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase().trim());
  if (user) {
    currentUserId = user.id;
    return res.json({ success: true, user });
  }
  return res.status(404).json({ error: 'User not found' });
});

// --- SKILLS TAXONOMY ---
apiRouter.get('/skills', (req, res) => {
  const { query, category } = req.query;
  let skills = db.get().skills;

  if (category && typeof category === 'string' && category !== 'All') {
    skills = skills.filter(s => s.category.toLowerCase() === category.toLowerCase());
  }

  if (query && typeof query === 'string' && query.trim()) {
    const q = query.toLowerCase();
    skills = skills.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.aliases.some(a => a.toLowerCase().includes(q)) ||
      s.description.toLowerCase().includes(q)
    );
  }

  res.json({ skills });
});

// --- OCCUPATIONS ---
apiRouter.get('/occupations', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=120, stale-while-revalidate=600');
  const occupations = db.get().occupations;
  res.json({ occupations });
});

apiRouter.get('/occupations/:id', (req, res) => {
  const occ = db.get().occupations.find(o => o.id === req.params.id);
  if (!occ) return res.status(404).json({ error: 'Occupation not found' });
  res.json({ occupation: occ });
});

// --- RESUME PARSING ---
apiRouter.post('/resume/parse', async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText || typeof resumeText !== 'string' || !resumeText.trim()) {
      return res.status(400).json({ error: 'Please provide resume text content' });
    }

    const parsed = await parseResumeWithAI(resumeText);
    res.json({ result: parsed });
  } catch (err: any) {
    console.error('Resume parse error:', err);
    res.status(500).json({ error: err.message || 'Failed to parse resume' });
  }
});

// Ensure a User record exists for a StudentProfile (repairs missing user rows after delete/reset)
function ensureUserForStudent(student: StudentProfile): User {
  const store = db.get();
  let user = store.users.find(u => u.id === student.userId);
  if (!user) {
    user = {
      id: student.userId,
      email: student.email,
      name: student.name,
      role: 'student',
      avatarUrl: '/src/assets/images/avatar_student_lead_1792012204911.jpg',
      institutionId: student.institution
    };
    db.update(s => { s.users.push(user!); });
  }
  return user;
}

// Helper to get active student
function getActiveStudent(): StudentProfile {
  const store = db.get();
  const student = store.students.find(s => s.userId === currentUserId);
  if (student) return student;
  // Fallback: pick first student and heal currentUserId
  const fallback = store.students[0];
  if (fallback) currentUserId = fallback.userId;
  return fallback;
}

// --- STUDENTS REGISTRATION & MANAGEMENT ---
apiRouter.get('/students', (req, res) => {
  const store = db.get();
  res.json({ students: store.students });
});

apiRouter.post('/students', (req, res) => {
  const {
    name,
    email,
    phone,
    institution,
    degree,
    department,
    graduationYear,
    cgpa,
    location,
    targetOccupationId,
    initialSkills,
    projects,
    certifications,
    setActive = true
  } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Student full name and email are required.' });
  }

  const store = db.get();
  const existingStudent = store.students.find(s => s.email.toLowerCase() === email.trim().toLowerCase());
  if (existingStudent) {
    if (setActive) {
      currentUserId = existingStudent.userId;
    }
    return res.json({ success: true, student: existingStudent, message: 'Student with this email already exists and is now selected.' });
  }

  const userId = `usr-student-${Date.now()}`;
  const studentId = `std-${Date.now()}`;

  const newUser: User = {
    id: userId,
    email: email.trim(),
    name: name.trim(),
    role: 'student',
    avatarUrl: '/src/assets/images/avatar_student_lead_1792012204911.jpg',
    institutionId: institution || 'IIT Delhi'
  };

  // Map initial skills against canonical taxonomy or create cleanly
  const formattedSkills: StudentSkill[] = [];
  if (Array.isArray(initialSkills)) {
    for (const sk of initialSkills) {
      const skillName = typeof sk === 'string' ? sk : sk.skillName;
      if (!skillName || !skillName.trim()) continue;
      const skillDef = store.skills.find(s => s.id === sk.skillId || s.name.toLowerCase() === skillName.toLowerCase());
      formattedSkills.push({
        skillId: skillDef ? skillDef.id : `sk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        skillName: skillDef ? skillDef.name : skillName.trim(),
        category: skillDef ? skillDef.category : (sk.category || 'Languages'),
        proficiency: (typeof sk === 'object' && sk.proficiency) || 'Intermediate',
        verified: false,
        source: 'Self',
        confidenceScore: 0.9
      });
    }
  }

  const newStudent: StudentProfile = {
    id: studentId,
    userId,
    name: name.trim(),
    email: email.trim(),
    phone: phone?.trim() || '+91 98000 00000',
    institution: institution?.trim() || 'Indian Institute of Technology Delhi',
    degree: degree?.trim() || 'B.Tech in Computer Science & Engineering',
    department: department?.trim() || 'Computer Science',
    graduationYear: Number(graduationYear) || 2026,
    cgpa: Number(cgpa) || 8.5,
    location: location?.trim() || 'Bengaluru / Hybrid',
    targetOccupationId: targetOccupationId || store.occupations[0]?.id || 'occ-backend-dev',
    skills: formattedSkills,
    projects: Array.isArray(projects) ? projects : [],
    certifications: Array.isArray(certifications) ? certifications : [],
    completedRoadmapStepIds: []
  };

  db.update(s => {
    s.users.push(newUser);
    s.students.push(newStudent);
  });

  if (setActive) {
    currentUserId = userId;
  }

  res.json({ success: true, student: newStudent, user: newUser });
});

apiRouter.post('/students/switch-active', (req, res) => {
  const { studentId, userId } = req.body;
  const store = db.get();
  const targetStudent = store.students.find(s => s.id === studentId || s.userId === userId);
  if (!targetStudent) {
    return res.status(404).json({ error: 'Student profile not found.' });
  }
  currentUserId = targetStudent.userId;
  invalidateStudentCaches(targetStudent.id);
  const targetUser = ensureUserForStudent(targetStudent);
  res.json({ success: true, student: targetStudent, user: targetUser });
});

// Delete candidate profile by ID
apiRouter.delete('/students/:id', (req, res) => {
  const { id } = req.params;
  const store = db.get();

  if (store.students.length <= 1) {
    return res.status(400).json({
      error: 'Cannot delete the only remaining candidate profile. At least one candidate profile must exist in the system.'
    });
  }

  const targetStudent = store.students.find(s => s.id === id || s.userId === id);
  if (!targetStudent) {
    return res.status(404).json({ error: 'Candidate profile not found.' });
  }

  const targetUserId = targetStudent.userId;
  // Pick next student BEFORE we remove the target
  const nextStudent = store.students.find(s => s.id !== targetStudent.id);

  db.update(s => {
    s.students = s.students.filter(st => st.id !== targetStudent.id);
    s.users = s.users.filter(u => u.id !== targetUserId);
    s.applications = s.applications.filter(a => a.studentId !== targetStudent.id);
    s.assessmentResults = s.assessmentResults.filter(r => r.studentId !== targetStudent.id);
  });

  invalidateStudentCaches(targetStudent.id);

  // Always switch active session to next student
  let activeStudent = nextStudent || db.get().students[0];
  let activeUser: User;
  if (activeStudent) {
    currentUserId = activeStudent.userId;
    activeUser = ensureUserForStudent(activeStudent);
    invalidateStudentCaches(activeStudent.id);
  } else {
    activeUser = db.get().users[0];
  }

  res.json({
    success: true,
    message: `Candidate profile for "${targetStudent.name}" has been deleted. Now viewing ${activeStudent?.name || 'next candidate'}.`,
    activeStudent,
    user: activeUser,
    remainingStudentsCount: db.get().students.length
  });
});

// --- STUDENT PROFILE ---
apiRouter.get('/student/profile', (req, res) => {
  const student = getActiveStudent();
  res.json({ student });
});

apiRouter.delete('/student/profile', (req, res) => {
  const activeStudent = getActiveStudent();
  const store = db.get();

  if (store.students.length <= 1) {
    return res.status(400).json({
      error: 'Cannot delete the only remaining candidate profile. At least one candidate profile must exist in the system.'
    });
  }

  const targetUserId = activeStudent.userId;
  // Pick next student BEFORE deletion
  const nextStudent = store.students.find(s => s.id !== activeStudent.id);

  db.update(s => {
    s.students = s.students.filter(st => st.id !== activeStudent.id);
    s.users = s.users.filter(u => u.id !== targetUserId);
    s.applications = s.applications.filter(a => a.studentId !== activeStudent.id);
    s.assessmentResults = s.assessmentResults.filter(r => r.studentId !== activeStudent.id);
  });

  invalidateStudentCaches(activeStudent.id);

  let newActive = nextStudent || db.get().students[0];
  let activeUser: User;
  if (newActive) {
    currentUserId = newActive.userId;
    activeUser = ensureUserForStudent(newActive);
    invalidateStudentCaches(newActive.id);
  } else {
    activeUser = db.get().users[0];
  }

  res.json({
    success: true,
    message: `Candidate profile for "${activeStudent.name}" has been deleted. Now viewing ${newActive?.name || 'next candidate'}.`,
    activeStudent: newActive,
    user: activeUser,
    remainingStudentsCount: db.get().students.length
  });
});

apiRouter.put('/student/profile', (req, res) => {
  const activeStudent = getActiveStudent();
  const updates = req.body;

  db.update(store => {
    const idx = store.students.findIndex(s => s.id === activeStudent.id);
    if (idx !== -1) {
      store.students[idx] = {
        ...store.students[idx],
        ...updates,
        id: store.students[idx].id,
        userId: store.students[idx].userId,
        skills: updates.skills || store.students[idx].skills
      };
    }
  });

  invalidateStudentCaches(activeStudent.id);
  res.json({ success: true, student: getActiveStudent() });
});

// --- STUDENT SKILL INVENTORY ---
apiRouter.get('/student/skills', (req, res) => {
  const student = getActiveStudent();
  res.json({ skills: student.skills });
});

apiRouter.post('/student/skills', (req, res) => {
  const { skillId, proficiency, source } = req.body;
  const store = db.get();
  const skillDef = store.skills.find(s => s.id === skillId || s.name.toLowerCase() === (skillId || '').toLowerCase());
  
  if (!skillDef) {
    return res.status(400).json({ error: 'Unknown skill' });
  }

  const activeStudent = getActiveStudent();
  db.update(s => {
    const st = s.students.find(x => x.id === activeStudent.id);
    if (!st) return;

    const existingIdx = st.skills.findIndex(sk => sk.skillId === skillDef.id);
    if (existingIdx !== -1) {
      st.skills[existingIdx].proficiency = proficiency || st.skills[existingIdx].proficiency;
      st.skills[existingIdx].source = source || st.skills[existingIdx].source;
    } else {
      st.skills.push({
        skillId: skillDef.id,
        skillName: skillDef.name,
        category: skillDef.category,
        proficiency: proficiency || 'Intermediate',
        verified: false,
        source: source || 'Self',
        confidenceScore: 0.90
      });
    }
  });

  invalidateStudentCaches(activeStudent.id);
  res.json({ success: true, skills: getActiveStudent().skills });
});

apiRouter.put('/student/skills/:skillId', (req, res) => {
  const { skillId } = req.params;
  const { proficiency, verified } = req.body;
  const activeStudent = getActiveStudent();

  db.update(s => {
    const st = s.students.find(x => x.id === activeStudent.id);
    if (!st) return;
    const item = st.skills.find(sk => sk.skillId === skillId);
    if (item) {
      if (proficiency) item.proficiency = proficiency;
      if (verified !== undefined) item.verified = verified;
    }
  });

  invalidateStudentCaches(activeStudent.id);
  res.json({ success: true, skills: getActiveStudent().skills });
});

apiRouter.delete('/student/skills/:skillId', (req, res) => {
  const { skillId } = req.params;
  const activeStudent = getActiveStudent();

  db.update(s => {
    const st = s.students.find(x => x.id === activeStudent.id);
    if (!st) return;
    st.skills = st.skills.filter(sk => sk.skillId !== skillId);
  });

  invalidateStudentCaches(activeStudent.id);
  res.json({ success: true, skills: getActiveStudent().skills });
});

// Batch save skills (e.g. from resume parser review)
apiRouter.post('/student/skills/batch', (req, res) => {
  const { skills: newSkills } = req.body;
  if (!Array.isArray(newSkills)) {
    return res.status(400).json({ error: 'Expected skills array' });
  }

  const activeStudent = getActiveStudent();
  db.update(s => {
    const st = s.students.find(x => x.id === activeStudent.id);
    if (!st) return;

    for (const item of newSkills) {
      const existing = st.skills.find(sk => sk.skillName.toLowerCase() === item.skillName.toLowerCase());
      if (existing) {
        existing.proficiency = item.proficiency || existing.proficiency;
        existing.source = item.source || existing.source;
        if (item.extractedFromText) existing.extractedFromText = item.extractedFromText;
      } else {
        st.skills.push({
          skillId: item.skillId || `sk-custom-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          skillName: item.skillName,
          category: item.category || 'Core & Architecture',
          proficiency: item.proficiency || 'Intermediate',
          verified: false,
          source: item.source || 'Resume',
          confidenceScore: item.confidenceScore || 0.85,
          extractedFromText: item.extractedFromText
        });
      }
    }
  });

  invalidateStudentCaches(activeStudent.id);
  res.json({ success: true, skills: getActiveStudent().skills });
});

// --- SKILL-GAP ENGINE & CACHING ---
interface CachedSkillGap {
  timestamp: number;
  data: any;
}

const skillGapCache = new Map<string, CachedSkillGap>();
const SKILL_GAP_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function invalidateStudentCaches(studentId?: string) {
  if (!studentId) {
    skillGapCache.clear();
  } else {
    for (const key of Array.from(skillGapCache.keys())) {
      if (key.startsWith(`${studentId}::`)) {
        skillGapCache.delete(key);
      }
    }
  }
}

export async function computeSkillGap(studentId?: string, occupationIdInput?: string, forceFresh = false) {
  const store = db.get();
  const student = studentId
    ? store.students.find(s => s.id === studentId || s.userId === studentId) || getActiveStudent()
    : getActiveStudent();
  const occupationId = occupationIdInput || student.targetOccupationId || store.occupations[0].id;
  const occupation = store.occupations.find(o => o.id === occupationId) || store.occupations[0];

  const cacheKey = `${student.id}::${occupation.id}::${student.skills.map(s => `${s.skillId}:${s.verified}`).sort().join(',')}`;

  if (!forceFresh) {
    const cached = skillGapCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < SKILL_GAP_CACHE_TTL_MS)) {
      return cached.data;
    }
  }

  // Compute deterministic match
  const studentSkillNamesLower = new Set(student.skills.map(s => s.skillName.toLowerCase()));

  // Required skills coverage
  let matchedReqWeight = 0;
  let totalReqWeight = 0;
  const matchedRequired: Array<{ skillId: string; skillName: string; weight: number; proficiency: string; verified: boolean }> = [];
  const missingRequired: Array<{ skillId: string; skillName: string; weight: number; priority: 'High' | 'Critical' }> = [];

  for (const reqSkill of occupation.requiredSkills) {
    totalReqWeight += reqSkill.weight;
    const isMatched = studentSkillNamesLower.has(reqSkill.skillName.toLowerCase());
    if (isMatched) {
      matchedReqWeight += reqSkill.weight;
      const sObj = student.skills.find(s => s.skillName.toLowerCase() === reqSkill.skillName.toLowerCase());
      matchedRequired.push({
        ...reqSkill,
        proficiency: sObj?.proficiency || 'Intermediate',
        verified: sObj?.verified || false
      });
    } else {
      missingRequired.push({
        ...reqSkill,
        priority: reqSkill.weight >= 0.9 ? 'Critical' : 'High'
      });
    }
  }

  // Preferred skills coverage
  let matchedPrefWeight = 0;
  let totalPrefWeight = 0;
  const matchedPreferred: Array<{ skillId: string; skillName: string; weight: number }> = [];
  const missingPreferred: Array<{ skillId: string; skillName: string; weight: number; priority: 'Medium' }> = [];

  for (const prefSkill of occupation.preferredSkills) {
    totalPrefWeight += prefSkill.weight;
    const isMatched = studentSkillNamesLower.has(prefSkill.skillName.toLowerCase());
    if (isMatched) {
      matchedPrefWeight += prefSkill.weight;
      matchedPreferred.push(prefSkill);
    } else {
      missingPreferred.push({
        ...prefSkill,
        priority: 'Medium'
      });
    }
  }

  const requiredCoveragePct = totalReqWeight > 0 ? Math.round((matchedReqWeight / totalReqWeight) * 100) : 0;
  const preferredCoveragePct = totalPrefWeight > 0 ? Math.round((matchedPrefWeight / totalPrefWeight) * 100) : 0;
  const overallReadinessScore = Math.round((0.75 * requiredCoveragePct) + (0.25 * preferredCoveragePct));

  // Identify Bridge Skills
  const bridgeConnections: Array<{
    currentSkill: string;
    bridgesTo: string;
    reason: string;
  }> = [];

  if (occupation.bridgeSkills) {
    for (const [sourceSkillId, targetSkillIds] of Object.entries(occupation.bridgeSkills)) {
      const sourceSkill = store.skills.find(s => s.id === sourceSkillId);
      if (sourceSkill && studentSkillNamesLower.has(sourceSkill.name.toLowerCase())) {
        for (const targetId of targetSkillIds) {
          const targetSkill = store.skills.find(s => s.id === targetId);
          if (targetSkill && !studentSkillNamesLower.has(targetSkill.name.toLowerCase())) {
            bridgeConnections.push({
              currentSkill: sourceSkill.name,
              bridgesTo: targetSkill.name,
              reason: `Your foundation in ${sourceSkill.name} significantly reduces the learning curve for ${targetSkill.name}.`
            });
          }
        }
      }
    }
  }

  // AI Strategic Guidance (fast & cached, timeout protected)
  const aiGuidance = await generateSkillGapGuidance({
    targetOccupation: occupation.title,
    matchedSkills: matchedRequired.map(m => m.skillName),
    missingRequired: missingRequired.map(m => m.skillName),
    missingPreferred: missingPreferred.map(m => m.skillName),
    overallReadiness: overallReadinessScore
  });

  const result = {
    targetOccupation: occupation,
    requiredCoveragePct,
    preferredCoveragePct,
    overallReadinessScore,
    matchedRequired,
    missingRequired,
    matchedPreferred,
    missingPreferred,
    bridgeConnections,
    aiGuidance,
    calculationFormula: {
      formulaText: "Overall Readiness = (0.75 × Required Coverage) + (0.25 × Preferred Coverage)",
      requiredCoverageFormula: "Σ(Matched Required Weights) / Σ(Total Required Weights)",
      preferredCoverageFormula: "Σ(Matched Preferred Weights) / Σ(Total Preferred Weights)"
    }
  };

  skillGapCache.set(cacheKey, { timestamp: Date.now(), data: result });
  return result;
}

// Single-flight unified dashboard summary for near-instant rendering on free Render servers
apiRouter.get('/student/dashboard-summary', async (req, res) => {
  try {
    const store = db.get();
    const student = getActiveStudent();
    const studentSkillsLower = new Set(student.skills.map(s => s.skillName.toLowerCase()));

    // 1. Skill gap calculation
    const gapData = await computeSkillGap(student.id, student.targetOccupationId);

    // 2. Pre-calculated Top 3 matching jobs
    const enrichedJobs = store.jobs
      .filter(j => j.active)
      .map(job => {
        const matchedRequired = job.requiredSkills.filter(s => studentSkillsLower.has(s.toLowerCase()));
        const missingRequired = job.requiredSkills.filter(s => !studentSkillsLower.has(s.toLowerCase()));
        const matchedPreferred = job.preferredSkills.filter(s => studentSkillsLower.has(s.toLowerCase()));
        
        const reqScore = job.requiredSkills.length > 0 ? (matchedRequired.length / job.requiredSkills.length) * 80 : 80;
        const prefScore = job.preferredSkills.length > 0 ? (matchedPreferred.length / job.preferredSkills.length) * 20 : 20;
        const matchScore = Math.min(100, Math.round(reqScore + prefScore));
        const existingApp = store.applications.find(a => a.jobId === job.id && a.studentId === student.id);

        return {
          ...job,
          matchScore,
          matchedSkills: matchedRequired,
          missingRequired,
          applied: !!existingApp,
          applicationStatus: existingApp?.status
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);

    // 3. Student Applications
    const studentApps = store.applications
      .filter(a => a.studentId === student.id)
      .map(app => {
        const job = store.jobs.find(j => j.id === app.jobId);
        return {
          ...app,
          jobTitle: job?.title || 'Engineering Role',
          companyName: job?.companyName || 'Verified Partner',
          location: job?.location || 'Remote',
          stipendOrSalary: job?.stipendOrSalary || 'Competitive'
        };
      });

    // 4. Roadmap Data
    const occ = store.occupations.find(o => o.id === student.targetOccupationId) || store.occupations[0];
    const missing = [
      ...occ.requiredSkills.filter(r => !studentSkillsLower.has(r.skillName.toLowerCase())).map(r => ({ ...r, type: 'Required' as const })),
      ...occ.preferredSkills.filter(p => !studentSkillsLower.has(p.skillName.toLowerCase())).map(p => ({ ...p, type: 'Preferred' as const }))
    ];

    const roadmapModules = missing.map((item, index) => {
      const resources = store.learningResources.filter(r => r.skillName.toLowerCase() === item.skillName.toLowerCase());
      const stepIdPrefix = `step-${item.skillId || index}`;
      const steps = [
        {
          id: `${stepIdPrefix}-1`,
          title: `Core Architectural Concepts of ${item.skillName}`,
          description: `Understand why ${item.skillName} is essential for ${occ.title} and review official documentation and fundamentals.`,
          completed: student.completedRoadmapStepIds?.includes(`${stepIdPrefix}-1`) || false
        },
        {
          id: `${stepIdPrefix}-2`,
          title: `Hands-on Implementation & Local Lab`,
          description: `Implement real code patterns or container configurations solving a standalone technical exercise.`,
          completed: student.completedRoadmapStepIds?.includes(`${stepIdPrefix}-2`) || false
        },
        {
          id: `${stepIdPrefix}-3`,
          title: `Production Portfolio Project Integration`,
          description: resources[0]?.projectIdea || `Build and deploy a verifiable module showcasing ${item.skillName} on GitHub.`,
          completed: student.completedRoadmapStepIds?.includes(`${stepIdPrefix}-3`) || false
        }
      ];
      const completedCount = steps.filter(s => s.completed).length;
      return {
        skillName: item.skillName,
        type: item.type,
        priority: (item.weight >= 0.9 ? 'Critical' : item.weight >= 0.7 ? 'High' : 'Medium') as 'Critical' | 'High' | 'Medium',
        steps,
        progressPct: Math.round((completedCount / steps.length) * 100),
        resources
      };
    });

    const totalSteps = roadmapModules.reduce((acc, m) => acc + m.steps.length, 0);
    const totalCompleted = roadmapModules.reduce((acc, m) => acc + m.steps.filter(s => s.completed).length, 0);
    const overallRoadmapProgress = totalSteps > 0 ? Math.round((totalCompleted / totalSteps) * 100) : 0;

    const roadmapData = {
      targetOccupation: occ.title,
      overallRoadmapProgress,
      totalSteps,
      totalCompleted,
      modules: roadmapModules
    };

    res.json({
      student,
      allStudents: store.students,
      gapData,
      jobs: enrichedJobs,
      applications: studentApps,
      roadmap: roadmapData
    });
  } catch (err: any) {
    console.error('Dashboard summary error:', err);
    res.status(500).json({ error: err.message || 'Failed to load dashboard summary' });
  }
});

// Dedicated skill-gap endpoint (cached for sub-10ms response)
apiRouter.get('/student/skill-gap', async (req, res) => {
  try {
    const student = getActiveStudent();
    const occupationId = req.query.occupationId as string | undefined;
    const forceFresh = req.query.forceFresh === 'true';
    const result = await computeSkillGap(student.id, occupationId, forceFresh);
    res.json(result);
  } catch (err: any) {
    console.error('Skill gap calculation error:', err);
    res.status(500).json({ error: err.message || 'Failed to compute skill gap' });
  }
});

// --- ROADMAP & LEARNING RESOURCES ---
apiRouter.get('/student/roadmap', (req, res) => {
  const store = db.get();
  const student = getActiveStudent();
  const occ = store.occupations.find(o => o.id === student.targetOccupationId) || store.occupations[0];
  const studentSkillNamesLower = new Set(student.skills.map(s => s.skillName.toLowerCase()));

  // Missing skills for this occupation
  const missing = [
    ...occ.requiredSkills.filter(r => !studentSkillNamesLower.has(r.skillName.toLowerCase())).map(r => ({ ...r, type: 'Required' as const })),
    ...occ.preferredSkills.filter(p => !studentSkillNamesLower.has(p.skillName.toLowerCase())).map(p => ({ ...p, type: 'Preferred' as const }))
  ];

  // Map each missing skill to steps & learning resources
  const roadmapModules = missing.map((item, index) => {
    const resources = store.learningResources.filter(r => r.skillName.toLowerCase() === item.skillName.toLowerCase());
    const stepIdPrefix = `step-${item.skillId || index}`;
    
    const steps = [
      {
        id: `${stepIdPrefix}-1`,
        title: `Core Architectural Concepts of ${item.skillName}`,
        description: `Understand why ${item.skillName} is essential for ${occ.title} and review official documentation and fundamentals.`,
        completed: student.completedRoadmapStepIds?.includes(`${stepIdPrefix}-1`) || false
      },
      {
        id: `${stepIdPrefix}-2`,
        title: `Hands-on Implementation & Local Lab`,
        description: `Implement real code patterns or container configurations solving a standalone technical exercise.`,
        completed: student.completedRoadmapStepIds?.includes(`${stepIdPrefix}-2`) || false
      },
      {
        id: `${stepIdPrefix}-3`,
        title: `Production Portfolio Project Integration`,
        description: resources[0]?.projectIdea || `Build and deploy a verifiable module showcasing ${item.skillName} on GitHub.`,
        completed: student.completedRoadmapStepIds?.includes(`${stepIdPrefix}-3`) || false
      }
    ];

    const completedCount = steps.filter(s => s.completed).length;
    const progressPct = Math.round((completedCount / steps.length) * 100);

    return {
      skillName: item.skillName,
      type: item.type,
      priority: item.weight >= 0.9 ? 'Critical' : 'High',
      steps,
      progressPct,
      resources
    };
  });

  const totalSteps = roadmapModules.reduce((acc, m) => acc + m.steps.length, 0);
  const totalCompleted = roadmapModules.reduce((acc, m) => acc + m.steps.filter(s => s.completed).length, 0);
  const overallRoadmapProgress = totalSteps > 0 ? Math.round((totalCompleted / totalSteps) * 100) : 100;

  res.json({
    targetOccupation: occ.title,
    overallRoadmapProgress,
    totalSteps,
    totalCompleted,
    modules: roadmapModules
  });
});

apiRouter.post('/student/roadmap/toggle', (req, res) => {
  const { stepId } = req.body;
  if (!stepId) return res.status(400).json({ error: 'Missing stepId' });

  const activeStudent = getActiveStudent();
  db.update(s => {
    const st = s.students.find(x => x.id === activeStudent.id);
    if (!st) return;
    if (!st.completedRoadmapStepIds) st.completedRoadmapStepIds = [];

    if (st.completedRoadmapStepIds.includes(stepId)) {
      st.completedRoadmapStepIds = st.completedRoadmapStepIds.filter(id => id !== stepId);
    } else {
      st.completedRoadmapStepIds.push(stepId);
    }
  });

  res.json({ success: true, completedIds: getActiveStudent().completedRoadmapStepIds });
});

// --- ASSESSMENTS ---
apiRouter.get('/assessments', (req, res) => {
  const assessments = db.get().assessments.map(a => ({
    id: a.id,
    skillId: a.skillId,
    skillName: a.skillName,
    category: a.category,
    durationMinutes: a.durationMinutes,
    passingScore: a.passingScore,
    questionCount: a.questions.length
  }));
  res.json({ assessments });
});

apiRouter.get('/assessments/:id', (req, res) => {
  const asm = db.get().assessments.find(a => a.id === req.params.id);
  if (!asm) return res.status(404).json({ error: 'Assessment not found' });
  // Send questions without revealing the answers in client payload until submit
  const sanitized = {
    ...asm,
    questions: asm.questions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      difficulty: q.difficulty
    }))
  };
  res.json({ assessment: sanitized });
});

apiRouter.post('/assessments/:id/submit', (req, res) => {
  const { answers } = req.body; // Record<string, number>
  const store = db.get();
  const asm = store.assessments.find(a => a.id === req.params.id);
  if (!asm) return res.status(404).json({ error: 'Assessment not found' });

  let correctCount = 0;
  const questionFeedback: Array<{
    id: string;
    question: string;
    chosenIndex: number;
    correctIndex: number;
    isCorrect: boolean;
    explanation: string;
  }> = [];

  for (const q of asm.questions) {
    const chosen = answers ? answers[q.id] : undefined;
    const isCorrect = chosen === q.correctIndex;
    if (isCorrect) correctCount++;
    questionFeedback.push({
      id: q.id,
      question: q.question,
      chosenIndex: chosen,
      correctIndex: q.correctIndex,
      isCorrect,
      explanation: q.explanation
    });
  }

  const scorePct = Math.round((correctCount / asm.questions.length) * 100);
  const passed = scorePct >= asm.passingScore;
  const activeStudent = getActiveStudent();

  // Save result and verify skill
  db.update(s => {
    s.assessmentResults.push({
      id: `res-${Date.now()}`,
      studentId: activeStudent.id,
      skillId: asm.skillId,
      skillName: asm.skillName,
      score: scorePct,
      passed,
      takenAt: new Date().toISOString(),
      answers: answers || {}
    });

    if (passed) {
      const st = s.students.find(x => x.id === activeStudent.id);
      if (st) {
        const sk = st.skills.find(item => item.skillName.toLowerCase() === asm.skillName.toLowerCase());
        if (sk) {
          sk.verified = true;
          sk.verifiedScore = scorePct;
          sk.proficiency = scorePct >= 85 ? 'Advanced' : 'Intermediate';
          sk.source = 'Assessment';
        } else {
          st.skills.push({
            skillId: asm.skillId,
            skillName: asm.skillName,
            category: asm.category,
            proficiency: scorePct >= 85 ? 'Advanced' : 'Intermediate',
            verified: true,
            verifiedScore: scorePct,
            source: 'Assessment',
            confidenceScore: 0.98
          });
        }
      }
    }
  });

  invalidateStudentCaches(activeStudent.id);

  res.json({
    score: scorePct,
    passed,
    correctCount,
    totalQuestions: asm.questions.length,
    passingScore: asm.passingScore,
    feedback: questionFeedback
  });
});

// --- JOBS & INTERNSHIPS ---
apiRouter.get('/jobs', (req, res) => {
  const store = db.get();
  const student = getActiveStudent();
  const studentSkillsLower = new Set(student.skills.map(s => s.skillName.toLowerCase()));

  const { query, type, location } = req.query;
  let list = store.jobs.filter(j => j.active);

  if (type && typeof type === 'string' && type !== 'All') {
    list = list.filter(j => j.type.toLowerCase() === type.toLowerCase());
  }

  if (location && typeof location === 'string' && location !== 'All') {
    list = list.filter(j => j.remoteType.toLowerCase() === location.toLowerCase() || j.location.toLowerCase().includes(location.toLowerCase()));
  }

  if (query && typeof query === 'string' && query.trim()) {
    const q = query.toLowerCase();
    list = list.filter(j => 
      j.title.toLowerCase().includes(q) || 
      j.companyName.toLowerCase().includes(q) ||
      j.requiredSkills.some(s => s.toLowerCase().includes(q))
    );
  }

  // Calculate dynamic match score per job
  const enriched = list.map(job => {
    const matchedRequired = job.requiredSkills.filter(s => studentSkillsLower.has(s.toLowerCase()));
    const missingRequired = job.requiredSkills.filter(s => !studentSkillsLower.has(s.toLowerCase()));
    const matchedPreferred = job.preferredSkills.filter(s => studentSkillsLower.has(s.toLowerCase()));
    
    const reqScore = job.requiredSkills.length > 0 ? (matchedRequired.length / job.requiredSkills.length) * 80 : 80;
    const prefScore = job.preferredSkills.length > 0 ? (matchedPreferred.length / job.preferredSkills.length) * 20 : 20;
    const matchScore = Math.min(100, Math.round(reqScore + prefScore));

    const existingApp = store.applications.find(a => a.jobId === job.id && a.studentId === student.id);

    return {
      ...job,
      matchScore,
      matchedSkills: matchedRequired,
      missingRequired,
      applied: !!existingApp,
      applicationStatus: existingApp?.status
    };
  });

  // Sort by match score descending
  enriched.sort((a, b) => b.matchScore - a.matchScore);

  res.json({ jobs: enriched });
});

apiRouter.post('/jobs', (req, res) => {
  const { title, type, location, remoteType, stipendOrSalary, experienceLevel, description, requiredSkills, preferredSkills, deadline } = req.body;
  if (!title || !description || !requiredSkills || requiredSkills.length === 0) {
    return res.status(400).json({ error: 'Please provide job title, description, and at least one required skill.' });
  }

  const store = db.get();
  const currentUser = store.users.find(u => u.id === currentUserId);
  const companyName = currentUser?.role === 'industry' ? 'InnovateTech India' : 'Verified Partner Tech';

  const newJob: any = {
    id: `job-${Date.now()}`,
    companyId: currentUser?.companyId || 'comp-innovatetech',
    companyName,
    companyLogo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=128&auto=format&fit=crop&q=80',
    title,
    type: type || 'Full-time',
    location: location || 'Bengaluru',
    remoteType: remoteType || 'Hybrid',
    stipendOrSalary: stipendOrSalary || 'Competitive',
    experienceLevel: experienceLevel || 'Entry Level (0-1 yrs)',
    description,
    requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [requiredSkills],
    preferredSkills: Array.isArray(preferredSkills) ? preferredSkills : [],
    deadline: deadline || '2026-12-31',
    postedAt: new Date().toISOString().split('T')[0],
    active: true
  };

  db.update(s => {
    s.jobs.unshift(newJob);
  });

  res.json({ success: true, job: newJob });
});

// --- APPLICATIONS ---
apiRouter.post('/applications', (req, res) => {
  const { jobId, notes } = req.body;
  const store = db.get();
  const student = getActiveStudent();
  const job = store.jobs.find(j => j.id === jobId);

  if (!job) return res.status(404).json({ error: 'Job not found' });

  // Duplicate check
  const existing = store.applications.find(a => a.jobId === jobId && a.studentId === student.id);
  if (existing) {
    return res.status(400).json({ error: 'You have already applied to this position.' });
  }

  const studentSkillsLower = new Set(student.skills.map(s => s.skillName.toLowerCase()));
  const matchedRequired = job.requiredSkills.filter(s => studentSkillsLower.has(s.toLowerCase()));
  const missingRequired = job.requiredSkills.filter(s => !studentSkillsLower.has(s.toLowerCase()));
  const matchedPreferred = job.preferredSkills.filter(s => studentSkillsLower.has(s.toLowerCase()));

  const reqScore = job.requiredSkills.length > 0 ? (matchedRequired.length / job.requiredSkills.length) * 80 : 80;
  const prefScore = job.preferredSkills.length > 0 ? (matchedPreferred.length / job.preferredSkills.length) * 20 : 20;
  const matchScore = Math.min(100, Math.round(reqScore + prefScore));

  const application: JobApplication = {
    id: `app-${Date.now()}`,
    jobId,
    studentId: student.id,
    studentName: student.name,
    studentEmail: student.email,
    studentDegree: student.degree,
    studentInstitution: student.institution,
    appliedAt: new Date().toISOString(),
    status: 'Applied',
    matchScore,
    matchedSkills: matchedRequired,
    missingRequired,
    notes: notes || 'Direct submission via Career Ladder skill-verified profile'
  };

  db.update(s => {
    s.applications.unshift(application);
  });

  res.json({ success: true, application });
});

apiRouter.get('/applications/student', (req, res) => {
  const store = db.get();
  const student = getActiveStudent();
  const apps = store.applications.filter(a => a.studentId === student.id);

  const enriched = apps.map(app => {
    const job = store.jobs.find(j => j.id === app.jobId);
    return {
      ...app,
      jobTitle: job?.title || 'Software Engineering Role',
      companyName: job?.companyName || 'Technology Partner',
      location: job?.location || 'Bengaluru',
      stipendOrSalary: job?.stipendOrSalary
    };
  });

  res.json({ applications: enriched });
});

apiRouter.get('/applications/company', (req, res) => {
  const store = db.get();
  const currentUser = store.users.find(u => u.id === currentUserId);
  const companyJobs = store.jobs.filter(j => j.companyId === (currentUser?.companyId || 'comp-innovatetech'));
  const jobIds = new Set(companyJobs.map(j => j.id));

  const companyApps = store.applications.filter(a => jobIds.has(a.jobId));
  const enriched = companyApps.map(app => {
    const job = companyJobs.find(j => j.id === app.jobId);
    const student = store.students.find(s => s.id === app.studentId);
    return {
      ...app,
      jobTitle: job?.title || 'Unknown Role',
      jobRequiredSkills: job?.requiredSkills || [],
      studentCgpa: student?.cgpa || 8.5,
      studentSkills: student?.skills || []
    };
  });

  res.json({ applications: enriched, companyJobs });
});

apiRouter.patch('/applications/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  db.update(s => {
    const app = s.applications.find(a => a.id === id);
    if (app) {
      if (status) app.status = status;
      if (notes) app.notes = notes;
    }
  });

  res.json({ success: true });
});

// --- INSTITUTION ANALYTICS ---
apiRouter.get('/institution/analytics', (req, res) => {
  const store = db.get();
  const students = store.students;

  // Department distribution
  const deptMap: Record<string, { count: number; totalReadiness: number }> = {};
  const skillOccurrences: Record<string, number> = {};

  for (const st of students) {
    const dept = st.department || 'Computer Science';
    if (!deptMap[dept]) deptMap[dept] = { count: 0, totalReadiness: 0 };
    deptMap[dept].count += 1;

    // Approximate student readiness against their target role
    const occ = store.occupations.find(o => o.id === st.targetOccupationId) || store.occupations[0];
    const stSkillLower = new Set(st.skills.map(s => s.skillName.toLowerCase()));
    const matchedCount = occ.requiredSkills.filter(r => stSkillLower.has(r.skillName.toLowerCase())).length;
    const readiness = Math.round((matchedCount / Math.max(1, occ.requiredSkills.length)) * 100);
    deptMap[dept].totalReadiness += readiness;

    for (const sk of st.skills) {
      skillOccurrences[sk.skillName] = (skillOccurrences[sk.skillName] || 0) + 1;
    }
  }

  const departmentDistribution = Object.entries(deptMap).map(([department, data]) => ({
    department,
    count: data.count,
    avgReadiness: Math.round(data.totalReadiness / data.count)
  }));

  const topIdentifiedSkills = Object.entries(skillOccurrences)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([skill, count]) => ({
      skill,
      count,
      percentage: Math.round((count / students.length) * 100)
    }));

  // Missing skills analytics across student target roles
  const missingMap: Record<string, { deficitCount: number; targetRole: string }> = {};
  for (const st of students) {
    const occ = store.occupations.find(o => o.id === st.targetOccupationId) || store.occupations[0];
    const stSkillLower = new Set(st.skills.map(s => s.skillName.toLowerCase()));
    for (const req of occ.requiredSkills) {
      if (!stSkillLower.has(req.skillName.toLowerCase())) {
        if (!missingMap[req.skillName]) {
          missingMap[req.skillName] = { deficitCount: 0, targetRole: occ.title };
        }
        missingMap[req.skillName].deficitCount += 1;
      }
    }
  }

  const topMissingSkills = Object.entries(missingMap)
    .map(([skill, data]) => ({
      skill,
      deficitCount: data.deficitCount,
      targetRole: data.targetRole
    }))
    .sort((a, b) => b.deficitCount - a.deficitCount);

  const curriculumGaps = [
    {
      area: 'Containerization & Cloud Infrastructure',
      gapDescription: '62% of students targeting Backend and Full-Stack roles lack verifiable Docker and AWS deployment experience.',
      recommendedAddition: 'Introduce a hands-on 3-week Docker & CI/CD module in the 5th-semester Web Technologies lab.',
      industryDemandImpact: 'Critical' as const
    },
    {
      area: 'Production RESTful API Design & Validation',
      gapDescription: 'Students demonstrate SQL knowledge but lack schema validation, OpenAPI specifications, and caching layers (Redis).',
      recommendedAddition: 'Add an API engineering project component requiring FastAPI/Express with automated Postman or Pytest test suites.',
      industryDemandImpact: 'High' as const
    },
    {
      area: 'Applied AI & Vector Embeddings',
      gapDescription: 'High theoretical interest in Machine Learning, but fewer than 15% have hands-on experience deploying GenAI/RAG models.',
      recommendedAddition: 'Offer an elective practical workshop on Foundation Models, LangChain, and Vector Search indexing.',
      industryDemandImpact: 'High' as const
    }
  ];

  const overallAvgReadiness = Math.round(
    departmentDistribution.reduce((acc, d) => acc + d.avgReadiness * d.count, 0) / Math.max(1, students.length)
  );

  res.json({
    institutionName: 'National Institute of Engineering / Consortium',
    totalStudents: students.length,
    avgReadinessScore: overallAvgReadiness,
    departmentDistribution,
    topIdentifiedSkills,
    topMissingSkills,
    curriculumGaps
  });
});

// --- ADMIN & DEMO RESET ---
apiRouter.get('/admin/overview', (req, res) => {
  const store = db.get();
  res.json({
    usersCount: store.users.length,
    studentsCount: store.students.length,
    skillsCount: store.skills.length,
    occupationsCount: store.occupations.length,
    jobsCount: store.jobs.length,
    applicationsCount: store.applications.length,
    assessmentsCount: store.assessments.length,
    users: store.users
  });
});

apiRouter.post('/demo/reset', (req, res) => {
  db.resetToSeed();
  invalidateStudentCaches();
  currentUserId = 'usr-student-1';
  res.json({ success: true, message: 'Database reset to canonical seed state.' });
});
