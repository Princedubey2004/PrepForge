"use client";

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { User, Mail, Shield, Calendar, Award, Code2, MapPin, Link as LinkIcon, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user: authUser } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/dashboard`); // Reusing dashboard for basic stats
        setProfile(res.data);
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pt-20 pb-12">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header Card */}
        <div className="glass-card rounded-3xl overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>
          <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-12 mb-6">
              <div className="w-24 h-24 rounded-2xl bg-slate-900 border-4 border-slate-950 flex items-center justify-center text-3xl font-bold bg-gradient-to-tr from-blue-500 to-purple-500 shadow-xl">
                {authUser?.name?.charAt(0).toUpperCase()}
              </div>
              <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-slate-700 flex items-center gap-2">
                <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
            </div>
            
            <div className="space-y-1">
              <h1 className="text-3xl font-bold">{authUser?.name}</h1>
              <p className="text-slate-400 flex items-center gap-2">
                <Mail className="w-4 h-4" /> {authUser?.email}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 mt-6">
              <div className="bg-slate-900/50 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-400 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-blue-400" /> {authUser?.role === 'admin' ? 'Administrator' : 'Premium Member'}
              </div>
              <div className="bg-slate-900/50 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-400 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-purple-400" /> Joined April 2024
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Stats Sidebar */}
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Achievements</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Award className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Fast Learner</p>
                    <p className="text-xs text-slate-500">Solved 5 problems in 24h</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 opacity-40 grayscale">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Code2 className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Code Master</p>
                    <p className="text-xs text-slate-500">100+ Accepted submissions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity/Stats Main */}
          <div className="md:col-span-2 space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card rounded-2xl p-6">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Score</p>
                <p className="text-3xl font-bold">{profile?.score || 0}</p>
              </div>
              <div className="glass-card rounded-2xl p-6">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Accuracy</p>
                <p className="text-3xl font-bold text-emerald-400">{profile?.accuracy || 0}%</p>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">Problem Solving Stats</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Easy</span>
                    <span className="text-slate-200">{profile?.stats?.easySolved || 0} Solved</span>
                  </div>
                  <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: '10%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Medium</span>
                    <span className="text-slate-200">{profile?.stats?.mediumSolved || 0} Solved</span>
                  </div>
                  <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500" style={{ width: '5%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Hard</span>
                    <span className="text-slate-200">{profile?.stats?.hardSolved || 0} Solved</span>
                  </div>
                  <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: '2%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
