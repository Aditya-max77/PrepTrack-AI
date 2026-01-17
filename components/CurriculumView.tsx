
import React, { useState, useMemo, useEffect } from 'react';
import { Domain, UserProgress, Topic } from '../types';
import { DOMAIN_INFO, CURRICULUM } from '../data/curriculum';

interface CurriculumViewProps {
  domain: Domain;
  language: string;
  level: string;
  progress: UserProgress;
  onBack: () => void;
  onToggleComplete: (id: string) => void;
}

const CurriculumView: React.FC<CurriculumViewProps> = ({ domain, language, level, progress, onBack, onToggleComplete }) => {
  const info = DOMAIN_INFO[domain];
  const [activeTopicIdx, setActiveTopicIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<'video' | 'notes' | 'practice'>('video');

  const activePath = useMemo(() => {
    return CURRICULUM.find(p => 
      p.domain === domain && 
      p.languageOrTech === language && 
      p.level === level
    );
  }, [domain, language, level]);

  useEffect(() => {
    setActiveTopicIdx(0);
    setActiveTab('video');
  }, [language, level]);

  const pathKey = `${domain}-${language}-${level}`;
  const pathScore = progress.scores[pathKey];

  const currentTopic = activePath?.topics[activeTopicIdx];
  const totalTopics = activePath?.topics.length || 0;
  const completedCount = activePath?.topics.filter(t => progress.completedTopicIds.includes(t.id)).length || 0;
  const progressPercent = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  // Explicitly type the result and initial value to ensure groupedTopics is recognized as a Record
  const groupedTopics = useMemo<Record<string, { topic: Topic; originalIdx: number }[]>>(() => {
    const initialGroups: Record<string, { topic: Topic; originalIdx: number }[]> = {};
    if (!activePath) return initialGroups;
    return activePath.topics.reduce((acc, topic, idx) => {
      const moduleName = topic.moduleName || 'Core Concepts';
      if (!acc[moduleName]) acc[moduleName] = [];
      acc[moduleName].push({ topic, originalIdx: idx });
      return acc;
    }, initialGroups);
  }, [activePath]);

  const getYoutubeEmbedUrl = (videoId: string) => {
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=0`;
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden font-['Inter'] animate-pop-up relative z-10">
      <header className="bg-white/10 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack} 
            className="group flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-xl transition-all text-white/50 hover:text-white"
          >
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
          </button>
          <div className="h-8 w-[1px] bg-white/10"></div>
          <div>
            <h2 className="font-black text-white text-lg leading-tight tracking-tight uppercase">
              {language}
            </h2>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{info.title} • {level}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end mr-4">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Overall Progress</span>
            <div className="flex items-center gap-3">
              <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-white transition-all duration-1000 shadow-[0_0_8px_white]" style={{ width: `${progressPercent}%` }}></div>
              </div>
              <span className="text-sm font-black text-white">{progressPercent}%</span>
            </div>
          </div>
          {pathScore !== undefined && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl flex items-center gap-3">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Grade</span>
              <span className="text-xl font-black text-emerald-400 leading-none">{pathScore}/10</span>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 bg-black/20 backdrop-blur-md border-r border-white/10 overflow-y-auto shrink-0 flex flex-col">
          <div className="p-6">
            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-6 px-2">Path Syllabus</h3>
            
            <div className="space-y-8">
              {/* Fix: Using Object.keys instead of Object.entries for more reliable type inference across environments */}
              {Object.keys(groupedTopics).map((moduleName) => {
                const items = groupedTopics[moduleName];
                return (
                  <div key={moduleName}>
                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 px-2 border-l-2 border-indigo-500/40 ml-1">
                      {moduleName}
                    </h4>
                    <div className="space-y-1">
                      {items.map(({ topic, originalIdx }) => {
                        const isCompleted = progress.completedTopicIds.includes(topic.id);
                        const isActive = activeTopicIdx === originalIdx;
                        
                        return (
                          <button
                            key={topic.id}
                            onClick={() => { setActiveTopicIdx(originalIdx); setActiveTab('video'); }}
                            className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 group ${
                              isActive 
                                ? 'bg-white text-indigo-900 shadow-xl' 
                                : 'hover:bg-white/5 text-white/50'
                            }`}
                          >
                            <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                              isCompleted 
                                ? (isActive ? 'bg-indigo-600 text-white' : 'bg-emerald-500 text-white') 
                                : (isActive ? 'bg-indigo-200 text-indigo-900' : 'bg-white/10 text-white/40')
                            }`}>
                              {isCompleted ? (
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                              ) : (
                                <span className="text-[9px] font-black">{originalIdx + 1}</span>
                              )}
                            </div>
                            <p className={`text-[11px] font-bold leading-tight uppercase tracking-tight ${isActive ? 'text-indigo-900' : 'text-white/70'}`}>
                              {topic.title}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-10 lg:p-14 custom-scroll">
          {activePath && currentTopic ? (
            <div className="max-w-4xl mx-auto space-y-10">
              <div className="bg-gradient-to-br from-indigo-900/60 to-purple-900/60 backdrop-blur-3xl rounded-[3rem] border-2 border-white/50 shadow-2xl overflow-hidden animate-pop-up relative">
                <div className="p-10 lg:p-14">
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] bg-white/10 px-3 py-1 rounded-full border border-white/10">{currentTopic.moduleName}</span>
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Module {activeTopicIdx + 1}</span>
                  </div>
                  <h1 className="text-4xl font-black text-white tracking-tight mb-4 uppercase">{currentTopic.title}</h1>
                  <p className="text-lg text-white/60 mb-10 font-medium">{currentTopic.description}</p>

                  <div className="flex gap-2 bg-black/20 p-2 rounded-[1.8rem] mb-12 inline-flex border border-white/10">
                    <button onClick={() => setActiveTab('video')} className={`px-8 py-3 rounded-[1.2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'video' ? 'bg-white text-indigo-900 shadow-xl' : 'text-white/40 hover:text-white'}`}>Video Lab</button>
                    <button onClick={() => setActiveTab('notes')} className={`px-8 py-3 rounded-[1.2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'notes' ? 'bg-white text-indigo-900 shadow-xl' : 'text-white/40 hover:text-white'}`}>Theory</button>
                    <button onClick={() => setActiveTab('practice')} className={`px-8 py-3 rounded-[1.2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'practice' ? 'bg-white text-indigo-900 shadow-xl' : 'text-white/40 hover:text-white'}`}>Practice</button>
                  </div>

                  <div className="min-h-[400px]">
                    {activeTab === 'video' && (
                      <div className="space-y-6">
                        {currentTopic.resources.filter(r => r.type === 'video').map((res, i) => (
                          <div key={i} className="aspect-video w-full rounded-[2.5rem] overflow-hidden border-[6px] border-black/40 bg-black shadow-2xl relative flex items-center justify-center">
                             {res.videoId ? (
                               <iframe 
                                 width="100%" 
                                 height="100%" 
                                 src={getYoutubeEmbedUrl(res.videoId!)} 
                                 frameBorder="0" 
                                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                 allowFullScreen
                                 className="absolute inset-0"
                               ></iframe>
                             ) : (
                               <div className="flex flex-col items-center justify-center text-center p-8">
                                  <div className="text-6xl mb-4 opacity-20">📽️</div>
                                  <p className="text-white/40 font-black uppercase tracking-[0.3em] text-sm">Course Yet to be Launched</p>
                                  <p className="text-white/20 text-xs mt-2">Check back soon for this module's video lecture.</p>
                               </div>
                             )}
                          </div>
                        ))}
                      </div>
                    )}
                    {activeTab === 'notes' && (
                      <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10">
                        <h4 className="text-xl font-black text-white mb-4 italic leading-tight">Mastering {currentTopic.title}</h4>
                        <p className="text-white/70 leading-relaxed mb-8 text-lg">{currentTopic.description}</p>
                        <div className="p-8 bg-black/40 rounded-3xl border border-white/10 font-mono text-sm text-indigo-300 shadow-inner">
                           <span className="text-white/20">// High-Priority Concepts</span><br/>
                           - Recursive logic optimization<br/>
                           - Performance tracking enabled<br/>
                           - Domain: {domain}
                        </div>
                      </div>
                    )}
                    {activeTab === 'practice' && (
                      <div className="space-y-4">
                        {currentTopic.practiceProblems.map((prob, i) => (
                          <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-[2rem] font-black text-white flex items-center justify-between group hover:bg-white/10 transition-all">
                            <span className="text-sm uppercase tracking-tight">{prob}</span>
                            <button className="px-6 py-2 bg-white text-indigo-900 text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-xl">Solve Now</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-16 flex flex-col md:flex-row gap-6 justify-between items-center border-t border-white/10 pt-10">
                    <button 
                      onClick={() => onToggleComplete(currentTopic.id)}
                      className={`w-full md:w-auto px-12 py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 border-2 ${
                        progress.completedTopicIds.includes(currentTopic.id)
                          ? 'bg-emerald-500 border-white text-white shadow-2xl shadow-emerald-500/20'
                          : 'bg-white border-white text-indigo-900 shadow-2xl hover:scale-105 active:scale-95'
                      }`}
                    >
                      {progress.completedTopicIds.includes(currentTopic.id) ? 'Mastery Verified' : 'Verify Mastery'}
                    </button>
                    <div className="flex gap-4 w-full md:w-auto">
                       <button 
                        disabled={activeTopicIdx === 0} 
                        onClick={() => setActiveTopicIdx(prev => prev - 1)} 
                        className="flex-1 md:flex-none px-8 py-5 rounded-3xl bg-white/5 text-white/50 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all disabled:opacity-20"
                       >
                         Previous
                       </button>
                       <button 
                        disabled={activeTopicIdx === totalTopics - 1} 
                        onClick={() => setActiveTopicIdx(prev => prev + 1)} 
                        className="flex-1 md:flex-none px-12 py-5 bg-white/10 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all disabled:opacity-20 border border-white/10"
                       >
                         Next
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-center p-12">
                <div className="text-6xl mb-10 drop-shadow-2xl">🧠</div>
                <h3 className="text-3xl font-black text-white tracking-tighter uppercase">Initializing Engine...</h3>
                <p className="text-lg text-white/40 mt-4 max-w-sm font-medium">
                  Gathering specific resources for <strong>{language}</strong> level mastery.
                </p>
                <div className="mt-12">
                   <button onClick={onBack} className="px-12 py-4 bg-white text-indigo-900 font-black rounded-2xl shadow-2xl uppercase text-[10px] tracking-widest">Abort & Exit</button>
                </div>
             </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CurriculumView;
