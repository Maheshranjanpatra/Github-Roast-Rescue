import React from 'react';

/* ---------- Inline SVG icons (stroke style, inherit currentColor) ---------- */
const Icon = ({ children, className = 'w-5 h-5' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const ArrowLeftIcon = (props) => (
  <Icon {...props}>
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />
  </Icon>
);

const FlameIcon = (props) => (
  <Icon {...props}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </Icon>
);

const WrenchIcon = (props) => (
  <Icon {...props}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </Icon>
);

const AlertIcon = (props) => (
  <Icon {...props}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </Icon>
);

const CheckCircleIcon = (props) => (
  <Icon {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="M22 4 12 14.01l-3-3" />
  </Icon>
);

const FileTextIcon = (props) => (
  <Icon {...props}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <path d="M14 2v6h6" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
    <path d="M10 9H8" />
  </Icon>
);

/* ---------- Styling helpers ---------- */
const IMPACT_STYLES = {
  high: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
};

const PRIORITY_STYLES = {
  high: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
  medium: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  low: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
};

const styleFor = (map, value) => map[String(value || '').toLowerCase()] || map.medium;

const scoreColor = (score) => {
  if (score >= 75) return { text: 'text-emerald-400', bar: 'bg-emerald-500' };
  if (score >= 50) return { text: 'text-amber-400', bar: 'bg-amber-500' };
  return { text: 'text-rose-400', bar: 'bg-rose-500' };
};

const clampScore = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(Math.max(Math.round(n), 0), 100) : 0;
};

const ScoreCard = ({ label, value }) => {
  const score = clampScore(value);
  const color = scoreColor(score);
  return (
    <div className="glass-panel p-4">
      <p className="text-xs text-zinc-500 font-semibold uppercase text-center">{label}</p>
      <p className={`text-2xl font-extrabold mt-1 text-center ${color.text}`}>{score}/100</p>
      <div className="mt-3 h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
        <div className={`h-full rounded-full ${color.bar}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
};

export default function Dashboard({ data, onBack }) {
  const profile = data?.profile || {};
  const scores = data?.scores || {};
  const roast = data?.roast || {};
  const evidence = Array.isArray(data?.evidence) ? data.evidence : [];
  const rescuePlan = Array.isArray(data?.rescuePlan) ? data.rescuePlan : [];
  const overall = clampScore(scores.overall);
  const overallColor = scoreColor(overall);

  return (
    <div className="space-y-12 pb-24">
      {/* Sticky Quick Nav */}
      <div className="sticky top-20 z-40 glass-panel px-4 py-3 flex items-center justify-between text-xs font-medium">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-100 transition"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>New Audit</span>
        </button>

        <div className="flex items-center gap-4 sm:gap-6">
          <a href="#overview" className="text-zinc-400 hover:text-emerald-400 transition">Overview</a>
          <a href="#scores" className="text-zinc-400 hover:text-emerald-400 transition">Scores</a>
          <a href="#roast" className="text-zinc-400 hover:text-rose-400 transition">The Roast</a>
          <a href="#rescue" className="text-zinc-400 hover:text-emerald-400 transition">Rescue Plan</a>
        </div>
      </div>

      {/* Section 1: Candidate Overview */}
      <section id="overview" className="glass-panel p-6 sm:p-8 scroll-mt-40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <img
              src={profile.avatarUrl}
              alt={profile.username ? `${profile.username} avatar` : 'avatar'}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.visibility = 'hidden';
              }}
              className="w-16 h-16 shrink-0 rounded-full border border-zinc-700 object-cover bg-zinc-800"
            />
            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-zinc-100 break-words">{profile.name}</h2>
              <p className="text-sm text-zinc-400">@{profile.username}</p>
              <p className="text-xs text-zinc-500 mt-1 break-words">{profile.bio}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 bg-zinc-950/80 px-6 py-4 rounded-xl border border-zinc-800/80">
            <div className="text-center">
              <span className={`block text-3xl font-black ${overallColor.text}`}>{overall}</span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                Recruiter Readiness
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Scores Breakdown */}
      <section id="scores" className="grid grid-cols-2 sm:grid-cols-4 gap-4 scroll-mt-40">
                <ScoreCard label="Technical Signal" value={scores.technical} />
        <ScoreCard label="Documentation" value={scores.documentation} />
        <ScoreCard label="Consistency" value={scores.activity} />
        <ScoreCard label="Portfolio Fit" value={scores.portfolio} />
      </section>

      <p className="text-[11px] text-zinc-500 text-center -mt-2">
        Public-data heuristic. Estimates recruiter-facing presentation quality, not programming ability.
      </p>

      {/* Section 3: The Brutal Roast */}
      <section id="roast" className="glass-panel p-6 sm:p-8 border-rose-500/30 bg-rose-950/10 scroll-mt-40">
        <div className="flex items-center gap-2 text-rose-500 font-bold text-sm mb-3">
          <FlameIcon />
          <span>RECRUITER ROAST</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-zinc-100 mb-3">{roast.headline}</h3>
        <p className="text-zinc-300 text-sm sm:text-base leading-relaxed mb-4">{roast.punchline}</p>

        {roast.verdict && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-xs font-semibold text-zinc-200 mb-6">
            <AlertIcon className="w-4 h-4 text-amber-400" />
            <span>Verdict: {roast.verdict}</span>
          </div>
        )}

        {/* Evidence Grid */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Audit Evidence:</p>

          {evidence.length === 0 && (
            <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-400 flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
              <span>No major issues found in the audited repositories.</span>
            </div>
          )}

          {evidence.map((item, idx) => (
            <div
              key={`${item.repo}-${idx}`}
              className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
            >
              <span className="font-mono text-emerald-400 break-all">{item.repo}</span>
              <span className="text-zinc-400 sm:flex-1 sm:px-4">{item.issue}</span>
              <span
                className={`self-start sm:self-auto px-2 py-0.5 rounded border font-semibold ${styleFor(
                  IMPACT_STYLES,
                  item.impact
                )}`}
              >
                {item.impact}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: Rescue Plan & Diff Target */}
      <section id="rescue" className="glass-panel p-6 sm:p-8 border-emerald-500/30 scroll-mt-40">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-6">
          <WrenchIcon />
          <span>RESCUE & IMPROVEMENT PLAN</span>
        </div>

        {rescuePlan.length === 0 && (
          <div className="p-4 rounded-lg bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-400 flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
            <span>Nothing urgent to fix. Keep your projects documented and active.</span>
          </div>
        )}

        <div className="space-y-6">
          {rescuePlan.map((task, idx) => (
            <div
              key={task.id || idx}
              className="p-5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded border ${styleFor(
                    PRIORITY_STYLES,
                    task.priority
                  )}`}
                >
                  Priority: {task.priority}
                </span>
                <span className="text-xs font-mono text-zinc-500 break-all">Target: {task.targetRepo}</span>
              </div>
              <div>
                <h4 className="text-base font-bold text-zinc-100">{task.title}</h4>
                <p className="text-xs text-zinc-400 mt-1">{task.action}</p>
              </div>

              {/* Diff Preview Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono pt-2">
                <div className="p-3 rounded bg-rose-950/20 border border-rose-900/40 text-rose-300 overflow-x-auto">
                  <p className="flex items-center gap-1.5 text-[10px] text-rose-500 font-bold mb-1 uppercase">
                    <FileTextIcon className="w-3.5 h-3.5" />
                    <span>Before Fix</span>
                  </p>
                  <pre className="whitespace-pre-wrap break-words">{task.before}</pre>
                </div>
                <div className="p-3 rounded bg-emerald-950/20 border border-emerald-900/40 text-emerald-300 overflow-x-auto">
                  <p className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold mb-1 uppercase">
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                    <span>AI Rescue Fix</span>
                  </p>
                  <pre className="whitespace-pre-wrap break-words">{task.after}</pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
