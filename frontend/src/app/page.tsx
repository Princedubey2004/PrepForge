"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Code, Brain, FileSearch, Trophy, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 overflow-hidden selection:bg-blue-500/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4">
        {/* Abstract background blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none" />
        
        <div className="max-w-7xl mx-auto text-center z-10 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-sm font-medium text-blue-400 mb-8"
          >
            <Zap className="w-4 h-4" />
            <span>The ultimate platform for tech interviews</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400"
          >
            Master the Interview.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Land the Dream Job.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10"
          >
            PrepForge is the all-in-one platform combining rigorous DSA practice, AI-driven mock interviews, and smart resume analysis.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              href="/signup" 
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-semibold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:-translate-y-1"
            >
              Start Coding for Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/problems" 
              className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-semibold transition-all border border-slate-700 hover:border-slate-600"
            >
              Explore Problems
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-900/50 border-y border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to succeed</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Stop bouncing between different tools. We built a unified workflow for serious candidates.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Code className="w-8 h-8 text-blue-400" />}
              title="DSA Question Engine"
              desc="Practice hundreds of curated coding problems across all topics. Built-in code execution supporting JS, Python, and C++."
              delay={0.1}
            />
            <FeatureCard 
              icon={<Brain className="w-8 h-8 text-purple-400" />}
              title="AI Mock Interviews"
              desc="Simulate high-pressure system design and algorithmic interviews with our AI that grades your answers and provides feedback."
              delay={0.2}
            />
            <FeatureCard 
              icon={<FileSearch className="w-8 h-8 text-emerald-400" />}
              title="Smart Resume Analyzer"
              desc="Upload your PDF resume to get instant ATS scoring, keyword matching, and actionable suggestions to pass the screen."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 text-center text-slate-500 relative z-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Code className="w-6 h-6 text-slate-700" />
          <span className="font-bold text-xl text-slate-600">PrepForge</span>
        </div>
        <p>© {new Date().getFullYear()} PrepForge. Built for developers, by developers.</p>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="p-8 rounded-3xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 transition-colors group"
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner border border-slate-700">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{desc}</p>
    </motion.div>
  );
}
