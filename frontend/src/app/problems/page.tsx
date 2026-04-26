"use client";

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/services/api';
import Link from 'next/link';
import { Search, Filter, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function ProblemsList() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const { user } = useAuthStore();

  useEffect(() => {
    fetchQuestions();
  }, [difficulty]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/questions?limit=50${difficulty ? `&difficulty=${difficulty}` : ''}`);
      setQuestions(res.data.questions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions.filter(q => 
    q.title.toLowerCase().includes(search.toLowerCase()) || 
    q.tags.some((t: string) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const getDifficultyColor = (diff: string) => {
    if (diff === 'easy') return 'text-emerald-400 bg-emerald-400/10';
    if (diff === 'medium') return 'text-yellow-400 bg-yellow-400/10';
    return 'text-red-400 bg-red-400/10';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pt-20 pb-12">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Practice Problems</h1>
          <p className="text-slate-400">Master algorithms and data structures.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl leading-5 bg-slate-900/50 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Search by title or tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              className="block w-full sm:w-48 pl-3 pr-10 py-3 text-base border border-slate-700 bg-slate-900/50 text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl appearance-none"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <Filter className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Question List */}
        <div className="glass-card rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No problems found matching your criteria.
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              <div className="grid grid-cols-12 gap-4 p-4 bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <div className="col-span-1 text-center">Status</div>
                <div className="col-span-6">Title</div>
                <div className="col-span-2">Difficulty</div>
                <div className="col-span-3 text-right">Acceptance</div>
              </div>
              
              {filteredQuestions.map((q: any) => {
                const isSolved = (user as any)?.solvedProblems?.includes(q._id);
                const accRate = q.totalSubmissions > 0 
                  ? Math.round((q.totalAccepted / q.totalSubmissions) * 100) 
                  : 0;

                return (
                  <Link href={`/problems/${q.slug}`} key={q._id} className="block group">
                    <div className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-800/50 transition-colors">
                      <div className="col-span-1 flex justify-center">
                        {isSolved && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                      </div>
                      <div className="col-span-6">
                        <span className="font-medium text-slate-200 group-hover:text-blue-400 transition-colors">{q.title}</span>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          {q.tags.slice(0, 3).map((t: string) => (
                            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 capitalize">
                              {t.replace('-', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${getDifficultyColor(q.difficulty)}`}>
                          {q.difficulty}
                        </span>
                      </div>
                      <div className="col-span-3 flex items-center justify-end gap-4 text-sm text-slate-400">
                        {accRate}%
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
