
import React, { useState, useEffect } from 'react';
import { createOnDemandSession, queryOnDemand } from '../services/onDemandService';
import { Domain, Level } from '../types';
import { DOMAIN_INFO } from '../data/curriculum';

interface MentorAIProps {
  userName: string;
  onBack: () => void;
}

const ROADMAP_API_KEY = "FaDCgjgcKciTy6byT5uE9nKLiEA8D2DU";

const FULFILLMENT_PROMPT = `You are a Mentor Agent for placement preparation on an on-demand learning platform.

Your responsibility is to generate a personalized and practical study roadmap for students based only on the details provided.

When student details are given, do the following:

Carefully understand:
Target job role
Current skill level
Daily or weekly available study time
Total preparation duration

Design a clear, step-by-step study roadmap that fits the student’s time and level.
Divide the roadmap into logical phases or months according to the total preparation duration.

For each phase or month, clearly include the following sections:
Topics to study
Daily or weekly study plan
Practice tasks
Mock tests and interview practice

Keep the language very simple and beginner-friendly.
Use short sentences
Avoid advanced or technical terminology
Explain tasks in an easy-to-follow way

Make the roadmap realistic and achievable.
Do not overload any day or week
Balance learning, practice, and revision
Focus on steady progress and consistency

Present the roadmap in a clean and readable plain-text format.
Use clear headings
Use simple bullet points
Leave spacing between sections for clarity

Do not ask follow-up questions.
Do not include any extra explanation outside the roadmap.
Do not use:
Bold text
Italics
Hashtags
Stars
Markdown formatting
Emojis

Return only the final study roadmap.`;

