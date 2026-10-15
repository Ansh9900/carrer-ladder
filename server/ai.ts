import { GoogleGenAI } from '@google/genai';
import { db, Skill } from './db';

const apiKey = process.env.GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

export interface ParsedResumeResult {
  name?: string;
  email?: string;
  phone?: string;
  institution?: string;
  degree?: string;
  department?: string;
  graduationYear?: number;
  cgpa?: number;
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
  summary: string;
  parsingMethod: 'Gemini 3.8 Flash' | 'Deterministic NLP Engine (Offline Fallback)';
}

export async function parseResumeWithAI(resumeText: string): Promise<ParsedResumeResult> {
  const allCanonicalSkills = db.get().skills;

  // Attempt Gemini API extraction if key is present
  if (ai) {
    try {
      const canonicalSkillNames = allCanonicalSkills.map(s => s.name).join(', ');
      const prompt = `You are an expert technical talent analyst for "Career Ladder" (Smart India Hackathon 2026).
Analyze the following student resume text and extract candidate details, skills, projects, and certifications.

Rules:
1. Normalize technical skills to match canonical skills whenever possible from this list: [${canonicalSkillNames}].
2. For each extracted skill, provide:
   - canonicalName: The standard name from the taxonomy (or clean title if new)
   - originalPhrase: The exact term as found in resume
   - category: One of ['Languages', 'Frontend', 'Backend', 'Database', 'Cloud & DevOps', 'AI & Data', 'Core & Architecture', 'Soft Skills']
   - proficiency: 'Beginner', 'Intermediate', or 'Advanced' based strictly on demonstrated depth (e.g., years, project complexity, lead roles; default to 'Intermediate' or 'Beginner' for brief mentions)
   - confidenceScore: Float from 0.70 to 0.99
   - evidenceText: The excerpt from the resume mentioning this skill
3. Return ONLY valid JSON with this exact schema (no markdown fences, no extra text):
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "institution": "string",
  "degree": "string",
  "department": "string",
  "graduationYear": 2026,
  "cgpa": 8.5,
  "summary": "1-2 sentence candidate summary",
  "extractedSkills": [
    {
      "canonicalName": "Python",
      "originalPhrase": "python 3.9",
      "category": "Languages",
      "proficiency": "Advanced",
      "confidenceScore": 0.95,
      "evidenceText": "built distributed crawler"
    }
  ],
  "projects": [
    {
      "title": "Project Title",
      "description": "Short description",
      "technologies": ["Python", "SQL"]
    }
  ],
  "certifications": [
    {
      "name": "Cert Name",
      "issuer": "Issuer",
      "year": 2025
    }
  ]
}

Resume Text:
${resumeText.slice(0, 8000)}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      });

      const text = response.text?.trim() || '';
      if (text) {
        const parsed = JSON.parse(text);
        return {
          ...parsed,
          parsingMethod: 'Gemini 3.8 Flash'
        };
      }
    } catch (err) {
      console.warn('Gemini resume parsing failed, using deterministic NLP engine:', err);
    }
  }

  // Deterministic NLP Rule-Based Fallback
  return fallbackRuleBasedParser(resumeText, allCanonicalSkills);
}

function fallbackRuleBasedParser(text: string, canonicalSkills: Skill[]): ParsedResumeResult {
  const lower = text.toLowerCase();

  // Basic regex extractions
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(?:\+91[\s-]?)?[6-9]\d{9}/) || text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const cgpaMatch = text.match(/(?:cgpa|gpa|score)[\s:=]+([0-9.]+)(?:\s*\/\s*10)?/i);
  const gradMatch = text.match(/\b(202[4-9]|203[0-2])\b/);

  // Institution heuristics
  let institution = 'Engineering College';
  if (/iit\s+[a-z]+|indian institute of technology/i.test(text)) {
    const m = text.match(/(?:IIT|Indian Institute of Technology)\s+([A-Za-z]+)/i);
    institution = m ? `IIT ${m[1]}` : 'Indian Institute of Technology';
  } else if (/nit\s+[a-z]+|national institute of technology/i.test(text)) {
    const m = text.match(/(?:NIT|National Institute of Technology)\s+([A-Za-z]+)/i);
    institution = m ? `NIT ${m[1]}` : 'National Institute of Technology';
  } else if (/bits\s+pilani/i.test(text)) {
    institution = 'BITS Pilani';
  } else if (/iiit\s+[a-z]+/i.test(text)) {
    institution = 'IIIT';
  }

  // Degree heuristics
  let degree = 'B.Tech Computer Science & Engineering';
  if (/b\.?tech|bachelor of technology/i.test(text)) {
    degree = 'B.Tech in Computer Science & Engineering';
  } else if (/b\.?e\.?|bachelor of engineering/i.test(text)) {
    degree = 'B.E in Information Science & Engineering';
  } else if (/m\.?tech|master of technology/i.test(text)) {
    degree = 'M.Tech in Software Engineering';
  }

  // Skill matching against taxonomy and aliases
  const matchedSkills: ParsedResumeResult['extractedSkills'] = [];
  const lines = text.split('\n');

  for (const skill of canonicalSkills) {
    const searchTerms = [skill.name.toLowerCase(), ...skill.aliases.map(a => a.toLowerCase())];
    for (const term of searchTerms) {
      // Word boundary regex
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(^|[^a-zA-Z0-9_#+])${escaped}([^a-zA-Z0-9_#+]|$)`, 'i');
      if (regex.test(lower)) {
        // Find evidence line
        const evidenceLine = lines.find(l => regex.test(l.toLowerCase())) || `${skill.name} mentioned in qualifications`;
        
        // Estimate proficiency from context
        let proficiency: 'Beginner' | 'Intermediate' | 'Advanced' = 'Intermediate';
        if (/senior|lead|architect|advanced|deep expertise|3\+ years|4\+ years/i.test(evidenceLine)) {
          proficiency = 'Advanced';
        } else if (/familiar|beginner|basic|introductory|learning/i.test(evidenceLine)) {
          proficiency = 'Beginner';
        }

        matchedSkills.push({
          canonicalName: skill.name,
          originalPhrase: term,
          category: skill.category,
          proficiency,
          confidenceScore: 0.88,
          evidenceText: evidenceLine.trim().slice(0, 140)
        });
        break; // matched this canonical skill, avoid duplicates
      }
    }
  }

  // Detect simple projects
  const projects: ParsedResumeResult['projects'] = [];
  if (/project|github\.com/i.test(text)) {
    const projLines = lines.filter(l => /(?:built|developed|engineered|designed|created)\s+/i.test(l));
    projLines.slice(0, 3).forEach((line, idx) => {
      projects.push({
        title: `Technical Project ${idx + 1}`,
        description: line.trim(),
        technologies: matchedSkills.slice(idx * 2, idx * 2 + 3).map(s => s.canonicalName)
      });
    });
  }

  return {
    name: text.split('\n')[0]?.trim().slice(0, 40) || 'Candidate',
    email: emailMatch ? emailMatch[0] : 'candidate@example.ac.in',
    phone: phoneMatch ? phoneMatch[0] : '+91 98765 00000',
    institution,
    degree,
    department: 'Computer Science & Engineering',
    graduationYear: gradMatch ? parseInt(gradMatch[0]) : 2026,
    cgpa: cgpaMatch ? parseFloat(cgpaMatch[1]) : 8.4,
    extractedSkills: matchedSkills,
    projects: projects.length > 0 ? projects : [
      {
        title: 'Full-Stack Web & API Application',
        description: 'Engineered modular web services with database queries and modern UI components.',
        technologies: matchedSkills.slice(0, 3).map(s => s.canonicalName)
      }
    ],
    certifications: [
      {
        name: 'Technical Competency Certification',
        issuer: 'National Skill Registry',
        year: 2025
      }
    ],
    summary: `Computer science student with verified foundations in ${matchedSkills.slice(0, 3).map(s => s.canonicalName).join(', ') || 'software engineering'}.`,
    parsingMethod: 'Deterministic NLP Engine (Offline Fallback)'
  };
}

