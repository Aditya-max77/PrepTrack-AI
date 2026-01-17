
import React, { useState, useEffect, useRef } from 'react';
import { createOnDemandSession, queryOnDemand } from '../services/onDemandService';
import { generateSpeech } from '../services/geminiService';

interface InterviewSimProps {
  onBack: () => void;
}

const CONDUCT_API_KEY = "WZgMGwOlAbGsrcq2c716Zsqs30HvsRmb";
const EVAL_API_KEY = "HCT3NbN6xnkDPIB4qt7GBglMSurNDjKf";

const INTERVIEW_DOMAINS = [
  { id: 'DSA', label: 'Data Structure and analysis', icon: '📊' },
  { id: 'ML', label: 'Machine Learning', icon: '🤖' },
  { id: 'WebDev', label: 'Web Development', icon: '🌐' },
  { id: 'CyberSecurity', label: 'Cyber Security', icon: '🛡️' },
  { id: 'DataScience', label: 'Data science', icon: '📈' },
];

const CONDUCT_PROMPT = `You are an AI Mock Interviewer conducting a realistic technical interview.

Interview Domain: {{domain}}

Your objectives:
- Simulate a real technical interview.
- Ask clear, domain-specific questions.
- Adapt difficulty gradually from basic to intermediate.
- Evaluate the candidate’s answers professionally.

Interview Rules:
1. Ask ONLY one question at a time.
2. Display the question clearly in text so it can be spoken aloud accurately.
3. Do NOT ask multiple questions together.
4. After the candidate responds, evaluate the answer as:
   - Correct
   - Partially Correct
   - Incorrect
5. Give brief, constructive feedback (1–2 lines).
6. If the answer is incorrect, explain the mistake briefly and continue.
7. Ask a follow-up question only if it is logically required.
8. Maintain a calm, professional interviewer tone at all times.

Domain Question Guidelines:
- DSA: arrays, strings, basic algorithms, time & space complexity
- Web Development: HTML, CSS, JavaScript, React basics, APIs
- Cyber Security: networking basics, threats, authentication, web security
- Machine Learning: ML concepts, models, training, evaluation metrics
- Data Science: Python, statistics, data handling, SQL, basic analysis

Do NOT:
- Reveal full solutions immediately
- Give long explanations
- Change domains mid-interview
- Ask casual or non-technical questions

Start the interview with a short greeting and then ask the first question.

Output Format (STRICT):

Question:
<single interview question>`;

const EVAL_PROMPT = `You are an expert Interview Evaluation Agent designed for placement preparation.

Your task is to evaluate a candidate’s interview response in a realistic, industry-level manner.

Context:
- Target Role: {{role}}
- Interview Transcript: 
{{transcript}}

Evaluation Guidelines:
- Judge as a real technical interviewer.
- Be unbiased, specific, and practical.
- Do not hallucinate skills not mentioned by the candidate.
- Penalize vague, incorrect, or incomplete explanations.
- Reward clarity, correctness, and structured thinking.

Evaluation Parameters (Score each from 0 to 10):
1. Technical Accuracy – correctness of concepts and facts.
2. Conceptual Depth – understanding beyond surface-level explanation.
3. Communication Clarity – structure, flow, and clarity of explanation.
4. Confidence & Professional Tone – assertiveness and interview readiness.
5. Problem-Solving Approach – logical reasoning and approach (if applicable).

Scoring Rules:
- 0–3: Poor / incorrect
- 4–6: Average / partial understanding
- 7–8: Good / mostly correct
- 9–10: Excellent / industry-ready

Tasks:
1. Assign a score for each parameter.
2. Calculate total score out of 50.
3. Identify key strengths based strictly on the answer.
4. Identify weaknesses or gaps.
5. Provide clear, actionable improvement suggestions.
6. Give a final interview readiness verdict.

Output Format (STRICT — do not change):
Don't include bold, italics and #, *

Technical Accuracy: X/10  
Conceptual Depth: X/10  
Communication Clarity: X/10  
Confidence & Professional Tone: X/10  
Problem-Solving Approach: X/10  

Total Score: XX/50  

Strengths:
- point
- point

Weaknesses:
- point
- point

Improvement Suggestions:
- suggestion
- suggestion

Final Verdict:
(Choose ONE: Interview Ready / Needs Improvement / Not Interview Ready)`;

interface EvaluationReport {
  scores: { label: string; value: number }[];
  totalScore: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  verdict: string;
  raw: string;
}

