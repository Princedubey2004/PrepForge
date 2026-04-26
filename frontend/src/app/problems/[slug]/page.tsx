"use client";

import { useEffect, useState, use } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/services/api';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import { Play, Send, Loader2, CheckCircle2, XCircle, ChevronLeft, NotebookPen, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProblemWorkspace({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<'javascript' | 'python' | 'cpp'>('javascript');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'notes'>('description');
  const [noteContent, setNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchQuestionAndNote = async () => {
      try {
        const res = await api.get(`/questions/${resolvedParams.slug}`);
        setQuestion(res.data.question);
        setCode(res.data.question.starterCode['javascript']);
        
        if (isAuthenticated) {
          const noteRes = await api.get(`/notes/${res.data.question._id}`);
          if (noteRes.data.note) {
            setNoteContent(noteRes.data.note.content);
          }
        }
      } catch (err: any) {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestionAndNote();
  }, [resolvedParams.slug, isAuthenticated]);

  const handleLanguageChange = (lang: 'javascript' | 'python' | 'cpp') => {
    setLanguage(lang);
    if (question && question.starterCode[lang]) {
      setCode(question.starterCode[lang]);
    }
  };

  const handleSaveNote = async () => {
    if (!question) return;
    setSavingNote(true);
    try {
      await api.put(`/notes/${question._id}`, { content: noteContent });
      toast.success('Note saved!');
    } catch (err) {
      toast.error('Failed to save note');
    } finally {
      setSavingNote(false);
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to submit code');
      return;
    }
    
    setSubmitting(true);
    setResult(null);
    try {
      const res = await api.post('/submissions', {
        questionId: question._id,
        code,
        language
      });
      setResult(res.data);
      if (res.data.status === 'accepted') {
        toast.success('Accepted! All test cases passed.');
      } else {
        toast.error(`Failed: ${res.data.status.replace('_', ' ')}`);
      }
    } catch (err: any) {
      toast.error('Submission failed. Check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!question) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Question not found.</div>;

  return (
    <div className="h-screen bg-slate-950 text-slate-50 flex flex-col overflow-hidden pt-16">
      <Navbar />
      
      {/* Workspace Header */}
      <div className="h-12 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/problems" className="text-slate-400 hover:text-white transition-colors flex items-center text-sm">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Link>
          <div className="h-4 w-px bg-slate-700"></div>
          <span className="font-semibold">{question.title}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={language} 
            onChange={(e) => handleLanguageChange(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="python">Python 3</option>
            <option value="cpp">C++</option>
          </select>
          
          <button 
            onClick={handleSubmit} 
            disabled={submitting}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-1.5 rounded-md transition-colors disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Submit
          </button>
        </div>
      </div>

      {/* Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Description & Notes */}
        <div className="w-1/2 border-r border-slate-800 flex flex-col bg-slate-900/20 overflow-hidden">
          {/* Tabs Header */}
          <div className="flex border-b border-slate-800 bg-slate-900/40 px-2">
            <button 
              onClick={() => setActiveTab('description')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'description' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" /> Description
            </button>
            <button 
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'notes' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <NotebookPen className="w-4 h-4" /> My Notes
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {activeTab === 'description' ? (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-2">{question.title}</h1>
                <div className="flex gap-2 mb-6">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                    question.difficulty === 'easy' ? 'text-emerald-400 bg-emerald-400/10' : 
                    question.difficulty === 'medium' ? 'text-yellow-400 bg-yellow-400/10' : 
                    'text-red-400 bg-red-400/10'
                  }`}>
                    {question.difficulty}
                  </span>
                </div>
                
                <div className="prose prose-invert max-w-none prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-700 prose-a:text-blue-400">
                  <ReactMarkdown>{question.description}</ReactMarkdown>
                </div>
                
                <div className="mt-8 space-y-6">
                  {question.examples.map((ex: any, idx: number) => (
                    <div key={idx}>
                      <p className="font-bold mb-2">Example {idx + 1}:</p>
                      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 font-mono text-sm space-y-2">
                        <p><span className="text-slate-400">Input:</span> {ex.input}</p>
                        <p><span className="text-slate-400">Output:</span> {ex.output}</p>
                        {ex.explanation && <p><span className="text-slate-400">Explanation:</span> {ex.explanation}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Personal Notes</h2>
                  <button 
                    onClick={handleSaveNote}
                    disabled={savingNote}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded transition-colors border border-slate-700 flex items-center gap-2"
                  >
                    {savingNote ? <Loader2 className="w-3 h-3 animate-spin" /> : <NotebookPen className="w-3 h-3" />}
                    Save Note
                  </button>
                </div>
                <textarea 
                  className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 resize-none font-sans leading-relaxed"
                  placeholder="Jot down your approach, complexity analysis, or reminders for this problem..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                />
                <p className="mt-4 text-xs text-slate-500 text-center italic">Notes are private and saved per problem.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Editor & Console */}
        <div className="w-1/2 flex flex-col h-full">
          {/* Editor */}
          <div className="flex-1 relative">
            <Editor
              height="100%"
              language={language === 'javascript' ? 'javascript' : language === 'python' ? 'python' : 'cpp'}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                lineHeight: 1.6,
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on"
              }}
            />
          </div>

          {/* Result Console */}
          {result && (
            <div className="h-64 border-t border-slate-800 bg-slate-900 overflow-y-auto custom-scrollbar p-4 flex flex-col">
              <div className="flex items-center gap-2 mb-4 font-bold text-lg">
                <AnimatePresence mode="wait">
                  {result.status === 'accepted' ? (
                    <motion.span 
                      key="accepted"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-emerald-400 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-6 h-6" /> Accepted
                    </motion.span>
                  ) : (
                    <motion.span 
                      key="failed"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="text-red-400 flex items-center gap-2"
                    >
                      <XCircle className="w-6 h-6" /> {result.status.replace('_', ' ')}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              
              <p className="text-slate-400 text-sm mb-4">
                Passed {result.testsPassed} / {result.totalTests} test cases.
              </p>

              {result.results?.length > 0 && result.status !== 'accepted' && (
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 font-mono text-sm flex-1 overflow-y-auto">
                  {result.results.find((r: any) => !r.passed) && (() => {
                    const failed = result.results.find((r: any) => !r.passed);
                    return (
                      <div className="space-y-3">
                        {failed.errorMessage ? (
                          <div>
                            <p className="text-red-400 mb-1">Error:</p>
                            <pre className="text-red-300 whitespace-pre-wrap">{failed.errorMessage}</pre>
                          </div>
                        ) : (
                          <>
                            <div><p className="text-slate-400">Input:</p><p className="text-slate-200">{failed.input}</p></div>
                            <div><p className="text-slate-400">Expected Output:</p><p className="text-emerald-400">{failed.expectedOutput}</p></div>
                            <div><p className="text-slate-400">Actual Output:</p><p className="text-red-400">{failed.actualOutput || 'None'}</p></div>
                          </>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

