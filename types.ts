
export type Domain = 'DSA' | 'ML' | 'DataScience' | 'CyberSecurity' | 'WebDev';
export type Level = 'Beginner' | 'Intermediate' | 'Expert' | 'Advanced';
export type Company = 'Google' | 'Amazon' | 'Core ECE';

export interface Resource {
  title: string;
  url: string;
  videoId?: string;
  type: 'video' | 'notes' | 'project';
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  resources: Resource[];
  practiceProblems: string[];
  moduleName?: string;
}

export interface LearningPath {
  id: string;
  domain: Domain;
  languageOrTech: string;
  level: Level | string;
  topics: Topic[];
}

export interface DomainConfig {
  domain: Domain;
  language?: string;
  level?: string;
  libraries?: string[];
  focusAreas?: string[];
  addOns?: string[];
}

export interface UserPreferences {
  selectedDomains: Domain[];
  configs: Record<Domain, DomainConfig>;
}

export interface UserProgress {
  completedTopicIds: string[];
  activeDomains: Domain[];
  scores: Record<string, number>;
  preferences?: UserPreferences;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface InterviewRoundResult {
  question: string;
  answer: string;
  round: number;
}

export interface InterviewFinalReport {
  company: Company;
  overall_score: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C';
  round_scores: {
    round_1: number;
    round_2: number;
    round_3: number;
    round_4: number;
  };
  skills: {
    conceptual: number;
    problem_solving: number;
    communication: number;
    confidence: number;
    practical_application: number;
  };
  strengths: string[];
  weaknesses: string[];
  resume_analysis: {
    verified_skills: string[];
    weakly_supported_skills: string[];
  };
  cheating_detection: {
    cheating_score: number;
    risk_level: 'Low' | 'Medium' | 'High';
    flags: string[];
  };
  charts: {
    pie: {
      strength: number;
      weakness: number;
    };
    bar: {
      conceptual: number;
      problem_solving: number;
      communication: number;
      confidence: number;
      practical: number;
    };
  };
  final_feedback: string;
  hiring_recommendation: {
    decision: 'Hire' | 'Borderline' | 'Needs Improvement';
    justification: string;
  };
}