const InterviewSim: React.FC<InterviewSimProps> = ({ onBack }) => {
  const [stage, setStage] = useState<'intro' | 'interviewing' | 'feedback'>('intro');
  const [selectedDomain, setSelectedDomain] = useState<string>('DSA');
  const [currentRound, setCurrentRound] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [history, setHistory] = useState<{ question: string; answer: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [report, setReport] = useState<EvaluationReport | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const initWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (e) { console.error(e); }
  };

  const playAudio = async (base64: string) => {
    if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const buffer = await audioContextRef.current.decodeAudioData(bytes.buffer);
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.start(0);
  };

  const initRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.onresult = (e: any) => {
        let text = '';
        for (let i = e.resultIndex; i < e.results.length; ++i) {
          if (e.results[i].isFinal) text += e.results[i][0].transcript + ' ';
        }
        setTranscript(prev => prev + text);
      };
      recognitionRef.current = recognition;
    }
  };

  const startInterview = async () => {
    setIsLoading(true);
    setStage('interviewing');
    await initWebcam();
    initRecognition();
    const domainLabel = INTERVIEW_DOMAINS.find(d => d.id === selectedDomain)?.label || selectedDomain;
    try {
      const sid = await createOnDemandSession("Candidate", CONDUCT_API_KEY);
      setSessionId(sid);
      const query = `Initiate interview for ${domainLabel}.`;
      const configs = {
        fulfillmentPrompt: CONDUCT_PROMPT.replace('{{domain}}', domainLabel),
        temperature: 0.6,
        topP: 1,
        maxTokens: 600,
      };
      const rawQ = await queryOnDemand(sid, query, CONDUCT_API_KEY, configs);
      const q = rawQ.replace(/Question:/i, '').trim();
      setCurrentQuestion(q);
      const audio = await generateSpeech(q);
      if (audio) playAudio(audio);
    } catch (e) {
      setCurrentQuestion("Interview engine failed. Please restart.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    if (!transcript.trim() || !sessionId) return;
    setIsLoading(true);
    const updatedHistory = [...history, { question: currentQuestion, answer: transcript }];
    setHistory(updatedHistory);
    const lastAnswer = transcript;
    setTranscript('');
    setIsRecording(false);
    if (recognitionRef.current) recognitionRef.current.stop();

    if (currentRound < 4) {
      try {
        const nextRound = currentRound + 1;
        setCurrentRound(nextRound);
        const domainLabel = INTERVIEW_DOMAINS.find(d => d.id === selectedDomain)?.label || selectedDomain;
        const query = `Answer: ${lastAnswer}`;
        const configs = {
          fulfillmentPrompt: CONDUCT_PROMPT.replace('{{domain}}', domainLabel),
          temperature: 0.6,
          topP: 1,
          maxTokens: 600,
        };
        const rawQ = await queryOnDemand(sessionId, query, CONDUCT_API_KEY, configs);
        const q = rawQ.replace(/Question:/i, '').trim();
        setCurrentQuestion(q);
        const audio = await generateSpeech(q);
        if (audio) playAudio(audio);
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
    } else {
      await generateReport(updatedHistory);
    }
  };

  const parseEvaluation = (text: string): EvaluationReport => {
    const scores: { label: string; value: number }[] = [];
    const lines = text.split('\n');
    lines.forEach(line => {
      const match = line.match(/(.+):\s*(\d+)\/10/);
      if (match) scores.push({ label: match[1].trim(), value: parseInt(match[2]) });
    });

    const totalScore = text.match(/Total Score:\s*(\d+\/50)/)?.[1] || text.match(/Total Score:\s*(.+)/)?.[1] || 'N/A';
    const verdict = text.match(/Final Verdict:\s*(.+)/)?.[1] || 'N/A';

    const extractSection = (header: string) => {
      const start = text.indexOf(header);
      if (start === -1) return [];
      const rest = text.substring(start + header.length);
      const endIdx = rest.search(/\n[A-Za-z]+:/);
      const content = (endIdx === -1 ? rest : rest.substring(0, endIdx)).split('\n');
      return content.map(l => l.replace(/^[-*]\s*/, '').trim()).filter(l => l.length > 0);
    };

    return {
      scores,
      totalScore,
      strengths: extractSection('Strengths:'),
      weaknesses: extractSection('Weaknesses:'),
      suggestions: extractSection('Improvement Suggestions:'),
      verdict,
      raw: text
    };
  };

  const generateReport = async (finalHistory: { question: string; answer: string }[]) => {
    setIsLoading(true);
    try {
      const domainLabel = INTERVIEW_DOMAINS.find(d => d.id === selectedDomain)?.label || selectedDomain;
      const transcriptStr = finalHistory.map((h, i) => `Round ${i+1}\nQ: ${h.question}\nA: ${h.answer}`).join('\n\n');
      
      // Use the EVAL_API_KEY for the analysis session
      const sid = await createOnDemandSession("Candidate", EVAL_API_KEY);
      
      const query = `Analyze the following interview transcript for a ${domainLabel} placement role. 
      Provide a detailed industry-standard report.
      
      TRANSCRIPT:
      ${transcriptStr}`;

      const configs = {
        fulfillmentPrompt: EVAL_PROMPT.replace('{{role}}', domainLabel).replace('{{transcript}}', transcriptStr),
        temperature: 0.2,
        topP: 0.9,
        maxTokens: 900,
        stopSequences: ["[\"###\"]", "[\"Final Verdict:\"]"],
        presencePenalty: 0.1,
        frequencyPenalty: 0.3,
      };

      const result = await queryOnDemand(sid, query, EVAL_API_KEY, configs);
      setReport(parseEvaluation(result));
      setStage('feedback');
      if (videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    } catch (e) {
      console.error(e);
      alert("Evaluation failed. The analysis engine encountered an error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-[#0F172A] flex flex-col font-['Inter'] relative overflow-hidden">
      <header className="px-8 py-5 border-b border-white/10 flex items-center justify-between backdrop-blur-md bg-white/5 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-xl transition-all">
            <svg className="w-6 h-6 text-white/50 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black">P</div>
            <div>
              <h2 className="text-white font-black uppercase text-sm tracking-tight">Interview Lab</h2>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Technical Simulation</p>
            </div>
          </div>
        </div>
        {stage === 'interviewing' && (
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(r => (
              <div key={r} className={`h-1.5 w-10 rounded-full transition-all ${r <= currentRound ? 'bg-indigo-500 shadow-[0_0_10px_#6366f1]' : 'bg-white/10'}`}></div>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1 p-8 overflow-y-auto custom-scroll flex flex-col">
        {stage === 'intro' && (
          <div className="max-w-xl mx-auto w-full space-y-10 my-auto animate-pop-up">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Select Your Domain</h1>
              <p className="text-white/50 font-medium">Choose a specialized track for your mock simulation.</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {INTERVIEW_DOMAINS.map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDomain(d.id)}
                  className={`flex items-center gap-4 p-6 rounded-[2rem] border-2 transition-all text-left ${selectedDomain === d.id ? 'bg-indigo-600 border-white shadow-2xl' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                >
                  <span className="text-3xl">{d.icon}</span>
                  <span className={`font-black uppercase tracking-tight ${selectedDomain === d.id ? 'text-white' : 'text-white/70'}`}>{d.label}</span>
                </button>
              ))}
            </div>
            <button onClick={startInterview} className="w-full py-6 bg-white text-indigo-900 font-black rounded-[2rem] shadow-2xl transition-all hover:scale-105 active:scale-95 uppercase tracking-widest text-sm">Launch Pro Session</button>
          </div>
        )}

        {stage === 'interviewing' && (
          <div className="flex-1 flex flex-col lg:flex-row gap-10 animate-pop-up">
            <div className="flex-[1.5] flex flex-col gap-6 h-full">
              <div className="relative rounded-[3rem] overflow-hidden border-2 border-white/10 bg-black aspect-video flex-1 shadow-2xl">
                <video ref={videoRef} autoPlay muted className="w-full h-full object-cover scale-x-[-1]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-10 left-10 right-10 text-center">
                  <div className="inline-block px-8 py-4 bg-black/60 backdrop-blur-xl rounded-[2rem] border border-white/10">
                    <p className="text-white text-xl font-bold leading-relaxed">{isRecording ? (transcript || "Listening...") : (currentQuestion || "Calibrating AI...")}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => { if(isRecording) recognitionRef.current.stop(); else recognitionRef.current.start(); setIsRecording(!isRecording); }} className={`py-6 rounded-3xl font-black uppercase text-xs tracking-widest transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}`}>
                  {isRecording ? '🛑 Stop Audio' : '🎙️ Record Answer'}
                </button>
                <button onClick={handleNext} disabled={isLoading || !transcript.trim()} className="py-6 bg-indigo-600 text-white font-black rounded-3xl shadow-xl transition-all disabled:opacity-20 uppercase tracking-widest text-xs">
                  {isLoading ? 'Analyzing...' : 'Submit Step'}
                </button>
              </div>
              <button onClick={() => generateReport(history)} className="w-full py-4 text-white/30 hover:text-red-400 font-black uppercase tracking-widest text-[10px] transition-colors">End Interview Early & Analyze</button>
            </div>
            <div className="flex-1 bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-10 flex flex-col">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-indigo-500/20 rounded-full mx-auto flex items-center justify-center text-5xl animate-pulse">🤖</div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">AI Recruiter</h3>
                <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">Evaluating Live Signals</p>
              </div>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scroll">
                <h4 className="text-[10px] font-black text-white/30 uppercase tracking-widest">Session Log</h4>
                {history.map((h, i) => (
                  <div key={i} className="p-4 bg-black/20 rounded-2xl border border-white/5 space-y-2">
                    <p className="text-[10px] font-black text-indigo-400">Q: {h.question.substring(0, 60)}...</p>
                    <p className="text-[10px] text-white/50">A: {h.answer.substring(0, 60)}...</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {stage === 'feedback' && report && (
          <div className="max-w-5xl mx-auto w-full space-y-12 pb-24 animate-pop-up">
            <div className="text-center space-y-6">
              <span className="px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 font-black uppercase text-[10px] tracking-widest">Post-Session Audit</span>
              <h1 className="text-[6rem] md:text-[8rem] font-black text-white leading-none tracking-tighter drop-shadow-2xl uppercase">
                {report.verdict.toLowerCase().includes('needs improvement') ? 'IMPROVE' : 
                 report.verdict.toLowerCase().includes('not interview ready') ? 'FAIL' : 'READY'}
              </h1>
              <p className="text-3xl font-black text-indigo-400 tracking-tight uppercase">{report.totalScore}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {report.scores.map(s => (
                <div key={s.label} className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] space-y-4 text-center">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest leading-tight block h-8">{s.label}</span>
                  <span className="text-4xl font-black text-white">{s.value}<span className="text-xs text-white/20">/10</span></span>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${s.value * 10}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="bg-emerald-500/5 border border-emerald-500/20 p-10 rounded-[3rem] space-y-6">
                  <h3 className="text-xl font-black text-emerald-400 uppercase tracking-tight">Core Strengths</h3>
                  <div className="space-y-3">
                    {report.strengths.map((s, i) => <div key={i} className="flex gap-4 text-sm text-emerald-200/70 font-medium"><span className="text-emerald-400">✦</span>{s}</div>)}
                  </div>
               </div>
               <div className="bg-red-500/5 border border-red-500/20 p-10 rounded-[3rem] space-y-6">
                  <h3 className="text-xl font-black text-red-400 uppercase tracking-tight">Gaps Detected</h3>
                  <div className="space-y-3">
                    {report.weaknesses.map((w, i) => <div key={i} className="flex gap-4 text-sm text-red-200/70 font-medium"><span className="text-red-400">✦</span>{w}</div>)}
                  </div>
               </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-12 rounded-[3.5rem] space-y-8">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">Expert Verdict & Improvement Roadmap</h3>
              <div className="p-8 bg-black/40 rounded-3xl border border-white/5">
                 <p className="text-white font-black text-lg mb-4 uppercase tracking-tighter">Status: {report.verdict}</p>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    {report.suggestions.map((s, i) => (
                      <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-2xl text-xs text-white/60 font-medium leading-relaxed italic">"{s}"</div>
                    ))}
                 </div>
              </div>
            </div>

            <div className="flex justify-center gap-6 pt-10">
              <button onClick={onBack} className="px-16 py-6 bg-white text-indigo-900 font-black rounded-[2rem] uppercase tracking-widest text-xs hover:scale-105 transition-all">Back to Mission Control</button>
              <button onClick={() => { setStage('intro'); setReport(null); setHistory([]); setCurrentRound(1); }} className="px-16 py-6 bg-indigo-600 text-white font-black rounded-[2rem] uppercase tracking-widest text-xs hover:scale-105 transition-all">Restart Simulation</button>
            </div>
          </div>
        )}
      </main>

      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xl flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-[10px] font-black text-white uppercase tracking-[0.5em] animate-pulse">Neural Audit Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewSim;
