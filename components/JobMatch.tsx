
import React, { useState, useEffect } from 'react';
import { createOnDemandSession, queryOnDemand } from '../services/onDemandService';

interface JobMatchProps {
  userName: string;
  onBack: () => void;
}

const JOBMATCH_API_KEY = "isA1eM6WMmxn7eciZmrx1tejt27BucYP";

const FULFILLMENT_PROMPT = `You are a Career Consultant and Job Matching Agent. 
Your responsibility is to analyze a candidate's resume and suggest highly relevant job roles from a pre-vetted list of LinkedIn opportunities provided below.

When a resume is provided:
1. Determine the primary domain of the candidate (DSA/Algorithms, Machine Learning, Web Development, Cyber Security, or Data Science).
2. Based on the resume analysis, select 3-5 most suitable links from the corresponding domain list below.
3. Provide a brief explanation for each selection.

DATA_SET_LINKS:

DSA/Algorithms:
- https://www.linkedin.com/jobs/view/4361122172/
- https://www.linkedin.com/jobs/view/4343953396/
- https://www.linkedin.com/jobs/view/4328077593/
- https://www.linkedin.com/jobs/view/4360093149/
- https://www.linkedin.com/jobs/view/4335355728/
- https://www.linkedin.com/jobs/view/4351971706/
- https://www.linkedin.com/jobs/view/4331524615/
- https://www.linkedin.com/jobs/view/4362487278/
- https://www.linkedin.com/jobs/view/4354801009/

Machine Learning:
- https://www.linkedin.com/jobs/view/4345424448/
- https://www.linkedin.com/jobs/view/4305117104/
- https://www.linkedin.com/jobs/view/4325350374/
- https://www.linkedin.com/jobs/view/4295846482/
- https://www.linkedin.com/jobs/view/4346188484/
- https://www.linkedin.com/jobs/view/4352605390/
- https://www.linkedin.com/jobs/view/4345274508/
- https://www.linkedin.com/jobs/view/4324639573/

Web Development:
- https://www.linkedin.com/jobs/view/4333156239/
- https://www.linkedin.com/jobs/view/4343730202/
- https://www.linkedin.com/jobs/view/4306113547/
- https://www.linkedin.com/jobs/view/4048224990/
- https://www.linkedin.com/jobs/view/4359203308/
- https://www.linkedin.com/jobs/view/4306132138/
- https://www.linkedin.com/jobs/view/4345034685/
- https://www.linkedin.com/jobs/view/4339855976/
- https://www.linkedin.com/jobs/view/4333977043/
- https://www.linkedin.com/jobs/view/4306120384/
- https://www.linkedin.com/jobs/view/4048229794/

Cyber Security:
- https://www.linkedin.com/jobs/view/4298606084/
- https://www.linkedin.com/jobs/view/4327829919/
- https://www.linkedin.com/jobs/view/4354952120/
- https://www.linkedin.com/jobs/view/4359740831/
- https://www.linkedin.com/jobs/view/4326555050/
- https://www.linkedin.com/jobs/view/4358574234/
- https://www.linkedin.com/jobs/view/4330791428/
- https://www.linkedin.com/jobs/view/4346227804/
- https://www.linkedin.com/jobs/view/4352135188/
- https://www.linkedin.com/jobs/view/4336559245/

Data Science:
- https://www.linkedin.com/jobs/view/4328077593/
- https://www.linkedin.com/jobs/view/4351659543/
- https://www.linkedin.com/jobs/view/4328006164/
- https://www.linkedin.com/jobs/view/4345814984/
- https://www.linkedin.com/jobs/view/4325350374/
- https://www.linkedin.com/jobs/view/4360093149/
- https://www.linkedin.com/jobs/view/4346984094/
- https://www.linkedin.com/jobs/view/4332597320/
- https://www.linkedin.com/jobs/view/4346877371/
- https://www.linkedin.com/jobs/view/4351129829/

Format your response exactly like this:

ANALYSIS SUMMARY:
[Brief analysis of the resume strengths and matched domain]

MATCHED JOB OPPORTUNITIES:
1. [LinkedIn URL]
   Why: [Justification based on resume]
2. [LinkedIn URL]
   Why: [Justification based on resume]
3. [LinkedIn URL]
   Why: [Justification based on resume]

ACTIONABLE NEXT STEPS:
- [Step 1]
- [Step 2]

Keep the language professional and simple. Avoid markdown symbols like bold or italic. Use plain text bullet points.`;

