
import React, { useState } from 'react';

interface LandingProps {
  onLogin: (name: string, email: string) => void;
}

const Landing: React.FC<LandingProps> = ({ onLogin }) => {
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
          <span className="font-black text-xl text-slate-900 tracking-tight">PrepTrack AI</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setIsLogin(true); setShowAuth(true); }}
            className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors px-4 py-2"
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
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center z-10">
        <div className="max-w-4xl space-y-8">
          <span className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-indigo-100 animate-pop-up">
            Next-Gen Placement Intelligence
          </span>
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] animate-pop-up stagger-1">
            Zero fluff.<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Prep-Track AI</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed animate-pop-up stagger-2">
            Master your career path with industry-grade AI tools. Standardized assessments, intelligent resume auditing, and real-time interview simulations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 animate-pop-up stagger-3">
            <button 
              onClick={() => setShowAuth(true)}
              className="w-full sm:w-auto px-12 py-5 bg-slate-900 text-white font-black rounded-2xl shadow-2xl hover:bg-black transition-all transform hover:scale-105 active:scale-95"
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
          <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl relative z-10 animate-pop-up">
            <button 
              onClick={() => setShowAuth(false)}
              className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{isLogin ? 'Welcome back' : 'Create Account'}</h2>
              <p className="text-slate-500 mt-2 font-medium">{isLogin ? 'Sign in to resume your path' : 'Join the elite placement circle'}</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900"
                    placeholder="John Doe"
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <input 
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900"
                  placeholder="name@company.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <input 
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900"
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
                className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
              >
                {isLogin ? "Need an account? Join" : "Already have an account? Sign In"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Intro Features */}
      <footer className="px-8 py-12 flex flex-wrap justify-center gap-10 border-t border-slate-100 bg-white/30 backdrop-blur-sm mt-auto z-10">
        <div className="flex items-center gap-4 animate-pop-up stagger-1">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm">📝</div>
          <div>
            <p className="text-sm font-black text-slate-900 leading-tight">AI Mock Test</p>
            <p className="text-xs font-medium text-slate-400">Standardized Verification</p>
          </div>
        </div>
        <div className="flex items-center gap-4 animate-pop-up stagger-2">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm">📄</div>
          <div>
            <p className="text-sm font-black text-slate-900 leading-tight">Resume Analyzer</p>
            <p className="text-xs font-medium text-slate-400">ATS Neural Audit</p>
          </div>
        </div>
        <div className="flex items-center gap-4 animate-pop-up stagger-3">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm">🤖</div>
          <div>
            <p className="text-sm font-black text-slate-900 leading-tight">AI Interview</p>
            <p className="text-xs font-medium text-slate-400">Real-time Simulations</p>
          </div>
        </div>
        <div className="flex items-center gap-4 animate-pop-up stagger-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm">🔍</div>
          <div>
            <p className="text-sm font-black text-slate-900 leading-tight">AI Job Match</p>
            <p className="text-xs font-medium text-slate-400">LinkedIn Opp Tracking</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
