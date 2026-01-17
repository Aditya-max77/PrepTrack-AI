
import React, { useState } from 'react';
import { Domain, Level, UserPreferences, DomainConfig } from '../types';
import { DOMAIN_INFO } from '../data/curriculum';

interface OnboardingProps {
  onComplete: (prefs: UserPreferences) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [selectedDomains, setSelectedDomains] = useState<Domain[]>([]);
  const [domainConfigs, setDomainConfigs] = useState<Record<Domain, DomainConfig>>({} as any);

  const toggleDomain = (domain: Domain) => {
    setSelectedDomains(prev => {
      const isCurrentlySelected = prev.includes(domain);
      const next = isCurrentlySelected ? prev.filter(d => d !== domain) : [...prev, domain];
      
      if (!isCurrentlySelected) {
        const info = DOMAIN_INFO[domain];
        setDomainConfigs(configs => ({
          ...configs,
          [domain]: {
            domain,
            language: info.languages[0],
            level: 'Beginner',
            libraries: domain === 'ML' ? (info as any).frameworks?.slice(0, 1) : [],
            focusAreas: [],
            addOns: []
          }
        }));
      } else {
        setDomainConfigs(configs => {
          const newConfigs = { ...configs };
          delete newConfigs[domain];
          return newConfigs;
        });
      }
      return next;
    });
  };

  const updateConfig = (domain: Domain, updates: Partial<DomainConfig>) => {
    setDomainConfigs(prev => ({
      ...prev,
      [domain]: { ...prev[domain], ...updates }
    }));
  };

  const toggleLibrary = (domain: Domain, lib: string) => {
    const config = domainConfigs[domain];
    const libs = config.libraries || [];
    const newLibs = libs.includes(lib) ? libs.filter(l => l !== lib) : [...libs, lib];
    updateConfig(domain, { libraries: newLibs });
  };

  const handleFinish = () => {
    onComplete({
      selectedDomains,
      configs: domainConfigs
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative z-10">
      <div className="max-w-4xl w-full bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] border-2 border-white/30 shadow-[0_0_80px_rgba(0,0,0,0.5)] p-10 lg:p-14 animate-pop-up relative overflow-hidden">
        <div className="flex justify-center gap-2 mb-10">
          <div className={`h-1.5 w-12 rounded-full transition-all ${step === 1 ? 'bg-indigo-400 shadow-[0_0_10px_#818cf8]' : 'bg-white/10'}`}></div>
          <div className={`h-1.5 w-12 rounded-full transition-all ${step === 2 ? 'bg-indigo-400 shadow-[0_0_10px_#818cf8]' : 'bg-white/10'}`}></div>
        </div>

        {step === 1 ? (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="text-center">
              <h1 className="text-4xl font-black text-white tracking-tight uppercase">Domain Selection</h1>
              <p className="text-white/50 mt-3 font-medium text-lg">Select the paths you want to master for your placements.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(Object.keys(DOMAIN_INFO) as Domain[]).map(domain => (
                <button
                  key={domain}
                  onClick={() => toggleDomain(domain)}
                  className={`flex items-center gap-4 p-6 rounded-3xl border-2 transition-all text-left ${
                    selectedDomains.includes(domain)
                      ? 'bg-gradient-to-br from-indigo-600 to-purple-700 border-white shadow-2xl shadow-indigo-500/20'
                      : 'border-white/10 hover:border-white/20 bg-white/5'
                  }`}
                >
                  <span className="text-3xl drop-shadow-lg">{DOMAIN_INFO[domain].icon}</span>
                  <div>
                    <span className={`block font-black text-lg ${selectedDomains.includes(domain) ? 'text-white' : 'text-white/70'}`}>
                      {DOMAIN_INFO[domain].title}
                    </span>
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Placement Track</span>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={selectedDomains.length === 0}
              className="w-full py-5 bg-white text-indigo-900 font-black rounded-2xl shadow-2xl transition-all transform hover:-translate-y-1 disabled:opacity-30 disabled:translate-y-0 uppercase tracking-widest text-sm"
            >
              Configure Tracks
            </button>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-10 duration-500">
            <div className="text-center">
              <h1 className="text-4xl font-black text-white tracking-tight uppercase">Configuration</h1>
              <p className="text-white/50 mt-3 font-medium text-lg">Customize your choices for each selected domain.</p>
            </div>

            <div className="space-y-8 max-h-[50vh] overflow-y-auto px-2 custom-scroll pr-4">
              {selectedDomains.map(domain => {
                const info = DOMAIN_INFO[domain] as any;
                const config = domainConfigs[domain];
                if (!config) return null;

                return (
                  <div key={domain} className="p-8 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-[2.5rem] border-2 border-white/20 space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{info.icon}</span>
                      <h3 className="font-black text-xl text-white uppercase tracking-tight">{info.title}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Language Selection */}
                      {info.languages && info.languages.length > 0 && (
                        <div>
                          <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-3 block">Language / Tool</label>
                          <div className="flex flex-wrap gap-2">
                            {info.languages.map((lang: string) => (
                              <button
                                key={lang}
                                onClick={() => updateConfig(domain, { language: lang })}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${config.language === lang ? 'bg-white text-indigo-900 shadow-xl' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                              >
                                {lang}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Framework Selection (Special for ML) */}
                      {domain === 'ML' && info.frameworks && (
                        <div>
                          <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-3 block">Frameworks</label>
                          <div className="flex flex-wrap gap-2">
                            {info.frameworks.map((lib: string) => (
                              <button
                                key={lib}
                                onClick={() => toggleLibrary(domain, lib)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${config.libraries?.includes(lib) ? 'bg-indigo-400 text-white shadow-xl' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                              >
                                {lib}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Level Selection */}
                      <div>
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-3 block">Expertise Level</label>
                        <div className="flex bg-black/20 p-1 rounded-xl border border-white/5">
                          {['Beginner', 'Intermediate', 'Expert'].map(l => (
                            <button
                              key={l}
                              onClick={() => updateConfig(domain, { level: l as Level })}
                              className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${config.level === l ? 'bg-white text-indigo-900 shadow-sm' : 'text-white/40'}`}
                            >
                              {l}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-5 bg-white/5 text-white/60 font-black rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest text-xs"
              >
                Go Back
              </button>
              <button
                onClick={handleFinish}
                className="flex-[2] py-5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black rounded-2xl shadow-2xl transition-all transform hover:-translate-y-1 border-2 border-white/20 uppercase tracking-widest text-xs"
              >
                Begin Training
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
