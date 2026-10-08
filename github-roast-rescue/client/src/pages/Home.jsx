import React, { useRef, useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import GitHubSearch from '../components/GitHubSearch';
import LoadingAnalysis from '../components/LoadingAnalysis';
import Dashboard from './Dashboard';
import { analyzeGitHubProfile } from '../services/api';

const USERNAME_REGEX = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

// Accepts "octocat", "@octocat", "github.com/octocat" or "https://github.com/octocat/"
const extractUsername = (input) =>
  input
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^(www\.)?github\.com\//i, '')
    .replace(/^@/, '')
    .split(/[/?#]/)[0];

export default function Home() {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeUsername, setActiveUsername] = useState('');
  const [error, setError] = useState(null);

  const abortRef = useRef(null);

  // Cancel any in-flight request when the page unmounts
  useEffect(() => () => abortRef.current?.abort(), []);

  const runRequest = async (label, request, fallbackMessage) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setActiveUsername(label);
    setError(null);
    setAnalysisData(null);

    try {
      const res = await request(controller.signal);
      if (controller.signal.aborted) return;
      setAnalysisData(res.data);
    } catch (err) {
      if (err.name === 'AbortError' || controller.signal.aborted) return;
      setError(err.message || fallbackMessage);
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setLoading(false);
      }
    }
  };

  const handleSearch = (input) => {
    if (loading) return;
    const username = extractUsername(input);
    if (!USERNAME_REGEX.test(username)) {
      setError('That does not look like a valid GitHub username.');
      return;
    }
    runRequest(
      username,
      (signal) => analyzeGitHubProfile(username, false, null, signal),
      'Error fetching analysis.'
    );
  };

  const handlePresetSelect = (presetType) => {
    if (loading) return;
    runRequest(
      'demo candidate',
      (signal) => analyzeGitHubProfile(null, true, presetType, signal),
      'Error loading preset.'
    );
  };

  const handleReset = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
    setAnalysisData(null);
    setError(null);
    setActiveUsername('');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onReset={handleReset} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {error && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm text-center"
          >
            {error}
          </div>
        )}

        {loading ? (
          <LoadingAnalysis username={activeUsername} />
        ) : !analysisData ? (
          <GitHubSearch
            onSearch={handleSearch}
            onPresetSelect={handlePresetSelect}
            loading={loading}
          />
        ) : (
          <Dashboard data={analysisData} onBack={handleReset} />
        )}
      </main>
    </div>
  );
}
