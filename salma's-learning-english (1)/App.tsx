import React, { useState } from 'react';
import { 
  AppPhase, 
  MascotMood, 
  StoryData, 
  ReformulationFeedback, 
  QuestionState, 
  AnswerStatus,
  Highlight
} from './types';
import * as GeminiService from './services/geminiService';
import { Mascot } from './components/Mascot';
import { Button } from './components/Button';
import { StoryViewer } from './components/StoryViewer';
import { BookOpen, CheckCircle, RefreshCcw, Send, PenTool, MessageCircle, ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  // --- STATE ---
  const [phase, setPhase] = useState<AppPhase>(AppPhase.SETUP);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data State
  const [story, setStory] = useState<StoryData | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [userNotes, setUserNotes] = useState<string>("");
  
  // Reformulation State
  const [reformulationText, setReformulationText] = useState('');
  const [reformulationFeedback, setReformulationFeedback] = useState<ReformulationFeedback | null>(null);
  
  // Question State
  const [questionState, setQuestionState] = useState<QuestionState>({
    questions: [],
    currentIndex: 0,
    answers: {},
    feedbacks: {}
  });

  // Mascot State
  const [mascotMood, setMascotMood] = useState<MascotMood>(MascotMood.NEUTRAL);
  const [mascotMessage, setMascotMessage] = useState<string>("Hi! I'm here to help you learn.");

  // --- ACTIONS ---

  const handleError = (err: any) => {
    console.error(err);
    setError("Connection glitch! Let's try that again.");
    setLoading(false);
    setMascotMood(MascotMood.SAD_ENCOURAGING);
    setMascotMessage("Oh no... I lost connection.");
  };

  const handleStartStory = async (theme?: string) => {
    setLoading(true);
    setPhase(AppPhase.STORY_LOADING);
    setMascotMood(MascotMood.THINKING);
    setMascotMessage("Writing a special story just for you...");
    setError(null);

    try {
      const data = await GeminiService.generateStory(theme);
      setStory(data);
      setPhase(AppPhase.STORY_READING);
      setMascotMood(MascotMood.WAITING);
      setMascotMessage("Read carefully! You can highlight text and take notes below.");
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReformulation = async () => {
    if (!story || !reformulationText.trim()) return;

    setLoading(true);
    setMascotMood(MascotMood.THINKING);
    setMascotMessage("Analyzing your writing...");
    
    try {
      const feedback = await GeminiService.evaluateReformulation(story.content, reformulationText);
      setReformulationFeedback(feedback);
      setPhase(AppPhase.REFORMULATION_FEEDBACK);
      
      if (feedback.isGood) {
        setMascotMood(MascotMood.HAPPY);
        setMascotMessage("Great job! Keep it up! 🐈‍⬛✨");
      } else {
        setMascotMood(MascotMood.SAD_ENCOURAGING);
        setMascotMessage("Good try! Check the corrections.");
      }
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuestions = async () => {
    if (!story) return;
    
    setLoading(true);
    setPhase(AppPhase.QUESTIONS_LOADING);
    setMascotMood(MascotMood.THINKING);
    setMascotMessage("Creating questions...");

    try {
      const questions = await GeminiService.generateQuestions(story.content);
      setQuestionState({
        questions,
        currentIndex: 0,
        answers: {},
        feedbacks: {}
      });
      setPhase(AppPhase.QUESTION_ANSWERING);
      setMascotMood(MascotMood.WAITING);
      setMascotMessage("Look at the story if you need help!");
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    const { questions, currentIndex, answers } = questionState;
    const currentAnswer = answers[currentIndex];
    
    if (!story || !currentAnswer?.trim()) return;

    setLoading(true);
    setMascotMood(MascotMood.THINKING);
    setMascotMessage("Checking...");

    try {
      const currentQ = questions[currentIndex];
      const feedback = await GeminiService.evaluateAnswer(story.content, currentQ.question, currentAnswer);
      
      setQuestionState(prev => ({
        ...prev,
        feedbacks: { ...prev.feedbacks, [currentIndex]: feedback }
      }));
      setPhase(AppPhase.QUESTION_FEEDBACK);

      if (feedback.status === AnswerStatus.CORRECT) {
        setMascotMood(MascotMood.HAPPY);
        setMascotMessage(feedback.feedbackMessage);
      } else {
        setMascotMood(MascotMood.SAD_ENCOURAGING);
        setMascotMessage(feedback.feedbackMessage);
      }
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    const { questions, currentIndex } = questionState;
    if (currentIndex < questions.length - 1) {
      setQuestionState(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1
      }));
      setPhase(AppPhase.QUESTION_ANSWERING);
      setMascotMood(MascotMood.WAITING);
      setMascotMessage("Next one!");
    } else {
      setPhase(AppPhase.SESSION_COMPLETE);
      setMascotMood(MascotMood.HAPPY);
      setMascotMessage("All done! 🎉");
    }
  };

  const resetSession = () => {
    setStory(null);
    setHighlights([]);
    setUserNotes("");
    setReformulationText('');
    setReformulationFeedback(null);
    setQuestionState({ questions: [], currentIndex: 0, answers: {}, feedbacks: {} });
    setPhase(AppPhase.SETUP);
    setMascotMood(MascotMood.NEUTRAL);
    setMascotMessage("Ready for a new story?");
  };

  const addHighlight = (text: string, color: Highlight['color']) => {
    setHighlights(prev => [...prev, { id: Date.now().toString(), text, color }]);
  };

  // --- RENDERERS ---

  const renderSetup = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="mb-8">
        <Mascot mood={mascotMood} message={mascotMessage} />
      </div>
      <div className="text-center space-y-8 max-w-lg w-full">
        <h1 className="text-4xl font-bold text-indigo-900 font-serif">Salma's Learning English</h1>
        <p className="text-gray-600 text-lg">
          Choose a theme to generate a story.
        </p>
        <div className="grid grid-cols-1 gap-4 w-full">
          {['Identity & Culture', 'University Life', 'Emotions & Relations'].map(theme => (
            <Button key={theme} variant="outline" onClick={() => handleStartStory(theme)} fullWidth>
              {theme}
            </Button>
          ))}
          <Button 
            variant="secondary" 
            fullWidth
            onClick={() => {
              const surpriseThemes = [
                "a story set in the Hello Kitty universe",
                "a story set in the universe of the Wicked movie (directed by Jon M. Chu)"
              ];
              const randomTheme = surpriseThemes[Math.floor(Math.random() * surpriseThemes.length)];
              handleStartStory(randomTheme);
            }}
          >
            Surprise Me! ✨
          </Button>
        </div>
      </div>
    </div>
  );

  const renderRightPanelContent = () => {
    // 1. Loading States
    if (phase === AppPhase.STORY_LOADING || phase === AppPhase.QUESTIONS_LOADING) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 animate-pulse">
          <div className="mb-4 text-4xl">⏳</div>
          <p>{phase === AppPhase.STORY_LOADING ? "Writing story..." : "Generating questions..."}</p>
        </div>
      );
    }

    // 2. Reading Phase Action
    if (phase === AppPhase.STORY_READING) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-6 p-8">
           <h3 className="text-2xl font-bold text-indigo-900">Reading Time</h3>
           <p className="text-gray-600">
             Read the story on the left. You can select text to highlight it, 
             and write notes at the bottom.
           </p>
           <p className="text-gray-600">
             When you are ready, try to explain the story in your own words.
           </p>
           <Button onClick={() => setPhase(AppPhase.REFORMULATION_INPUT)} className="w-full max-w-xs">
             I'm ready to explain it <ArrowRight className="ml-2 w-4 h-4" />
           </Button>
        </div>
      );
    }

    // 3. Reformulation Input
    if (phase === AppPhase.REFORMULATION_INPUT) {
      return (
        <div className="flex flex-col h-full">
          <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center">
            <PenTool className="w-5 h-5 mr-2" /> Explain the story
          </h3>
          <p className="text-sm text-gray-500 mb-4">Summarize it in your own words (L1 LLCER level).</p>
          <textarea
            className="flex-1 w-full p-4 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none font-serif text-lg mb-4"
            placeholder="In this story..."
            value={reformulationText}
            onChange={(e) => setReformulationText(e.target.value)}
          />
          <Button onClick={handleSubmitReformulation} disabled={!reformulationText.trim() || loading} fullWidth>
            {loading ? 'Analyzing...' : 'Submit Explanation'} <Send className="ml-2 w-4 h-4" />
          </Button>
        </div>
      );
    }

    // 4. Reformulation Feedback
    if (phase === AppPhase.REFORMULATION_FEEDBACK) {
      return (
        <div className="flex flex-col h-full overflow-y-auto pr-2 custom-scrollbar">
          <h3 className="text-xl font-bold text-indigo-900 mb-4">Feedback</h3>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
             <div className="mb-4">
               <h4 className="text-sm font-bold text-gray-500 uppercase">Your Text</h4>
               <p className="text-gray-800 italic border-l-2 border-gray-200 pl-3 mt-1">{reformulationText}</p>
             </div>
             <div className="mb-4">
               <h4 className="text-sm font-bold text-green-600 uppercase">Better Version</h4>
               <p className="text-gray-800 border-l-2 border-green-200 pl-3 mt-1">{reformulationFeedback?.improvedVersion}</p>
             </div>
             <div>
               <h4 className="text-sm font-bold text-red-500 uppercase">Corrections</h4>
               <p className="text-gray-800 whitespace-pre-wrap text-sm mt-1">{reformulationFeedback?.correction}</p>
             </div>
          </div>

          <div className="bg-indigo-50 p-4 rounded-xl text-indigo-900 text-sm mb-6">
             <strong>Teacher's Note:</strong> {reformulationFeedback?.explanation}
          </div>

          <Button onClick={handleStartQuestions} fullWidth>
            Start Questions <MessageCircle className="ml-2 w-4 h-4" />
          </Button>
        </div>
      );
    }

    // 5. Questions
    if (phase === AppPhase.QUESTION_ANSWERING || phase === AppPhase.QUESTION_FEEDBACK) {
      const currentQ = questionState.questions[questionState.currentIndex];
      const feedback = questionState.feedbacks[questionState.currentIndex];
      const isFeedback = phase === AppPhase.QUESTION_FEEDBACK;

      return (
        <div className="flex flex-col h-full overflow-y-auto">
          <div className="flex justify-between items-center mb-4 text-xs font-bold text-gray-400 uppercase tracking-wide">
             <span>Question {questionState.currentIndex + 1}/{questionState.questions.length}</span>
             <span>Quiz</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm mb-4">
            <h3 className="text-lg font-bold text-indigo-900 leading-snug">{currentQ.question}</h3>
          </div>

          {!isFeedback ? (
            <div className="flex flex-col flex-1">
              <textarea
                className="flex-1 w-full p-4 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 resize-none font-serif text-lg mb-4"
                placeholder="Type your answer..."
                value={questionState.answers[questionState.currentIndex] || ''}
                onChange={(e) => setQuestionState(prev => ({
                  ...prev,
                  answers: { ...prev.answers, [prev.currentIndex]: e.target.value }
                }))}
              />
              <Button 
                onClick={handleSubmitAnswer} 
                disabled={!questionState.answers[questionState.currentIndex]?.trim() || loading}
                fullWidth
              >
                {loading ? 'Checking...' : 'Check Answer'}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col flex-1 space-y-4">
               <div className={`p-4 rounded-xl border flex-1 overflow-y-auto ${
                  feedback.status === AnswerStatus.CORRECT ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'
               }`}>
                  <div className="flex items-center mb-2 font-bold">
                    {feedback.status === AnswerStatus.CORRECT ? <CheckCircle className="w-5 h-5 text-green-600 mr-2"/> : null}
                    <span className={feedback.status === AnswerStatus.CORRECT ? 'text-green-800' : 'text-orange-800'}>
                      {feedback.status === AnswerStatus.CORRECT ? 'Correct!' : 'Needs Improvement'}
                    </span>
                  </div>
                  <div className="space-y-3 text-sm text-gray-700">
                    <p><strong>Your Answer:</strong> {questionState.answers[questionState.currentIndex]}</p>
                    <p><strong>Correction:</strong> {feedback.correction}</p>
                    <p><strong>Natural Phrasing:</strong> {feedback.naturalVersion}</p>
                  </div>
               </div>
               <Button onClick={handleNextQuestion} fullWidth>
                 {questionState.currentIndex === questionState.questions.length - 1 ? 'Finish' : 'Next Question'}
               </Button>
            </div>
          )}
        </div>
      );
    }

    // 6. Complete
    if (phase === AppPhase.SESSION_COMPLETE) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
          <h2 className="text-3xl font-bold text-indigo-900">Session Complete!</h2>
          <p className="text-gray-600">Great work today.</p>
          <Button onClick={resetSession} className="flex justify-center items-center">
            <RefreshCcw className="mr-2 w-4 h-4" /> Start New Story
          </Button>
        </div>
      );
    }

    return null;
  };

  // --- MAIN LAYOUT ---

  if (phase === AppPhase.SETUP) {
    return renderSetup();
  }

  return (
    <div className="h-screen bg-pink-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-3 px-6 flex justify-between items-center shrink-0 z-20">
         <div className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            <span className="font-bold text-gray-800">Salma's Learning</span>
         </div>
         <Button variant="outline" onClick={resetSession} className="px-3 py-1 text-xs h-auto">
            Exit
         </Button>
      </header>

      {/* Split Screen Layout */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* Left Panel: Story Viewer (Persistent) */}
        {story && (
          <div className="flex-1 lg:flex-[1.2] lg:border-r border-gray-200 bg-pink-50/50 p-4 overflow-hidden h-1/2 lg:h-full">
            <StoryViewer 
              story={story} 
              highlights={highlights}
              onAddHighlight={addHighlight}
              userNotes={userNotes}
              onUpdateNotes={setUserNotes}
            />
          </div>
        )}

        {/* Right Panel: Interaction */}
        <div className="flex-1 lg:flex-1 bg-white flex flex-col h-1/2 lg:h-full relative shadow-xl z-10">
            {/* Mascot Header in Right Panel */}
            <div className="bg-indigo-50 border-b border-indigo-100 p-4 flex items-center justify-between shrink-0">
               <div className="flex items-center">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest mr-2">TUTOR</span>
                  <p className="text-sm text-indigo-900 font-medium">{mascotMessage}</p>
               </div>
               <div className="relative w-12 h-12">
                   {/* Compact mascot positioned in header */}
                   <div className="absolute top-0 right-0 -mt-2">
                     <Mascot mood={mascotMood} compact />
                   </div>
               </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {renderRightPanelContent()}
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;