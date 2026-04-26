"use client";

/**
 * AI MOCK INTERVIEW ENGINE
 * This page handles the interview simulation. 
 * We use a timer and a step-by-step question flow.
 */
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/services/api';
import { Brain, Play, Loader2, CheckCircle2, Timer, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

export default function MockInterviews() {
  const [loading, setLoading] = useState(false);
  const [interviewSession, setInterviewSession] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userResponse, setUserResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes for the session
  const { isAuthenticated } = useAuthStore();

  // Tick-tock: Handle the countdown timer
  useEffect(() => {
    let timerInterval: any;
    if (interviewSession && interviewSession.status !== 'completed' && timeLeft > 0) {
      timerInterval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [interviewSession, timeLeft]);

  // Helper to format 1800s -> 30:00
  const formatCountdown = (seconds: number) => {
    const mm = Math.floor(seconds / 60);
    const ss = seconds % 60;
    return `${mm}:${ss.toString().padStart(2, '0')}`;
  };

  const handleStartSession = async (category: string) => {
    if (!isAuthenticated) {
      toast.error('You need to log in to start an interview.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/interviews/start', { type: category, questionCount: 3 });
      setInterviewSession(res.data.interview);
      setCurrentQuestionIndex(0);
      setUserResponse('');
      setTimeLeft(1800);
      toast.success('Session started! Good luck.');
    } catch (err: any) {
      console.error('[Interview] Start failed:', err);
      toast.error("Couldn't start the session. Is the server down?");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!userResponse.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await api.patch(`/interviews/${interviewSession._id}/respond`, {
        questionIndex: currentQuestionIndex,
        response: userResponse,
      });
      
      const updatedQuestions = [...interviewSession.questions];
      updatedQuestions[currentQuestionIndex] = res.data.question;
      setInterviewSession({ ...interviewSession, questions: updatedQuestions });
      
    } catch (err: any) {
      toast.error('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < interviewSession.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserResponse(interviewSession.questions[currentQuestionIndex + 1].userResponse || '');
    }
  };

  const finishInterview = async () => {
    setLoading(true);
    try {
      const res = await api.patch(`/interviews/${interviewSession._id}/complete`);
      setInterviewSession(res.data.interview);
      toast.success('All done! Checking your score...');
    } catch (err: any) {
      toast.error('Error completing session.');
    } finally {
      setLoading(false);
    }
  };

  // If no session started, show the category selector
  if (!interviewSession) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 pt-20 pb-12">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-20">
          <div className="w-20 h-20 bg-purple-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-purple-500/20 shadow-2xl">
            <Brain className="w-10 h-10 text-purple-400" />
          </div>
          <h1 className="text-5xl font-black mb-6 tracking-tight">AI Mock Interviews</h1>
          <p className="text-slate-400 max-w-xl mx-auto mb-16 text-lg leading-relaxed">
            Practice real interview scenarios with our AI. Get instant grading, feedback, and tips to improve your performance.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="glass-card p-10 rounded-3xl hover:bg-slate-900/50 transition-all text-left border border-slate-800">
              <h3 className="text-2xl font-bold mb-3">System Design</h3>
              <p className="text-slate-500 mb-8 min-h-[48px]">Master high-level architecture, scalability, and database choices.</p>
              <button 
                onClick={() => handleStartSession('system_design')}
                disabled={loading}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 border border-slate-700"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                Start Technical Round
              </button>
            </div>
            
            <div className="glass-card p-10 rounded-3xl bg-gradient-to-br from-slate-900 to-purple-900/10 border-purple-500/20 text-left relative overflow-hidden group shadow-2xl">
              <div className="absolute top-4 right-6">
                <span className="bg-purple-500/10 text-purple-400 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-purple-500/20">Popular</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Mixed Rounds</h3>
              <p className="text-slate-500 mb-8 min-h-[48px]">A balanced mix of behavioral, algorithmic, and design questions.</p>
              <button 
                onClick={() => handleStartSession('mixed')}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-purple-600/20"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                Start Challenge
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const activeQ = interviewSession.questions[currentQuestionIndex];
  const qHasFeedback = !!activeQ.aiFeedback;
  const isFinished = interviewSession.status === 'completed';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pt-20 flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header Stats */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-200">{interviewSession.type.replace('_', ' ')} SESSION</h1>
            <p className="text-slate-500 text-xs font-bold mt-1 uppercase tracking-widest">Question {currentQuestionIndex + 1} of {interviewSession.questions.length}</p>
          </div>
          <div className="flex items-center gap-6">
            {!isFinished && (
              <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-5 py-2.5 rounded-2xl shadow-inner">
                <Timer className={`w-5 h-5 ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-blue-500'}`} />
                <span className={`font-mono font-black text-xl ${timeLeft < 300 ? 'text-red-500' : 'text-slate-100'}`}>
                  {formatCountdown(timeLeft)}
                </span>
              </div>
            )}
            {isFinished && (
              <div className="text-right">
                <p className="text-slate-500 text-[10px] uppercase tracking-widest font-black mb-1">Final Score</p>
                <p className="text-4xl font-black text-emerald-400">{interviewSession.overallScore} / 10</p>
              </div>
            )}
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex gap-3 mb-12">
          {interviewSession.questions.map((_: any, i: number) => (
            <div 
              key={i} 
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                i === currentQuestionIndex ? 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]' : 
                interviewSession.questions[i].aiFeedback ? 'bg-emerald-600' : 'bg-slate-900'
              }`}
            />
          ))}
        </div>

        {/* The Question Text */}
        <div className="glass-card rounded-3xl p-8 md:p-10 mb-8 border-l-8 border-l-blue-600 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Brain className="w-32 h-32" />
          </div>
          <h2 className="text-2xl font-bold leading-relaxed text-slate-100">{activeQ.questionText}</h2>
        </div>

        {/* Interaction Area */}
        {isFinished || qHasFeedback ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Your Transcript</p>
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-slate-400 whitespace-pre-wrap leading-relaxed shadow-inner">
                {activeQ.userResponse}
              </div>
            </div>
            
            <div className="bg-slate-900/40 border border-emerald-500/20 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <CheckCircle2 className="w-24 h-24" />
              </div>
              <div className="flex justify-between items-center mb-6">
                <p className="text-xs font-black text-emerald-400 flex items-center gap-2 uppercase tracking-widest">
                  <Brain className="w-4 h-4" /> AI Evaluation
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 font-bold">Grade:</span>
                  <span className={`font-black text-xl ${activeQ.score >= 7 ? 'text-emerald-400' : activeQ.score >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {activeQ.score} / 10
                  </span>
                </div>
              </div>
              <p className="text-slate-300 leading-relaxed text-lg">{activeQ.aiFeedback}</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row gap-8">
            <div className="flex-1 flex flex-col">
              <textarea
                className="w-full flex-1 min-h-[300px] bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:border-blue-600/50 transition-all resize-none mb-6 shadow-inner text-lg placeholder:text-slate-700"
                placeholder="Type your structured answer here..."
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
              ></textarea>
              
              <div className="flex justify-end">
                <button 
                  onClick={handleAnswerSubmit}
                  disabled={isSubmitting || !userResponse.trim()}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-black px-10 py-4 rounded-2xl transition-all flex items-center gap-3 disabled:opacity-50 shadow-xl shadow-blue-600/30 uppercase tracking-widest text-sm"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  Finalize Answer
                </button>
              </div>
            </div>

            <div className="lg:w-80 space-y-6">
              <div className="glass-card p-6 rounded-3xl bg-yellow-500/5 border border-yellow-500/10">
                <h3 className="text-xs font-black text-yellow-500 flex items-center gap-2 mb-4 uppercase tracking-widest">
                  <Lightbulb className="w-4 h-4" /> Pro Interview Tip
                </h3>
                <ul className="text-xs text-slate-500 space-y-4 leading-relaxed font-medium">
                  <li>• Use the <strong>STAR</strong> method: Situation, Task, Action, Result.</li>
                  <li>• Be specific about tech stacks and trade-offs.</li>
                  <li>• If you're stuck, explain your thought process out loud.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Nav */}
        <div className="mt-auto pt-10 border-t border-slate-900 flex justify-between items-center pb-10">
          <div className="text-slate-600 text-xs font-bold uppercase tracking-widest">
            {!isFinished && "Don't rush. Quality over speed."}
          </div>
          <div className="flex gap-4">
            {qHasFeedback && !isFinished && currentQuestionIndex < interviewSession.questions.length - 1 && (
              <button 
                onClick={goToNextQuestion}
                className="bg-slate-900 hover:bg-slate-800 text-slate-100 font-black px-8 py-4 rounded-2xl transition-all border border-slate-800 uppercase tracking-widest text-sm"
              >
                Next Question
              </button>
            )}
            {qHasFeedback && !isFinished && currentQuestionIndex === interviewSession.questions.length - 1 && (
              <button 
                onClick={finishInterview}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-500 text-white font-black px-8 py-4 rounded-2xl transition-all flex items-center gap-3 shadow-xl shadow-purple-600/30 uppercase tracking-widest text-sm"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                Complete Session
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
