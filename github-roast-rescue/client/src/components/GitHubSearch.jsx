import React, { useState } from 'react';

export default function GitHubSearch({ onSearch, onPresetSelect, loading }) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onSearch(username.trim());
    }
  };

  return (
    <div className="max-w-3xl mx-auto text-center py-12 px-4">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6">
        {/* Sparkles SVG */}
        <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
          <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
        </svg>
        <span>Recruiter-Grade Profile Audit & Automated Rescue</span>
      </div>

      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-b from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
        Turn Your GitHub Profile Into Recruiter Bait
      </h1>

      <p className="text-zinc-400 text-base sm:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
        Get a brutally honest recruiter diagnosis, evidence-backed roasts, and one-click AI code improvements.
      </p>

      {/* Main Search Bar */}
      <form onSubmit={handleSubmit} className="relative max-w-xl mx-auto mb-10">
        <div className="relative flex items-center">
          {/* Search SVG */}
          <svg className="absolute left-4 w-5 h-5 fill-none stroke-zinc-500 stroke-2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter GitHub Username (e.g., octocat)..."
            disabled={loading}
            className="w-full pl-12 pr-32 py-4 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 transition shadow-inner"
          />
          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="absolute right-2.5 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {loading ? 'Auditing...' : 'Audit Profile'}
          </button>
        </div>
      </form>

      {/* Demo Presets Bar */}
      <div className="pt-6 border-t border-zinc-800/60">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center justify-center gap-1.5">
          {/* Lightning SVG */}
          <svg className="w-3.5 h-3.5 fill-amber-500" viewBox="0 0 24 24">
            <path d="M13 2L3 14h7v8l10-12h-7z" />
          </svg>
          <span>Or Test Instantly With Demo Presets</span>
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => onPresetSelect('beginner')}
            disabled={loading}
            className="px-4 py-2 rounded-lg glass-panel hover:bg-zinc-800/80 border-amber-500/30 text-zinc-300 hover:text-zinc-100 text-xs font-medium transition flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Beginner Candidate</span>
          </button>

          <button
            onClick={() => onPresetSelect('average')}
            disabled={loading}
            className="px-4 py-2 rounded-lg glass-panel hover:bg-zinc-800/80 border-emerald-500/30 text-zinc-300 hover:text-zinc-100 text-xs font-medium transition flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Mid-Level Developer</span>
          </button>

          <button
            onClick={() => onPresetSelect('strong')}
            disabled={loading}
            className="px-4 py-2 rounded-lg glass-panel hover:bg-zinc-800/80 border-cyan-500/30 text-zinc-300 hover:text-zinc-100 text-xs font-medium transition flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>Top 1% Open Source</span>
          </button>
        </div>
      </div>
    </div>
  );
}
