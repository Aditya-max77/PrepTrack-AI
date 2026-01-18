
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createOnDemandSession, queryOnDemand, uploadMediaFile } from '../services/onDemandService';

interface ResumeAnalyzerProps {
  userName: string;
  onBack: () => void;
}

// API Configuration
const ANALYZER_API_KEY = "IeYYmsbFIA6bCdQj7PgOAN2ZztmwTYUU";
const EXTRACTION_API_KEY = "xaDFNL9jEtnk2aiTF76a84ErC2xSpzrU";

// Primary Agent IDs for session creation and queries
const PRIMARY_AGENT_IDS = ["agent-1712327325", "agent-1713962163"];

// Specific Agent IDs for Media File Processing/Extraction (Critical for upload)
const EXTRACTION_MEDIA_AGENTS = [
  "agent-1713954536",
  "agent-1713958591",
  "agent-1713958830",
  "agent-1713961903",
  "agent-1713967141"
];

const EXTRACTION_PROMPT = `You are a Media Processing AI Agent whose task is to accept a PDF resume, extract all resume information accurately, and return it in a clean, structured format for further use by ATS, Interview, Roadmap, and Job Matching agents.

Core Responsibilities
Accept only PDF resume files
Extract complete and accurate resume content
Convert unstructured PDF text into structured, machine-readable data
Do NOT evaluate, score, or suggest improvements
Do NOT invent or assume missing information

Step 1: File Validation
Check uploaded file format:
If the file is NOT a PDF:
Respond clearly: "Invalid file format. Please upload your resume in PDF format only."
If the PDF is: Corrupted, Empty, Unreadable, Image-only with no readable text
Respond: "Unable to read the uploaded PDF. Please upload a clear and readable resume PDF."

Step 2: Resume Text Extraction
Extract all readable text from the PDF
Merge multi-page content logically into one resume.

Step 3: Section Detection Logic
Identify and extract: Personal Details, Summary, Skills, Education, Experience, Projects, Certifications, Achievements.

Step 5: Mandatory Output Format (STRICT)
Return output ONLY in the following JSON structure:
{
  "personal_details": { "name": "", "email": "", "phone": "", "location": "", "links": [] },
  "summary": "",
  "skills": { "technical": [], "tools": [], "languages": [] },
  "education": [{ "degree": "", "institution": "", "year": "", "score": "" }],
  "experience": [{ "role": "", "company": "", "duration": "", "description": "" }],
  "projects": [{ "title": "", "description": "", "technologies": [] }],
  "certifications": [],
  "achievements": []
}

Final Success Message (After JSON):
Resume successfully extracted and structured. Ready for further analysis`;

interface ParsedReport {
  score: number;
  missingSkills: string[];
  tips: string[];
  raw: string;
}

