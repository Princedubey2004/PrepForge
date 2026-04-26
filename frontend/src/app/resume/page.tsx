"use client";

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/services/api';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

export default function ResumeAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [role, setRole] = useState('Software Engineer');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { isAuthenticated } = useAuthStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== 'application/pdf') {
        toast.error('Only PDF files are supported.');
        return;
      }
      if (selected.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB.');
        return;
      }
      setFile(selected);
    }
  };

  const handleAnalyze = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to analyze your resume.');
      return;
    }
    if (!file) return;

    setAnalyzing(true);
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('targetRole', role);

    try {
      const res = await api.post('/resume/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data.analysis);
      toast.success('Analysis complete!');
    } catch (err: any) {
      toast.error('Failed to analyze resume.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pt-20 pb-12">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
            <Sparkles className="w-4 h-4" /> AI Powered
          </div>
          <h1 className="text-4xl font-bold">Smart Resume Analyzer</h1>
          <p className="text-slate-400">Upload your PDF resume to get instant ATS scoring, keyword matching, and actionable suggestions tailored to your target role.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Upload Section */}
          <div className="md:col-span-4 space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">Target Role</label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
              >
                <option value="Software Engineer">Software Engineer</option>
                <option value="Frontend Engineer">Frontend Engineer</option>
                <option value="Backend Engineer">Backend Engineer</option>
                <option value="Full Stack Engineer">Full Stack Engineer</option>
                <option value="Data Engineer">Data Engineer</option>
                <option value="ML Engineer">ML Engineer</option>
              </select>

              <div className="border-2 border-dashed border-slate-700 hover:border-blue-500 transition-colors rounded-2xl p-8 text-center cursor-pointer bg-slate-900/50 relative">
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-3 pointer-events-none">
                  {file ? (
                    <>
                      <div className="p-3 bg-blue-500/20 rounded-full text-blue-400">
                        <FileText className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-medium text-slate-200 truncate w-full px-4">{file.name}</p>
                      <p className="text-xs text-slate-500">Ready to analyze</p>
                    </>
                  ) : (
                    <>
                      <div className="p-3 bg-slate-800 rounded-full text-slate-400">
                        <UploadCloud className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-medium text-slate-300">Click or drag PDF here</p>
                      <p className="text-xs text-slate-500">Max file size: 5MB</p>
                    </>
                  )}
                </div>
              </div>

              <button 
                onClick={handleAnalyze}
                disabled={!file || analyzing}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {analyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                Analyze Resume
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="md:col-span-8">
            {result ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="glass-card rounded-2xl p-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">ATS Compatibility Score</h2>
                    <p className="text-slate-400 mt-1">Based on keywords and formatting for {role}.</p>
                  </div>
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold border-4 ${
                    result.atsScore >= 80 ? 'border-emerald-500 text-emerald-400' :
                    result.atsScore >= 60 ? 'border-yellow-500 text-yellow-400' :
                    'border-red-500 text-red-400'
                  }`}>
                    {result.atsScore}
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-400" /> AI Summary
                  </h3>
                  <p className="text-slate-300 leading-relaxed">{result.summary}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="glass-card rounded-2xl p-6">
                    <h3 className="text-lg font-bold mb-4 text-emerald-400">Matched Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.keywordAnalysis.matched.map((skill: string) => (
                        <span key={skill} className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-sm capitalize">
                          {skill}
                        </span>
                      ))}
                      {result.keywordAnalysis.matched.length === 0 && <span className="text-slate-500 text-sm">No specific skills detected.</span>}
                    </div>
                  </div>

                  <div className="glass-card rounded-2xl p-6">
                    <h3 className="text-lg font-bold mb-4 text-red-400">Missing Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.keywordAnalysis.missing.map((skill: string) => (
                        <span key={skill} className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-sm capitalize">
                          {skill}
                        </span>
                      ))}
                      {result.keywordAnalysis.missing.length === 0 && <span className="text-slate-500 text-sm">Looking good! No major gaps found.</span>}
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" /> Actionable Suggestions
                  </h3>
                  <ul className="space-y-3">
                    {result.suggestions.map((sug: string, idx: number) => (
                      <li key={idx} className="flex gap-3 text-slate-300">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                        <span>{sug}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] glass-card rounded-2xl flex flex-col items-center justify-center text-center p-8">
                <FileText className="w-16 h-16 text-slate-700 mb-4" />
                <h3 className="text-xl font-bold text-slate-400 mb-2">No Analysis Yet</h3>
                <p className="text-slate-500 max-w-sm">Upload your resume and click analyze to see your ATS score, skill gaps, and AI feedback here.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
