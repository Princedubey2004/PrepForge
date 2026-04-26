"use client";

/**
 * PREPFORGE DASHBOARD
 * This is the central hub for the user. We try to keep it 
 * light and fast by fetching data only when needed.
 */
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';
import Navbar from '@/components/Navbar';
import { Trophy, CheckCircle2, XCircle, Clock, Target, Flame, ChevronRight, Brain } from 'lucide-react';
import Link from 'next/link';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import toast from 'react-hot-toast';

ChartJS.register(ArcElement, Tooltip, Legend);

// Interface for our dashboard data response
interface UserDashboardStats {
  stats: {
    totalSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
  };
  streak: {
    current: number;
    longest: number;
  };
  score: number;
  accuracy: number;
  recentSubmissions: any[];
  tagProgress: any[];
  recommendedProblem?: any;
}

export default function Dashboard() {
  const { user: currentUser } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<UserDashboardStats | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  // Hook into our API on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/users/dashboard');
        setDashboardData(res.data);
      } catch (err: any) {
        console.error('[Dashboard] Error fetching stats:', err);
        toast.error("Whoops! Couldn't sync your progress data.");
      } finally {
        setIsFetching(false);
      }
    };
    fetchStats();
  }, []);

  // Show a clean loader while the data is traveling
  if (isFetching) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Setup the chart settings for the progress doughnut
  const progressChartSettings = {
    labels: ['Easy', 'Medium', 'Hard'],
    datasets: [
      {
        data: [
          dashboardData?.stats?.easySolved || 0,
          dashboardData?.stats?.mediumSolved || 0,
          dashboardData?.stats?.hardSolved || 0,
        ],
        backgroundColor: ['#10b981', '#eab308', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pt-20 pb-12">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold leading-tight">Welcome back, {currentUser?.name?.split(' ')[0]}!</h1>
            <p className="text-slate-400 mt-1">Ready to solve some more problems today?</p>
          </div>
          
          {/* Quick stats badges */}
          <div className="flex items-center gap-4">
            <div className="glass px-4 py-2 rounded-xl flex items-center gap-3 border border-slate-800">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Streak</p>
                <p className="text-xl font-bold">{dashboardData?.streak?.current || 0} 🔥</p>
              </div>
            </div>
            
            <div className="glass px-4 py-2 rounded-xl flex items-center gap-3 border border-slate-800">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Trophy className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Score</p>
                <p className="text-xl font-bold">{dashboardData?.score || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Progress Visualization */}
            <div className="glass-card rounded-2xl p-6 shadow-2xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" /> Overall Progress
              </h2>
              
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-48 h-48 relative">
                  {(dashboardData?.stats?.totalSolved || 0) === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-600 italic">No solves yet</div>
                  ) : (
                    <Doughnut data={progressChartSettings} options={{ cutout: '75%', plugins: { legend: { display: false } } }} />
                  )}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold">{dashboardData?.stats?.totalSolved || 0}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Total</span>
                  </div>
                </div>
                
                <div className="flex-1 space-y-5 w-full">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-400 font-medium">Easy</span>
                      <span className="text-slate-400 font-bold">{dashboardData?.stats?.easySolved || 0}</span>
                    </div>
                    <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (dashboardData?.stats?.easySolved || 0) * 5)}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-yellow-400 font-medium">Medium</span>
                      <span className="text-slate-400 font-bold">{dashboardData?.stats?.mediumSolved || 0}</span>
                    </div>
                    <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${Math.min(100, (dashboardData?.stats?.mediumSolved || 0) * 5)}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-red-400 font-medium">Hard</span>
                      <span className="text-slate-400 font-bold">{dashboardData?.stats?.hardSolved || 0}</span>
                    </div>
                    <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(100, (dashboardData?.stats?.hardSolved || 0) * 5)}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent History */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-300">
                  <Clock className="w-5 h-5 text-purple-400" /> Recent Activity
                </h2>
              </div>
              
              <div className="space-y-3">
                {dashboardData?.recentSubmissions?.length === 0 ? (
                  <p className="text-slate-600 text-center py-6 italic">No submissions yet. Ready to start your journey?</p>
                ) : (
                  dashboardData?.recentSubmissions?.map((sub) => (
                    <Link href={`/problems/${sub.question.slug}`} key={sub._id} className="block group">
                      <div className="bg-slate-900/40 hover:bg-slate-900 border border-slate-800 rounded-xl p-4 transition-all flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-300 group-hover:text-blue-400 transition-colors">{sub.question.title}</p>
                          <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-wider">{new Date(sub.createdAt).toDateString()} • {sub.language}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {sub.status === 'accepted' ? (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/5 border border-emerald-400/20 px-3 py-1 rounded-full uppercase">
                              Accepted
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-red-400 bg-red-400/5 border border-red-400/20 px-3 py-1 rounded-full uppercase">
                              {sub.status.replace('_', ' ')}
                            </span>
                          )}
                          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-all" />
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            
            {/* Smart Recommendation Card */}
            {dashboardData?.recommendedProblem && (
              <div className="glass-card rounded-2xl p-6 border-blue-600/30 bg-gradient-to-br from-blue-900/10 to-transparent overflow-hidden relative group">
                <div className="absolute -right-4 -top-4 p-10 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all"></div>
                <div className="relative">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-400">
                    <Target className="w-5 h-5" /> Recommended
                  </h2>
                  <div className="space-y-4">
                    <p className="text-slate-200 font-bold text-lg leading-snug">{dashboardData.recommendedProblem.title}</p>
                    <div className="flex gap-2">
                      <span className="text-[9px] font-black px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase tracking-widest border border-slate-700">
                        {dashboardData.recommendedProblem.difficulty}
                      </span>
                    </div>
                    <Link 
                      href={`/problems/${dashboardData.recommendedProblem.slug}`}
                      className="w-full mt-4 block text-center bg-blue-600 hover:bg-blue-500 text-white text-xs font-black py-3 rounded-xl transition-all shadow-xl shadow-blue-900/40 uppercase tracking-widest"
                    >
                      Solve Problem
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Topic Mastery Sidebar */}
            <div className="glass-card rounded-2xl p-6 border-slate-800">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-emerald-400">
                <Brain className="w-5 h-5" /> Top Skills
              </h2>
              <div className="space-y-3">
                {dashboardData?.tagProgress?.length === 0 ? (
                   <p className="text-slate-600 text-center py-4 text-sm italic">Analyze your skills by solving problems.</p>
                ) : (
                  dashboardData?.tagProgress?.slice(0, 5).map((tag) => (
                    <div key={tag._id} className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3">
                      <span className="text-slate-400 capitalize text-sm font-medium">{tag._id.replace('-', ' ')}</span>
                      <span className="text-white text-[10px] font-black px-2 py-1 rounded bg-slate-800 border border-slate-700">{tag.solvedCount}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* AI Career Assistant Card */}
            <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-slate-950 to-blue-950/20 border-slate-800">
              <h3 className="font-bold text-md mb-2 text-slate-200">AI Career Insights</h3>
              <p className="text-slate-500 text-xs mb-5 leading-relaxed">Let our AI analyze your resume and tell you where you stand in the market.</p>
              <Link href="/resume" className="w-full block text-center bg-slate-900 hover:bg-slate-800 text-slate-300 text-sm font-bold py-2.5 rounded-xl transition-all border border-slate-800 shadow-sm">
                Open AI Analyzer
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}


