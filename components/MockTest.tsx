
import React, { useState, useEffect } from 'react';
import { createOnDemandSession, queryOnDemand } from '../services/onDemandService';

interface MockTestProps {
  onBack: () => void;
  onComplete: (score: number) => void;
}

const MOCK_API_KEY = "vFfvb2ccYvIIVzCTiGuVTZTYWMSwnaEB";

const FULFILLMENT_PROMPT = `You are Mock Test AI, an intelligent assessment agent designed to create, conduct, and evaluate mock tests for placement preparation.

Your goal is to simulate real technical tests.

For every question turn, you MUST use this EXACT format:
QUESTION: [Text of the question]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
CORRECT: [A, B, C, or D]
EXPLANATION: [Short explanation of why this answer is correct and common interview pitfalls]

Rules:
1. Ask exactly one question at a time.
2. Wait for the user to answer before providing the next.
3. After 10 questions, provide a final "Job Readiness Summary" which will be displayed in the results.`;

const MOCK_DOMAINS = [
  { id: 'DSA', label: 'Data Structures & Algorithms', icon: '📊' },
  { id: 'WebDev', label: 'Web Development', icon: '🌐' },
  { id: 'ML', label: 'Machine Learning', icon: '🤖' },
  { id: 'DataScience', label: 'Data Science', icon: '📈' },
  { id: 'CyberSecurity', label: 'Cyber Security', icon: '🛡️' },
  { id: 'GenAI', label: 'AI & Generative AI', icon: '🧠' },
];

interface ParsedQuestion {
  question: string;
  options: { key: string; text: string }[];
  correctAnswer: string;
  explanation: string;
}

