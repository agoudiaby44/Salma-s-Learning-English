import { GoogleGenAI, Type, Schema } from "@google/genai";
import { StoryData, ReformulationFeedback, QuestionData, QuestionFeedback, AnswerStatus } from '../types';

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-3-flash-preview';

const SYSTEM_INSTRUCTION = `You are a helpful, benevolent, and encouraging English tutor named "Salma's Assistant". 
Your student is an L1 LLCER English student (University 1st year in English studies). 
Your goal is to help them improve reading comprehension and writing skills.
Always use simple, clear English suitable for an intermediate/advanced academic learner.
Be extremely encouraging. Never be rude.`;

export const generateStory = async (theme?: string): Promise<StoryData> => {
  const selectedTheme = theme || "a life lesson or cultural discovery";
  const prompt = `Write a short story (150-200 words) for a first-year English university student (L1 LLCER).
  Theme: ${selectedTheme}.
  Use clear vocabulary but appropriate for university level.
  Structure: Title, then the story.
  Do NOT include any explanations yet.
  
  Output JSON format:
  {
    "title": "Story Title",
    "content": "The full story text...",
    "theme": "${selectedTheme}"
  }`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      systemInstruction: SYSTEM_INSTRUCTION,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING },
          theme: { type: Type.STRING }
        },
        required: ["title", "content", "theme"]
      } as Schema
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as StoryData;
};

export const evaluateReformulation = async (story: string, userText: string): Promise<ReformulationFeedback> => {
  const prompt = `
  The student has rewritten the following story in their own words:
  
  STORY:
  ${story}
  
  STUDENT REFORMULATION:
  "${userText}"
  
  Analyze the student's text.
  1. Correct spelling and grammar errors.
  2. Provide a more natural, academic version (L1 LLCER level).
  3. Explain briefly why your version is better or what the main error was (in simple English).
  4. Determine if the attempt was good overall (true/false).
  
  Output JSON.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      systemInstruction: SYSTEM_INSTRUCTION,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          correction: { type: Type.STRING, description: "The student's text with errors fixed inline or listed." },
          improvedVersion: { type: Type.STRING, description: "A natural, correct version of the summary." },
          explanation: { type: Type.STRING, description: "Brief pedagogical explanation." },
          isGood: { type: Type.BOOLEAN, description: "Is it a decent attempt?" }
        },
        required: ["correction", "improvedVersion", "explanation", "isGood"]
      } as Schema
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as ReformulationFeedback;
};

export const generateQuestions = async (story: string): Promise<QuestionData[]> => {
  const prompt = `
  Generate 4 comprehension questions based on this story:
  "${story}"
  
  Mix open and closed questions.
  Focus on global comprehension and details.
  
  Output JSON: Array of objects with id and question text.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      systemInstruction: SYSTEM_INSTRUCTION,
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            question: { type: Type.STRING }
          },
          required: ["id", "question"]
        }
      } as Schema
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as QuestionData[];
};

export const evaluateAnswer = async (story: string, question: string, answer: string): Promise<QuestionFeedback> => {
  const prompt = `
  Context Story: ${story}
  Question: ${question}
  Student Answer: "${answer}"
  
  Evaluate the answer.
  1. Status: 'CORRECT' (good understanding and grammar), 'PARTIAL' (understood but grammar errors or missed nuance), 'INCORRECT' (wrong info).
  2. Correction: Fix mistakes in the student's sentence.
  3. Natural Version: How a native speaker might answer.
  4. Feedback Message: A short motivating comment for the feedback card (referring to the Black Cat mascot style).
  
  Output JSON.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      systemInstruction: SYSTEM_INSTRUCTION,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          status: { type: Type.STRING, enum: ["CORRECT", "PARTIAL", "INCORRECT"] },
          correction: { type: Type.STRING },
          naturalVersion: { type: Type.STRING },
          feedbackMessage: { type: Type.STRING }
        },
        required: ["status", "correction", "naturalVersion", "feedbackMessage"]
      } as Schema
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as QuestionFeedback;
};
