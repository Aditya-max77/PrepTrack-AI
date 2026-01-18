
import React, { useState, useEffect } from 'react';
import { createOnDemandSession, queryOnDemand } from '../services/onDemandService';

interface MockAssessmentProps {
  userName: string;
  onBack: () => void;
}

const ASSESSMENT_API_KEY = "vQvSINSTvR6KW130XkTIOodLLe4dKRS6";

const FULFILLMENT_PROMPT = `You are a Mock Assessment Agent designed for placement preparation.

STEP 1: QUESTION GENERATION
Generate exactly 5 MCQ questions based on the selected domain.

Rules:
- Difficulty level: Medium (placement level)
- Ask questions one by one
- Each question must have exactly 4 options (A, B, C, D)
- Only one option is correct
- Do NOT show the correct answer while asking questions

Wait for user answer after each question.

STEP 2: ANSWER EVALUATION
After all 5 questions are answered, evaluate the responses.

STEP 3: RESULT GENERATION
Generate a detailed assessment report including:
1. Total Score (out of 5)
2. Question-wise analysis (Question, User Answer, Correct Answer, Result, Explanation)
3. Performance Summary
4. AI Suggestions

Output Format for questions:
Question: <text>
A) <opt>
B) <opt>
C) <opt>
D) <opt>

Output Format for report (STRICT):
Mock Assessment Report
Domain: <domain>
Score: X / 5
Question-wise Analysis:
... (details)
Performance Summary:
- point
AI Suggestions:
- suggestion`;

const DOMAINS = [
  { id: 'DSA', label: 'DSA', icon: '📊' },
  { id: 'WebDev', label: 'Web Development', icon: '🌐' },
  { id: 'ML', label: 'Machine Learning', icon: '🤖' },
  { id: 'DataScience', label: 'Data Science', icon: '📈' },
  { id: 'CyberSecurity', label: 'Cyber Security', icon: '🛡️' },
];

interface ParsedQuestion {
  text: string;
  options: { key: string; text: string }[];
}

