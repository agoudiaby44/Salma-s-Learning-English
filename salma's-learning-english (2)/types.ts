export enum AppPhase {
  SETUP = 'SETUP',
  STORY_LOADING = 'STORY_LOADING',
  STORY_READING = 'STORY_READING',
  REFORMULATION_INPUT = 'REFORMULATION_INPUT',
  REFORMULATION_FEEDBACK = 'REFORMULATION_FEEDBACK',
  QUESTIONS_LOADING = 'QUESTIONS_LOADING',
  QUESTION_ANSWERING = 'QUESTION_ANSWERING',
  QUESTION_FEEDBACK = 'QUESTION_FEEDBACK',
  SESSION_COMPLETE = 'SESSION_COMPLETE',
}

export enum MascotMood {
  NEUTRAL = 'NEUTRAL',
  HAPPY = 'HAPPY',
  SAD_ENCOURAGING = 'SAD_ENCOURAGING',
  THINKING = 'THINKING',
  WAITING = 'WAITING'
}

export interface StoryData {
  title: string;
  content: string;
  theme: string;
}

export interface ReformulationFeedback {
  correction: string;
  improvedVersion: string;
  explanation: string;
  isGood: boolean;
}

export interface QuestionData {
  id: number;
  question: string;
}

export enum AnswerStatus {
  CORRECT = 'CORRECT',
  PARTIAL = 'PARTIAL',
  INCORRECT = 'INCORRECT'
}

export interface QuestionFeedback {
  status: AnswerStatus;
  correction: string;
  naturalVersion: string;
  feedbackMessage: string;
}

export interface QuestionState {
  questions: QuestionData[];
  currentIndex: number;
  answers: Record<number, string>;
  feedbacks: Record<number, QuestionFeedback>;
}

export interface Highlight {
  id: string;
  text: string;
  color: 'yellow' | 'green' | 'pink';
}
