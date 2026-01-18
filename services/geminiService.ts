
import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSpeech = async (text: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Say this professionally: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) return null;
  
  return base64Audio;
};

export const generateInterviewQuestion = async (
  domain: string, 
  level: string, 
  company: string, 
  round: number, 
  resumeText: string,
  history: { question: string, answer: string }[]
) => {
  const roundContext = [
    "Round 1: Fundamentals. Focus on basic concepts from the resume and domain.",
    "Round 2: Application & Scenarios. Ask real-world or project-based questions specifically from the resume experience.",
    "Round 3: Advanced / Problem Solving. Ask one industry-level challenging question related to the company tech stack.",
    "Round 4: HR & Communication. Focus on confidence, clarity, and decision-making scenarios."
  ][round - 1];

  const contents = `Act as a senior technical recruiter at ${company}. 
  Target Round: ${roundContext}
  Candidate Level: ${level}
  Candidate Domain: ${domain}
  Candidate Resume Summary: ${resumeText}
  Previous Context: ${JSON.stringify(history)}

  Rules:
  1. ONLY ask about skills/projects mentioned in the resume.
  2. If the previous answer was shallow, ask a deep follow-up.
  3. Return ONLY the question text. Keep it concise.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents,
  });
  return response.text;
};

export const getFinalInterviewReport = async (
  company: string,
  domain: string,
  resumeText: string,
  history: { question: string, answer: string, round: number }[],
  cheatingFlags: string[]
) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the following interview data and generate a comprehensive evaluation report.
    Company: ${company}
    Domain: ${domain}
    Resume: ${resumeText}
    Interview Transcript: ${JSON.stringify(history)}
    Technical Flags: ${JSON.stringify(cheatingFlags)}
    
    You MUST respond with ONLY valid JSON matching the schema provided.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          company: { type: Type.STRING },
          overall_score: { type: Type.NUMBER },
          grade: { type: Type.STRING },
          round_scores: {
            type: Type.OBJECT,
            properties: {
              round_1: { type: Type.NUMBER },
              round_2: { type: Type.NUMBER },
              round_3: { type: Type.NUMBER },
              round_4: { type: Type.NUMBER }
            }
          },
          skills: {
            type: Type.OBJECT,
            properties: {
              conceptual: { type: Type.NUMBER },
              problem_solving: { type: Type.NUMBER },
              communication: { type: Type.NUMBER },
              confidence: { type: Type.NUMBER },
              practical_application: { type: Type.NUMBER }
            }
          },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          resume_analysis: {
            type: Type.OBJECT,
            properties: {
              verified_skills: { type: Type.ARRAY, items: { type: Type.STRING } },
              weakly_supported_skills: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          cheating_detection: {
            type: Type.OBJECT,
            properties: {
              cheating_score: { type: Type.NUMBER },
              risk_level: { type: Type.STRING },
              flags: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          charts: {
            type: Type.OBJECT,
            properties: {
              pie: {
                type: Type.OBJECT,
                properties: {
                  strength: { type: Type.NUMBER },
                  weakness: { type: Type.NUMBER }
                }
              },
              bar: {
                type: Type.OBJECT,
                properties: {
                  conceptual: { type: Type.NUMBER },
                  problem_solving: { type: Type.NUMBER },
                  communication: { type: Type.NUMBER },
                  confidence: { type: Type.NUMBER },
                  practical: { type: Type.NUMBER }
                }
              }
            }
          },
          final_feedback: { type: Type.STRING },
          hiring_recommendation: {
            type: Type.OBJECT,
            properties: {
              decision: { type: Type.STRING },
              justification: { type: Type.STRING }
            }
          }
        },
        required: [
          "company", "overall_score", "grade", "round_scores", "skills", 
          "strengths", "weaknesses", "resume_analysis", "cheating_detection", 
          "charts", "final_feedback", "hiring_recommendation"
        ]
      }
    }
  });
  return JSON.parse(response.text);
};