export async function generateSkillGapGuidance(params: {
  targetOccupation: string;
  matchedSkills: string[];
  missingRequired: string[];
  missingPreferred: string[];
  overallReadiness: number;
}): Promise<{
  executiveSummary: string;
  strategicSteps: string[];
  portfolioProjects: string[];
  estimatedWeeksToReadiness: number;
}> {
  if (ai) {
    try {
      const prompt = `You are the Lead Career Intelligence Advisor for Career Ladder (Smart India Hackathon 2026).
A student is targeting the role: "${params.targetOccupation}".
Current Profile:
- Overall Readiness Score: ${params.overallReadiness}%
- Matched Skills: ${params.matchedSkills.join(', ')}
- Missing Required Skills: ${params.missingRequired.join(', ')}
- Missing Preferred Skills: ${params.missingPreferred.join(', ')}

Provide concise, high-impact career intelligence for Indian tech hiring in 2026.
Return ONLY valid JSON (no markdown):
{
  "executiveSummary": "2-3 sentences explaining their competitive position and realistic path to job readiness",
  "strategicSteps": [
    "Step 1: Actionable advice focused on missing required skills",
    "Step 2: Leveraging bridge skills they already have",
    "Step 3: Industry readiness milestone"
  ],
  "portfolioProjects": [
    "Project Title 1: Description combining their matched skills with missing target skills",
    "Project Title 2: Real-world scenario solving an Indian tech industry problem"
  ],
  "estimatedWeeksToReadiness": 4
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });

      const text = response.text?.trim() || '';
      if (text) {
        return JSON.parse(text);
      }
    } catch (e) {
      console.warn('Gemini skill gap guidance generation failed, falling back:', e);
    }
  }

  // Deterministic fallback guidance
  const weeks = Math.max(2, Math.ceil((params.missingRequired.length * 1.5) + (params.missingPreferred.length * 0.5)));
  return {
    executiveSummary: `You have strong foundations with ${params.matchedSkills.length} key capabilities matching ${params.targetOccupation}. Focusing on the ${params.missingRequired.length} missing required skills will elevate your hiring readiness from ${params.overallReadiness}% to over 90%.`,
    strategicSteps: [
      `Prioritize ${params.missingRequired[0] || 'core missing skills'} first through hands-on containerized exercises and API specs.`,
      `Leverage your existing grasp of ${params.matchedSkills[0] || 'foundational tools'} to fast-track related frameworks.`,
      `Build and deploy one end-to-end production-grade portfolio project with automated tests and CI/CD before campus placements.`
    ],
    portfolioProjects: [
      `High-Throughput Microservice with ${params.missingRequired[0] || 'Docker'}: Build an asynchronous backend integrating ${params.matchedSkills[0] || 'Python'} with automated container deployment.`,
      `Distributed Data Pipeline: Process real-time events using database transactions, caching, and clean RESTful design.`
    ],
    estimatedWeeksToReadiness: weeks
  };
}