const MentorAI: React.FC<MentorAIProps> = ({ userName, onBack }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    selectedDomains: [] as Domain[],
    domainLevels: {} as Record<string, Level>,
    dailyHours: '4',
    duration: '3 Months',
    weakAreas: ''
  });
  
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const id = await createOnDemandSession(userName, ROADMAP_API_KEY);
        setSessionId(id);
      } catch (err) {
        console.error("Roadmap Session Init Error:", err);
      }
    };
    init();
  }, [userName]);

  const toggleDomain = (d: Domain) => {
    setFormData(prev => {
      const isSelected = prev.selectedDomains.includes(d);
      const newDomains = isSelected 
        ? prev.selectedDomains.filter(item => item !== d)
        : [...prev.selectedDomains, d];
      
      const newLevels = { ...prev.domainLevels };
      if (!isSelected) {
        newLevels[d] = 'Beginner';
      } else {
        delete newLevels[d];
      }

      return { ...prev, selectedDomains: newDomains, domainLevels: newLevels };
    });
  };

  const setLevelForDomain = (d: Domain, l: Level) => {
    setFormData(prev => ({
      ...prev,
      domainLevels: { ...prev.domainLevels, [d]: l }
    }));
  };

  const generateRoadMap = async () => {
    if (!sessionId || isLoading) return;
    setIsLoading(true);
    setStep(100);

    const domainDetails = formData.selectedDomains.map(d => 
      `${DOMAIN_INFO[d].title} (${formData.domainLevels[d]} level)`
    ).join(', ');

    const query = `Target Role/Domains: ${domainDetails}
Daily Available Study Time: ${formData.dailyHours} hours per day
Total Preparation Duration: ${formData.duration}
Weak Areas to focus on: ${formData.weakAreas || "None specified"}`;

    const modelConfigs = {
      fulfillmentPrompt: FULFILLMENT_PROMPT,
      stopSequences: [],
      temperature: 0.5,
      topP: 0.5,
      maxTokens: 700,
      presencePenalty: 0.3,
      frequencyPenalty: 0.3,
    };

    try {
      const answer = await queryOnDemand(sessionId, query, ROADMAP_API_KEY, modelConfigs);
      setResult(answer);
    } catch (err) {
      setResult("Engine failure. We couldn't synthesize your roadmap. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden animate-pop-up relative z-10 font-['Inter']">
      <header className="bg-white/10 backdrop-blur-xl border-b border-white/10 px-8 py-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-xl text-white/50 hover:text-white transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white text-xl">🗺️</div>
             <div>
                <h2 className="font-black text-white text-lg leading-tight uppercase tracking-tight">Road Map Architect</h2>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Personalized Strategy Builder</p>
             </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10 overflow-hidden">
        <div className="max-w-2xl w-full bg-gradient-to-br from-indigo-900/60 to-purple-900/60 backdrop-blur-3xl rounded-[3rem] border-2 border-white/30 shadow-2xl flex flex-col overflow-hidden animate-pop-up">
          <div className="p-10 lg:p-14 space-y-8 flex-1 overflow-y-auto custom-scroll">
            {step === 1 && (
              <div className="space-y-6 animate-pop-up">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-black text-white uppercase tracking-tight">Select Target Domains</h3>
                  <p className="text-white/50 mt-2">Which placement tracks are we optimizing for?</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {(Object.keys(DOMAIN_INFO) as Domain[]).map(d => (
                    <button 
                      key={d}
                      onClick={() => toggleDomain(d)}
                      className={`p-6 rounded-3xl border-2 transition-all text-left flex items-center gap-4 ${formData.selectedDomains.includes(d) ? 'bg-white border-white shadow-xl scale-105' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                    >
                      <span className="text-2xl">{DOMAIN_INFO[d].icon}</span>
                      <span className={`font-black text-xs uppercase tracking-widest ${formData.selectedDomains.includes(d) ? 'text-indigo-900' : 'text-white/70'}`}>{DOMAIN_INFO[d].title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-pop-up">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-black text-white uppercase tracking-tight">Skill Levels</h3>
                  <p className="text-white/50 mt-2">Set proficiency for each domain.</p>
                </div>
                <div className="space-y-4">
                  {formData.selectedDomains.map(d => (
                    <div key={d} className="bg-black/20 p-6 rounded-3xl border border-white/10">
                      <div className="flex justify-between items-center mb-4">
                         <span className="font-black text-white uppercase text-xs">{DOMAIN_INFO[d].title}</span>
                      </div>
                      <div className="flex gap-1 bg-black/40 p-1 rounded-xl">
                        {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map(l => (
                          <button key={l} onClick={() => setLevelForDomain(d, l as Level)} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${formData.domainLevels[d] === l ? 'bg-white text-indigo-900 shadow-sm' : 'text-white/40'}`}>
                            {l.substring(0, 3)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-pop-up text-center">
                <h3 className="text-3xl font-black text-white uppercase tracking-tight">Daily Hours</h3>
                <div className="py-10">
                   <span className="text-8xl font-black text-white">{formData.dailyHours}</span>
                   <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] mt-2">Hours Per Day</p>
                </div>
                <input type="range" min="1" max="16" value={formData.dailyHours} onChange={(e) => setFormData({...formData, dailyHours: e.target.value})} className="w-full accent-white" />
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-pop-up text-center">
                <h3 className="text-3xl font-black text-white uppercase tracking-tight">Prep Duration</h3>
                <div className="grid grid-cols-1 gap-4 mt-8">
                  {['1 Month', '3 Months', '6 Months', 'Self-Paced'].map(d => (
                    <button key={d} onClick={() => setFormData({...formData, duration: d})} className={`p-5 rounded-2xl border-2 transition-all font-black uppercase tracking-widest text-xs ${formData.duration === d ? 'bg-white border-white text-indigo-900 shadow-xl' : 'bg-white/5 border-white/10 text-white/50'}`}>{d}</button>
                  ))}
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6 animate-pop-up">
                <h3 className="text-3xl font-black text-white uppercase tracking-tight text-center">Weak Areas</h3>
                <textarea 
                  value={formData.weakAreas}
                  onChange={(e) => setFormData({...formData, weakAreas: e.target.value})}
                  placeholder="e.g. Dynamic Programming, Graph Theory, System Design..."
                  className="w-full h-48 bg-white/5 border-2 border-white/20 rounded-[2.5rem] p-8 text-white outline-none focus:border-white/40 transition-all font-medium"
                />
              </div>
            )}

            {step === 100 && (
              <div className="space-y-6 animate-pop-up">
                {isLoading ? (
                  <div className="flex flex-col items-center py-20 gap-6">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Architecting Path...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-8 bg-black/20 rounded-[2.5rem] border border-white/10 overflow-x-hidden">
                       <pre className="whitespace-pre-wrap font-['Inter'] text-sm text-white/80 leading-relaxed text-left">{result}</pre>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => setStep(1)} className="flex-1 py-4 bg-white/10 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest">Restart</button>
                      <button onClick={onBack} className="flex-1 py-4 bg-white text-indigo-900 font-black rounded-2xl uppercase text-[10px] tracking-widest">Done</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isLoading && step < 100 && (
              <div className="flex gap-4 pt-4">
                {step > 1 && <button onClick={() => setStep(s => s-1)} className="flex-1 py-5 bg-white/5 text-white/60 font-black rounded-2xl uppercase tracking-widest text-xs">Back</button>}
                <button 
                  onClick={step === 5 ? generateRoadMap : () => setStep(s => s+1)}
                  disabled={step === 1 && formData.selectedDomains.length === 0}
                  className="flex-[2] py-5 bg-white text-indigo-900 font-black rounded-2xl shadow-2xl transition-all uppercase tracking-widest text-xs"
                >
                  {step === 5 ? 'Build Road Map' : 'Continue'}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MentorAI;
