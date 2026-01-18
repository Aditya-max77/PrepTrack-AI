
import React, { useState, useEffect } from 'react';
import { createOnDemandSession, queryOnDemand } from '../services/onDemandService';

interface TechScoutProps {
  userName: string;
  onBack: () => void;
}

const TECHSCOUT_API_KEY = "wCzqvtkZYmckXlez75or91O08Yx6kCLM";

const FULFILLMENT_PROMPT = `You are TechScout AI, an intelligent assistant for students preparing for placements, interviews, and skill development. Your task is to process technology news and provide concise, actionable, and student-focused summaries with resource recommendations.

Follow these instructions carefully:
1. Tech News Summary: Summarize the latest developments in 2–3 sentences. Highlight relevance to skills, projects, or interview preparation. Include links for verification if possible.
2. AI-Powered Resource Recommendations: Suggest 1–2 free or high-quality learning resources (tutorials, projects, GitHub repos, or articles) relevant to the topic. Explain why the resource is useful for placement preparation.
3. Trending Skills & Insights: Identify any trending technologies, tools, or frameworks relevant to placements.
4. Q&A Support: If a student asks a related question, provide concise, actionable answers with links.

Format Response Clearly:
Tech News:
- Title – Summary. [Source Link]

Recommended Resources:
- Resource Name – Explanation. [Link]

Trending Skills:
- Skill / Technology – Reason / Reference. [Link]

Guidelines:
- Do not invent news or sources.
- Keep the total response under 250 words for easy readability.
- Maintain a friendly, encouraging, student-focused tone.
- Use plain text bullet points and headings. Avoid markdown symbols like bold/italic.`;

const TechScout: React.FC<TechScoutProps> = ({ userName, onBack }) => {
  const [query, setQuery] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const id = await createOnDemandSession(userName, TECHSCOUT_API_KEY);
        setSessionId(id);
      } catch (err: any) {
        console.error("TechScout Session Init Error:", err);
        setError("Failed to connect to the TechScout engine. Try again later.");
      }
    };
    init();
  }, [userName]);

  const handleSearch = async (customQuery?: string) => {
    const finalQuery = customQuery || query;
    if (!finalQuery.trim() || !sessionId || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    setResult(null);

    const modelConfigs = {
      fulfillmentPrompt: FULFILLMENT_PROMPT,
      stopSequences: [],
      temperature: 0.3,
      topP: 0.85,
      maxTokens: 900,
      presencePenalty: 0.1,
      frequencyPenalty: 0.2,
    };

    try {
      const answer = await queryOnDemand(sessionId, finalQuery, TECHSCOUT_API_KEY, modelConfigs);
      setResult(answer);
    } catch (err) {
      setError("Failed to fetch tech insights. The neural bridge timed out.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormattedResult = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s\]]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-cyan-400 hover:text-white underline decoration-cyan-500/30 hover:decoration-white transition-all break-all"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const quickPrompts = [
    "Latest AI developments this week",
    "Trending Web Dev frameworks 2024",
    "Big Tech hiring trends for freshers",
    "Recent Cyber Security threats and resources"
  ];

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden animate-pop-up relative z-10 font-['Inter']">
      <header className="bg-white/10 backdrop-blur-xl border-b border-white/10 px-8 py-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-xl text-white/50 hover:text-white transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center text-white text-xl shadow-[0_0_15px_rgba(8,145,178,0.3)]">📰</div>
             <div>
                <h2 className="font-black text-white text-lg leading-tight uppercase tracking-tight">TechScout</h2>
                <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Intelligent Tech Navigator</p>
             </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto custom-scroll">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="bg-gradient-to-br from-indigo-900/60 to-cyan-900/60 backdrop-blur-3xl rounded-[3rem] border-2 border-white/30 shadow-2xl p-10 lg:p-14 space-y-8 animate-pop-up">
            <div className="text-center">
              <h3 className="text-3xl font-black text-white uppercase tracking-tight">Tech Insight Portal</h3>
              <p className="text-white/50 mt-2 font-medium">Get actionable summaries of the latest industry shifts and learning assets.</p>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <input 
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="e.g. What's new in the world of Deep Learning?"
                  className="w-full bg-white/5 border-2 border-white/20 rounded-3xl py-6 px-8 text-white outline-none focus:border-cyan-400/50 transition-all font-bold text-lg pr-32"
                />
                <button 
                  onClick={() => handleSearch()}
                  disabled={isLoading || !query.trim() || !sessionId}
                  className="absolute right-4 top-4 bottom-4 px-8 bg-cyan-600 text-white font-black rounded-2xl shadow-xl uppercase tracking-widest text-[10px] disabled:opacity-30 transition-all active:scale-95"
                >
                  Scout
                </button>
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                {quickPrompts.map((p, i) => (
                  <button 
                    key={i} 
                    onClick={() => { setQuery(p); handleSearch(p); }}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-white/50 uppercase tracking-widest hover:bg-white/10 hover:text-cyan-400 transition-all"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-red-400 text-center font-black uppercase text-[10px] tracking-widest bg-red-500/10 py-3 rounded-xl border border-red-500/20">{error}</p>}

            {isLoading && (
              <div className="flex flex-col items-center py-10 gap-6 animate-pulse">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Parsing Global Tech Signals...</p>
              </div>
            )}

            {result && (
              <div className="mt-10 animate-pop-up">
                <div className="bg-black/40 border-2 border-white/10 rounded-[2.5rem] p-10 space-y-8 shadow-inner overflow-hidden">
                   <div className="flex justify-between items-center border-b border-white/10 pb-6">
                      <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Intelligence Report</span>
                      <button onClick={() => setResult(null)} className="text-[10px] font-black text-white/30 uppercase tracking-widest hover:text-white transition-colors">Clear Result</button>
                   </div>
                   <div className="whitespace-pre-wrap font-['Inter'] text-sm text-white/80 leading-relaxed font-medium">
                      {renderFormattedResult(result)}
                   </div>
                </div>
              </div>
            )}
          </div>

          <div className="text-center pb-20">
             <button onClick={onBack} className="px-16 py-6 bg-white text-indigo-900 font-black rounded-[2rem] uppercase text-xs tracking-widest hover:scale-105 shadow-2xl transition-all">Back to Mission Control</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TechScout;