const JobMatch: React.FC<JobMatchProps> = ({ userName, onBack }) => {
  const [resumeText, setResumeText] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const id = await createOnDemandSession(userName, JOBMATCH_API_KEY);
        setSessionId(id);
      } catch (err: any) {
        console.error("JobMatch Session Init Error:", err);
        setError("Failed to initialize session. Please check your connectivity.");
      }
    };
    init();
  }, [userName]);

  const handleMatch = async () => {
    if (!resumeText.trim() || !sessionId || isLoading) return;
    setIsLoading(true);
    setError(null);

    const query = `Analyze this resume and provide LinkedIn job matches from the provided list:
    ${resumeText}`;

    const modelConfigs = {
      fulfillmentPrompt: FULFILLMENT_PROMPT,
      stopSequences: [],
      temperature: 0.7,
      topP: 1,
      maxTokens: 1000,
      presencePenalty: 0.1,
      frequencyPenalty: 0.1,
    };

    try {
      const answer = await queryOnDemand(sessionId, query, JOBMATCH_API_KEY, modelConfigs);
      setResult(answer);
    } catch (err) {
      setError("Failed to generate job matches. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to render text with clickable links
  const renderFormattedResult = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-emerald-400 hover:text-white underline decoration-emerald-500/30 hover:decoration-white transition-all break-all"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden animate-pop-up relative z-10 font-['Inter']">
      <header className="bg-white/10 backdrop-blur-xl border-b border-white/10 px-8 py-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-xl text-white/50 hover:text-white transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white text-xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">🔍</div>
             <div>
                <h2 className="font-black text-white text-lg leading-tight uppercase tracking-tight">AI JobMatch</h2>
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">LinkedIn Opportunity Tracker</p>
             </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2">
           <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Verified by Grok-4.1</span>
        </div>
      </header>

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto custom-scroll">
        <div className="max-w-4xl mx-auto space-y-10">
          {!result ? (
            <div className="bg-gradient-to-br from-indigo-900/60 to-emerald-900/60 backdrop-blur-3xl rounded-[3rem] border-2 border-white/30 shadow-2xl p-10 lg:p-14 space-y-8 animate-pop-up">
              <div className="text-center">
                <h3 className="text-3xl font-black text-white uppercase tracking-tight">Profile Market Matching</h3>
                <p className="text-white/50 mt-2 font-medium">Map your skills against pre-vetted industry openings on LinkedIn.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Paste Resume Content</label>
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">ATS Grade Scan</span>
                  </div>
                  <textarea 
                    value={resumeText} 
                    onChange={(e) => setResumeText(e.target.value)} 
                    placeholder="Enter skills, experiences, and project summaries..." 
                    className="w-full h-80 bg-white/5 border-2 border-white/20 rounded-[2.5rem] p-8 text-white outline-none focus:border-white/40 transition-all font-mono text-sm leading-relaxed" 
                  />
                </div>
                
                {error && <p className="text-red-400 text-center font-black uppercase text-[10px] tracking-widest bg-red-500/10 py-3 rounded-xl border border-red-500/20">{error}</p>}

                <button 
                  onClick={handleMatch} 
                  disabled={isLoading || !resumeText.trim() || !sessionId} 
                  className="w-full py-6 bg-white text-emerald-900 font-black rounded-3xl shadow-2xl uppercase tracking-widest text-sm transform hover:-translate-y-1 transition-all disabled:opacity-30 disabled:hover:translate-y-0"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-4">
                      <div className="w-4 h-4 border-2 border-emerald-900 border-t-transparent rounded-full animate-spin"></div>
                      <span>Analyzing Market Fit...</span>
                    </div>
                  ) : 'Find LinkedIn Matches'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-pop-up">
              <div className="bg-white/5 border-2 border-white/20 rounded-[3rem] p-10 space-y-8 shadow-[0_0_50px_rgba(16,185,129,0.05)]">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-8 gap-4">
                    <div>
                      <h3 className="text-3xl font-black text-white uppercase tracking-tight">Curated Matches</h3>
                      <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mt-1">LinkedIn Intelligence Report</p>
                    </div>
                    <button onClick={() => setResult(null)} className="px-8 py-3 bg-white/10 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-white hover:text-indigo-900 transition-all shadow-xl">Audit New Resume</button>
                 </div>
                 
                 <div className="prose prose-invert max-w-none">
                    <div className="whitespace-pre-wrap font-['Inter'] text-sm text-white/80 leading-relaxed font-medium bg-black/30 p-10 rounded-[2.5rem] border border-white/5 shadow-inner">
                      {renderFormattedResult(result)}
                    </div>
                 </div>
              </div>

              <div className="text-center pt-8 pb-12">
                 <button onClick={onBack} className="px-16 py-6 bg-white text-indigo-900 font-black rounded-[2rem] uppercase text-xs tracking-widest hover:scale-105 shadow-2xl transition-all">Return to Mission Control</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default JobMatch;
