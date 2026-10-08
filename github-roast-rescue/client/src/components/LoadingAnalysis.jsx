import React, { useEffect, useState } from 'react';

const DYNAMIC_STEPS = [
  'initializing audit runner',
  'fetching public github profile',
  'normalizing repository metadata',
  'calculating recruiter readiness scores',
  'running gemini ai roast engine',
  'generating rescue diffs & recommendations'
];

export default function LoadingAnalysis({ username }) {
  const [completedSteps, setCompletedSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const interval = setInterval(() => {
      if (!isMounted) return;

      setCurrentStepIndex((prev) => {
        if (prev < DYNAMIC_STEPS.length - 1) {
          setCompletedSteps((done) => [...done, DYNAMIC_STEPS[prev]]);
          return prev + 1;
        }
        return prev;
      });
    }, 1100);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="analysis-loading">
      <div className="analysis-loader">
        <div className="analysis-username">
          {username || 'CANDIDATE'}
        </div>

        <div className="analysis-terminal-box">
          {/* Top Bar */}
          <div className="analysis-terminal-bar">
            <div className="analysis-terminal-dot"></div>
            <div className="analysis-terminal-dot"></div>
            <div className="analysis-terminal-dot"></div>
            <span className="analysis-terminal-title">github-roast-rescue/auditor</span>
            <span className="analysis-terminal-status">LIVE_SCAN</span>
          </div>

          <div className="analysis-terminal-body">
            {/* ============ ROLLING CUBE ANIMATION ============ */}
            <div className="loader-roller">
              <div className="loader-ground"></div>
              <div className="loader-shadow-wrap">
                <div className="loader-shadow"></div>
              </div>
              <div className="loader-halo"></div>
              <div className="loader-traveler">
                <div className="loader-cube"></div>
              </div>
            </div>

            {/* ============ REAL-TIME TERMINAL MESSAGES ============ */}
            <div className="analysis-lines font-mono text-xs">
              {completedSteps.map((step, idx) => (
                <div key={idx} className="analysis-line text-zinc-400">
                  <span className="analysis-prompt">›</span>
                  <span className="analysis-text">{step}</span>
                  <span className="analysis-dots">....</span>
                  <span className="text-emerald-400 font-bold ml-auto text-[10px]">DONE</span>
                </div>
              ))}

              {currentStepIndex < DYNAMIC_STEPS.length && (
                <div className="analysis-line text-zinc-100 font-semibold">
                  <span className="analysis-prompt">›</span>
                  <span className="analysis-text">{DYNAMIC_STEPS[currentStepIndex]}</span>
                  <span className="analysis-cursor"></span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
