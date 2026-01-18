
import React, { useState, useEffect } from 'react';
import { createOnDemandSession, queryOnDemand } from '../services/onDemandService';

interface LandingProps {
  onLogin: (name: string, email: string) => void;
}

const MOTIVATION_API_KEY = "pfauKRrs2jWzy7KjGZQcgc6dYgxdPdE9";
const MOTIVATION_PROMPT = "You are the Career Motivation Engine for an AI-powered placement preparation platform. Objective: Generate short, high-energy motivational quotes that reset a student’s mindset before technical or HR interviews. User Context: Students may be stressed from coding practice, discouraged by rejections, or mentally fatigued. Tone: Empathetic, ambitious, professional, and tech-forward. Length Constraint: Each quote must be 15 words or fewer. Themes to Emphasize: Consistency over intensity, Growth mindset, Debugging failures like runtime errors, Discipline, preparation, and long-term success. Strict Constraints: Do not use generic clichés (e.g., “Just do it”, “Never give up”), Use technology-inspired language where relevant, Output only the quote, no explanations or emojis";

const Landing: React.FC<LandingProps> = ({ onLogin }) => {
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Motivation State
  const [motivation, setMotivation] = useState<string>("Initializing Career Catalyst...");
  const [isMotivationLoading, setIsMotivationLoading] = useState(false);

  const fetchMotivation = async () => {
    setIsMotivationLoading(true);
    try {
      // Use a generic ID for anonymous landing page users
      const sid = await createOnDemandSession("Guest", MOTIVATION_API_KEY);
      const quote = await queryOnDemand(sid, "Inspire me for my career journey today.", MOTIVATION_API_KEY, {
        fulfillmentPrompt: MOTIVATION_PROMPT,
        temperature: 0.6,
        maxTokens: 50
      });
      setMotivation(quote || "Your potential is a recursive function; keep calling it with better arguments.");
    } catch (e) {
      console.error("Motivation Error:", e);
      setMotivation("Debugging your path to success starts with one line of discipline today.");
    } finally {
      setIsMotivationLoading(false);
    }
  };

  useEffect(() => {
    fetchMotivation();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = isLogin ? (email.split('@')[0] || 'User') : name;
    onLogin(finalName, email);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Top Navigation */}
      <nav className="flex justify-between items-center px-8 py-6 z-50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-indigo-100 text-indigo-600 font-black text-2xl">
             P
          </div>
          <span className="font-black text-xl text-white tracking-tight">PrepTrack AI</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setIsLogin(true); setShowAuth(true); }}
            className="text-sm font-bold text-white/70 hover:text-white transition-colors px-4 py-2"
          >
            Sign In
          </button>
          <button 
            onClick={() => { setIsLogin(false); setShowAuth(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-100 transition-all transform hover:-translate-y-0.5"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center z-10 py-12">
        <div className="max-w-4xl space-y-8">
          <span className="inline-block px-4 py-1.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-indigo-500/20 animate-pop-up">
            Next-Gen Placement Intelligence
          </span>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] animate-pop-up stagger-1">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Prep-Track AI</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/60 font-medium max-w-2xl mx-auto leading-relaxed animate-pop-up stagger-2">
            Master your career path with industry-grade AI tools. Standardized assessments, intelligent resume auditing, and real-time interview simulations.
          </p>

          {/* MOTIVATION SECTION - LANDING PAGE ADAPTATION */}
          <div className="max-w-2xl mx-auto py-6 animate-pop-up stagger-2.5">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] flex flex-col md:flex-row items-center gap-6 shadow-2xl overflow-hidden">
                 <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl shadow-lg shrink-0 animate-pulse">⚡</div>
                 <div className="flex-1 text-center md:text-left">
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-1 block">Daily Career Fuel</span>
                    <p className={`text-base md:text-lg font-bold text-white tracking-tight italic transition-all duration-700 ${isMotivationLoading ? 'opacity-30 blur-sm' : 'opacity-100 blur-0'}`}>
                      "{motivation}"
                    </p>
                 </div>
                 <button 
                  onClick={fetchMotivation}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all group"
                  title="Refresh Spark"
                 >
                   <svg className={`w-4 h-4 text-white/30 group-hover:text-white transition-transform ${isMotivationLoading ? 'animate-spin' : 'group-hover:rotate-180 duration-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                   </svg>
                 </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-pop-up stagger-3">
            <button 
              onClick={() => setShowAuth(true)}
              className="w-full sm:w-auto px-12 py-5 bg-white text-indigo-900 font-black rounded-2xl shadow-2xl hover:bg-indigo-50 transition-all transform hover:scale-105 active:scale-95 uppercase tracking-widest text-sm"
            >
              Start Your Preparation
            </button>
          </div>
        </div>
      </main>

      {/* Auth Modal Overlay */}
      {showAuth && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" 
            onClick={() => setShowAuth(false)}
          ></div>
          <div className="w-full max-w-md bg-[#1e293b] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative z-10 animate-pop-up">
            <button 
              onClick={() => setShowAuth(false)}
              className="absolute top-6 right-6 p-2 text-white/30 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-white tracking-tight">{isLogin ? 'Welcome back' : 'Create Account'}</h2>
              <p className="text-white/50 mt-2 font-medium">{isLogin ? 'Sign in to resume your path' : 'Join the elite placement circle'}</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-white/5 focus:bg-white/10 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-white"
                    placeholder="John Doe"
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Email Address</label>
                <input 
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-white/5 focus:bg-white/10 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-white"
                  placeholder="name@company.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Password</label>
                <input 
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-white/5 focus:bg-white/10 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-white"
                  placeholder="••••••••"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 transition-all transform hover:-translate-y-1"
              >
                {isLogin ? 'Sign In' : 'Join Now'}
              </button>
            </form>
            <div className="mt-8 text-center">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-xs font-bold text-white/40 hover:text-indigo-400 transition-colors uppercase tracking-widest"
              >
                {isLogin ? "Need an account? Join" : "Already have an account? Sign In"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Intro Features */}
      <footer className="px-8 py-12 flex flex-wrap justify-center gap-10 border-t border-white/10 bg-black/20 backdrop-blur-sm mt-auto z-10">
        <div className="flex items-center gap-4 animate-pop-up stagger-1">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-white/10">📝</div>
          <div>
            <p className="text-sm font-black text-white leading-tight">AI Mock Test</p>
            <p className="text-xs font-medium text-white/40">Standardized Verification</p>
          </div>
        </div>
        <div className="flex items-center gap-4 animate-pop-up stagger-2">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-white/10">📄</div>
          <div>
            <p className="text-sm font-black text-white leading-tight">Resume Analyzer</p>
            <p className="text-xs font-medium text-white/40">ATS Neural Audit</p>
          </div>
        </div>
        <div className="flex items-center gap-4 animate-pop-up stagger-3">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-white/10">🤖</div>
          <div>
            <p className="text-sm font-black text-white leading-tight">AI Interview</p>
            <p className="text-xs font-medium text-white/40">Real-time Simulations</p>
          </div>
        </div>
        <div className="flex items-center gap-4 animate-pop-up stagger-4">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-white/10">🔍</div>
          <div>
            <p className="text-sm font-black text-white leading-tight">AI Job Match</p>
            <p className="text-xs font-medium text-white/40">LinkedIn Opp Tracking</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
