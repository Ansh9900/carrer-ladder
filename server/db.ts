import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'industry' | 'institution' | 'admin';
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
  bridgeSkills: Record<string, string[]>; // if student has key skill, it makes learning value skill easier
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
  experienceLevel: 'Entry Level (0-1 yrs)' | 'Intern (Fresher)' | 'Associate (1-3 yrs)';
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  deadline: string;
  postedAt: string;
  active: boolean;
}

export interface JobApplication {
  id: string;
  jobId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentDegree: string;
  studentInstitution: string;
  appliedAt: string;
  status: 'Applied' | 'Reviewing' | 'Shortlisted' | 'Rejected' | 'Offered';
  matchScore: number;
  matchedSkills: string[];
  missingRequired: string[];
  notes?: string;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface SkillAssessment {
  id: string;
  skillId: string;
  skillName: string;
  category: string;
  durationMinutes: number;
  passingScore: number;
  questions: AssessmentQuestion[];
}

export interface AssessmentResult {
  id: string;
  studentId: string;
  skillId: string;
  skillName: string;
  score: number;
  passed: boolean;
  takenAt: string;
  answers: Record<string, number>;
}

export interface LearningResource {
  id: string;
  skillId: string;
  skillName: string;
  title: string;
  provider: string;
  type: 'Documentation' | 'Interactive Course' | 'Project Guide' | 'Video Lecture';
  url: string;
  durationHours: number;
  isFree: boolean;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  projectIdea: string;
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

// Canonical database structure
export interface DBStore {
  users: User[];
  skills: Skill[];
  occupations: Occupation[];
  students: StudentProfile[];
  jobs: JobListing[];
  applications: JobApplication[];
  assessments: SkillAssessment[];
  assessmentResults: AssessmentResult[];
  learningResources: LearningResource[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

export function getInitialSeedData(): DBStore {
  const skills: Skill[] = [
    // Languages
    { id: 'sk-python', name: 'Python', category: 'Languages', description: 'General purpose programming language used for backend, data science, and scripting.', aliases: ['python3', 'py'], demandLevel: 'Very High' },
    { id: 'sk-javascript', name: 'JavaScript', category: 'Languages', description: 'Core web scripting language for browser and Node.js environments.', aliases: ['js', 'es6', 'ecmascript'], demandLevel: 'Very High' },
    { id: 'sk-typescript', name: 'TypeScript', category: 'Languages', description: 'Typed superset of JavaScript providing static types for enterprise code.', aliases: ['ts'], demandLevel: 'Very High' },
    { id: 'sk-java', name: 'Java', category: 'Languages', description: 'Object-oriented language popular in enterprise and Android development.', aliases: ['java8', 'java17', 'jvm'], demandLevel: 'High' },
    { id: 'sk-cpp', name: 'C++', category: 'Languages', description: 'High-performance compiled language for systems, game engines, and competitive programming.', aliases: ['cpp', 'c plus plus'], demandLevel: 'High' },
    { id: 'sk-sql', name: 'SQL', category: 'Languages', description: 'Structured Query Language for relational database querying and management.', aliases: ['structured query language', 'ansi sql'], demandLevel: 'Very High' },
    { id: 'sk-go', name: 'Go', category: 'Languages', description: 'Statically typed, compiled programming language designed by Google for scalable microservices.', aliases: ['golang'], demandLevel: 'High' },

    // Frontend
    { id: 'sk-react', name: 'React', category: 'Frontend', description: 'Component-based UI library for modern web applications.', aliases: ['reactjs', 'react.js'], demandLevel: 'Very High' },
    { id: 'sk-nextjs', name: 'Next.js', category: 'Frontend', description: 'React framework for server-side rendering, static site generation, and full-stack web.', aliases: ['next', 'nextjs'], demandLevel: 'Very High' },
    { id: 'sk-tailwind', name: 'Tailwind CSS', category: 'Frontend', description: 'Utility-first CSS framework for rapid UI construction.', aliases: ['tailwind', 'tailwindcss'], demandLevel: 'Very High' },
    { id: 'sk-html5', name: 'HTML5', category: 'Frontend', description: 'Standard markup language for documents designed to be displayed in a web browser.', aliases: ['html'], demandLevel: 'High' },
    { id: 'sk-css3', name: 'CSS3', category: 'Frontend', description: 'Style sheet language used for describing the presentation of a document.', aliases: ['css'], demandLevel: 'High' },
    { id: 'sk-redux', name: 'Redux Toolkit', category: 'Frontend', description: 'Predictable state container for JavaScript apps.', aliases: ['redux', 'rtk'], demandLevel: 'Medium' },

    // Backend
    { id: 'sk-nodejs', name: 'Node.js', category: 'Backend', description: 'JavaScript runtime built on Chrome V8 engine for asynchronous backend servers.', aliases: ['node', 'nodejs'], demandLevel: 'Very High' },
    { id: 'sk-express', name: 'Express.js', category: 'Backend', description: 'Fast, unopinionated, minimalist web framework for Node.js.', aliases: ['express'], demandLevel: 'Very High' },
    { id: 'sk-fastapi', name: 'FastAPI', category: 'Backend', description: 'Modern, fast web framework for building APIs with Python 3.8+ based on standard Python type hints.', aliases: ['fast api'], demandLevel: 'Very High' },
    { id: 'sk-django', name: 'Django', category: 'Backend', description: 'High-level Python web framework that enables rapid development and clean design.', aliases: ['django rest framework', 'drf'], demandLevel: 'High' },
    { id: 'sk-restapi', name: 'RESTful APIs', category: 'Backend', description: 'Architectural style for designing networked applications and HTTP endpoints.', aliases: ['rest', 'rest api', 'api design'], demandLevel: 'Very High' },
    { id: 'sk-graphql', name: 'GraphQL', category: 'Backend', description: 'Query language for APIs and runtime for fulfilling queries with existing data.', aliases: ['gql'], demandLevel: 'Medium' },
    { id: 'sk-springboot', name: 'Spring Boot', category: 'Backend', description: 'Java-based framework used to create stand-alone, production-grade Spring applications.', aliases: ['spring', 'spring framework'], demandLevel: 'High' },

    // Database
    { id: 'sk-postgresql', name: 'PostgreSQL', category: 'Database', description: 'Powerful, open-source object-relational database system with strong reliability.', aliases: ['postgres', 'psql'], demandLevel: 'Very High' },
    { id: 'sk-mongodb', name: 'MongoDB', category: 'Database', description: 'Document-oriented NoSQL database for flexible JSON schema storage.', aliases: ['mongo', 'nosql'], demandLevel: 'High' },
    { id: 'sk-redis', name: 'Redis', category: 'Database', description: 'In-memory data structure store used as a distributed cache and message broker.', aliases: ['redis cache'], demandLevel: 'Very High' },

    // Cloud & DevOps
    { id: 'sk-docker', name: 'Docker', category: 'Cloud & DevOps', description: 'Containerization platform that packages applications and dependencies together.', aliases: ['containers', 'dockerfile', 'docker compose'], demandLevel: 'Very High' },
    { id: 'sk-kubernetes', name: 'Kubernetes', category: 'Cloud & DevOps', description: 'Open-source container orchestration system for automating deployment and scaling.', aliases: ['k8s'], demandLevel: 'Very High' },
    { id: 'sk-aws', name: 'Amazon Web Services (AWS)', category: 'Cloud & DevOps', description: 'Comprehensive on-demand cloud computing platform (EC2, S3, RDS, Lambda).', aliases: ['aws', 'amazon cloud'], demandLevel: 'Very High' },
    { id: 'sk-cicd', name: 'CI/CD Pipelines', category: 'Cloud & DevOps', description: 'Continuous integration and continuous deployment automated delivery workflows.', aliases: ['github actions', 'jenkins', 'gitlab ci'], demandLevel: 'Very High' },
    { id: 'sk-linux', name: 'Linux / Shell Scripting', category: 'Cloud & DevOps', description: 'Command-line system navigation, Bash scripting, and POSIX server administration.', aliases: ['bash', 'linux', 'unix', 'shell'], demandLevel: 'High' },

    // AI & Data
    { id: 'sk-pandas', name: 'Pandas', category: 'AI & Data', description: 'Fast, flexible data analysis and manipulation library for Python.', aliases: ['pandas library'], demandLevel: 'Very High' },
    { id: 'sk-numpy', name: 'NumPy', category: 'AI & Data', description: 'Fundamental package for scientific computing with multi-dimensional arrays in Python.', aliases: ['numpy array'], demandLevel: 'High' },
    { id: 'sk-pytorch', name: 'PyTorch', category: 'AI & Data', description: 'Open source machine learning framework that accelerates the path from research prototyping to production.', aliases: ['torch'], demandLevel: 'Very High' },
    { id: 'sk-scikit', name: 'Scikit-Learn', category: 'AI & Data', description: 'Simple and efficient tools for predictive data analysis and classical ML algorithms.', aliases: ['sklearn', 'scikit learn'], demandLevel: 'High' },
    { id: 'sk-langchain', name: 'LLMs & GenAI', category: 'AI & Data', description: 'Foundation model integration, prompt engineering, RAG, and LLM orchestration.', aliases: ['genai', 'langchain', 'rag', 'gemini api', 'openai api'], demandLevel: 'Very High' },

    // Core & Architecture
    { id: 'sk-dsa', name: 'Data Structures & Algorithms', category: 'Core & Architecture', description: 'Computational efficiency, arrays, trees, graphs, sorting, and dynamic programming.', aliases: ['dsa', 'algorithms', 'data structures'], demandLevel: 'Very High' },
    { id: 'sk-sysdesign', name: 'System Design', category: 'Core & Architecture', description: 'Architecture of high-scale distributed systems, load balancers, and caching.', aliases: ['distributed systems', 'system architecture', 'hld', 'lld'], demandLevel: 'Very High' },
    { id: 'sk-git', name: 'Git & GitHub', category: 'Core & Architecture', description: 'Distributed version control, branching, PR review workflows, and collaboration.', aliases: ['git', 'github', 'version control'], demandLevel: 'Very High' },

    // Soft Skills
    { id: 'sk-problemsolving', name: 'Analytical Problem Solving', category: 'Soft Skills', description: 'Ability to deconstruct complex technical challenges into solvable logical components.', aliases: ['critical thinking', 'problem solving'], demandLevel: 'Very High' },
    { id: 'sk-communication', name: 'Technical Communication', category: 'Soft Skills', description: 'Clear documentation, architectural explanation, and cross-functional collaboration.', aliases: ['communication', 'tech writing'], demandLevel: 'High' },
    { id: 'sk-agile', name: 'Agile & Scrum', category: 'Soft Skills', description: 'Sprint planning, iterative software releases, standups, and retrospective collaboration.', aliases: ['scrum', 'agile methodology', 'kanban'], demandLevel: 'High' }
  ];

  const occupations: Occupation[] = [
    {
      id: 'occ-backend-dev',
      title: 'Backend Developer',
      category: 'Software Engineering',
      overview: 'Designs, develops, and maintains server-side logic, databases, microservices, and robust APIs powering scalable web platforms.',
      medianSalaryINR: '₹8.5L - ₹18L / yr',
      growthRate: '+24% YoY',
      openingsCount: 1420,
      requiredSkills: [
        { skillId: 'sk-python', skillName: 'Python', weight: 1.0 },
        { skillId: 'sk-restapi', skillName: 'RESTful APIs', weight: 1.0 },
        { skillId: 'sk-sql', skillName: 'SQL', weight: 0.9 },
        { skillId: 'sk-postgresql', skillName: 'PostgreSQL', weight: 0.8 },
        { skillId: 'sk-docker', skillName: 'Docker', weight: 0.8 },
        { skillId: 'sk-git', skillName: 'Git & GitHub', weight: 0.7 }
      ],
      preferredSkills: [
        { skillId: 'sk-redis', skillName: 'Redis', weight: 0.8 },
        { skillId: 'sk-aws', skillName: 'Amazon Web Services (AWS)', weight: 0.7 },
        { skillId: 'sk-cicd', skillName: 'CI/CD Pipelines', weight: 0.6 },
        { skillId: 'sk-sysdesign', skillName: 'System Design', weight: 0.7 },
        { skillId: 'sk-fastapi', skillName: 'FastAPI', weight: 0.6 }
      ],
      bridgeSkills: {
        'sk-python': ['sk-fastapi', 'sk-django'],
        'sk-sql': ['sk-postgresql', 'sk-redis'],
        'sk-linux': ['sk-docker', 'sk-aws']
      }
    },
    {
      id: 'occ-fullstack',
      title: 'Full-Stack Engineer',
      category: 'Software Engineering',
      overview: 'Builds end-to-end web applications combining intuitive, responsive frontend interfaces with scalable backend microservices and databases.',
      medianSalaryINR: '₹9L - ₹20L / yr',
      growthRate: '+28% YoY',
      openingsCount: 1980,
      requiredSkills: [
        { skillId: 'sk-javascript', skillName: 'JavaScript', weight: 1.0 },
        { skillId: 'sk-typescript', skillName: 'TypeScript', weight: 0.9 },
        { skillId: 'sk-react', skillName: 'React', weight: 1.0 },
        { skillId: 'sk-nodejs', skillName: 'Node.js', weight: 0.9 },
        { skillId: 'sk-sql', skillName: 'SQL', weight: 0.8 },
        { skillId: 'sk-git', skillName: 'Git & GitHub', weight: 0.7 }
      ],
      preferredSkills: [
        { skillId: 'sk-nextjs', skillName: 'Next.js', weight: 0.8 },
        { skillId: 'sk-tailwind', skillName: 'Tailwind CSS', weight: 0.7 },
        { skillId: 'sk-docker', skillName: 'Docker', weight: 0.7 },
        { skillId: 'sk-postgresql', skillName: 'PostgreSQL', weight: 0.7 },
        { skillId: 'sk-aws', skillName: 'Amazon Web Services (AWS)', weight: 0.6 }
      ],
      bridgeSkills: {
        'sk-javascript': ['sk-typescript', 'sk-react', 'sk-nodejs'],
        'sk-react': ['sk-nextjs', 'sk-redux'],
        'sk-css3': ['sk-tailwind']
      }
    },
    {
      id: 'occ-frontend-dev',
      title: 'Frontend Developer',
      category: 'Web Development',
      overview: 'Crafts accessible, high-performance, responsive user experiences, animations, state management, and modern component architectures.',
      medianSalaryINR: '₹7.5L - ₹16L / yr',
      growthRate: '+20% YoY',
      openingsCount: 1150,
      requiredSkills: [
        { skillId: 'sk-javascript', skillName: 'JavaScript', weight: 1.0 },
        { skillId: 'sk-typescript', skillName: 'TypeScript', weight: 0.9 },
        { skillId: 'sk-react', skillName: 'React', weight: 1.0 },
        { skillId: 'sk-html5', skillName: 'HTML5', weight: 0.8 },
        { skillId: 'sk-css3', skillName: 'CSS3', weight: 0.8 },
        { skillId: 'sk-git', skillName: 'Git & GitHub', weight: 0.7 }
      ],
      preferredSkills: [
        { skillId: 'sk-tailwind', skillName: 'Tailwind CSS', weight: 0.8 },
        { skillId: 'sk-nextjs', skillName: 'Next.js', weight: 0.8 },
        { skillId: 'sk-redux', skillName: 'Redux Toolkit', weight: 0.6 },
        { skillId: 'sk-restapi', skillName: 'RESTful APIs', weight: 0.7 }
      ],
      bridgeSkills: {
        'sk-javascript': ['sk-typescript', 'sk-react'],
        'sk-css3': ['sk-tailwind']
      }
    },
    {
      id: 'occ-devops-cloud',
      title: 'Cloud & DevOps Engineer',
      category: 'Infrastructure',
      overview: 'Automates deployment pipelines, provisions infrastructure as code, monitors reliability, and scales containerized cloud architectures.',
      medianSalaryINR: '₹10L - ₹22L / yr',
      growthRate: '+31% YoY',
      openingsCount: 890,
      requiredSkills: [
        { skillId: 'sk-linux', skillName: 'Linux / Shell Scripting', weight: 1.0 },
        { skillId: 'sk-docker', skillName: 'Docker', weight: 1.0 },
        { skillId: 'sk-aws', skillName: 'Amazon Web Services (AWS)', weight: 0.9 },
        { skillId: 'sk-cicd', skillName: 'CI/CD Pipelines', weight: 0.9 },
        { skillId: 'sk-git', skillName: 'Git & GitHub', weight: 0.7 }
      ],
      preferredSkills: [
        { skillId: 'sk-kubernetes', skillName: 'Kubernetes', weight: 0.9 },
        { skillId: 'sk-python', skillName: 'Python', weight: 0.7 },
        { skillId: 'sk-sysdesign', skillName: 'System Design', weight: 0.7 }
      ],
      bridgeSkills: {
        'sk-linux': ['sk-docker', 'sk-cicd'],
        'sk-docker': ['sk-kubernetes', 'sk-aws']
      }
    },
    {
      id: 'occ-ml-engineer',
      title: 'Machine Learning Engineer',
      category: 'Artificial Intelligence',
      overview: 'Develops and deploys predictive statistical models, deep learning architectures, and generative AI systems to production infrastructure.',
      medianSalaryINR: '₹11L - ₹25L / yr',
      growthRate: '+38% YoY',
      openingsCount: 1340,
      requiredSkills: [
        { skillId: 'sk-python', skillName: 'Python', weight: 1.0 },
        { skillId: 'sk-pytorch', skillName: 'PyTorch', weight: 1.0 },
        { skillId: 'sk-scikit', skillName: 'Scikit-Learn', weight: 0.9 },
        { skillId: 'sk-pandas', skillName: 'Pandas', weight: 0.8 },
        { skillId: 'sk-sql', skillName: 'SQL', weight: 0.7 },
        { skillId: 'sk-git', skillName: 'Git & GitHub', weight: 0.6 }
      ],
      preferredSkills: [
        { skillId: 'sk-langchain', skillName: 'LLMs & GenAI', weight: 0.9 },
        { skillId: 'sk-docker', skillName: 'Docker', weight: 0.7 },
        { skillId: 'sk-fastapi', skillName: 'FastAPI', weight: 0.7 },
        { skillId: 'sk-aws', skillName: 'Amazon Web Services (AWS)', weight: 0.6 }
      ],
      bridgeSkills: {
        'sk-python': ['sk-pandas', 'sk-scikit', 'sk-pytorch'],
        'sk-pandas': ['sk-scikit', 'sk-pytorch']
      }
    }
  ];

  const users: User[] = [
    {
      id: 'usr-student-1',
      email: 'aanya.sharma@iitd.ac.in',
      name: 'Aanya Sharma',
      role: 'student',
      avatarUrl: '/src/assets/images/avatar_student_lead_1792012204911.jpg'
    },
    {
      id: 'usr-industry-1',
      email: 'vikram.m@innovatetech.in',
      name: 'Vikram Malhotra',
      role: 'industry',
      companyId: 'comp-innovatetech',
      avatarUrl: '/src/assets/images/avatar_student_lead_1792012204911.jpg'
    },
    {
      id: 'usr-institution-1',
      email: 'dean.academics@nie.ac.in',
      name: 'Dr. Ramesh Kulkarni',
      role: 'institution',
      institutionId: 'inst-nie',
      avatarUrl: '/src/assets/images/avatar_student_lead_1792012204911.jpg'
    },
    {
      id: 'usr-admin-1',
      email: 'admin@careerladder.in',
      name: 'Stack_Spartans Admin',
      role: 'admin',
      avatarUrl: '/src/assets/images/avatar_student_lead_1792012204911.jpg'
    }
  ];

  const students: StudentProfile[] = [
    {
      id: 'std-aanya',
      userId: 'usr-student-1',
      name: 'Aanya Sharma',
      email: 'aanya.sharma@iitd.ac.in',
      phone: '+91 98765 43210',
      institution: 'Indian Institute of Technology Delhi (IIT Delhi)',
      degree: 'B.Tech Computer Science & Engineering',
      department: 'Computer Science',
      graduationYear: 2026,
      cgpa: 8.85,
      location: 'New Delhi / Bengaluru',
      targetOccupationId: 'occ-backend-dev',
      completedRoadmapStepIds: ['step-docker-1', 'step-docker-2'],
      skills: [
        {
          skillId: 'sk-python',
          skillName: 'Python',
          category: 'Languages',
          proficiency: 'Advanced',
          verified: true,
          source: 'Assessment',
          verifiedScore: 92,
          confidenceScore: 0.95,
          extractedFromText: '3 years Python development building REST services and algorithmic problem solving'
        },
        {
          skillId: 'sk-sql',
          skillName: 'SQL',
          category: 'Languages',
          proficiency: 'Intermediate',
          verified: true,
          source: 'Assessment',
          verifiedScore: 84,
          confidenceScore: 0.90,
          extractedFromText: 'Wrote complex joins and query optimizations for PostgreSQL'
        },
        {
          skillId: 'sk-postgresql',
          skillName: 'PostgreSQL',
          category: 'Database',
          proficiency: 'Intermediate',
          verified: false,
          source: 'Resume',
          confidenceScore: 0.88,
          extractedFromText: 'Implemented relational schema in PostgreSQL for e-commerce project'
        },
        {
          skillId: 'sk-git',
          skillName: 'Git & GitHub',
          category: 'Core & Architecture',
          proficiency: 'Advanced',
          verified: false,
          source: 'Resume',
          confidenceScore: 0.94,
          extractedFromText: 'Active open-source contributor managing feature branches and pull requests'
        },
        {
          skillId: 'sk-javascript',
          skillName: 'JavaScript',
          category: 'Languages',
          proficiency: 'Intermediate',
          verified: false,
          source: 'Resume',
          confidenceScore: 0.82,
          extractedFromText: 'Created frontend interactive scripts and ES6 modules'
        },
        {
          skillId: 'sk-react',
          skillName: 'React',
          category: 'Frontend',
          proficiency: 'Beginner',
          verified: false,
          source: 'Self',
          confidenceScore: 0.70
        },
        {
          skillId: 'sk-problemsolving',
          skillName: 'Analytical Problem Solving',
          category: 'Soft Skills',
          proficiency: 'Advanced',
          verified: true,
          source: 'Assessment',
          verifiedScore: 95
        }
      ],
      projects: [
        {
          id: 'proj-1',
          title: 'Campus Food Ordering Microservice',
          description: 'Engineered an asynchronous high-throughput backend using Python and PostgreSQL capable of handling 200+ concurrent cafeteria requests.',
          technologies: ['Python', 'SQL', 'PostgreSQL', 'Git & GitHub'],
          link: 'https://github.com/aanya-sharma/campus-bite-service'
        },
        {
          id: 'proj-2',
          title: 'Student Placement Tracker Dashboard',
          description: 'Built a web analytics panel aggregating campus recruitment records with data validation and report exporting.',
          technologies: ['JavaScript', 'React', 'HTML5', 'CSS3']
        }
      ],
      certifications: [
        {
          id: 'cert-1',
          name: 'Meta Database Engineer Professional Certificate',
          issuer: 'Coursera / Meta',
          year: 2025
        }
      ]
    },
    // Additional student profiles for aggregate analytics
    {
      id: 'std-rohan',
      userId: 'usr-student-2',
      name: 'Rohan Verma',
      email: 'rohan.v@nie.ac.in',
      phone: '+91 98111 22334',
      institution: 'National Institute of Engineering',
      degree: 'B.E Information Science',
      department: 'Information Technology',
      graduationYear: 2026,
      cgpa: 8.2,
      location: 'Bengaluru',
      targetOccupationId: 'occ-fullstack',
      completedRoadmapStepIds: [],
      skills: [
        { skillId: 'sk-javascript', skillName: 'JavaScript', category: 'Languages', proficiency: 'Advanced', verified: true, source: 'Assessment', verifiedScore: 88 },
        { skillId: 'sk-react', skillName: 'React', category: 'Frontend', proficiency: 'Intermediate', verified: true, source: 'Assessment', verifiedScore: 80 },
        { skillId: 'sk-nodejs', skillName: 'Node.js', category: 'Backend', proficiency: 'Intermediate', verified: false, source: 'Resume' },
        { skillId: 'sk-html5', skillName: 'HTML5', category: 'Frontend', proficiency: 'Advanced', verified: false, source: 'Resume' },
        { skillId: 'sk-git', skillName: 'Git & GitHub', category: 'Core & Architecture', proficiency: 'Intermediate', verified: false, source: 'Self' }
      ],
      projects: [],
      certifications: []
    },
    {
      id: 'std-priya',
      userId: 'usr-student-3',
      name: 'Priya Nair',
      email: 'priya.n@nie.ac.in',
      phone: '+91 97222 33445',
      institution: 'National Institute of Engineering',
      degree: 'B.E Electronics & Communication',
      department: 'Electronics',
      graduationYear: 2026,
      cgpa: 7.9,
      location: 'Hyderabad',
      targetOccupationId: 'occ-ml-engineer',
      completedRoadmapStepIds: [],
      skills: [
        { skillId: 'sk-python', skillName: 'Python', category: 'Languages', proficiency: 'Intermediate', verified: true, source: 'Assessment', verifiedScore: 78 },
        { skillId: 'sk-cpp', skillName: 'C++', category: 'Languages', proficiency: 'Advanced', verified: false, source: 'Resume' },
        { skillId: 'sk-pandas', skillName: 'Pandas', category: 'AI & Data', proficiency: 'Beginner', verified: false, source: 'Resume' }
      ],
      projects: [],
      certifications: []
    },
    {
      id: 'std-karthik',
      userId: 'usr-student-4',
      name: 'Karthik Rao',
      email: 'karthik.r@nie.ac.in',
      phone: '+91 96333 44556',
      institution: 'National Institute of Engineering',
      degree: 'B.E Computer Science',
      department: 'Computer Science',
      graduationYear: 2026,
      cgpa: 9.1,
      location: 'Pune',
      targetOccupationId: 'occ-devops-cloud',
      completedRoadmapStepIds: [],
      skills: [
        { skillId: 'sk-linux', skillName: 'Linux / Shell Scripting', category: 'Cloud & DevOps', proficiency: 'Advanced', verified: true, source: 'Assessment', verifiedScore: 94 },
        { skillId: 'sk-docker', skillName: 'Docker', category: 'Cloud & DevOps', proficiency: 'Intermediate', verified: true, source: 'Assessment', verifiedScore: 82 },
        { skillId: 'sk-git', skillName: 'Git & GitHub', category: 'Core & Architecture', proficiency: 'Advanced', verified: false, source: 'Resume' }
      ],
      projects: [],
      certifications: []
    }
  ];

  const jobs: JobListing[] = [
    {
      id: 'job-1',
      companyId: 'comp-innovatetech',
      companyName: 'InnovateTech India',
      companyLogo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=128&auto=format&fit=crop&q=80',
      title: 'Backend Engineering Intern',
      type: 'Internship',
      location: 'Bengaluru (Koramangala)',
      remoteType: 'Hybrid',
      stipendOrSalary: '₹40,000 / month',
      experienceLevel: 'Intern (Fresher)',
      description: 'Join our cloud infrastructure squad building high-throughput payment settlement microservices in Python & PostgreSQL. Mentorship provided by senior staff engineers.',
      requiredSkills: ['Python', 'RESTful APIs', 'SQL', 'PostgreSQL'],
      preferredSkills: ['Docker', 'Redis', 'AWS'],
      deadline: '2026-11-30',
      postedAt: '2026-10-10',
      active: true
    },
    {
      id: 'job-2',
      companyId: 'comp-innovatetech',
      companyName: 'InnovateTech India',
      companyLogo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=128&auto=format&fit=crop&q=80',
      title: 'Junior Backend Developer',
      type: 'Full-time',
      location: 'Bengaluru / Remote',
      remoteType: 'Remote',
      stipendOrSalary: '₹9.5L - ₹14.0L / year',
      experienceLevel: 'Entry Level (0-1 yrs)',
      description: 'Looking for a driven developer with rock-solid Python fundamentals, clean API architecture, and database indexing expertise. Docker containerization experience is valued.',
      requiredSkills: ['Python', 'RESTful APIs', 'SQL', 'Docker', 'Git & GitHub'],
      preferredSkills: ['Redis', 'Amazon Web Services (AWS)', 'CI/CD Pipelines'],
      deadline: '2026-12-15',
      postedAt: '2026-10-12',
      active: true
    },
    {
      id: 'job-3',
      companyId: 'comp-razorscale',
      companyName: 'RazorScale Systems',
      companyLogo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=128&auto=format&fit=crop&q=80',
      title: 'Full-Stack Software Graduate Trainee',
      type: 'Full-time',
      location: 'Hyderabad (Hitec City)',
      remoteType: 'Hybrid',
      stipendOrSalary: '₹8.0L - ₹12.0L / year',
      experienceLevel: 'Entry Level (0-1 yrs)',
      description: 'Build enterprise fintech interfaces with React, TypeScript, and Node.js backend services. Opportunity to touch production code used by 5M+ monthly merchants.',
      requiredSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL'],
      preferredSkills: ['Tailwind CSS', 'Next.js', 'Docker'],
      deadline: '2026-11-20',
      postedAt: '2026-10-08',
      active: true
    },
    {
      id: 'job-4',
      companyId: 'comp-flipcloud',
      companyName: 'FlipCloud Infrastructure',
      companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=128&auto=format&fit=crop&q=80',
      title: 'DevOps & Cloud Associate',
      type: 'Full-time',
      location: 'Pune (Hinjawadi)',
      remoteType: 'On-site',
      stipendOrSalary: '₹10.5L - ₹15.0L / year',
      experienceLevel: 'Entry Level (0-1 yrs)',
      description: 'Maintain high availability multi-region AWS cloud deployments, automate CI/CD GitHub action workflows, and package microservices into Docker containers.',
      requiredSkills: ['Linux / Shell Scripting', 'Docker', 'Amazon Web Services (AWS)', 'CI/CD Pipelines'],
      preferredSkills: ['Kubernetes', 'Python', 'System Design'],
      deadline: '2026-12-01',
      postedAt: '2026-10-05',
      active: true
    },
    {
      id: 'job-5',
      companyId: 'comp-datainsight',
      companyName: 'DataPulse Analytics',
      companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&auto=format&fit=crop&q=80',
      title: 'AI / Machine Learning Intern',
      type: 'Internship',
      location: 'Gurugram (Cyber City)',
      remoteType: 'Hybrid',
      stipendOrSalary: '₹45,000 / month',
      experienceLevel: 'Intern (Fresher)',
      description: 'Collaborate with senior researchers to train PyTorch neural network baselines, prepare tabular datasets with Pandas, and construct evaluation harnesses.',
      requiredSkills: ['Python', 'PyTorch', 'Pandas', 'Scikit-Learn'],
      preferredSkills: ['LLMs & GenAI', 'Docker', 'FastAPI'],
      deadline: '2026-11-25',
      postedAt: '2026-10-11',
      active: true
    }
  ];

  const applications: JobApplication[] = [
    {
      id: 'app-1',
      jobId: 'job-1',
      studentId: 'std-aanya',
      studentName: 'Aanya Sharma',
      studentEmail: 'aanya.sharma@iitd.ac.in',
      studentDegree: 'B.Tech Computer Science & Engineering',
      studentInstitution: 'IIT Delhi',
      appliedAt: '2026-10-11T10:30:00Z',
      status: 'Shortlisted',
      matchScore: 88,
      matchedSkills: ['Python', 'SQL', 'PostgreSQL'],
      missingRequired: ['RESTful APIs'],
      notes: 'Strong algorithmic foundation (Python assessment verified 92%). Scheduled for technical interview.'
    }
  ];

  const assessments: SkillAssessment[] = [
    {
      id: 'asm-python',
      skillId: 'sk-python',
      skillName: 'Python',
      category: 'Languages',
      durationMinutes: 12,
      passingScore: 70,
      questions: [
        {
          id: 'py-q1',
          question: 'What is the time complexity of searching for a key in a standard Python dictionary in average vs worst case?',
          options: [
            'O(1) average, O(n) worst case due to hash collisions',
            'O(log n) average, O(n) worst case',
            'O(1) strictly in all cases',
            'O(n) average, O(n^2) worst case'
          ],
          correctIndex: 0,
          explanation: 'Python dictionaries utilize a hash table under the hood. Average lookup is O(1), but in degenerate collision scenarios, it degrades to O(n).',
          difficulty: 'Intermediate'
        },
        {
          id: 'py-q2',
          question: 'How do Python generator functions manage memory differently than standard list-returning functions?',
          options: [
            'They compress items into binary storage on disk',
            'They yield items lazily one at a time using iterator protocol, requiring O(1) auxiliary memory',
            'They execute on separate OS threads automatically',
            'They convert all variables to global scope'
          ],
          correctIndex: 1,
          explanation: 'Generators maintain internal execution frame state and yield items sequentially without allocating the entire collection in RAM.',
          difficulty: 'Intermediate'
        },
        {
          id: 'py-q3',
          question: 'In Python, what is the purpose of the Global Interpreter Lock (GIL) in CPython?',
          options: [
            'To synchronize access to GPU memory across processes',
            'To prevent deadlock in multi-threaded network sockets',
            'A mutex that protects access to Python objects, preventing multiple threads from executing CPython bytecodes at once',
            'To encrypt source code before bytecode compilation'
          ],
          correctIndex: 2,
          explanation: 'The GIL simplifies CPython memory management and reference counting by ensuring only one thread executes bytecode at a given moment.',
          difficulty: 'Advanced'
        },
        {
          id: 'py-q4',
          question: 'Which built-in module is best suited for creating immutable data-carrier classes with type hints in modern Python 3.7+?',
          options: [
            'collections.namedtuple',
            'dataclasses with frozen=True',
            'types.SimpleNamespace',
            'copy.deepcopy'
          ],
          correctIndex: 1,
          explanation: '@dataclass(frozen=True) generates boilerplate __init__, __repr__, and __eq__ methods while disallowing post-init attribute assignment.',
          difficulty: 'Beginner'
        },
        {
          id: 'py-q5',
          question: 'What does the `*args` and `**kwargs` syntax allow in a function signature?',
          options: [
            'Pointers and double-pointers as in C++',
            'Arbitrary positional arguments as a tuple, and arbitrary keyword arguments as a dictionary',
            'Enforcing compile-time type safety',
            'Automatic multi-processing parallel execution'
          ],
          correctIndex: 1,
          explanation: '*args captures variable positional parameters into a tuple, while **kwargs captures named parameters into a dictionary.',
          difficulty: 'Beginner'
        }
      ]
    },
    {
      id: 'asm-sql',
      skillId: 'sk-sql',
      skillName: 'SQL',
      category: 'Languages',
      durationMinutes: 10,
      passingScore: 70,
      questions: [
        {
          id: 'sql-q1',
          question: 'What is the primary operational difference between `WHERE` and `HAVING` clauses?',
          options: [
            '`WHERE` filters rows before grouping/aggregation; `HAVING` filters aggregated groups after `GROUP BY`',
            '`WHERE` works only on numeric fields; `HAVING` works on strings',
            '`WHERE` is ANSI standard; `HAVING` is a MySQL-specific extension',
            'There is no functional difference; they are aliases'
          ],
          correctIndex: 0,
          explanation: 'SQL query execution evaluates WHERE before generating summary rows with GROUP BY, whereas HAVING filters the resulting aggregated buckets.',
          difficulty: 'Beginner'
        },
        {
          id: 'sql-q2',
          question: 'What is the effect of creating a B-Tree index on a high-cardinality foreign key column?',
          options: [
            'Accelerates equality and range searches from O(n) full table scan to O(log n), at the expense of slight write latency',
            'Eliminates all disk I/O completely',
            'Converts the table into a columnar format',
            'Automatically enforces foreign key cascading deletes'
          ],
          correctIndex: 0,
          explanation: 'B-Tree indexes provide logarithmic tree traversal for equality and range predicates, adding minor maintenance cost during INSERT/UPDATE/DELETE.',
          difficulty: 'Intermediate'
        },
        {
          id: 'sql-q3',
          question: 'Which ACID property ensures that partially completed database transactions are rolled back if an outage occurs mid-flight?',
          options: [
            'Atomicity',
            'Consistency',
            'Isolation',
            'Durability'
          ],
          correctIndex: 0,
          explanation: 'Atomicity enforces that an entire transaction executes as an all-or-nothing unit.',
          difficulty: 'Beginner'
        }
      ]
    },
    {
      id: 'asm-docker',
      skillId: 'sk-docker',
      skillName: 'Docker',
      category: 'Cloud & DevOps',
      durationMinutes: 10,
      passingScore: 70,
      questions: [
        {
          id: 'dk-q1',
          question: 'Why are multi-stage Docker builds recommended for compiled languages like Go, Rust, or TypeScript?',
          options: [
            'They compress images into ZIP archives',
            'They separate the build environment with compilers/SDKs from the final minimal production image, reducing attack surface and image size',
            'They allow running multiple containers on the same port',
            'They automatically deploy to Kubernetes'
          ],
          correctIndex: 1,
          explanation: 'Multi-stage builds allow copying only compiled artifacts into a lightweight runtime image (e.g., alpine or distroless), shedding heavy build dependencies.',
          difficulty: 'Intermediate'
        },
        {
          id: 'dk-q2',
          question: 'What is the distinction between a Docker image and a Docker container?',
          options: [
            'An image is an immutable read-only blueprint; a container is a runnable isolated instance with a thin writable layer',
            'An image is for Linux; a container is for Windows',
            'Images run on servers; containers run only on developer laptops',
            'They are identical terms used interchangeably'
          ],
          correctIndex: 0,
          explanation: 'Docker images are layered, static snapshots of filesystem and config; running an image instantiates an active container process.',
          difficulty: 'Beginner'
        }
      ]
    }
  ];

  const assessmentResults: AssessmentResult[] = [
    {
      id: 'res-1',
      studentId: 'std-aanya',
      skillId: 'sk-python',
      skillName: 'Python',
      score: 92,
      passed: true,
      takenAt: '2026-10-01T14:20:00Z',
      answers: { 'py-q1': 0, 'py-q2': 1, 'py-q3': 2, 'py-q4': 1, 'py-q5': 1 }
    },
    {
      id: 'res-2',
      studentId: 'std-aanya',
      skillId: 'sk-sql',
      skillName: 'SQL',
      score: 84,
      passed: true,
      takenAt: '2026-10-04T11:00:00Z',
      answers: { 'sql-q1': 0, 'sql-q2': 0, 'sql-q3': 0 }
    }
  ];

  const learningResources: LearningResource[] = [
    {
      id: 'res-docker-guide',
      skillId: 'sk-docker',
      skillName: 'Docker',
      title: 'Docker Hands-On Getting Started Guide & Compose Workshop',
      provider: 'Docker Official Documentation & Labs',
      type: 'Documentation',
      url: 'https://docs.docker.com/get-started/',
      durationHours: 6,
      isFree: true,
      difficulty: 'Beginner',
      projectIdea: 'Write a multi-stage Dockerfile for a Python FastAPI backend and use Docker Compose to spin it up alongside a PostgreSQL container.'
    },
    {
      id: 'res-restapi-design',
      skillId: 'sk-restapi',
      skillName: 'RESTful APIs',
      title: 'RESTful API Architectural Constraints & Pragmatic Design',
      provider: 'Mozilla Developer Network (MDN) Web Docs',
      type: 'Documentation',
      url: 'https://developer.mozilla.org/en-US/docs/Learn/Server-side',
      durationHours: 8,
      isFree: true,
      difficulty: 'Intermediate',
      projectIdea: 'Design a clean CRUD endpoint specification with proper HTTP status codes (201 Created, 400 Bad Request, 404 Not Found, 409 Conflict) and input validation.'
    },
    {
      id: 'res-aws-cloud',
      skillId: 'sk-aws',
      skillName: 'Amazon Web Services (AWS)',
      title: 'AWS Cloud Practitioner Essentials',
      provider: 'AWS Skill Builder Official Free Tier',
      type: 'Interactive Course',
      url: 'https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/',
      durationHours: 12,
      isFree: true,
      difficulty: 'Beginner',
      projectIdea: 'Deploy your containerized service on AWS App Runner or Elastic Beanstalk with an RDS PostgreSQL instance.'
    },
    {
      id: 'res-redis-cache',
      skillId: 'sk-redis',
      skillName: 'Redis',
      title: 'Redis University: Fast In-Memory Caching & Session Storage',
      provider: 'Redis University Official',
      type: 'Interactive Course',
      url: 'https://university.redis.io/',
      durationHours: 5,
      isFree: true,
      difficulty: 'Intermediate',
      projectIdea: 'Add a cache-aside layer to avoid hitting the database for frequently queried catalog items, with 5-minute TTL invalidation.'
    },
    {
      id: 'res-fastapi-course',
      skillId: 'sk-fastapi',
      skillName: 'FastAPI',
      title: 'FastAPI Full Tutorial: Building High Performance Python APIs',
      provider: 'FastAPI Official Documentation (Sebastián Ramírez)',
      type: 'Documentation',
      url: 'https://fastapi.tiangolo.com/tutorial/',
      durationHours: 10,
      isFree: true,
      difficulty: 'Intermediate',
      projectIdea: 'Create an asynchronous REST API with Pydantic validation models, OpenAPI Swagger auto-documentation, and JWT authentication.'
    }
  ];

  return {
    users,
    skills,
    occupations,
    students,
    jobs,
    applications,
    assessments,
    assessmentResults,
    learningResources
  };
}

class Store {
  private data: DBStore;

  constructor() {
    this.data = this.load();
  }

  private load(): DBStore {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to load store from disk, initializing seed:', e);
    }
    const seed = getInitialSeedData();
    this.saveData(seed);
    return seed;
  }

  private saveData(data: DBStore) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write store to disk:', e);
    }
  }

  public resetToSeed(): DBStore {
    const seed = getInitialSeedData();
    this.data = seed;
    this.saveData(seed);
    return this.data;
  }

  public get(): DBStore {
    return this.data;
  }

  public update(updater: (data: DBStore) => void): DBStore {
    updater(this.data);
    this.saveData(this.data);
    return this.data;
  }
}

export const db = new Store();
