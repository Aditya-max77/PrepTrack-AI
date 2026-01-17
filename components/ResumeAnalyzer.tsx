
import React, { useState, useEffect, useMemo } from 'react';
import { createOnDemandSession, queryOnDemand } from '../services/onDemandService';

interface ResumeAnalyzerProps {
  userName: string;
  onBack: () => void;
}

const ANALYZER_API_KEY = "IeYYmsbFIA6bCdQj7PgOAN2ZztmwTYUU";

interface ParsedReport {
  score: number;
  missingSkills: string[];
  tips: string[];
  raw: string;
}

const ResumeAnalyzer: React.FC<ResumeAnalyzerProps> = ({ userName, onBack }) => {
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const initSession = async () => {
    setSessionError(null);
    try {
      const id = await createOnDemandSession(userName, ANALYZER_API_KEY);
      setSessionId(id);
    } catch (err: any) {
      console.error("Analyzer Session Init Error:", err);
      setSessionError(err.message || "Failed to connect to the analysis engine. Check your internet or API availability.");
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

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !targetRole.trim() || !sessionId || isLoading) {
      if (!sessionId && !isLoading) initSession();
      return;
    }
    setIsLoading(true);

    const query = `Resume Text:
    ${resumeText}

    Target Job Role:
    ${targetRole}`;

    const modelConfigs = {
      fulfillmentPrompt: `You are an ATS Resume Analyzer Tool.

Your task:
1. Analyze the uploaded resume content.
2. Compare it with the given target job role.
3. Identify relevant skills, keywords, and experience required for the role.
4. Calculate an ATS score between 0 and 100 based on relevance and skill match.
5. Identify missing or weak skills.
6. Provide clear, actionable improvement suggestions.

Rules:
- Be precise and role-specific.
- Do not hallucinate experience.
- Keep suggestions practical and concise.

Output Format (STRICT):
ATS Score: <number>/100

Missing Skills:
- <skill 1>
- <skill 2>
- <skill 3>

Improvement Tips:
- <tip 1>
- <tip 2>
- <tip 3>`,
      stopSequences: ["### END"],
      temperature: 0.5,
      topP: 0.5,
      maxTokens: 750,
      presencePenalty: 0.3,
      frequencyPenalty: 0.3,
    };

    try {
      const answer = await queryOnDemand(sessionId, query, ANALYZER_API_KEY, modelConfigs);
      setResult(answer);
    } catch (err) {
      setResult("Audit failed. We couldn't complete the scan. Try reducing the text length or restarting.");
    } finally {
      setIsLoading(false);
    }
  };

  // SVG Circle Constants for consistent sizing
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
             <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white text-xl">📄</div>
             <div>
                <h2 className="font-black text-white text-lg leading-tight uppercase tracking-tight">AI Resume Analyzer</h2>
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">ATS Performance Auditor</p>
             </div>
          </div>
        </div>
        {sessionId && <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Engine Connected</span>}
      </header>

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto custom-scroll">
        <div className="max-w-5xl mx-auto space-y-10">
          {sessionError && !sessionId && (
            <div className="bg-red-500/10 border-2 border-red-500/20 rounded-3xl p-8 text-center space-y-4 max-w-lg mx-auto">
              <div className="text-4xl">🔌</div>
              <h3 className="text-xl font-black text-white">Engine Offline</h3>
              <p className="text-white/60 text-sm">{sessionError}</p>
              <button onClick={initSession} className="px-8 py-3 bg-white text-red-900 font-black rounded-xl uppercase text-xs tracking-widest hover:scale-105 transition-all">Retry Connection</button>
            </div>
          )}

          {!result ? (
            <div className="bg-gradient-to-br from-indigo-900/60 to-purple-900/60 backdrop-blur-3xl rounded-[3rem] border-2 border-white/30 shadow-2xl p-10 lg:p-14 space-y-8">
              <div className="text-center">
                <h3 className="text-3xl font-black text-white uppercase tracking-tight">Resume ATS Audit</h3>
                <p className="text-white/50 mt-2 font-medium">Deep-scan your profile against global placement benchmarks.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3 block">Target Job Role</label>
                  <input 
                    type="text" 
                    value={targetRole} 
                    onChange={(e) => setTargetRole(e.target.value)} 
                    placeholder="e.g. Frontend Engineer, Product Manager..." 
                    className="w-full bg-white/5 border-2 border-white/20 rounded-2xl py-4 px-6 text-white outline-none focus:border-white/40 transition-all font-bold" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3 block">Resume Body Text</label>
                  <textarea 
                    value={resumeText} 
                    onChange={(e) => setResumeText(e.target.value)} 
                    placeholder="Paste the full text from your resume..." 
                    className="w-full h-80 bg-white/5 border-2 border-white/20 rounded-[2.5rem] p-8 text-white outline-none focus:border-white/40 transition-all font-mono text-sm leading-relaxed" 
                  />
                </div>
                <button 
                  onClick={handleAnalyze} 
                  disabled={isLoading || !resumeText.trim() || !targetRole.trim() || !sessionId} 
                  className="w-full py-6 bg-white text-indigo-900 font-black rounded-3xl shadow-2xl uppercase tracking-widest text-sm transform hover:-translate-y-1 transition-all disabled:opacity-30 disabled:hover:translate-y-0"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-4">
                      <div className="w-4 h-4 border-2 border-indigo-900 border-t-transparent rounded-full animate-spin"></div>
                      <span>Neural Scanning...</span>
                    </div>
                  ) : 'Audit Resume'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-pop-up">
              {/* Visual Report Dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Score Card */}
                <div className="lg:col-span-1 bg-white/5 border-2 border-white/20 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center space-y-6">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">AI Audit Rating</span>
                  <div className="relative flex items-center justify-center" style={{ width: `${CIRCLE_SIZE}px`, height: `${CIRCLE_SIZE}px` }}>
                    <svg className="w-full h-full transform -rotate-90">
                      <circle 
                        cx={CIRCLE_CENTER} 
                        cy={CIRCLE_CENTER} 
                        r={CIRCLE_RADIUS} 
                        stroke="currentColor" 
                        strokeWidth={CIRCLE_STROKE} 
                        fill="transparent" 
                        className="text-white/5" 
                      />
                      <circle 
                        cx={CIRCLE_CENTER} 
                        cy={CIRCLE_CENTER} 
                        r={CIRCLE_RADIUS} 
                        stroke="currentColor" 
                        strokeWidth={CIRCLE_STROKE} 
                        fill="transparent" 
                        strokeDasharray={CIRCLE_CIRCUMFERENCE}
                        strokeDashoffset={CIRCLE_CIRCUMFERENCE - (CIRCLE_CIRCUMFERENCE * (parsedData?.score || 0)) / 100}
                        strokeLinecap="round"
                        className="text-purple-500 transition-all duration-1000 ease-out shadow-[0_0_20px_#a855f7]"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-5xl font-black text-white leading-none">{parsedData?.score}</span>
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-1">/ 100</span>
                    </div>
                  </div>
                  <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest px-4 py-2 bg-purple-500/10 rounded-full border border-purple-500/20">ATS Compliance</p>
                </div>

                {/* Missing Skills Card */}
                <div className="lg:col-span-2 bg-white/5 border-2 border-white/20 rounded-[3rem] p-10 space-y-8">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Gap Analysis</h3>
                    <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Identified Gaps</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {parsedData?.missingSkills.length ? parsedData.missingSkills.map((skill, i) => (
                      <span key={i} className="px-5 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs font-black text-red-400 uppercase tracking-widest shadow-lg">
                        {skill}
                      </span>
                    )) : <p className="text-white/40 italic">No missing skills detected for this role.</p>}
                  </div>
                  
                  <div className="pt-8 border-t border-white/5 space-y-4">
                    <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Optimization Strategy</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {parsedData?.tips.slice(0, 4).map((tip, i) => (
                        <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-white/20 transition-all">
                          <span className="text-emerald-400 font-bold shrink-0">✓</span>
                          <p className="text-xs font-medium text-white/70 group-hover:text-white transition-colors">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Raw Report (Optional expansion) */}
              <div className="bg-white/5 border-2 border-white/20 rounded-[3rem] p-10">
                 <div className="flex justify-between items-center mb-8">
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">Detailed Breakdown</h3>
                    <button onClick={() => setResult(null)} className="px-6 py-2 bg-white/10 text-white font-black rounded-xl uppercase text-[10px] tracking-widest hover:bg-white hover:text-indigo-900 transition-all">New Audit</button>
                 </div>
                 <div className="bg-black/30 p-8 rounded-[2rem] border border-white/10 prose prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap font-['Inter'] text-sm text-white/80 leading-relaxed font-medium">{result}</pre>
                 </div>
              </div>

              <div className="text-center pt-8 pb-12">
                 <button onClick={onBack} className="px-16 py-5 bg-white text-indigo-900 font-black rounded-[2rem] uppercase text-xs tracking-widest hover:scale-105 shadow-2xl transition-all">Return to Mission Control</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ResumeAnalyzer;
