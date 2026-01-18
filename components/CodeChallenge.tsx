
import React, { useState, useEffect, useRef } from 'react';
import { createOnDemandSession, queryOnDemand } from '../services/onDemandService';

interface CodeChallengeProps {
  userName: string;
  onBack: () => void;
}

const CHALLENGE_API_KEY = "CyBzHDuDUFgEWO42OnqESbXZDHYGP89l";

const FULFILLMENT_PROMPT = `Core Objective: Conduct time-bound coding assessments. Allow users to choose Domain, Difficulty, Time limit, Number of coding questions. Ask one coding question at a time. Evaluate submitted code logically. Generate a detailed coding report with explanations. Do not use bold, italics, * and #.

Step 1: User Configuration (Ask in This Order)
1️⃣ Domain Selection: DSA, Web Development, Machine Learning, Data Science, Cyber Security.
2️⃣ Difficulty Level: Beginner, Intermediate, Expert.
3️⃣ Time Limit: 1-10 minutes.
4️⃣ Number of Questions: 1-5.

Step 2: Question Generation: Coding questions only, specific to domain.
Step 3: Timed Question Flow: Problem statement, Input/Output, Constraints.
Step 4: Evaluation: Logic, Edge cases, Efficiency.
Step 5: Scoring: 1 mark per question.
Step 6: Detailed Coding Report: Summary, Analysis, Ideal Solutions, Insights, Suggestions.
Step 7: Behavior Rules: No hints, no conversational tone.

End with: "Your timed coding assessment is complete. Review the detailed report above to understand your coding performance."`;

