"use client";

import Link from 'next/link';
import { useAuthStore } from '../store/authStore';
import { useEffect, useState } from 'react';
import { Code2, LogOut, User as UserIcon, LayoutDashboard, BrainCircuit, FileText } from 'lucide-react';

export default function Navbar() {
  const { isAuthenticated, user, logout, initialize } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    initialize();
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [initialize]);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-slate-950/80 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-blue-500 p-1.5 rounded-lg group-hover:bg-blue-400 transition-colors">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">PrepForge</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/problems" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Problems
            </Link>
            <Link href="/interviews" className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4" /> Mock Interviews
            </Link>
            <Link href="/resume" className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> AI Resume
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                
                <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>
                
                <Link href="/profile" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                </Link>
                
                <button 
                  onClick={logout}
                  className="text-slate-400 hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  Sign in
                </Link>
                <Link href="/signup" className="text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                  Get Started
                </Link>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </nav>
  );
}
