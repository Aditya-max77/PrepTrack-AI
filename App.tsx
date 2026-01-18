
import React, { useState, useEffect } from 'react';
import { Domain, UserProgress, UserPreferences } from './types';
import Landing from './components/Landing';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import CurriculumView from './components/CurriculumView';
import InterviewSim from './components/InterviewSim';
import MentorAI from './components/MentorAI';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import JobMatch from './components/JobMatch';
import TechScout from './components/TechScout';
import MockAssessment from './components/MockAssessment';
import CodeChallenge from './components/CodeChallenge';

const App: React.FC = () => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [currentPage, setCurrentPage] = useState<'landing' | 'onboarding' | 'dashboard' | 'curriculum' | 'interview' | 'mentor' | 'analyzer' | 'jobmatch' | 'techscout' | 'mockassessment' | 'codechallenge'>('landing');
  const [activePathParams, setActivePathParams] = useState<{ domain: Domain; language: string; level: string } | null>(null);
  
  const [progress, setProgress] = useState<UserProgress>({
    completedTopicIds: [],
    activeDomains: [],
    scores: {}
  });

  useEffect(() => {
    const savedProgress = localStorage.getItem('preptrack_progress_v3');
    const savedUser = localStorage.getItem('preptrack_user_v3');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      if (savedProgress) {
        const p = JSON.parse(savedProgress);
        setProgress(p);
        if (p.preferences) {
          setCurrentPage('dashboard');
        } else {
          setCurrentPage('onboarding');
        }
      } else {
        setCurrentPage('onboarding');
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('preptrack_progress_v3', JSON.stringify(progress));
    }
  }, [progress, user]);

  const handleLogin = (name: string, email: string) => {
    const newUser = { name, email };
    setUser(newUser);
    localStorage.setItem('preptrack_user_v3', JSON.stringify(newUser));
    if (progress.preferences) {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('onboarding');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setProgress({
      completedTopicIds: [],
      activeDomains: [],
      scores: {}
    });
    setActivePathParams(null);
    localStorage.removeItem('preptrack_user_v3');
    localStorage.removeItem('preptrack_progress_v3');
    setCurrentPage('landing');
  };

  const handleOnboardingComplete = (prefs: UserPreferences) => {
    setProgress(prev => ({
      ...prev,
      preferences: prefs,
      activeDomains: prefs.selectedDomains,
    }));
    setCurrentPage('dashboard');
  };

  const toggleTopicCompletion = (id: string) => {
    setProgress(prev => ({
      ...prev,
      completedTopicIds: prev.completedTopicIds.includes(id)
        ? prev.completedTopicIds.filter(tid => tid !== id)
        : [...prev.completedTopicIds, id]
    }));
  };

  const renderPage = () => {
    if (!user && currentPage !== 'landing') return <Landing onLogin={handleLogin} />;

    switch (currentPage) {
      case 'landing':
        return <Landing onLogin={handleLogin} />;
      case 'onboarding':
        return <Onboarding onComplete={handleOnboardingComplete} />;
      case 'dashboard':
        return (
          <Dashboard 
            user={user!} 
            progress={progress} 
            onSelectDomain={(d, lang, lvl) => { 
              setActivePathParams({ domain: d, language: lang, level: lvl }); 
              setCurrentPage('curriculum'); 
            }}
            onNavigateInterview={() => setCurrentPage('interview')}
            onNavigateMentor={() => setCurrentPage('mentor')}
            onNavigateAnalyzer={() => setCurrentPage('analyzer')}
            onNavigateJobMatch={() => setCurrentPage('jobmatch')}
            onNavigateTechScout={() => setCurrentPage('techscout')}
            onNavigateMockAssessment={() => setCurrentPage('mockassessment')}
            onNavigateCodeChallenge={() => setCurrentPage('codechallenge')}
            onLogout={handleLogout}
            onUpdatePrefs={() => setCurrentPage('onboarding')}
          />
        );
      case 'curriculum':
        return (
          <CurriculumView 
            domain={activePathParams!.domain} 
            language={activePathParams!.language}
            level={activePathParams!.level}
            progress={progress}
            onBack={() => setCurrentPage('dashboard')}
            onToggleComplete={toggleTopicCompletion}
          />
        );
      case 'interview':
        return <InterviewSim onBack={() => setCurrentPage('dashboard')} />;
      case 'mentor':
        return <MentorAI userName={user?.name || 'User'} onBack={() => setCurrentPage('dashboard')} />;
      case 'analyzer':
        return <ResumeAnalyzer userName={user?.name || 'User'} onBack={() => setCurrentPage('dashboard')} />;
      case 'jobmatch':
        return <JobMatch userName={user?.name || 'User'} onBack={() => setCurrentPage('dashboard')} />;
      case 'techscout':
        return <TechScout userName={user?.name || 'User'} onBack={() => setCurrentPage('dashboard')} />;
      case 'mockassessment':
        return <MockAssessment userName={user?.name || 'User'} onBack={() => setCurrentPage('dashboard')} />;
      case 'codechallenge':
        return <CodeChallenge userName={user?.name || 'User'} onBack={() => setCurrentPage('dashboard')} />;
      default:
        return <Landing onLogin={handleLogin} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {renderPage()}
    </div>
  );
};

export default App;