const ResumeAnalyzer: React.FC<ResumeAnalyzerProps> = ({ userName, onBack }) => {
  const [mode, setMode] = useState<'text' | 'pdf'>('text');
  const [resumeText, setResumeText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [sessionError, setSessionError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize main analysis session
  const initSession = async () => {
    setSessionError(null);
    try {
      const id = await createOnDemandSession(userName, ANALYZER_API_KEY, PRIMARY_AGENT_IDS);
      setSessionId(id);
    } catch (err: any) {
      console.error("Analyzer Session Init Error:", err);
      setSessionError(err.message || "Failed to connect to the analysis engine.");
    }
  };

  useEffect(() => {
    initSession();
  }, [userName]);

  const parseReport = (text: string): ParsedReport => {
    const scoreMatch = text.match(/ATS Score:\s*(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;

    const missingSkillsSection = text.split(/Missing Skills:/i)[1]?.split(/Improvement Tips:/i)[0] || "";
    const missingSkills = missingSkillsSection
      .split('\n')
      .map(s => s.replace(/^-\s*/, '').trim())
      .filter(s => s.length > 0);

    const tipsSection = text.split(/Improvement Tips:/i)[1] || "";
    const tips = tipsSection
      .split('\n')
      .map(s => s.replace(/^-\s*/, '').trim())
      .filter(s => s.length > 0);

    return { score, missingSkills, tips, raw: text };
  };

  const parsedData = useMemo(() => (result ? parseReport(result) : null), [result]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        alert("Only PDF files are supported.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleAnalyze = async () => {
    if (!targetRole.trim() || !sessionId || isLoading) return;
    
    setIsLoading(true);
    setResult(null);

    try {
      let finalResumeText = resumeText;

      // STEP 1: PDF Extraction (if in PDF mode)
      if (mode === 'pdf' && selectedFile) {
        setLoadingStep('Uploading to Extraction Engine...');
        // Create session for extraction using primary agents
        const extractSessionId = await createOnDemandSession(userName, EXTRACTION_API_KEY, PRIMARY_AGENT_IDS);
        
        // Upload file using specifically allowed EXTRACTION_MEDIA_AGENTS (this fixes the 500 error)
        await uploadMediaFile(selectedFile, extractSessionId, EXTRACTION_API_KEY, EXTRACTION_MEDIA_AGENTS);
        
        setLoadingStep('Parsing Resume Architecture...');
        const extractionQuery = `Extract and structure the uploaded resume PDF following the strict instructions provided in the fulfillment prompt. Target output: JSON schema.`;
        
        // Query extraction results using primary agents
        finalResumeText = await queryOnDemand(extractSessionId, extractionQuery, EXTRACTION_API_KEY, {
          fulfillmentPrompt: EXTRACTION_PROMPT,
          temperature: 0.15,
          maxTokens: 3500,
          topP: 1,
          frequencyPenalty: 0.6
        }, PRIMARY_AGENT_IDS);
      }

      if (!finalResumeText || !finalResumeText.trim()) {
        throw new Error("No resume content provided or extraction failed.");
      }

      // STEP 2: Main ATS Analysis
      setLoadingStep('Auditing for ATS Compliance...');
      const query = `Extracted Resume Data:
${finalResumeText}

Target Job Role: ${targetRole}

Perform a comprehensive industry-standard ATS audit and provide a score with feedback.`;

      const modelConfigs = {
        fulfillmentPrompt: `You are an ATS Resume Analyzer Tool. Analyze the provided resume against the target role. 
        Return ATS Score (0-100), Missing Skills, and Improvement Tips in exactly this format:
        ATS Score: <number>/100
        Missing Skills:
        - <skill>
        Improvement Tips:
        - <tip>`,
        temperature: 0.5,
        maxTokens: 750
      };

      const answer = await queryOnDemand(sessionId, query, ANALYZER_API_KEY, modelConfigs, PRIMARY_AGENT_IDS);
      setResult(answer);
    } catch (err: any) {
      console.error("Audit Cycle Error:", err);
      setSessionError(err.message || "Analysis cycle failed. Please check your file and try again.");
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const CIRCLE_SIZE = 160;
  const CIRCLE_CENTER = CIRCLE_SIZE / 2;
  const CIRCLE_RADIUS = 70;
  const CIRCLE_STROKE = 10;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden animate-pop-up relative z-10 font-['Inter']">
      <header className="bg-white/10 backdrop-blur-xl border-b border-white/10 px-8 py-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-xl text-white/50 hover:text-white transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white text-xl shadow-[0_0_20px_rgba(168,85,247,0.3)]">📄</div>
             <div>
                <h2 className="font-black text-white text-lg leading-tight uppercase tracking-tight">AI Resume Analyzer</h2>
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Neural Audit Engine</p>
             </div>
          </div>
        </div>
        {sessionId && <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">System Ready</span>}
      </header>

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto custom-scroll">
        <div className="max-w-5xl mx-auto space-y-10">
          {!result ? (
            <div className="bg-gradient-to-br from-indigo-900/60 to-purple-900/60 backdrop-blur-3xl rounded-[3rem] border-2 border-white/30 shadow-2xl p-10 lg:p-14 space-y-10 animate-pop-up">
              <div className="text-center">
                <h3 className="text-3xl font-black text-white uppercase tracking-tight">Audit Configuration</h3>
                <p className="text-white/50 mt-2 font-medium">Configure your target role and resume input.</p>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3 block">Target Job Role</label>
                  <input 
                    type="text" 
                    value={targetRole} 
                    onChange={(e) => setTargetRole(e.target.value)} 
                    placeholder="e.g. Senior Software Engineer, Data Scientist..." 
                    className="w-full bg-white/5 border-2 border-white/20 rounded-2xl py-5 px-8 text-white outline-none focus:border-white/40 transition-all font-bold text-lg" 
                  />
                </div>

                {/* Mode Selection Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => setMode('text')} 
                    className={`flex-1 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 border-2 ${mode === 'text' ? 'bg-white text-indigo-900 border-white shadow-xl' : 'bg-white/5 text-white/40 border-white/10 hover:border-white/30'}`}
                  >
                    <span>✍️</span> Text Resume
                  </button>
                  <button 
                    onClick={() => setMode('pdf')} 
                    className={`flex-1 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 border-2 ${mode === 'pdf' ? 'bg-white text-indigo-900 border-white shadow-xl' : 'bg-white/5 text-white/40 border-white/10 hover:border-white/30'}`}
                  >
                    <span>📄</span> PDF Format Resume
                  </button>
                </div>

                {mode === 'text' ? (
                  <div className="animate-pop-up">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3 block">Resume Body Text</label>
                    <textarea 
                      value={resumeText} 
                      onChange={(e) => setResumeText(e.target.value)} 
                      placeholder="Paste your full resume content here..." 
                      className="w-full h-64 bg-white/5 border-2 border-white/20 rounded-[2.5rem] p-8 text-white outline-none focus:border-white/40 transition-all font-mono text-sm leading-relaxed" 
                    />
                  </div>
                ) : (
                  <div className="animate-pop-up">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3 block">Upload PDF Resume</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full h-64 border-4 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center gap-6 transition-all cursor-pointer group ${selectedFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'}`}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept=".pdf" 
                        className="hidden" 
                      />
                      <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl transition-transform group-hover:scale-110 ${selectedFile ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/30'}`}>
                        {selectedFile ? '✅' : '📄'}
                      </div>
                      <div className="text-center px-6">
                        <p className={`font-black uppercase tracking-tight break-all ${selectedFile ? 'text-emerald-400' : 'text-white'}`}>
                          {selectedFile ? selectedFile.name : 'Click or Drag PDF here'}
                        </p>
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-1">Maximum file size: 5MB</p>
                      </div>
                    </div>
                  </div>
                )}

                <button 
                  onClick={handleAnalyze} 
                  disabled={isLoading || !targetRole.trim() || (mode === 'text' && !resumeText.trim()) || (mode === 'pdf' && !selectedFile)} 
                  className="w-full py-6 bg-white text-indigo-900 font-black rounded-[2rem] shadow-2xl uppercase tracking-widest text-sm transform hover:-translate-y-1 transition-all disabled:opacity-30 disabled:hover:translate-y-0"
                >
                  {isLoading ? 'Processing Neural Stream...' : 'Analyze Now'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-pop-up">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-white/5 border-2 border-white/20 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center space-y-6">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">ATS Performance</span>
                  <div className="relative flex items-center justify-center" style={{ width: `${CIRCLE_SIZE}px`, height: `${CIRCLE_SIZE}px` }}>
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx={CIRCLE_CENTER} cy={CIRCLE_CENTER} r={CIRCLE_RADIUS} stroke="currentColor" strokeWidth={CIRCLE_STROKE} fill="transparent" className="text-white/5" />
                      <circle cx={CIRCLE_CENTER} cy={CIRCLE_CENTER} r={CIRCLE_RADIUS} stroke="currentColor" strokeWidth={CIRCLE_STROKE} fill="transparent" strokeDasharray={CIRCLE_CIRCUMFERENCE} strokeDashoffset={CIRCLE_CIRCUMFERENCE - (CIRCLE_CIRCUMFERENCE * (parsedData?.score || 0)) / 100} strokeLinecap="round" className="text-purple-500 transition-all duration-1000 ease-out shadow-[0_0_20px_#a855f7]" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-5xl font-black text-white leading-none">{parsedData?.score}</span>
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-1">/ 100</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 bg-white/5 border-2 border-white/20 rounded-[3rem] p-10 space-y-8">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Gap Assessment</h3>
                    <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Weak Points</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {parsedData?.missingSkills.length ? parsedData.missingSkills.map((skill, i) => (
                      <span key={i} className="px-5 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs font-black text-red-400 uppercase tracking-widest">{skill}</span>
                    )) : <p className="text-white/40 italic">No major skills missing.</p>}
                  </div>
                  
                  <div className="pt-8 border-t border-white/5 space-y-4">
                    <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Optimization Strategy</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {parsedData?.tips.slice(0, 4).map((tip, i) => (
                        <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                          <span className="text-emerald-400 font-bold shrink-0">✓</span>
                          <p className="text-xs font-medium text-white/70">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border-2 border-white/20 rounded-[3rem] p-10">
                 <div className="flex justify-between items-center mb-8">
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">Audit Report</h3>
                    <button onClick={() => { setResult(null); setSelectedFile(null); }} className="px-8 py-3 bg-white/10 text-white font-black rounded-xl uppercase text-[10px] tracking-widest hover:bg-white hover:text-indigo-900 transition-all shadow-lg">Audit New Resume</button>
                 </div>
                 <div className="bg-black/30 p-8 rounded-[2rem] border border-white/10 shadow-inner">
                    <pre className="whitespace-pre-wrap font-['Inter'] text-sm text-white/80 leading-relaxed font-medium">{result}</pre>
                 </div>
              </div>

              <div className="text-center pt-8 pb-12">
                 <button onClick={onBack} className="px-16 py-6 bg-white text-indigo-900 font-black rounded-[2rem] uppercase text-xs tracking-widest hover:scale-105 shadow-2xl transition-all">Back to Mission Control</button>
              </div>
            </div>
          )}
        </div>
      </main>

      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xl flex items-center justify-center">
          <div className="text-center space-y-8 animate-pop-up">
            <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_30px_#4f46e5]"></div>
            <div className="space-y-2">
              <p className="text-sm font-black text-white uppercase tracking-[0.4em]">{loadingStep}</p>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] animate-pulse">Syncing with On-Demand Neural Core...</p>
            </div>
          </div>
        </div>
      )}

      {sessionError && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[100] bg-red-600 text-white px-10 py-5 rounded-[2rem] shadow-2xl font-black uppercase text-xs tracking-widest flex items-center gap-4 border-2 border-white/20 animate-pop-up">
          <span className="flex-1 text-center">{sessionError}</span>
          <button onClick={() => setSessionError(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors">✕</button>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