const MockTest: React.FC<MockTestProps> = ({ onBack, onComplete }) => {
  const [stage, setStage] = useState<'intro' | 'testing' | 'result'>('intro');
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<ParsedQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [score, setScore] = useState(0);
  const [finalReport, setFinalReport] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const id = await createOnDemandSession("Candidate", MOCK_API_KEY);
        setSessionId(id);
      } catch (err) {
        console.error("MockTest Session Init Error:", err);
        setError("AI Neural connection failed. Please refresh.");
      }
    };
    init();
  }, []);

  const parseAIResponse = (text: string): ParsedQuestion => {
    const questionMatch = text.match(/QUESTION:\s*([\s\S]*?)(?=[A-D]\)|CORRECT:)/i);
    const options: { key: string; text: string }[] = [];
    ['A', 'B', 'C', 'D'].forEach(key => {
      const optMatch = text.match(new RegExp(`${key}\\)\\s*(.*?)(?=[A-D]\\)|CORRECT:|EXPLANATION:|$)`, 'i'));
      if (optMatch) options.push({ key, text: optMatch[1].trim() });
    });
    const correctMatch = text.match(/CORRECT:\s*([A-D])/i);
    const explanationMatch = text.match(/EXPLANATION:\s*([\s\S]*?)$/i);

    return {
      question: questionMatch ? questionMatch[1].trim() : "Unable to parse question text.",
      options,
      correctAnswer: correctMatch ? correctMatch[1].toUpperCase() : "A",
      explanation: explanationMatch ? explanationMatch[1].trim() : "No explanation available."
    };
  };

  const getNextQuestion = async (isFirst = false) => {
    if (!sessionId || isLoading) return;
    setIsLoading(true);
    setError(null);
    setIsSubmitted(false);
    setSelectedOption(null);
    setShowExplanation(false);

    const query = isFirst 
      ? `Start a 10-question mock test for the domain: ${selectedDomain}. Provide Question 1.` 
      : `Provide the next question. Question count is now ${questionCount + 1}.`;

    try {
      const answer = await queryOnDemand(sessionId, query, MOCK_API_KEY, {
        fulfillmentPrompt: FULFILLMENT_PROMPT,
      });

      if (questionCount >= 10 && !isFirst) {
        setFinalReport(answer);
        setStage('result');
      } else {
        setCurrentQuestion(parseAIResponse(answer));
        setQuestionCount(prev => prev + 1);
      }
    } catch (err) {
      setError("AI failed to deliver the next challenge. Check connectivity.");
    } finally {
      setIsLoading(false);
    }
  };

  const startTest = (domain: string) => {
    setSelectedDomain(domain);
    setQuestionCount(0);
    setScore(0);
    setStage('testing');
    setTimeout(() => getNextQuestion(true), 50);
  };

  const handleSelectOption = (key: string) => {
    if (isSubmitted || isLoading) return;
    setSelectedOption(key);
    setIsSubmitted(true);
    if (key === currentQuestion?.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const getOptionClasses = (key: string) => {
    if (!isSubmitted) {
      return "bg-white/5 border-white/10 hover:border-white/40 hover:bg-white/10 text-white cursor-pointer hover:scale-[1.01]";
    }

    const isCorrect = key === currentQuestion?.correctAnswer;
    const isSelected = key === selectedOption;

    if (isCorrect) return "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-[1.02] z-10";
    if (isSelected && !isCorrect) return "bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]";
    
    return "bg-white/5 border-white/5 text-white/10 grayscale";
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden animate-pop-up relative z-10 font-['Inter'] bg-[#0F172A]">
      <header className="bg-white/10 backdrop-blur-xl border-b border-white/10 px-8 py-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-xl text-white/50 hover:text-white transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl shadow-[0_0_20px_rgba(79,70,229,0.3)]">📝</div>
             <div>
                <h2 className="font-black text-white text-lg leading-tight uppercase tracking-tight">AI Mock Test</h2>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{selectedDomain || 'Neural Assessment'}</p>
             </div>
          </div>
        </div>
        {stage === 'testing' && (
          <div className="flex items-center gap-6">
             <div className="text-right">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Live Score</p>
                <p className="text-sm font-black text-emerald-400">{score} Points</p>
             </div>
             <div className="px-5 py-2 bg-indigo-600 rounded-2xl text-white font-black text-xs shadow-lg">{questionCount}/10</div>
          </div>
        )}
      </header>

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto custom-scroll">
        <div className="max-w-4xl mx-auto space-y-10">
          {stage === 'intro' && (
            <div className="bg-gradient-to-br from-slate-900/60 to-indigo-900/60 backdrop-blur-3xl rounded-[3rem] border-2 border-white/30 shadow-2xl p-10 lg:p-14 space-y-10 animate-pop-up">
              <div className="text-center">
                <h3 className="text-4xl font-black text-white uppercase tracking-tight leading-none">Standardized Assessments</h3>
                <p className="text-white/50 mt-3 font-medium text-lg">Grok-4.1 Powered Technical Verification Labs</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {MOCK_DOMAINS.map(d => (
                  <button 
                    key={d.id}
                    onClick={() => startTest(d.label)}
                    disabled={!sessionId || isLoading}
                    className="group p-8 rounded-3xl bg-white/5 border-2 border-white/10 hover:border-white transition-all text-left flex items-center gap-6 relative overflow-hidden"
                  >
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">{d.icon}</div>
                    <div>
                      <span className="block font-black text-white uppercase tracking-tight text-base mb-1">{d.label}</span>
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">10 Challenges • 15 Mins</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {stage === 'testing' && currentQuestion && (
            <div className="space-y-8 animate-pop-up">
              <div className="bg-white/5 border-2 border-white/20 rounded-[3rem] p-10 lg:p-14 space-y-12 shadow-2xl relative">
                <div className="space-y-6">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Challenge {questionCount}</span>
                   </div>
                   <h3 className="text-3xl font-black text-white leading-[1.15] tracking-tight">
                     {currentQuestion.question}
                   </h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {currentQuestion.options.map((opt) => (
                    <button 
                      key={opt.key}
                      onClick={() => handleSelectOption(opt.key)}
                      disabled={isSubmitted || isLoading}
                      className={`p-7 rounded-[2rem] border-2 transition-all text-left flex items-start gap-6 font-bold text-xl ${getOptionClasses(opt.key)}`}
                    >
                      <span className="shrink-0 w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center text-sm font-black">{opt.key}</span>
                      <span className="leading-snug">{opt.text}</span>
                    </button>
                  ))}
                </div>

                {isSubmitted && (
                  <div className="pt-10 border-t border-white/10 flex flex-col gap-8 animate-pop-up">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                       <div className="flex items-center gap-4">
                         <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl shadow-xl ${selectedOption === currentQuestion.correctAnswer ? 'bg-emerald-500' : 'bg-red-500'}`}>
                           {selectedOption === currentQuestion.correctAnswer ? '✓' : '✕'}
                         </div>
                         <div>
                            <p className="font-black text-white uppercase text-xs tracking-widest mb-1">
                              {selectedOption === currentQuestion.correctAnswer ? 'Neural Logic Validated' : 'Signal Interference Detected'}
                            </p>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Evaluation complete.</p>
                         </div>
                       </div>
                       
                       <div className="flex gap-4 w-full md:w-auto">
                          <button 
                            onClick={() => setShowExplanation(!showExplanation)}
                            className="flex-1 md:flex-none px-10 py-4 bg-white/5 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all border border-white/10"
                          >
                            {showExplanation ? 'Hide Insight' : 'Show Insight'}
                          </button>
                          <button 
                            onClick={() => getNextQuestion()}
                            disabled={isLoading}
                            className="flex-1 md:flex-none px-14 py-4 bg-white text-indigo-900 font-black rounded-2xl shadow-2xl uppercase tracking-widest text-[10px] hover:scale-105 transition-all"
                          >
                            {isLoading ? 'Processing...' : (questionCount >= 10 ? 'Audit Results' : 'Next Question')}
                          </button>
                       </div>
                    </div>

                    {showExplanation && (
                      <div className="p-10 bg-indigo-500/10 rounded-[2.5rem] border border-indigo-500/20 animate-pop-up shadow-inner">
                        <div className="flex items-center gap-2 mb-4">
                           <span className="text-xl">🧬</span>
                           <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Strategic Insight</p>
                        </div>
                        <p className="text-white font-medium text-lg leading-relaxed italic">"{currentQuestion.explanation}"</p>
                      </div>
                    )}
                  </div>
                )}

                {error && <p className="text-red-400 text-center font-black uppercase text-[10px] tracking-widest bg-red-500/10 py-4 rounded-2xl border border-red-500/20">{error}</p>}
              </div>
            </div>
          )}

          {stage === 'result' && (
            <div className="space-y-8 animate-pop-up">
              <div className="bg-gradient-to-br from-indigo-900 to-purple-900 border-2 border-white/40 rounded-[4rem] p-12 lg:p-20 text-center space-y-12 shadow-2xl relative overflow-hidden">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#4f46e5_0%,_transparent_100%)] opacity-20"></div>
                 <div className="relative z-10">
                    <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center text-7xl mx-auto shadow-2xl animate-bounce mb-10 border border-white/20">🏆</div>
                    <h3 className="text-6xl font-black text-white uppercase tracking-tighter mb-4">Neural Audit Report</h3>
                    <p className="text-indigo-200 font-black uppercase tracking-widest text-sm">Placement Suitability Verified for {selectedDomain}</p>
                 </div>
                 
                 <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-xl mx-auto">
                    <div className="bg-black/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/10 shadow-2xl">
                       <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Verification Score</p>
                       <p className="text-7xl font-black text-white">{score}<span className="text-2xl text-white/30 font-bold ml-2">/ 10</span></p>
                    </div>
                    <div className="bg-black/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/10 shadow-2xl">
                       <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Hiring Readiness</p>
                       <p className="text-7xl font-black text-emerald-400">{score * 10}<span className="text-2xl font-bold ml-1">%</span></p>
                    </div>
                 </div>

                 <div className="relative z-10 bg-black/40 p-12 rounded-[3.5rem] border border-white/10 text-left backdrop-blur-md shadow-inner">
                    <div className="flex items-center gap-3 mb-6">
                       <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                       <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Industry Feedback & Recommendations</p>
                    </div>
                    <div className="whitespace-pre-wrap font-['Inter'] text-base text-white/70 leading-relaxed font-medium overflow-y-auto max-h-[400px] custom-scroll pr-6">
                      {finalReport}
                    </div>
                 </div>

                 <div className="relative z-10 flex flex-col sm:flex-row gap-6 pt-10 justify-center">
                    <button 
                      onClick={onBack}
                      className="px-20 py-6 bg-white text-indigo-900 font-black rounded-[2.5rem] uppercase text-sm tracking-widest hover:scale-105 shadow-2xl transition-all"
                    >
                      Mission Control
                    </button>
                    <button 
                      onClick={() => { setStage('intro'); setQuestionCount(0); setScore(0); setCurrentQuestion(null); }}
                      className="px-14 py-6 bg-white/10 text-white font-black rounded-[2.5rem] uppercase text-sm tracking-widest hover:bg-white/20 transition-all border border-white/20"
                    >
                      Retake Domain Lab
                    </button>
                 </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {isLoading && stage === 'testing' && !currentQuestion && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_30px_#4f46e5]"></div>
            <p className="text-[10px] font-black text-white uppercase tracking-[0.6em] animate-pulse">Syncing Neural Evaluation Grid...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockTest;