const DOMAINS = ['DSA', 'Web Development', 'Machine Learning', 'Data Science', 'Cyber Security'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Expert'];
const TIME_LIMITS = [1, 2, 3, 5, 8, 10];
const NUM_QUESTIONS = [1, 2, 3, 4, 5];

const CodeChallenge: React.FC<CodeChallengeProps> = ({ userName, onBack }) => {
  const [stage, setStage] = useState<'config' | 'testing' | 'report'>('config');
  const [config, setConfig] = useState({
    domain: 'DSA',
    difficulty: 'Beginner',
    timeLimit: 5,
    numQuestions: 3
  });

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [userSubmission, setUserSubmission] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [report, setReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const id = await createOnDemandSession(userName, CHALLENGE_API_KEY);
        setSessionId(id);
      } catch (err) {
        setError("Neural connection failed.");
      }
    };
    init();
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [userName]);

  const startTimer = (mins: number) => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    setTimeLeft(mins * 60);
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          window.clearInterval(timerRef.current!);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startChallenge = async () => {
    if (!sessionId || isLoading) return;
    setIsLoading(true);
    setStage('testing');
    setQuestionIndex(1);

    const query = `Begin ${config.numQuestions} question ${config.domain} assessment at ${config.difficulty} level. Time limit per question is ${config.timeLimit} minutes. Provide Question 1.`;
    try {
      const answer = await queryOnDemand(sessionId, query, CHALLENGE_API_KEY, {
        fulfillmentPrompt: FULFILLMENT_PROMPT,
        temperature: 0.25,
        maxTokens: 1000
      });
      setCurrentQuestion(answer);
      startTimer(config.timeLimit);
    } catch (err) {
      setError("Failed to start challenge.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!sessionId || isLoading) return;
    setIsLoading(true);
    const submission = userSubmission || "Time Limit Exceeded - Not Attempted";
    setUserSubmission('');

    if (questionIndex < config.numQuestions) {
      const query = `Submission for Q${questionIndex}: \n${submission}\nProvide Question ${questionIndex + 1}.`;
      try {
        const answer = await queryOnDemand(sessionId, query, CHALLENGE_API_KEY, {
          fulfillmentPrompt: FULFILLMENT_PROMPT,
          maxTokens: 1000
        });
        setCurrentQuestion(answer);
        setQuestionIndex(prev => prev + 1);
        startTimer(config.timeLimit);
      } catch (err) {
        setError("Sync error.");
      } finally {
        setIsLoading(false);
      }
    } else {
      const query = `Submission for final Q${questionIndex}: \n${submission}\nAll questions completed. Generate detailed report.`;
      try {
        const result = await queryOnDemand(sessionId, query, CHALLENGE_API_KEY, {
          fulfillmentPrompt: FULFILLMENT_PROMPT,
          maxTokens: 3500
        });
        setReport(result);
        setStage('report');
        if (timerRef.current) window.clearInterval(timerRef.current);
      } catch (err) {
        setError("Report generation failed.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden animate-pop-up relative z-10 font-['Inter'] bg-[#0F172A]">
      <header className="bg-white/10 backdrop-blur-xl border-b border-white/10 px-8 py-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-xl text-white/50 hover:text-white transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white text-xl shadow-[0_0_20px_rgba(220,38,38,0.3)]">💻</div>
             <div>
                <h2 className="font-black text-white text-lg leading-tight uppercase tracking-tight">Code Challenge</h2>
                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">{stage === 'config' ? 'Configure Lab' : config.domain}</p>
             </div>
          </div>
        </div>
        {stage === 'testing' && (
          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Time Remaining</p>
              <p className={`text-xl font-black ${timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{formatTime(timeLeft)}</p>
            </div>
            <div className="px-5 py-2 bg-red-600 rounded-2xl text-white font-black text-xs shadow-lg">Question {questionIndex}/{config.numQuestions}</div>
          </div>
        )}
      </header>

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto custom-scroll flex flex-col items-center justify-center">
        <div className="max-w-4xl w-full">
          {stage === 'config' && (
            <div className="bg-gradient-to-br from-slate-900/60 to-red-900/30 backdrop-blur-3xl rounded-[3rem] border-2 border-white/20 shadow-2xl p-10 lg:p-14 space-y-10 animate-pop-up">
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Lab Configuration</h1>
                <p className="text-white/50 font-medium">Set your parameters for the high-stakes timed coding audit.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Domain</label>
                  <div className="flex flex-wrap gap-2">
                    {DOMAINS.map(d => (
                      <button key={d} onClick={() => setConfig({...config, domain: d})} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${config.domain === d ? 'bg-white text-red-900' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>{d}</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Difficulty</label>
                  <div className="flex bg-black/20 p-1 rounded-xl border border-white/5">
                    {DIFFICULTIES.map(l => (
                      <button key={l} onClick={() => setConfig({...config, difficulty: l})} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${config.difficulty === l ? 'bg-white text-red-900 shadow-sm' : 'text-white/40'}`}>{l}</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Time Limit (Min/Q)</label>
                  <div className="flex flex-wrap gap-2">
                    {TIME_LIMITS.map(t => (
                      <button key={t} onClick={() => setConfig({...config, timeLimit: t})} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${config.timeLimit === t ? 'bg-white text-red-900' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>{t}m</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Question Count</label>
                  <div className="flex bg-black/20 p-1 rounded-xl border border-white/5">
                    {NUM_QUESTIONS.map(n => (
                      <button key={n} onClick={() => setConfig({...config, numQuestions: n})} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${config.numQuestions === n ? 'bg-white text-red-900 shadow-sm' : 'text-white/40'}`}>{n}</button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={startChallenge}
                disabled={!sessionId || isLoading}
                className="w-full py-6 bg-white text-red-900 font-black rounded-3xl shadow-2xl uppercase tracking-widest text-sm transform hover:-translate-y-1 transition-all"
              >
                Launch Challenge
              </button>
            </div>
          )}

          {stage === 'testing' && currentQuestion && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-[600px] animate-pop-up">
              <div className="bg-white/5 border-2 border-white/10 rounded-[2.5rem] p-10 space-y-6 overflow-y-auto custom-scroll">
                <div className="flex items-center gap-2 mb-4">
                   <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                   <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Neural Assessment Protocol Active</p>
                </div>
                <div className="prose prose-invert prose-sm max-w-none">
                   <pre className="whitespace-pre-wrap font-['Inter'] text-sm text-white/90 leading-relaxed bg-black/30 p-8 rounded-2xl border border-white/5">
                      {currentQuestion}
                   </pre>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex-1 relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-red-600 to-orange-600 rounded-[2.5rem] blur opacity-10 group-focus-within:opacity-25 transition-all"></div>
                  <textarea 
                    value={userSubmission}
                    onChange={(e) => setUserSubmission(e.target.value)}
                    placeholder="Write your code / pseudocode / algorithm here..."
                    className="w-full h-full min-h-[400px] bg-black/40 border-2 border-white/20 rounded-[2.5rem] p-10 text-white font-mono text-sm leading-relaxed outline-none focus:border-red-500/50 transition-all relative z-10 custom-scroll"
                  />
                </div>
                <button 
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full py-6 bg-white text-red-900 font-black rounded-[2rem] shadow-2xl uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all"
                >
                  {isLoading ? 'Processing Signal...' : (questionIndex === config.numQuestions ? 'Submit Final Challenge' : 'Submit & Next Challenge')}
                </button>
              </div>
            </div>
          )}

          {stage === 'report' && report && (
            <div className="space-y-8 animate-pop-up pb-20">
              <div className="bg-gradient-to-br from-slate-900 to-red-900/40 border-2 border-white/20 rounded-[4rem] p-10 lg:p-16 space-y-12 shadow-2xl">
                 <div className="text-center space-y-4">
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center text-5xl mx-auto shadow-2xl mb-6 border border-white/20">📜</div>
                    <h1 className="text-5xl font-black text-white uppercase tracking-tighter">Coding Audit Report</h1>
                    <p className="text-red-400 font-black uppercase tracking-widest text-[10px]">Verification Complete for {userName}</p>
                 </div>

                 <div className="bg-black/30 rounded-[3rem] p-10 border border-white/10 shadow-inner">
                   <div className="whitespace-pre-wrap font-['Inter'] text-sm text-white/80 leading-relaxed text-left font-medium max-h-[600px] overflow-y-auto custom-scroll pr-4">
                     {report}
                   </div>
                 </div>

                 <div className="flex gap-4">
                   <button onClick={onBack} className="flex-1 py-6 bg-white/10 text-white font-black rounded-3xl uppercase tracking-widest text-xs hover:bg-white/20 transition-all border border-white/10">Back to Dashboard</button>
                   <button onClick={() => { setStage('config'); setReport(null); setUserSubmission(''); }} className="flex-1 py-6 bg-white text-red-900 font-black rounded-3xl shadow-2xl uppercase tracking-widest text-xs hover:scale-105 transition-all">New Challenge</button>
                 </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {isLoading && (stage === 'testing' || stage === 'config') && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md flex items-center justify-center">
          <div className="text-center space-y-4 animate-pop-up">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_30px_rgba(220,38,38,0.3)]"></div>
            <p className="text-[10px] font-black text-white uppercase tracking-[0.5em] animate-pulse">Consulting Grok-4.1 Architecture...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[100] bg-red-600 text-white px-8 py-4 rounded-2xl shadow-2xl font-black uppercase text-[10px] tracking-widest border border-white/20 animate-pop-up">
          {error}
        </div>
      )}
    </div>
  );
};

export default CodeChallenge;