const MockAssessment: React.FC<MockAssessmentProps> = ({ userName, onBack }) => {
  const [stage, setStage] = useState<'intro' | 'testing' | 'report'>('intro');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<ParsedQuestion | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [report, setReport] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const id = await createOnDemandSession(userName, ASSESSMENT_API_KEY);
        setSessionId(id);
      } catch (err: any) {
        setError("Neural link failed. Please check connection.");
      }
    };
    init();
  }, [userName]);

  const parseQuestion = (text: string): ParsedQuestion => {
    const lines = text.split('\n');
    let questionText = "";
    const options: { key: string; text: string }[] = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('A)') || trimmed.startsWith('B)') || trimmed.startsWith('C)') || trimmed.startsWith('D)')) {
        options.push({ key: trimmed.charAt(0), text: trimmed.substring(2).trim() });
      } else if (trimmed && !trimmed.toLowerCase().includes('correct answer')) {
        questionText += trimmed + " ";
      }
    });

    return { text: questionText.replace(/Question:/i, '').trim(), options };
  };

  const startAssessment = async (domain: string) => {
    if (!sessionId || isLoading) return;
    setIsLoading(true);
    setSelectedDomain(domain);
    setStage('testing');
    setQuestionCount(0);
    setUserAnswers([]);

    const query = `Start assessment for domain: ${domain}. Provide Question 1.`;
    const modelConfigs = {
      fulfillmentPrompt: FULFILLMENT_PROMPT.replace('{{domain}}', domain),
      temperature: 0.3,
      topP: 1,
      maxTokens: 800,
      presencePenalty: 0.1,
      frequencyPenalty: 0.2,
    };

    try {
      const answer = await queryOnDemand(sessionId, query, ASSESSMENT_API_KEY, modelConfigs);
      setCurrentQuestion(parseQuestion(answer));
      setQuestionCount(1);
    } catch (err) {
      setError("Failed to fetch initial challenge.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = async (answerKey: string) => {
    if (!sessionId || isLoading) return;
    setIsLoading(true);
    const newAnswers = [...userAnswers, answerKey];
    setUserAnswers(newAnswers);

    if (questionCount < 5) {
      const query = `My answer to Q${questionCount} is ${answerKey}. Provide Question ${questionCount + 1}.`;
      try {
        const answer = await queryOnDemand(sessionId, query, ASSESSMENT_API_KEY, {
          fulfillmentPrompt: FULFILLMENT_PROMPT.replace('{{domain}}', selectedDomain),
          temperature: 0.3,
          maxTokens: 500
        });
        setCurrentQuestion(parseQuestion(answer));
        setQuestionCount(prev => prev + 1);
      } catch (err) {
        setError("Sync error during assessment.");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Evaluate all answers
      const query = `My answer to Q5 is ${answerKey}. All questions answered. Evaluate and provide the Mock Assessment Report. 
      User answers for reference: ${newAnswers.join(', ')}`;
      
      try {
        const result = await queryOnDemand(sessionId, query, ASSESSMENT_API_KEY, {
          fulfillmentPrompt: FULFILLMENT_PROMPT.replace('{{domain}}', selectedDomain).replace('{{user_answers}}', newAnswers.join(', ')),
          temperature: 0.3,
          maxTokens: 1000,
          stopSequences: ["[\"AI Suggestions:\"]"]
        });
        setReport(result);
        setStage('report');
      } catch (err) {
        setError("Evaluation failed. The audit engine timed out.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden animate-pop-up relative z-10 font-['Inter'] bg-[#0F172A]">
      <header className="bg-white/10 backdrop-blur-xl border-b border-white/10 px-8 py-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-xl text-white/50 hover:text-white transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl">📝</div>
             <div>
                <h2 className="font-black text-white text-lg leading-tight uppercase tracking-tight">AI Mock Assessment</h2>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{selectedDomain || 'Skill Audit Engine'}</p>
             </div>
          </div>
        </div>
        {stage === 'testing' && (
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Progress</span>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(i => (
                <div key={i} className={`h-1.5 w-8 rounded-full transition-all ${i <= questionCount ? 'bg-indigo-500 shadow-[0_0_10px_#6366f1]' : 'bg-white/10'}`}></div>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto custom-scroll flex flex-col items-center justify-center">
        {stage === 'intro' && (
          <div className="max-w-xl w-full space-y-8 animate-pop-up">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Choose Domain</h1>
              <p className="text-white/50 font-medium">Select a technical domain for your adaptive 5-question audit.</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {DOMAINS.map(d => (
                <button
                  key={d.id}
                  onClick={() => startAssessment(d.label)}
                  disabled={!sessionId || isLoading}
                  className="flex items-center justify-between p-6 rounded-[2rem] bg-white/5 border-2 border-white/10 hover:border-white transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:bg-white/10 transition-colors">{d.icon}</span>
                    <span className="font-black text-white/80 uppercase tracking-tight group-hover:text-white transition-colors">{d.label}</span>
                  </div>
                  <svg className="w-6 h-6 text-white/20 group-hover:text-white transition-all transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {stage === 'testing' && currentQuestion && (
          <div className="max-w-3xl w-full bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-3xl rounded-[3rem] border-2 border-white/20 shadow-2xl p-10 lg:p-14 space-y-10 animate-pop-up">
            <div className="space-y-4">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Question {questionCount} of 5</span>
              <h2 className="text-2xl font-black text-white leading-tight tracking-tight uppercase">
                {currentQuestion.text}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => handleAnswer(opt.key)}
                  disabled={isLoading}
                  className="flex items-start gap-5 p-6 rounded-2xl bg-white/5 border-2 border-white/10 hover:border-white transition-all text-left group hover:bg-white/10"
                >
                  <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black shrink-0 group-hover:scale-110 transition-transform">{opt.key}</span>
                  <span className="text-white/80 font-bold uppercase tracking-tight group-hover:text-white transition-colors">{opt.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {stage === 'report' && report && (
          <div className="max-w-4xl w-full space-y-10 pb-20 animate-pop-up">
            <div className="bg-white/5 border-2 border-white/20 rounded-[3rem] p-10 lg:p-14 space-y-10 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-10">
                 <div className="w-40 h-40 bg-white rounded-full blur-3xl"></div>
               </div>
               
               <div className="text-center space-y-4">
                  <span className="px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 font-black uppercase text-[10px] tracking-widest">Technical Performance Report</span>
                  <h1 className="text-5xl font-black text-white uppercase tracking-tighter">Mock Assessment Summary</h1>
               </div>

               <div className="bg-black/30 rounded-[2.5rem] p-10 border border-white/10">
                 <pre className="whitespace-pre-wrap font-['Inter'] text-sm text-white/80 leading-relaxed text-left font-medium">
                   {report}
                 </pre>
               </div>

               <div className="flex gap-4">
                 <button onClick={onBack} className="flex-1 py-6 bg-white/10 text-white font-black rounded-3xl uppercase tracking-widest text-xs hover:bg-white/20 transition-all border border-white/10">Mission Control</button>
                 <button onClick={() => setStage('intro')} className="flex-1 py-6 bg-white text-indigo-900 font-black rounded-3xl shadow-2xl uppercase tracking-widest text-xs hover:scale-105 transition-all">New Assessment</button>
               </div>
            </div>
          </div>
        )}
      </main>

      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-[10px] font-black text-white uppercase tracking-[0.4em] animate-pulse">Syncing Neural Core...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[100] bg-red-500/90 backdrop-blur-md text-white px-8 py-4 rounded-2xl shadow-2xl font-black uppercase text-[10px] tracking-widest animate-pop-up border border-white/20">
          {error}
        </div>
      )}
    </div>
  );
};

export default MockAssessment;
